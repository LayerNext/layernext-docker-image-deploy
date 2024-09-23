// Select the collections
const conversationsCollection = db.getCollection("Conversations");
const messagesCollection = db.getCollection("Messages");

// Loop through each conversation
conversationsCollection.find({}).forEach(conversation => {
    
    // Extract the conversation name
    const conversationId = conversation._id;
    const conversationName = conversation.name || "";

    // Fetch all messages for the current conversationId
    const messages = messagesCollection.aggregate([
        {
            "$match": {
                "conversationId": conversationId,
                "senderType": "user",  // Only user-sent messages
                "is_front_end_data": true  // Only front-end data messages
            }
        },
        {
            "$group": {
                "_id": null,
                "questions": {
                    "$push": {
                        "$cond": {
                            "if": {"$isArray": "$content"},
                            "then": "Attachment",
                            "else": "$content"
                        }
                    }
                }
            }
        }
    ]).toArray();

    // Get the questions (if any)
    const questionsList = messages.length > 0 ? messages[0].questions : [];

    // Combine the conversation name and the questions into a search string
    const searchString = conversationName + " " + questionsList.join(" ");

    // Update the conversation with the new searchString field
    conversationsCollection.updateOne(
        { _id: conversationId },
        { $set: { searchString: searchString } }
    );
});