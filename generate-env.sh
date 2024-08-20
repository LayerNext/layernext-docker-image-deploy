#!/bin/bash

export $(grep -v '^#' .env | xargs -d '\n')
JWT_SECRET=$(openssl rand -hex 32)

# Generating random keys
DATALAKE_KEY=key_$(openssl rand -base64 60 | tr -dc 'a-z0-9' | head -c 32)
DATALAKE_SECRET=$(openssl rand -base64 45 | tr -dc 'a-z0-9' | head -c 20)
CHAT_KEY=key_$(openssl rand -base64 60 | tr -dc 'a-z0-9' | head -c 32)
CHAT_SECRET=$(openssl rand -base64 45 | tr -dc 'a-z0-9' | head -c 20)

# generate accounts env
accounts_env="./accounts/.env"
if [ -f $accounts_env ]; then
  echo "Existing env file found for accounts. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $accounts_env <<EOL
#DB
DB_HOST=sso_mongodb
DB_PORT=27017
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
TEAM_ID=6374c3decb468b7a7a68a116

JWT_SECRET=$JWT_SECRET
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD_ENCRYPT

#apps
DATALAKE=2E7GG9DZB7J8G45
STUDIO=ZQ9YR6HDFGFRJKQ
SSO=1RMBHCWM8QIJ6QH
DATASET=8F7TT5VB77K0GGH

BASE_URL=https://accounts.$SETUP_CUSTOMER.layernext.ai
FRONT_END_BASE_URL=https://accounts.$SETUP_CUSTOMER.layernext.ai
ANNO_INTERNAL_SERVER=http://host.docker.internal:8080

ENVIRONMENT=enterprise

#support email sendgrid
SUPPORT_EMAIL=$SUPPORT_EMAIL
SENDGRID_API_KEY=$SENDGRID_API_KEY

# Google login
GOOGLE_API_KEY=$GOOGLE_API_KEY
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN=$GOOGLE_REFRESH_TOKEN

#api key secrets
STUDIO_KEY=$STUDIO_KEY
STUDIO_SECRET=$STUDIO_SECRET
DATASET_KEY=$DATASET_KEY
DATASET_SECRET=$DATASET_KEY
ANALYTICS_KEY=$ANALYTICS_KEY
ANALYTICS_SECRET=$ANALYTICS_SECRET
DATALAKE_KEY=$DATALAKE_KEY
DATALAKE_SECRET=$DATALAKE_SECRET
CHAT_KEY=$CHAT_KEY
CHAT_SECRET=$CHAT_SECRET
EOL

# generate datalake env
datalake_env="./datalake/.env"
if [ -f $datalake_env ]; then
  echo "Existing env file found for datalake. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $datalake_env <<EOL
#DB
DB_HOST=datalake_mongodb
DB_PORT=27017
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

# Database
DB_CPU_LIMIT=$CPU_LIMIT
DB_MEMORY_LIMIT=$MEMORY_LIMIT

NODE_CPU_LIMIT=$CPU_LIMIT
NODE_MEMORY_LIMIT=$MEMORY_LIMIT

FLASK_CPU_LIMIT=$CPU_LIMIT
FLASK_MEMORY_LIMIT=$MEMORY_LIMIT

#server
INSTANCE_TYPE=master

#env
PORT=3000
TEAM_ID=6374c3decb468b7a7a68a116

JWT_SECRET=$JWT_SECRET

# Auth
SSO_INTERNAL_SERVER=http://sso_node_backend:8888

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

#LOCAL_STORAGE
LOCAL_STORAGE_PATH=$LOCAL_STORAGE_PATH

#BUCKETS
DEFAULT_BUCKET_NAME=$DEFAULT_BUCKET_NAME
ALL_BUCKETS=$ALL_BUCKETS

# Enabling optional features
SUBSEQUENT_CRAWL=$SUBSEQUENT_CRAWL

#CONNECTION DB
CONNECTION_DB_HOST=datalake_connection_mongodb
CONNECTION_DB_HOST_AIRBYTE=localhost
CONNECTION_DB_PORT=38017
CONNECTION_DB_USER=connection_user
CONNECTION_DB_PASS=$(openssl rand -hex 10)
CONNECTION_DATABASE=connectionDB
CONNECTION_DUMP_USER=connection_dumprestoreuser
CONNECTION_DUMP_USER_PWD=$(openssl rand -hex 10)
CONNECTION_MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 16)
CONNECTION_MYSQL_DB_HOST_AIRBYTE=localhost
CONNECTION_MYSQL_DB_HOST=datalake_connection_mysql
CONNECTION_MYSQL_DB_PORT=3406
MYSQL_ROOT_PASSWORD=$(openssl rand -hex 16)
MYSQL_DATABASE=connectiondb
MYSQL_USER=connection_user
MYSQL_PASSWORD=$(openssl rand -hex 10)

