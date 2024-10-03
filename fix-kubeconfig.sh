#!/bin/sh

MINIKUBE_IP=$1

# Copy kubeconfig to a new file inside the container (so the local file is not modified)
cp /root/.kube/config /root/.kube/config_copy

# Find all unique local paths before .minikube and store them in a variable
LOCAL_PATHS=$(grep -oP '/[^ ]+(?=/.minikube)' /root/.kube/config_copy | sort -u)

if [ -n "$LOCAL_PATHS" ]; then
  echo "Detected local paths:"
  echo "$LOCAL_PATHS"

  # Loop through each detected path and replace it with /root in the copied kubeconfig
  echo "$LOCAL_PATHS" | while read -r LOCAL_PATH; do
    if [ -n "$LOCAL_PATH" ]; then
      echo "Replacing path: $LOCAL_PATH with /root"

      # Replace the paths in the copied kubeconfig file
      sed "s|$LOCAL_PATH|/root|g" /root/.kube/config_copy > /tmp/kubeconfig.tmp && cp /tmp/kubeconfig.tmp /root/.kube/config_copy
    fi
  done

  echo "Kubeconfig paths have been updated in config_copy."
else
  echo "No local paths found to replace."
fi

# Replace the server IP address in the copied kubeconfig with the Minikube IP
# if (current line contains 'server') then
#    # Look at the next line
#    if (next line contains 'name: minikube') then
#        # If both conditions are true, replace the 'server' line with the new Minikube IP
#        replace 'server' line with "https://$MINIKUBE_IP:6443"
#   end if
# end if

# sed -i: it directly modifies the file
sed -i '/provider: minikube.sigs.k8s.io/{N;N;N; s|server: https://.*|server: https://'$MINIKUBE_IP':8443|g}' /root/.kube/config_copy

echo "Minikube IP ($MINIKUBE_IP) has been updated in config_copy."
