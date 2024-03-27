#!/bin/bash

export $(grep -v '^#' .env | xargs -d '\n')
JWT_SECRET=$(openssl rand -hex 32)

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
TEAM_ID=6374c3decb468b7a7a68a116

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

DB_CPU_LIMIT=$DL_DB_CPU_LIMIT
DB_MEMORY_LIMIT=$DL_DB_MEMORY_LIMIT

NODE_CPU_LIMIT=$DL_NODE_CPU_LIMIT
NODE_MEMORY_LIMIT=$DL_NODE_MEMORY_LIMIT

FLASK_CPU_LIMIT=$DL_FLASK_CPU_LIMIT
FLASK_MEMORY_LIMIT=$DL_FLASK_MEMORY_LIMIT

#server
INSTANCE_TYPE=master

#env
PORT=3000
TEAM_ID=6374c3decb468b7a7a68a116

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
OTHER_BUCKETS=$OTHER_BUCKETS

# Enabling optional features
SUBSEQUENT_CRAWL=$SUBSEQUENT_CRAWL

# Vecttor Database
VECTOR_DB_CONNECTION=enable
VECTOR_DB_HOST=host.docker.internal
VECTOR_DB_PORT=19530
VECTOR_DB_USER=root
VECTOR_DB_PASS=Milvus
VECTOR_DB_NAME=LayerNext
SIMILARITY_SCORE_THRESHOLD=0.65

PYTHON_BASE_URL=http://host.docker.internal:3100

API_URL=https://api.$SETUP_CUSTOMER.layernext.ai

#api key secrets
DATALAKE_KEY=$DATALAKE_KEY
DATALAKE_SECRET=$DATALAKE_SECRET

OPENAI_API_KEY=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

AIRBYTE_URL=http://host.docker.internal:8000
AIRBYTE_USER_NAME=zoomi-airbyte
AIRBYTE_PASSWORD=z00Mi$]PY4Ju]

#ConnectionDB
CONNECTION_DB_HOST=host.docker.internal
CONNECTION_DB_HOST_AIRBYTE=localhost
CONNECTION_DB_PORT=38017
CONNECTION_DB_USER=connection_user
CONNECTION_DB_PASS=$(openssl rand -hex 10)
CONNECTION_DATABASE=connectionDB
CONNECTION_DUMP_USER=connection_dumprestoreuser
CONNECTION_DUMP_USER_PWD=$(openssl rand -hex 10)
CONNECTION_MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 16)
CONNECTION_MYSQL_DB_HOST_AIRBYTE=localhost
CONNECTION_MYSQL_DB_HOST=host.docker.internal
CONNECTION_MYSQL_DB_PORT=3406
MYSQL_ROOT_PASSWORD=$(openssl rand -hex 16)
MYSQL_DATABASE=connectiondb
MYSQL_USER=connection_user
MYSQL_PASSWORD=$(openssl rand -hex 10)

WORK_SPACE_ID=
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


# generate source env
source_env="./source/.env"
if [ -f $source_env ]; then
  echo "Existing env file found for source. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $source_env <<EOL
VERSION=0.50.40

# When using the airbyte-db via default docker image
CONFIG_ROOT=/data
DATA_DOCKER_MOUNT=airbyte_data
DB_DOCKER_MOUNT=airbyte_db

# Workspace storage for running jobs (logs, etc)
WORKSPACE_ROOT=/tmp/workspace
WORKSPACE_DOCKER_MOUNT=airbyte_workspace


LOCAL_ROOT=/tmp/airbyte_local
LOCAL_DOCKER_MOUNT=/tmp/airbyte_local

HACK_LOCAL_ROOT_PARENT=/tmp

# Proxy Configuration
# Set to empty values, e.g. "" to disable basic auth
BASIC_AUTH_USERNAME=zoomi-airbyte
BASIC_AUTH_PASSWORD=z00Mi$]PY4Ju]
BASIC_AUTH_PROXY_TIMEOUT=900

### DATABASE ###
DATABASE_USER=docker
DATABASE_PASSWORD=docker
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_DB=airbyte
DATABASE_URL=jdbc:postgresql://db:5432/airbyte
JOBS_DATABASE_MINIMUM_FLYWAY_MIGRATION_VERSION=0.40.26.001

# Airbyte Internal Config Database, defaults to Job Database if empty. Explicitly left empty to mute docker compose warnings.
CONFIG_DATABASE_USER=
CONFIG_DATABASE_PASSWORD=
CONFIG_DATABASE_URL=
CONFIGS_DATABASE_MINIMUM_FLYWAY_MIGRATION_VERSION=0.40.23.002

