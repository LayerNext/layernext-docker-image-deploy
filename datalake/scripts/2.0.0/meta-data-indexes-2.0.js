db.MetaData.dropIndexes();

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
db.MetaData.createIndex(
  { objectType: 1, isError: 1, teamId: 1 },
  { name: "objectType_1_isError_1_teamId_1" }
);

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
