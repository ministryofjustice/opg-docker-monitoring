containers = grafana graphite-statsd logstash monitoring-proxy sensu sensu-api sensu-client sensu-server uchiwa

currenttag := $(shell semvertag latest)
newtag := $(shell semvertag bump patch)

registryUrl ?= registry.service.opg.digital
oldRegistryUrl ?= registry.service.dsd.io
dockerVersion := $(shell docker --version | cut -f3 -d' '  | grep '^1\.[0-9]\.')

.PHONY: build push pull $(containers) clean showinfo

build: $(containers)

$(containers):
	$(MAKE) -C $@ newtag=${newtag} dockerVersion=$(dockerVersion)

push:
	for i in $(containers); do \
		docker push ${registryUrl}/opguk/$$i; \
		docker push ${registryUrl}/opguk/$$i:${newtag}; \
		docker push ${oldRegistryUrl}/opguk/$$i; \
		docker push ${oldRegistryUrl}/opguk/$$i:${newtag}; \
	done
ifeq ($(tagrepo),yes)
	semvertag tag $(newtag)
else
	@echo -e Not tagging repo
endif

pull:
	for i in $(containers); do \
		docker pull ${registryUrl}/opguk/$$i:${currenttag}; \
	done

clean:
	for i in $(containers); do \
		docker rmi $(registryUrl)/opguk/$$i:$(newtag) || true ; \
		docker rmi $(oldRegistryUrl)/opguk/$$i:$(newtag) || true ; \
		docker rmi $(oldRegistryUrl)/opguk/$$i || true ; \
		docker rmi $(registryUrl)/opguk/$$i || true ; \
	done

showinfo:
	@echo Docker version: $(dockerVersion)
	@echo Registry: $(registryUrl)
	@echo Newtag: $(newtag)
	@echo Current Tag: $(currenttag)
	@echo Container List: $(containers)
ifeq ($(tagrepo),yes)
	@echo Tagging repo: $(tagrepo)
endif


all: showinfo build push clean