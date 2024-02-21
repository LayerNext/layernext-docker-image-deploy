function embeddingModelNameQueryOptionUpdate(id, teamId) {
  var param = [
    {$match: {vCollectionIdList: id}},
    {$unwind: '$embeddingModels'},
    {
      $group: {
        _id: null,
        uniqueModel: {$addToSet: '$embeddingModels.modelName'},
      },
    },
  ];

  var aggregateRes = db.getCollection('MetaData').aggregate(param).toArray();
  if (!Array.isArray(aggregateRes) || aggregateRes.length === 0) return;
  var embeddingModelList = aggregateRes[0].uniqueModel;
  if (!Array.isArray(embeddingModelList) || embeddingModelList.length === 0) return;

  var updateArray = embeddingModelList.map(model => {
    return {
      updateOne: {
        filter: {
          collectionId: id,
          keyGroup: 'analytics.embeddingModel',
          key: model,
          teamId: teamId,
        },
        update: {
          $set: {
            operators: ['=', '!='],
            collectionId: id,
            keyGroup: 'analytics.embeddingModel',
            key: model,
            isRootGroup: false,
            teamId: teamId,
          },
        },
        upsert: true,
      },
    };
  });

  return updateArray;
}

var pendingList = db
  .getCollection('MetaData')
  .aggregate([
    {
      $match: {
        isFeatureGraphPending: {$exists: true},
      },
    },
    {$group: {_id: null, idArray: {$addToSet: '$_id'}}},
  ])
  .toArray();

//Get system data to get the team Id
var systemData = db.getCollection('SystemData').find({}).toArray();
var teamId = systemData[0].teamId;
var isError = false;
var idArray = pendingList[0].idArray;

//Update/Add embedding query option
for (var id of idArray) {
  try {
    var update = [
      {
        updateOne: {
          filter: {
            collectionId: id,
            keyGroup: 'analytics',
            key: 'embeddingModel',
            teamId: teamId,
          },
          update: {
            $set: {
              operators: ['.'],
              collectionId: id,
              keyGroup: 'analytics',
              isRootGroup: true,
              key: 'embeddingModel',
              teamId: teamId,
            },
          },
          upsert: true,
        },
      },
    ];
    var updateArray = embeddingModelNameQueryOptionUpdate(id, teamId);
    if (Array.isArray(updateArray) && updateArray.length > 0) {
      update = [...update, ...updateArray];
    }

    db.getCollection('QueryOption').bulkWrite(update);
  } catch (e) {
    print('embedding query option add for collection: ' + id + 'failed');
    print(e);
    isError = true;
    continue;
  }
}

if (isError) {
  print('embedding query option add for collection failed');
} else {
  print('embedding query option add for collection successfully completed');
}
