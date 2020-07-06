let group = {
  i() {
    this.children = [];
  },

  adChild(child, { absolute = false } = {}) {
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
  },

  // @ifdef GAMEOBJECT_SCALE
  setScale(x, y = x) {
    this.children.map(child => {
      if (!child.setScale) return;
      child.setScale(
        child.scale.x + x - this.scale.x,
        child.scale.y + y - this.scale.y
      );
    });

    this.scale = {x, y};
  },
  // @endif

  // @ifdef GAMEOBJECT_OPACITY
  get finalOpacity() {
    return this._fop;
  },

  // readonly
  set finalOpacity(value) {},

  get opacity() {
    return this._opacity;
  },

  set opacity(value) {
    // final opacity value is calculated by multiplying all opacities
    // in the parent chain.
    this._fop = this.parent && this.parent._fop ? value * this.parent._fop : value;

    // trigger a final opacity calculation of all children
    this.children.map(child => {
      child.opacity = child.opacity;
    });

    this._opacity = value;
  }
  // @endif
};

// all properties that should be added to the child value
let props = [
  'x', 'y',

  // @ifdef GAMEOBJECT_CAMERA
  'sx', 'sy',
  // @endif

  // @ifdef GAMEOBJECT_ROTATION
  'rotation'
  // @endif
].map(prop => {
  let propName = '_' + prop;
  Object.defineProperty(group, prop, {
    get() {
      return this[propName];
    },
    set(value) {
      this.children.map(child => {
        child[prop] += value - this[propName];
      });
      this[propName] = value;
    }
  });
});

export default group;