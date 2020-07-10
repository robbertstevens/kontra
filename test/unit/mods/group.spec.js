import groupMod from '../../../src/mods/group.js';

// --------------------------------------------------
// group
// --------------------------------------------------
describe('group', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(groupMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup children property', () => {
    expect(obj.children).to.deep.equal([]);
  });





  // --------------------------------------------------
  // addChild
  // --------------------------------------------------
  describe('addChild', () => {

    it('should add the object as a child', () => {
      let child = {
        foo: 'bar'
      };
      obj.addChild(child);

      expect(obj.children).deep.equal([child]);
    });

    it('should set the childs parent to the game object', () => {
      let child = {
        foo: 'bar'
      };
      obj.addChild(child);

      expect(child.parent).to.equal(obj);
    });

    it('should set the childs relative position', () => {
      obj.x = 30;
      obj.y = 35;

      let child = {
        x: 0,
        y: 0
      };

      obj.addChild(child);

      expect(child.x).to.equal(30);
      expect(child.y).to.equal(35);
    });

    it('should set the childs absolute position', () => {
      obj.x = 30;
      obj.y = 35;

      let child = {
        x: 0,
        y: 0
      };

      obj.addChild(child, { absolute: true });

      expect(child.x).to.equal(0);
      expect(child.y).to.equal(0);
    });


    it('should set the childs rotation', () => {
      obj.rotation = 30;

      let child = {
        rotation: 10
      };

      obj.addChild(child);

      expect(child.rotation).to.equal(40);
    });

    it('should call setScale on the child', () => {
      obj.scale = {x: 2, y: 2}

      let spy = sinon.spy();
      let child = {
        setScale: spy
      };

      obj.addChild(child);

      expect(spy.calledWith(2, 2)).to.be.true;
    });

    it('should set the childs relative sx and sy', () => {
      obj.sx = 30;
      obj.sy = 40;

      let child = {
        sx: 10,
        sy: 10
      };

      obj.addChild(child);

      expect(child.sx).to.equal(40);
      expect(child.sy).to.equal(50);
    });

    it('should set the childs absolute sx and sy', () => {
      obj.sx = 30;
      obj.sy = 40;

      let child = {
        sx: 10,
        sy: 10
      };

      obj.addChild(child, { absolute: true });

      expect(child.sx).to.equal(10);
      expect(child.sy).to.equal(10);
    });

    it('should set the childs final opacity', () => {
      obj.opacity = 0.5;

      let child = {
        opacity: 1
      };

      obj.addChild(child);

      expect(child._fop).to.equal(0.5);
    });

    it('should not change the childs opacity', () => {
      obj.opacity = 0.5;

      let child = {
        opacity: 1
      };

      obj.addChild(child);

      expect(child.opacity).to.equal(1);
    });

  });





  // --------------------------------------------------
  // removeChild
  // --------------------------------------------------
  describe('removeChild', () => {

    it('should remove the object as a child', () => {
      let child = {
        foo: 'bar'
      };
      obj.addChild(child);
      obj.removeChild(child);

      expect(obj.children.length).to.equal(0);
    });

    it('should remove the childs parent', () => {
      let child = {
        foo: 'bar'
      };
      obj.addChild(child);
      obj.removeChild(child);

      expect(child.parent).to.equal(null);
    });

    it('should not error if child was not added', () => {
      let child = {
        foo: 'bar'
      };

      function fn() {
        obj.removeChild(child);
      }

      expect(fn).to.not.throw();
    });

  });

});