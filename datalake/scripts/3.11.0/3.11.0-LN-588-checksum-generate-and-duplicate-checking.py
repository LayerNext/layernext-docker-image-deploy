import logging
import os
import platform
# For Linux
import logging.handlers
# For Windows
from concurrent_log_handler import ConcurrentRotatingFileHandler
import pathlib
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
import datetime
# from storage_bucket import StorageBucket

import shutil
import jwt

from google.cloud import storage

import boto3
from botocore.exceptions import ClientError



from typing import List, Optional
import pymongo
import json
from pymongo import MongoClient
from pymongo.errors import AutoReconnect, ConnectionFailure
from pymongo.command_cursor import CommandCursor
import bson
from bson.int64 import Int64
import configparser

import zlib
import traceback
import uuid
from bson import ObjectId
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
load_dotenv()  # take environment variables from .env.

# ================================constants.py======================================================
# System Label Type
from enum import Enum


class ObjectType(Enum):
    VIDEO = 1
    IMAGE = 2
    DATASET = 3
    VIDEO_COLLECTION = 4
    IMAGE_COLLECTION = 5
    OTHER = 6
    OTHER_COLLECTION = 7


class ItemType(Enum):
    IMAGE = "image"
    VIDEO = "video"
    OTHER = "other"
    IMAGE_COLLECTION = "image_collection"
    VIDEO_COLLECTION = "video_collection"
    OTHER_COLLECTION = "other_collection"
    DATASET = "dataset"


class JobStatus(Enum):
    IN_PROGRESS = 1
    COMPLETED = 2
    QUEUED = 3
    FAILED = 4


class DataInputType(Enum):
    CRAWL = 1
    UPLOAD = 2


class ObjectStatus(Enum):
    TRASHED = 1
    ACTIVE = 2
    ACCESSED_FAILED = 6
    MEDIA_PROCESSING_FAILED = 8
    MEDIA_PROCESSING_PENDING = 10


class SourceType(Enum):
    MYSQL = "mysql"
    MONGODB = "mongodb"
    SQLSERVER = "mssql"
    POSTGRESQL = "postgresql"


DEFAULT_DISK_STORAGE_BASE_PATH = "/usr/src/app/buckets/"  # Applied when DISK_STORAGE_BASE_PATH environment variable is not defined

# =============================================================================================

#==================================================================== logger.py===============================
def get_debug_logger(name, file_name):
    """
    Returns a logger instance with the specified name and file name.

    The logger's handler is platform-specific: on Windows, it uses a 
    ConcurrentRotatingFileHandler with a maximum file size of 1 MB and 30 
    backup files; on Linux, it uses a TimedRotatingFileHandler that rotates 
    files at midnight with a backup count determined by the LOG_BACKUP_COUNT 
    environment variable.

    Parameters:
        name (str): The name of the logger.
        file_name (str): The name of the log file.

    Returns:
        logging.Logger: A logger instance with the specified name and file name.
"""
    log_level = os.getenv("LOG_LEVEL", "DEBUG").upper()
    backup_count = int(os.getenv('LOG_BACKUP_COUNT', 90))
    _logger = logging.getLogger(name)

    log_level = getattr(logging, log_level, logging.DEBUG)  # Default to DEBUG if LOG_LEVEL is invalid

    if not _logger.hasHandlers():
        _logger.setLevel(log_level)

        if platform.system() == "Windows":
            # Windows-specific logging configuration
            max_bytes = 1 * 1024  # 1 MB file size limit (adjust as needed)
            backup_count = 30  # Number of backup files to keep
            file_handler = ConcurrentRotatingFileHandler(
                file_name,
                maxBytes=max_bytes,
                backupCount=backup_count
            )
        else:
            # Linux-specific logging configuration
            file_handler = logging.handlers.TimedRotatingFileHandler(
                file_name, when="midnight", interval=1, backupCount=backup_count ,utc=True
            )

        file_handler.setLevel(log_level)
        formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        file_handler.setFormatter(formatter)
        _logger.addHandler(file_handler)

    return _logger



# ==========================================================================================

