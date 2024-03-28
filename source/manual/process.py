import os
import subprocess
from datetime import datetime
from sendgrid_email import send_email_via_sendgrid
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(dotenv_path="/home/ubuntu/layernext-docker-image-deploy/source/manual/.env")


CONNECTION_MONGO_USERNAME = os.getenv("CONNECTION_MONGO_USERNAME")
CONNECTION_MONGO_PASSWORD = os.getenv("CONNECTION_MONGO_PASSWORD")
CONNECTION_MONGO_PORT = os.getenv("CONNECTION_MONGO_PORT")
CONNECTION_DB_NAME = os.getenv("CONNECTION_DB_NAME")
CONNECTION_MONGO_HOST = os.getenv("CONNECTION_MONGO_HOST")

DATALAKE_MONGO_USERNAME = os.getenv("DATALAKE_MONGO_USERNAME")
DATALAKE_MONGO_PASSWORD = os.getenv("DATALAKE_MONGO_PASSWORD")
DATALAKE_MONGO_PORT = os.getenv("DATALAKE_MONGO_PORT")
DATALAKE_MONGO_DB_NAME = os.getenv("DATALAKE_MONGO_DB_NAME")
DATALAKE_MONGO_HOST = os.getenv("DATALAKE_MONGO_HOST")

PRIVATE_KEY_PATH = os.getenv("PRIVATE_KEY_PATH")
REMOTE_USER = os.getenv("REMOTE_USER")
REMOTE_HOST = os.getenv("REMOTE_HOST")
REMOTE_FILE_PATH = os.getenv("REMOTE_FILE_PATH")
# LOCAL_FILE_PATH = os.getenv("LOCAL_FILE_PATH")
# LOG_FILE_PATH = os.getenv("LOG_FILE_PATH")
WORK_DIR = os.getenv("WORK_DIR")

EMAILS = os.getenv("EMAILS")

SOURCE_MONGO_USERNAME = os.getenv("SOURCE_MONGO_USERNAME")
SOURCE_MONGO_PASSWORD = os.getenv("SOURCE_MONGO_PASSWORD")
SOURCE_MONGO_HOST = os.getenv("SOURCE_MONGO_HOST")
SOURCE_MONGO_PORT = os.getenv("SOURCE_MONGO_PORT")
SOURCE_MONGO_DATABASE = os.getenv("SOURCE_MONGO_DATABASE")


def log_message(message):

    log_file_path = (
        f"{WORK_DIR}/layernext-docker-image-deploy/source/manual/logfile.log"
    )
    """
    Appends a given message to the specified log file.

    Parameters:
    - log_file_path: The file path for the log file.
    - message: The message to log.
    """
    with open(log_file_path, "a") as log_file:
        log_file.write(f"{datetime.now()} | {message}\n")


def set_connection_failed_status():
    # MongoDB client connection
    client = MongoClient(
        f"mongodb://{DATALAKE_MONGO_USERNAME}:{DATALAKE_MONGO_PASSWORD}@{DATALAKE_MONGO_HOST}:{DATALAKE_MONGO_PORT}/{DATALAKE_MONGO_DB_NAME}?authSource={DATALAKE_MONGO_DB_NAME}"
    )
    db = client[f"{DATALAKE_MONGO_DB_NAME}"]  # Connect to the 'Dcchail' database

    # Update documents
    update_result = db["Connection"].update_many(
        {"sourceName": "DCCHail"},  # Query: documents with sourceName "DCCHail"
        {"$set": {"connectionStatus": 3}},  # Update: set connectionStatus to 3
    )
    print(f"Documents matched: {update_result.matched_count}")
    print(f"Documents modified: {update_result.modified_count}")


def set_connection_last_sync_time():
    # MongoDB client connection
    client = MongoClient(
        f"mongodb://{DATALAKE_MONGO_USERNAME}:{DATALAKE_MONGO_PASSWORD}@{DATALAKE_MONGO_HOST}:{DATALAKE_MONGO_PORT}/{DATALAKE_MONGO_DB_NAME}?authSource={DATALAKE_MONGO_DB_NAME}"
    )
    db = client[f"{DATALAKE_MONGO_DB_NAME}"]  # Connect to the 'Dcchail' database

    # Update documents
    update_result = db["Connection"].update_one(
        {"sourceName": "DCCHail"},  # Query: documents with sourceName "DCCHail"
        [{"$set": {"lastSyncTime": current_time, "connectionStatus": 2}}],
    )
    print(f"Documents matched: {update_result.matched_count}")
    print(f"Documents modified: {update_result.modified_count}")


