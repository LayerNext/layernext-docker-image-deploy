db.getCollection('SystemData').updateOne(
  {
    "dataDictionaryMapping": { $exists: true } 
  },
  {
    $addToSet: {
      "dataDictionaryMapping.mappingsList.$[element].sections": "proposal"
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
