#!/bin/bash

echo "Sidecar running"
echo "pid is $$"

YP_ADDRESS=$YP_ADDRESS
echo $YP_ADDRESS

#check if YP is up and running
STR='"health": "false"'
STR=$(curl -sb -H "Accept: application/json" "http://$YP_ADDRESS/health")
while [[ $STR != *'"health": "true"'* ]]
do
	echo "Waiting for YP ..."
	STR=$(curl -sb -H "Accept: application/json" "http://$YP_ADDRESS/health")
	sleep 1
done

#Register Application
curl -X PUT "http://$YP_ADDRESS/v1/apps/$APP_NAME" \
    -H "Content-Type: application/json" \
    --data @<(generate_post_data)

# function to generate post data
generate_post_data() {
cat <<EOF
{
    "id":"$APP_NAME",
    "url":"$APP_URL",
    "description":"$APP_DESCRIPTION",
    "icon":"$APP_ICON",
    "lifecycleStatus":"online",
    "appType":"$APP_TYPE"
 }
EOF
}

# SIGTERM-handler
# Unregister this application on ctr+c
term_handler() {
  echo "[Sidecar] Shutting Down"

  #Set Status Offline
  curl -L -X PUT "http://$YP_ADDRESS/v1/apps/$APP_NAME" \
       -H "Content-Type: application/json" \
       -d '{"lifecycleStatus":"offline"}'

  exit 143; # 128 + 15 -- SIGTERM
}

# setup handlers
# on callback, kill the last background process, which is `tail -f /dev/null` and execute the specified handler
trap 'kill ${!}; term_handler' SIGTERM SIGINT

# wait forever
while true
do
  tail -f /dev/null & wait ${!}
done