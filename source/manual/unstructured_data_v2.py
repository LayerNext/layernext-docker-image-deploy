import os
import json
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

DATALAKE_MONGO_USERNAME = os.getenv("DATALAKE_MONGO_USERNAME")
DATALAKE_MONGO_PASSWORD = os.getenv("DATALAKE_MONGO_PASSWORD")
DATALAKE_MONGO_PORT = os.getenv("DATALAKE_MONGO_PORT")
DATALAKE_MONGO_DB_NAME = os.getenv("DATALAKE_MONGO_DB_NAME")
DATALAKE_MONGO_HOST = os.getenv("DATALAKE_MONGO_HOST")

WORK_DIR = os.getenv("WORK_DIR")


class DatabaseConnection:
    def __init__(self, credentials):
        self.credentials = credentials

    def connect(self):
        pass

    def find(self, collection, query, projection):
        pass

    def aggregate(self, collection, pipeline):
        pass

    def bulk_write(self, collection, operations):
        pass

    def get_unstructured_data(self, collection, pipeline):
        pass


class MongoDBConnection(DatabaseConnection):
    def connect(self):
        uri = f"mongodb://{self.credentials['username']}:{self.credentials['password']}@{self.credentials['host']}:{self.credentials['port']}/{self.credentials['database']}"
        return MongoClient(uri)[self.credentials["database"]]

    def find(self, collection, query, projection):
        db = self.connect()
        return list(db[collection].find(query, projection))

    def aggregate(self, collection, pipeline):
        db = self.connect()
        return list(db[collection].aggregate(pipeline))

    def bulk_write(self, collection, operations):
        db = self.connect()
        return db[collection].bulk_write(operations)

    def find_one(self, collection, query):
        db = self.connect()
        return db[collection].find_one(query)

    def insert_one(self, collection, document):
        db = self.connect()
        return db[collection].insert_one(document)

    def get_unstructured_data(self, collection, pipeline):
        return self.aggregate(collection, pipeline)


class MySQLConnection(DatabaseConnection):
    def connect(self):
        return mysql.connector.connect(
            host=self.credentials["host"],
            user=self.credentials["username"],
            password=self.credentials["password"],
            database=self.credentials["database"],
            port=self.credentials["port"],
        )

    def find(self, collection, query, projection=None):
        conn = self.connect()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()
        conn.close()
        return result

    def get_unstructured_data(self, collection, pipeline):
        return self.find(collection, pipeline)


class DatabaseConnectionFactory:
    @staticmethod
    def get_database_connection(type, credentials):
        if type == "mongodb":
            return MongoDBConnection(credentials)
        elif type == "mysql":
            return MySQLConnection(credentials)
        else:
            raise ValueError("Unsupported database type")


def log_message(message):
    log_file_path = f"{WORK_DIR}/source/manual/logfile.log"
    with open(log_file_path, "a") as log_file:
        log_file.write(f"{datetime.now()} | {message}\n")


