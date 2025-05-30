print("started adding the storagePrefixPath to the relevant collection");

var layerNextAugCollectionIdList = db
  .getCollection("MetaData")
  .distinct("collectionId", { storagePath: /^LayerNext\/augmentations/ });
var layerNextDatasetCollectionIdList = db
  .getCollection("MetaData")
  .distinct("collectionId", {
    storagePath: /^LayerNext\/datasets/,
    objectType: 6,
  });
var layerNextVideoCollectionIdList = db
  .getCollection("MetaData")
  .distinct("collectionId", { storagePath: /^LayerNext\/video-frames/ });

print(`AugmentedCollectionListLength : ${layerNextAugCollectionIdList.length}`);
print(
  `DatasetCollectionListLength : ${layerNextDatasetCollectionIdList.length}`
);
print(
  `VideoFrameCollectionListLength : ${layerNextVideoCollectionIdList.length}`
);

print("started adding the storagePrefixPath to the relevant collection");

if (layerNextAugCollectionIdList && layerNextAugCollectionIdList.length > 0) {
  db.getCollection("MetaData").updateMany(
    {
      _id: { $in: layerNextAugCollectionIdList },
      storagePrefixPath: { $exists: false },
    },
    {
      $set: { storagePrefixPath: "LayerNext/augmentations" },
    }
  );
}

print(
  "The storagePrefixPath has been completely added to the augmentation collections."
);

if (
  layerNextDatasetCollectionIdList &&
  layerNextDatasetCollectionIdList.length > 0
) {
  db.getCollection("MetaData").updateMany(
    {
      _id: { $in: layerNextDatasetCollectionIdList },
      storagePrefixPath: { $exists: false },
    },
    {
      $set: { storagePrefixPath: "LayerNext/datasets" },
    }
  );
}

print(
  "The storagePrefixPath has been completely added to the dataset collections."
);

if (
  layerNextVideoCollectionIdList &&
  layerNextVideoCollectionIdList.length > 0
) {
  db.getCollection("MetaData").updateMany(
    {
      _id: { $in: layerNextVideoCollectionIdList },
      storagePrefixPath: { $exists: false },
    },
    {
      $set: { storagePrefixPath: "LayerNext/video-frames" },
    }
  );
}

print(
  "The storagePrefixPath has been completely added to the video frame collections."
);
