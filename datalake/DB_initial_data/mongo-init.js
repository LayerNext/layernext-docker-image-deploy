// create mongodb dump restore user
db.createUser({
  user: _getEnv("DUMP_USER"),
  pwd: _getEnv("DUMP_USER_PWD"),
  roles: [
    { role: "backup", db: "admin" },
    { role: "restore", db: "admin" },
  ],
  mechanisms: ["SCRAM-SHA-1"],
});

// switch to db
db = db.getSiblingDB(_getEnv("DATABASE"));

// create mongodb user
db.createUser({
  user: _getEnv("DB_USER"),
  pwd: _getEnv("DB_PASS"),
  roles: [{ role: "readWrite", db: _getEnv("DATABASE") }],
  mechanisms: ["SCRAM-SHA-1"],
});

//insert default SystemData
db.getCollection("SystemData").insert({
  _id: ObjectId("62c68556ebeb17f23b74823d"),
  teamId: ObjectId(_getEnv("TEAM_ID")),
  apiConfigs: {
    maxSyncInterval: 50000.0,
  },
  totalDataSize: 0,
  objectCounts: {
    total: 0,
    rootImageCount: 0,
    rootVideoCount: 0,
    videos: {
      count: 0,
      frames: 0,
      size: 0,
      length: 0,
      imageCount: 0,
    },
    images: {
      count: 0,
      size: 0,
      imageCount: 0,
    },
    datasets: {
      count: 0,
      frames: 0,
      size: 0,
      imageCount: 0,
    },
    imageCollections: {
      count: 0,
      size: 0,
      frames: 0,
      imageCount: 0,
    },
    videoCollections: {
      count: 0,
      frames: 0,
      size: 0,
      length: 0,
      videoCount: 0,
      frameCollection: 0,
      imageCount: 0,
    },
    other: {
      count: 0,
      size: 0,
      imageCount: 0,
    },
  },
  frameCounts: {
    total: 0,
    raw: 0,
    machineAnnotated: 0,
    verified: 0,
  },
  labelCounts: {},
  cloudStorages: [],
  isDefaultQueryOptionsInserted: false,
  recentMetaDataKeys: [],
  recentTags: [],
  allTags: [],
});

//insert default APIKey
db.getCollection("ApiKey").insert({
  _id: ObjectId("62e92a1ae33130c211632eeb"),
  key:
    "key_" +
    Math.random().toString(36).substr(2, 24) +
    Math.random().toString(36).substr(2, 24) +
    Math.random().toString(36).substr(2, 24),
  secret:
    Math.random().toString(36).substr(2, 24) +
    Math.random().toString(36).substr(2, 24),
  teamId: ObjectId(_getEnv("TEAM_ID")),
  apiConfigs: {
    maxSyncInterval: 50000.0,
  },
  isProcessingLocked: false,
  lastSyncTimestamp: ISODate("2000-01-01T00:00:00.000Z"),
  application: "ANNOTATION_PROJECT",
});

/**
 * insert indexes
 */

// 'InputMetaDataFeed' collection
db.InputMetaDataFeed.createIndex(
  { isActive: 1, apiKey: 1 },
  { name: "isActive_1_apiKey_1" }
);

// 'MetaData' collection

db.MetaData.createIndex({ objectKey: 1 }, { name: "objectKey_1" });
db.MetaData.createIndex({ collectionId: 1 }, { name: "collectionId_1" });
db.MetaData.createIndex({ parentList: 1 }, { name: "parentList_1" });
db.MetaData.createIndex({ objectType: 1 }, { name: "objectType_1" });
db.MetaData.createIndex({ objectStatus: 1 }, { name: "objectStatus_1" });
db.MetaData.createIndex(
  { "labelList.label": 1 },
  { name: "labelList.label_1" }
);
db.MetaData.createIndex({ frameCount: 1 }, { name: "frameCount_1" });
db.MetaData.createIndex(
  { isPendingThumbnail: 1 },
  { name: "isPendingThumbnail_1" }
);
db.MetaData.createIndex({ Tags: 1 }, { name: "Tags_1" });

