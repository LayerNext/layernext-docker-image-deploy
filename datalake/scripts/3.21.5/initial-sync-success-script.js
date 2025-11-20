print('Starting migration: Adding isInitialSyncCompleted flag to existing DataSourceAuthorization records...');

// Count records where the field does NOT exist
var missingCount = db.getCollection('DataSourceAuthorization').countDocuments({
  isInitialSyncCompleted: { $exists: false }
});
print('Records missing isInitialSyncCompleted: ' + missingCount);

// Run the update
var result = db.getCollection('DataSourceAuthorization').updateMany(
  {
    isInitialSyncCompleted: { $exists: false }
  },
  {
    $set: {
      isInitialSyncCompleted: true,
      updatedAt: new Date()
    }
  }
);

// Log results
print('isInitialSyncCompleted | Migration completed!');
print('isInitialSyncCompleted | Records matched: ' + result.matchedCount);
print('isInitialSyncCompleted | Records modified: ' + result.modifiedCount);