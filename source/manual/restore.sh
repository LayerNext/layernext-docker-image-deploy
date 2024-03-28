LOG_FILE="/home/ubuntu/layernext-docker-image-deploy/source/manual/restore.log"
#!/bin/bash

# Load environment variables from .env file
set -a  # automatically export all variables
source /home/ubuntu/layernext-docker-image-deploy/source/manual/.env
set +a  # stop automatically exporting

mongorestore --drop --port=$CONNECTION_MONGO_PORT --authenticationDatabase=admin --username=$CONNECTION_MONGO_USERNAME --password=$CONNECTION_MONGO_PASSWORD --db=$CONNECTION_DB_NAME --gzip --archive=/home/ubuntu/db-dump/dump/dcchail_dump_`date +%d-%m-%Y`.gz --nsFrom='Dcchail.*' --nsTo='Dcchail.*' --gzip >> $LOG_FILE 2>&1



