#!/bin/bash

export $(grep -v '^#' .env | xargs -d '\n')
JWT_SECRET=$(openssl rand -hex 32)

# Two identity modes.
#
#   CENTRAL_SSO=false (default) - this box runs its own accounts stack. It mints
#   its own RSA key pair and its own app key/secret pairs, and is self-contained.
#
#   CENTRAL_SSO=true - identity lives in the shared central SSO. This box never
#   signs a token, only verifies, so it takes the central PUBLIC key and the app
#   key/secret pairs the central SSO already stores for this tenant. Generating
#   either one here would produce a box that boots cleanly and then rejects every
#   request, which is a much harder failure to read than an abort.
CENTRAL_SSO="${CENTRAL_SSO:-false}"

# The admin User _id. Owned by the central SSO when there is one, and supplied
# per-tenant; otherwise the fixed constant accounts/mongo-init.js seeds locally.
ONBOARDED_USER_ID="${ONBOARDED_USER_ID:-6374c47ecb468b7a7a68a117}"

# Enterprise tenants. BILLING_PLAN is the switch: empty -- which is every
# ordinary install -- and the chat seed writes no billing record and leaves
# onboarding to run from the beginning. Set, and the tenant is seeded with an
# entitlement for that plan and onboarding already marked complete, because an
# enterprise tenant has no Stripe subscription and no QuickBooks connection to
# derive either from.
# Chat model access. OPENROUTER_API_URL has a working default; the two keys are
# per-tenant and arrive from the bundle.
OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-}"
OPENROUTER_API_URL="${OPENROUTER_API_URL:-https://openrouter.ai/api/v1}"
SONIOX_API_KEY="${SONIOX_API_KEY:-}"

BILLING_PLAN="${BILLING_PLAN:-}"
BILLING_CURRENCY="${BILLING_CURRENCY:-USD}"
COMPANY_TIMEZONE="${COMPANY_TIMEZONE:-America/Winnipeg}"

if [ "$CENTRAL_SSO" = "true" ]; then
  # A PEM has newlines, and the export above splits on newlines, so the key
  # travels through the root .env base64-encoded on a single line.
  if [ -n "$CENTRAL_JWT_PUBLIC_KEY_B64" ]; then
    CENTRAL_JWT_PUBLIC_KEY=$(printf '%s' "$CENTRAL_JWT_PUBLIC_KEY_B64" | base64 -d)
  fi

  if [ -z "$CENTRAL_JWT_PUBLIC_KEY" ]; then
    echo "CENTRAL_SSO=true but no central public key was supplied." >&2
    echo "Set CENTRAL_JWT_PUBLIC_KEY_B64 in .env. Refusing to continue: without it" >&2
    echo "this box would trust no token the central SSO issues." >&2
    exit 1
  fi

  for required_key in DATALAKE_KEY DATALAKE_SECRET CHAT_KEY CHAT_SECRET; do
    if [ -z "${!required_key}" ]; then
      echo "CENTRAL_SSO=true requires $required_key to come from the central SSO." >&2
      echo "Refusing to generate one: it would not match the ApiKey record there." >&2
      exit 1
    fi
  done

  JWT_PUBLIC_KEY="$CENTRAL_JWT_PUBLIC_KEY"
  SSO_INTERNAL_SERVER_URL="${SSO_URL:-https://accounts.layernext.ai}"
  echo "Central SSO mode: using the central public key; no local key pair, no accounts stack."
