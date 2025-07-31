/**
 * MongoDB Shell Script: Sessions Collection Migration
 * 
 * This script migrates the database from the old structure to the new structure:
 * - Old: DataBlocks and Messages collections with string session_id/sessionId
 * - New: Sessions collection with ObjectId primary key, DataBlocks and Messages reference Sessions._id
 * 
 * Usage: mongo --shell migration_script.js
 * 
 * Author: AI Assistant
 * Date: 2024
 */

// Configuration
var dbName = db.getName();
var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

print("🚀 Starting Sessions Collection Migration");
print("=".repeat(60));
print("📊 Database: " + dbName);
print("⏰ Timestamp: " + timestamp);
print("=".repeat(60));

// Statistics tracking
var stats = {
    sessions_created: 0,
    data_blocks_updated: 0,
    messages_updated: 0,
    errors: 0,
    skipped: 0
};

// Step 1: Get unique session IDs from DataBlocks (both string and ObjectId)
print("🔍 Step 1: Collecting unique session IDs from DataBlocks collection...");

var stringSessionIds = db.DataBlocks.distinct("session_id", {
    session_id: { $exists: true, $ne: null, $type: "string" }
});

var objectIdSessionIds = db.DataBlocks.distinct("session_id", {
    session_id: { $exists: true, $ne: null, $type: "objectId" }
});

print("📊 Found " + stringSessionIds.length + " unique string session IDs");
print("📊 Found " + objectIdSessionIds.length + " unique ObjectId session IDs");

// Combine all unique session IDs
var allSessionIds = [];
var sessionIdTypeMap = {}; // Track which session IDs are strings vs ObjectIds

// Add string session IDs
for (var i = 0; i < stringSessionIds.length; i++) {
    allSessionIds.push(stringSessionIds[i]);
    sessionIdTypeMap[stringSessionIds[i]] = "string";
}

// Add ObjectId session IDs
for (var j = 0; j < objectIdSessionIds.length; j++) {
    allSessionIds.push(objectIdSessionIds[j]);
    sessionIdTypeMap[objectIdSessionIds[j]] = "objectId";
}

print("📊 Total unique session IDs: " + allSessionIds.length);

if (allSessionIds.length === 0) {
    print("⚠️  No session IDs found to migrate");
    print("✅ Migration completed (nothing to migrate)");
    quit();
}

// Step 2: Create Sessions collection entries
print("🏗️  Step 2: Creating Sessions collection entries...");

var sessionsToCreate = [];
var sessionIdMapping = {};

for (var k = 0; k < allSessionIds.length; k++) {
    var sessionId = allSessionIds[k];
    var sessionIdType = sessionIdTypeMap[sessionId];

    try {
        // Get the first data block for this session to extract metadata
        var dataBlock = db.DataBlocks.findOne(
            { session_id: sessionId },
            {
                sort: { _id: 1 },
                conversation_id: 1,
                session_type: 1,
                status: 1,
                created_at: 1
            }
        );

        if (!dataBlock) {
            print("⚠️  No data block found for session " + sessionId + ", skipping");
            stats.skipped++;
            continue;
        }

        // Extract metadata with proper null checks
        var sessionDoc = {
            conversation_id: dataBlock.conversation_id || null,
            type: dataBlock.session_type || "analysis",
            user_id: null, // Will be populated from conversation if available
            created_at: dataBlock.created_at || new Date(),
            updated_at: new Date(),
            status: dataBlock.status || "completed",
            original_session_id: sessionId, // Keep reference to original ID
            original_type: sessionIdType // Track if it was originally string or ObjectId
        };

        // Try to get user_id from conversation
        if (dataBlock.conversation_id) {
            var conversation = db.Conversations.findOne(
                { _id: dataBlock.conversation_id },
                { userId: 1 }
            );
            if (conversation && conversation.userId) {
                sessionDoc.user_id = conversation.userId;
            }
        }

        // Debug: Print session document being created
        print("📋 Creating session for " + sessionId + " (type: " + sessionIdType + "):");
        print("  - conversation_id: " + sessionDoc.conversation_id);
        print("  - type: " + sessionDoc.type);
        print("  - status: " + sessionDoc.status);

        sessionsToCreate.push(sessionDoc);

    } catch (error) {
        print("❌ Error preparing session " + sessionId + ": " + error.message);
        stats.errors++;
    }
}

