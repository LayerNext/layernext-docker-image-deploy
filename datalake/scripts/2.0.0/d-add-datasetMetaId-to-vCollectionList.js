print("started adding the datasetMetaId to the vCollectionList");

var idListObj = db
  .getCollection("MetaData")
  .aggregate([
    {
      $match: { objectType: 3 },
    },
    {
      $group: {
        _id: null,
        idList: { $addToSet: "$_id" },
      },
    },
  ])
  .toArray();

var idList = idListObj[0]["idList"];

print(`Total dataset : ${idList.length}`);
var count = 0;

for (var oId of idList) {
  count = count + 1;
  print(`Progress : ${count}/${idList.length}`);
  db.getCollection("MetaData").updateMany(
    {
      "datasetVersionList.datasetMetaId": oId,
      objectType: 2,
    },
    {
      $addToSet: { vCollectionIdList: oId },
    }
  );
}

print("The datasetMetaId has been completely added to the vCollectionList.");
