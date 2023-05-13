#!/bin/sh
#
# Usage: run from project directory: ./scripts/open_swagger_editor.sh
# Description: run podman with openapi.yml & open browser with swagger editor
# Prerequirements: podman
#

. $(dirname "$0")/common.sh

# run swagger-editor container with the yaml, if not running yet
# opening specific file doesn't work with editor
name='swagger-editor'
image="swaggerapi/swagger-editor"
# version="next-v5-unprivileged"
command -v podman >/dev/null 2>&1 || { echo >&2 "'podman' is not install installed. Aborting."; exit 1; }
[[ $(podman ps -f "name=$name" --format '{{.Names}}') == $name ]] && podman stop $name
podman run --platform linux/amd64 --rm -d -p 8044:8080 --name "$name"  -e SWAGGER_FILE=/config/openapi.yaml -v $(PWD)/../config:/config "$image"

# podman run --platform linux/amd64 --rm -d -p 8044:8080 --name "$name"  -e REACT_APP_DEFINITION_FILE=config/openapi.yaml -v $(PWD)/../config:/usr/share/nginx/html/config "$image:$version"
# podman run --platform linux/amd64 --rm -d -p 8044:8080 --name "$name" -e REACT_APP_DEFINITION_URL="" -e REACT_APP_DEFINITION_FILE=/public/static/config/openapi.yaml -v $(PWD)/../config:/usr/share/nginx/html/config "$image:$version"

# wait_container_to_be_running "$name" & sleep 2

# open swagger-ui in browser
open http://localhost:8044