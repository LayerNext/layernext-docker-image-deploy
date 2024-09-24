let document_sections = [
    "bill",
    "certificate",
    "email",
    "memo",
    "notice",
    "schedule",
    "transcript"
];

db.getCollection('SystemData').updateOne(
  {
    "dataDictionaryMapping": { $exists: true } 
  },
  {
    $addToSet: {
      "dataDictionaryMapping.mappingsList.$[element].sections": {
        $each: document_sections
      }
    },
    $set: {
      "dataDictionaryMapping.modifiedDate": new Date()
    }
  },
  {
    arrayFilters: [
      {
        "element.source": "documents",
        "element.type": "documents"
      }
    ]
  }
);