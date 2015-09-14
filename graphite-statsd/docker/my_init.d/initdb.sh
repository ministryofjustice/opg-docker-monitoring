#!/bin/bash
if [ ! -s /opt/graphite/storage/graphite.db ] ; then
  /usr/bin/python /opt/graphite/webapp/graphite/manage.py syncdb --noinput
fi
