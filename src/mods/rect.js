import Vector from '../vector.js'

export default {
  i() {
    this.position = Vector();
    this.width = this.height = 0;
  },

  get x() {
    return this.position.x;
  },

  get y() {
    return this.position.y;
  },

  set x(value) {
    this.position.x = value;
  },

  set y(value) {
    this.position.y = value;
  }
};