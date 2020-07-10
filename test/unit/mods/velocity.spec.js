import velocityMod from '../../../src/mods/velocity.js';

// --------------------------------------------------
// velocity
// --------------------------------------------------
describe('velocity', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(velocityMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup velocity property', () => {
    expect(obj.velocity.constructor.name).to.equal('Vector');
  });





  // --------------------------------------------------
  // dx
  // --------------------------------------------------
  describe('dx', () => {

    it('should set the velocity x property', () => {
      obj.dx = 10;

      expect(obj.velocity.x).to.equal(10);
    });

    it('should return the velocity x property', () => {
      obj.velocity.x = 10;

      expect(obj.dx).to.equal(10);
    });

  });





  // --------------------------------------------------
  // dy
  // --------------------------------------------------
  describe('dy', () => {

    it('should set the velocity y property', () => {
      obj.dy = 10;

      expect(obj.velocity.y).to.equal(10);
    });

    it('should return the velocity x property', () => {
      obj.velocity.y = 10;

      expect(obj.dy).to.equal(10);
    });

  });

});