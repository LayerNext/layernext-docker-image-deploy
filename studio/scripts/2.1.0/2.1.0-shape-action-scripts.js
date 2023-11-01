db.getCollection('AnnotationUser').updateMany({}, {$set: {shapeActionDailyStats: [], shapeActionMonthlyStats: []}});

db.getCollection('ShapeAction').createIndex({time: 1}, {expireAfterSeconds: 5260000});

db.getCollection('ShapeAction').createIndex({userId: 1, time: 1});

var users = db.getCollection('AnnotationUser').find({}).toArray();

for (var user of users) {
  //print(user)
  var dailyStats = [];
  if (user.annotationStats && user.annotationStats.dailyStats && Array.isArray(user.annotationStats.dailyStats)) {
    for (var dailyStat of user.annotationStats.dailyStats) {
      dailyStats.push({
        date: dailyStat.date,
        addedShapeCount: dailyStat.completedBoxes,
        deletedShapeCount: 0,
        notChangedShapeCount: 0,
        modifiedCount: 0,
      });
    }
  }
  var monthlyStats = [];
  if (user.annotationStats && user.annotationStats.monthlyStats && Array.isArray(user.annotationStats.monthlyStats)) {
    for (var monthlyStat of user.annotationStats.monthlyStats) {
      monthlyStats.push({
        date: monthlyStat.date,
        addedShapeCount: monthlyStat.completedBoxes,
        deletedShapeCount: 0,
        notChangedShapeCount: 0,
        modifiedCount: 0,
      });
    }
  }
  //     print(dailyStats)
  //     print(monthlyStats)
  db.getCollection('AnnotationUser').updateOne(
    {_id: user._id},
    {$set: {shapeActionDailyStats: dailyStats, shapeActionMonthlyStats: monthlyStats}},
  );
}
