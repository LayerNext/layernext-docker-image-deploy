print("started adding the customMeta to the relevant collection");

var collectionArray = db
  .getCollection("MetaData")
  .find({ objectType: { $in: [4, 5, 7] } })
  .toArray();

for (var collection of collectionArray) {
  //         print(collection)
  print({ _id: collection._id });
  var customMeta = {};
  if (
    collection.collectionHeadOnlyMeta &&
    collection.collectionHeadOnlyMeta.customMeta
  ) {
    customMeta = collection.collectionHeadOnlyMeta.customMeta;
  }
  if (collection.customMeta) {
    for (var key in collection.customMeta) {
      if (
        Array.isArray(collection.customMeta[key]) &&
        collection.customMeta[key].length == 1
      ) {
        //             print({[key]: collection.customMeta[key][0]})
        customMeta[key] = collection.customMeta[key][0];
      } else {
        customMeta[key] = collection.customMeta[key];
      }
    }
    //     print(customMeta)
  }
  db.getCollection("MetaData").updateOne(
    { _id: collection._id },
    { $set: { customMeta: customMeta } }
  );
}

print("The customMeta has been completely added to the relevant collection.");
