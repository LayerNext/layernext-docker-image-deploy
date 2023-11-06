// create mongodb dump restore user
db.createUser(
  {
    user: _getEnv('DUMP_USER'),
    pwd: _getEnv('DUMP_USER_PWD'),
    roles: [{role: "backup", db: "admin"}, {role: "restore", db: "admin"}],
    mechanisms: ["SCRAM-SHA-1"]
  }
);

// switch to db
db = db.getSiblingDB(_getEnv('DATABASE'));

// create mongodb user
db.createUser(
  {
    user: _getEnv('DB_USER'),
    pwd: _getEnv('DB_PASS'),
    roles: [{role: "readWrite", db: _getEnv('DATABASE')}],
    mechanisms: ["SCRAM-SHA-1"]
  }
);

var SETUP_CUSTOMER = _getEnv('SETUP_CUSTOMER')

var adminMail = _getEnv('ADMIN_EMAIL')
var teamName = `${SETUP_CUSTOMER} team`
var imageUrl = `https://accounts.${SETUP_CUSTOMER}.layernext.ai/api/user/profileImage/6374c47ecb468b7a7a68a117/defaultProfileImage.png?1669197094012`

//insert default user
db.getCollection('User').insert({
  "_id": ObjectId("6374c47ecb468b7a7a68a117"),
  "email": adminMail,
  "name": "LayerNext Admin",
  "userType": 3,
  "profileImgUrl": "defaultProfileImage.png",
  "projectList": null,
  "teamId": ObjectId(_getEnv('TEAM_ID')),
  "teamName": teamName,
  "userStatus": 1,
  "isAll": false,
  "inviteUrlCreatedAt": null,
  "isUserDeactivated": false,
  "lastEmailSentTime": null,
  "userStatPending": false,
  "isBillingAdmin": false,
  "annotationStats": null,
  "createdAt": null,
  "imageUrl": imageUrl,
  "offsetTime": null,
  "taskStats": null,
  "timeZoneOffset": null
})
//insert default user credentials
db.getCollection('AppUserCredentials').insert({
  "_id": ObjectId("6374c597cb468b7a7a68a118"),
  "password": _getEnv('ADMIN_PASSWORD'),
  "userId": ObjectId("6374c47ecb468b7a7a68a117"),
  "annotationUserId": ObjectId("6374c47ecb468b7a7a68a117")
})

db.getCollection('ApiKey').insert({
  "_id": ObjectId("6374eb51e3ac085579e53442"),
  "email": adminMail,
  "userId": ObjectId("6374c47ecb468b7a7a68a117"),
  "name": "LayerNext Admin Key",
  "userType": 3,
  "userName": "LayerNext Admin",
  "teamId": ObjectId(_getEnv('TEAM_ID')),
  "key": "key_" + Math.random().toString(36).substr(2, 24)+Math.random().toString(36).substr(2, 24)+Math.random().toString(36).substr(2, 24),
  "secret": Math.random().toString(36).substr(2, 24)+Math.random().toString(36).substr(2, 24),
  "type": 1,
  "createdAt": new Date()
})

//insert default team
db.getCollection('AnnotationTeam').insert({
  "_id": ObjectId(_getEnv('TEAM_ID')),
  "teamName": teamName,
  "create_team_folder": true,
  "apiKeyGenerated": true
})

//insert analytics APIKey
db.getCollection('ApiKey').insert({
  "_id": ObjectId("6374eb51e3ac085579e53443"),
  "name": "Automatic Analysis",
  "teamId": ObjectId(_getEnv('TEAM_ID')),
  "key": _getEnv('ANALYTICS_KEY'),
  "secret": _getEnv('ANALYTICS_SECRET'),
  "type": 2
})

//insert datalake APIKey
// db.getCollection('ApiKey').insert({
//   "_id": ObjectId("6374eb51e3ac085579e53444"),
//   "name": "Datalake App",
//   "teamId": ObjectId(_getEnv('TEAM_ID')),
//   "key": _getEnv('DATALAKE_KEY'),
//   "secret": _getEnv('DATALAKE_SECRET'),
//   "type": 2
// })

//insert dataset APIKey
db.getCollection('ApiKey').insert({
  "_id": ObjectId("6374eb51e3ac085579e53445"),
  "name": "Dataset Manager",
  "teamId": ObjectId(_getEnv('TEAM_ID')),
  "key": _getEnv('DATASET_KEY'),
  "secret": _getEnv('DATASET_SECRET'),
  "type": 2
})

//insert studio APIKey
db.getCollection('ApiKey').insert({
  "_id": ObjectId("6374eb51e3ac085579e53446"),
  "name": "Annotation Studio",
  "teamId": ObjectId(_getEnv('TEAM_ID')),
  "key": _getEnv('STUDIO_KEY'),
  "secret": _getEnv('STUDIO_SECRET'),
  "type": 2
})