# =============================storage_bucket.py==========================================================
class StorageBucket:
    def __init__(self, bucket_name):
        self.bucket_name = bucket_name

    def generate_signed_url(self, object_key: str) -> str:
        pass

    def upload_file(self, file_path: str, object_key: str):
        pass

    def download_file(self, object_key: str, file_path: str):
        pass

    def delete_file(self, object_key: str):
        pass

# =======================================================================================


# ====================================================azure_bucket.py=============================


az_bucket_logger = get_debug_logger('azure_bucket', pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve() , '../logs/server.log'))

class AzureBucket(StorageBucket):
    # Static method to create an Azure connection
    # To be used for creating AzureBucket instances
    @staticmethod
    def create_azure_connection():
        # set connection string
        # set storage account and account key
        account_name = os.environ.get('AZURE_ACCOUNT_NAME')
        account_key = os.environ.get('AZURE_STORAGE_ACCOUNT_KEY')
        connection_string = f'DefaultEndpointsProtocol=https;AccountName={account_name};AccountKey={account_key};EndpointSuffix=core.windows.net'
        return BlobServiceClient.from_connection_string(connection_string)

    def __init__(self, container_name, azure_client):
        self.azure_container = azure_client.get_container_client(container_name)

    def download_file(self, blob_name, file_name):
        try:
            blob_client = self.azure_container.get_blob_client(blob_name)
            with open(file_name, "wb") as download_file:
              download_file.write(blob_client.download_blob().readall())
        except Exception as e:
            az_bucket_logger.warn(f'Azure bucket: Download failed: {file_name}: {e}')

    def upload_file(self, file_path, blob_name):
        blob_client = self.azure_container.get_blob_client(blob_name)
        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)

    def generate_signed_url(self, blob_name: str) -> str:
        blob_client = self.azure_container.get_blob_client(blob_name)
        # Generate a SAS token to use to authenticate a service client
        sas_token = generate_blob_sas(
            blob_client.account_name,
            blob_client.container_name,
            blob_client.blob_name,
            account_key=blob_client.credential.account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.datetime.now() + datetime.timedelta(days=3)
        )

        sas_url = f"https://{blob_client.account_name}.blob.core.windows.net/{blob_client.container_name}/{blob_client.blob_name}?{sas_token}"
        return sas_url
    
# =============================================================================================

# ==========================================================================disk_bucket.py=========

load_dotenv()  # take environment variables from .env.

if not os.path.exists(
    pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve(), "../logs")
):
    os.makedirs(
        pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve(), "../logs")
    )


disk_bucket_logger = get_debug_logger(
    "disk_bucket",
    pathlib.Path.joinpath(
        pathlib.Path(__file__).parent.resolve(), "../logs/server.log"
    ),
)

SECRET_KEY = os.environ.get("JWT_SECRET")
DISK_BASE_URL = os.environ.get("NODEJS_BASE_URL")
DISK_BASE_PATH = os.environ.get(
    "DISK_STORAGE_BASE_PATH", DEFAULT_DISK_STORAGE_BASE_PATH
)


