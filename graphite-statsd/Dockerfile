FROM hopsoft/graphite-statsd:latest

ADD  docker/graphite /opt/graphite

VOLUME /opt/graphite/storage

ADD  docker/my_init.d /etc/my_init.d
RUN  chmod a+x /etc/my_init.d/*
