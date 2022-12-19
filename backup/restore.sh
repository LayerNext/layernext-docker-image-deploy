

export $(grep -v '^#' /home/annotation.manager.dev/dataLake-dev/datalake/datalake-nodejs/backup/.env | xargs -d '\n')

function initStaticParams
{
  LOG_MESSAGE_ERROR=1
  LOG_MESSAGE_WARN=2
  LOG_MESSAGE_INFO=3
  LOG_MESSAGE_DEBUG=4
  LOG_LEVEL=$LOG_MESSAGE_DEBUG
  SCRIPT=`readlink -f ${BASH_SOURCE[0]}`
  ABSOLUTE_SCRIPT_PATH=$(cd `dirname "$SCRIPT"` && pwd)
}
initStaticParams

mkdir -p $LOG_DIRECTORY

echo "`date +'%Y-%m-%dT%H:%M:%S.%3N'` restore start" >> $LOG_FILE

mongorestore --port=$MONGODB_PORT --authenticationDatabase=admin --username=$MONGODB_USER --password=$MONGODB_PWD --db=$MONGODB_DATABASE --gzip --archive="datalake_dump_2022-12-19T00.gz" --nsFrom='datalakeDB.*' --nsTo='restore_test_1.*' --gzip  2>> $LOG_FILE


echo "`date +'%Y-%m-%dT%H:%M:%S.%3N'` restore end" >> $LOG_FILE

