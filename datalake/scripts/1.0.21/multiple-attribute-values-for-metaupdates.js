
var page = 0;
var size = 10000;

while (true) {

  var dataArr = db.getCollection('MetaDataUpdate').aggregate(
    [
      { $match: { operationType: 1} },
      { $sort: { _id: 1 } },
      { $skip: page * size },
      { $limit: size }
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
    print(data.objectKey)

    if (Array.isArray(data.annotationObjects)) {
      var _annotationObjects = []
      for (var anno of data.annotationObjects) {
        // print(anno)

        var confidence = 0
        if (data.operationType == 1 && data.operationMode == 1) {
          confidence = 1
        } else if (data.operationType == 1 && data.operationMode == 2) {
          if (anno.confidence) {
            confidence = anno.confidence
          }
        } else {
          break
        }
        anno['confidence'] = confidence
        anno['metadata'] = {}

        if (anno.label && anno.label.attributeValues) {
          var _attrs = {}
          for (const attr in anno.label.attributeValues) {
            //print(`${attr}: ${anno.label.attributeValues[attr]}`);
            if (Array.isArray(anno.label.attributeValues[attr])) {
              continue
            } else {
              _attrs[attr] = [{
                value: anno.label.attributeValues[attr],
                confidence: confidence,
                metadata: {}
              }]
            }
          }
          anno.label.attributeValues = _attrs
        }

        //print(anno)
        _annotationObjects.push(anno)
      }
      //data.annotationObjects = _annotationObjects
      //print(data)
      db.getCollection('MetaDataUpdate').updateOne(
        { _id: data._id },
        { $set: { annotationObjects: _annotationObjects } }
      )
    }



    count = count + 1;
  }


  if (dataArr.length < size) {
    break;
  }

  page = page + 1;

}
