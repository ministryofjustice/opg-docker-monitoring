CONTAINERS = grafana graphite-statsd logstash monitoring-proxy sensu sensu-api sensu-client sensu-server uchiwa dockbeat-client

.PHONY: build push pull $(CONTAINERS) clean showinfo

tagrepo = no
ifdef stage
	stagearg := --stage $(stage)
endif

ifdef buildArgs
	no-cache := --no-cache
endif

currenttag := $(shell semvertag latest $(stagearg))
newtag := $(shell semvertag bump patch $(stagearg))


registryUrl = registry.service.opg.digital
oldRegistryUrl = registry.service.dsd.io


build: $(CONTAINERS)

$(CONTAINERS):
	$(MAKE) -C $@ newtag=$(newtag) registryUrl=$(registryUrl) no-cache=$(no-cache)

push:
	for i in $(CONTAINERS); do \
			[ "$(stagearg)x" = "x" ] && docker push $(registryUrl)/opguk/$$i ; \
			docker push $(registryUrl)/opguk/$$i:$(newtag) ; \
	done
ifeq ($(tagrepo),yes)
	@echo -e Tagging repo
	semvertag tag $(newtag)
else
	@echo -e Not tagging repo
endif
	#push to old registry
	for i in $(CONTAINERS); do \
			[ "$(stagearg)x" = "x" ] && docker push $(oldRegistryUrl)/opguk/$$i ; \
			docker push $(oldRegistryUrl)/opguk/$$i:$(newtag) ; \
	done


pull:
	for i in $(CONTAINERS); do \
		docker pull $(registryUrl)/opguk/$$i:$(currenttag); \
	done

clean:
	for i in $(CONTAINERS); do \
		docker rmi $(registryUrl)/opguk/$$i:$(newtag) || true ; \
		docker rmi $(oldRegistryUrl)/opguk/$$i:$(newtag) || true ; \
		docker rmi $(oldRegistryUrl)/opguk/$$i || true ; \
		docker rmi $(registryUrl)/opguk/$$i || true ; \
	done

showinfo:
	@echo Registry: $(registryUrl)
	@echo Newtag: $(newtag)
	@echo Current Tag: $(currenttag)
	@echo Container List: $(CONTAINERS)
ifeq ($(tagrepo),yes)
	@echo Tagging repo: $(tagrepo)
endif

all: showinfo build push clean