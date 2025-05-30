//This will set the analyticsPending flag to true for recalculate model analytics
db.getCollection('MetaDataUpdate').updateMany(
  { analyticsPending: { $exists: true } },
  { $set: { analyticsPending: true, manually_set: true } },
);
