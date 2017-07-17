FROM registry.service.opg.digital/opguk/jre-8
MAINTAINER OPG Webops Team <opguk@digital.justice.gov.uk>

ARG ES_VERSION=1:5.3.0-1
ARG LOGSTASH_DOWNLOAD_URL
ARG LOGSTASH_PACK_URL
ARG PLUGIN_LIST="logstash-input-beats syslog stdin tcp redis logstash-filter-prune"

RUN wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -

# Define software versions
ENV ELASTIC_REPO_BASE https://artifacts.elastic.co/packages/5.x/apt
RUN echo "deb $ELASTIC_REPO_BASE stable main" > /etc/apt/sources.list.d/elastic.list

RUN apt-get update \
  && apt-get -y install logstash=${ES_VERSION} \
  && apt-get autoremove \
  && rm -rf /var/lib/apt/lists/*

# Provide a minimal configuration, so that simple invocations will provide
# a good experience.
ENV  OPG_LOGSTASH_ELASTICSEARCH_HOSTPORT elasticsearch:9200
ENV  OPG_LOGSTASH_ELASTICSEARCH_SSL_ENABLED false
ENV  OPG_LOGSTASH_ELASTICSEARCH_SSL_CERTIFICATE_VERIFICATION false

ADD  docker/confd /etc/confd

ADD  docker/service/logstash /etc/sv/logstash
RUN  chmod a+x /etc/sv/logstash/run
RUN ln -s /etc/sv/logstash /etc/service/ && \
    chown  app:app /usr/share/logstash/data /var/lib/logstash


#RUN cd /usr/share/logstash && LOGSTASH_PACK_URL=${LOGSTASH_PACK_URL} /usr/share/logstash/bin/logstash-plugin install ${PLUGIN_LIST}

EXPOSE 2514
EXPOSE 2514/udp

ENV OPG_SERVICE logstash