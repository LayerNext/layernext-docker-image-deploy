1) create dump-restore user if not generated through docker setup

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

2) pip install python-dotenv & pip install boto3 if not generated through docker setup

3) example .env file in each app (datalake/.env) if not generated through docker setup

DB_PORT=XXXX
DATABASE=XXXXX
DUMP_USER=USER
DUMP_USER_PWD=PASSWORD
OUTPUT_DIRECTORY=datalake
SES_AWS_ACCESS_KEY_ID=XXXXX
SES_AWS_SECRET_ACCESS_KEY=XXXXX
SES_AWS_REGION=us-east-1
AWS_BUCKET_NAME=layernext-datalake-dev
DUMP_KEEPING_DAYS=30
DUMP_PER_DAY=4
SUPPORT_EMAIL
RECEIVER_EMAILS = ["tharinduimalka@zoomi.ca"]
SETUP_CUSTOMER

5) crontab setup in each app (datalake/crontab.sh)
bash crontab.sh after creating all above .env variables
