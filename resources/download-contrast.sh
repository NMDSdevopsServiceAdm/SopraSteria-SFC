#!/bin/bash
curl --max-time 10 $CONTRAST__BASEURL/agents/default/node -H API-Key:$CONTRAST__API_KEY -H Authorization:$CONTRAST__AUTHORIZATION -o node-contrast.tgz

curl --max-time 10 $CONTRAST__BASEURL/agents/external/default/NODE -H Accept:text/yaml -H API-Key:$CONTRAST__API_KEY -H Authorization:$CONTRAST__AUTHORIZATION -o contrast_security.yaml
