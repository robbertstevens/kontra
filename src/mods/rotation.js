// @ifdef GAMEOBJECT_ROTATION
export default {
  i() {
    this.rotation = 0;
  },

  // @ifdef GAMEOBJECT_GROUP
  get rotation() {
    // rot = rotation
    return this._rot;
  },

  set rotation(value) {
    this.children.map(child => {
      child.rotation += value - this._rot;
    });

    this._rot = value;
  }
  // @endif
};
// @endif