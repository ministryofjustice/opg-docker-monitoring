FROM registry.service.dsd.io/opguk/base:latest

RUN  apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 46095ACC8548582C1A2699A9D27D666CD88E42B4

ENV  LOGSTASH_MAJOR 1.4
ENV  LOGSTASH_VERSION 1.4.2-1-2c0f5a1

RUN  echo "deb http://packages.elasticsearch.org/logstash/${LOGSTASH_MAJOR}/debian stable main" > /etc/apt/sources.list.d/logstash.list

RUN  apt-get update && apt-get -y upgrade && \
	 apt-get install -y --no-install-recommends logstash=$LOGSTASH_VERSION && \
     apt-get clean && apt-get autoremove && \
     rm -rf /var/lib/apt/* /var/lib/dpkg/*-old /var/lib/dpkg/info/* /var/lib/cache/* /var/lib/log/* /tmp/* /var/tmp/*

ADD  docker/logstash /etc/logstash

ADD  docker/service/logstash /etc/service/logstash
RUN  chmod a+x /etc/service/logstash/run

