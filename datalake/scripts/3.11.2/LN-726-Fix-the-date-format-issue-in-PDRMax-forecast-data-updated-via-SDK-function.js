// ========================================Instructions========================================================

// Add Ids of Connection collection documents that need to make fields isEditable:true 
// Before run the System
// to find the connections you can also use below one
// db.getCollection("Connection").find({
//     "sourceName" : "add-source-name",
//     "type" : "mongodb"
// }  
// );

// ==================================================================================================

const idsArray = [
    //ObjectId("65cb532f34227169cf36fc9b"),ObjectId("65cb532f70234169cf36fc9c")
  ];
  
  db.getCollection("Connection").updateMany(
    { "_id": { $in: idsArray } },  
    { $set: { "isEditable": true } }  
  );