
PATH_ENV=$1
PATH_DIR=$2

export $(grep -v '^#' $PATH_ENV | xargs -d '\n')

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

LOG_FILE=${PATH_DIR}/backup/logs/backup.log
LOG_DIRECTORY=${PATH_DIR}/backup/logs

mkdir -p $LOG_DIRECTORY
mkdir -p ${PATH_DIR}/backup/${OUTPUT_DIRECTORY}/dump/

echo "`date +'%Y-%m-%dT%H:%M:%S.%3N'` dump start" >> $LOG_FILE

# function log
# {
#    MESSAGE_LEVEL=$1
#    shift
#    MESSAGE="$@"

#    if [ $MESSAGE_LEVEL -le $LOG_LEVEL ]; then
#       echo "`date +'%Y-%m-%dT%H:%M:%S.%3N'` $MESSAGE" >> $LOG_FILE
#    fi
# }
# log $LOG_MESSAGE_INFO "[INFO] starting backup of datalake"

echo --port=$DB_PORT --authenticationDatabase=admin --username=$DUMP_USER --password=$DUMP_USER_PWD --db=$DATABASE --archive=${PATH_DIR}/backup/${OUTPUT_DIRECTORY}/dump/${OUTPUT_DIRECTORY}_`date +%Y-%m-%dT%H`.gz >> $LOG_FILE

mongodump --port=$DB_PORT --authenticationDatabase=admin --username=$DUMP_USER --password=$DUMP_USER_PWD --db=$DATABASE --archive=${PATH_DIR}/backup/${OUTPUT_DIRECTORY}/dump/${OUTPUT_DIRECTORY}_`date +%Y-%m-%dT%H`.gz --gzip  2>> $LOG_FILE
# RET_CODE=$?


echo "`date +'%Y-%m-%dT%H:%M:%S.%3N'` dump end" >> $LOG_FILE

# if [ $RET_CODE -gt 0 ]; then
#    log $LOG_MESSAGE_ERROR "[ERROR] incremental backup of oplog with mongodump failed with return code $RET_CODE"
# fi
