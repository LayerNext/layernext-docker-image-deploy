var projects = db
  .getCollection('AnnotationProject')
  .find({name: {$exists: true}})
  .toArray();

for (var project of projects) {
  db.ProjectJob.insert({
    projectId: project._id,
    time: new Date(),
    jobId: new ObjectId(),
    jobType: 5,
    status: 2,
    isOldProject: true,
  });
}