else
  # JWT RS256 key pair.
  # The SSO/accounts backend signs session tokens with the PRIVATE key (mounted at
  # /usr/src/app/secrets/jwt_private.pem via accounts/docker-compose.yml). The
  # verifiers (datalake, chat) receive the PUBLIC key as their JWT_SECRET.
  # A fresh key pair is generated per install (per-tenant). Reused on re-run.
  JWT_KEY_DIR="./accounts/sso-layernext-backend/secrets"
  mkdir -p "$JWT_KEY_DIR"
  if [ ! -f "$JWT_KEY_DIR/jwt_private.pem" ]; then
    openssl genrsa -out "$JWT_KEY_DIR/jwt_private.pem" 2048
    openssl rsa -in "$JWT_KEY_DIR/jwt_private.pem" -pubout -out "$JWT_KEY_DIR/jwt_public.pem"
    echo "Generated JWT RS256 key pair in $JWT_KEY_DIR"
  else
    echo "Existing JWT key pair found in $JWT_KEY_DIR, reusing."
  fi
  JWT_PUBLIC_KEY=$(cat "$JWT_KEY_DIR/jwt_public.pem")

  # Generating random keys
  DATALAKE_KEY=key_$(openssl rand -base64 60 | tr -dc 'a-z0-9' | head -c 32)
  DATALAKE_SECRET=$(openssl rand -base64 45 | tr -dc 'a-z0-9' | head -c 20)
  CHAT_KEY=key_$(openssl rand -base64 60 | tr -dc 'a-z0-9' | head -c 32)
  CHAT_SECRET=$(openssl rand -base64 45 | tr -dc 'a-z0-9' | head -c 20)

  SSO_INTERNAL_SERVER_URL="http://sso_node_backend:8888"
fi
GRAFANA_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-z0-9' | head -c 20)

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
TEAM_ID=$TEAM_ID

JWT_SECRET=$JWT_SECRET
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_FIRST_NAME=$ADMIN_FIRST_NAME
ADMIN_LAST_NAME=$ADMIN_LAST_NAME
ADMIN_PASSWORD=$ADMIN_PASSWORD_ENCRYPT

#apps
DATALAKE=2E7GG9DZB7J8G45
STUDIO=ZQ9YR6HDFGFRJKQ
SSO=1RMBHCWM8QIJ6QH
DATASET=8F7TT5VB77K0GGH

MAXIMUM_AVAILABLE_SEATS=2

BASE_URL=https://$ACCOUNTS_DOMAIN_URL
FRONT_END_BASE_URL=https://$ACCOUNTS_DOMAIN_URL
ANNO_INTERNAL_SERVER=http://host.docker.internal:8080

ENVIRONMENT=enterprise

#support email sendgrid
SUPPORT_EMAIL=$SUPPORT_EMAIL
SENDGRID_API_KEY=$SENDGRID_API_KEY
SES_AWS_REGION=$SES_AWS_REGION
SES_AWS_ACCESS_KEY_ID=$SES_AWS_ACCESS_KEY_ID
SES_AWS_SECRET_ACCESS_KEY=$SES_AWS_SECRET_ACCESS_KEY

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

LOG_BACKUP_COUNT=90

DOMAIN_URL=$DOMAIN_URL
INSTALLATION_UUID=$INSTALLATION_UUID
ONE_TIME_TOKEN=$ONE_TIME_TOKEN
CMS_TOKEN=$CMS_TOKEN
ACCOUNTS_DOMAIN_URL=$ACCOUNTS_DOMAIN_URL
CHAT_DOMAIN_URL=$CHAT_DOMAIN_URL
DATALAKE_DOMAIN_URL=$DATALAKE_DOMAIN_URL
API_DOMAIN_URL=$API_DOMAIN_URL

CMS_DOMAIN_URL=$CMS_DOMAIN_URL

AWS_BUCKET_NAME=$AWS_BUCKET_NAME

# Session JWT (RS256). The SSO backend signs session tokens with the private
# key mounted at JWT_PRIVATE_KEY_PATH; verifiers use the public key.
NODE_ENV=
JWT_ALG=RS256
JWT_ISSUER=https://$ACCOUNTS_DOMAIN_URL
JWT_AUDIENCE=layernext-services
JWT_KID=
JWT_PRIVATE_KEY_PATH=/usr/src/app/secrets/jwt_private.pem
JWT_PUBLIC_KEY_PATH=/usr/src/app/secrets/jwt_public.pem
SESSION_TOKEN_EXPIRES_IN=86400
REFRESH_TOKEN_EXPIRES_IN=604800
ONBOARDING_GRANT_TTL_SECONDS=900
ONE_TIME_TOKEN_EXPIRES=3
CMS_URL=$CMS_DOMAIN_URL
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

# Database
DB_CPU_LIMIT=$CPU_LIMIT
DB_MEMORY_LIMIT=$MEMORY_LIMIT