// Insert sessions in batches
if (sessionsToCreate.length > 0) {
    var batchSize = 1000;
    for (var l = 0; l < sessionsToCreate.length; l += batchSize) {
        var batch = sessionsToCreate.slice(l, l + batchSize);
        var result = db.Sessions.insertMany(batch);

        // Create mapping from old session_id to new ObjectId
        var insertedIds = result.insertedIds;
        var sessionIds = Object.keys(insertedIds);

        for (var m = 0; m < sessionIds.length; m++) {
            var key = sessionIds[m];
            var originalSessionId = batch[m].original_session_id;
            var newObjectId = insertedIds[key];
            sessionIdMapping[originalSessionId] = newObjectId;
        }

        stats.sessions_created += batch.length;
        print("✅ Created " + batch.length + " session entries (batch " + (Math.floor(l / batchSize) + 1) + ")");
    }
}

print("✅ Sessions creation completed: " + stats.sessions_created + " sessions created");

// Step 3: Create indexes on Sessions collection
print("📇 Step 3: Creating indexes on Sessions collection...");

try {
    db.Sessions.createIndex({ conversation_id: 1 });
    print("✅ Created index on conversation_id");

    db.Sessions.createIndex({ user_id: 1 });
    print("✅ Created index on user_id");

    db.Sessions.createIndex({ status: 1 });
    print("✅ Created index on status");

    db.Sessions.createIndex({ created_at: -1 });
    print("✅ Created index on created_at");

    db.Sessions.createIndex({ original_session_id: 1 });
    print("✅ Created index on original_session_id");

} catch (error) {
    print("❌ Error creating indexes: " + error.message);
}

// Step 4: Update DataBlocks collection
print("🔄 Step 4: Updating DataBlocks collection...");

// First, let's check what we have
var stringSessionCount = db.DataBlocks.count({
    session_id: { $type: "string" }
});
var objectIdSessionCount = db.DataBlocks.count({
    session_id: { $type: "objectId" }
});
var nullSessionCount = db.DataBlocks.count({
    session_id: null
});

print("📊 Current DataBlocks state:");
print("  - String session_ids: " + stringSessionCount);
print("  - ObjectId session_ids: " + objectIdSessionCount);
print("  - Null session_ids: " + nullSessionCount);

// Update DataBlocks with string session_ids
if (stringSessionCount > 0) {
    try {
        print("🔄 Updating DataBlocks with string session_ids...");
        var updatedCount = 0;
        var cursor = db.DataBlocks.find({ session_id: { $type: "string" } });

        while (cursor.hasNext()) {
            var doc = cursor.next();
            var oldSessionId = doc.session_id;

            if (sessionIdMapping[oldSessionId]) {
                var result = db.DataBlocks.updateOne(
                    { _id: doc._id },
                    { $set: { session_id: sessionIdMapping[oldSessionId] } }
                );
                if (result.modifiedCount > 0) {
                    updatedCount++;
                }
            }
        }

        print("✅ Updated " + updatedCount + " DataBlocks with string session_ids");
        stats.data_blocks_updated += updatedCount;

    } catch (error) {
        print("❌ Error updating DataBlocks with string session_ids: " + error.message);
        stats.errors++;
    }
}

// Update DataBlocks with ObjectId session_ids (replace with new ObjectIds)
if (objectIdSessionCount > 0) {
    try {
        print("🔄 Updating DataBlocks with existing ObjectId session_ids...");
        var updatedCount = 0;
        var cursor = db.DataBlocks.find({ session_id: { $type: "objectId" } });

        while (cursor.hasNext()) {
            var doc = cursor.next();
            var oldSessionId = doc.session_id.toString(); // Convert ObjectId to string for mapping lookup

            if (sessionIdMapping[oldSessionId]) {
                var result = db.DataBlocks.updateOne(
                    { _id: doc._id },
                    { $set: { session_id: sessionIdMapping[oldSessionId] } }
                );
                if (result.modifiedCount > 0) {
                    updatedCount++;
                }
            }
        }

        print("✅ Updated " + updatedCount + " DataBlocks with existing ObjectId session_ids");
        stats.data_blocks_updated += updatedCount;

    } catch (error) {
        print("❌ Error updating DataBlocks with ObjectId session_ids: " + error.message);
        stats.errors++;
    }
}

// Step 5: Update Messages collection
print("🔄 Step 5: Updating Messages collection...");

// First, let's check what we have in Messages
var stringMessageCount = db.Messages.count({
    sessionId: { $type: "string" }
});
var objectIdMessageCount = db.Messages.count({
    sessionId: { $type: "objectId" }
});

print("📊 Current Messages state:");
print("  - String sessionIds: " + stringMessageCount);
print("  - ObjectId sessionIds: " + objectIdMessageCount);

