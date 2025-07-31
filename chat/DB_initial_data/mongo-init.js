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



// Primary indexes for DataBlocks collection
db.DataBlocks.createIndex({ "session_id": 1 });
db.DataBlocks.createIndex({ "conversation_id": 1 });
db.DataBlocks.createIndex({ "session_id": 1, "conversation_id": 1 });

// Status and type indexes for filtering
db.DataBlocks.createIndex({ "status": 1 });
db.DataBlocks.createIndex({ "session_type": 1 });
db.DataBlocks.createIndex({ "final": 1 });

// Timestamp indexes for sorting and time-based queries
db.DataBlocks.createIndex({ "created_at": -1 });
db.DataBlocks.createIndex({ "updated_at": -1 });

// Compound indexes for common query patterns
db.DataBlocks.createIndex({ "session_id": 1, "status": 1 });
db.DataBlocks.createIndex({ "conversation_id": 1, "session_id": 1, "created_at": -1 });
db.DataBlocks.createIndex({ "session_id": 1, "final": 1 });

// Index for blocks array queries (if you query by block properties)
db.DataBlocks.createIndex({ "blocks.block_id": 1 });
db.DataBlocks.createIndex({ "blocks.block_type": 1 });
db.DataBlocks.createIndex({ "blocks.status": 1 });

// Primary indexes for Sessions collection
db.Sessions.createIndex({ "conversation_id": 1 });
db.Sessions.createIndex({ "user_id": 1 });
db.Sessions.createIndex({ "status": 1 });
db.Sessions.createIndex({ "type": 1 });

// Timestamp indexes for sorting and time-based queries
db.Sessions.createIndex({ "created_at": -1 });
db.Sessions.createIndex({ "updated_at": -1 });

// Compound indexes for common query patterns
db.Sessions.createIndex({ "conversation_id": 1, "status": 1 });
db.Sessions.createIndex({ "user_id": 1, "status": 1 });
db.Sessions.createIndex({ "conversation_id": 1, "created_at": -1 });
db.Sessions.createIndex({ "user_id": 1, "created_at": -1 });
db.Sessions.createIndex({ "conversation_id": 1, "type": 1 });

// Primary key and user-based indexes
db.Conversations.createIndex({ "userId": 1 });
db.Conversations.createIndex({ "status": 1 });
db.Conversations.createIndex({ "type": 1 });
db.Conversations.createIndex({ "isInternal": 1 });
db.Conversations.createIndex({ "isViewed": 1 });
db.Conversations.createIndex({ "isFavourite": 1 });

// Timestamp indexes for sorting and time-based queries
db.Conversations.createIndex({ "created_at": -1 });
db.Conversations.createIndex({ "updated_at": -1 });

// User conversations with status filtering
db.Conversations.createIndex({ "userId": 1, "status": 1 });
db.Conversations.createIndex({ "userId": 1, "type": 1 });
db.Conversations.createIndex({ "userId": 1, "isInternal": 1 });
db.Conversations.createIndex({ "userId": 1, "isViewed": 1 });
db.Conversations.createIndex({ "userId": 1, "isFavourite": 1 });

// User conversations with time sorting
db.Conversations.createIndex({ "userId": 1, "createdAt": -1 });
db.Conversations.createIndex({ "userId": 1, "updatedAt": -1 });

// Status-based queries with time sorting
db.Conversations.createIndex({ "status": 1, "createdAt": -1 });
db.Conversations.createIndex({ "status": 1, "updatedAt": -1 });

// Type-based queries with time sorting
db.Conversations.createIndex({ "type": 1, "createdAt": -1 });
db.Conversations.createIndex({ "type": 1, "updatedAt": -1 });

// Internal conversations filtering
db.Conversations.createIndex({ "isInternal": 1, "createdAt": -1 });
db.Conversations.createIndex({ "isInternal": 1, "updatedAt": -1 });

// Favourite conversations
db.Conversations.createIndex({ "userId": 1, "isFavourite": 1, "createdAt": -1 });
db.Conversations.createIndex({ "userId": 1, "isFavourite": 1, "updatedAt": -1 });

// Text search on conversation name
db.Conversations.createIndex({ "name": "text" });
db.Conversations.createIndex({ "userName": "text" });

db.DataBlocks.createIndex({ "user_visibility": 1 })