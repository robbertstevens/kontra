import { Factory } from './utils.js'
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
import velocityMod from './mods/velocity.js'

class GameObject {
  constructor(properties) {
    return this.init(properties);
  }

  init(properties = {}) {
    [
      // --------------------------------------------------
      // defaults
      // --------------------------------------------------

      rectMod,
      renderMod,

      // --------------------------------------------------
      // optionals
      // --------------------------------------------------

      // @ifdef GAMEOBJECT_GROUP
      // groupMod must be first to override others
      groupMod,
      // @endif

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
      i && i.value.call(this);
      for (let prop in props) {
        if (!Object.hasOwnProperty(prop)) {
          Object.defineProperty(this, prop, props[prop]);
        }
      }
    });

    let { render, ...props } = properties;
    Object.assign(this, props);

    this._rf = render || this.draw;
  }

  draw() {}

  update(dt) {
    // @ifdef GAMEOBJECT_VELOCITY||GAMEOBJECT_ACCELERATION||GAMEOBJECT_TTL
    this.advance(dt);
    // @endif
  }

  advance(dt) {
    // @ifdef GAMEOBJECT_VELOCITY

    // @ifdef GAMEOBJECT_ACCELERATION
    this.velocity = this.velocity.add(this.acceleration, dt);
    // @endif

    this.position = this.position.add(this.velocity, dt);
    // @endif

    // @ifdef GAMEOBJECT_TTL
    this.ttl--;
    // @endif
  }
}

export default Factory(GameObject)