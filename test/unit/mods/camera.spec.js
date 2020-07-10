import cameraMod from '../../../src/mods/camera.js';

// --------------------------------------------------
// camera
// --------------------------------------------------
describe('camera', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(cameraMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup sx and sy properties', () => {
    expect(obj.sx).to.equal(0);
    expect(obj.sy).to.equal(0);
  });





  // --------------------------------------------------
  // viewX
  // --------------------------------------------------
  describe('viewX', () => {

    it('should return the x camera offset', () => {
      obj.x = 100;
      obj.sx = 25;

      expect(obj.viewX).to.equal(75);
    });

    it('should be readonly', () => {
      function fn() {
        this.viewX = 20;
      }

      expect(fn).to.throw();
    });

  });





  // --------------------------------------------------
  // viewY
  // --------------------------------------------------
  describe('viewY', () => {

    it('should return the y camera offset', () => {
      obj.y = 100;
      obj.sy = 25;

      expect(obj.viewY).to.equal(75);
    });

    it('should be readonly', () => {
      function fn() {
        this.viewY = 20;
      }

      expect(fn).to.throw();
    });

  });





  // --------------------------------------------------
  // sx
  // --------------------------------------------------
  describe('sx', () => {

    it('should set and get the sx property', () => {
      obj.sx = 10;

      expect(obj.sx).to.equal(10);
    });

    it('should set the sx property for each child', () => {
      obj.children = [{
        sx: 40
      }, {
        sx: 25
      }];

      obj.sx += 20;

      expect(obj.children[0].sx).to.equal(60);
      expect(obj.children[1].sx).to.equal(45);
    });

  });





  // --------------------------------------------------
  // sy
  // --------------------------------------------------
  describe('sy', () => {

    it('should set and get the sy property', () => {
      obj.sy = 10;

      expect(obj.sy).to.equal(10);
    });

    it('should set the sy property for each child', () => {
      obj.children = [{
        sy: 40
      }, {
        sy: 25
      }];

      obj.sy += 20;

      expect(obj.children[0].sy).to.equal(60);
      expect(obj.children[1].sy).to.equal(45);
    });

  });

});