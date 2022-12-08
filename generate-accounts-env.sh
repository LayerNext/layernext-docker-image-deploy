#!/bin/bash

setup_customer=$1

cat > ./test.txt <<EOL

#DB
DB_HOST = host.docker.internal
DB_PORT = 17017
DB_USER = sso_user
DATABASE = authDB

#env
PORT = 8888

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

EOL




#SENDGRID_API_KEY = <sendgrid api key>
#DB_PASS = xfuqbPA17D37teG
#JWT_SECRET = bPh9LdKnx9VfCjl6w6yOailIp8xU40fYuHfNhN0bAakQ4dYO2E
