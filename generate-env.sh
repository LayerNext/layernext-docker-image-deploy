#!/bin/bash

export $(grep -v '^#' .env | xargs -d '\n')

# generate accounts env
accounts_env="./accounts/.env"
if [ -d $accounts_env ]; then
  echo "Existing env file found for accounts. replacing..."
fi
cat > $accounts_env <<EOL
#DB
DB_HOST = host.docker.internal
DB_PORT = 17017
DB_USER = sso_user
DB_PASS = $(openssl rand -hex 10)
DATABASE = authDB

# Build time
SETUP_CUSTOMER = $SETUP_CUSTOMER
MONGODB_ADMIN_PASSWORD = $(openssl rand -hex 16)
SYNC_TOOL_PATH = ./../dataset

#env
PORT = 8888

JWT_SECRET = $(openssl rand -hex 32)

#apps
DATALAKE = 2E7GG9DZB7J8G45
STUDIO = ZQ9YR6HDFGFRJKQ
SSO = 1RMBHCWM8QIJ6QH
DATASET = 8F7TT5VB77K0GGH

BASE_URL = https://accounts.$SETUP_CUSTOMER.layerx.ai
FRONT_END_BASE_URL = https://accounts.$SETUP_CUSTOMER.layerx.ai
ANNO_INTERNAL_SERVER = http://host.docker.internal:8080
ENVIRONMENT = enterprise

#support email sendgrid
SUPPORT_EMAIL = support@layerx.ai
SENDGRID_API_KEY = $SENDGRID_API_KEY

# Google login
GOOGLE_API_KEY = $GOOGLE_API_KEY
GOOGLE_CLIENT_ID = $GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = $GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN = $GOOGLE_REFRESH_TOKEN
EOL