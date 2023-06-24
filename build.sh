#!/bin/bash
# podman build --format docker --tag th-helm-playground-template .

docker build --tag th-helm-playground-template:1.0.1 .
docker tag th-helm-playground-template:1.0.1 th-helm-playground-template:latest

