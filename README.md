# @haensl/mongo

MongoDB utilities.


[![NPM](https://nodei.co/npm/@haensl%2Fmongo.png?downloads=true)](https://nodei.co/npm/@haensl%2Fmongo/)

[![npm version](https://badge.fury.io/js/@haensl%2Fmongo.svg)](http://badge.fury.io/js/@haensl%2Fmongo)
[![CircleCI](https://circleci.com/gh/haensl/mongo.svg?style=svg)](https://circleci.com/gh/haensl/mongo)

## Installation

### Via `npm`

```bash
$ npm install -S @haensl/mongo mongodb
```

### Via `yarn`

```bash
$ yarn add @haensl/mongo mongodb
```

## Usage

1. [Install @haensl/mongo](#installation) _(and [`mongodb`](https://www.npmjs.com/package/mongodb), it's a peer dependency)_

2. Use mongo in your projects:


    ESM, i.e. `import`

    ```javascript
    import factory from '@haensl/mongo';

    const mongo = factory({ mongoUri });

    // Spreading the import works, too.
    // import { client } from '@haensl/mongo';

    const client = await mongo.client();
    ```

    CJS, i.e. `require`

    ```javascript
    const mongo = require('@haensl/mongo')({ mongoUri });

    // ...

    const client = await mongo.client();
    client.db('my_database')
      .collection('my_collection')
    ```

## Synopsis

The `mongo` utility wraps functions around getting a [`MongoClient`](), identifying errors and connection pool cleanup. It is exposed as a factory:

```javascript
// Factory.
// Takes Mongo connection URI.
// Returns service object.
({ mongoUri }) => ({
  // Collects the changes made to doc by the given patch.
  // Returns an array of objects of the form { field, from , to }
  changes: (doc, patch) => [changes],

  // Cleanup function to close the connection pool.
  // Invoke e.g. at instance shutdown.
  cleanup: async () => void,

  // Returns a mongo client.
  // Connects if necessary.
  client: async () => MongoClient,

  // Map of MongoDB error numbers.
  errors: {
    duplicateKey: 11000
  },

  // Checks if the given Error is a MongoDB error with given code.
  // Returns a boolean.
  isError: (error, code) => boolean,

  // Checks if the given patch would change the given field in doc.
  // Returns a boolean.
  patchChangesField: ({ doc, field, patch }) => boolean,

  // Returns the value stored in obj at the given keyPath.
  // A key path is a string like `prop.subProp`.
  // E.g. resolveKeyPath({ foo: { bar: 'baz' }}, 'foo.bar')
  // returns 'baz'
  resolveKeyPath: (obj, keyPath) => any,

  // Transforms a patch object (with sub objects)
  // into a MongoDB patch (with `prop.sub`  keys)
  // E.g.
  // {
  //   foo: {
  //     bar: 'baz'
  //   }
  // }
  // becomes
  // { 'foo.bar': 'baz' }
  toMongoPatch: (patch) => mongoPatch
})
```

## Example usage:

### Supply connection URI once, use everywhere & graceful instance shutdown

```javascript
// mongo.js
// Wrap @haensl/mongo in a local module.
// Generate the service once and share it across your app.
const mongo = require('@haensl/mongo')(process.env.MONGO_URI);

process.on('exit', mongo.cleanup);
process.on('SIGINT', mongo.cleanup);
process.on('SIGTERM', mongo.cleanup);

module.exports = mongo;
```

In other modules that access your MongoDB, you use this local module:

```javascript
// Use local wrapper created above
const mongo = require('./mongo');

const findThing = async (id) => {
  const client = await mongo.client();
  return client.db('my_mongodb')
    .collection('things')
    .findOne({ _id: id });
};
```

### Check if an insert failed because of duplicate

```javascript
// Use local wrapper created above
const { client, isError, errors } = require('./mongo');

const insertThing = async (id) => {
  const client = await mongo.client();

  try {
    client.db('my_mongodb')
      .collection('things')
      .insertOne({ _id: id })
  } catch (err) {
    // duplicate key error
    if (isError(err, errors.duplicateKey)) {
      console.info(`already got ${id}, skipping.`);
    } else {
      // something else happened
      console.error(error);
    }
  }
};
```

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
