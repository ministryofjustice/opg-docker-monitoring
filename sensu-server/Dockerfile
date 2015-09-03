FROM registry.service.dsd.io/opguk/sensu:latest

ENV SENSU_REDIS_HOST redis
ENV SENSU_REDIS_PORT 6379
ENV SENSU_RABBITMQ_HOST rabbitmq
ENV SENSU_RABBITMQ_PORT 5672
ENV SENSU_RABBITMQ_VHOST /sensu
ENV SENSU_RABBITMQ_USER sensu
ENV SENSU_RABBITMQ_PASSWORD sensu
ENV SENSU_API_HOST sensuapi
ENV SENSU_API_PORT 4567

ENV SENSU_PLUGIN_PAGERDUTY_VERSION 0.0.6
ENV SENSU_PLUGIN_SLACK_VERSION 0.0.4
ENV SENSU_PLUGIN_AWS_VERSION 1.2.0

RUN \
  apt-get update && \
  apt-get -y install libxml2-dev zlib1g-dev

RUN /opt/sensu/embedded/bin/gem install sensu-plugins-pagerduty --version $SENSU_PLUGIN_PAGERDUTY_VERSION && \
    /opt/sensu/embedded/bin/gem install sensu-plugins-slack --version $SENSU_PLUGIN_SLACK_VERSION && \
    /opt/sensu/embedded/bin/gem install sensu-plugins-aws   --version $SENSU_PLUGIN_AWS_VERSION

ADD docker/confd /etc/confd

ADD docker/service/sensu-server /etc/service/sensu-server
RUN chmod a+x /etc/service/sensu-server/run
