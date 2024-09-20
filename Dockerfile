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

# Final stage with KRS-Extension installation
FROM python:3.12.5-alpine
LABEL org.opencontainers.image.title="Krs - Chat with the Kubernetes Cluster" \
    org.opencontainers.image.description="A GenAI-powered Kubetools Recommender System for Kubernetes clusters." \
    org.opencontainers.image.vendor="Kubetools" \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.extension.screenshots="" \
    com.docker.desktop.extension.icon="https://github.com/user-attachments/assets/a24f03df-ef85-44c4-a489-ba5c9b0e9352" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.categories="" \
    com.docker.extension.changelog=""

# Install required dependencies including curl
RUN apk add --update --no-cache curl git openssh-client ncurses bash ttyd tini sudo bash-completion docker-cli

# Clone the KRS repository
# Use the --break-system-packages option to bypass the externally managed environment errors
RUN git clone https://github.com/kubetoolsca/krs.git /krs \
    && cd /krs \
    && pip install . --break-system-packages \
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

# Expose port for ttyd (for interactive terminal)
EXPOSE 57681

# Start ttyd and the service
CMD ["ttyd", "-W","-p", "7681", "sh", "/sbin/automateKrsHealth.sh"]
