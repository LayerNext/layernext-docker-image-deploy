db.getCollection("AnnotationHistory").createIndex(
  { dateTime: 1 },
  {
    expireAfterSeconds: 15770000,
  }
);
print("Index created for AnnotationHistory collection");
