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
