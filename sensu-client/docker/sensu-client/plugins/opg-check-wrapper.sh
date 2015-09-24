#!/bin/bash
#
# Wrapper script for Sensu checks
#

# External variables used by OPG checks
#
# SENSU_CLIENT_CURL_TIMEOUT    (Timeout in seconds on curl commands)
# SENSU_CLIENT_ELASTIC_PORT    (Port exposed by Elasticsearch service)
# SENSU_CLIENT_ELASTIC_RECENT  (How recent records should be in ElasticSearch e.g 5m - uses standard Query DSL filter ranges)

# Set defaults (used within common functions so set first)
#
export CURL_TIMEOUT=${SENSU_CLIENT_CURL_TIMEOUT:-10}
export ELASTIC_PORT=${SENSU_CLIENT_ELASTIC_PORT:-9200}
export ELASTIC_RECENT=${SENSU_CLIENT_ELASTIC_RECENT:-5m}

# Source in common functions
#
source /etc/sensu/plugins/opg-check-functions.sh

# Export these functions
#
export -f $(/usr/bin/awk '/^function/ {print $2}' /etc/sensu/plugins/opg-check-functions.sh \
              | /usr/bin/tr -d '()')

# Set defaults (using common functions so set after)
#
OPG_CHECK=${OPG_CHECK:-/bin/true}
DEFAULT_HOST="$(get_gateway_ip)"

# Execute the check and exit with the exit code.
#
eval ${OPG_CHECK}
RC=${?}
exit ${RC}

# Exit codes:
#
# The exit code of any particular check back to Sensu should be:
#
# 0 - ok
# 1 - warning
# 2 - critical
# 3 - unknown
