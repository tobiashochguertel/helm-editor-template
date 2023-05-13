#!/bin/sh
#
# Usage: run from project directory: ./scripts/open_swagger_ui.sh
# Description: run podman with openapi.yml & open browser with swagger ui
# Prerequirements: podman
#

. $(dirname "$0")/common.sh

# run swagger-ui container with the yaml, if not running yet
name='swagger-ui'
command -v podman >/dev/null 2>&1 || { echo >&2 "'podman' is not install installed. Aborting."; exit 1; }
[[ $(podman ps -f "name=$name" --format '{{.Names}}') == $name ]] && podman stop $name ||
podman run --platform linux/amd64 --rm -d -p 8045:8080 --name "$name" -e SWAGGER_JSON=/config/openapi.yml -v $(PWD)/config:/config swaggerapi/swagger-ui

# wait_container_to_be_running "$name" & sleep 2

# open swagger-ui in browser
open http://localhost:8045