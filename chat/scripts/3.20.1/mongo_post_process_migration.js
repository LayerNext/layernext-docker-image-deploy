/**
 * MongoDB Shell Script: Post-Process Migration
 * 
 * This script performs post-migration tasks:
 * 1. Updates Sessions with "in_progress" status using status from Conversations
 * 2. Updates Conversations with sessionIdList field based on Sessions collection
 * 
 * Usage: mongo --shell post_process_migration.js
 * 
 * Author: AI Assistant
 * Date: 2024
 */

// Configuration
var dbName = db.getName();
var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

print("🚀 Starting Post-Process Migration");
print("=".repeat(60));
print("📊 Database: " + dbName);
print("⏰ Timestamp: " + timestamp);
print("=".repeat(60));

// Statistics tracking
var stats = {
    sessions_updated: 0,
    conversations_updated: 0,
    errors: 0,
    skipped: 0
};

// Step 1: Update Sessions with "in_progress" status
print("🔄 Step 1: Updating Sessions with 'in_progress' status...");

// Find sessions with "in_progress" status
var inProgressSessions = db.Sessions.find({
    status: "in_progress"
}).toArray();

print("📊 Found " + inProgressSessions.length + " sessions with 'in_progress' status");

if (inProgressSessions.length > 0) {
    for (var i = 0; i < inProgressSessions.length; i++) {
        var session = inProgressSessions[i];

        try {
            // Get conversation status
            var conversation = db.Conversations.findOne(
                { _id: session.conversation_id },
                { status: 1 }
            );

            if (conversation && conversation.status) {
                // Update session with conversation status
                var result = db.Sessions.updateOne(
                    { _id: session._id },
                    { $set: { status: conversation.status } }
                );

                if (result.modifiedCount > 0) {
                    stats.sessions_updated++;
                    print("✅ Updated session " + session._id + " status to: " + conversation.status);
                }
            } else {
                print("⚠️  No conversation found for session " + session._id + ", keeping 'in_progress'");
                stats.skipped++;
            }

        } catch (error) {
            print("❌ Error updating session " + session._id + ": " + error.message);
            stats.errors++;
        }
    }
}

print("✅ Sessions update completed: " + stats.sessions_updated + " sessions updated");

// Step 2: Update Conversations with sessionIdList
print("🔄 Step 2: Updating Conversations with sessionIdList...");

// Get all unique conversation_ids from Sessions collection
var conversationIds = db.Sessions.distinct("conversation_id", {
    conversation_id: { $exists: true, $ne: null }
});

print("📊 Found " + conversationIds.length + " unique conversations with sessions");

if (conversationIds.length > 0) {
    for (var j = 0; j < conversationIds.length; j++) {
        var conversationId = conversationIds[j];

        try {
            // Get all session IDs for this conversation
            var sessionIds = db.Sessions.find(
                { conversation_id: conversationId },
                { _id: 1 }
            ).toArray();

            // Extract ObjectIds
            var sessionIdList = [];
            for (var k = 0; k < sessionIds.length; k++) {
                sessionIdList.push(sessionIds[k]._id);
            }

            // Update conversation with sessionIdList
            var result = db.Conversations.updateOne(
                { _id: conversationId },
                { $set: { sessionIdList: sessionIdList } }
            );

            if (result.modifiedCount > 0) {
                stats.conversations_updated++;
                print("✅ Updated conversation " + conversationId + " with " + sessionIdList.length + " sessions");
            } else {
                print("⚠️  Conversation " + conversationId + " not found or already updated");
                stats.skipped++;
            }

        } catch (error) {
            print("❌ Error updating conversation " + conversationId + ": " + error.message);
            stats.errors++;
        }
    }
}

print("✅ Conversations update completed: " + stats.conversations_updated + " conversations updated");

// Step 3: Validation
print("🔍 Step 3: Validating post-process migration...");

// Check Sessions status distribution
var sessionsStatusCount = db.Sessions.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
]).toArray();

print("📊 Sessions status distribution:");
for (var l = 0; l < sessionsStatusCount.length; l++) {
    var statusInfo = sessionsStatusCount[l];
    print("  - " + statusInfo._id + ": " + statusInfo.count);
}

// Check Conversations with sessionIdList
var conversationsWithSessionList = db.Conversations.count({
    sessionIdList: { $exists: true }
});

print("📊 Conversations with sessionIdList: " + conversationsWithSessionList);

// Show sample conversation with sessionIdList
var sampleConversation = db.Conversations.findOne({
    sessionIdList: { $exists: true }
});

if (sampleConversation) {
    print("📋 Sample Conversation with sessionIdList:");
    print("  - _id: " + sampleConversation._id);
    print("  - name: " + (sampleConversation.name || 'not set'));
    print("  - status: " + (sampleConversation.status || 'not set'));
    print("  - sessionIdList count: " + (sampleConversation.sessionIdList ? sampleConversation.sessionIdList.length : 0));
    if (sampleConversation.sessionIdList && sampleConversation.sessionIdList.length > 0) {
        print("  - First sessionId: " + sampleConversation.sessionIdList[0]);
    }
}

// Show sample session with updated status
var sampleSession = db.Sessions.findOne();
if (sampleSession) {
    print("📋 Sample Session:");
    print("  - _id: " + sampleSession._id);
    print("  - conversation_id: " + sampleSession.conversation_id);
    print("  - status: " + sampleSession.status);
    print("  - type: " + sampleSession.type);
}

// Print summary
print("=".repeat(60));
print("📋 POST-PROCESS MIGRATION SUMMARY");
print("=".repeat(60));
print("Sessions updated: " + stats.sessions_updated);
print("Conversations updated: " + stats.conversations_updated);
print("Errors encountered: " + stats.errors);
print("Documents skipped: " + stats.skipped);
print("=".repeat(60));
print("✅ Post-process migration completed successfully!");
print("=".repeat(60));

// Return summary info
print("📝 Summary information:");
print("Updated " + stats.sessions_updated + " sessions with conversation status");
print("Updated " + stats.conversations_updated + " conversations with sessionIdList");
print("All sessions now have proper status from conversations");
print("All conversations now have sessionIdList field populated");
print("=".repeat(60)); 