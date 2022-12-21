// create mongodb user
db.createUser(
    {
    user: _getEnv('DB_USER'),
    pwd: _getEnv('DB_PASS'),
    roles: [{role: "readWrite", db: _getEnv('MONGO_INITDB_DATABASE')}],
      mechanisms:["SCRAM-SHA-1"]
    }
  );

db.createUser(
  {
    user: _getEnv('DUMP_USER'),
    pwd: _getEnv('DUMP_USER_PWD'),
    roles: [ "backup", "restore"],
    mechanisms: ["SCRAM-SHA-1"]
  }
);

//insert default SystemData
db.getCollection('SystemData').insert({

  "_id": ObjectId("62c68556ebeb17f23b74823d"),
  "teamId": ObjectId("6374c3decb468b7a7a68a116"),
  "apiConfigs": {
    "maxSyncInterval": 50000.0
  },
  "totalDataSize": 365510868200.0,
  "objectCounts": {
    "total": 0,
    "rootImageCount": 0,
    "rootVideoCount": 0,
    "videos": {
      "count": 0,
      "frames": 0,
      "size": 0.0,
      "length": 0,
      "imageCount": 0
    },
    "images": {
      "count": 0,
      "size": 0.0,
      "imageCount": 0
    },
    "datasets": {
      "count": 0,
      "frames": 0,
      "size": 0,
      "imageCount": 0
    },
    "imageCollections": {
      "count": 0,
      "size": 0.0,
      "frames": 0,
      "imageCount": 0
    },
    "videoCollections": {
      "count": 0,
      "frames": 0,
      "size": 0.0,
      "length": 0.0,
      "videoCount": 0,
      "frameCollection": 0,
      "imageCount": 0
    },
    "other": {
      "count": 0,
      "size": 0,
      "imageCount": 0
    }
  },
  "frameCounts": {
    "total": 0,
    "raw": 0,
    "machineAnnotated": 0,
    "verified": 0
  },
  "labelCounts": {},
  "cloudStorages": [
    {
      "storageType": "AWS_S3",
      "storageName": _getEnv('AWS_BUCKET_NAME'),
      "connectionStatus": 1,
      "updatedAt": ISODate("2022-12-01T06:11:59.861Z")
    }
  ],
  "isDefaultQueryOptionsInserted": false,
  "recentMetaDataKeys": [],
  "recentTags": [],
  "allTags": []
})

//insert default APIKey
db.getCollection('ApiKey').insert({
  "_id": ObjectId("62e92a1ae33130c211632eeb"),
  "key": "key_f3saacoc7xd67lychexxs0e5sky4p0q0",
  "secret": "sd2n18fw3omid1lrokrd",
  "teamId": ObjectId("6374c3decb468b7a7a68a116"),
  "apiConfigs": {
    "maxSyncInterval": 50000.0
  },
  "isProcessingLocked": false,
  "lastSyncTimestamp": ISODate("2022-09-30T10:05:00.018Z"),
  "application": "ANNOTATION_PROJECT"
})


// insert indexes
db.InputMetaDataFeed.createIndex({"isActive": 1, "apiKey": 1}, {name: 'isActive_1_apiKey_1'})
db.MetaData.createIndex({"objectKey": 1}, {name: 'objectKey_1'})
db.MetaData.createIndex({"collectionId": 1}, {name: 'collectionId_1'})
db.MetaData.createIndex({"parentList": 1}, {name: 'parentList_1'})
db.MetaData.createIndex({"teamId": 1}, {name: 'teamId_1'})
db.MetaData.createIndex({"objectType": 1}, {name: 'objectType_1'})
db.MetaData.createIndex({"annotationProjectList.name": 1}, {name: 'annotationProjectList.name_1'})
db.MetaData.createIndex({"teamId": 1, "objectType": 1}, {name: 'teamId_1_objectType_1'})
db.MetaData.createIndex({"labelList.label": 1}, {name: 'labelList.label_1'})
db.MetaData.createIndex({"updatedAt": -1}, {name: 'updatedAt_-1__id_-1'})
db.MetaData.createIndex({"objectType": 1, "isError": 1, "teamId": 1}, {name: 'objectType_1_isError_1_teamId_1'})
db.MetaData.createIndex({"teamId": 1, "collectionId": 1}, {name: 'teamId_1_collectionId_1'})
db.MetaData.createIndex({"videoFrameIndex": 1}, {name: 'videoFrameIndex_1'})
db.MetaData.createIndex({"teamId": 1, "collectionId": 1, "url": 1, "isError": 1}, {name: 'teamId_1_collectionId_1_url_1_isError_1'})
db.MetaData.createIndex({"frameCount": 1}, {name: 'frameCount_1'})
db.MetaData.createIndex({"$**": 1}, {name: '$**_1'})
db.MetaDataUpdate.createIndex({"objectKey": 1}, {name: 'objectKey_1'})
db.MetaDataUpdate.createIndex({"objectKey": 1, "operationId": 1, "operationMode": 1, "operationType": 1}, {name: 'objectKey_1_operationId_1_operationMode_1_operationType_1'})