# Limits
CPU_LIMIT=$CPU_LIMIT
MEMORY_LIMIT=$MEMORY_LIMIT

NODE_CPU_LIMIT=$CPU_LIMIT
NODE_MEMORY_LIMIT=$MEMORY_LIMIT

FLASK_CPU_LIMIT=$CPU_LIMIT
FLASK_MEMORY_LIMIT=$MEMORY_LIMIT

#server
INSTANCE_TYPE=master

#env
PORT=3000
TEAM_ID=$TEAM_ID
GROUP_ID=$GROUP_ID
ONBOARDED_USER_ID=$ONBOARDED_USER_ID

# The chat application's key pair. Written to accounts and chat already; the
# datalake needs the same pair to call chat, and without it that call is
# unauthenticated rather than obviously broken.
CHAT_KEY=$CHAT_KEY
CHAT_SECRET=$CHAT_SECRET

# Session JWT verification (RS256): JWT_SECRET holds the RSA PUBLIC key (checked
# before JWT_PUBLIC_KEY by keys.ts).
JWT_SECRET="$JWT_PUBLIC_KEY"
JWT_PUBLIC_KEY="$JWT_PUBLIC_KEY"
JWT_VERIFY_ALGORITHM=RS256

# Auth
SSO_INTERNAL_SERVER=$SSO_INTERNAL_SERVER_URL

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
CONNECTION_DB_PORT=27017
CONNECTION_DB_USER=connection_user
CONNECTION_DB_PASS=$(openssl rand -hex 10)
CONNECTION_DATABASE=connectionDB
CONNECTION_DUMP_USER=connection_dumprestoreuser
CONNECTION_DUMP_USER_PWD=$(openssl rand -hex 10)
CONNECTION_MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 16)
CONNECTION_MYSQL_DB_HOST_AIRBYTE=localhost
CONNECTION_MYSQL_DB_HOST=datalake_connection_mysql
CONNECTION_MYSQL_DB_PORT=3306
MYSQL_ROOT_PASSWORD=$(openssl rand -hex 16)
MYSQL_DATABASE=connectiondb
MYSQL_USER=connection_user
MYSQL_PASSWORD=$(openssl rand -hex 10)

AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT

LLM_API_PROVIDER_DOC_METADATA_GENERATION=openai
LLM_API_KEY_DOC_METADATA_GENERATION=$TENANT_OPENAI_API_KEY

LLM_API_PROVIDER_DOC_STRUCTURE_GENERATION=openai
LLM_API_KEY_DOC_STRUCTURE=$TENANT_OPENAI_API_KEY

LLM_API_PROVIDER_ELEM_SEARCH=openai
LLM_API_KEY_ELEM_SEARCH=$TENANT_OPENAI_API_KEY

LLM_API_PROVIDER_DATA_EXTRACTION=openai
LLM_API_KEY_DATA_EXTRACTION=$TENANT_OPENAI_API_KEY

LLM_API_PROVIDER_DATA_SOURCE_OVERVIEW_GENERATOR=openai
LLM_API_KEY_DATA_SOURCE_OVERVIEW_GENERATOR=$TENANT_OPENAI_API_KEY
LLM_MODEL_FIELD_DESCRIPTION_GENERATION=gpt-4o-mini
LLM_FIELD_DESCRIPTION_GENERATION_MAX_TOKEN_LIMIT=16000

LLM_DATA_SOURCE_OVERVIEW_GENERATION_MAX_TOKEN_LIMIT=32000
LLM_MODEL_DATA_SOURCE_OVERVIEW_GENERATION=gpt-4.1
MODEL_DATABASE_TRANSFORMATION=gpt-4o

MODEL_DOC_METADATA_GENERATION=gpt-4o-mini
MODEL_DOC_STRUCTURE_GENERATION=gpt-4o
MODEL_ELEM_SEARCH=gpt-4o
MODEL_DATA_EXTRACTION=gpt-4o

MODEL_ELEM_SEARCH=gpt-4o
MODEL_DATA_EXTRACTION=gpt-4o

