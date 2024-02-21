db.getCollection('MetaData').createIndex(
  {objectKey: 1},
  {
    unique: true,
    partialFilterExpression: {objectKey: {$exists: true}},
  },
);