class DiskBucket(StorageBucket):
    # Static method to create an local disk connection
    # To be used in creating a bucket object
    @staticmethod
    def create_disk_connection():
        disk_bucket_logger.info("Creating disk connection")
        # For local disk operations, no need for boto3 or sessions
        return True  # Just a placeholder since no actual connection needed

    def __init__(self, bucket_name, disk_client):
        super().__init__(bucket_name)
        self.disk_client = disk_client

    def download_file(self, object_key: str, file_path: str):
        """
        Download a file

        :param file_path: Path of the location to be downloaded to.
        :param object_key: Path to the content.

        """
        disk_bucket_logger.info(
            f"Downloading file from bucket: {self.bucket_name}, key: {object_key}, file_path: {file_path}"
        )
        try:
            # Construct the full path to the file in the disk storage
            full_file_path = os.path.join(DISK_BASE_PATH + self.bucket_name, object_key)

            # Ensure the directory structure exists for the file
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            # Perform the download operation (copy from storage to local disk)
            shutil.copy(full_file_path, file_path)

            # Optionally, you may want to verify the download or handle errors

            disk_bucket_logger.debug(f"DiskBucket: Download complete: {full_file_path}")

        except Exception as e:
            disk_bucket_logger.warn(
                f"DiskBucket: Download failed: {full_file_path}: {e}"
            )

    def upload_file(self, file_path: str, object_key: str):
        """
        upload a file

        :param file_path: Path of the location to be uploaded to.
        :param object_key: Path to the content.

        """
        disk_bucket_logger.info(
            f"Uploading file to bucket: {self.bucket_name}, key: {object_key}, file_path: {file_path}"
        )

        try:
            # Construct the full path to the destination file in the local disk storage
            full_object_path = os.path.join(
                DISK_BASE_PATH + self.bucket_name, object_key
            )

            # Ensure the directory structure exists for the destination file
            os.makedirs(os.path.dirname(full_object_path), exist_ok=True)

            # Perform the upload operation (copy from local disk to storage location)
            shutil.copy(file_path, full_object_path)

            disk_bucket_logger.info(f"Upload complete: {full_object_path}")
        except:
            disk_bucket_logger.warn(f"Upload failed {full_object_path}")

    def generate_signed_url(self, content_key: str, expires_in: int = 3 * 86400):
        """
        Generate a presigned URL that can be used to perform an action.

        :param content_key: The key (path) of the content.
        :param expires_in: The number of seconds the presigned URL is valid for.
        :return: The presigned URL.
        """
        disk_bucket_logger.info(f"Generating signed URL for key: {content_key}")

        try:
            # Create a JWT token
            expiration = datetime.datetime.now(
                datetime.timezone.utc
            ) + datetime.timedelta(seconds=expires_in)

            payload = {
                "bucket": self.bucket_name,
                "keyValue": content_key,
                "exp": expiration,
            }

            token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

            # Construct the URL
            api_path = "/api/download/file/localDisk"
            query_string = f"token={token}"
            signed_url = f"{DISK_BASE_URL}{api_path}?{query_string}"

            disk_bucket_logger.info(f"Generated signed URL: {signed_url}")
            return signed_url
        except:
            disk_bucket_logger.warn("Generating signed URL failed")
            return ""


# ====================================================================gcp_bucket.py=========
load_dotenv()  # take environment variables from .env.


class GCPBucket(StorageBucket):
    #Static method to create a GCP connection
    #To be used for creating GCPBucket instances
    @staticmethod
    def create_gcp_connection():
        # set key credentials file path
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = '/app/config/gcs-credentials.json'
        return storage.Client()

    def __init__(self, bucket_name, gcp_client):
        self.google_bucket = gcp_client.bucket(bucket_name)

    def download_file(self, object_key, file_name):
        blob = self.google_bucket.blob(object_key)
        blob.download_to_filename(file_name)

    def upload_file(self, file_path, object_key):
        blob = self.google_bucket.blob(object_key)
        blob.upload_from_filename(file_path)

    def generate_signed_url(self, object_key: str) -> str:
        blob = self.google_bucket.blob(object_key)
        url = blob.generate_signed_url(expiration=datetime.timedelta(minutes=3 * 86400))
        return url

# =======================================================================================
# =======================================s3_bucket.py===============================================
# from services import storage_bucket
load_dotenv()  # take environment variables from .env.

if not os.path.exists(pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve() , '../logs')):
    os.makedirs(pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve() , '../logs'))


s3_bucket_logger = get_debug_logger('s3_bucket', pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve() , '../logs/server.log'))

