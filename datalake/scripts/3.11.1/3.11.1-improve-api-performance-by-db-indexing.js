db.getCollection("TableData").createIndex({ "connectionId": 1 }) //List tables of a database
db.getCollection("Connection").createIndex({ "type": 1 }) //List all connections
db.getCollection("TableData").createIndex({ "connectionId": 1, "tableInfo.isVisible": 1 }); //Regenerating the datasource overview
