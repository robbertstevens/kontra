// @ifdef GAMEOBJECT_SCALE
export default {
  i() {
    this.scaleX = this.scaleY = 1;
  },

  // setScale(x, y = x) {
  //   // @ifdef GAMEOBJECT_GROUP
  //   (this.children || []).map(child => {
  //     if (!child.setScale) return;
  //     child.setScale(
  //       child.scale.x + x - this.scale.x,
  //       child.scale.y + y - this.scale.y
  //     );
  //   });
  //   // @endif

  //   this.scale = {x, y};
  // },

  get scaledWidth() {
    return this.width * this.scaleX;
  },

  get scaledHeight() {
    return this.height * this.scaleY;
  }
};
// @endif