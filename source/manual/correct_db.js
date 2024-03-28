db = db.getSiblingDB("Dcchail");

db.getCollection("Job").updateMany({ repairBookedDate: { $exists: true } }, [
  {
    $set: {
      repairBookedDate: {
        $toDate: "$repairBookedDate",
      },
    },
  },
]);

db.getCollection("Job").updateMany(
  { bookedForEstimateDate: { $exists: true } },
  [
    {
      $set: {
        bookedForEstimateDate: {
          $toDate: "$bookedForEstimateDate",
        },
      },
    },
  ]
);