LLM_API_PROVIDER_AUTO_TUNER=openai
MODEL_AUTO_TUNER=gpt-4o
LLM_API_KEY_AUTO_TUNER=$TENANT_OPENAI_API_KEY
MODEL_DATABASE_TRANSFORMATION=gpt-4o

LOAD_FROM_FILE=False

#Evaluation
LLM_API_PROVIDER_ANSWER_EVALUATION=openai
LLM_API_KEY_ANSWER_EVALUATION=$TENANT_OPENAI_API_KEY
MODEL_ANSWER_EVALUATION=gpt-4o

LLM_API_PROVIDER_KNOWLEDGE_PROCESS=openai
LLM_API_KEY_KNOWLEDGE_PROCESS=$TENANT_OPENAI_API_KEY
MODEL_KNOWLEDGE_PROCESS=gpt-4.1
LLM_KNOWLEDGE_PROCESS_MAX_TOKEN_LIMIT=4000

DATALAKE_KEY=$DATALAKE_KEY
DATALAKE_SECRET=$DATALAKE_SECRET

TEXT_SIMILARITY_THRESHOLD=0.75

PYTHON_BASE_URL=http://datalake_flask_backend:3100
API_URL=https://$API_DOMAIN_URL

LOCAL_STORAGE_PATH=$LOCAL_STORAGE_PATH
LOG_BACKUP_COUNT=90
DOMAIN_URL=$DOMAIN_URL
LLM_AGENT_INTERNAL_URL=http://llm_fast_api_backend:5082

LOAD_TABLES_LIST=

ENABLE_WINDOWS_AUTH=false
KERBEROS_USER=
KERBEROS_PASSWORD=

ADDITIONAL_SCHEMAS=
INSTALLATION_UUID=$INSTALLATION_UUID
TENANT_OPENAI_API_KEY=$TENANT_OPENAI_API_KEY
QB_AT=$QB_AT
QB_RT=$QB_RT
QB_REALM_ID=$QB_REALM_ID
ACCOUNTS_DOMAIN_URL=$ACCOUNTS_DOMAIN_URL
CHAT_DOMAIN_URL=$CHAT_DOMAIN_URL
DATALAKE_DOMAIN_URL=$DATALAKE_DOMAIN_URL
API_DOMAIN_URL=$API_DOMAIN_URL
ADMIN_FIRST_NAME=$ADMIN_FIRST_NAME
ADMIN_LAST_NAME=$ADMIN_LAST_NAME

CMS_TOKEN=$CMS_TOKEN

QB_CLIENT_ID=$QB_CLIENT_ID
QB_CLIENT_SECRET=$QB_CLIENT_SECRET
QB_REDIRECT_URI=$QB_REDIRECT_URI
QB_ENV=$QB_ENV
QB_SCOPES=$QB_SCOPES
CMS_DOMAIN_URL=$CMS_DOMAIN_URL

# Fivetran Keys
FIVETRAN_API_KEY=$FIVETRAN_API_KEY
FIVETRAN_API_SECRET=$FIVETRAN_API_SECRET
FIVETRAN_GROUP_ID=$FIVETRAN_GROUP_ID

AWS_BUCKET_NAME=$AWS_BUCKET_NAME

# QuickBooks connection provider (fivetran | custom_elt)
QB_CONNECTION_PROVIDER=$QB_CONNECTION_PROVIDER

# Custom ELT (used when QB_CONNECTION_PROVIDER=custom_elt)
ELT_API_KEY=$ELT_API_KEY
ELT_API_SECRET=$ELT_API_SECRET
ELT_BASE_URL=$ELT_BASE_URL

# Transaction sync
TRANSACTION_SYNC_API_KEY=$TRANSACTION_SYNC_API_KEY
TRANSACTION_SYNC_API_SECRET=$TRANSACTION_SYNC_API_SECRET
TRANSACTION_SYNC_BASE_URL=$TRANSACTION_SYNC_BASE_URL

# Plaid
PLAID_CLIENT_ID=$PLAID_CLIENT_ID
PLAID_SECRET=$PLAID_SECRET
PLAID_ENV=$PLAID_ENV

