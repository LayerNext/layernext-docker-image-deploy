
var page = 0;
var size = 25000;
while (true) {
    var dataArr = db.getCollection('InputMetaDataFeed').aggregate(
        [
            { $sort: { _id: 1 } },
            { $skip: page * size },
            { $limit: size },
            { $project: { _id: 1, objectKey: 1, fileUploadId: '$metaDataObject.fileUploadId', metaDataObjectObjectKey: '$metaDataObject.objectKey' } }
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
        print('objectKey: ' + data.objectKey)

        if (data.objectKey && data.fileUploadId) {
            print('true 1')
            db.getCollection('MetaData').updateOne(
                { $or: [{ objectKey: data.objectKey }, { storagePath: data.objectKey }] },
                {
                    $addToSet: {
                        fileUploadIdList: data.fileUploadId
                    }
                }
            )
        }
        else if (data.metaDataObjectObjectKey && data.fileUploadId) {
            print('true 2')
            db.getCollection('MetaData').updateOne(
                { $or: [{ objectKey: data.metaDataObjectObjectKey }, { storagePath: data.metaDataObjectObjectKey }] },
                {
                    $addToSet: {
                        fileUploadIdList: data.fileUploadId
                    }
                }
            )
        }
        count = count + 1
    }

    if (dataArr.length < size) {
        break;
    }
    page = page + 1

}


db.MetaData.createIndex({ "fileUploadIdList": 1 }, { name: 'fileUploadIdList_1' })

