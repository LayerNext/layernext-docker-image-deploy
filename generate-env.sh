#!/bin/bash

export $(grep -v '^#' .env | xargs -d '\n')
JWT_SECRET=$(openssl rand -hex 32)

# generate accounts env
accounts_env="./accounts/.env"
if [ -f $accounts_env ]; then
  echo "Existing env file found for accounts. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $accounts_env <<EOL
#DB
DB_HOST=host.docker.internal
DB_PORT=17017
DB_USER=sso_user
DB_PASS=$(openssl rand -hex 10)
DATABASE=authDB

#DUMP
DUMP_USER=layernext_dumprestoreuser
DUMP_USER_PWD=$(openssl rand -hex 10)
OUTPUT_DIRECTORY=accounts
#change dump keepeing days as prefer and use dump per day like 1,2,3,4,6,12,24
DUMP_KEEPING_DAYS=30
DUMP_PER_DAY=4

# Build time
SETUP_CUSTOMER=$SETUP_CUSTOMER
MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 16)
SYNC_TOOL_PATH=./../dataset

#env
PORT=8888

JWT_SECRET=$JWT_SECRET
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD

#apps
DATALAKE=2E7GG9DZB7J8G45
STUDIO=ZQ9YR6HDFGFRJKQ
SSO=1RMBHCWM8QIJ6QH
DATASET=8F7TT5VB77K0GGH

BASE_URL=https://accounts.$SETUP_CUSTOMER.layernext.ai
FRONT_END_BASE_URL=https://accounts.$SETUP_CUSTOMER.layernext.ai
ANNO_INTERNAL_SERVER=http://host.docker.internal:8080

#support email sendgrid
SUPPORT_EMAIL=$SUPPORT_EMAIL
SENDGRID_API_KEY=$SENDGRID_API_KEY

# Google login
GOOGLE_API_KEY=$GOOGLE_API_KEY
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN=$GOOGLE_REFRESH_TOKEN
EOL


# generate datalake env
datalake_env="./datalake/.env"
if [ -f $datalake_env ]; then
  echo "Existing env file found for datalake. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $datalake_env <<EOL
#DB
DB_HOST=host.docker.internal
DB_PORT=37017
DB_USER=datalake_user
DB_PASS=$(openssl rand -hex 10)
DATABASE=datalakeDB

#DUMP
DUMP_USER=layernext_dumprestoreuser
DUMP_USER_PWD=$(openssl rand -hex 10)
OUTPUT_DIRECTORY=datalake
#change dump keepeing days as prefer and use dump per day like 1,2,3,4,6,12,24
DUMP_KEEPING_DAYS=30
DUMP_PER_DAY=4

# Build time
SETUP_CUSTOMER=$SETUP_CUSTOMER
MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 16)
CPU_LIMIT=$CPU_LIMIT
MEMORY_LIMIT=$MEMORY_LIMIT

#server
INSTANCE_TYPE=master

#env
PORT=3000

JWT_SECRET=$JWT_SECRET

# Auth
SSO_INTERNAL_SERVER=http://host.docker.internal:8888

# studio
ANNO_INTERNAL_SERVER=http://host.docker.internal:8080

# storage
STORAGE_TYPE=$STORAGE_TYPE

#S3
AWS_ACCESS_KEY=$AWS_ACCESS_KEY
AWS_SECRET_KEY=$AWS_SECRET_KEY
AWS_REGION=$AWS_REGION
AWS_BUCKET_NAME=$AWS_BUCKET_NAME

#GCP
GCP_KEY_FILE_PATH=$GCP_KEY_FILE_PATH
GCP_PROJECT_ID=$GCP_PROJECT_ID

#AZURE
AZURE_ACCOUNT_NAME=$AZURE_ACCOUNT_NAME
AZURE_STORAGE_ACCOUNT_KEY=$AZURE_STORAGE_ACCOUNT_KEY

#BUCKETS
DEFAULT_BUCKET_NAME=$DEFAULT_BUCKET_NAME
ALL_BUCKETS=$ALL_BUCKETS

# Enabling optional features
SUBSEQUENT_CRAWL=$SUBSEQUENT_CRAWL

EOL


