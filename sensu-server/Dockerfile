FROM registry.service.dsd.io/opguk/sensu:latest

ENV SENSU_REDIS_HOST redis
ENV SENSU_REDIS_PORT 6379
ENV SENSU_REDIS_DB 1
ENV SENSU_RABBITMQ_HOST rabbitmq
ENV SENSU_RABBITMQ_PORT 5672
ENV SENSU_RABBITMQ_VHOST /sensu
ENV SENSU_RABBITMQ_USER sensu
ENV SENSU_RABBITMQ_PASSWORD sensu
ENV SENSU_API_HOST sensuapi
ENV SENSU_API_PORT 4567

RUN sensu-install --plugins aws,pagerduty,slack

ADD docker/confd /etc/confd

ADD docker/service/sensu-server /etc/sv/sensu-server
RUN chmod a+x /etc/sv/sensu-server/run
RUN ln -s /etc/sv/sensu-server /etc/service/

ENV OPG_SERVICE sensu-server
