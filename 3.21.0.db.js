////account db

db.getCollection('User').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

db.getCollection('ApiKey').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//change the _id of the AnnotationTeam to new team id

////chat db

db.getCollection('APIConfigs').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

////datalake db

//ApiKey
db.getCollection('ApiKey').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//Connection
db.getCollection('Connection').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//DataCrawl
db.getCollection('DataCrawl').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})
//DataSourceAuthorization
db.getCollection('DataSourceAuthorization').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//DatalakeSelection
db.getCollection('DatalakeSelection').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//FileUploadProgress
db.getCollection('FileUploadProgress').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//Job
db.getCollection('Job').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//MetaData
db.getCollection('MetaData').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//MetaField
db.getCollection('MetaField').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//MetaTag
db.getCollection('MetaTag').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//ModelProvider
db.getCollection('ModelProvider').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//QueryOption
db.getCollection('QueryOption').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//StorageMapping
db.getCollection('StorageMapping').updateMany({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})

//SystemData
db.getCollection('SystemData').updateOne({}, {
    $set: {
        teamId: ObjectId("68f8a8ff4d770c07cc072f8a"),
        tenant: "dev"
    }
})
