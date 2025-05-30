print("Start adding augmentationCollectionId to related belong collection");

var augmentedCollection = db
  .getCollection("MetaData")
  .aggregate([
    {
      $match: {
        collectionType: 2,
        objectType: 5,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ])
  .toArray();

var totalCollection = augmentedCollection.length;
print(`Total augmentation collection: ${totalCollection}`);
var count = 0;

for (var collectionObj of augmentedCollection) {
  count = count + 1;
  print(`progress: ${count}/${totalCollection}`);
  var augmentedCollectionId = collectionObj["_id"];
  var augmentedCollectionName = collectionObj["name"];
  var collectionName = augmentedCollectionName.split("_augmentations")[0];
  //     print(collectionName)
  var isExistObj = db
    .getCollection("MetaData")
    .aggregate([
      {
        $match: {
          name: collectionName,
          objectType: 5,
          augmentationCollectionId: { $exists: false },
        },
      },
    ])
    .toArray();
  //     print(isExistObj)
  if (isExistObj && isExistObj.length > 0) {
    db.getCollection("MetaData").updateOne(
      {
        name: collectionName,
        objectType: 5,
        augmentationCollectionId: { $exists: false },
      },
      {
        $set: { augmentationCollectionId: augmentedCollectionId },
      }
    );
    print(
      "augmentationCollectionId successfully added. | ",
      augmentedCollectionId
    );
  } else {
    print(
      `AugmentationCollectionId already exists or can not find collection: ${collectionName} , augmentedCollection: ${augmentedCollectionName} `
    );
  }
}

// remove isLogicalFlag from MetaData
print("removing isLogicalFlag from MetaData");
db.getCollection("MetaData").updateMany(
  { isLogical: { $exists: true } },
  { $unset: { isLogical: "" } }
);
print("removing isLogicalFlag from MetaData completed");
