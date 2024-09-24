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
  