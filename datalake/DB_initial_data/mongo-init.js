// create mongodb user
db.createUser(
    {
    user: _getEnv('DB_USER'),
    pwd: _getEnv('DB_PASS'),
    roles: [{role: "readWrite", db: _getEnv('MONGO_INITDB_DATABASE')}],
      mechanisms:["SCRAM-SHA-1"]
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
  "isDefaultQueryOptionsInserted": true,
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