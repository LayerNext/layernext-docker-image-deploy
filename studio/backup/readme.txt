1) create dump-restore user

mongo --port XXXX
use admin
db.auth("","")


db.createUser(
  {
    user: "USER",
    pwd: "PASSWORD",
    roles: [ "backup", "restore"]
  }
)

2) pip install python-dotenv & pip install boto3


3) example .env file

MONGODB_PORT=XXXX
MONGODB_DATABASE=XXXXX
MONGODB_USER=USER
MONGODB_PWD=PASSWORD
LOG_FILE=/home/annotation.manager.dev/dump-datalake/logs/backup.log
LOG_DIRECTORY=/home/annotation.manager.dev/dump-datalake/logs
OUTPUT_DIRECTORY=/home/annotation.manager.dev/dump-datalake
DUMP_NAME=datalake_dump
AWS_ACCESS_KEY=XXXXX
AWS_SECRET_KEY=XXXXX
AWS_REGION=us-east-1
AWS_BUCKET_NAME=layerx-datalake-dev
DUMP_KEEPING_DAYS=30
DUMP_PER_DAY=4

4)
enter .env path in both dump.sh and dump.py files
  eg dump.sh- export $(grep -v '^#' /home/annotation.manager.dev/dump-datalake/.env | xargs -d '\n')
  eg dump.py- load_dotenv('/home/annotation.manager.dev/dump-datalake/.env')

5) crontab setup
eg- 0 * * * * python3 /home/annotation.manager.dev/dump-datalake/dump.py


