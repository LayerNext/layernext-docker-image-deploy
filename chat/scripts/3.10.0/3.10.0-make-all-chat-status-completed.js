
// chatDB
// history tab changes
// this makesure ,all chats are in completed status at a new release
db.getCollection('Conversations').updateMany(
    {}, 
    { $set: { "status": "completed" } }
)