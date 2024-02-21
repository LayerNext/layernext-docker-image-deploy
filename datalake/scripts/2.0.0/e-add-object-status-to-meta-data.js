print("started adding the objectStatus to the MetaData");

//Add new field to write previous object status,
db.getCollection("MetaData").updateMany({ objectStatus: { $exists: true } }, [
  { $set: { old_object_status: "$objectStatus" } },
]);

//Check if all documents has the flag
// db.getCollection('MetaData').find({ objectStatus: { $exists: true }, old_object_status: { $exists: false } }).count()

//Add Active object status for images,videos and other
db.getCollection("MetaData").updateMany(
  {
    $or: [
      {
        objectType: { $in: [2, 1] },
        $or: [{ isError: { $exists: false } }, { isError: false }],
        isMediaProcessingPending: false,
      },
      { objectType: 6 },
    ],
    isAccessible: true,
    objectStatus: { $ne: 1 },
  },
  { $set: { objectStatus: 2 } }
);

//Add Active object status for other than images,videos and other
db.getCollection("MetaData").updateMany(
  {
    objectType: { $nin: [2, 1, 6, -1] },
    objectStatus: { $ne: 1 },
  },
  { $set: { objectStatus: 2 } }
);

// //Add THRASH object status for images,videos and other
// db.getCollection('MetaData').updateMany(
//   {
//     "$or": [{
//       "objectType": { "$in": [2, 1] },
//       "$or": [
//         { "isError": { "$exists": false } },
//         { "isError": false }
//       ],
//       "isMediaProcessingPending": false
//     },
//     { "objectType": 6 }
//     ],
//     "isAccessible": true,
//     "objectStatus": 1,
//   }
//   , { $set: { objectStatus: 1 } })

// //Add THRASH object status for other than images,videos and other
// db.getCollection('MetaData').updateMany(
//   {
//     "objectType": { "$nin": [2, 1, 6] },
//     "objectStatus": 1
//   }
//   , { $set: { objectStatus: 1 } })

//Add MEDIA_PROCESSING_PENDING object status for other than images and videos
db.getCollection("MetaData").updateMany(
  {
    objectType: { $in: [2, 1] },
    isMediaProcessingPending: true,
  },
  { $set: { objectStatus: 10 } }
);

//Add MEDIA_PROCESSING_FAILED object status for other than images and videos
db.getCollection("MetaData").updateMany(
  {
    isError: true,
    objectType: { $in: [2, 1] },
    isMediaProcessingPending: false,
  },
  { $set: { objectStatus: 8 } }
);

//Add ACCESSED_FAILED object status for other than images and videos
db.getCollection("MetaData").updateMany(
  {
    $or: [
      {
        objectType: { $in: [2, 1] },
        " $or": [{ isError: { $exists: false } }, { isError: false }],
      },
      { objectType: 6 },
    ],
    isAccessible: { $ne: true },
  },
  { $set: { objectStatus: 6 } }
);

//Check if all documents have the flag
// db.getCollection('MetaData').find({ objectStatus: { $exists: false } }).count()

print("The objectStatus has been completely added to the MetaData.");