db.MetaData.createIndex({ dataCrawlId: 1 }, { name: "dataCrawlId_1" });

db.MetaData.createIndex({ datasetGroupId: 1 }, { name: "datasetGroupId_1" });
db.MetaData.createIndex({ name: 1, _id: 1 }, { name: "name_1 _id_1" }); //Change
db.MetaData.createIndex(
  { createdAt: 1, _id: 1 },
  { name: "createdAt_1 _id_1" }
); //Change
db.MetaData.createIndex({ urlExpiredAt: 1 }, { name: "urlExpiredAt_1" });
db.MetaData.createIndex({ taskIdList: 1 }, { name: "taskIdList_1" });
db.MetaData.createIndex(
  { vCollectionIdList: 1 },
  { name: "vCollectionIdList_1" }
);
db.MetaData.createIndex(
  { "verificationStatusCount.raw": 1 },
  { name: "verificationStatusCount.raw_1" }
);
db.MetaData.createIndex(
  { "verificationStatusCount.machineAnnotated": 1 },
  { name: "verificationStatusCount.machineAnnotated_1" }
);
db.MetaData.createIndex(
  { "verificationStatusCount.verified": 1 },
  { name: "verificationStatusCount.verified_1" }
);

db.MetaData.createIndex(
  { isLeaf: 1, statPending: 1, objectStatus: 1, statPendingAt: 1 },
  { name: "isLeaf_1" }
);
db.MetaData.createIndex(
  { annotationStatPending: 1 },
  { name: "annotationStatPending_1" }
);
db.MetaData.createIndex(
  { datasetStatPending: 1, frameAnalyticsCalcAt: 1 },
  { name: "datasetStatPending_1" }
);

db.MetaData.createIndex(
  { isMediaProcessingPending: 1 },
  { name: "isMediaProcessingPending_1" }
);
db.MetaData.createIndex(
  { isVerificationStatusPending: 1 },
  { name: "isVerificationStatusPending_1" }
);
db.MetaData.createIndex(
  { "annotationProjectList.name": 1 },
  { name: "annotationProjectList.name_1" }
);
db.MetaData.createIndex(
  { "annotationProjectList.id": 1 },
  { name: "annotationProjectList.id_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetVersionId": 1 },
  { name: "datasetVersionList.datasetVersionId_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetMetaId": 1 },
  { name: "datasetVersionList.datasetMetaId_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.isNew": 1 },
  { name: "datasetVersionList.isNew_1" }
);

db.MetaData.createIndex(
  { "operationList.operationId": 1 },
  { name: "operationList.operationId_1" }
);
db.MetaData.createIndex(
  { isAugmentedImage: 1 },
  { name: "isAugmentedImage_1" }
);
db.MetaData.createIndex(
  { "augmentationType.id": 1 },
  { name: "augmentationType.id_1" }
);
db.MetaData.createIndex(
  { "augmentationType.property.id": 1 },
  { name: "augmentationType.property.id_1" }
);
db.MetaData.createIndex({ "analytics.operationId": 1 });
db.MetaData.createIndex({ "analytics.precision": 1 });
db.MetaData.createIndex({ "analytics.recall": 1 });
db.MetaData.createIndex({ "analytics.f1Score": 1 });
db.MetaData.createIndex({ "resolution.height": 1 });
db.MetaData.createIndex({ "resolution.width": 1 });
db.MetaData.createIndex({ showInTrash: 1 });
db.MetaData.createIndex({ bucketName: 1 });

db.MetaData.createIndex({ storagePath: 1 });

db.MetaData.createIndex(
  { teamId: 1, objectType: 1 },
  { name: "teamId_1_objectType_1" }
);
// db.MetaData.createIndex(
//   { objectType: 1, isError: 1, teamId: 1 },
//   { name: "objectType_1_isError_1_teamId_1" }
// );

