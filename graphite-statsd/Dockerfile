FROM hopsoft/graphite-statsd:latest

ADD  docker/graphite /opt/graphite
ADD docker/statsd /opt/statsd

ADD  docker/my_init.d /etc/my_init.d
RUN  chmod a+x /etc/my_init.d/*


VOLUME /opt/graphite/storage

ENV OPG_SERVICE graphite-statsd

