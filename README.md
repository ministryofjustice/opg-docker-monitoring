opg-docker-monitoring
=====================

Arbitrary set of preconfigured docker images to quickly build your monitoring stack.

![opg-docker-monitoring overview](https://cloud.githubusercontent.com/assets/13198078/8695568/a18a5fc6-2add-11e5-8377-7fe6b613f870.jpg "Docker monitoring overview")

# Links

http://grafana.your_domain/

Grafana js based dashboards expect to reach graphite directly through:

http://graphite.your_domain/

for debugging you can use: $(boot2docker ip).xip.io:8080.

# Containers

## Monitoring-proxy

Container that acts as a single monitoring endpoint for your application
while shipping data it allows you to:

- tag logs
- prefix collectd metrics (ships them to graphite)
- prefix and aggregate statsd metrics (ships them to graphite)

Ports:

- 2514 tcp/udp (syslog input)
- 6379 tcp (redis input, scans logstash key)
- 8125 udp (statsd input)
- 25826 (collectd listener)

Example options:

- MONITORING_REDIS_HOST: redis:6379/0
- MONITORING_GRAPHITE: graphite
- MONITORING_NAMESPACE: myapp.prod

TODO: Replace logstash with a lightweight implementation (small golang process).

## Logstash

Listens for logs (pulls logs from redis queue) and ships them to elasticsearch:9200.

Further log parsing will be added here at the moment we are also generating statsd metrics on incoming logs.

## Graphite-Statsd

A pre-configured graphite.

## Grafana

A pre-configured grafana with autogenerating dashboards:

https://grafana.(domainname)/dashboard/script/overview.js?env=(metrics_prefix)


## Collectd

Collectd configured to feed metrics to a carbon collector on port 2003. For more information on collectd see https://collectd.org/.

This implementation of collectd comes with a few basic checks, as well as a custom btrfs check from https://github.com/soellman/docker-collectd


## App

Demo web app container (to demonstrate use of monitoring proxy).

## Sensu-Client

#### Base checks

Base checks are designed to go into the `base.sls` pillar so applied to everything.

Environment variables (mandatory for each check):

- SENSU_CLIENT_CHECKS_BASE_checkname_NAME
- SENSU_CLIENT_CHECKS_BASE_checkname_COMMAND

where `checkname` is the name of the check.

Environment variables (optional for each check):

- SENSU_CLIENT_CHECKS_BASE_checkname_SUBSCRIBERS (default "all")
- SENSU_CLIENT_CHECKS_BASE_checkname_INTERVAL (default 60)

where `checkname` is the name of the check.

#### Subduing a check

In addition to the ability to fully disable the handling of certain checks, Sensu supports ‘subduing’ checks so that they are not handled during certain hours of the day. This is done by configuring the "begin" and "end" times for the check’s "subdue" attribute.

- SENSU_CLIENT_CHECKS_BASE_checkname_SUBDUEBEGIN
- SENSU_CLIENT_CHECKS_BASE_checkname_SUBDUEEND

e.g.

- SENSU_CLIENT_CHECKS_BASE_LOADSHORTTERM_SUBDUEBEGIN=5AM UTC
- SENSU_CLIENT_CHECKS_BASE_LOADSHORTTERM_SUBDUEEND=7PM UTC

NOTE: BOTH must be supplied (BEGIN and END) or neither.

#### Default subdue

If you want to set a global subdue window for all checks, you can use the following variables:

- SENSU_CLIENT_CHECKS_BASE_SUBDUEBEGIN
- SENSU_CLIENT_CHECKS_BASE_SUBDUEEND    

NOTE: BOTH must be supplied (BEGIN and END) or neither.

If none of the subdue variables above are set, the default will be that NO SUBDUE window is defined.

An individual check based subdue window will override a global subdue window which will override the default.

For  more information on Sensu checks please refer to https://sensuapp.org/docs/latest/checks

#### Role checks

Role based checks are designed to go into a `role` pillar so used only on a set of servers in a particular role.

The variables for role checks are the same as those described above with the `BASE` in the variable name replaced with `ROLE` e.g.

- SENSU_CLIENT_CHECKS_ROLE_BTRFSPCTUSED_NAME
- SENSU_CLIENT_CHECKS_ROLE_BTRFSPCTUSED_COMMAND

## Sensu-Server

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

# Running locally (e.g. boot2docker)

This monitoring stack is designed to be run alongside the opg-core app stack (https://github.com/ministryofjustice/opg-core-docker) under a local `boot2docker` or native docker installation.

To bring up the stack:

```
$ cd /path/to/opg-docker-monitoring-repo
$ docker-compose up -d
```

## Useful URLs once the stack is up

Using your docker/boot2docker host IP:

```
➜  ~  boot2docker ip
192.168.59.103
➜  ~
```

- http://192.168.59.103:8001                  (Kibana UI)
- http://192.168.59.103:8002/login            (Grafana UI)
- http://192.168.59.103:8003                  (Graphite UI)
- http://192.168.59.103:9201/_plugin/marvel   (Marvel dashboard for the monitoring stack Elasticsearch)

If running the opg-core-docker app stack at the same time:

- http://192.168.59.103:9200/_plugin/marvel   (Marvel dashboard for the app stack Elasticsearch)
