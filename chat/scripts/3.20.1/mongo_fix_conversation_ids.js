/**
 * MongoDB Shell Script: Fix Conversation IDs
 * 
 * This script fixes DataBlocks with string conversation_id by converting them to ObjectIds.
 * 
 * Usage: mongo --shell fix_conversation_ids.js
 * 
 * Author: AI Assistant
 * Date: 2024
 */

print("🔧 Fixing Conversation IDs in DataBlocks");
print("=".repeat(60));

// Check current state
var stringConversationCount = db.DataBlocks.count({
    conversation_id: { $type: "string" }
});

print("📊 DataBlocks with string conversation_id: " + stringConversationCount);

if (stringConversationCount === 0) {
    print("✅ No DataBlocks with string conversation_id found");
    quit();
}

// Get sample to see the format
var sampleDataBlock = db.DataBlocks.findOne({
    conversation_id: { $type: "string" }
});

if (sampleDataBlock) {
    print("📋 Sample DataBlock with string conversation_id:");
    print("  - _id: " + sampleDataBlock._id);
    print("  - conversation_id: " + sampleDataBlock.conversation_id + " (type: " + typeof sampleDataBlock.conversation_id + ")");
    print("  - session_id: " + sampleDataBlock.session_id);
}

// Update DataBlocks with string conversation_id
print("🔄 Converting string conversation_id to ObjectId...");

var updatedCount = 0;
var cursor = db.DataBlocks.find({
    conversation_id: { $type: "string" }
});

while (cursor.hasNext()) {
    var doc = cursor.next();
    var stringConversationId = doc.conversation_id;

    try {
        // Convert string to ObjectId
        var objectIdConversationId = ObjectId(stringConversationId);

        var result = db.DataBlocks.updateOne(
            { _id: doc._id },
            { $set: { conversation_id: objectIdConversationId } }
        );

        if (result.modifiedCount > 0) {
            updatedCount++;
        }
    } catch (error) {
        print("❌ Error converting conversation_id for document " + doc._id + ": " + error.message);
    }
}

print("✅ Updated " + updatedCount + " DataBlocks with ObjectId conversation_id");

// Verify the fix
var remainingStringConversationCount = db.DataBlocks.count({
    conversation_id: { $type: "string" }
});

print("📊 Remaining DataBlocks with string conversation_id: " + remainingStringConversationCount);

if (remainingStringConversationCount === 0) {
    print("✅ All conversation_id values are now ObjectIds");
} else {
    print("⚠️  Some conversation_id values are still strings");
}

print("=".repeat(60));
print("🔧 Conversation ID fix completed");
print("=".repeat(60)); 