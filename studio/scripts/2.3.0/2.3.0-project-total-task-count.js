var projects = db.getCollection('AnnotationProject').find({}).toArray();

for (var project of projects) {
  let count = db.getCollection('AnnotationTask').count({projectId: project._id});
  print(count);
  db.getCollection('AnnotationProject').updateOne({_id: project._id}, {$set: {totalTaskCount: count}});
}
