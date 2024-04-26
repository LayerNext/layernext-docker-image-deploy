import json
import os
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv

load_dotenv()

DATALAKE_MONGO_USERNAME = os.getenv("DATALAKE_MONGO_USERNAME")
DATALAKE_MONGO_PASSWORD = os.getenv("DATALAKE_MONGO_PASSWORD")
DATALAKE_MONGO_PORT = os.getenv("DATALAKE_MONGO_PORT")
DATALAKE_MONGO_DB_NAME = os.getenv("DATALAKE_MONGO_DB_NAME")
DATALAKE_MONGO_HOST = os.getenv("DATALAKE_MONGO_HOST")

CONNECTION_MONGO_USERNAME = os.getenv("CONNECTION_MONGO_USERNAME")
CONNECTION_MONGO_PASSWORD = os.getenv("CONNECTION_MONGO_PASSWORD")
CONNECTION_MONGO_PORT = os.getenv("CONNECTION_MONGO_PORT")
CONNECTION_DB_NAME = os.getenv("CONNECTION_DB_NAME")
CONNECTION_MONGO_HOST = os.getenv("CONNECTION_MONGO_HOST")

WORK_DIR = os.getenv("WORK_DIR")


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


def update_unstructured_data_to_metalake():

    log_message("unstructured data process start")
    # MongoDB client connection
    datalake_client = MongoClient(
        f"mongodb://{DATALAKE_MONGO_USERNAME}:{DATALAKE_MONGO_PASSWORD}@{DATALAKE_MONGO_HOST}:{DATALAKE_MONGO_PORT}/{DATALAKE_MONGO_DB_NAME}?authSource={DATALAKE_MONGO_DB_NAME}"
    )
    datalake_db = datalake_client[f"{DATALAKE_MONGO_DB_NAME}"]

    connection_client = MongoClient(
        f"mongodb://{CONNECTION_MONGO_USERNAME}:{CONNECTION_MONGO_PASSWORD}@{CONNECTION_MONGO_HOST}:{CONNECTION_MONGO_PORT}/"
    )
    connection_db = connection_client[CONNECTION_DB_NAME]

    # result = datalake_db["Connection"].find_one(
    #     {"sourceName": "DCCHail"}, {"unstructuredCollections": 1}
    # )

    result_array = list(
        datalake_db["Connection"].find({}, {"unstructuredCollections": 1})
    )

    if result_array and len(result_array) > 0:
        for result in result_array:
            if "unstructuredCollections" not in result:
                continue
            for unstructured_collection in result["unstructuredCollections"]:
                pipeline = json.loads(unstructured_collection["dataAggregation"])
                source_collection = unstructured_collection["sourceCollection"]
                metalake_collection = unstructured_collection["metalakeCollection"]
                log_message(
                    f"source collection: {source_collection} | metalake collection: {metalake_collection} | pipeline: {pipeline}"
                )

                metalake_collection_details = datalake_db["MetaData"].find_one(
                    {"name": metalake_collection, "objectType": 7}
                )
                collection_id = ""
                if metalake_collection_details is not None:
                    collection_id = metalake_collection_details["_id"]
                else:
                    # Insert the document
                    insert_result = datalake_db["MetaData"].insert_one(
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
                        }
                    )

                    # Retrieve the ID of the inserted document
                    collection_id = insert_result.inserted_id
                limit = 1000
                itr = 0
                count = 1000
                total_count = 0
                while count == 1000:
                    temp_pipeline = list(pipeline)
                    temp_pipeline.append({"$skip": limit * itr})
                    temp_pipeline.append({"$limit": limit})
                    unstructured_data_list = list(
                        connection_db[source_collection].aggregate(temp_pipeline)
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
                    datalake_db["MetaData"].bulk_write(bulkwrite_operations)
                    log_message("batch length: " + str(len(unstructured_data_list)))
                    count = len(unstructured_data_list)
                    total_count += count
                    itr += 1
            log_message(f"total MetaData upsert count: {total_count}")
            log_message("unstructured data process end")
