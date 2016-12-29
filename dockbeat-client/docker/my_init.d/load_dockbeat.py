#!/usr/bin/env python

import os
import json
import requests

if os.getenv('BEATS_DOCKBEAT_MONITORING_HOST'):

    base_path = os.getenv('GOPATH')
    template_target = '/_template/dockbeat'
    payload = json.load(
        open(
            os.path.abspath(base_path +
                            '/src/github.com/ingensi/dockbeat/etc/dockbeat.template.json'
                            )
        )
    )

    r = requests.put("http://{}:9200{}".format(
        os.getenv('BEATS_DOCKBEAT_MONITORING_HOST'),
        template_target),
        data=json.dumps(payload)
    )

    print (r.text)
