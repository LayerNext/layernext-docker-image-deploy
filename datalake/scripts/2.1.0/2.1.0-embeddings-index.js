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
