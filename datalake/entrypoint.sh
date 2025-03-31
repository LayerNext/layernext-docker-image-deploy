#!/bin/bash
set -e

log_message() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

log_message "Starting container..."

trap 'log_message "Error occurred at line $LINENO"; exit 1' ERR

# Handle the case where Kerberos setup might fail
if [ "$ENABLE_WINDOWS_AUTH" = "true" ]; then
    log_message "Windows Authentication is enabled. Setting up Kerberos..."

    export DEBIAN_FRONTEND=noninteractive
    apt-get update && apt-get install -y krb5-user || {
        log_message "Failed to install Kerberos tools, but continuing without Kerberos setup."
    }

    if [ -z "$KERBEROS_USER" ] || [ -z "$KERBEROS_PASSWORD" ]; then
        log_message "Kerberos credentials not provided. Skipping Kerberos authentication."
    else
        log_message "Setting up Kerberos authentication..."
        kinit <<< "$KERBEROS_PASSWORD" "$KERBEROS_USER" || log_message "Failed to authenticate with Kerberos."
    fi
else
    log_message "Windows Authentication is disabled. Skipping Kerberos setup."
fi

log_message "Executing default command..."
exec "$@"
