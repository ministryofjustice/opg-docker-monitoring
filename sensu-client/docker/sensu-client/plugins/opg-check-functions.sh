#
# Common Functions used by OPG Sensu Client Checks
#

# Get gateway IP address (used if inside docker to contact exposed host ports)
#
# Passed back to caller:
#
# Output: IP address
# Returns: Exit code from last command
#
function get_gateway_ip() {

  IP=$(/sbin/ip route \
      | /usr/bin/awk '/default.*via/ {print $3}' \
      | /usr/bin/tr -d ' ')
  RC=${?}

  echo "${IP}"
  return ${RC}
}


# Perform a curl with some time out values set and save the output and return to caller
#
# Function expects a URL/path to be passed in e.g. http://localhost:8080/test/index and treats any
# additional strings passed as switches and arguments to be passed straight to curl
#
# Use eval so that data passed with -d (e.g. json) is interpreted and passed to curl correctly.
#
# Passed back to caller:
#
# Output: Output from the curl command
# Returns: Exit code from last command
#
function curl_and_return() {

  CURL_TIMEOUT=${CURL_TIMEOUT:-10}
  URL="${1}"
  shift
  OPTIONS=${*}

  OUTPUT=$(eval /usr/bin/curl --connect-timeout ${CURL_TIMEOUT} --max-time ${CURL_TIMEOUT} "${URL}" ${OPTIONS} 2>/dev/null)
  RC=${?}

  echo "${OUTPUT}"
  return ${RC}
}


# Get a count of records from an index that are timestamped within a specific recent period e.g. within the last 5 minutes
#
# Passed back to caller:
#
# Output: Output from the _count query
# Returns: Exit code from last command
#
function opg-get-elasticrecent() {

  ELASTIC_HOST=${ELASTIC_HOST:-$(get_gateway_ip)}
  ELASTIC_PORT=${ELASTIC_PORT:-9200}
  ELASTIC_INDEX=${ELASTIC_INDEX:-logstash-$(date '+%Y.%m.%d')}
  ELASTIC_RECENT=${ELASTIC_RECENT:-5m}

  URL="http://${ELASTIC_HOST}:${ELASTIC_PORT}/${ELASTIC_INDEX}/_count"
  JSON="-d '{ \"query\": { \"filtered\": { \"filter\": { \"range\": { \"@timestamp\": { \"gt\": \"now-${ELASTIC_RECENT}\" } } } } } }'"

  RECENT=$(curl_and_return ${URL} -XGET ${JSON})
  RC=${?}

  echo "${RECENT}"

  return ${RC}
}


# Interpret json returned from an Elasticsearch _count query and pick out record count
#
# Function expects the json returned from "_count" to be passed
#
# Passed back to caller:
#
# Output: Count of records found
# Returns: Nothing
#
function opg-get-elasticcount() {

  ELASTICCOUNT=0
  QUERYOUTPUT="${1}"

  if [[ "${QUERYOUTPUT}" != *"count"* ]] ; then
    ELASTICCOUNT=0
  else
    ELASTICCOUNT=$(echo "${QUERYOUTPUT}" \
              | /bin/sed 's/[{},:"]/ /g' \
              | /usr/bin/awk '{print $2}' \
              | /usr/bin/tr -d ' ')
  fi

  echo "${ELASTICCOUNT}"

  return
}
