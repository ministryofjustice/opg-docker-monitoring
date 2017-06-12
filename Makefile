CONTAINERS = grafana graphite-statsd logstash monitoring-proxy sensu sensu-api sensu-client sensu-server uchiwa

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

pull:
	for i in $(CONTAINERS); do \
		docker pull $(registryUrl)/opguk/$$i:$(currenttag); \
	done

clean:
	for i in $(CONTAINERS); do \
		docker rmi $(registryUrl)/opguk/$$i:$(newtag) || true ; \
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