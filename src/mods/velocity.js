import Vector from '../vector.js'

export default {
  i() {
    this.velocity = Vector();
  },

  get dx() {
    return this.velocity.x;
  },

  get dy() {
    return this.velocity.y;
  },

  set dx(value) {
    this.velocity.x = value;
  },

  set dy(value) {
    this.velocity.y = value;
  }
};