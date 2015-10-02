FROM registry.service.dsd.io/opguk/sensu:latest

ENV SENSU_CLIENT_NAME localhost
ENV SENSU_RABBITMQ_HOST rabbitmq
ENV SENSU_RABBITMQ_PORT 5672
ENV SENSU_RABBITMQ_VHOST /sensu
ENV SENSU_RABBITMQ_USER sensu
ENV SENSU_RABBITMQ_PASSWORD sensu

ENV SENSU_PLUGIN_ELASTICSEARCH_VERSION 0.1.2
ENV SENSU_PLUGIN_HTTP_VERSION 0.1.2
ENV SENSU_PLUGIN_REDIS_VERSION 0.0.4
ENV SENSU_PLUGIN_RABBITMQ_VERSION 0.0.4
ENV SENSU_PLUGIN_UCHIWA_VERSION 0.0.3

RUN /opt/sensu/embedded/bin/gem install sensu-plugins-elasticsearch --version $SENSU_PLUGIN_ELASTICSEARCH_VERSION && \
    /opt/sensu/embedded/bin/gem install sensu-plugins-http --version $SENSU_PLUGIN_HTTP_VERSION && \
    /opt/sensu/embedded/bin/gem install sensu-plugins-redis --version $SENSU_PLUGIN_REDIS_VERSION && \
    /opt/sensu/embedded/bin/gem install sensu-plugins-rabbitmq --version $SENSU_PLUGIN_RABBITMQ_VERSION && \
    /opt/sensu/embedded/bin/gem install sensu-plugins-uchiwa --version $SENSU_PLUGIN_UCHIWA_VERSION

ADD docker/sensu-client/plugins/* /etc/sensu/plugins/
RUN chmod -R +x /etc/sensu/plugins/

ADD docker/confd /etc/confd

ADD docker/service/sensu-client /etc/service/sensu-client
RUN chmod a+x /etc/service/sensu-client/run

ENV OPG_SERVICE sensu-client
