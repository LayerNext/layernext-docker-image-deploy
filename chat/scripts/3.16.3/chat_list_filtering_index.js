//isFavorite index for filtering
db.Conversations.createIndex({ userId: 1, isFavourite: 1 });

//partial index since or expression
db.Conversations.createIndex({ isInternal: 1 }, { partialFilterExpression: { isInternal: false } });

//index for regex matching
db.Conversations.createIndex(
    { searchString: 1 },
    { collation: { locale: "en", strength: 2 } }
);
