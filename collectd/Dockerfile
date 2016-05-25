FROM registry.service.dsd.io/opguk/base:latest

RUN  apt-get update && apt-get -y upgrade && \
     apt-get install -y collectd && \
     apt-get clean && apt-get autoremove && \
     rm -rf /var/lib/apt/* /var/lib/dpkg/*-old /var/lib/dpkg/info/* /var/lib/cache/* /var/lib/log/* /tmp/* /var/tmp/*


ADD  docker/service/collectd /etc/sv/collectd
RUN  chmod a+x /etc/sv/collectd/run
RUN ln -s /etc/sv/collectd /etc/service/

ADD  docker/collectd /etc/collectd

ENV OPG_SERVICE collectd
