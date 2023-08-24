db.getCollection('MetaData').updateMany(
  {"isAugmentedImage": true, "datasetVersionList": {"$exists": true}},
  {"$set": {"datasetVersionList.$[].isAugmentedImage": true}}
  )
