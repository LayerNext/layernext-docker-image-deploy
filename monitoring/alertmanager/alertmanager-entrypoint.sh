#!/bin/sh

if [ -z "$SMTP_SMARTHOST" ] || [ -z "$SMTP_FROM" ] || [ -z "$SMTP_AUTH_USERNAME" ] || [ -z "$SMTP_AUTH_PASSWORD" ] || [ -z "$SUPPORT_EMAIL" ] || [ -z "$SETUP_CUSTOMER" ]; then
  echo "Error: One or more required environment variables are missing."
  exit 1
fi

# Substitute environment variables and write to a temporary file
sed "s|\${SMTP_SMARTHOST}|${SMTP_SMARTHOST}|g; s|\${SMTP_FROM}|${SMTP_FROM}|g; s|\${SMTP_AUTH_USERNAME}|${SMTP_AUTH_USERNAME}|g; s|\${SMTP_AUTH_PASSWORD}|${SMTP_AUTH_PASSWORD}|g; s|\${SUPPORT_EMAIL}|${SUPPORT_EMAIL}|g; s|\${SETUP_CUSTOMER}|${SETUP_CUSTOMER}|g" \
    /etc/alertmanager/alertmanager.yml.tmp > /etc/alertmanager/alertmanager.yml

if [ $? -ne 0 ]; then
  echo "Error: Failed to substitute environment variables in configuration file."
  exit 1
fi

if [ $? -ne 0 ]; then
  echo "Error: Failed to copy the configuration file."
  exit 1
fi

# Start Alertmanager
exec /bin/alertmanager "$@"

