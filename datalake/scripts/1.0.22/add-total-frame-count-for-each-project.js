var idListObj = db
  .getCollection("AnnotationProject")
  .aggregate([
    {
      $project: {
        _id: true,
      },
    },
    {
      $group: {
        _id: null,
        idList: {
          $push: "$_id",
        },
      },
    },
    {
      $project: {
        _id: 0,
        idList: 1,
      },
    },
  ])
  .toArray();

var idList = idListObj[0].idList;
var length = idList.length;
print("Total project count: ", length);
var count = 0;

for (var projectId of idList) {
  print("count progress: ", count++, "/", length);
  var frameCountObj = db
    .getCollection("AnnotationTask")
    .aggregate([
      {
        $match: {
          projectId: projectId,
        },
      },
      {
        $group: {
          _id: null,
          totalFrameCount: { $sum: "$frameCount" },
        },
      },
    ])
    .toArray();

  if (frameCountObj.length > 0) {
    var totalFramesCount = frameCountObj[0].totalFrameCount;
    print(
      "project id: " +
        projectId.toString() +
        ", frame count: " +
        totalFramesCount
    );
    db.getCollection("AnnotationProject").updateOne(
      { _id: projectId },
      {
        $set: {
          "statsSummary.totalFramesCount":
            totalFramesCount !== undefined ? NumberInt(totalFramesCount) : 0,
        },
      }
    );
  } else {
    print("project id: " + projectId.toString() + ", frame count: " + 0);
    db.getCollection("AnnotationProject").updateOne(
      { _id: projectId },
      {
        $set: {
          "statsSummary.totalFramesCount": NumberInt(0),
        },
      }
    );
  }
}