# Flask API mode (enabled | disabled)
FLASK_API_MODE=$FLASK_API_MODE

# Node reads OTHER_BUCKETS (ALL_BUCKETS kept above for compatibility)
OTHER_BUCKETS=$ALL_BUCKETS
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

TEAM_ID=$TEAM_ID

# Enterprise tenant seeding. Read by chat/DB_initial_data/mongo-init.js.
BILLING_PLAN=$BILLING_PLAN
BILLING_CURRENCY=$BILLING_CURRENCY
COMPANY_TIMEZONE=$COMPANY_TIMEZONE

# Build time
SETUP_CUSTOMER=$SETUP_CUSTOMER
MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 20)

DB_CPU_LIMIT=$CPU_LIMIT
DB_MEMORY_LIMIT=$MEMORY_LIMIT

# Session JWT verification: JWT_SECRET holds the RSA PUBLIC key.
JWT_SECRET="$JWT_PUBLIC_KEY"

#LLM FAST-API
LLM_TYPE=openai

AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT
LLM_API_PROVIDER=openai
LLM_API_KEY=$AZURE_OPENAI_API_KEY
OPENAI_API_KEY=$TENANT_OPENAI_API_KEY
GEMINI_API_KEY=$GEMINI_API_KEY
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# OpenRouter, read by services/glm_client.py for the GLM models.
OPENROUTER_API_KEY=$OPENROUTER_API_KEY
OPENROUTER_API_URL=$OPENROUTER_API_URL

# Speech to text, read by services/soniox_service.py.
SONIOX_API_KEY=$SONIOX_API_KEY
AZURE_OPENAI_API_VERSION=2024-08-01-preview
TEMPERATURE=0.7
IS_OPENAI_PRIORITY_ENABLED=True
CODE_REVIEW_OFF=True

# Models aligned to the working 3.25.0 enterprise config (gnk reference).
# TX/complex/document analysis run on o3 (OpenAI); Gemini is used for
# unstructured/PDF/web-search. Anthropic is NOT used by default (ANTHROPIC_API_KEY
# may be left blank). To switch these three to Claude, set them to
# anthropic/claude-sonnet-4-5-20250929 and supply ANTHROPIC_API_KEY.
MODEL=gpt-4.1
MODEL_SQL_GENERATION=gpt-4.1
MODEL_PYTHON_CODING=glm/z-ai/glm-5.2
MODEL_DATA_LOCATE=gpt-4.1
MODEL_HYPOTHESIS=gpt-4o
MODEL_INSIGHT=gpt-4.1
MODEL_REPORT_GENERATOR=gpt-4.1
MODEL_JSON_OUTPUT=gpt-4.1
MODEL_DATA_REVIEWER=gpt-4.1
MODEL_DATA_GENERATOR=gpt-4.1
MODEL_UNSTRUCTURED_PROCESSING=gemini-3-flash-preview
MODEL_UNSTRUCTURED_LABEL_IDENTIFICATION=glm/z-ai/glm-5.2
MODEL_VISUAL_REVIEWER=gpt-4o
CODE_REVIEW_MODEL=gpt-4.1
MODEL_VISUAL_RENDER=gpt-4.1
MODEL_COMPLEX_ANALYSIS=glm/z-ai/glm-5.2
MODEL_EXCEL_UPDATER=glm/z-ai/glm-5.2
MODEL_KNOWLEDGE_GENERATION=glm/z-ai/glm-5.2
MODEL_TX_ANALYZER=glm/z-ai/glm-5.2
MODEL_DOCUMENT_DATA_QUERY=glm/z-ai/glm-5.2
MODEL_WEB_SEARCH=gemini-3-flash-preview
MODEL_PDF_EXTRACTOR_REVIEW=gemini-3-flash-preview
MODEL_PDF_VISUAL_EXTRACTOR=gemini-3-flash-preview

URL=http://datalake_node_backend:3000

# Auth
SSO_INTERNAL_SERVER=$SSO_INTERNAL_SERVER_URL

APP_PORT=5082
DEBUG=False
COUNT_TOKENS=True

COMPANY=$SETUP_CUSTOMER

#limitation
FAST_CPU_LIMIT=2
FAST_MEMORY_LIMIT=2GB

