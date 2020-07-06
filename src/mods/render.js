import { getContext } from '../core.js';

export default {
  i() {
    this.context = getContext();
  },

  render() {
    let context = this.context;
    context.save();

    // want to be able to use ?? and optional chaining but
    // they are not supported in terser yet
    // @see https://github.com/terser/terser/issues/567
    // let viewX = this.viewX ?? this.x;
    // let viewY = this.viewY ?? this.y;
    let viewX = this.x;
    let viewY = this.y;

    // @ifdef GAMEOBJECT_CAMERA
    if ('viewX' in this) {
      viewX = this.viewX;
      viewY = this.viewY;
    }
    // @endif

    // it's faster to only translate if one of the values is non-zero
    // rather than always translating
    // @see https://jsperf.com/translate-or-if-statement/
    if (viewX || viewY) {
      context.translate(viewX, viewY)
    }

    // @ifdef GAMEOBJECT_ROTATION
    // rotate around the anchor. it's faster to only rotate when set
    // rather than always rotating
    // @see https://jsperf.com/rotate-or-if-statement/
    if (this.rotation) {
      context.rotate(this.rotation);
    }
    // @endif


    // @ifdef GAMEOBJECT_SCALE
    if ('scale' in this) {
      let scaleX = this.scale.x;
      let scaleY = this.scale.y;

      // it's faster to only scale if one of the values is non-zero
      // rather than always scaling
      // @see https://jsperf.com/scale-or-if-statement/4
      if (scaleX != 1 || scaleY != 1) {
        context.scale(scaleX, scaleY);
      }
    }
    // @endif

    // @ifdef GAMEOBJECT_ANCHOR
    if ('anchor' in this) {
      let x = -this.width * this.anchor.x;
      let y = -this.height * this.anchor.y;

      if (x || y) {
        context.translate(x, y);
      }
    }
    // @endif

    // @ifdef GAMEOBJECT_OPACITY
    // it's not really any faster to gate the global alpha
    // @see https://jsperf.com/global-alpha-or-if-statement/1
    this.context.globalAlpha = this.finalOpacity;
    // @endif

    this._rf();
    context.restore();
  }
};