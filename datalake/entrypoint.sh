#!/bin/bash
set -e  # Exit on error

# Function to log messages to Docker logs
log_message() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

log_message "Starting container..."

trap 'log_message "Error occurred at line $LINENO"' ERR

if [ "$ENABLE_WINDOWS_AUTH" = "true" ]; then
    log_message "Windows Authentication is enabled. Setting up Kerberos..."

    apt-get update && apt-get install -y krb5-user || { log_message "Failed to install Kerberos tools."; exit 1; }

    # Check if krb5.conf exists before copying
    if [ -f "/app/config/host_krb5/krb5.conf" ]; then
        log_message "Copying Kerberos configuration..."
        cp /app/config/host_krb5/krb5.conf /etc/krb5.conf || { log_message "Failed to copy Kerberos config."; exit 1; }
    else
        log_message "Warning: Kerberos config file (/host_krb5/krb5.conf) not found. Skipping copy."
    fi

    # Detect Kerberos user from host machine
    HOST_KRB_USER=$(klist 2>/dev/null | grep "Default principal" | awk '{print $3}')

    if [[ -n "$HOST_KRB_USER" ]]; then
        log_message "Detected Kerberos user: $HOST_KRB_USER"
        kinit "$HOST_KRB_USER" || { log_message "Failed to run kinit."; exit 1; }
    else
        log_message "Warning: No Kerberos user found on host. Skipping kinit."
    fi
else
    log_message "Windows Authentication is disabled. Skipping Kerberos setup."
fi

log_message "Executing default command..."
exec "$@"
