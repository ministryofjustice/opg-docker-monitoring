FROM registry.service.opg.digital/opguk/sensu:latest

ENV SENSU_REDIS_HOST redis
ENV SENSU_REDIS_PORT 6379
ENV SENSU_REDIS_DB 1

ENV SENSU_API_HOST sensuapi
ENV SENSU_API_PORT 4567
ENV SENSU_API_USER sensu
ENV SENSU_API_PASSWORD sensu

RUN sensu-install --plugins aws,pagerduty,slack

ADD docker/confd /etc/confd

ADD docker/service/sensu-server /etc/sv/sensu-server
RUN chmod a+x /etc/sv/sensu-server/run
RUN ln -s /etc/sv/sensu-server /etc/service/

ENV OPG_SERVICE sensu-server