# Define the command parameters
private_key_path = PRIVATE_KEY_PATH
remote_user = REMOTE_USER
remote_host = REMOTE_HOST
remote_file_path = REMOTE_FILE_PATH
local_file_path = f"{WORK_DIR}/layernext-docker-image-deploy/source/manual/dump/"
log_file_path = f"{WORK_DIR}/layernext-docker-image-deploy/source/manual/logfile.log"  # Replace with the path to your log file
email_array = EMAILS.split(",")


current_time = datetime.now()
# Format the date in the same format as in the shell command
date_str = current_time.strftime("%d-%m-%Y")

# Construct the remote file name using the current date
remote_file_name = f"dcchail_dump_{date_str}.gz"

# Construct the full remote and local file paths
remote_full_path = f"{remote_file_path}{remote_file_name}"
local_full_path = f"{local_file_path}{remote_file_name}"

# Construct the scp command
scp_command = [
    "scp",
    "-i",
    private_key_path,
    f"{remote_user}@{remote_host}:{remote_full_path}",
    local_full_path,
]


def dump_pull():

    error_occured = False

    try:
        result = subprocess.run(scp_command, text=True, capture_output=True)

        # Check for successful execution
        if result.returncode == 0:
            log_message(
                f"Backup file {remote_file_name} has been copied to {local_full_path}: msg {result.stdout}"
            )
        else:
            error_occured = True
            # Check for specific known errors
            if "No such file or directory" in result.stderr:
                error = (
                    f"No such file or directory in source server: {remote_full_path}"
                )
                log_message(error)
            elif "Permission denied" in result.stderr:
                error = "Permission denied. Check your SSH key and permissions."
                log_message(error)
            elif "Could not resolve hostname" in result.stderr:
                error = "Could not resolve hostname. Check your network connection and remote host name."
                log_message(error)
            elif "Connection timed out" in result.stderr:
                error = "Connection timed out. Check your network connection and remote host."
                log_message(error)
            elif "No space left on device" in result.stderr:
                error = "No space left on device. Check disk space on the destination."
                log_message(error)
            else:
                # Log and email generic error message if the error doesn't match known issues
                error = f"scp dump pull failed with error: {result.stderr}"
                log_message(error)

            send_email_via_sendgrid(
                email_array, "PDRMax-LayerNext prod server | Mongo sync failed", error
            )

    except FileNotFoundError:
        error_occured = True
        log_message(
            "SCP command not found. Please ensure scp is installed and in your PATH."
        )
        send_email_via_sendgrid(
            email_array,
            "PDRMax-LayerNext prod server | Mongo sync failed",
            "SCP command not found.",
        )
    except Exception as e:
        error_occured = True
        log_message(
            f"Backup file {remote_file_name} has been failed copy to {local_full_path} due to an unexpected error: {e}"
        )
        send_email_via_sendgrid(
            email_array,
            "PDRMax-LayerNext prod server | Mongo sync failed",
            f"Backup file {remote_file_name} has been failed copy to {local_full_path} due to an unexpected error: {e}",
        )

    return error_occured


def dump_restore():

    error_occured = False
    try:
        with open(log_file_path, "a") as log_file:
            # Run the mongorestore command via the shell script and redirect stdout and stderr to the log file
            result = subprocess.run(
                [
                    "bash",
                    f"{WORK_DIR}/layernext-docker-image-deploy/source/manual/restore.sh",
                ],
                stdout=log_file,
                stderr=log_file,
            )

        print(result)
        if result.returncode == 0:
            log_message(f"Restore dump file {local_full_path} completed successfully.")
        else:
            # Since stdout and stderr were redirected to the log file, we read the last part of the log to get the error message
            with open(log_file_path, "r") as log_file:
                last_lines = log_file.readlines()[
                    -10:
                ]  # Read the last 10 lines for context, adjust as needed
                error_context = "".join(last_lines).strip()

            log_message(
                f"Restore dump file failed, see log {log_file_path} for details: {error_context}"
            )
            send_email_via_sendgrid(
                email_array,
                "PDRMax-LayerNext prod server | Mongo sync failed",
                f"Restore dump file failed. Check log {log_file_path} for details.",
            )
            error_occured = True

    except FileNotFoundError:
        log_message(
            "Restore script not found. Please check the path to your restore script."
        )
        send_email_via_sendgrid(
            email_array,
            "PDRMax-LayerNext prod server | Mongo sync failed",
            "Restore script not found.",
        )
        error_occured = True
    except Exception as e:
        log_message(f"Restore dump failed with an unexpected error: {e}")
        send_email_via_sendgrid(
            email_array,
            "PDRMax-LayerNext prod server | Mongo sync failed",
            f"Restore dump failed with an unexpected error: {e}",
        )
        error_occured = True

    return error_occured


