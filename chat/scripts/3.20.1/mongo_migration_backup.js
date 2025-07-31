/**
 * MongoDB Shell Script: Backup Collections for Sessions Migration
 * 
 * This script creates a backup of the collections that will be modified during migration:
 * - DataBlocks
 * - Messages
 * - Conversations (for reference)
 * 
 * Usage: mongo --shell backup_script.js
 * 
 * Author: AI Assistant
 * Date: 2024
 */

// Configuration
var dbName = db.getName();
var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
var backupCollectionPrefix = "backup_" + timestamp;

print("🚀 Starting MongoDB backup for Sessions migration");
print("=".repeat(60));
print("📊 Database: " + dbName);
print("⏰ Timestamp: " + timestamp);
print("🏷️  Backup prefix: " + backupCollectionPrefix);
print("=".repeat(60));

// Collections to backup
var collectionsToBackup = ['DataBlocks', 'Messages', 'Conversations'];

// Backup each collection
for (var i = 0; i < collectionsToBackup.length; i++) {
    var collectionName = collectionsToBackup[i];
    try {
        var sourceCollection = db.getCollection(collectionName);
        var backupCollectionName = backupCollectionPrefix + "_" + collectionName;
        var backupCollection = db.getCollection(backupCollectionName);

        print("💾 Backing up " + collectionName + " collection...");

        // Get document count
        var docCount = sourceCollection.count();
        print("📊 Found " + docCount + " documents in " + collectionName);

        if (docCount > 0) {
            // Use aggregation to copy documents
            var pipeline = [
                { $match: {} },
                { $out: backupCollectionName }
            ];

            sourceCollection.aggregate(pipeline);

            // Verify backup
            var backupCount = backupCollection.count();
            if (backupCount === docCount) {
                print("✅ " + collectionName + " backup completed: " + backupCount + " documents");
            } else {
                print("❌ " + collectionName + " backup verification failed: expected " + docCount + ", got " + backupCount);
            }
        } else {
            print("⚠️  No documents found in " + collectionName);
        }

    } catch (error) {
        print("❌ Error backing up " + collectionName + ": " + error.message);
    }
}

// Create backup metadata
var backupMetadata = {
    backup_timestamp: new Date(),
    database: dbName,
    backup_prefix: backupCollectionPrefix,
    collections_backed_up: [],
    migration_info: {
        description: "Backup before Sessions collection migration",
        changes: [
            "Create Sessions collection with ObjectId primary keys",
            "Update DataBlocks.session_id from string to ObjectId",
            "Update Messages.sessionId from string to ObjectId"
        ]
    }
};

// Build collections_backed_up array
for (var j = 0; j < collectionsToBackup.length; j++) {
    backupMetadata.collections_backed_up.push(backupCollectionPrefix + "_" + collectionsToBackup[j]);
}

// Store metadata in a collection
var metadataCollection = db.getCollection(backupCollectionPrefix + "_metadata");
metadataCollection.insertOne(backupMetadata);

print("=".repeat(60));
print("📋 BACKUP SUMMARY");
print("=".repeat(60));
print("Backup collections created:");
for (var k = 0; k < collectionsToBackup.length; k++) {
    print("  - " + backupCollectionPrefix + "_" + collectionsToBackup[k]);
}
print("  - " + backupCollectionPrefix + "_metadata");
print("=".repeat(60));
print("✅ Backup completed successfully!");
print("=".repeat(60));

// Return backup info for reference
print("📝 Backup information:");
print("Backup prefix: " + backupCollectionPrefix);
print("Metadata collection: " + backupCollectionPrefix + "_metadata");
print("Use this information for rollback if needed."); 