#Sendgrid credentails
SUPPORT_EMAIL=$SUPPORT_EMAIL
SENDGRID_API_KEY=$SENDGRID_API_KEY
SES_AWS_REGION=$SES_AWS_REGION
SES_AWS_ACCESS_KEY_ID=$SES_AWS_ACCESS_KEY_ID
SES_AWS_SECRET_ACCESS_KEY=$SES_AWS_SECRET_ACCESS_KEY

FRONTEND_URL=https://$CHAT_DOMAIN_URL
METALAKE_URL=https://$DATALAKE_DOMAIN_URL

#api key secrets
API_KEY=$CHAT_KEY
SECRET_KEY=$CHAT_SECRET
LOG_BACKUP_COUNT=90
DOMAIN_URL=$DOMAIN_URL

CLIENT_EMAILS=


SIMULTANEOUS_INSIGHT_INVOKES_LIMIT=2
INSIGHT_PARALLEL_THREAD_COUNT=5
DAILY_TRIGGER_HOUR=04 
DAILY_TRIGGER_MINUTE=10 
TIME_ZONE=America/Winnipeg

INSTALLATION_UUID=$INSTALLATION_UUID
ACCOUNTS_DOMAIN_URL=$ACCOUNTS_DOMAIN_URL
CHAT_DOMAIN_URL=$CHAT_DOMAIN_URL
DATALAKE_DOMAIN_URL=$DATALAKE_DOMAIN_URL
API_DOMAIN_URL=$API_DOMAIN_URL
CMS_DOMAIN_URL=$CMS_DOMAIN_URL
CMS_TOKEN=$CMS_TOKEN
ADMIN_FIRST_NAME=$ADMIN_FIRST_NAME
ADMIN_LAST_NAME=$ADMIN_LAST_NAME

# Tenant identity (GROUP_ID required for admin login; SUPER_ADMIN_ID optional)
GROUP_ID=$GROUP_ID
SUPER_ADMIN_ID=$SUPER_ADMIN_ID
# Seeded admin User _id. Central SSO supplies it per-tenant; falls back to the
# historical constant for a self-contained install.
ONBOARDED_USER_ID=$ONBOARDED_USER_ID

# LogoDev (institution logo enrichment)
LOGO_DEV_TOKEN=$LOGO_DEV_TOKEN
LOGO_DEV_SECRET_KEY=$LOGO_DEV_SECRET_KEY

# Transaction sync
TRANSACTION_SYNC_API_KEY=$TRANSACTION_SYNC_API_KEY
TRANSACTION_SYNC_API_SECRET=$TRANSACTION_SYNC_API_SECRET
TRANSACTION_SYNC_BASE_URL=$TRANSACTION_SYNC_BASE_URL

LOGGER_TTL_MINUTES=120

OUTPUT_DIRECTORY=chat
AWS_BUCKET_NAME=$AWS_BUCKET_NAME
EOL

# generate ssl creator nginx env
ssl_nginx_env="./accounts/nginxData/.env"
if [ -f $ssl_nginx_env ]; then
  echo "Existing env file found for ssl nginx. replacing..."
fi
cat > $ssl_nginx_env <<EOL
# Build time
SETUP_CUSTOMER=$SETUP_CUSTOMER
DOMAIN_URL=$DOMAIN_URL
ACCOUNTS_DOMAIN_URL=$ACCOUNTS_DOMAIN_URL
CHAT_DOMAIN_URL=$CHAT_DOMAIN_URL
DATALAKE_DOMAIN_URL=$DATALAKE_DOMAIN_URL
API_DOMAIN_URL=$API_DOMAIN_URL
CMS_DOMAIN_URL=$CMS_DOMAIN_URL
EOL


# generate monitoring env
monitoring_env="./monitoring/.env"
if [ -f $monitoring_env ]; then
  echo "Existing env file found for monitoring. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $monitoring_env <<EOL
