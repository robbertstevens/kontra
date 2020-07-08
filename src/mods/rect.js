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
    // @ifdef GAMEOBJECT_GROUP
    this.children.map(child => {
      child.x += value - this.position.x;
    });
    // @endif

    this.position.x = value;
  },

  set y(value) {
    // @ifdef GAMEOBJECT_GROUP
    this.children.map(child => {
      child.y += value - this.position.y;
    });
    // @endif

    this.position.y = value;
  }
};