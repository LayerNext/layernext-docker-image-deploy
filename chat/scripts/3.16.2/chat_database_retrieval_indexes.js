//for message list api
db.Conversations.createIndex({
    status: 1,
    type: 1,
    userId: 1,
    updatedAt: -1,
    _id: -1
});
db.Messages.createIndex({
    conversationId: 1,
    senderType: 1,
    is_front_end_data: 1
});
db.Conversations.createIndex({ isInternal: 1 });

//for message history api
db.Messages.createIndex({ conversationId: 1, userId: 1, createdAt: 1 })

//for insight report with hypothesis linking
db.InsightReport.createIndex({ insight_id: 1, user_id: 1 })

//for hypothesis report with react cycles
db.Hypothesis.createIndex({ '_id': 1, 'user_id': 1 })

//for title with hypothesis list
db.Hypothesis.createIndex({ 'insight_id': 1, 'user_id': 1, '_id': 1 })