### AIRBYTE SERVICES ###
TEMPORAL_HOST=airbyte-temporal:7233
INTERNAL_API_HOST=airbyte-server:8001
INTERNAL_API_URL=http://airbyte-server:8001
CONNECTOR_BUILDER_API_HOST=airbyte-connector-builder-server:80
WEBAPP_URL=http://localhost:8000/
# Although not present as an env var, required for webapp configuration.
CONNECTOR_BUILDER_API_URL=/connector-builder-api
AIRBYTE_API_HOST=airbyte-api-server:8006

### JOBS ###
# Relevant to scaling.
SYNC_JOB_MAX_ATTEMPTS=3
SYNC_JOB_MAX_TIMEOUT_DAYS=3
SYNC_JOB_INIT_RETRY_TIMEOUT_MINUTES=5
JOB_MAIN_CONTAINER_CPU_REQUEST=
JOB_MAIN_CONTAINER_CPU_LIMIT=
JOB_MAIN_CONTAINER_MEMORY_REQUEST=
JOB_MAIN_CONTAINER_MEMORY_LIMIT=

NORMALIZATION_JOB_MAIN_CONTAINER_MEMORY_LIMIT=
NORMALIZATION_JOB_MAIN_CONTAINER_MEMORY_REQUEST=
NORMALIZATION_JOB_MAIN_CONTAINER_CPU_LIMIT=
NORMALIZATION_JOB_MAIN_CONTAINER_CPU_REQUEST=

### LOGGING/MONITORING/TRACKING ###
TRACKING_STRATEGY=segment
SEGMENT_WRITE_KEY=7UDdp5K55CyiGgsauOr2pNNujGvmhaeu
JOB_ERROR_REPORTING_STRATEGY=logging
# Although not present as an env var, expected by Log4J configuration.
LOG_LEVEL=INFO


### APPLICATIONS ###
# Worker #
WORKERS_MICRONAUT_ENVIRONMENTS=control-plane
# Cron #
CRON_MICRONAUT_ENVIRONMENTS=control-plane
# Relevant to scaling.
MAX_SYNC_WORKERS=5
MAX_SPEC_WORKERS=5
MAX_CHECK_WORKERS=5
MAX_DISCOVER_WORKERS=5
MAX_NOTIFY_WORKERS=5
SHOULD_RUN_NOTIFY_WORKFLOWS=true
# Temporal Activity configuration
ACTIVITY_MAX_ATTEMPT=
ACTIVITY_INITIAL_DELAY_BETWEEN_ATTEMPTS_SECONDS=
ACTIVITY_MAX_DELAY_BETWEEN_ATTEMPTS_SECONDS=
WORKFLOW_FAILURE_RESTART_DELAY_SECONDS=

### FEATURE FLAGS ###
AUTO_DISABLE_FAILING_CONNECTIONS=false

FEATURE_FLAG_CLIENT=config

### MONITORING FLAGS ###
PUBLISH_METRICS=false
# Accepted values are datadog and otel (open telemetry)
METRIC_CLIENT=
# Useful only when metric client is set to be otel. Must start with http:// or https://.
OTEL_COLLECTOR_ENDPOINT="http://host.docker.internal:4317"
# Useful only when metric client is set to be datadog.
DD_AGENT_HOST=
DD_DOGSTATSD_PORT=
# Useful only when enabling Micrometer metrics
MICROMETER_METRICS_ENABLED=false
MICROMETER_METRICS_STATSD_FLAVOR=
STATSD_HOST=
STATSD_PORT=

AUTO_DETECT_SCHEMA=true

SECRET_PERSISTENCE=TESTING_CONFIG_DB_TABLE

# To test local catalog changes, set the below variable to the path of your local catalog.
LOCAL_CONNECTOR_CATALOG_PATH=
EOL


# generate chat env
source_env="./chat/.env"
if [ -f $source_env ]; then
  echo "Existing env file found for chat. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $source_env <<EOL
#DB
DB_HOST=host.docker.internal
DB_PORT=61017
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
OPENAI_API_KEY=
LLM_TYPE=openai
#MODEL=gpt-4-1106-preview
MODEL=gpt-4-0125-preview
API_KEY=key_z3fpungyhn15jqpz6ar267g1yp5fyc90
SECRET_KEY=7p2pnxqbi6441gdyfec5
URL=https://api.$SETUP_CUSTOMER.layernext.ai
APP_PORT=5082
DEBUG=False
COUNT_TOKENS=True
COMPANY=demo
#COMPANY=pdrmax
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

