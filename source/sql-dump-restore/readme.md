Database Dump and Restore - Instruction Guide

This document provides detailed instructions for using three shell scripts to dump a MySQL database, create a new database on a different server, and restore the dumped data into the new database.

Prerequisites:

- Ensure MySQL Server is installed and running on both source and destination machines.
- Have network access configured properly between the two machines if they are not on the same local network.
- Have sufficient privileges for the MySQL root user or another user with appropriate permissions.

Scripts Overview:

1. dump.sh - This script dumps the database from the source server.
2. create_database.sh - This script creates a new database on the destination server.
3. restore.sh - This script restores the dumped data into the new database on the destination server.

Script Setup:

- Ensure each script has executable permissions. You can set this by running:
  chmod +x dump.sh
  chmod +x create_database.sh
  chmod +x restore.sh

Configuration:

1. dump.sh:

   - Command: mysqldump -u [username] -p[password] -P [port] -h [source_host] [database_name] > [database_name].sql
   - Replace [username], [password], [port], [source_host], and [database_name] with your source database server's configuration.

2. create_database.sh:

   - Command: mysql -u [username] -p -P [port] -h [destination_host] -e "CREATE DATABASE [database_name];"
   - Replace [username], [password prompt], [port], [destination_host], and [database_name] with your destination database server's configuration.

3. restore.sh:
   - Command: mysql -u [username] -p -P [port] -h [destination_host] [database_name] < [database_name].sql
   - Replace [username], [password prompt], [port], [destination_host], and [database_name] with your destination database server's configuration.

Usage:

- Run the scripts in the following order:
  1. Execute dump.sh to dump the database:
     ./dump.sh
  2. Execute create_database.sh to create a new database on the destination server:
     ./create_database.sh
  3. Execute restore.sh to restore the data into the new database:
     ./restore.sh

Important Notes:

- Ensure that the destination server does not have an existing [database_name] database, or it will be overwritten.
- The password is included directly in the dump.sh script for demonstration purposes. Consider using more secure methods for handling passwords in production environments, such as using option files or environment variables.
- Network connectivity issues, incorrect credentials, or insufficient permissions may cause errors during execution.

Support:

- For troubleshooting and support, refer to the MySQL documentation or consult your database administrator.

End of Document
