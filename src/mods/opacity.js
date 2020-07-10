// @ifdef GAMEOBJECT_OPACITY
export default {
  i() {
    this.opacity = 1;
  },

  get finalOpacity() {
    let finalOp = this.opacity;

    // @ifdef GAMEOBJECT_GROUP
    finalOp = this._fop;
    // @endif

    return finalOp;
  },

  // @ifdef GAMEOBJECT_GROUP
  get opacity() {
    // op = opacity
    return this._op;
  },

  set opacity(value) {
    // final opacity value is calculated by multiplying all opacities
    // in the parent chain.
    this._fop = this.parent && this.parent._fop != undefined ? value * this.parent._fop : value;

    // trigger a final opacity calculation of all children
    (this.children || []).map(child => {
      child.opacity = child.opacity;
    });

    this._op = value;
  }
  // @endif
};
// @endif