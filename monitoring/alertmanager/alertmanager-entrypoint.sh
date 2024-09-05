#!/bin/sh
sudo su
sudo mkdir -p /etc/alertmanager
chmod 755 /etc/alertmanager

envsubst < /etc/alertmanager/alertmanager.yml > /etc/alertmanager/alertmanager.yml

# Start Alertmanager
exec /bin/alertmanager "$@"
