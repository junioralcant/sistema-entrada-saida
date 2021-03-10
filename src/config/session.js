const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

module.exports = session({
  store: new MongoDBStore({
    uri: process.env.DB_URL,
    databaseName: "cms",
    collection: "mySessions",
  }),
  secret: "secretsessiontest",
  resave: false,
  saveUninitializad: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
});
