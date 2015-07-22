.PHONY: build push pull

currenttag = $(shell semvertag latest)
newtag = $(shell semvertag bump patch)

containers = base nginx php-fpm monitoring sensu sensu-api sensu-client sensu-server uchiwa

build:
	semvertag tag ${newtag}
	$(MAKE) -C grafana newtag=${newtag}
	$(MAKE) -C graphite-statsd newtag=${newtag}
	$(MAKE) -C logstash newtag=${newtag}
	$(MAKE) -C monitoring-proxy newtag=${newtag}
	$(MAKE) -C sensu newtag=${newtag}
	$(MAKE) -C sensu-api newtag=${newtag}
	$(MAKE) -C sensu-client newtag=${newtag}
	$(MAKE) -C sensu-server newtag=${newtag}
	$(MAKE) -C uchiwa newtag=${newtag}

push:
	docker push registry.service.dsd.io/opguk/grafana:${currenttag}
	docker push registry.service.dsd.io/opguk/grafana:latest
	docker push registry.service.dsd.io/opguk/graphite-statsd:${currenttag}
	docker push registry.service.dsd.io/opguk/graphite-statsd:latest
	docker push registry.service.dsd.io/opguk/logstash:${currenttag}
	docker push registry.service.dsd.io/opguk/logstash:latest
	docker push registry.service.dsd.io/opguk/monitoring-proxy:${currenttag}
	docker push registry.service.dsd.io/opguk/monitoring-proxy:latest
	docker push registry.service.dsd.io/opguk/sensu:${currenttag}
	docker push registry.service.dsd.io/opguk/sensu:latest
	docker push registry.service.dsd.io/opguk/sensu-api:${currenttag}
	docker push registry.service.dsd.io/opguk/sensu-api:latest
	docker push registry.service.dsd.io/opguk/sensu-client:${currenttag}
	docker push registry.service.dsd.io/opguk/sensu-client:latest
	docker push registry.service.dsd.io/opguk/sensu-server:${currenttag}
	docker push registry.service.dsd.io/opguk/sensu-server:latest
	docker push registry.service.dsd.io/opguk/uchiwa:${currenttag}
	docker push registry.service.dsd.io/opguk/uchiwa:latest

pull:
	docker pull registry.service.dsd.io/opguk/grafana
	docker pull registry.service.dsd.io/opguk/graphite-statsd
	docker pull registry.service.dsd.io/opguk/logstash
	docker pull registry.service.dsd.io/opguk/monitoring-proxy
	docker pull registry.service.dsd.io/opguk/sensu
	docker pull registry.service.dsd.io/opguk/sensu-api
	docker pull registry.service.dsd.io/opguk/sensu-client
	docker pull registry.service.dsd.io/opguk/sensu-server
	docker pull registry.service.dsd.io/opguk/uchiwa
