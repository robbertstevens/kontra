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

  set viewX(value) {},
  set viewY(value) {}
};