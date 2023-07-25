// NOTE: change bucketName to your default bucket name

// 1. set default bucket name for existing files
db.getCollection('MetaData').updateMany({ objectType: { $in: [1, 2, 6] } },
  { $set: { bucketName: 'test-layernext-dev-bucket-1' } }
)

// 2. set existing objectKey as storagePath for existing files in MetaData collection
db.getCollection('MetaData').updateMany(
  { bucketName: 'test-layernext-dev-bucket-1' },
  [{ $set: { "storagePath": "$objectKey" } }]
)

// 3. set existing objectKey as storagePath for existing records in MetaDataUpdate collection (this is only for debug in case of any issue)
db.getCollection('MetaDataUpdate').updateMany(
  {},
  [{ $set: { "storagePath": "$objectKey" } }]
)



// db.getCollection('MetaData').count({ dataCrawlId: { $in: [ObjectId("639b8e053511421c87129c98")] }, objectType: { $in: [1, 2, 6] } })
// db.getCollection('MetaData').count({ dataCrawlId: { $nin: [ObjectId("639b8e053511421c87129c98")] }, objectType: { $in: [1, 2, 6] } })
// db.getCollection('MetaData').count({ objectType: { $in: [1, 2, 6] } })


// 4.
//find distinct image collection ids, video collection ids, other collection ids for cawled data

var imgIds = db.getCollection('DataCrawl').distinct('imageCollectionId')
var videoIds = db.getCollection('DataCrawl').distinct('videoCollectionId')
var otherIds = db.getCollection('DataCrawl').distinct('otherCollectionId')

//make array for above collection ids

var crawledCollectionIds = [
  ...imgIds,
  ...videoIds,
  ...otherIds
]


// 5.

var page = 0;
var size = 10000;

while (true) {

  var dataArr = db.getCollection('MetaData').aggregate(
    [
      { $match: { collectionId: { $nin: crawledCollectionIds }, objectType: { $in: [1, 2, 6] } } },
      { $project: { _id: 1, collectionId: 1, objectKey: 1, name: 1 } },
      { $sort: { _id: 1 } },
      { $skip: page * size },
      { $limit: size },
      {
        $lookup: {
          from: 'MetaData',
          foreignField: '_id',
          localField: 'collectionId',
          as: 'collectionObj'
        }
      },
      { $unwind: '$collectionObj' },
      { $project: { _id: 1, collectionId: 1, objectKey: 1, name: 1, collectionName: '$collectionObj.name' } }
    ],
    {
      allowDiskUse: true
    }
  ).toArray()

  print('page: ' + page + ', size: ' + dataArr.length)

  var count = 0;
  for (var data of dataArr) {
    var _cnt = page * size + count;
    print('count: ' + _cnt)

    var collectionName = data.collectionName;
    var objectKey = data.objectKey;
    var name = data.name;

    var newObjectKey = collectionName + '_' + name;
    print('old: ' + objectKey + ', new: ' + newObjectKey)

    db.getCollection('MetaData').updateOne(
      { _id: data._id },
      {
        $set: {
          objectKey: newObjectKey
        }
      }
    )

    db.getCollection('MetaDataUpdate').updateMany(
      { objectKey: objectKey },
      {
        $set: {
          objectKey: newObjectKey
        }
      }
    )
    count = count + 1;
  }

  if (dataArr.length < size) {
    break;
  }

  page = page + 1;
}



// 6.

var page = 0;
var size = 10000;

while (true) {

  var dataArr = db.getCollection('MetaData').aggregate(
    [
      { $match: { collectionId: { $in: crawledCollectionIds }, objectType: { $in: [1, 2, 6] } } },
      { $project: { _id: 1, collectionId: 1, objectKey: 1, name: 1 } },
      { $sort: { _id: 1 } },
      { $skip: page * size },
      { $limit: size },
      {
        $lookup: {
          from: 'MetaData',
          foreignField: '_id',
          localField: 'collectionId',
          as: 'collectionObj'
        }
      },
      { $unwind: '$collectionObj' },
      { $project: { _id: 1, collectionId: 1, objectKey: 1, name: 1, collectionName: '$collectionObj.name' } }
    ],
    {
      allowDiskUse: true
    }
  ).toArray()

  print('page: ' + page + ', size: ' + dataArr.length)

  var count = 0;
  for (var data of dataArr) {
    var _cnt = page * size + count;
    print('count: ' + _cnt)

    var collectionName = data.collectionName;
    var objectKey = data.objectKey;
    var name = data.name;

    var newObjectKey = collectionName + '_' + objectKey.replace(/_/g, '__').replace(/\//g, '_');
    print('old: ' + objectKey + ', new: ' + newObjectKey)

    db.getCollection('MetaData').updateOne(
      { _id: data._id },
      {
        $set: {
          objectKey: newObjectKey
        }
      }
    )

    db.getCollection('MetaDataUpdate').updateMany(
      { objectKey: objectKey },
      {
        $set: {
          objectKey: newObjectKey
        }
      }
    )
    count = count + 1;
  }

  if (dataArr.length < size) {
    break;
  }

  page = page + 1;
}