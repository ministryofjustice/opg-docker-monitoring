.PHONY: build push pull

currenttag := $(shell semvertag latest)
newtag := $(shell semvertag bump patch)

registryUrl ?= registry.service.opg.digital
oldRegistryUrl ?= registry.service.dsd.io
dockerVersion := $(shell docker --version | cut -f3 -d' '  | grep '^1\.[0-9]\.')

containers = grafana graphite-statsd logstash monitoring-proxy sensu sensu-api sensu-client sensu-server uchiwa

build: $(containers) dockerVersion=$(dockerVersion)

$(containers):
    $(MAKE) -C $i newtag=${newtag}

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
        @docker pull ${registryUrl}/opguk/grafana:${currenttag}; \

clean:
	for i in $(CLEAN_CONTAINERS); do \
       	    @docker rmi $(registryUrl)/opguk/$$i:$(newtag) || true ; \
       	    @docker rmi $(registryUrl)/opguk/$$i:latest || true ; \
   	done

all: showinfo build push clean