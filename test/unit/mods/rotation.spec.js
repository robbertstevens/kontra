import rotationMod from '../../../src/mods/rotation.js';

// --------------------------------------------------
// rotation
// --------------------------------------------------
describe('rotation', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(rotationMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup rotation property', () => {
    expect(obj.rotation).to.equal(0);
  });





  // --------------------------------------------------
  // rotation
  // --------------------------------------------------
  describe('rotation', () => {

    it('should set and get the rotation property', () => {
      obj.rotation = 10;

      expect(obj.rotation).to.equal(10);
    });

    it('should set the rotation property for each child', () => {
      obj.children = [{
        rotation: 40
      }, {
        rotation: 25
      }];

      obj.rotation += 20;

      expect(obj.children[0].rotation).to.equal(60);
      expect(obj.children[1].rotation).to.equal(45);
    });

  });

});