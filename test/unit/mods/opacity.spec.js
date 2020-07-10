import opacityMod from '../../../src/mods/opacity.js';

// --------------------------------------------------
// opacity
// --------------------------------------------------
describe('opacity', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(opacityMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup opacity property', () => {
    expect(obj.opacity).to.equal(1);
  });





  // --------------------------------------------------
  // opacity
  // --------------------------------------------------
  describe('opacity', () => {
    it('should set and get the opacity property', () => {
      obj.opacity = 10;

      expect(obj.opacity).to.equal(10);
    });

    it('should set the final opacity value based on the parent', () => {
      obj.parent = {
        _fop: 0.5
      };

      obj.opacity = 0.25;

      expect(obj._fop).to.equal(0.125);
    });

    it('should set the opacity for each child', () => {
      let child = {
        set opacity(value) {
          this._op = value;
        }
      };
      obj.children = [child];
      let spy = sinon.spy(child, 'opacity', ['set']);

      obj.opacity = 0.25;

      expect(spy.set.called).to.be.true;
    });

  });





  // --------------------------------------------------
  // finalOpacity
  // --------------------------------------------------
  describe('finalOpacity', () => {

    it('should return the opacity', () => {
      obj.opacity = 0.5;

      expect(obj.finalOpacity).to.equal(0.5);
    });

    it('should return the final opacity value', () => {
      obj._fop = 0.75;

      expect(obj.finalOpacity).to.equal(0.75);
    });

    it('should be readonly', () => {
      function fn() {
        this.finalOpacity = 20;
      }

      expect(fn).to.throw();
    });

  });

});