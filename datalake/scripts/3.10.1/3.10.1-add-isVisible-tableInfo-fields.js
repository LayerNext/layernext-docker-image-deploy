// Default Value should be true
db.getCollection("TableData").updateMany(
    {}, 
       {
           $set: {
               "tableInfo.fields.$[].isVisible": true
           }
       }
   )