class S3Bucket(StorageBucket):
    #Static method to create an S3 connection
    #To be used in creating a bucket object
    @staticmethod
    def create_s3_connection():
        region_name = os.environ.get('AWS_REGION')
        aws_access_key_id = os.environ.get('AWS_ACCESS_KEY')
        aws_secret_access_key = os.environ.get('AWS_SECRET_KEY')

        s3_bucket_logger.info('Creating S3 connection with region_name: ' + region_name + ' aws_access_key_id: ' + aws_access_key_id + ' aws_secret_access_key: ' + aws_secret_access_key)

        session = boto3.session.Session()

        s3_client = session.client(
        's3',
        region_name=region_name,
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key
        )
        return s3_client


    def __init__(self, bucket_name, s3_client):
        super().__init__(bucket_name)
        self.s3_client = s3_client

    def download_file(self, key, file_name):
        s3_bucket_logger.info('Downloading file from bucket: ' + self.bucket_name + ' key: ' + key+ ' file_name: ' + file_name)
        self.s3_client.download_file(self.bucket_name, key, file_name)

    def upload_file(self, fileLocation, key):
        self.s3_client.upload_file(fileLocation, self.bucket_name, key)


    # Use for get authenticated s3 URL
    def generate_signed_url(self, content_key):
        """
        Generate a presigned Amazon S3 URL that can be used to perform an action.

        :param content_key: image key
        :param s3_client: A Boto3 Amazon S3 client.
        :param client_method: The name of the client method that the URL performs.
        :param expires_in: The number of seconds the presigned URL is valid for.
        :return: The presigned URL.
        """
        expires_in = 3 * 86400
        client_method='get_object'

        try:
            s3Url = self.s3_client.generate_presigned_url(client_method, Params={'Bucket': self.bucket_name, 'Key': content_key, 'ResponseContentDisposition': 'attachment'}, ExpiresIn=expires_in)
            # s3_logger.info("Got presigned URL: %s", s3Url)
        except ClientError:
            # s3_logger.exception(
            print(
                "Couldn't get a presigned URL for client method '%s'.", client_method)
            raise
        return s3Url


# ======================================================================================================

# ==========================================cloud_storage_manager.py========================= 

load_dotenv()  # take environment variables from .env.

if not os.path.exists(
    pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve(), "../logs")
):
    os.makedirs(
        pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve(), "../logs")
    )


cloud_storage_manager_logger = get_debug_logger(
    "cloud_storage_manager",
    pathlib.Path.joinpath(
        pathlib.Path(__file__).parent.resolve(), "../logs/server.log"
    ),
)


class CloudStorageManager:
    def __init__(self):
        # Dictionary of storage buckets with bucket name as key
        self.buckets_dict = {}
        # create buckets using environment configurations
        storage_type = os.environ.get("STORAGE_TYPE")

        if storage_type == "gcs":
            self.create_gcp_buckets()
        elif storage_type == "aws_s3":
            self.create_aws_buckets()
        elif storage_type == "azure_blob":
            self.create_azure_buckets()
        elif storage_type == "lds":
            ##selecting local disk storage as the bucket
            self.create_disk_buckets()
        else:
            cloud_storage_manager_logger.error("Invalid storage type")
            print("Invalid storage type")

    def download_file(self, bucket_name, file_name, file_path):
        cloud_storage_manager_logger.info(
            f"Downloading file {file_name} from bucket {bucket_name}"
        )

        if bucket_name in self.buckets_dict:
            self.buckets_dict[bucket_name].download_file(file_name, file_path)
        else:
            cloud_storage_manager_logger.error("Bucket does not exist")
            print("Bucket does not exist")

    # Bucket creation methods for different cloud storage providers
    def create_aws_buckets(self):
        all_s3_bucket = os.environ.get("OTHER_BUCKETS")
        default_bucket = os.environ.get("DEFAULT_BUCKET_NAME")
        s3_client = S3Bucket.create_s3_connection()
        s3_bucket_array = []
        if all_s3_bucket != None and all_s3_bucket != "":
            s3_bucket_array = all_s3_bucket.split(",")
        # default_bucket add to s3_bucket_array as first element
        s3_bucket_array.insert(0, default_bucket)
        cloud_storage_manager_logger.debug("s3_bucket_array: " + str(s3_bucket_array))

        for s3_bucket in s3_bucket_array:
            cloud_storage_manager_logger.debug("s3_bucket: " + s3_bucket)
            s3_bucket_name = s3_bucket.strip()
            s3_bucket = S3Bucket(s3_bucket_name, s3_client)
            self.buckets_dict[s3_bucket_name] = s3_bucket

    def create_disk_buckets(self):
        """
        creating disk bucket

        """
        all_disk_bucket = os.environ.get("OTHER_BUCKETS")
        default_bucket = os.environ.get("DEFAULT_BUCKET_NAME")
        disk_client = DiskBucket.create_disk_connection()
        disk_bucket_array = []
        if all_disk_bucket != None and all_disk_bucket != "":
            disk_bucket_array = all_disk_bucket.split(",")

        disk_bucket_array.insert(0, default_bucket)
        cloud_storage_manager_logger.debug(
            "disk_bucket_array: " + str(disk_bucket_array)
        )

        for disk_bucket in disk_bucket_array:
            cloud_storage_manager_logger.debug("disk_bucket: " + disk_bucket)
            disk_bucket_name = disk_bucket.strip()
            disk_bucket = DiskBucket(disk_bucket_name, disk_client)
            self.buckets_dict[disk_bucket_name] = disk_bucket

    def create_gcp_buckets(self):
        all_gcp_buckets = os.environ.get("OTHER_BUCKETS")
        default_bucket = os.environ.get("DEFAULT_BUCKET_NAME")
        gcp_client = GCPBucket.create_gcp_connection()
        gcp_bucket_array = []
        if all_gcp_buckets != None and all_gcp_buckets != "":
            gcp_bucket_array = all_gcp_buckets.split(",")
        gcp_bucket_array.insert(0, default_bucket)

        for gcp_bucket in gcp_bucket_array:
            gcp_bucket_name = gcp_bucket.strip()
            gcp_bucket = GCPBucket(gcp_bucket_name, gcp_client)
            self.buckets_dict[gcp_bucket_name] = gcp_bucket

    def create_azure_buckets(self):
        all_azure_buckets = os.environ.get("OTHER_BUCKETS")
        default_bucket = os.environ.get("DEFAULT_BUCKET_NAME")
        azure_client = AzureBucket.create_azure_connection()

        azure_bucket_array = []
        if all_azure_buckets != None and all_azure_buckets != "":
            azure_bucket_array = all_azure_buckets.split(",")

        azure_bucket_array.insert(0, default_bucket)

        for azure_bucket in azure_bucket_array:
            azure_bucket_name = azure_bucket.strip()
            azure_bucket = AzureBucket(azure_bucket_name, azure_client)
            self.buckets_dict[azure_bucket_name] = azure_bucket

    # Test program

