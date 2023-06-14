describe('@haensl/mongo', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('exposes a function', () => {
    const mongo = require('@haensl/mongo');
    expect(typeof mongo)
      .toEqual('function');
  });

  describe('instance', () => {
    let mongo;

    beforeEach(() => {
      mongo = require('@haensl/mongo')();
    });

    it('exposes a cleanup function', () => {
      expect(typeof mongo.cleanup)
        .toEqual('function');
    });

    it('exposes a client function', () => {
      expect(typeof mongo.client)
        .toEqual('function');
    });

    it('exposes a map of error numbers', () => {
      expect(mongo.errors.duplicateKey)
        .toEqual(11000);
    });

    it('exposes an isError function', () => {
      expect(typeof mongo.isError)
        .toEqual('function');
    });
  });
});
