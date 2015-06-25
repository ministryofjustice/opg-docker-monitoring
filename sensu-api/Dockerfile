FROM registry.service.dsd.io/opguk/sensu:latest

ENV REDIS_PORT 6379

ENV RABBITMQ_PORT 5671
ENV RABBITMQ_VHOST /sensu
ENV RABBITMQ_USER sensu
ENV RABBITMQ_PASS sensu

ENV API_USER admin
ENV API_PASS admin

ADD docker/confd /etc/confd

ADD docker/service/sensu-api /etc/service/sensu-api
RUN chmod a+x /etc/service/sensu-api/run

EXPOSE 4567