# ========================================================================================
# ====================================mongo_manager.py===================================
load_dotenv()  # take environment variables from .env.

DB_USER = os.environ.get("DB_USER")
DB_PASS = os.environ.get("DB_PASS")
DB_NAME = os.environ.get("DATABASE")
IP = os.environ.get("DB_HOST")
PORT = int(os.environ.get("DB_PORT"))



if not os.path.exists(
    pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve(), "../logs")
):
    os.makedirs(
        pathlib.Path.joinpath(pathlib.Path(__file__).parent.resolve(), "../logs")
    )

logger = get_debug_logger(
    "mongo_manager",
    pathlib.Path.joinpath(
        pathlib.Path(__file__).parent.resolve(), "../logs/server.log"
    ),
)


class MongoDBmanager:
    def __init__(self, collection):

        self.db = DB_NAME
        self.collection = collection
        # Connect to the DB
        try:
            self.client = MongoClient(
                f"mongodb://{DB_USER}:{DB_PASS}@{IP}:{PORT}/{DB_NAME}"
            )
        except (AutoReconnect, ConnectionFailure) as e:
            logger.debug(e)
            logger.debug(
                f"CONNECTION_ERROR to mongodb://{DB_USER}:{DB_PASS}@{IP}:{PORT}/{DB_NAME}"
            )
            raise Exception("CONNECTION_ERROR")

    """
    get documents by query
    """

    def get_documents(self, query):
        _DB = self.client[self.db]
        collection = _DB[self.collection]
        ret = collection.find(query)
        return ret


    """
    insert documents by bulk_write
    """

    def bulk_write(self, query):
        if query != None and len(query) > 0:
            try:
                _DB = self.client[self.db]

                collection = _DB[self.collection]
                ret = collection.bulk_write(query)
                return ret
            except Exception as e:
                print(f"Exception in bulk write: {e}")
        else:
            logger.debug("No query to bulk_write")



# =====================================app.py=====================

# Initialize MongoDB and CloudStorage
mongo_manager = MongoDBmanager("MetaData")
cloud_storage_manager = CloudStorageManager()

# Logger setup (optional, if logging is useful)
logger = get_debug_logger('media_process', './logs/media_process.log')