db.MetaData.createIndex(
  { teamId: 1, collectionId: 1, objectStatus: 1 },
  { name: "teamId_1_collectionId_1_objectStatus_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetVersionId": 1, objectType: 1 },
  { name: "datasetVersionList.datasetVersionId_1_objectType_1" }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetVersionId": 1, collectionId: 1 },
  { name: "datasetVersionList.datasetVersionId_1_collectionId_1" }
);
db.MetaData.createIndex(
  {
    "datasetVersionList.datasetVersionId": 1,
    "datasetVersionList.datasetSplitType": 1,
    objectType: 1,
  },
  {
    name: "datasetVersionList.datasetVersionId_1_datasetVersionList.datasetSplitType_1_objectType_1",
  }
);
db.MetaData.createIndex(
  { "datasetVersionList.datasetMetaId": 1, objectType: 1 },
  { name: "datasetVersionList.datasetMetaId_1_objectType_1" }
);

db.MetaData.createIndex(
  { updatedAt: -1, _id: -1 },
  { name: "updatedAt_-1__id_-1" }
);
db.MetaData.createIndex(
  { trashedAt: -1, _id: -1 },
  { name: "trashedAt_-1__id_-1" }
);

db.MetaData.createIndex(
  { sourceVideoId: 1, videoFrameIndex: 1, _id: 1 },
  { name: "sourceVideoId_1_videoFrameIndex_1__id_1" }
);
db.MetaData.createIndex(
  { collectionId: 1, sourceVideoId: 1, videoFrameIndex: 1, _id: -1 },
  { name: "collectionId_1_sourceVideoId_1_videoFrameIndex_1__id_-1" }
);
db.MetaData.createIndex(
  { Tags: 1, updatedAt: -1, _id: -1 },
  { name: "Tags_1_updatedAt_-1__id_-1" }
);

db.MetaData.createIndex({ "customMeta.$**": 1 }, { name: "customMeta.$**_1" });
db.MetaData.createIndex({ fileSize: 1, _id: 1 }, { name: "fileSize_1_id_1" }); //Added

//unique indexes
db.getCollection("MetaData").createIndex(
  { name: 1, objectType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      objectType: 5,
    },
  }
);
db.getCollection("MetaData").createIndex(
  { name: 1, objectType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      objectType: 7,
    },
  }
);

// 'MetaDataUpdate' collection
db.MetaDataUpdate.createIndex({ objectKey: 1 }, { name: "objectKey_1" });
db.MetaDataUpdate.createIndex(
  { objectKey: 1, operationId: 1, operationMode: 1, operationType: 1 },
  { name: "objectKey_1_operationId_1_operationMode_1_operationType_1" }
);
db.MetaDataUpdate.createIndex(
  { objectKey: 1, operationId: 1 },
  { unique: true, name: "objectKey_1_operationId_1" }
);

// 'Job' collection
db.Job.createIndex({ jobName: 1 });
db.Job.createIndex({ jobType: 1 });
db.Job.createIndex({ updatedAt: -1 });
db.Job.createIndex({ status: 1 });
db.Job.createIndex({ createdAt: 1 });


db.getCollection('EmbeddingVector').createIndex(
  {
    objectKey: 1.0,
    modelName: 1.0,
  },
  {
    unique: true,
    name: 'objectKey_1_modelName_1',
  },
);

db.getCollection('SimilarImage').createIndex(
  {
    objectKey: 1,
  },
  {
    name: 'objectKey_1',
  },
);
db.getCollection('SimilarImage').createIndex(
  {
    referenceObjectKey: 1,
    objectKey: 1,
    modelName: 1,
    scoreThreshold: 1,
    score: -1,
  },
  {
    name: 'search',
  },
);

db.getCollection('QueryGraphData').createIndex(
  {
    graphId: 1.0,
    objectKey: 1.0,
  },
  {
    name: 'graphId_1_objectKey_1',
  },
);
db.getCollection('QueryGraphData').createIndex(
  {
    coordinates: '2d',
  },
  {
    name: 'coordinates_2d',
  },
);

db.getCollection('MetaData').createIndex(
  {objectKey: 1},
  {
    unique: true,
    partialFilterExpression: {objectKey: {$exists: true}},
  },
);


//Create metadata index for name in lowercase
db.MetaData.createIndex({nameInLowerCase: 1, _id: 1}, {name: 'nameInLowerCase_1 _id_1'});