import accelerationMod from './mods/acceleration.js'
import anchorMod from './mods/anchor.js'
import cameraMod from './mods/camera.js'
import groupMod from './mods/group.js'
import opacityMod from './mods/opacity.js'
import rectMod from './mods/rect.js'
import renderMod from './mods/render.js'
import rotationMod from './mods/rotation.js'
import scaleMod from './mods/scale.js'
import ttlMod from './mods/ttl.js'
import updateMod from './mods/update.js'
import velocityMod from './mods/velocity.js'

class ModObject {
  constructor(properties) {
    return this.init(properties);
  }

  init(properties = {}) {
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
      velocityMod
      // @endif
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