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

  describe('resolveKeyPath()', () => {
    describe('if the key path does not contain sub keys', () => {
      it('returns the property value', () => {
        const service = mongo();
        const mock = {
          foo: {
            bar: 'baz'
          }
        };

        expect(service.resolveKeyPath(mock, 'foo.bar'))
          .toEqual('baz');
      });
    });
  });

  describe('toMongoPatch()', () => {
    describe('when the patch is a flat object', () => {
      it('returns the flat object', () => {
        const service = mongo();
        expect(service.toMongoPatch({ name: 'unit test' }))
          .toEqual({ name: 'unit test' });
      });
    });

    describe('when the patch contains sub objects', () => {
      it('flattens the objects into keyPaths', () => {
        const service = mongo();
        expect(service.toMongoPatch({ cycle: { length: 25 } }))
          .toEqual({ 'cycle.length': 25 });
      });
    });
  });

  describe('changes()', () => {
    describe('when the patch changes a direct descendant field', () => {
      it('properly reports the change', () => {
        const service = mongo();
        const mock = {
          foo: {
            bar: 'baz'
          },
          alpha: 3
        };

        const changes = service.changes(mock, {
          alpha: 4
        });

        expect(changes)
          .toContainEqual({
            field: 'alpha',
            from: 3,
            to: 4
          });
      });
    });

    describe('when the patch does not change anything', () => {
      it('reports no changes', () => {
        const service = mongo();
        const mock = {
          foo: {
            bar: 'baz'
          },
          alpha: 3
        };

        const changes = service.changes(mock, {
          alpha: 3
        });

        expect(changes.length)
          .toEqual(0);
      });
    });

    describe('when the patch changes a subdocument', () => {
      it('reports with key paths', () => {
        const service = mongo();
        const mock = {
          foo: {
            bar: 'baz'
          },
          alpha: 3
        };

        const changes = service.changes(mock, {
          foo: {
            bar: 'blub'
          }
        });

        expect(changes)
          .toContainEqual({
            field: 'foo.bar',
            from: 'baz',
            to: 'blub'
          });
      });
    });
  });
});

