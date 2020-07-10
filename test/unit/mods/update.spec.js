import updateMod from '../../../src/mods/update.js';
import Vector from '../../../src/vector.js';

// --------------------------------------------------
// update
// --------------------------------------------------
describe('update', () => {

  let obj;
  beforeEach(() => {
    obj = {};
    let { i, ...props } = Object.getOwnPropertyDescriptors(updateMod);
    Object.defineProperties(obj, props);
    i && i.value.call(obj);
  });





  // --------------------------------------------------
  // update
  // --------------------------------------------------
  describe('update', () => {

    it('should call the advance function', () => {
      sinon.stub(obj, 'advance');

      obj.update();

      expect(obj.advance.called).to.be.true;
    });

    it('should pass dt', () => {
      sinon.stub(obj, 'advance');

      obj.update(1/60);

      expect(obj.advance.calledWith(1/60)).to.be.true;
    });

  });





  // --------------------------------------------------
  // advance
  // --------------------------------------------------
  describe('advance', () => {

    it('should add the acceleration to the velocity', () => {
      obj.velocity = Vector(5, 10);
      obj.acceleration = Vector(15, 20);

      obj.advance();

      expect(obj.velocity.x).to.equal(20);
      expect(obj.velocity.y).to.equal(30);
    });

    it('should not change the original velocity', () => {
      obj.velocity = Vector(5, 10);
      obj.acceleration = Vector(15, 20);

      let originalVelocity = obj.velocity;

      obj.advance();

      expect(obj.velocity).to.not.equal(originalVelocity);
    });

    it('should use dt to add the acceleration', () => {
      let spy = sinon.spy();
      obj.velocity = {
        add: spy
      };
      obj.acceleration = Vector(10, 20);

      obj.advance(2);

      expect(spy.calledWith(obj.acceleration, 2));
    });

    it('should add the velocity to the position', () => {
      obj.position = Vector(5, 10);
      obj.velocity = Vector(15, 20);

      obj.advance();

      expect(obj.position.x).to.equal(20);
      expect(obj.position.y).to.equal(30);
    });

    it('should not change the original position', () => {
      obj.position = Vector(5, 10);
      obj.velocity = Vector(15, 20);

      let originalPosition = obj.position;

      obj.advance();

      expect(obj.position).to.not.equal(originalPosition);
    });

    it('should use dt to add the velocity', () => {
      let spy = sinon.spy();
      obj.position = {
        add: spy
      };
      obj.velocity = Vector(10, 20);

      obj.advance(2);

      expect(spy.calledWith(obj.velocity, 2));
    });

    it('should update ttl', () => {
      obj.ttl = 10;

      obj.advance();

      expect(obj.ttl).to.equal(9);
    });

  });

});