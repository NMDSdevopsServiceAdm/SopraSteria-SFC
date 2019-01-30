#!/bin/bash
export CONTRAST__ORG_ID=383500ab-6ac3-4f2f-a654-446c17128276
export CONTRAST__BASEURL=https://eval.contrastsecurity.com/Contrast/api/ng/$CONTRAST__ORG_ID
export CONTRAST__API_KEY=xfFhonYE0172F7AozbdA98a5TIaGEIMd
export CONTRAST__AUTHORIZATION=bmFzaXIubXVoYW1tYWRAZXh0LnNvcHJhc3RlcmlhLmNvbTpGTFZYT0Q5RVFJSUZYSUpY

#!/bin/bash
pwd

echo curl --max-time 10 $CONTRAST__BASEURL/agents/default/node -H API-Key:$CONTRAST__API_KEY -H Authorization:$CONTRAST__AUTHORIZATION -o node-contrast.tgz
curl --max-time 10 $CONTRAST__BASEURL/agents/default/node -H API-Key:$CONTRAST__API_KEY -H Authorization:$CONTRAST__AUTHORIZATION -o node-contrast.tgz
ls -l /tmp/app/node-contrast.tgz

echo curl --max-time 10 $CONTRAST__BASEURL/agents/external/default/NODE -H Accept:text/yaml -H API-Key:$CONTRAST__API_KEY -H Authorization:$CONTRAST__AUTHORIZATION -o contrast_security.yaml
curl --max-time 10 $CONTRAST__BASEURL/agents/external/default/NODE -H Accept:text/yaml -H API-Key:$CONTRAST__API_KEY -H Authorization:$CONTRAST__AUTHORIZATION -o contrast_security.yaml
ls -l /tmp/app/contrast_security.yaml
