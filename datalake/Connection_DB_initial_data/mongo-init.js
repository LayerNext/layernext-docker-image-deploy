// create mongodb dump restore user
db.createUser({
  user: _getEnv("CONNECTION_DUMP_USER"),
  pwd: _getEnv("CONNECTION_DUMP_USER_PWD"),
  roles: [
    { role: "backup", db: "admin" },
    { role: "restore", db: "admin" },
    {
      role: "readWriteAnyDatabase",
      db: "admin",
    },
    {
      role: "readAnyDatabase",
      db: "admin",
    },
  ],
  mechanisms: ["SCRAM-SHA-1"],
});

db.createUser({
  user: _getEnv("CONNECTION_AIRBYTE_USER"),
  pwd: _getEnv("CONNECTION_AIRBYTE_PASSWORD"),
  roles: [{ role: "readWrite", db: "CONNECTION_DATABASE" }, { role: "dbAdmin", db: "CONNECTION_DATABASE" }],
  mechanisms: ["SCRAM-SHA-1"]
});


// switch to db
db = db.getSiblingDB(_getEnv("CONNECTION_DATABASE"));

// create mongodb user
db.createUser({
  user: _getEnv("CONNECTION_DB_USER"),
  pwd: _getEnv("CONNECTION_DB_PASS"),
  roles: [{ role: "readWrite", db: _getEnv("CONNECTION_DATABASE") }],
  mechanisms: ["SCRAM-SHA-1"],
});
