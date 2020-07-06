export default {
  i() {
    this.scale = {x: 1, y: 1};
  },

  setScale(x, y = x) {
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