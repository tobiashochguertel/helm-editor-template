#!/bin/bash
# podman build --format docker --tag th-helm-playground-template .

# docker build --tag docker.io/tobiashochguertel/th-helm-playground-template:1.0.1 .
# docker tag docker.io/tobiashochguertel/th-helm-playground-template:1.0.1 docker.io/tobiashochguertel/th-helm-playground-template:latest

# docker push docker.io/tobiashochguertel/th-helm-playground-template:1.0.1
# docker push docker.io/tobiashochguertel/th-helm-playground-template:latest

docker buildx build --push \
  --platform linux/arm64/v8,linux/amd64 \
  --tag docker.io/tobiashochguertel/th-helm-playground-template:1.0.1 \
  --tag docker.io/tobiashochguertel/th-helm-playground-template:latest \
  .