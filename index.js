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

/**
 * Collects the changes made in the given patch.
 *
 * @param doc a document.
 * @param patch a patch to apply to the document.
 *
 * @return an array of changes contained in the patch.
 *  Changes are described by objects of the form { field, from, to }.
 */
const changes = (doc, patch) => {
  const mongoPatch = translatePatchToMongoUpdate(patch);
  const changes = [];

  for (const field of Object.keys(mongoPatch)) {
    const fieldIsChanging = patchChangesField({
      doc,
      field,
      patch
    });

    if (fieldIsChanging) {
      changes.push({
        field,
        from: resolveKeyPath(doc, field),
        to: mongoPatch[field]
      });
    }
  }

  return changes;
};

/**
 * Checks whether the given field is changed within patch.
 *
 * @param doc the document to check.
 * @param field the field being checked for updates. When checking
 *  subdocuments, this needs to be the property path, e.g. `cycle.length`.
 * @param patch the patch to check
 *
 * @return Promise a promise that resolves to a boolean indicating
 *  whether or not the patch changes the field.
 */
const patchChangesField = ({ doc, field, patch }) => {
  const mongoPatch = translatePatchToMongoUpdate(patch);

  if (!(field in mongoPatch)) {
    return false;
  }

  return resolveKeyPath(doc, field) !== mongoPatch[field];
};

/**
 * Retrieves the property stored at keyPath in the gibven object.
 *
 * @param obj an object.
 * @param keyPath a property path, e.g. `prop.subProp`.
 *
 * @return the value of the property stored at keyPath within object.
 */
const resolveKeyPath = (obj, keyPath) => {
  const properties = keyPath.split('.');
  let resolved = { ...obj };
  for(const key of properties) {
    resolved = resolved[key];
  }

  return resolved;
};

/**
 * Translates the given patch object into a mongdb update.
 *
 * E.g. replaces subdocuments with `.` key path syntax:
 *
 * {
 *   foo: {
 *     bar: 'baz'
 *   }
 * }
 *
 * becomes
 *
 * {
 *   'foo.bar': 'baz
 * }
 *
 * prefix param is for recurrsion.
 */
const translatePatchToMongoUpdate = (patch, prefix = '') =>
  Object.keys(patch)
    .reduce((translatedPatch, key) => {
      if (typeof patch[key] === 'object' && !Array.isArray(patch[key]) && !(patch[key] instanceof Date)) {
        return {
          ...translatedPatch,
          ...translatePatchToMongoUpdate(patch[key], `${prefix}${key}.`)
        };
      } else {
        translatedPatch[`${prefix}${key}`] = patch[key];
        return translatedPatch;
      }
    }, {});

module.exports = ({ mongoUri } = {}) => ({
  changes,
  cleanup,
  client: client.bind(null, mongoUri),
  errors,
  isError,
  patchChangesField,
  resolveKeyPath,
  translatePatchToMongoUpdate
});