def run_db_script():

    error_occured = False

    try:
        with open(log_file_path, "a") as log_file:
            # Run the mongorestore command via the shell script and redirect stdout and stderr to the log file
            result = subprocess.run(
                [
                    "bash",
                    f"{WORK_DIR}/layernext-docker-image-deploy/source/manual/correct_db.sh",
                ],
                stdout=log_file,
                stderr=log_file,
            )
        if result.returncode == 0:
            log_message(f"correct db completed successfully.")
        else:
            # Since stdout and stderr were redirected to the log file, we read the last part of the log to get the error message
            with open(log_file_path, "r") as log_file:
                last_lines = log_file.readlines()[
                    -10:
                ]  # Read the last 10 lines for context, adjust as needed
                error_context = "".join(last_lines).strip()

            log_message(
                f"correct db failed, see log {log_file_path} for details: {error_context}"
            )
            send_email_via_sendgrid(
                email_array,
                "PDRMax-LayerNext prod server | Mongo sync failed",
                f"correct db failed. Check log {log_file_path} for details.",
            )
            error_occured = True
    except FileNotFoundError:
        log_message(
            "correct db script not found. Please check the path to your correct db script."
        )
        send_email_via_sendgrid(
            email_array,
            "PDRMax-LayerNext prod server | Mongo sync failed",
            "correct db script not found.",
        )
        error_occured = True
    except Exception as e:
        log_message(f"correct db failed with an unexpected error: {e}")
        send_email_via_sendgrid(
            email_array,
            "PDRMax-LayerNext prod server | Mongo sync failed",
            f"correct db failed with an unexpected error: {e}",
        )
        error_occured = True

    return error_occured


def db_collection_match():
    try:

        # Connection details for the first MongoDB server
        client1 = MongoClient(
            f"mongodb://{SOURCE_MONGO_USERNAME}:{SOURCE_MONGO_PASSWORD}@{SOURCE_MONGO_HOST}:{SOURCE_MONGO_PORT}/{SOURCE_MONGO_DATABASE}?authSource={SOURCE_MONGO_DATABASE}"
        )
        db1 = client1[
            SOURCE_MONGO_DATABASE
        ]  # Replace 'database_name1' with the name of your database

        # Connection details for the second MongoDB server
        client2 = MongoClient(
            f"mongodb://{CONNECTION_MONGO_USERNAME}:{CONNECTION_MONGO_PASSWORD}@{CONNECTION_MONGO_HOST}:{CONNECTION_MONGO_PORT}/"
        )
        db2 = client2[
            CONNECTION_DB_NAME
        ]  # Replace 'database_name2' with the name of your database

        # Get the list of collection names from the first database
        collections1 = db1.list_collection_names()

        message = ""
        if not isinstance(collections1, list) or len(collections1) == 0:
            message = "0 collections to check the count"

        # for collection_name in ["ActivityLog", "Job"]:

        job_count_1 = db1["Job"].count_documents({"createdAt": {"$lte": current_time}})
        job_count_2 = db2["Job"].count_documents({"createdAt": {"$lte": current_time}})
        log_message(
            f"Job count match source: {job_count_1} and destination: {job_count_2}"
        )

        if job_count_1 != job_count_2:
            log_message(
                f"Job count mismatch source: {job_count_1} and destination: {job_count_2}"
            )
            send_email_via_sendgrid(
                email_array,
                "PDRMax-LayerNext prod server | Mongo Job collection mismatch",
                f"Job count mismatch source: {job_count_1} and destination: {job_count_2}",
            )

        activity_count_1 = db1["ActivityLog"].count_documents(
            {"createdAt": {"$lte": current_time}}
        )
        activity_count_2 = db2["ActivityLog"].count_documents(
            {"createdAt": {"$lte": current_time}}
        )

        log_message(
            f"ActivityLog count match source: {activity_count_1} and destination: {activity_count_2}"
        )
        if activity_count_1 != activity_count_2:
            log_message(
                f"ActivityLog count mismatch source: {activity_count_1} and destination: {activity_count_2}"
            )
            send_email_via_sendgrid(
                email_array,
                "PDRMax-LayerNext prod server | Mongo ActivityLog collection mismatch",
                f"ActivityLog count mismatch source: {activity_count_1} and destination: {activity_count_2}",
            )

        # Iterate through each collection in the first database
        for collection_name in collections1:
            # Get the count of documents in the current collection of the first database
            count1 = db1[collection_name].count_documents({})

            # Check if the same collection exists in the second database
            if collection_name in db2.list_collection_names():
                # Get the count of documents in the same collection of the second database
                count2 = db2[collection_name].count_documents({})
                log_message(
                    f"Collection '{collection_name}' has {count1} documents in the source database and {count2} documents in the destination database."
                )
                if count1 != count2:
                    message += f"Collection '{collection_name}' has {count1} documents in the source database and {count2} documents in the destination database.\n"
            else:
                log_message(
                    f"Collection '{collection_name}' does not exist in the destination database."
                )
                message += f"Collection '{collection_name}' does not exist in the destination database.\n"
        if message != "":
            send_email_via_sendgrid(
                email_array,
                "PDRMax-LayerNext prod server | Mongo collection mismatch",
                message,
            )

    except Exception as e:
        log_message(f"collection count check failed with an unexpected error: {e}")


