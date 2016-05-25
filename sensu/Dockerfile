FROM registry.service.dsd.io/opguk/base:latest

ADD http://repos.sensuapp.org/apt/pubkey.gpg /tmp/pubkey.gpg

RUN \
  apt-key add /tmp/pubkey.gpg \
  && echo 'deb http://repos.sensuapp.org/apt sensu main' > /etc/apt/sources.list.d/sensu.list \
  && apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y sensu

ADD docker/confd /etc/confd

ADD  docker/my_init.d /etc/my_init.d
RUN  chmod a+x /etc/my_init.d/*

ENV OPG_SERVICE sensu
ENV SENSU_DEFAULT_LOG_LEVEL warn
