#!/bin/bash

if [ "x${BEATS_DOCKBEAT_MONITORING_HOST}" -ne "x" ] then ;
    curl -XPUT "http://${BEATS_DOCKBEAT_MONITORING_HOST:9200/_template/dockbeat" -d@$GOPATH/src/github.com/ingensi/dockbeat/etc/dockbeat.template.json
fi
