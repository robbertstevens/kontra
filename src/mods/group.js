// @ifdef GAMEOBJECT_GROUP
let group = {
  i() {
    this.children = [];
  },

  addChild(child, { absolute = false } = {}) {
    this.children.push(child);
    child.parent = this;

    child.x = absolute ? child.x : this.x + child.x;
    child.y = absolute ? child.y : this.y + child.y;

    // @ifdef GAMEOBJECT_ROTATION
    child.rotation = this.rotation + child.rotation;
    // @endif

    // @ifdef GAMEOBJECT_SCALE
    if (child.setScale) {
      child.setScale(this.scale.x, this.scale.y);
    }
    // @endif

    // @ifdef GAMEOBJECT_CAMERA
    if ('sx' in child) {
      child.sx = absolute ? child.sx : this.sx + child.sx;
      child.sy = absolute ? child.sy : this.sy + child.sy;
    }
    // @endif

    // @ifdef GAMEOBJECT_OPACITY
    child._fop = this.opacity * child.opacity;
    // @endif
  },

  removeChild(child) {
    let index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }
};

export default group;
// @endif