# Setup temporary directory for downloads (based on your team's approach)
random_id = uuid.uuid4()
now = datetime.datetime.now()
date_time = now.strftime("temp_%Y%m%d_%H%M%S")
dir_suffix = f"{date_time}_{random_id}"
dir_path = os.path.join("./tempFiles", dir_suffix)
os.makedirs(dir_path, exist_ok=True)


def calculate_checksum(file_path):
    """Calculate CRC32 checksum of the file content and ensure it's stored as a 64-bit integer."""
    checksum = 0
    try:
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                checksum = zlib.crc32(chunk, checksum)
        
        # Convert checksum to 64-bit unsigned integer (Python's int can handle big integers)
        checksum = checksum & 0xFFFFFFFF  # Ensure it's 32-bit
        checksum = Int64(checksum)# Python int (arbitrary precision)

        return checksum
    except Exception as e:
        logger.error(f"Error calculating checksum for file: {file_path}")
        logger.error(traceback.format_exc())
        return None

def process_key(key,dir_path):
    try:
        keyArray = key["storagePath"].split("/")
        file_name = keyArray[-1]
        object_key = key["objectKey"]

        # Create download path within temp directory
        download_path = os.path.join(dir_path, file_name)

        

        # Download the file
        cloud_storage_manager.download_file(key["bucketName"], key["storagePath"], download_path)

        
        # Calculate checksum
        checksum = calculate_checksum(download_path)

        # Handle missing checksum case
        if checksum is None:
            checksum = "N/A"

        # If fileSize is missing, get file size from the downloaded file
        file_size = key.get("fileSize", None)
        if file_size is None:
            if os.path.exists(download_path):
                file_size = os.path.getsize(download_path)
            else:
                file_size = 0  # If the file doesn't exist, default to 0

        unique_checksum_process_key = (file_size, checksum)

        return {
            "_id": key["_id"],
            "fileSize": file_size,
            "checksum": checksum,
            "isDuplicate": False,  # Will check for duplicates later
            "objectKey": key["objectKey"],
            "unique_checksum_process_key": unique_checksum_process_key
        }
    except Exception as e:
        logger.error(f"Error processing key {key['_id']}: {e}")
        logger.error(traceback.format_exc())
        return None

def create_media_process_list(documents, existing_files):
    batch_unique_keys = {}
    non_duplicate_items = []
    try:
        # In-batch deduplication
        for doc in documents:
            if not doc:  # In case any processing failed
                continue
            unique_key = doc["unique_checksum_process_key"]

            if unique_key[1] != "N/A":  # Checksum exists
                if unique_key in batch_unique_keys:
                    doc["isDuplicate"] = True
                else:
                    batch_unique_keys[unique_key] = doc
                    non_duplicate_items.append(doc)
            else:
                doc["isDuplicate"] = False

        # Compare with MetaLake existing checksums (from existing_files)
        existing_combinations = {(file["fileSize"], file["checksum"]) for file in existing_files}

        for doc in non_duplicate_items:
            if (doc["fileSize"], doc["checksum"]) in existing_combinations:
                doc["isDuplicate"] = True
    except Exception as e:
        logger.error(f"Error during media process list creation: {e}")
        logger.error(traceback.format_exc())   

    return documents

