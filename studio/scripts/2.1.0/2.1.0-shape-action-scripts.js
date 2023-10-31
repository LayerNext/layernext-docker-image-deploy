db.getCollection('AnnotationUser').updateMany({}, {$set: {shapeActionDailyStats: [], shapeActionMonthlyStats: []}});

db.getCollection('ShapeAction').createIndex({time: 1}, {expireAfterSeconds: 5260000});

db.getCollection('ShapeAction').createIndex({userId: 1, time: 1});
