.PHONY: build push pull

currenttag = $(shell semvertag latest)
newtag = $(shell semvertag bump patch)
registry = registry.service.opg.digital

containers = base nginx php-fpm monitoring sensu sensu-api sensu-client sensu-server uchiwa

build:
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
	docker push ${registry}/opguk/grafana:${currenttag}
	docker push ${registry}/opguk/grafana:latest
	docker push ${registry}/opguk/graphite-statsd:${currenttag}
	docker push ${registry}/opguk/graphite-statsd:latest
	docker push ${registry}/opguk/logstash:${currenttag}
	docker push ${registry}/opguk/logstash:latest
	docker push ${registry}/opguk/monitoring-proxy:${currenttag}
	docker push ${registry}/opguk/monitoring-proxy:latest
	docker push ${registry}/opguk/sensu:${currenttag}
	docker push ${registry}/opguk/sensu:latest
	docker push ${registry}/opguk/sensu-api:${currenttag}
	docker push ${registry}/opguk/sensu-api:latest
	docker push ${registry}/opguk/sensu-client:${currenttag}
	docker push ${registry}/opguk/sensu-client:latest
	docker push ${registry}/opguk/sensu-server:${currenttag}
	docker push ${registry}/opguk/sensu-server:latest
	docker push ${registry}/opguk/uchiwa:${currenttag}
	docker push ${registry}/opguk/uchiwa:latest

pull:
	docker pull ${registry}/opguk/grafana
	docker pull ${registry}/opguk/graphite-statsd
	docker pull ${registry}/opguk/logstash
	docker pull ${registry}/opguk/monitoring-proxy
	docker pull ${registry}/opguk/sensu
	docker pull ${registry}/opguk/sensu-api
	docker pull ${registry}/opguk/sensu-client
	docker pull ${registry}/opguk/sensu-server
	docker pull ${registry}/opguk/uchiwa
