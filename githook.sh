#!/bin/bash
API_URL=https://jenkins.dsp-archiweb21-ah-es-ag-hk.fr
API_USER=jenkins
API_KEY=1135e3905491ee0b8f13f7974824ea15d5
PROJET=job_backend
CRUMB=$(curl  -u "$API_USER:$API_KEY"  "$API_URL/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,\":\",//crumb")
curl  -X POST "$API_URL/job/$PROJET/build" --http1.1 -u "$API_USER:$API_KEY" -H "$CRUMB"


