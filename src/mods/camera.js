// @ifdef GAMEOBJECT_CAMERA
export default {
  i() {
    this.sx = this.sy = 0;
  },

  get viewX() {
    return this.x - this.sx;
  },

  get viewY() {
    return this.y - this.sy;
  },

  // @ifdef GAMEOBJECT_GROUP
  // get sx() {
  //   return this._sx;
  // },

  // get sy() {
  //   return this._sy;
  // },

  // set sx(value) {
  //   (this.children || []).map(child => {
  //     child.sx += value - this._sx;
  //   });

  //   this._sx = value;
  // },

  // set sy(value) {
  //   (this.children || []).map(child => {
  //     child.sy += value - this._sy;
  //   });

  //   this._sy = value;
  // }
  // @endif
};
// @endif