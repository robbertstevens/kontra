import renderMod from '../../../src/mods/render.js';
import { getContext } from '../../../src/core.js';

// --------------------------------------------------
// render
// --------------------------------------------------
describe('render', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(renderMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });

  it('should setup context property', () => {
    expect(obj.context).to.equal(getContext());
  });





  // --------------------------------------------------
  // render
  // --------------------------------------------------
  describe('render', () => {

    afterEach(() => {
      obj.context.translate.restore && obj.context.translate.restore();
      obj.context.rotate.restore && obj.context.rotate.restore();
      obj.context.scale.restore && obj.context.scale.restore();
    });

    it('should translate to the x and y position', () => {
      obj.x = 10;
      obj.y = 20;

      sinon.stub(obj.context, 'translate');

      obj.render();

      expect(obj.context.translate.calledWith(10, 20)).to.be.true;
    });

    it('should translate to the viewX and viewY position', () => {
      obj.x = 10;
      obj.y = 20;
      obj.viewX = 30;
      obj.viewY = 40;

      sinon.stub(obj.context, 'translate');

      obj.render();

      expect(obj.context.translate.calledWith(30, 40)).to.be.true;
    });

    it('should not translate if the position is 0', () => {
      obj.x = 0;
      obj.y = 0;

      sinon.stub(obj.context, 'translate');

      obj.render();

      expect(obj.context.translate.called).to.be.false;
    });

    it('should rotate by the rotation', () => {
      obj.rotation = 10;

      sinon.stub(obj.context, 'rotate');

      obj.render();

      expect(obj.context.rotate.calledWith(10)).to.be.true;
    });

    it('should not rotate if the rotation is 0', () => {
      obj.rotation = 0;

      sinon.stub(obj.context, 'rotate');

      obj.render();

      expect(obj.context.rotate.called).to.be.false;
    });

    it('should scale the canvas', () => {
      obj.scale = {x: 2, y: 2};

      sinon.stub(obj.context, 'scale');

      obj.render();

      expect(obj.context.scale.calledWith(2, 2)).to.be.true;
    });

    it('should not scale if scale.x and scale.y are 1', () => {
      obj.scale = {x: 1, y: 1};

      sinon.stub(obj.context, 'scale');

      obj.render();

      expect(obj.context.scale.called).to.be.false;
    });

    it('should translate to the anchor position', () => {
      obj.anchor = {x: 0.5, y: 0.5};
      obj.width = 20;
      obj.height = 30;

      sinon.stub(obj.context, 'translate');

      obj.render();

      expect(obj.context.translate.calledWith(-10, -15)).to.be.true;
    });

    it('should not translate if the anchor position is 0, 0', () => {
      obj.anchor = {x: 0, y: 0};
      obj.width = 20;
      obj.height = 30;

      sinon.stub(obj.context, 'translate');

      obj.render();

      expect(obj.context.translate.called).to.be.false;
    });

    it('should set the globalAlpha', () => {
      obj.finalOpacity = 0.5;

      var spy = sinon.spy(obj.context, 'globalAlpha', ['set']);

      obj.render();

      expect(spy.set.calledWith(0.5)).to.be.true;

      spy.restore();
    });

    it('should call the render function', () => {
      sinon.stub(obj, '_rf');

      obj.render();

      expect(obj._rf.called).to.be.true;
    });

    it('should call render on each child', () => {
      let child = {
        render: sinon.stub()
      };

      obj.children = [child];

      obj.render();

      expect(child.render.called).to.be.true;
    });

  });

});