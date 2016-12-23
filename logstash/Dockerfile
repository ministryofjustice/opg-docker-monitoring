FROM registry.service.opg.digital/opguk/jre-8:0.0.9-dev

RUN  apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 46095ACC8548582C1A2699A9D27D666CD88E42B4

ENV LOGSTASH_MAJOR 2.3
ENV LOGSTASH_VERSION 1:2.3.2-1

RUN  echo "deb http://packages.elasticsearch.org/logstash/${LOGSTASH_MAJOR}/debian stable main" > /etc/apt/sources.list.d/logstash.list

RUN  apt-get update && apt-get -y upgrade && \
	 apt-get install -y --no-install-recommends logstash=$LOGSTASH_VERSION && \
     apt-get clean && apt-get autoremove && \
     rm -rf /var/lib/cache/* /var/lib/log/* /tmp/* /var/tmp/*

# Provide default values for confd
ENV  OPG_LOGSTASH_ELASTICSEARCH_HOSTPORT elasticsearch:9200
ENV  OPG_LOGSTASH_ELASTICSEARCH_SSL_ENABLED false
ENV  OPG_LOGSTASH_ELASTICSEARCH_SSL_CERTIFICATE_VERIFICATION false

ADD  docker/confd /etc/confd

ADD  docker/service/logstash /etc/sv/logstash
RUN  chmod a+x /etc/sv/logstash/run
RUN ln -s /etc/sv/logstash /etc/service/

#syslog input out of namespace
EXPOSE 2514
EXPOSE 2514/udp

ENV  OPG_SERVICE logstash
