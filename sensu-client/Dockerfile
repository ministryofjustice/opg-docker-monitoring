FROM registry.service.dsd.io/opguk/sensu:latest

ENV SENSU_CLIENT_NAME localhost
ENV SENSU_RABBITMQ_HOST rabbitmq
ENV SENSU_RABBITMQ_PORT 5672
ENV SENSU_RABBITMQ_VHOST /sensu
ENV SENSU_RABBITMQ_USER sensu
ENV SENSU_RABBITMQ_PASSWORD sensu

ADD docker/confd /etc/confd

ADD docker/service/sensu-client /etc/service/sensu-client
RUN chmod a+x /etc/service/sensu-client/run
