FROM registry.service.opg.digital/opguk/base:latest

ENV PYYAML_VERSION=3.12
ENV DOCKER_BEATS_VERSION=v1.0.0
ENV GOLANG_VERSION 1.7.4

# Install go
RUN cd /tmp && \
    wget https://storage.googleapis.com/golang/go${GOLANG_VERSION}.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go${GOLANG_VERSION}.linux-amd64.tar.gz && \
    rm go${GOLANG_VERSION}*

ENV PATH /usr/local/go/bin:$PATH
ENV GOPATH /go
ENV PATH /go/bin:$PATH

# install pyyaml
RUN cd /tmp && wget http://pyyaml.org/download/pyyaml/PyYAML-${PYYAML_VERSION}.tar.gz && \
    tar -zxvf PyYAML-${PYYAML_VERSION}.tar.gz && \
    cd PyYAML-${PYYAML_VERSION} && \
    python setup.py install && \
    cd ../ && \
    rm -rf PyYAML-${PYYAML_VERSION}*

# install glide
RUN go get github.com/Masterminds/glide

RUN cd /tmp && \
    wget https://github.com/Ingensi/dockbeat/archive/${DOCKER_BEATS_VERSION}.tar.gz && \
    tar -xf ${DOCKER_BEATS_VERSION}.tar.gz && \
    mkdir -p $GOPATH/src/github.com/ingensi && \
    mv /tmp/dockbeat* $GOPATH/src/github.com/ingensi/dockbeat && \
    rm ${DOCKER_BEATS_VERSION}.tar.gz && \
    cd $GOPATH/src/github.com/ingensi/dockbeat && \
    make && \
    make

RUN mkdir -p /etc/dockbeat/ \
    && cp $GOPATH/src/github.com/ingensi/dockbeat/dockbeat /usr/local/bin/dockbeat

ADD docker/confd /etc/confd
ADD docker/service/dockbeat /etc/sv/dockbeat
RUN chmod -R a+x /etc/sv/dockbeat/run
RUN  ln -s /etc/sv/dockbeat /etc/service/

ENV OPG_SERVICE dockbeat