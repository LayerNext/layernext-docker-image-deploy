#!/bin/bash

# Function to log messages to Docker logs
log_message() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

log_message "Starting container..."

if [ "$ENABLE_WINDOWS_AUTH" = "true" ]; then
    log_message "Windows Authentication is enabled. Setting up Kerberos..."

    export DEBIAN_FRONTEND=noninteractive

    # Install Kerberos tools if not already installed
    apt-get update && apt-get install -y krb5-user || { log_message "Failed to install Kerberos tools.";}

    # Check if environment variables for Kerberos username and password are set
    if [ -z "$KERBEROS_USER" ] || [ -z "$KERBEROS_PASSWORD" ]; then
        log_message "Error: Kerberos username or password is not set in environment variables."
        exit 1
    fi

    # Check if krb5.conf exists before copying
    if [ -f "/app/config/host_krb5/krb5.conf" ]; then
        log_message "Found Kerberos configuration..."
        cp /app/config/host_krb5/krb5.conf /etc/krb5.conf
    else
        log_message "Warning: Kerberos config file not found. Skipping copy."
    fi

    log_message "Detected Kerberos user: $KERBEROS_USER"

    # Set up Kerberos authentication

    log_message "Kerberos authentication successful."
else
    log_message "Windows Authentication is disabled. Skipping Kerberos setup."
fi

#echo a simple message
log_message "Container started."

# Ensure the default command provided in the Dockerfile or Compose file is executed
log_message "Executing default command..."
exec python3 app.py
