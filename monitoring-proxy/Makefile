.PHONY: build
newtag ?= latest
registryUrl ?= registry.service.dsd.io
image = ${registryUrl}/opguk/monitoring-proxy

build:
	docker build -t "${image}:latest" .
	docker tag "${image}:latest" "${image}:${newtag}"
