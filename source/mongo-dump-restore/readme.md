MongoDB Database Dump and Restore - Instruction Guide

This document provides detailed instructions for using two shell scripts to back up a MongoDB database and restore it. These scripts automate the use of `mongodump` and `mongorestore` tools.

Prerequisites:

- MongoDB server installed and running.
- User must have read/write access to the MongoDB server.
- Ensure MongoDB's `mongodump` and `mongorestore` tools are installed.

mongotools install -

1. wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

2. echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

3. apt-get update

4. apt-get install -y mongodb-org-tools=5.0.13

Scripts Overview:

1. dump.sh - This script uses `mongodump` to back up the specified MongoDB database.
2. restore.sh - This script uses `mongorestore` to restore data from an archive file into a MongoDB database.

Script Setup:

- Ensure each script has executable permissions. You can set this by running:
  chmod +x dump.sh
  chmod +x restore.sh

Configuration:

1. dump.sh:

   - Command: mongodump --port=[port] --authenticationDatabase=admin --username=[username] --password=[password] --db=[database_name] --archive=[database_name]\_`date +%Y-%m-%dT%H`.gz
   - Replace [port], [username], [password], [database_name], and the date format in the archive's name as per your environment.

2. restore.sh:
   - Command: mongorestore --port=[port] --authenticationDatabase=admin --username=[username] --password=[password] --db=[database_name] --gzip --archive="[database_name]\_YYYY-MM-DDTHH.gz" --nsFrom='[database_name]._' --nsTo='[database_name]._' --gzip
   - Replace [port], [username], [password], [database_name], and specify the correct archive name.

Usage:

- Run the scripts in the following order:
  1. Execute dump.sh to back up the database:
     ./dump.sh
  2. Execute restore.sh to restore the database from the backup archive:
     ./restore.sh

Important Notes:

- It is important to verify the archive's date format in `dump.sh` and ensure it matches the expected format when performing a restore.
- Direct inclusion of passwords in scripts is used for demonstration. For production environments, consider using environment variable or secure vault solutions to handle sensitive information.
- Ensure network settings allow connections on the specified ports for both dumping and restoring operations.

Support:

- For troubleshooting, enhancements, or more information, consult MongoDB’s official documentation or contact your database administrator.

End of Document
