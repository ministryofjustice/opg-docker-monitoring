Arbitrary set of preconfigured docker images to quickly build your monitoring stack


links
-----
http://grafana.your_domain/

grafana js based dashboards expect to reach graphite directly through
http://graphite.your_domain/

for debugging you can use: $(boot2docker ip).xip.io:8080


containers
----------


monitoring-proxy
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


logstash
========
listens for logs (pulls logs from redis queue) and ships them to elasticsearch:9200
further log parsing will be added here
at the moment we are also generating statsd metrics on incoming logs


graphite-statsd
===============
a pre-configured graphite


grafana
=======
a pre-configured grafana with autogenerating dashboards
https://grafana.(domainname)/dashboard/script/overview.js?env=(metrics_prefix)

in progress


collectd
========
collectd configured to feed metrics to monitoring on port 25826 (collectd listener)
just for testing


app
===
demo app
