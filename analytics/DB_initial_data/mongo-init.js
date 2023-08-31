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
      mechanisms:["SCRAM-SHA-1"]
    }
  );