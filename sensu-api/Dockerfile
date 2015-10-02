FROM registry.service.dsd.io/opguk/sensu:latest

ENV SENSU_REDIS_HOST redis
ENV SENSU_REDIS_PORT 6379
ENV SENSU_REDIS_DB 1
ENV SENSU_RABBITMQ_HOST rabbitmq
ENV SENSU_RABBITMQ_PORT 5672
ENV SENSU_RABBITMQ_VHOST /sensu
ENV SENSU_RABBITMQ_USER sensu
ENV SENSU_RABBITMQ_PASSWORD sensu
ENV SENSU_API_USER admin
ENV SENSU_API_PASS admin

ADD docker/confd /etc/confd

ADD docker/service/sensu-api /etc/service/sensu-api
RUN chmod a+x /etc/service/sensu-api/run

EXPOSE 4567

ENV OPG_SERVICE sensu-api
