FROM registry.service.dsd.io/opguk/sensu:latest

ENV SENSU_REDIS_HOST redis
ENV SENSU_REDIS_PORT 6379
ENV SENSU_REDIS_DB 1

ENV SENSU_API_USER sensu
ENV SENSU_API_PASSWORD sensu

ENV SENSU_RABBITMQ_SSL true

ADD docker/confd /etc/confd

ADD docker/service/sensu-api /etc/sv/sensu-api
RUN chmod a+x /etc/sv/sensu-api/run
RUN ln -s /etc/sv/sensu-api /etc/service/

EXPOSE 4567

ENV OPG_SERVICE sensu-api
