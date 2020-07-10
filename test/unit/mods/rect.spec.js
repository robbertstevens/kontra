import rectMod from '../../../src/mods/rect.js';

// --------------------------------------------------
// rect
// --------------------------------------------------
describe('rect', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(rectMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup position, width, and height properties', () => {
    expect(obj.position.constructor.name).to.equal('Vector');
    expect(obj.width).to.equal(0);
    expect(obj.height).to.equal(0);
  });





  // --------------------------------------------------
  // x
  // --------------------------------------------------
  describe('x', () => {

    it('should set the position x property', () => {
      obj.x = 10;

      expect(obj.position.x).to.equal(10);
    });

    it('should return the position x property', () => {
      obj.position.x = 10;

      expect(obj.x).to.equal(10);
    });

    it('should set the x property for each child', () => {
      obj.children = [{
        x: 40
      }, {
        x: 25
      }];

      obj.x += 20;

      expect(obj.children[0].x).to.equal(60);
      expect(obj.children[1].x).to.equal(45);
    });

  });





  // --------------------------------------------------
  // y
  // --------------------------------------------------
  describe('y', () => {

    it('should set the position y property', () => {
      obj.y = 10;

      expect(obj.position.y).to.equal(10);
    });

    it('should return the position y property', () => {
      obj.position.y = 10;

      expect(obj.y).to.equal(10);
    });

    it('should set the x property for each child', () => {
      obj.children = [{
        y: 40
      }, {
        y: 25
      }];

      obj.y += 20;

      expect(obj.children[0].y).to.equal(60);
      expect(obj.children[1].y).to.equal(45);
    });

  });

});