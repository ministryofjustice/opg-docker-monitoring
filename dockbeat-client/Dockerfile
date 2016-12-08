FROM registry.service.opg.digital/opguk/golang

ENV PYYAML_VERSION=3.12
# install pyyaml
RUN cd /tmp && wget http://pyyaml.org/download/pyyaml/PyYAML-${PYYAML_VERSION}.tar.gz && tar -zxvf PyYAML-${PYYAML_VERSION}.tar.gz
RUN cd /tmp/PyYAML-${PYYAML_VERSION} && python setup.py install

# install glide
RUN go get github.com/Masterminds/glide

COPY . $GOPATH/src/github.com/ingensi/dockbeat
RUN cd $GOPATH/src/github.com/ingensi/dockbeat && make && make

RUN mkdir -p /etc/dockbeat/ \
    && cp $GOPATH/src/github.com/ingensi/dockbeat/dockbeat /usr/local/bin/dockbeat

ADD docker/confd /etc/confd

WORKDIR /etc/dockbeat
ENTRYPOINT dockbeat

CMD [ "-c", "dockbeat.yml", "-e" ]