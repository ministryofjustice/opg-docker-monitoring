.PHONY: build push pull

currenttag = $(shell semvertag latest)
newtag = $(shell semvertag bump patch)
registryUrl = registry.service.opg.digital

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
	docker push ${registryUrl}/opguk/grafana:${currenttag}
	docker push ${registryUrl}/opguk/grafana:latest
	docker push ${registryUrl}/opguk/graphite-statsd:${currenttag}
	docker push ${registryUrl}/opguk/graphite-statsd:latest
	docker push ${registryUrl}/opguk/logstash:${currenttag}
	docker push ${registryUrl}/opguk/logstash:latest
	docker push ${registryUrl}/opguk/monitoring-proxy:${currenttag}
	docker push ${registryUrl}/opguk/monitoring-proxy:latest
	docker push ${registryUrl}/opguk/sensu:${currenttag}
	docker push ${registryUrl}/opguk/sensu:latest
	docker push ${registryUrl}/opguk/sensu-api:${currenttag}
	docker push ${registryUrl}/opguk/sensu-api:latest
	docker push ${registryUrl}/opguk/sensu-client:${currenttag}
	docker push ${registryUrl}/opguk/sensu-client:latest
	docker push ${registryUrl}/opguk/sensu-server:${currenttag}
	docker push ${registryUrl}/opguk/sensu-server:latest
	docker push ${registryUrl}/opguk/uchiwa:${currenttag}
	docker push ${registryUrl}/opguk/uchiwa:latest

pull:
	docker pull ${registryUrl}/opguk/grafana
	docker pull ${registryUrl}/opguk/graphite-statsd
	docker pull ${registryUrl}/opguk/logstash
	docker pull ${registryUrl}/opguk/monitoring-proxy
	docker pull ${registryUrl}/opguk/sensu
	docker pull ${registryUrl}/opguk/sensu-api
	docker pull ${registryUrl}/opguk/sensu-client
	docker pull ${registryUrl}/opguk/sensu-server
	docker pull ${registryUrl}/opguk/uchiwa
