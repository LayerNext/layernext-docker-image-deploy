#!/bin/bash

setup_customer=$1

db_pass = openssl rand -hex 10
db_root_pass = openssl rand -hex 16
jwt_secret = openssl rand -hex 32

cat > ./.env <<EOL
#DB
DB_HOST = host.docker.internal
DB_PORT = 17017
DB_USER = sso_user
DB_PASS = $(openssl rand -hex 10)
DATABASE = authDB

#env
PORT = 8888

JWT_SECRET = $jwt_secret

#apps
DATALAKE = 2E7GG9DZB7J8G45
STUDIO = ZQ9YR6HDFGFRJKQ
SSO = 1RMBHCWM8QIJ6QH
DATASET = 8F7TT5VB77K0GGH

BASE_URL = https://accounts.$setup_customer.layerx.ai
FRONT_END_BASE_URL = https://accounts.$setup_customer.layerx.ai
ANNO_INTERNAL_SERVER = http://host.docker.internal:8080
ENVIRONMENT = enterprise

#support email sendgrid
SUPPORT_EMAIL = support@layerx.ai

# Build time
SETUP_CUSTOMER = $setup_customer
MONGODB_ADMIN_PASSWORD = $db_root_pass
SYNC_TOOL_PATH = ./../dataset

EOL




#SENDGRID_API_KEY = <sendgrid api key>


