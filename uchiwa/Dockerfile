FROM registry.service.dsd.io/opguk/base:latest

# From https://uchiwa.io/#/download
ENV UCHIWA_VERSION 0.9.1-1
ENV UCHIWA_MD5SUM 2ab26090c1dbb39874459ab84aba51e4

RUN apt-get update 

WORKDIR /tmp/
RUN wget -q http://dl.bintray.com/palourde/uchiwa/uchiwa_${UCHIWA_VERSION}_amd64.deb
RUN echo "${UCHIWA_MD5SUM} uchiwa_${UCHIWA_VERSION}_amd64.deb" > uchiwa.md5
RUN md5sum --check uchiwa.md5
RUN dpkg -i uchiwa_${UCHIWA_VERSION}_amd64.deb
RUN rm -rf /tmp/*

ADD docker/service/uchiwa /etc/service/uchiwa
RUN chmod a+x /etc/service/uchiwa/run

ADD docker/confd /etc/confd

EXPOSE 3000

ENV OPG_SERVICE uchiwa