# generate dataset env
dataset_env="./dataset/.env"
if [ -f $dataset_env ]; then
  echo "Existing env file found for dataset. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $dataset_env <<EOL
#DB
DB_HOST=host.docker.internal
DB_PORT=47017
DB_USER=dataset_user
DB_PASS=$(openssl rand -hex 10)
DATABASE=datasetDB

#DUMP
DUMP_USER=layernext_dumprestoreuser
DUMP_USER_PWD=$(openssl rand -hex 10)
OUTPUT_DIRECTORY=dataset
#change dump keepeing days as prefer and use dump per day like 1,2,3,4,6,12,24
DUMP_KEEPING_DAYS=30
DUMP_PER_DAY=4

# Build time
SETUP_CUSTOMER=$SETUP_CUSTOMER
MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 16)
CPU_LIMIT=$CPU_LIMIT
MEMORY_LIMIT=$MEMORY_LIMIT

#env
PORT=4000

JWT_SECRET=$JWT_SECRET

BASE_URL=https://dataset.$SETUP_CUSTOMER.layernext.ai
API_URL=https://api.$SETUP_CUSTOMER.layernext.ai
FRONT_END_BASE_URL=http://dataset.$SETUP_CUSTOMER.layernext.ai

SSO_INTERNAL_SERVER=http://host.docker.internal:8888
ANNO_INTERNAL_SERVER=http://host.docker.internal:8080
DATALAKE_INTERNAL_SERVER=http://host.docker.internal:3000

DATALAKE_BASE_URL=http://datalake.$SETUP_CUSTOMER.layernext.ai

EOL



# generate studio env
studio_env="./studio/.env"
if [ -f $studio_env ]; then
  echo "Existing env file found for studio. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $studio_env <<EOL
#DB
DB_HOST=host.docker.internal
DB_PORT=27017
DB_USER=studio_user
DB_PASS=$(openssl rand -hex 10)
DATABASE=studioDB

#DUMP
DUMP_USER=layernext_dumprestoreuser
DUMP_USER_PWD=$(openssl rand -hex 10)
OUTPUT_DIRECTORY=studio
#change dump keepeing days as prefer and use dump per day like 1,2,3,4,6,12,24
DUMP_KEEPING_DAYS=30
DUMP_PER_DAY=4

# Build time
SETUP_CUSTOMER=$SETUP_CUSTOMER
MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 16)
CPU_LIMIT=$CPU_LIMIT
MEMORY_LIMIT=$MEMORY_LIMIT

#For uploadx listener
EXPRESS_PORT=8082

JWT_SECRET = $JWT_SECRET

# Auth
SSO_INTERNAL_SERVER=http://host.docker.internal:8888

PYTHON_BASE_URL=http://host.docker.internal:8081
BASE_URL=https://studio.$SETUP_CUSTOMER.layernext.ai
PYTHON_SERVER=../../../contents/uploads/
FRONT_END_BASE_URL=https://studio.$SETUP_CUSTOMER.layernext.ai
DATALAKE_INTERNAL_SERVER=http://host.docker.internal:3000
DATALAKE_BASE_URL=http://host.docker.internal:3000
# DATALAKE_BASE_URL=https://datalake.$SETUP_CUSTOMER.layernext.ai
API_URL=https://api.$SETUP_CUSTOMER.layernext.ai

#support email sendgrid
SUPPORT_EMAIL=$SUPPORT_EMAIL
SENDGRID_API_KEY=$SENDGRID_API_KEY

# Google login
GOOGLE_API_KEY=$GOOGLE_API_KEY
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN=$GOOGLE_REFRESH_TOKEN

# Enabling optional features
RESET_ASSIGNEE_ON_NEW_CYCLE=$RESET_ASSIGNEE_ON_NEW_CYCLE

EOL


# generate ssl creator nginx env
ssl_nginx_env="./accounts/nginxData/.env"
if [ -f $ssl_nginx_env ]; then
  echo "Existing env file found for ssl nginx. replacing..."
fi
cat > $ssl_nginx_env <<EOL
# Build time
SETUP_CUSTOMER=$SETUP_CUSTOMER

EOL

pip install python-dotenv