// Update Messages with string sessionIds
if (stringMessageCount > 0) {
    try {
        print("🔄 Updating Messages with string sessionIds...");
        var updatedCount = 0;
        var cursor = db.Messages.find({ sessionId: { $type: "string" } });

        while (cursor.hasNext()) {
            var doc = cursor.next();
            var oldSessionId = doc.sessionId;

            if (sessionIdMapping[oldSessionId]) {
                var result = db.Messages.updateOne(
                    { _id: doc._id },
                    { $set: { sessionId: sessionIdMapping[oldSessionId] } }
                );
                if (result.modifiedCount > 0) {
                    updatedCount++;
                }
            }
        }

        print("✅ Updated " + updatedCount + " Messages with string sessionIds");
        stats.messages_updated += updatedCount;

    } catch (error) {
        print("❌ Error updating Messages with string sessionIds: " + error.message);
        stats.errors++;
    }
}

// Update Messages with ObjectId sessionIds (replace with new ObjectIds)
if (objectIdMessageCount > 0) {
    try {
        print("🔄 Updating Messages with existing ObjectId sessionIds...");
        var updatedCount = 0;
        var cursor = db.Messages.find({ sessionId: { $type: "objectId" } });

        while (cursor.hasNext()) {
            var doc = cursor.next();
            var oldSessionId = doc.sessionId.toString(); // Convert ObjectId to string for mapping lookup

            if (sessionIdMapping[oldSessionId]) {
                var result = db.Messages.updateOne(
                    { _id: doc._id },
                    { $set: { sessionId: sessionIdMapping[oldSessionId] } }
                );
                if (result.modifiedCount > 0) {
                    updatedCount++;
                }
            }
        }

        print("✅ Updated " + updatedCount + " Messages with existing ObjectId sessionIds");
        stats.messages_updated += updatedCount;

    } catch (error) {
        print("❌ Error updating Messages with ObjectId sessionIds: " + error.message);
        stats.errors++;
    }
}

// Step 6: Validation
print("🔍 Step 6: Validating migration...");

// Check that all string session_ids are converted
var remainingStringSessions = db.DataBlocks.count({
    session_id: { $type: "string" }
});

if (remainingStringSessions > 0) {
    print("❌ Found " + remainingStringSessions + " DataBlocks still with string session_id");
} else {
    print("✅ All DataBlocks have ObjectId session_id");
}

var remainingStringMessages = db.Messages.count({
    sessionId: { $type: "string" }
});

if (remainingStringMessages > 0) {
    print("❌ Found " + remainingStringMessages + " Messages still with string sessionId");
} else {
    print("✅ All Messages have ObjectId sessionId");
}

// Check Sessions collection
var sessionsCount = db.Sessions.count();
print("✅ Sessions collection has " + sessionsCount + " documents");

// Show sample session document
var sampleSession = db.Sessions.findOne();
if (sampleSession) {
    print("📋 Sample Session structure:");
    print("  - _id: " + sampleSession._id);
    print("  - conversation_id: " + sampleSession.conversation_id);
    print("  - type: " + sampleSession.type);
    print("  - user_id: " + sampleSession.user_id);
    print("  - status: " + sampleSession.status);
    print("  - original_session_id: " + (sampleSession.original_session_id || 'not set'));
    print("  - original_type: " + (sampleSession.original_type || 'not set'));
}

// Step 7: Cleanup - Remove temporary fields
print("🧹 Step 7: Cleaning up temporary fields...");

var cleanupResult = db.Sessions.updateMany(
    {
        $or: [
            { original_session_id: { $exists: true } },
            { original_type: { $exists: true } }
        ]
    },
    { $unset: { original_session_id: "", original_type: "" } }
);

print("✅ Cleaned up " + cleanupResult.modifiedCount + " session documents");

// Print summary
print("=".repeat(60));
print("📋 MIGRATION SUMMARY");
print("=".repeat(60));
print("Sessions created: " + stats.sessions_created);
print("DataBlocks updated: " + stats.data_blocks_updated);
print("Messages updated: " + stats.messages_updated);
print("Errors encountered: " + stats.errors);
print("Documents skipped: " + stats.skipped);
print("=".repeat(60));
print("✅ Migration completed successfully!");
print("=".repeat(60));

// Return migration info
print("📝 Migration information:");
print("Sessions collection created with " + sessionsCount + " documents");
print("Session ID mapping created for " + Object.keys(sessionIdMapping).length + " sessions");
print("Database is now ready for the new Sessions collection structure."); 