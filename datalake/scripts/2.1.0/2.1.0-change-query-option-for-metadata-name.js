db.getCollection('QueryOption').updateOne({keyGroup: 'metadata.name'}, {$addToSet: {operators: '~'}});