GRAFANA_USERNAME=$GRAFANA_USERNAME
GRAFANA_PASSWORD=$GRAFANA_PASSWORD
SMTP_SMARTHOST='smtp.sendgrid.net:587'
SMTP_FROM=$SMTP_FROM
SMTP_AUTH_USERNAME='apiKey'
SMTP_AUTH_PASSWORD=$SENDGRID_API_KEY
SUPPORT_EMAIL=$ALERT_SUPPORT_MAIL
SETUP_CUSTOMER=$SETUP_CUSTOMER
EOL

# generate central accounts env
central_accounts_env="./central-accounts/.env"
if [ -f $central_accounts_env ]; then
  echo "Existing env file found for accounts. replacing..."
  echo "Warning: If the system was already built, the system may become non functional due to regeneration of db passwords"
fi
cat > $central_accounts_env <<EOL
#DB
DB_HOST=central_sso_mongodb
DB_PORT=27017
DB_USER=central_sso_user
DB_PASS=$(openssl rand -hex 10)
DATABASE=authDB

#DUMP
DUMP_USER=layernext_dumprestoreuser
DUMP_USER_PWD=$(openssl rand -hex 10)
OUTPUT_DIRECTORY=central-accounts
#change dump keepeing days as prefer and use dump per day like 1,2,3,4,6,12,24
DUMP_KEEPING_DAYS=30
DUMP_PER_DAY=4

# Build time
SETUP_CUSTOMER=$SETUP_CUSTOMER
MONGODB_ADMIN_PASSWORD=$(openssl rand -hex 16)
SYNC_TOOL_PATH=./../dataset

#env
PORT=8888
TEAM_ID=$TEAM_ID

JWT_SECRET=$JWT_SECRET
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_FIRST_NAME=$ADMIN_FIRST_NAME
ADMIN_LAST_NAME=$ADMIN_LAST_NAME
ADMIN_PASSWORD=$ADMIN_PASSWORD_ENCRYPT

#apps
DATALAKE=2E7GG9DZB7J8G45
STUDIO=ZQ9YR6HDFGFRJKQ
SSO=1RMBHCWM8QIJ6QH
DATASET=8F7TT5VB77K0GGH

MAXIMUM_AVAILABLE_SEATS=2

BASE_URL=https://$ACCOUNTS_DOMAIN_URL
FRONT_END_BASE_URL=https://$ACCOUNTS_DOMAIN_URL
ANNO_INTERNAL_SERVER=http://host.docker.internal:8080

ENVIRONMENT=enterprise

#support email sendgrid
SUPPORT_EMAIL=$SUPPORT_EMAIL
SENDGRID_API_KEY=$SENDGRID_API_KEY
SES_AWS_REGION=$SES_AWS_REGION
SES_AWS_ACCESS_KEY_ID=$SES_AWS_ACCESS_KEY_ID
SES_AWS_SECRET_ACCESS_KEY=$SES_AWS_SECRET_ACCESS_KEY

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

LOG_BACKUP_COUNT=90

DOMAIN_URL=$DOMAIN_URL
INSTALLATION_UUID=$INSTALLATION_UUID
ONE_TIME_TOKEN=$ONE_TIME_TOKEN
CMS_TOKEN=$CMS_TOKEN
ACCOUNTS_DOMAIN_URL=$ACCOUNTS_DOMAIN_URL
CHAT_DOMAIN_URL=$CHAT_DOMAIN_URL
DATALAKE_DOMAIN_URL=$DATALAKE_DOMAIN_URL
API_DOMAIN_URL=$API_DOMAIN_URL

CMS_DOMAIN_URL=$CMS_DOMAIN_URL

#central-sso
NODE_ENV=production
JWT_ALG=RS256
JWT_ISSUER=https://sso.layernext.ai
JWT_AUDIENCE=layernext-services
JWT_KID=QLisK1EGON4NLVb9A-0uvA
JWT_PRIVATE_KEY_PATH=/usr/src/app/secrets/jwt_private.pem
JWT_PUBLIC_KEY_PATH=/usr/src/app/secrets/jwt_public.pem
SESSION_TOKEN_EXPIRES_IN=3600
REFRESH_TOKEN_EXPIRES_IN=604800
ONBOARDING_GRANT_TTL_SECONDS=900
ONE_TIME_TOKEN_EXPIRES=3
EOL