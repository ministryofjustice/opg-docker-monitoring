FROM registry.service.dsd.io/opguk/sensu:latest

ENV REDIS_PORT 6379

ENV RABBITMQ_PORT 5671
ENV RABBITMQ_VHOST /sensu
ENV RABBITMQ_USER sensu
ENV RABBITMQ_PASS sensu

ADD docker/confd /etc/confd

ADD docker/service/sensu-server /etc/service/sensu-server
RUN chmod a+x /etc/service/sensu-server/run
