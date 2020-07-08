// @ifdef GAMEOBJECT_SCALE
export default {
  i() {
    this.scale = {x: 1, y: 1};
  },

  setScale(x, y = x) {
    // @ifdef GAMEOBJECT_GROUP
    this.children.map(child => {
      if (!child.setScale) return;
      child.setScale(
        child.scale.x + x - this.scale.x,
        child.scale.y + y - this.scale.y
      );
    });
    // @endif

    this.scale = {x, y};
  },

  get scaledWidth() {
    return this.width * this.scale.x;
  },

  get scaledHeight() {
    return this.height * this.scale.y;
  },

  set scaledWidth(value) {},
  set scaledHeight(value) {}
};
// @endif