# Stage 0: Install the backend server
FROM golang:1.21-alpine AS builder
ENV CGO_ENABLED=0
WORKDIR /vm
COPY vm/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY vm/. .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o bin/service

# Stage 1: Install the UI
FROM --platform=$BUILDPLATFORM node:21.6-alpine3.18 AS client-builder
WORKDIR /client
# cache packages in layer
COPY client/package.json /client/package.json
COPY client/package-lock.json /client/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY client /client
RUN npm run build

# Stage 3: KRS installation (final image)
FROM python:3.12-slim-bullseye
LABEL org.opencontainers.image.title="Krs - Chat with the Kubernetes Cluster" \
    org.opencontainers.image.description="A GenAI-powered Kubetools Recommender System for Kubernetes clusters." \
    org.opencontainers.image.vendor="Kubetools" \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.extension.screenshots="[{\"alt\":\"krs-docker-extension UI Design\", \"url\":\"https://github.com/kubetoolsca/krs-docker-extension/blob/main/images/image.png?raw=true\"},\
    {\"alt\":\"krs init\", \"url\":\"https://github.com/kubetoolsca/krs-docker-extension/blob/main/images/image1.png?raw=true\"},\
    {\"alt\":\"krs scan\", \"url\":\"https://github.com/kubetoolsca/krs-docker-extension/blob/main/images/image2.png?raw=true\"}]" \
    com.docker.desktop.extension.icon="https://github-production-user-asset-6210df.s3.amazonaws.com/313480/365918020-a24f03df-ef85-44c4-a489-ba5c9b0e9352.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20240920%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240920T130951Z&X-Amz-Expires=300&X-Amz-Signature=8fcb36c65d532650ef6520d1036506ed4348fe4aee773475a13bb290a4bb9564&X-Amz-SignedHeaders=host" \
    com.docker.extension.detailed-description="Docker Desktop extension for KRS(Kubetools Recommender System) - a Gen-AI powered tool designed to recommend and manage tools for Kubernetes clusters. The extension provides a user-friendly interface for Kubernetes cluster operations such as initialization, scanning, recommendation, and healthcheck for tools, with support for different Kubernetes environments." \
    com.docker.extension.publisher-url="https://github.com/kubetoolsca/krs-docker-extension" \
    com.docker.extension.additional-urls="{\"title\":\"Documentation\",\"url\":\"https://github.com/kubetoolsca/krs-docker-extension/blob/main/README.md\"}" \
    com.docker.extension.categories="kubernetes, utility-tools" \
    com.docker.extension.changelog="<a href=\"https://github.com/kubetoolsca/krs-docker-extension/blob/main/CHANGELOG.md\">change log</a>"

# Install required dependencies including curl
# --no-install-recommends reduce  the size by avoiding installing packages that aren’t technically dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip \
    build-essential \
    curl \
    git \
    cmake \
    libjson-c-dev \
    libwebsockets-dev \
    openssh-client \
    bash \
    tini \
    sudo \
    vim \
    bash-completion \
    docker.io \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install ttyd from github
RUN git clone https://github.com/tsl0922/ttyd.git /ttyd && \
    cd /ttyd && mkdir build && cd build && \
    cmake .. && \
    make && \
    make install

# Clone the KRS repository
# Use the --break-system-packages option to bypass the externally managed environment errors
RUN git clone https://github.com/kubetoolsca/krs.git /krs \
    && cd /krs \
    && pip install . \
    && chmod +x /usr/local/bin/krs \
    && chmod +x . \
    && chown -R 1000:1000 /krs

# Verify the command is working
RUN krs --help

# Install Kubectl in multiple environments.
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl \
    && chmod +x ./kubectl && mv ./kubectl /usr/local/bin/kubectl \
    && mkdir -p /linux \
    && cp /usr/local/bin/kubectl /linux/

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl" \
    && mkdir -p /darwin \
    && chmod +x ./kubectl && mv ./kubectl /darwin/

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/windows/amd64/kubectl.exe" \
    && mkdir -p /windows \
    && chmod +x ./kubectl.exe && mv ./kubectl.exe /windows/

# Copy the compiled backend binary from the Go builder stage
COPY --from=builder /vm/bin/service /
COPY kubetools.svg metadata.json docker-compose.yml /

# Copy frontend files from client-builder stage
COPY --from=client-builder /client/dist /ui

# Copy the script to automate the krs health command to the container
COPY automateKrsHealth.sh /sbin/
RUN chmod +x /sbin/automateKrsHealth.sh

COPY fix-kubeconfig.sh /root/
RUN chmod +x /root/fix-kubeconfig.sh

# Expose port for ttyd (for interactive terminal)
EXPOSE 57681

# Start ttyd and the service
CMD ["ttyd", "-W", "-p", "7681", "sh", "/sbin/automateKrsHealth.sh"]