#NEW KEYS ADDED HERE
LLM_API_PROVIDER=openai
LLM_API_KEY=$OPENAI_API_KEY
MODEL_ELEM_SEARCH=gpt-4o
MODEL_DATA_EXTRACTION=gpt-4o

AIRBYTE_URL=http://host.docker.internal:8000
AIRBYTE_USER_NAME=zoomi-airbyte
AIRBYTE_PASSWORD=z00Mi$]PY4Ju]

DATALAKE_KEY=$DATALAKE_KEY
DATALAKE_SECRET=$DATALAKE_SECRET

TEXT_SIMILARITY_THRESHOLD=0.75

PYTHON_BASE_URL=http://datalake_flask_backend:3100
API_URL=https://api.$SETUP_CUSTOMER.layernext.ai

# Vecttor Database
VECTOR_DB_CONNECTION=enable
VECTOR_DB_HOST=host.docker.internal
VECTOR_DB_PORT=19530
VECTOR_DB_USER=root
VECTOR_DB_PASS=Milvus
VECTOR_DB_NAME=LayerNext
SIMILARITY_SCORE_THRESHOLD=0.65

if [ -z "$LOCAL_STORAGE_PATH" ]; then
    LOCAL_STORAGE_PATH="/home/ubuntu/layernext-docker-deploy"
    DEFAULT_BUCKET_NAME_FOR_LOCAL_STORAGE="default_bucket"
else
    LOCAL_STORAGE_PATH=$LOCAL_STORAGE_PATH
    DEFAULT_BUCKET_NAME_FOR_LOCAL_STORAGE=$BUCKET_NAME_FROM_LOCAL_STORAGE_PATH
fi
EOL

# generate chat env
source_env="./chat/.env"
if [ -f $source_env ]; then
  echo "Existing env file found for chat. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $source_env <<EOL
#DB
DB_HOST=chat_mongodb
DB_PORT=27017
DB_USER=chat_user
DB_PASS=$(openssl rand -hex 10)
DATABASE=chatDB

#DUMP
DUMP_USER=layernext_dumprestoreuser
DUMP_USER_PWD=$(openssl rand -hex 10)

#change dump keepeing days as prefer and use dump per day like 1,2,3,4,6,12,24
DUMP_KEEPING_DAYS=30
DUMP_PER_DAY=4

# Build time
SETUP_CUSTOMER=$SETUP_CUSTOMER
MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 20)

DB_CPU_LIMIT=2
DB_MEMORY_LIMIT=3GB

JWT_SECRET = $JWT_SECRET

#LLM FAST-API
#OPENAI_API_KEY=sk-proj-O9R3ufvQNujKsyiKjDNBT3BlbkFJWyx7YvrEjl2gudUymgAm
LLM_TYPE=openai

LLM_API_KEY=$OPENAI_API_KEY
LLM_API_PROVIDER=openai
MODEL=gpt-4-0125-preview
MODEL_INSIGHT=gpt-4-0125-preview

API_KEY=key_z3fpungyhn15jqpz6ar267g1yp5fyc90
SECRET_KEY=7p2pnxqbi6441gdyfec5
URL=http://datalake_node_backend:3000

APP_PORT=5082
DEBUG=False
COUNT_TOKENS=True

#COMPANY=$SETUP_CUSTOMER

COMPANY=super_lube
#limitation
FAST_CPU_LIMIT=2
FAST_MEMORY_LIMIT=2GB

#Sendgrid credentails
SUPPORT_EMAIL=$SUPPORT_EMAIL
SENDGRID_API_KEY=$SENDGRID_API_KEY

FRONTEND_URL=https://chat.$SETUP_CUSTOMER.layernext.ai
METALAKE_URL=https://datalake.$SETUP_CUSTOMER.layernext.ai

#api key secrets
API_KEY=$CHAT_KEY
SECRET_KEY=$CHAT_SECRET
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