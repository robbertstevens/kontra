import ttlMod from '../../../src/mods/ttl.js';

// --------------------------------------------------
// ttl
// --------------------------------------------------
describe('ttl', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(ttlMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup ttl property', () => {
    expect(obj.ttl).to.equal(Infinity);
  });





  // --------------------------------------------------
  // isAlive
  // --------------------------------------------------
  describe('isAlive', () => {

    it('should return true if ttl is above 0', () => {
      obj.ttl = 20;

      expect(obj.isAlive()).to.be.true;
    });

    it('should return true if ttl is less than 0', () => {
      obj.ttl = 0;

      expect(obj.isAlive()).to.be.false;

      obj.ttl = -20;

      expect(obj.isAlive()).to.be.false;
    });

  });

});