def db_collection_index_match():
    try:

        # Connection details for the first MongoDB server
        client1 = MongoClient(
            f"mongodb://{SOURCE_MONGO_USERNAME}:{SOURCE_MONGO_PASSWORD}@{SOURCE_MONGO_HOST}:{SOURCE_MONGO_PORT}/{SOURCE_MONGO_DATABASE}?authSource={SOURCE_MONGO_DATABASE}"
        )
        db1 = client1[
            SOURCE_MONGO_DATABASE
        ]  # Replace 'database_name1' with the name of your database

        # Connection details for the second MongoDB server
        client2 = MongoClient(
            f"mongodb://{CONNECTION_MONGO_USERNAME}:{CONNECTION_MONGO_PASSWORD}@{CONNECTION_MONGO_HOST}:{CONNECTION_MONGO_PORT}/"
        )
        db2 = client2[
            CONNECTION_DB_NAME
        ]  # Replace 'database_name2' with the name of your database

        # Get the list of collection names from the first database
        collections1 = db1.list_collection_names()

        message = ""
        if not isinstance(collections1, list) or len(collections1) == 0:
            message = "0 collections to check the count"
        # Iterate through each collection in the first database
        for collection_name in collections1:
            # Retrieve the indexes for the current collection of the first database
            indexes1 = list(db1[collection_name].list_indexes())

            # Check if the same collection exists in the second database
            if collection_name in db2.list_collection_names():
                # Retrieve the indexes for the same collection of the second database
                indexes2 = list(db2[collection_name].list_indexes())

                # Compare the indexes of both collections
                indexes1_names = {index["name"] for index in indexes1}
                indexes2_names = {index["name"] for index in indexes2}

                if indexes1_names == indexes2_names:
                    log_message(
                        f"Collection '{collection_name}' has the same indexes in both databases."
                    )
                else:
                    log_message(
                        f"Collection '{collection_name}' has different indexes in the two databases."
                    )
                    message += f"Collection '{collection_name}' has different indexes in the two databases.\n"
            else:
                log_message(
                    f"Collection '{collection_name}' does not exist in the second database."
                )
                message += f"Collection '{collection_name}' does not exist in the destination database.\n"
        if message != "":
            send_email_via_sendgrid(
                email_array,
                "PDRMax-LayerNext prod server | Mongo collection index mismatch",
                message,
            )

    except Exception as e:
        log_message(f"collection index check failed with an unexpected error: {e}")


def delete_dump_file():
    if os.path.exists(local_full_path):
        # Delete the file
        os.remove(local_full_path)
        print(f"The file {local_full_path} has been deleted.")
    else:
        print(f"The file {local_full_path} does not exist.")


# ssh -L 27018:localhost:11745 -i /home/ubuntu/db-dump/keys/pdrmax-ssh.key pdrmax_dev@dcchail.pdrmax.com -N


def main():
    error_occured = False
    error_occured = dump_pull()
    if not error_occured:
        error_occured = dump_restore()
        delete_dump_file()
    else:
        set_connection_failed_status()
    if not error_occured:
        error_occured = run_db_script()
    else:
        set_connection_failed_status()
    if not error_occured:
        db_collection_match()
    else:
        set_connection_failed_status()
    if not error_occured:
        db_collection_index_match()
        set_connection_last_sync_time()


main()

# set_connection_last_sync_time()
