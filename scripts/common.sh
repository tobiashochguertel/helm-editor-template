wait_container_to_be_running() {
match=$1
until podman ps | grep -qm 1 $match;
  do
    echo "waiting podman '$match' container to be running..."
    sleep 0.1
  done
}