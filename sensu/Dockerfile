FROM registry.service.dsd.io/opguk/base:latest

ENV SENSU_VERSION 0.25.1-1

# Copy/pasted from: https://sensuapp.org/docs/latest/platforms/sensu-on-ubuntu-debian.html#sensu-core
RUN \
  wget -q http://repositories.sensuapp.org/apt/pubkey.gpg -O- | sudo apt-key add - \
  && echo "deb     http://repositories.sensuapp.org/apt sensu main" | sudo tee /etc/apt/sources.list.d/sensu.list \
  && apt-get update \
  && apt-get upgrade -y \
  && apt-get install -y sensu=$SENSU_VERSION \
  && apt-get clean \
  && apt-get autoremove \
  && rm -rf /var/lib/cache/* /var/lib/log/* /tmp/* /var/tmp/*

ADD docker/confd /etc/confd

ADD  docker/my_init.d /etc/my_init.d
RUN  chmod a+x /etc/my_init.d/*

ENV OPG_SERVICE sensu
ENV SENSU_DEFAULT_LOG_LEVEL warn