def update_unstructured_data_to_metalake():
    log_message("unstructured data process start")
    datalake_credentials = {
        "username": DATALAKE_MONGO_USERNAME,
        "password": DATALAKE_MONGO_PASSWORD,
        "host": DATALAKE_MONGO_HOST,
        "port": DATALAKE_MONGO_PORT,
        "database": DATALAKE_MONGO_DB_NAME,
    }
    datalake_db = DatabaseConnectionFactory.get_database_connection(
        "mongodb", datalake_credentials
    )

    result_array = datalake_db.find(
        "Connection",
        {},
        {
            "unstructuredCollections": 1,
            "sourceName": 1,
            "connectionCredentials": 1,
            "type": 1,
        },
    )

    for result in result_array:
        if (
            "unstructuredCollections" not in result
            or "connectionCredentials" not in result
        ):
            continue

        log_message(
            f"source name: {result['sourceName']} | unstructured collections count: {len(result['unstructuredCollections'])} | unstructured data populations started"
        )

        connection_credentials = result["connectionCredentials"]
        connection_type = result["type"]
        connection_db = DatabaseConnectionFactory.get_database_connection(
            connection_type, connection_credentials
        )

        for unstructured_collection in result["unstructuredCollections"]:
            if connection_type == "mongodb":
                pipeline = json.loads(unstructured_collection["dataAggregation"])
            else:
                pipeline = unstructured_collection["dataAggregation"]
            source_collection = unstructured_collection["sourceCollection"]
            metalake_collection = unstructured_collection["metalakeCollection"]

            metalake_collection_details = datalake_db.find_one(
                "MetaData", {"name": metalake_collection, "objectType": 7}
            )
            collection_id = ""
            if metalake_collection_details is not None:
                collection_id = metalake_collection_details["_id"]
            else:
                # Insert the document
                insert_result = datalake_db.insert_one(
                    "MetaData",
                    {
                        "objectType": 7,
                        "name": metalake_collection,
                        "teamId": ObjectId("6374c3decb468b7a7a68a116"),
                        "isPendingThumbnail": False,
                        "nameInLowerCase": metalake_collection.lower(),
                        "unstructuredData": True,
                        "updatedAt": datetime.now(),
                        "createdAt": datetime.now(),
                        "isLeaf": False,
                        "statPending": False,
                        "statPendingAt": datetime.now(),
                        "objectStatus": 2,
                        "isMetaFieldsPropagationRequired": False,
                        "fileSize": 0,
                        "frameCount": 0,
                        "otherCount": 0,
                        "isMediaProcessingPending": False,
                        "url": None,
                        "isAccessible": True,
                        "isVerificationStatusPending": False,
                        "fileType": "unstructuredData",
                        "thumbnailUrl": None,
                    },
                )

                # Retrieve the ID of the inserted document
                collection_id = insert_result.inserted_id

            limit = 1000
            itr = 0
            count = 1000
            total_count = 0

            while count == 1000:

                if connection_type == "mongodb":
                    pipeline = json.loads(unstructured_collection["dataAggregation"])
                    _pipeline = list(pipeline)
                    _pipeline.append({"$skip": limit * itr})
                    _pipeline.append({"$limit": limit})
                else:
                    pipeline = unstructured_collection["dataAggregation"]
                    _pipeline = (
                        pipeline
                        + " LIMIT "
                        + str(limit)
                        + " OFFSET "
                        + str(limit * itr)
                    )

                unstructured_data_list = connection_db.get_unstructured_data(
                    source_collection, _pipeline
                )
                bulkwrite_operations = []
                for unstructured_data in unstructured_data_list:
                    _id = unstructured_data["_id"]
                    object_key = f"{source_collection}_{metalake_collection}_{_id}"
                    key_info = {}
                    data = ""
                    for key, value in unstructured_data.items():
                        if key != "_id" and key != "unstructuredData":
                            key_info[key] = value
                        if key == "unstructuredData":
                            data = value

                    bulkwrite_operation = UpdateOne(
                        {"objectKey": object_key},
                        {
                            "$set": {
                                "objectType": 6,
                                "name": object_key,
                                "teamId": ObjectId("6374c3decb468b7a7a68a116"),
                                "isPendingThumbnail": False,
                                "nameInLowerCase": object_key.lower(),
                                "keyInfo": key_info,
                                "data": data,
                                "unstructuredData": True,
                                "updatedAt": datetime.now(),
                            },
                            "$setOnInsert": {
                                "createdAt": datetime.now(),
                                "isLeaf": True,
                                "statPending": True,
                                "statPendingAt": datetime.now(),
                                "objectStatus": 2,
                                "isMetaFieldsPropagationRequired": False,
                                "fileSize": 0,
                                "frameCount": 0,
                                "otherCount": 1,
                                "isMediaProcessingPending": False,
                                "collectionId": collection_id,
                                "url": None,
                                "isAccessible": True,
                                "isVerificationStatusPending": False,
                                "fileType": "unstructuredData",
                                "thumbnailUrl": None,
                            },
                            "$addToSet": {"vCollectionIdList": collection_id},
                        },
                        upsert=True,
                    )
                    bulkwrite_operations.append(bulkwrite_operation)
                datalake_db.bulk_write("MetaData", bulkwrite_operations)
                log_message("batch length: " + str(len(unstructured_data_list)))
                count = len(unstructured_data_list)
                total_count += count
                itr += 1
        log_message(f"total MetaData upsert count: {total_count}")
        log_message("unstructured data process end")


update_unstructured_data_to_metalake()
