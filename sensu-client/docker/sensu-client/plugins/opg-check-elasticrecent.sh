#!/bin/bash
#
# Check the count of recent elasticsearch records for a particular index
#
# Passed back to caller:
#
# Output: Count of records that match the criteria
# Returns: 0 (count > 0) and 1 (count = 0)
#

ELASTIC_HOST=${ELASTIC_HOST:-$(get_gateway_ip)}
ELASTIC_PORT=${ELASTIC_PORT:-9200}
ELASTIC_INDEX=${ELASTIC_INDEX:-logstash-$(date '+%Y.%m.%d')}
ELASTIC_RECENT=${ELASTIC_RECENT:-5m}

COUNT=$(opg-get-elasticcount $(opg-get-elasticrecent))

if [[ ${COUNT} -eq 0 ]] ; then
  STATUS=WARNING
  RC=1
else
  STATUS=OK
  RC=0
fi

echo "$(basename ${0}) ${STATUS}: ${COUNT} records found for ${ELASTIC_INDEX} within the last ${ELASTIC_RECENT}"

exit ${RC}