def fetch_pending_metadata_and_process():
    pageSize =  10 # Batch size
    i = 1
    batchLength = pageSize

    while True:
        
        try:
            # Set up temp directory for this batch
            random_id = uuid.uuid4()
            now = datetime.datetime.now()
            date_time = now.strftime("temp_%Y%m%d_%H%M%S")
            dir_suffix = f"{date_time}_{random_id}"
            dir_path = os.path.join("./tempFiles", dir_suffix)
            os.makedirs(dir_path, exist_ok=True) 

            # Fetch metadata similar to your team's code
            metaDataFilter = {
                "checksum": {"$exists": False},  # Fetch documents without checksum
                "objectType": {"$in": [1, 2, 6]}  # Assuming 1=IMAGE, 2=VIDEO, 6=OTHER
            }

            bucket_name = os.environ.get("DEFAULT_BUCKET_NAME", "default-bucket")

            # Fetch metadata from MongoDB
            try:
                logger.info(f"Fetching metadata with filter: {metaDataFilter}")
                metaDataList = list(mongo_manager.get_documents(metaDataFilter).limit(pageSize))
                logger.info(f"Successfully fetched metadata batch {i} with {len(metaDataList)} items")
                if len(metaDataList) == 0:
                    logger.info("No more metadata to fetch.")
                    break
            except pymongo.errors.PyMongoError as db_error:
                logger.error(f"Error fetching metadata from MongoDB: {db_error}")
                logger.error(traceback.format_exc())
                break  

            keyList = []

            try:
                for metaData in metaDataList:
                    keyList.append({
                        "objectKey": metaData["objectKey"],
                        "storagePath": metaData["storagePath"],
                        "objectType": metaData["objectType"],
                        "_id": metaData["_id"],
                        "fileSize": metaData.get("fileSize", 0),
                        "bucketName": bucket_name,  # Assuming this is a constant value
                    })

                # Check if we fetched an empty batch
                batchLength = len(keyList)
                if batchLength <= 0:
                    logger.info("No more media to process - exiting.")
                    break  # Exit the loop when no more data to process
            except KeyError as key_error:
                logger.error(f"KeyError processing metadata documents: {key_error}")
                logger.error(traceback.format_exc())
                break  # Break if there is an issue with document fields

            logger.info(f"Processing batch {i} with {batchLength} documents")

            # Process keys in parallel using ThreadPoolExecutor
            try:
                with ThreadPoolExecutor(max_workers=1) as executor:
                    processed_docs = list(executor.map(lambda key: process_key(key, dir_path), keyList))
                logger.info(f"Processed {len(processed_docs)} documents in batch {i}")
            except Exception as e:
                logger.error(f"Error processing keys in parallel: {e}")
                logger.error(traceback.format_exc())
                break

            # Query existing files in MetaLake that have a checksum
            try:
                file_checksums = [doc["checksum"] for doc in processed_docs if doc and doc["checksum"] != "N/A"]
                if file_checksums:
                    logger.info(f"Querying MetaLake for existing files with checksums: {file_checksums}")
                    existing_files = list(mongo_manager.get_documents({"checksum": {"$in": file_checksums}}))
                else:
                    existing_files = []
                    logger.info("No valid checksums found to query MetaLake.")
            except pymongo.errors.PyMongoError as db_error:
                logger.error(f"Error querying MetaLake for duplicates: {db_error}")
                logger.error(traceback.format_exc())
                break

            # Process the batch for in-batch and MetaLake deduplication
            try:
                processed_docs = create_media_process_list(processed_docs, existing_files)
                
            except Exception as e:
                logger.error(f"Error during media processing for batch {i}: {e}")
                logger.error(traceback.format_exc())
                break

            # Update the MongoDB collection with checksums and isDuplicate flags
            try:
                update_metadata(processed_docs)
                logger.info(f"Batch {i} processed and updated successfully.")
            except pymongo.errors.PyMongoError as db_error:
                logger.error(f"Error updating metadata in MongoDB for batch {i}: {db_error}")
                logger.error(traceback.format_exc())
                break

            #CLEANUP: Remove temp files after processing the batch
            try:
                shutil.rmtree(dir_path)  # Delete the entire temp directory after batch processing
                logger.info(f"Temporary files in {dir_path} have been removed successfully.")
            except Exception as cleanup_error:
                logger.error(f"Error cleaning up temp files in {dir_path}: {cleanup_error}")
                logger.error(traceback.format_exc())
                break  # Continue even if there's an issue with cleanup

            i += 1

        except Exception as e:
            logger.error(f"Unexpected error in fetching and processing metadata: {e}")
            logger.error(traceback.format_exc())
            break  # Break the loop on unexpected errors

def update_metadata(documents):
    bulk_updates = []
    for doc in documents:
        if not doc:  # Skip if doc processing failed
            continue
        update_filter = {"_id": doc["_id"]}
        update_data = {
            "$set": {
                "checksum": doc["checksum"],
                "isDuplicate": doc["isDuplicate"],
                "updatedAt": datetime.datetime.utcnow()
            }
        }
        bulk_updates.append(pymongo.UpdateOne(update_filter, update_data))

    if bulk_updates:
        mongo_manager.bulk_write(bulk_updates)
        logger.info(f"Updated {len(bulk_updates)} documents.")

if __name__ == "__main__":
    fetch_pending_metadata_and_process()

# ===================================================================

