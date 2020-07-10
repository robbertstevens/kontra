import {
  accelerationMod,
  anchorMod,
  cameraMod,
  groupMod,
  opacityMod,
  rectMod,
  renderMod,
  rotationMod,
  scaleMod,
  ttlMod,
  updateMod,
  velocityMod
} from './mods/index.js';

let handler = {
  set(obj, prop, value) {
    obj._ev.map(ev => ev.call(obj, prop, value));
    Reflect.set(obj, prop, value);
  }
};

class ModObject {
  constructor(properties) {
    this.init(properties);

    return new Proxy(this, handler);
  }

  init(properties = {}) {
    this._ev = [];

    let mods = properties.mods || [];

    [
      // @ifdef GAMEOBJECT_GROUP
      // group mod needs to go first in order to setup children
      // for all other mods
      groupMod,
      // @endif

      // --------------------------------------------------
      // defaults
      // --------------------------------------------------

      rectMod,
      renderMod,
      updateMod,

      // --------------------------------------------------
      // optionals
      // --------------------------------------------------

      // @ifdef GAMEOBJECT_ACCELERATION
      accelerationMod,
      // @endif

      // @ifdef GAMEOBJECT_ANCHOR
      anchorMod,
      // @endif

      // @ifdef GAMEOBJECT_CAMERA
      cameraMod,
      // @endif

      // @ifdef GAMEOBJECT_OPACITY
      opacityMod,
      // @endif

      // @ifdef GAMEOBJECT_ROTATION
      rotationMod,
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      scaleMod,
      // @endif

      // @ifdef GAMEOBJECT_TTL
      ttlMod,
      // @endif

      // @ifdef GAMEOBJECT_VELOCITY
      velocityMod,
      // @endif

      ...mods
    ].map(mod => {
      let { i, ...props } = Object.getOwnPropertyDescriptors(mod);
      Object.defineProperties(this, props);
      i && i.value.call(this);
    });

    let {
      render,

      // @ifdef GAMEOBJECT_GROUP
      children = [],
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      scale = this.scale,
      // @endif

      ...props
    } = properties;
    Object.assign(this, props);

    // @ifdef GAMEOBJECT_GROUP
    children.map(child => this.addChild(child));
    // @endif

    // @ifdef GAMEOBJECT_SCALE
    this.setScale(scale.x, scale.y);
    // @endif

    this._rf = render || this.draw;
  }
}

export default function modObjectFactory() {
  return new ModObject(...arguments);
}
modObjectFactory.prototype = ModObject.prototype;
modObjectFactory.class = ModObject;