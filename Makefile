containers = grafana graphite-statsd logstash monitoring-proxy sensu sensu-api sensu-client sensu-server uchiwa

.PHONY: build push pull $(containers) clean showinfo

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


build: $(containers)

$(containers):
	$(MAKE) -C $@ newtag=$(newtag) registryUrl=$(registryUrl) no-cache=$(no-cache)

push:
	for i in $(containers); do \
		[ "$(tagrepo)" = "yes" ] && docker push $(registryUrl)/opguk/$$i ; \
		docker push $(registryUrl)/opguk/$$i:$(newtag); \
	done

	ifeq ($(tagrepo),yes)
		@echo -e Tagging repo
		semvertag tag $(newtag)
	else
		@echo -e Not tagging repo
	endif

	for i in $(containers); do \
		[ "$(tagrepo)" = "yes" ] && docker push $(oldRegistryUrl)/opguk/$$i ; \
		docker push $(oldRegistryUrl)/opguk/$$i:$(newtag); \
	done

pull:
	for i in $(containers); do \
		docker pull $(registryUrl)/opguk/$$i:$(currenttag); \
	done

clean:
	for i in $(containers); do \
		docker rmi $(registryUrl)/opguk/$$i:$(newtag) || true ; \
		docker rmi $(oldRegistryUrl)/opguk/$$i:$(newtag) || true ; \
		docker rmi $(oldRegistryUrl)/opguk/$$i || true ; \
		docker rmi $(registryUrl)/opguk/$$i || true ; \
	done

showinfo:
	@echo Registry: $(registryUrl)
	@echo Newtag: $(newtag)
	@echo Current Tag: $(currenttag)
	@echo Container List: $(containers)
ifeq ($(tagrepo),yes)
	@echo Tagging repo: $(tagrepo)
endif

all: showinfo build push clean