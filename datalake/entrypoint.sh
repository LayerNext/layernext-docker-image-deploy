#!/bin/bash
set -e  # Exit on error

# Function to log messages to Docker logs
log_message() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

log_message "Starting container..."

# Trap to log errors with line number
trap 'log_message "Error occurred at line $LINENO"' ERR

if [ "$ENABLE_WINDOWS_AUTH" = "true" ]; then
    log_message "Windows Authentication is enabled. Setting up Kerberos..."

    export DEBIAN_FRONTEND=noninteractive

    # Install Kerberos tools if not already installed
    apt-get update && apt-get install -y krb5-user || { log_message "Failed to install Kerberos tools."; exit 1; }

    # Check if environment variables for Kerberos username and password are set
    if [ -z "$KERBEROS_USER" ] || [ -z "$KERBEROS_PASSWORD" ]; then
        log_message "Error: Kerberos username or password is not set in environment variables."
        exit 1
    fi

    # Check if krb5.conf exists before copying
    if [ -f "/app/config/host_krb5/krb5.conf" ]; then
        log_message "Copying Kerberos configuration..."
        cp /app/config/host_krb5/krb5.conf /etc/krb5.conf || { log_message "Failed to copy Kerberos config."; exit 1; }
    else
        log_message "Warning: Kerberos config file (/host_krb5/krb5.conf) not found. Skipping copy."
    fi

    # Use the provided Kerberos username and password from environment variables
    HOST_KRB_USER=$KERBEROS_USER
    HOST_KRB_PASSWORD=$KERBEROS_PASSWORD

    log_message "Detected Kerberos user: $HOST_KRB_USER"
    
    # Store the password in a temporary file for `kinit`
    echo "$HOST_KRB_PASSWORD" | kinit "$HOST_KRB_USER" || { log_message "Failed to run kinit."; exit 1; }

    log_message "Kerberos authentication successful."
else
    log_message "Windows Authentication is disabled. Skipping Kerberos setup."
fi
