try {
  print('adding nameInLowerCase to MetaData');
  db.getCollection('MetaData').updateMany({nameInLowerCase: {$exists: false}}, [
    {
      $set: {
        nameInLowerCase: {
          $cond: {
            if: {$and: [{$eq: [{$type: '$name'}, 'string']}, {$ne: ['$name', '']}]},
            then: {$toLower: '$name'},
            else: '',
          },
        },
      },
    },
  ]);

  db.MetaData.createIndex({nameInLowerCase: 1, _id: 1}, {name: 'nameInLowerCase_1 _id_1'});
  var nameInLowerCaseNoTExisted = db.getCollection('MetaData').count({nameInLowerCase: {$exists: false}});

  if (nameInLowerCaseNoTExisted == 0) print('nameInLowerCase added successfully');
  else print(`nameInLowerCase added failed and failed count :${nameInLowerCaseNoTExisted}`);

  var indexes = db.getCollection('MetaData').getIndexes();

  var indexExists = false;
  indexes.forEach(function (index) {
    if (index.name === 'objectType_1_isError_1_teamId_1') {
      indexExists = true;
    }
  });

  if (indexExists) {
    db.MetaData.dropIndex({objectType: 1, isError: 1, teamId: 1});
    print("The 'objectType_1_isError_1_teamId_1' index exists in the collection.");
  } else {
    print("The 'objectType_1_isError_1_teamId_1' index does not exist in the collection.");
  }
} catch (e) {
  print('adding nameInLowerCase to MetaData failed');
  print(e);
}
