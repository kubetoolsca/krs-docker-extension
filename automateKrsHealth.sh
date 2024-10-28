#!/bin/bash

# Store the container ID in a variable and execute the 'krs health' command
containerID=$(docker ps -q --filter ancestor=kubetoolsca/krs-docker-extension:0.0.3 | head -n 1)
if [ -n "$containerID" ]; then
  while true; do
    docker exec -it $containerID krs health
    echo "ttyd is running, visit http://localhost:57681/ to interact with krs health."
  done
else
  echo "No running container found for kubetoolsca/krs-docker-extension:0.0.3"
fi