opg-docker-monitoring
=====================

Arbitrary set of preconfigured docker images to quickly build your monitoring stack

![opg-docker-monitoring overview](https://cloud.githubusercontent.com/assets/13198078/8695568/a18a5fc6-2add-11e5-8377-7fe6b613f870.jpg "Docker monitoring overview")

Links
-----
http://grafana.your_domain/

Grafana js based dashboards expect to reach graphite directly through
http://graphite.your_domain/

for debugging you can use: $(boot2docker ip).xip.io:8080


# Containers
------------


Monitoring-proxy
================
container that acts as a single monitoring endpoint for your application
while shipping data it allows you to
- tag logs
- prefix collectd metrics (ships them to graphite)
- prefix and aggregate statsd metrics (ships them to graphite)

ports:
- 2514 tcp/udp (syslog input)
- 6379 tcp (redis input, scans logstash key)
- 8125 udp (statsd input)
- 25826 (collectd listener)

example options:
- MONITORING_REDIS_HOST: redis:6379/0
- MONITORING_GRAPHITE: graphite
- MONITORING_NAMESPACE: myapp.prod

TODO: Replace logstash with a lightweight implementation (small golang process)


Logstash
========
listens for logs (pulls logs from redis queue) and ships them to elasticsearch:9200
further log parsing will be added here
at the moment we are also generating statsd metrics on incoming logs


Graphite-Statsd
===============
a pre-configured graphite


Grafana
=======
a pre-configured grafana with autogenerating dashboards
https://grafana.(domainname)/dashboard/script/overview.js?env=(metrics_prefix)

in progress


Collectd
========
Collectd configured to feed metrics to a carbon collector on port 2003. For more information on collectd see https://collectd.org/.

This implementation of collectd comes with a few basic checks, as well as a custom btrfs check from https://github.com/soellman/docker-collectd

Checks:
-

app
===
demo app

Sensu-Server
============

Environment variables with defaults:

- SENSU_REDIS_HOST
- SENSU_REDIS_PORT
- SENSU_RABBITMQ_HOST
- SENSU_RABBITMQ_PORT
- SENSU_RABBITMQ_VHOST
- SENSU_RABBITMQ_USER
- SENSU_RABBITMQ_PASSWORD
- SENSU_API_PORT
- SENSU_API_HOST

#### Handlers

Environment variables for the PagerDuty handler:

- SENSU_HANDLER_PAGERDUTY_APIKEY

Environment variables for the Slack handler:

- SENSU_HANDLER_SLACK_WEBHOOKURL (Slack webhook configured to send events via)
- SENSU_HANDLER_SLACK_CHANNEL (Slack channel to send events to)
- SENSU_HANDLER_SLACK_BOTNAME (Name given to event sender in Slack)

Environment variables for the AWS SNS handler:

- SENSU_HANDLER_SNS_TOPICARN (The AWS SNS Topic ARN to send events to)
- SENSU_HANDLER_SNS_REGION (The AWS region for the Topic)

#### Handler Notes

- If environment variables for the any of the handlers above do not exist then the handler is not configured at all.
- When they exist, all variables for a handler should be defined and when they do the handler is also configured as a default handler within Sensu.
- It is then up to how you configure the underlying handler as to what sort of events it handles e.g. critical events only.
