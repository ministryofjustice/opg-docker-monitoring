.PHONY: build

registryUrl ?= registry.service.opg.digital

image = opguk/graphite-statsd

build:
	docker build $(no-cache) -t "$(registryUrl)/$(image)" .
	docker tag "$(registryUrl)/$(image)" "$(registryUrl)/$(image):$(newtag)"
