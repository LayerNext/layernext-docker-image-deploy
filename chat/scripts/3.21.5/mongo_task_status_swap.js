print("Starting status interchange for AutomationTask collection...");
const result = db.AutomationTask.updateMany({ status: { $in: [10, 20] } }, [
  {
    $set: {
      status: {
        $switch: {
          branches: [
            { case: { $eq: ["$status", 10] }, then: 20 },
            { case: { $eq: ["$status", 20] }, then: 10 },
          ],
          default: "$status",
        },
      },
    },
  },
]);

print("Update operation completed.");
print("Matched documents: " + result.matchedCount);
print("Modified documents: " + result.modifiedCount);
print("Acknowledged: " + result.acknowledged);
