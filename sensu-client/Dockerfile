FROM registry.service.dsd.io/opguk/sensu:latest

ENV SENSU_CLIENT_NAME localhost
ENV SENSU_RABBITMQ_HOST rabbitmq
ENV SENSU_RABBITMQ_PORT 5672
ENV SENSU_RABBITMQ_VHOST /sensu
ENV SENSU_RABBITMQ_USER sensu
ENV SENSU_RABBITMQ_PASSWORD sensu

RUN sensu-install --plugins cpu-checks,disk-checks,io-checks,network-checks,process-checks
RUN sensu-install --plugins aws,docker,elasticsearch,http,mongodb,rabbitmq,redis,uchiwa

ADD docker/sensu-client/plugins/* /etc/sensu/plugins/
RUN chmod -R +x /etc/sensu/plugins/

ADD docker/confd /etc/confd

ADD docker/service/sensu-client /etc/sv/sensu-client
RUN chmod a+x /etc/sv/sensu-client/run
RUN ln -s /etc/sv/sensu-client /etc/service/

ENV OPG_SERVICE sensu-client
