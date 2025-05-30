db.getCollection("Conversations").createIndex({ "searchString": "text" });
db.getCollection("Conversations").createIndex({ "isFavourite": 1 });
db.getCollection("Conversations").createIndex({ "updatedAt": 1 });
db.getCollection("Conversations").createIndex({ "userId": 1, "status": 1, "type": 1, "isInternal": 1 });
db.getCollection("Messages").createIndex({ "conversationId": 1, "userId": 1 })