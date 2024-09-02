#!/bin/sh

envsubst < /etc/alertmanager/alertmanager.yml > /etc/alertmanager/alertmanager.yml

# Start Alertmanager
exec /bin/alertmanager "$@"
