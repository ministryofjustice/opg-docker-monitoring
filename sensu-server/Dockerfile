FROM registry.service.dsd.io/opguk/sensu:latest

ENV SENSU_REDIS_PORT 6379
ENV SENSU_RABBITMQ_PORT 5672
ENV SENSU_RABBITMQ_VHOST /sensu
ENV SENSU_RABBITMQ_USER sensu
ENV SENSU_RABBITMQ_PASS sensu
ENV SENSU_API_HOST sensuapi
ENV SENSU_API_PORT 4567
ENV SENSU_HANDLER_SLACK_WEBHOOKURL http://localhost
ENV SENSU_HANDLER_SLACK_CHANNEL @slackbot
ENV SENSU_HANDLER_SLACK_BOTNAME sensubot

RUN /opt/sensu/embedded/bin/gem install sensu-plugins-slack

ADD docker/confd /etc/confd

ADD docker/service/sensu-server /etc/service/sensu-server
RUN chmod a+x /etc/service/sensu-server/run
