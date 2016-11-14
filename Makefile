.PHONY: build push pull

currenttag := $(shell semvertag latest)
newtag := $(shell semvertag bump patch)

registryUrl ?= registry.service.opg.digital
oldRegistryUrl ?= registry.service.dsd.io
dockerVersion := $(shell docker --version | cut -f3 -d' '  | grep '^1\.[0-9]\.')

containers = grafana graphite-statsd logstash monitoring-proxy sensu sensu-api sensu-client sensu-server uchiwa

build: $(containers)

$(containers):
	$(MAKE) -C $@ newtag=${newtag} dockerVersion=$(dockerVersion)

push:
	for i in $(containers); do \
		docker push ${registryUrl}/opguk/$$i:${newtag}; \
		docker push ${oldRegistryUrl}/opguk/$$i:${newtag}; \
	done
ifeq ($(tagrepo),yes)
	semvertag tag $(newtag)
else
	@echo -e Not tagging repo
endif

pull:
	for i in $(containers); do \
		@docker pull ${registryUrl}/opguk/$$i:${currenttag}; \

clean:
	for i in $(CLEAN_CONTAINERS); do \
		@docker rmi $(registryUrl)/opguk/$$i:$(newtag) || true ; \
		@docker rmi $(registryUrl)/opguk/$$i:latest || true ; \
	done

showinfo:
	@echo Docker version: $(dockerVersion)
	@echo Registry: $(registryUrl)
	@echo Newtag: $(newtag)
	@echo Current Tag: $(currenttag)
	@echo Core Container List: $(CORE_CONTAINERS)
	@echo Container List: $(CHILD_CONTAINERS)
	@echo Clean Container List: $(CLEAN_CONTAINERS)
ifeq ($(tagrepo),yes)
	@echo Tagging repo: $(tagrepo)
endif


all: showinfo build push clean