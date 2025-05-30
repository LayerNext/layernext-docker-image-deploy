// create mongodb dump restore user
db.createUser({
  user: _getEnv("DUMP_USER"),
  pwd: _getEnv("DUMP_USER_PWD"),
  roles: [
    { role: "backup", db: "admin" },
    { role: "restore", db: "admin" },
  ],
  mechanisms: ["SCRAM-SHA-1"],
});

// switch to db
db = db.getSiblingDB(_getEnv("DATABASE"));

// create mongodb user
db.createUser({
  user: _getEnv("DB_USER"),
  pwd: _getEnv("DB_PASS"),
  roles: [{ role: "readWrite", db: _getEnv("DATABASE") }],
  mechanisms: ["SCRAM-SHA-1"],
});


// create indexes
// db.Conversations.createIndex({
//   "status": 1,
//   "type": 1,
//   "userId": 1,
//   "updatedAt": -1,
//   "_id": -1
// })

// db.Messages.createIndex({
//   "conversationId": 1,
//   "userId": 1,
//   "createdAt": 1
// })

// db.Agents.createIndex({
//   "userId": 1,
//   "updatedAt": -1
// })

// db.AgentLogs.createIndex({
//   "agentId": 1,
//   "createdAt": -1
// })

// db.Agents.createIndex({"status": 1})

// db.AgentLogs.createIndex({
//   "agentId": 1,
//   "executionMode": 1,
//   "environmentId": 1
// })

// db.Agents.createIndex({"agentName": 1})

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

db.Messages.createIndex({ conversationId: 1, userId: 1, createdAt: 1 })

db.InsightReport.createIndex({ insight_id: 1, user_id: 1 })

db.Hypothesis.createIndex({ '_id': 1, 'user_id': 1 })

db.Hypothesis.createIndex({ 'insight_id': 1, 'user_id': 1, '_id': 1 })

db.Conversations.createIndex({ userId: 1, isFavourite: 1 });

db.Conversations.createIndex({ isInternal: 1 }, { partialFilterExpression: { isInternal: false } });

db.Conversations.createIndex(
  { searchString: 1 },
  { collation: { locale: "en", strength: 2 } }
);

db.LabelCacheMaster.createIndex({ field_id: 1, data_item_id: 1 })
db.LabelCacheMaster.createIndex({ field_id: 1, data_item_id: 1, primary_label: 1 })