FROM registry.service.dsd.io/opguk/base:latest


RUN curl https://packagecloud.io/gpg.key | apt-key add -
RUN echo "deb https://packagecloud.io/grafana/stable/debian/ wheezy main" > /etc/apt/sources.list.d/grafana.list

RUN  apt-get update && apt-get -y upgrade && \
     apt-get install -y grafana && \
     apt-get clean && apt-get autoremove && \
     rm -rf /var/lib/cache/* /var/lib/log/* /tmp/* /var/tmp/*


VOLUME ["/var/lib/grafana"]

WORKDIR /usr/share/grafana



ADD  docker/service/grafana /etc/service/grafana
RUN  chmod a+x /etc/service/grafana/run

ADD  docker/beaver.d /etc/beaver.d

ADD  docker/grafana /usr/share/grafana
RUN  chown -R grafana:grafana /usr/share/grafana/


EXPOSE 3000
