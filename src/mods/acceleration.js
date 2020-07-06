import Vector from '../vector.js'

export default {
  i() {
    this.acceleration = Vector();
  },

  get ddx() {
    return this.acceleration.x;
  },

  get ddy() {
    return this.acceleration.y;
  },

  set ddx(value) {
    this.acceleration.x = value;
  },

  set ddy(value) {
    this.acceleration.y = value;
  }
};