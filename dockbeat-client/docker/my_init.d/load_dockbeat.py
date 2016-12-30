#!/usr/bin/env python

import os
import json
import requests

if os.getenv('BEATS_DOCKBEAT_MONITORING_HOST'):

    try:
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
    except requests.ConnectionError as e:
        print("Failed to connect to the ES server {}"
              .format(os.getenv('BEATS_DOCKBEAT_MONITORING_HOST'))
              )

        print(e.message)
    finally:
        exit(0)
