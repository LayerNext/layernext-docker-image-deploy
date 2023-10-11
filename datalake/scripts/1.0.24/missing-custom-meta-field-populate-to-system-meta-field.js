function addMissingMetaFieldsToSystem() {
  var missingFields = db
    .getCollection("MetaData")
    .aggregate([
      {
        $project: {
          keyValueArray: {
            $objectToArray: "$customMeta",
          },
        },
      },
      {
        $unwind: "$keyValueArray",
      },
      {
        $group: {
          _id: "$keyValueArray.k",
        },
      },
      {
        $lookup: {
          from: "MetaField",
          localField: "_id",
          foreignField: "fieldName",
          as: "systemMetaField",
        },
      },
      {
        $match: {
          systemMetaField: { $eq: [] },
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ])
    .toArray();

  function formatMetaField(field) {
    var uniqueName = field._id
      .toLowerCase()
      .trim()
      .replace(/[^0-9A-Z]+/gi, "");
    var metaFieldObject = {
      fieldName: field._id,
      fieldType: 1,
      options: [],
      teamId: ObjectId("6374c3decb468b7a7a68a116"),
      uniqueName: uniqueName,
      lastModifiedAt: new Date(),
      modifiedBy: "Update-Script",
    };
    return metaFieldObject;
  }

  var metaFieldArray = missingFields.map(formatMetaField);
  // 	print(metaFieldArray);

  db.getCollection("MetaField").insertMany(metaFieldArray);
}
addMissingMetaFieldsToSystem();
