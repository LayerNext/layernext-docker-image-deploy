.env file example

SENDGRID_API_KEY=
FROM_EMAIL=

CONNECTION_MONGO_USERNAME=
CONNECTION_MONGO_PORT=
CONNECTION_MONGO_PASSWORD=
CONNECTION_DB_NAME=
CONNECTION_MONGO_HOST=

DATALAKE_MONGO_USERNAME=
DATALAKE_MONGO_PASSWORD=
DATALAKE_MONGO_PORT=
DATALAKE_MONGO_DB_NAME=
DATALAKE_MONGO_HOST=

PRIVATE_KEY_PATH=
REMOTE_USER=
REMOTE_HOST=
REMOTE_FILE_PATH=
LOCAL_FILE_PATH=
LOG_FILE_PATH=

EMAILS=
WORK_DIR=

SOURCE_MONGO_USERNAME=
SOURCE_MONGO_PASSWORD=
SOURCE_MONGO_HOST=
SOURCE_MONGO_PORT=
SOURCE_MONGO_DATABASE=

1. pip install -r requirements.txt

2. need to change environment paths in restore.sh, correct_db.sh, sendgrid_email.py and process.py
   since this code is running through crontab we need to specify environment paths

3. need to set log file path and dump file path in restore.sh

4. need to set correct_db.js path in correct_db.sh

5. sendgrid_email.py - use to send email about the errors

6. process.py - this should add to crontab with absolute path - CONNECTION DB - duplicate database of the source in our system - SOURCE DB - source database - DATALAKE DB - system database

   - actions
     - pulling dump - dump_pull()
     - restore dump - dump_restore()
     - run db script - run_db_script()
     - check collection document count matching - db_collection_match()
     - check collection index count matching - db_collection_index_match()
     - delete dump file - delete_dump_file()
     - update unstructured data - update_unstructured_data_to_metalake()
     - set connection failed status of database if error occurred - set_connection_failed_status()
     - set connection last sync time - set_connection_last_sync_time
     - handle the correct flow of above functions - main()
