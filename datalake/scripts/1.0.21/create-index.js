db.getCollection('MetaData').dropIndex("datasetVersionList.datasetVersionId_1_collectionId_1")
db.getCollection('MetaData').createIndex({"bucketName": 1})
db.getCollection('MetaData').createIndex({"storagePath": 1})
