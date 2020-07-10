import accelerationMod from '../../../src/mods/acceleration.js';

// --------------------------------------------------
// acceleration
// --------------------------------------------------
describe('acceleration', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(accelerationMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup acceleration property', () => {
    expect(obj.acceleration.constructor.name).to.equal('Vector');
  });





  // --------------------------------------------------
  // ddx
  // --------------------------------------------------
  describe('ddx', () => {

    it('should set the acceleration x property', () => {
      obj.ddx = 10;

      expect(obj.acceleration.x).to.equal(10);
    });

    it('should return the acceleration x property', () => {
      obj.acceleration.x = 10;

      expect(obj.ddx).to.equal(10);
    });

  });





  // --------------------------------------------------
  // ddy
  // --------------------------------------------------
  describe('ddy', () => {

    it('should set the acceleration y property', () => {
      obj.ddy = 10;

      expect(obj.acceleration.y).to.equal(10);
    });

    it('should return the acceleration x property', () => {
      obj.acceleration.y = 10;

      expect(obj.ddy).to.equal(10);
    });

  });

});