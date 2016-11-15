FROM registry.service.opg.digital/opguk/base

#ENV SENSU_VERSION 0.26.1-1

ONBUILD ENV SENSU_RABBITMQ_HOST rabbitmq
ONBUILD ENV SENSU_RABBITMQ_PORT 5672
ONBUILD ENV SENSU_RABBITMQ_VHOST /sensu
ONBUILD ENV SENSU_RABBITMQ_USER sensu
ONBUILD ENV SENSU_RABBITMQ_PASSWORD sensu
ONBUILD ENV SENSU_RABBITMQ_SSL true
ONBUILD ENV SENSU_RABBITMQ_SSL_CHAIN  /etc/ssl/cert.pem
ONBUILD ENV SENSU_RABBITMQ_SSL_PRIVKEY  /etc/ssl/key.pem
ONBUILD ENV SENSU_RABBITMQ_SSL_PORT 5671

# Copy/pasted from: https://sensuapp.org/docs/latest/platforms/sensu-on-ubuntu-debian.html#sensu-core
RUN \
  wget -q http://repositories.sensuapp.org/apt/pubkey.gpg -O- | sudo apt-key add - \
  && echo "deb     http://repositories.sensuapp.org/apt sensu main" | tee /etc/apt/sources.list.d/sensu.list \
  && apt-get update \
  && apt-get install -y sensu=$SENSU_VERSION \
  && apt-get clean \
  && apt-get autoremove \
  && rm -rf /var/lib/cache/* /var/lib/log/* /tmp/* /var/tmp/*

ADD docker/confd /etc/confd

ADD  docker/my_init.d /etc/my_init.d
RUN  chmod a+x /etc/my_init.d/*

ENV OPG_SERVICE sensu
ENV SENSU_DEFAULT_LOG_LEVEL warn


