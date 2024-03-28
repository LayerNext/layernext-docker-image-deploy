# Load environment variables from .env file
set -a  # automatically export all variables
source /home/ubuntu/layernext-docker-image-deploy/source/manual/.env
set +a  # stop automatically exporting

mongo admin --username $CONNECTION_MONGO_USERNAME --password $CONNECTION_MONGO_PASSWORD --authenticationDatabase admin --port $CONNECTION_MONGO_PORT /home/ubuntu/layernext-docker-image-deploy/source/manual/correct_db.js
