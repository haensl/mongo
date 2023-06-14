const { MongoError } = require('mongodb');
const mongo = require('./');

describe('mongo service', () => {
  it('returns a function', () => {
    expect(typeof mongo)
      .toEqual('function');
  });

  describe('errors', () => {
    it('is an object', () => {
      expect(typeof mongo().errors)
        .toEqual('object');
    });

    it('contains duplicate key error with mongodb error code', () => {
      expect(mongo().errors.duplicateKey)
        .toEqual(11000);
    });
  });

  describe('isError', () => {
    it('identifies MongoErrors', () => {
      const service = mongo();
      const duplicateError = new MongoError('Duplicate!');
      duplicateError.code = service.errors.duplicateKey;
      expect(service.isError(duplicateError, service.errors.duplicateKey))
        .toEqual(true);
    });

    it('does not identify non MongoErrors', () => {
      const service = mongo();
      const duplicateError = new Error('Duplicate!');
      duplicateError.code = service.errors.duplicateKey;
      expect(service.isError(duplicateError, service.errors.duplicateKey))
        .toEqual(false);
    });
  });
});

