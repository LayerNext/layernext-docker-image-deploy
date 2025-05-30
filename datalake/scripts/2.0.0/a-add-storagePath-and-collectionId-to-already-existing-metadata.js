print(
  "Started to add storagePath and collectionId to already existing metadata"
);

var uniqueNamesObj = db
  .getCollection("MetaData")
  .aggregate([
    {
      $match: {
        objectType: { $in: [4, 5, 7] },
        storagePath: { $exists: false },
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

var duplicateNamesObj = db
  .getCollection("MetaData")
  .aggregate([
    {
      $match: { objectType: { $in: [4, 5, 7] } },
    },
    {
      $group: {
        _id: { name: "$name" },
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
    {
      $group: {
        _id: null,
        uniqueCollectionNames: { $addToSet: "$_id.name" },
      },
    },
  ])
  .toArray();

var duplicateNamesArray = duplicateNamesObj[0]["uniqueCollectionNames"];
print(`Total duplicate names: ${duplicateNamesArray.length}`);

var systemData = db.getCollection("SystemData").find({}).toArray()[0];
var teamId = systemData.teamId;

var insertObjSrorageMapping = {
  collectionStoragePath: "",
  isDefaultBucketCrawledCollection: false,
  teamId: teamId,
  createdAt: new Date(),
  collectionId: "",
};

var count1 = 0;
print("started to add dupliacte names to StorageMapping collection");
for (var duplicateName of duplicateNamesArray) {
  count1 = count1 + 1;
  print(`progress: ${count1}/${duplicateNamesArray.length}`);
  insertObjSrorageMapping.collectionStoragePath = duplicateName;
  var isExist = db
    .getCollection("StorageMapping")
    .aggregate([{ $match: { collectionStoragePath: duplicateName } }])
    .toArray();
  if (isExist.length == 0) {
    db.getCollection("StorageMapping").insertOne(insertObjSrorageMapping);
  } else {
    print(`${duplicateName} already exists in StorageMapping collection`);
  }
}
var count2 = 0;
print(
  "Started to iterate all collection. Total collection: ",
  uniqueNamesObj.length
);
for (var nameObj of uniqueNamesObj) {
  count2 = count2 + 1;
  print(`progress = ${count2}/${uniqueNamesObj.length}`);
  var collectionId = nameObj["_id"];
  var collectionName = nameObj["name"];
  var isExist = false;
  var count = 0;

  var filteredCollectionName = collectionName
    .replace(/%20/g, " ")
    .replace(/[^a-zA-Z0-9\-_ ]/g, "_");

  do {
    uniqueName = `${filteredCollectionName}${count ? `_${count}` : ""}`;
    var isExistObj = db
      .getCollection("StorageMapping")
      .aggregate([{ $match: { collectionStoragePath: uniqueName } }])
      .toArray();

    if (isExistObj && isExistObj.length > 0) {
      print("storagePath already exists");
      isExist = true;
      count += 1;
    } else {
      insertObjSrorageMapping.collectionStoragePath = uniqueName;
      insertObjSrorageMapping.collectionId = collectionId;
      db.getCollection("StorageMapping").insertOne(insertObjSrorageMapping);
      db.getCollection("MetaData").updateOne(
        { _id: collectionId },
        {
          $set: { storagePath: uniqueName },
        }
      );
      db.getCollection("MetaData").updateMany(
        { collectionId: collectionId },
        {
          $addToSet: { vCollectionIdList: collectionId },
        }
      );
      print(
        `storagePath: ${uniqueName} & vCollectionIdList: ${collectionId} successfully added.`
      );
      isExist = false;
    }
  } while (isExist);
}

print(
  "Completed to add storagePath and collectionId to already existing metadata"
);
