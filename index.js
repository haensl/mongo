const { MongoClient, MongoError } = require('mongodb');

let _client;

const cleanup = async () => {
  await _client.close();
};

const client = async (mongoUri) => {
  if (!_client) {
    _client = new MongoClient(mongoUri);
  }

  await _client.connect();
  return _client;
};

const errors = {
  duplicateKey: 11000
};

const isError = (error, code) =>
  // Check for value equality of code because it can be string or number
  // depending on environments. See
  // https://mongodb.github.io/node-mongodb-native/4.4/classes/MongoError.html#code
  error instanceof MongoError && error.code == code; // eslint-disable-line eqeqeq

module.exports = ({ mongoUri } = {}) => ({
  cleanup,
  client: client.bind(null, mongoUri),
  errors,
  isError
});

