import scaleMod from '../../../src/mods/scale.js';

// --------------------------------------------------
// scale
// --------------------------------------------------
describe('scale', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(scaleMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup scale property', () => {
    expect(obj.scale).to.deep.equal({x: 1, y: 1});
  });





  // --------------------------------------------------
  // setScale
  // --------------------------------------------------
  describe('setScale', () => {

    it('should set the scale property', () => {
      obj.setScale(10, 5);

      expect(obj.scale).to.deep.equal({x: 10, y: 5});
    });

    it('should default the y scale to the x scale', () => {
      obj.setScale(5);

      expect(obj.scale).to.deep.equal({x: 5, y: 5});
    });

    it('should set scale for each child', () => {
      var child1Spy = sinon.spy();
      var child2Spy = sinon.spy();

      obj.children = [{
        scale: {x: 40, y: 20},
        setScale: child1Spy
      }, {
        scale: {x: 25, y: 10},
        setScale: child2Spy
      }];

      obj.setScale(2, 5);

      expect(child1Spy.calledWith(41, 24)).to.be.true;
      expect(child2Spy.calledWith(26, 14)).to.be.true;
    });

  });





  // --------------------------------------------------
  // scaledWidth
  // --------------------------------------------------
  describe('scaledWidth', () => {

    it('should return the scaled width', () => {
      obj.width = 100;
      obj.scale = {x: 2, y: 2};

      expect(obj.scaledWidth).to.equal(200);
    });

    it('should be readonly', () => {
      function fn() {
        this.scaledWidth = 20;
      }

      expect(fn).to.throw();
    });

  });





  // --------------------------------------------------
  // scaledHeight
  // --------------------------------------------------
  describe('scaledHeight', () => {

    it('should return the scaled height', () => {
      obj.height = 100;
      obj.scale = {x: 2, y: 2};

      expect(obj.scaledHeight).to.equal(200);
    });

    it('should be readonly', () => {
      function fn() {
        this.scaledHeight = 20;
      }

      expect(fn).to.throw();
    });

  });

});