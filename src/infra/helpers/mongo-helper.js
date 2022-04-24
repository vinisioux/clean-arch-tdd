const { MongoClient } = require("mongodb");

module.exports = {
  async connect(uri, dbName) {
    this.uri = uri;
    this.dbName = dbName;
    this.client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return (this.db = this.client.db(dbName));
  },

  async disconnect() {
    await this.client.close();
  },
};
