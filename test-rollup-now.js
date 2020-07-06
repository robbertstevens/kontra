(function () {
  'use strict';

  /**
   * A simple event system. Allows you to hook into Kontra lifecycle events or create your own, such as for [Plugins](api/plugin).
   *
   * ```js
   * import { on, off, emit } from 'kontra';
   *
   * function callback(a, b, c) {
   *   console.log({a, b, c});
   * });
   *
   * on('myEvent', callback);
   * emit('myEvent', 1, 2, 3);  //=> {a: 1, b: 2, c: 3}
   * off('myEvent', callback);
   * ```
   * @sectionName Events
   */

  /**
   * Functions for initializing the Kontra library and getting the canvas and context
   * objects.
   *
   * ```js
   * import { getCanvas, getContext, init } from 'kontra';
   *
   * let { canvas, context } = init();
   *
   * // or can get canvas and context through functions
   * canvas = getCanvas();
   * context = getContext();
   * ```
   * @sectionName Core
   */

  let canvasEl, context;

  /**
   * Return the canvas element.
   * @function getCanvas
   *
   * @returns {HTMLCanvasElement} The canvas element for the game.
   */
  function getCanvas() {
    return canvasEl;
  }

  /**
   * Return the context object.
   * @function getContext
   *
   * @returns {CanvasRenderingContext2D} The context object the game draws to.
   */
  function getContext() {
    return context;
  }

  /**
   * Factory function that wraps all kontra classes.
   * @param {Object} classObj - Class to wrap in a factory function
   */
  function Factory(classObj) {
    function factory() {
      return new classObj(...arguments);
    }
    factory.prototype = classObj.prototype;
    factory.class = classObj;

    return factory;
  }

  // style used for DOM nodes needed for screen readers
  const srOnlyStyle = 'position:absolute;left:-9999px';

  // get correct x, y, width, and height of object
  function getRect(obj) {
    let x = obj.x;
    let y = obj.y;
    let width = obj.width;
    let height = obj.height;

    // @ifdef GAMEOBJECT_SCALE
    // adjust for object scale
    if (obj.scale) {
      width = obj.scaledWidth;
      height = obj.scaledHeight;
    }
    // @endif

    // @ifdef GAMEOBJECT_ANCHOR
    // take into account object anchor
    if (obj.anchor) {
      x -= width * obj.anchor.x;
      y -= height * obj.anchor.y;
    }
    // @endif

    return {
      x,
      y,
      width,
      height
    };
  }

  /**
   * An object for drawing sprite sheet animations.
   *
   * An animation defines the sequence of frames to use from a sprite sheet. It also defines at what speed the animation should run using `frameRate`.
   *
   * Typically you don't create an Animation directly, but rather you would create them from a [SpriteSheet](api/spriteSheet) by passing the `animations` argument.
   *
   * ```js
   * import { SpriteSheet, Animation } from 'kontra';
   *
   * let image = new Image();
   * image.src = 'assets/imgs/character_walk_sheet.png';
   * image.onload = function() {
   *   let spriteSheet = SpriteSheet({
   *     image: image,
   *     frameWidth: 72,
   *     frameHeight: 97
   *   });
   *
   *   // you typically wouldn't create an Animation this way
   *   let animation = Animation({
   *     spriteSheet: spriteSheet,
   *     frames: [1,2,3,6],
   *     frameRate: 30
   *   });
   * };
   * ```
   * @class Animation
   *
   * @param {Object} properties - Properties of the animation.
   * @param {SpriteSheet} properties.spriteSheet - Sprite sheet for the animation.
   * @param {Number[]} properties.frames - List of frames of the animation.
   * @param {Number}  properties.frameRate - Number of frames to display in one second.
   * @param {Boolean} [properties.loop=true] - If the animation should loop.
   */
  class Animation {
    constructor({spriteSheet, frames, frameRate, loop = true} = {}) {

      /**
       * The sprite sheet to use for the animation.
       * @memberof Animation
       * @property {SpriteSheet} spriteSheet
       */
      this.spriteSheet = spriteSheet;

      /**
       * Sequence of frames to use from the sprite sheet.
       * @memberof Animation
       * @property {Number[]} frames
       */
      this.frames = frames;

      /**
       * Number of frames to display per second. Adjusting this value will change the speed of the animation.
       * @memberof Animation
       * @property {Number} frameRate
       */
      this.frameRate = frameRate;

      /**
       * If the animation should loop back to the beginning once completed.
       * @memberof Animation
       * @property {Boolean} loop
       */
      this.loop = loop;

      let { width, height, margin = 0 } = spriteSheet.frame;

      /**
       * The width of an individual frame. Taken from the property of the same name in the [spriteSheet](api/animation#spriteSheet).
       * @memberof Animation
       * @property {Number} width
       */
      this.width = width;

      /**
       * The height of an individual frame. Taken from the property of the same name in the [spriteSheet](api/animation#spriteSheet).
       * @memberof Animation
       * @property {Number} height
       */
      this.height = height;

      /**
       * The space between each frame. Taken from the property of the same name in the [spriteSheet](api/animation#spriteSheet).
       * @memberof Animation
       * @property {Number} margin
       */
      this.margin = margin;

      // f = frame, a = accumulator
      this._f = 0;
      this._a = 0;
    }

    /**
     * Clone an animation so it can be used more than once. By default animations passed to [Sprite](api/sprite) will be cloned so no two sprites update the same animation. Otherwise two sprites who shared the same animation would make it update twice as fast.
     * @memberof Animation
     * @function clone
     *
     * @returns {Animation} A new Animation instance.
     */
    clone() {
      return new Animation(this);
    }

    /**
     * Reset an animation to the first frame.
     * @memberof Animation
     * @function reset
     */
    reset() {
      this._f = 0;
      this._a = 0;
    }

    /**
     * Update the animation.
     * @memberof Animation
     * @function update
     *
     * @param {Number} [dt=1/60] - Time since last update.
     */
    update(dt = 1/60) {

      // if the animation doesn't loop we stop at the last frame
      if (!this.loop && this._f == this.frames.length-1) return;

      this._a += dt;

      // update to the next frame if it's time
      while (this._a * this.frameRate >= 1) {
        this._f = ++this._f % this.frames.length;
        this._a -= 1 / this.frameRate;
      }
    }

    /**
     * Draw the current frame of the animation.
     * @memberof Animation
     * @function render
     *
     * @param {Object} properties - Properties to draw the animation.
     * @param {Number} properties.x - X position to draw the animation.
     * @param {Number} properties.y - Y position to draw the animation.
     * @param {Number} [properties.width] - width of the sprite. Defaults to [Animation.width](api/animation#width).
     * @param {Number} [properties.height] - height of the sprite. Defaults to [Animation.height](api/animation#height).
     * @param {CanvasRenderingContext2D} [properties.context] - The context the animation should draw to. Defaults to [core.getContext()](api/core#getContext).
     */
    render({x, y, width = this.width, height = this.height, context = getContext()} = {}) {

      // get the row and col of the frame
      let row = this.frames[this._f] / this.spriteSheet._f | 0;
      let col = this.frames[this._f] % this.spriteSheet._f | 0;

      context.drawImage(
        this.spriteSheet.image,
        col * this.width + (col * 2 + 1) * this.margin,
        row * this.height + (row * 2 + 1) * this.margin,
        this.width, this.height,
        x, y,
        width, height
      );
    }
  }

  var Animation$1 = Factory(Animation);

  /**
   * Clamp a number between two values, preventing it from going below or above the minimum and maximum values.
   * @function clamp
   *
   * @param {Number} min - Min value.
   * @param {Number} max - Max value.
   * @param {Number} value - Value to clamp.
   *
   * @returns {Number} Value clamped between min and max.
   */
  function clamp(min, max, value) {
    return Math.min( Math.max(min, value), max );
  }

  /**
   * A simple 2d vector object.
   *
   * ```js
   * import { Vector } from 'kontra';
   *
   * let vector = Vector(100, 200);
   * ```
   * @class Vector
   *
   * @param {Number} [x=0] - X coordinate of the vector.
   * @param {Number} [y=0] - Y coordinate of the vector.
   */
  class Vector {
    constructor(x = 0, y = 0, vec = {}) {
      this.x = x;
      this.y = y;

      // @ifdef VECTOR_CLAMP
      // preserve vector clamping when creating new vectors
      if (vec._c) {
        this.clamp(vec._a, vec._b, vec._d, vec._e);

        // reset x and y so clamping takes effect
        this.x = x;
        this.y = y;
      }
      // @endif
    }

    /**
     * Calculate the addition of the current vector with the given vector.
     * @memberof Vector
     * @function add
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to add to the current Vector.
     *
     * @returns {Vector} A new Vector instance whose value is the addition of the two vectors.
     */
    add(vec) {
      return new Vector(
        this.x + vec.x,
        this.y + vec.y,
        this
      );
    }

    // @ifdef VECTOR_SUBTRACT
    /**
     * Calculate the subtraction of the current vector with the given vector.
     * @memberof Vector
     * @function subtract
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to subtract from the current Vector.
     *
     * @returns {Vector} A new Vector instance whose value is the subtraction of the two vectors.
     */
     subtract(vec) {
      return new Vector(
        this.x - vec.x,
        this.y - vec.y,
        this
      );
    }
    // @endif

    // @ifdef VECTOR_SCALE
    /**
     * Calculate the multiple of the current vector by a value.
     * @memberof Vector
     * @function scale
     *
     * @param {Number} value - Value to scale the current Vector.
     *
     * @returns {Vector} A new Vector instance whose value is multiplied by the scalar.
     */
    scale(value) {
      return new Vector(
        this.x * value,
        this.y * value
      );
    }
    // @endif

    // @ifdef VECTOR_NORMALIZE
    /**
     * Calculate the normalized value of the current vector. Requires the Vector [length](/api/vector#length) function.
     * @memberof Vector
     * @function normalize
     *
     * @returns {Vector} A new Vector instance whose value is the normalized vector.
     */
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
    normalize(length = this.length()) {
      return new Vector(
        this.x / length,
        this.y / length
      );
    }
    // @endif

    // @ifdef VECTOR_DOT||VECTOR_ANGLE
    /**
     * Calculate the dot product of the current vector with the given vector.
     * @memberof Vector
     * @function dot
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to dot product against.
     *
     * @returns {Number} The dot product of the vectors.
     */
    dot(vec) {
      return this.x * vec.x + this.y * vec.y;
    }
    // @endif

    // @ifdef VECTOR_LENGTH||VECTOR_NORMALIZE||VECTOR_ANGLE
    /**
     * Calculate the length (magnitude) of the Vector.
     * @memberof Vector
     * @function length
     *
     * @returns {Number} The length of the vector.
     */
    length() {
      return Math.hypot(this.x, this.y);
    }
    // @endif

    // @ifdef VECTOR_DISTANCE
    /**
     * Calculate the distance between the current vector and the given vector.
     * @memberof Vector
     * @function distance
     *
     * @param {Vector|{x: number, y: number}} vector - Vector to calculate the distance between.
     *
     * @returns {Number} The distance between the two vectors.
     */
    distance(vec) {
      return Math.hypot(this.x - vec.x, this.y - vec.y);
    }
    // @endif

    // @ifdef VECTOR_ANGLE
    /**
     * Calculate the angle (in radians) between the current vector and the given vector. Requires the Vector [dot](/api/vector#dot) and [length](/api/vector#length) functions.
     * @memberof Vector
     * @function angle
     *
     * @param {Vector} vector - Vector to calculate the angle between.
     *
     * @returns {Number} The angle (in radians) between the two vectors.
     */
    angle(vec) {
      return Math.acos(this.dot(vec) / (this.length() * vec.length()));
    }
    // @endif

    // @ifdef VECTOR_CLAMP
    /**
     * Clamp the Vector between two points, preventing `x` and `y` from going below or above the minimum and maximum values. Perfect for keeping a sprite from going outside the game boundaries.
     *
     * ```js
     * import { Vector } from 'kontra';
     *
     * let vector = Vector(100, 200);
     * vector.clamp(0, 0, 200, 300);
     *
     * vector.x += 200;
     * console.log(vector.x);  //=> 200
     *
     * vector.y -= 300;
     * console.log(vector.y);  //=> 0
     *
     * vector.add({x: -500, y: 500});
     * console.log(vector);    //=> {x: 0, y: 300}
     * ```
     * @memberof Vector
     * @function clamp
     *
     * @param {Number} xMin - Minimum x value.
     * @param {Number} yMin - Minimum y value.
     * @param {Number} xMax - Maximum x value.
     * @param {Number} yMax - Maximum y value.
     */
    clamp(xMin, yMin, xMax, yMax) {
      this._c = true;
      this._a = xMin;
      this._b = yMin;
      this._d = xMax;
      this._e = yMax;
    }

    /**
     * X coordinate of the vector.
     * @memberof Vector
     * @property {Number} x
     */
    get x() {
      return this._x;
    }

    /**
     * Y coordinate of the vector.
     * @memberof Vector
     * @property {Number} y
     */
    get y() {
      return this._y;
    }

    set x(value) {
      this._x = (this._c ? clamp(this._a, this._d, value) : value);
    }

    set y(value) {
      this._y = (this._c ? clamp(this._b, this._e, value) : value);
    }
    // @endif
  }

  var Vector$1 = Factory(Vector);

  /**
   * The base class of most renderable classes. Handles things such as position, rotation, anchor, and the update and render life cycle.
   *
   * Typically you don't create a GameObject directly, but rather extend it for new classes. Because of this, trying to draw using a GameOjbect directly will prove difficult.
   * @class GameObject
   *
   * @param {Object} [properties] - Properties of the game object.
   * @param {Number} [properties.x] - X coordinate of the position vector.
   * @param {Number} [properties.y] - Y coordinate of the position vector.
   * @param {Number} [properties.dx] - X coordinate of the velocity vector.
   * @param {Number} [properties.dy] - Y coordinate of the velocity vector.
   * @param {Number} [properties.ddx] - X coordinate of the acceleration vector.
   * @param {Number} [properties.ddy] - Y coordinate of the acceleration vector.
   *
   * @param {Number} [properties.width] - Width of the game object.
   * @param {Number} [properties.height] - Height of the game object.
   *
   * @param {Number} [properties.ttl=Infinity] - How many frames the game object should be alive. Used by [Pool](api/pool).
   * @param {Number} [properties.rotation=0] - The rotation around the origin in radians.
   * @param {{x: number, y: number}} [properties.anchor={x:0,y:0}] - The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
   * @param {GameObject[]} [properties.children] - Children to add to the game object. Children added this way have their x/y position treated as relative to the parents x/y position.
   * @param {{x: number, y: number}} [properties.scale={x:1,y:1}] - The x and y scale of the game object. Calls [setScale](api/gameObject#setScale) with the passed in values.
   * @param {Number} [properties.opacity=1] - The opacity of the game object.
   *
   * @param {CanvasRenderingContext2D} [properties.context] - The context the game object should draw to. Defaults to [core.getContext()](api/core#getContext).
   *
   * @param {(dt?: number) => void} [properties.update] - Function called every frame to update the game object.
   * @param {Function} [properties.render] - Function called every frame to render the game object.
   * @param {...*} properties.props - Any additional properties you need added to the game object. For example, if you pass `gameObject({type: 'player'})` then the game object will also have a property of the same name and value. You can pass as many additional properties as you want.
   */
  class GameObject {
    /**
     * @docs docs/api_docs/gameObject.js
     */

    constructor(properties) {
      return this.init(properties);
    }

    /**
     * Use this function to reinitialize a game object. It takes the same properties object as the constructor. Useful it you want to repurpose a game object.
     * @memberof GameObject
     * @function init
     *
     * @param {Object} properties - Properties of the game object.
     */
    init(properties = {}) {

      // --------------------------------------------------
      // defaults
      // --------------------------------------------------

      /**
       * The game objects position vector. The game objects position is its position in the world, as opposed to the position in the [viewport](api/gameObject#viewX). Typically the position in the world and viewport are the same value. If the game object has been [added to a tileEngine](/api/tileEngine#addObject), the position vector represents where in the tile world the game object is while the viewport represents where to draw the game object in relation to the top-left corner of the canvas.
       * @memberof GameObject
       * @property {Vector} position
       */
      this.position = Vector$1();

      /**
       * The width of the game object. Does not take into account the
       * objects scale.
       * @memberof GameObject
       * @property {Number} width
       */

      /**
       * The height of the game object. Does not take into account the
       * objects scale.
       * @memberof GameObject
       * @property {Number} height
       */
      this.width = this.height = 0;

      /**
       * The context the game object will draw to.
       * @memberof GameObject
       * @property {CanvasRenderingContext2D} context
       */
      this.context = getContext();

      // --------------------------------------------------
      // optionals
      // --------------------------------------------------

      // @ifdef GAMEOBJECT_GROUP
      /**
       * The game objects parent object.
       * @memberof GameObject
       * @property {GameObject|null} parent
       */

      /**
       * The game objects children objects.
       * @memberof GameObject
       * @property {GameObject[]} children
       */
      this.children = [];
      // @endif

      // @ifdef GAMEOBJECT_VELOCITY
      /**
       * The game objects velocity vector.
       * @memberof GameObject
       * @property {Vector} velocity
       */
      this.velocity = Vector$1();
      // @endif

      // @ifdef GAMEOBJECT_ACCELERATION
      /**
       * The game objects acceleration vector.
       * @memberof GameObject
       * @property {Vector} acceleration
       */
      this.acceleration = Vector$1();
      // @endif

      // @ifdef GAMEOBJECT_ROTATION
      /**
       * The rotation of the game object around the origin in radians. This rotation takes into account rotations from parent objects and represents the final rotation value.
       * @memberof GameObject
       * @property {Number} rotation
       */
      this.rotation = 0;
      // @endif

      // @ifdef GAMEOBJECT_TTL
      /**
       * How may frames the game object should be alive. Primarily used by [Pool](api/pool) to know when to recycle an object.
       * @memberof GameObject
       * @property {Number} ttl
       */
      this.ttl = Infinity;
      // @endif

      // @ifdef GAMEOBJECT_ANCHOR
      /**
       * The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
       * @memberof GameObject
       * @property {{x: number, y: number}} anchor
       *
       * @example
       * // exclude-code:start
       * let { GameObject } = kontra;
       * // exclude-code:end
       * // exclude-script:start
       * import { GameObject } from 'kontra';
       * // exclude-script:end
       *
       * let gameObject = GameObject({
       *   x: 150,
       *   y: 100,
       *   width: 50,
       *   height: 50,
       *   color: 'red',
       *   // exclude-code:start
       *   context: context,
       *   // exclude-code:end
       *   render: function() {
       *     this.context.fillStyle = this.color;
       *     this.context.fillRect(0, 0, this.height, this.width);
       *   }
       * });
       *
       * function drawOrigin(gameObject) {
       *   gameObject.context.fillStyle = 'yellow';
       *   gameObject.context.beginPath();
       *   gameObject.context.arc(gameObject.x, gameObject.y, 3, 0, 2*Math.PI);
       *   gameObject.context.fill();
       * }
       *
       * gameObject.render();
       * drawOrigin(gameObject);
       *
       * gameObject.anchor = {x: 0.5, y: 0.5};
       * gameObject.x = 300;
       * gameObject.render();
       * drawOrigin(gameObject);
       *
       * gameObject.anchor = {x: 1, y: 1};
       * gameObject.x = 450;
       * gameObject.render();
       * drawOrigin(gameObject);
       */
      this.anchor = {x: 0, y: 0};
      // @endif

      // @ifdef GAMEOBJECT_CAMERA
      /**
       * The X coordinate of the camera. Used to determine [viewX](api/gameObject#viewX).
       * @memberof GameObject
       * @property {Number} sx
       */

      /**
       * The Y coordinate of the camera. Used to determine [viewY](api/gameObject#viewY).
       * @memberof GameObject
       * @property {Number} sy
       */
      this.sx = this.sy = 0;
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      /**
       * The x and y scale of the object. Typically you would not set these properties yourself but use [setScale](/api/gameObject#setScale) instead. Setting these properties directly will not result in the scale property of children being updated.
       * @memberof GameObject
       * @property {{x: number, y: number}} scale
       */
      this.scale = {x: 1, y: 1};
      // @endif

      // @ifdef GAMEOBJECT_OPACITY
      /**
       * The opacity of the object. Does not take into account opacity
       * from any parent objects.
       * @memberof GameObject
       * @property {Number} opacity
       */
      this.opacity = 1;
      // @endif

      // add all properties to the game object, overriding any defaults
      let { render, children = [], scale = this.scale, ...props } = properties;
      Object.assign(this, props);

      // @ifdef GAMEOBJECT_GROUP
      children.map(child => this.addChild(child));
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      this.setScale(scale.x, scale.y);
      // @endif

      // rf = render function
      this._rf = render || this.draw;
    }

    // define getter and setter shortcut functions to make it easier to work
    // with the position, velocity, and acceleration vectors.

    /**
     * X coordinate of the position vector.
     * @memberof GameObject
     * @property {Number} x
     */
    get x() {
      return this.position.x;
    }

    /**
     * Y coordinate of the position vector.
     * @memberof GameObject
     * @property {Number} y
     */
    get y() {
      return this.position.y;
    }

    set x(value) {
      // @ifdef GAMEOBJECT_GROUP
      let diff = value - this.position.x;
      this.children.map(child => {
        child.x += diff;
      });
      // @endif

      this.position.x = value;
    }

    set y(value) {
      // @ifdef GAMEOBJECT_GROUP
      let diff = value - this.position.y;
      this.children.map(child => {
        child.y += diff;
      });
      // @endif

      this.position.y = value;
    }

    // @ifdef GAMEOBJECT_VELOCITY
    /**
     * X coordinate of the velocity vector.
     * @memberof GameObject
     * @property {Number} dx
     */
    get dx() {
      return this.velocity.x;
    }

    /**
     * Y coordinate of the velocity vector.
     * @memberof GameObject
     * @property {Number} dy
     */
    get dy() {
      return this.velocity.y;
    }

    set dx(value) {
      this.velocity.x = value;
    }

    set dy(value) {
      this.velocity.y = value;
    }
    // @endif

    // @ifdef GAMEOBJECT_ACCELERATION
    /**
     * X coordinate of the acceleration vector.
     * @memberof GameObject
     * @property {Number} ddx
     */
    get ddx() {
      return this.acceleration.x;
    }

    /**
     * Y coordinate of the acceleration vector.
     * @memberof GameObject
     * @property {Number} ddy
     */
    get ddy() {
      return this.acceleration.y;
    }

    set ddx(value) {
      this.acceleration.x = value;
    }

    set ddy(value) {
      this.acceleration.y = value;
    }
    // @endif

    // @ifdef GAMEOBJECT_CAMERA
    /**
     * Readonly. X coordinate of where to draw the game object. Typically the same value as the [position vector](api/gameObject#position) unless the game object has been [added to a tileEngine](api/tileEngine#addObject).
     * @memberof GameObject
     * @property {Number} viewX
     * @readonly
     */
    get viewX() {
      return this.x - this.sx;
    }

    /**
     * Readonly. Y coordinate of where to draw the game object. Typically the same value as the [position vector](api/gameObject#position) unless the game object has been [added to a tileEngine](api/tileEngine#addObject).
     * @memberof GameObject
     * @property {Number} viewY
     * @readonly
     */
    get viewY() {
      return this.y - this.sy;
    }

    // readonly
    set viewX(value) {}
    set viewY(value) {}

    // @ifdef GAMEOBJECT_GROUP
    get sx() {
      return this._sx;
    }

    get sy() {
      return this._sy;
    }

    set sx(value) {
      let diff = value - this._sx;
      this.children.map(child => {
        child.sx += diff;
      });

      this._sx = value;
    }

    set sy(value) {
      let diff = value - this._sy;
      this.children.map(child => {
        child.sy += diff;
      });

      this._sy = value;
    }
    // @endif
    // @endif

    // @ifdef GAMEOBJECT_TTL
    /**
     * Check if the game object is alive. Primarily used by [Pool](api/pool) to know when to recycle an object.
     * @memberof GameObject
     * @function isAlive
     *
     * @returns {Boolean} `true` if the game objects [ttl](api/gameObject#ttl) property is above `0`, `false` otherwise.
     */
    isAlive() {
      return this.ttl > 0;
    }
    // @endif

    // @ifdef GAMEOBJECT_GROUP
    // @ifdef GAMEOBJECT_ROTATION
    get rotation() {
      // rot = rotation
      return this._rot;
    }

    set rotation(value) {
      let diff = value - this._rot;
      this.children.map(child => {
        child.rotation += diff;
      });

      this._rot = value;
    }
    // @endif

    // @ifdef GAMEOBJECT_OPACITY
    /**
     * Readonly. The final opacity of the game object taking into account
     * all parent opacities.
     */
    get finalOpacity() {
      // fop = final opacity
      return this._fop;
    }

    // readonly
    set finalOpacity(value) {}

    get opacity() {
      // op = opacity
      return this._op;
    }

    set opacity(value) {
      // final opacity value is calculated by multiplying all opacities
      // in the parent chain.
      this._fop = this.parent && this.parent._fop ? value * this.parent._fop : value;

      // trigger a final opacity calculation of all children
      this.children.map(child => {
        child.opacity = child.opacity;
      });

      this._op = value;
    }
    // @endif

    /**
     * Add an object as a child to this object. The child objects position and rotation will be calculated based on this objects position and rotation.
     *
     * By default the childs x/y position is interpreted to be relative to the x/y position of the parent. This means that if the childs position is {x: 0, y: 0}, the position will be updated to equal to the parents x/y position when added.
     *
     * If instead the position should not be updated based on the parents x/y position, set the `absolute` option to `true`.
     * @memberof GameObject
     * @function addChild
     *
     * @param {GameObject} child - Object to add as a child.
     * @param {Object} [options] - Options for adding the child.
     * @param {Boolean} [options.absolute=false] - If set the true, the x/y position of the child is treated as an absolute position in the world rather than being relative to the x/y position of the parent.
     *
     * @example
     * // exclude-code:start
     * let { GameObject } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { GameObject } from 'kontra';
     * // exclude-script:end
     *
     * function createObject(x, y, color, size = 1) {
     *   return GameObject({
     *     x,
     *     y,
     *     width: 50 / size,
     *     height: 50 / size,
     *     anchor: {x: 0.5, y: 0.5},
     *     color,
     *     // exclude-code:start
     *     context: context,
     *     // exclude-code:end
     *     render: function() {
     *       this.context.fillStyle = this.color;
     *       this.context.fillRect(0, 0, this.height, this.width);
     *     }
     *   });
     * }
     *
     * let parent = createObject(300, 100, 'red');
     * let relativeChild = createObject(25, 25, '#62a2f9', 2);
     * let absoluteChild = createObject(25, 25, 'yellow', 2);
     *
     * parent.addChild(relativeChild);
     * parent.addChild(absoluteChild, {absolute: true});
     *
     * parent.render();
     */
    addChild(child, { absolute = false } = {}) {
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
    }

    /**
     * Remove an object as a child of this object. The removed objects position and rotation will no longer be calculated based off this objects position and rotation.
     * @memberof GameObject
     * @function removeChild
     *
     * @param {GameObject} child - Object to remove as a child.
     */
    removeChild(child) {
      let index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
        child.parent = null;
      }
    }
    // @endif

    // @ifdef GAMEOBJECT_SCALE
    /**
     * Readonly. The true width of the game object after taking into
     * account the objects scale.
     */
    get scaledWidth() {
      return this.width * this.scale.x;
    }

    /**
     * Readonly. The true height of the game object after taking into
     * account the objects scale.
     */
    get scaledHeight() {
      return this.height * this.scale.y;
    }

    // readonly
    set scaledWidth(value) {}
    set scaledHeight(value) {}

    /**
     * Set the x and y scale of the object. If only one value is passed, both are set to the same value.
     * @memberof GameObject
     * @function setScale
     *
     * @param {Number} x - X scale value.
     * @param {Number} [y=x] - Y scale value.
     */
    setScale(x, y = x) {
      // @ifdef GAMEOBJECT_GROUP
      let diffX = x - this.scale.x;
      let diffY = y - this.scale.y;
      this.children.map(child => {
        if (!child.scale) return;
        child.setScale(child.scale.x + diffX, child.scale.y + diffY);
      });
      // @endif

      this.scale.x = x;
      this.scale.y = y;
    }
    // @endif

    /**
     * Update the game objects position based on its velocity and acceleration. Calls the game objects [advance()](api/gameObject#advance) function.
     * @memberof GameObject
     * @function update
     *
     * @param {Number} [dt] - Time since last update.
     */
    update(dt) {
      // @ifdef GAMEOBJECT_VELOCITY||GAMEOBJECT_ACCELERATION||GAMEOBJECT_TTL
      this.advance(dt);
      // @endif
    }

    // @ifdef GAMEOBJECT_VELOCITY||GAMEOBJECT_ACCELERATION||GAMEOBJECT_TTL
    /**
     * Move the game object by its acceleration and velocity. If the game object is an [animation game object](api/gameObject#animation-game object), it also advances the animation every frame.
     *
     * If you override the game objects [update()](api/gameObject#update) function with your own update function, you can call this function to move the game object normally.
     *
     * ```js
     * import { GameObject } from 'kontra';
     *
     * let gameObject = GameObject({
     *   x: 100,
     *   y: 200,
     *   width: 20,
     *   height: 40,
     *   dx: 5,
     *   dy: 2,
     *   update: function() {
     *     // move the game object normally
     *     this.advance();
     *
     *     // change the velocity at the edges of the canvas
     *     if (this.x < 0 ||
     *         this.x + this.width > this.context.canvas.width) {
     *       this.dx = -this.dx;
     *     }
     *     if (this.y < 0 ||
     *         this.y + this.height > this.context.canvas.height) {
     *       this.dy = -this.dy;
     *     }
     *   }
     * });
     * ```
     * @memberof GameObject
     * @function advance
     *
     * @param {Number} [dt] - Time since last update.
     *
     */
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
    // @endif

    /**
     * Render the game object. Calls the game objects [draw()](api/gameObject#draw) function.
     * @memberof GameObject
     * @function render
     */
    render() {
      this.context.save();

      let viewX = this.x;
      let viewY = this.y;

      // @ifdef GAMEOBJECT_CAMERA
      viewX = this.viewX;
      viewY = this.viewY;
      // @endif

      // it's faster to only translate if one of the values is non-zero
      // rather than always translating
      // @see https://jsperf.com/translate-or-if-statement/
      if (viewX || viewY) {
        this.context.translate(viewX, viewY);
      }

      // @ifdef GAMEOBJECT_ROTATION
      // rotate around the anchor. it's faster to only rotate when set
      // rather than always rotating
      // @see https://jsperf.com/rotate-or-if-statement/
      if (this.rotation) {
        this.context.rotate(this.rotation);
      }
      // @endif

      // @ifdef GAMEOBJECT_ANCHOR
      let width = this.width;
      let height = this.height;

      // @ifdef GAMEOBJECT_SCALE
      width = this.scaledWidth;
      height = this.scaledHeight;
      // @endif

      let x = -width * this.anchor.x;
      let y = -height * this.anchor.y;
      if (x || y) {
        this.context.translate(x, y);
      }
      // @endif

      // @ifdef GAMEOBJECT_SCALE
      // it's faster to only scale if one of the values is non-zero
      // rather than always scaling
      // @see https://jsperf.com/scale-or-if-statement/4
      let scaleX = this.scale.x;
      let scaleY = this.scale.y;
      if (scaleX || scaleY) {
        this.context.scale(scaleX, scaleY);
      }
      // @endif

      // @ifdef GAMEOBJECT_OPACITY
      // it's not really any faster to not set the global alpha
      // @see https://jsperf.com/global-alpha-or-if-statement/1
      let opacity = this.opacity;

      // @ifdef GAMEOBJECT_GROUP
      opacity = this._fop ? this._fop : opacity;
      // @endif

      this.context.globalAlpha = opacity;
      // @endif

      this._rf();
      this.context.restore();

      // @ifdef GAMEOBJECT_GROUP
      // perform all transforms on the parent before rendering the children
      this.children.map(child => child.render && child.render());
      // @endif
    }

    /**
     * Draw the game object at its X and Y position, taking into account rotation and anchor.
     *
     * If you override the game objects `render()` function with your own render function, you can call this function to draw the game object normally.
     *
     * ```js
     * let { GameObject } = kontra;
     *
     * let gameObject = GameObject({
     *  x: 290,
     *  y: 80,
     *  width: 20,
     *  height: 40,
     *
     *  render: function() {
     *    // draw the game object normally (perform rotation and other transforms)
     *    this.draw();
     *
     *    // outline the game object
     *    this.context.strokeStyle = 'yellow';
     *    this.context.lineWidth = 2;
     *    this.context.strokeRect(0, 0, this.width, this.height);
     *  }
     * });
     *
     * gameObject.render();
     * ```
     * @memberof GameObject
     * @function draw
     */
    draw() {}
  }

  var GameObject$1 = Factory(GameObject);

  /**
   * A versatile way to update and draw your sprites. It can handle simple rectangles, images, and sprite sheet animations. It can be used for your main player object as well as tiny particles in a particle engine.
   * @class Sprite
   * @extends GameObject
   *
   * @param {Object} [properties] - Properties of the sprite.
   * @param {String} [properties.color] - Fill color for the game object if no image or animation is provided.
   * @param {HTMLImageElement|HTMLCanvasElement} [properties.image] - Use an image to draw the sprite.
   * @param {Object} [properties.animations] - An object of [Animations](api/animation) from a [Spritesheet](api/spriteSheet) to animate the sprite.
   */
  class Sprite extends GameObject$1.class {
    /**
     * @docs docs/api_docs/sprite.js
     */

    init(properties = {}) {

      /**
       * The color of the game object if it was passed as an argument.
       * @memberof Sprite
       * @property {String} color
       */

      /**
       * The width of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the width of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the width of a single frame of the animation.
       * @memberof Sprite
       * @property {Number} width
       */

      /**
       * The height of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the height of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the height of a single frame of the animation.
       * @memberof Sprite
       * @property {Number} height
       */

      super.init(properties);

      // @ifdef SPRITE_IMAGE
      /**
       * The image the sprite will use when drawn if passed as an argument.
       * @memberof Sprite
       * @property {HTMLImageElement|HTMLCanvasElement} image
       */

      let { width, height, image } = properties;
      if (image) {
        this.width = (width !== undefined) ? width : image.width;
        this.height = (height !== undefined) ? height : image.height;
      }
      // @endif
    }

    // @ifdef SPRITE_ANIMATION
    /**
     * An object of [Animations](api/animation) from a [SpriteSheet](api/spriteSheet) to animate the sprite. Each animation is named so that it can can be used by name for the sprites [playAnimation()](api/sprite#playAnimation) function.
     *
     * ```js
     * import { Sprite, SpriteSheet } from 'kontra';
     *
     * let spriteSheet = SpriteSheet({
     *   // ...
     *   animations: {
     *     idle: {
     *       frames: 1,
     *       loop: false,
     *     },
     *     walk: {
     *       frames: [1,2,3]
     *     }
     *   }
     * });
     *
     * let sprite = Sprite({
     *   x: 100,
     *   y: 200,
     *   animations: spriteSheet.animations
     * });
     *
     * sprite.playAnimation('idle');
     * ```
     * @memberof Sprite
     * @property {Object} animations
     */
    get animations() {
      return this._a;
    }

    set animations(value) {
      let prop, firstAnimation;
      // a = animations
      this._a = {};

      // clone each animation so no sprite shares an animation
      for (prop in value) {
        this._a[prop] = value[prop].clone();

        // default the current animation to the first one in the list
        firstAnimation = firstAnimation || this._a[prop];
      }

      /**
       * The currently playing Animation object if `animations` was passed as an argument.
       * @memberof Sprite
       * @property {Animation} currentAnimation
       */
      this.currentAnimation = firstAnimation;
      this.width = this.width || firstAnimation.width;
      this.height = this.height || firstAnimation.height;
    }

    /**
     * Set the currently playing animation of an animation sprite.
     *
     * ```js
     * import { Sprite, SpriteSheet } from 'kontra';
     *
     * let spriteSheet = SpriteSheet({
     *   // ...
     *   animations: {
     *     idle: {
     *       frames: 1
     *     },
     *     walk: {
     *       frames: [1,2,3]
     *     }
     *   }
     * });
     *
     * let sprite = Sprite({
     *   x: 100,
     *   y: 200,
     *   animations: spriteSheet.animations
     * });
     *
     * sprite.playAnimation('idle');
     * ```
     * @memberof Sprite
     * @function playAnimation
     *
     * @param {String} name - Name of the animation to play.
     */
    playAnimation(name) {
      this.currentAnimation = this.animations[name];

      if (!this.currentAnimation.loop) {
        this.currentAnimation.reset();
      }
    }

    advance(dt) {
      super.advance(dt);

      if (this.currentAnimation) {
        this.currentAnimation.update(dt);
      }
    }
    // @endif

    draw() {
      // @ifdef SPRITE_IMAGE
      if (this.image) {
        this.context.drawImage(
          this.image,
          0, 0, this.image.width, this.image.height
        );
      }
      // @endif

      // @ifdef SPRITE_ANIMATION
      if (this.currentAnimation) {
        this.currentAnimation.render({
          x: 0,
          y: 0,
          width: this.width,
          height: this.height,
          context: this.context
        });
      }
      // @endif

      if (this.color) {
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.width, this.height);
      }
    }
  }

  var Sprite$1 = Factory(Sprite);

  let fontSizeRegex = /(\d+)(\w+)/;

  function parseFont(font) {
    let match = font.match(fontSizeRegex);

    // coerce string to number
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
    let size = +match[1];
    let unit = match[2];
    let computed = size;

    // compute font size
    // switch(unit) {
    //   // px defaults to the size

    //   // em uses the size of the canvas when declared (but won't keep in sync with
    //   // changes to the canvas font-size)
    //   case 'em': {
    //     let fontSize = window.getComputedStyle(getCanvas()).fontSize;
    //     let parsedSize = parseFont(fontSize).size;
    //     computed = size * parsedSize;
    //   }

    //   // rem uses the size of the HTML element when declared (but won't keep in
    //   // sync with changes to the HTML element font-size)
    //   case 'rem': {
    //     let fontSize = window.getComputedStyle(document.documentElement).fontSize;
    //     let parsedSize = parseFont(fontSize).size;
    //     computed = size * parsedSize;
    //   }
    // }

    return {
      size,
      unit,
      computed
    };
  }

  /**
   * An object for drawing text to the screen. Supports newline characters as well as automatic new lines when setting the `width` property.
   *
   * You can also display RTL languages by setting the attribute `dir="rtl"` on the main canvas element. Due to the limited browser support for individual text to have RTL settings, it must be set globally for the entire game.
   *
   * @example
   * // exclude-code:start
   * let { Text } = kontra;
   * // exclude-code:end
   * // exclude-script:start
   * import { Text } from 'kontra';
   * // exclude-script:end
   *
   * let text = Text({
   *   text: 'Hello World!\nI can even be multiline!',
   *   font: '32px Arial',
   *   color: 'white',
   *   x: 300,
   *   y: 100,
   *   anchor: {x: 0.5, y: 0.5},
   *   textAlign: 'center'
   * });
   * // exclude-code:start
   * text.context = context;
   * // exclude-code:end
   *
   * text.render();
   * @class Text
   * @extends GameObject
   *
   * @param {Object} properties - Properties of the text.
   * @param {String} properties.text - The text to display.
   * @param {String} [properties.font] - The [font](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) style. Defaults to the main context font.
   * @param {String} [properties.color] - Fill color for the text. Defaults to the main context fillStyle.
   * @param {Number} [properties.width] - Set a fixed width for the text. If set, the text will automatically be split into new lines that will fit the size when possible.
   * @param {String} [properties.textAlign='left'] - The [textAlign](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign) for the context. If the `dir` attribute is set to `rtl` on the main canvas, the text will automatically be aligned to the right, but you can override that by setting this property.
   * @param {Number} [properties.lineHeight=1] - The distance between two lines of text.
   */
  class Text extends GameObject$1.class {

    init(properties) {

      // --------------------------------------------------
      // defaults
      // --------------------------------------------------

      /**
       * The text alignment.
       * @memberof Text
       * @property {String} textAlign
       */
      this.textAlign = '';

      /**
       * The distance between two lines of text. The value is multiplied by the texts font size.
       * @memberof Text
       * @property {Number} lineHeight
       */
      this.lineHeight = 1;

     /**
      * The font style.
      * @memberof Text
      * @property {String} font
      */
      this.font = getContext().font;

      /**
       * The color of the text.
       * @memberof Text
       * @property {String} color
       */

      super.init(properties);

      // p = prerender
      this._p();
    }

    /**
     * The string of text. Use newline characters to create multi-line strings.
     * @memberof Text
     * @property {String} text
     */
    get text() {
      // t = text
      return this._t;
    }

    set text(value) {
      this._t = value;

      // d = dirty
      this._d = true;
    }

    get font() {
      // f = font
      return this._f;
    }

    set font(value) {
      this._f = value;

      // fs = font size
      this._fs = parseFont(value).computed;
      this._d = true;
    }

    get width() {
      // w = width
      return this._w;
    }

    set width(value) {
      this._w = value;
      this._d = true;

      // @ifdef TEXT_AUTONEWLINE
      // fw = fixed width
      this._fw = value;
      // @endif
    }

    render() {
      if (this._d) {
        this._p();
      }
      super.render();
    }

    /**
     * Calculate the font width, height, and text strings before rendering.
     */
    _p() {
      // s = strings
      this._s = [];
      this._d = false;
      this.context.font = this.font;

      // @ifdef TEXT_AUTONEWLINE
      if (!this._s.length && this._fw) {
        let parts = this._t.split(' ');
        let start = 0;
        let i = 2;

        // split the string into lines that all fit within the fixed width
        for (; i <= parts.length; i++) {
          let str = parts.slice(start, i).join(' ');
          let width = this.context.measureText(str).width;

          if (width > this._fw) {
            this._s.push(parts.slice(start, i - 1).join(' '));
            start = i - 1;
          }
        }

        this._s.push(parts.slice(start, i).join(' '));
      }
      // @endif

      // @ifdef TEXT_NEWLINE
      if (!this._s.length && this._t.includes('\n')) {
        let width = 0;
        this._t.split('\n').map(str => {
          this._s.push(str);
          width = Math.max(width, this.context.measureText(str).width);
        });

        this._w = width;
      }
      // @endif

      if (!this._s.length) {
        this._s.push(this.text);
        this._w = this.context.measureText(this._t).width;
      }

      this.height = this._s.length * this._fs;
    }

    draw() {
      let alignX = 0;
      let textAlign = this.textAlign;

      // @ifdef TEXT_RTL
      textAlign = this.textAlign || (this.context.canvas.dir === 'rtl' ? 'right' : 'left');
      // @endif

      // @ifdef TEXT_ALIGN||TEXT_RTL
      alignX = textAlign === 'right'
        ? this.width
        : textAlign === 'center'
          ? this.width / 2 | 0
          : 0;
      // @endif

      this._s.map((str, index) => {
        this.context.textBaseline = 'top';
        this.context.textAlign = textAlign;
        this.context.fillStyle = this.color;
        this.context.font = this.font;
        this.context.fillText(str, alignX, this._fs * this.lineHeight * index);
      });
    }
  }

  var Text$1 = Factory(Text);

  /**
   * Begin tracking pointer events for a set of objects. Takes a single object or an array of objects.
   *
   * ```js
   * import { initPointer, track } from 'kontra';
   *
   * initPointer();
   *
   * track(obj);
   * track([obj1, obj2]);
   * ```
   * @function track
   *
   * @param {...Object[]} objects - Objects to track.
   */
  function track(...objects) {
    objects.map(object => {

      // override the objects render function to keep track of render order
      if (!object._r) {
        object._r = object.render;

        object.render = function() {
          this._r();
        };
      }
    });
  }

  class Button extends Sprite$1.class {

    /**
     * An accessible button. Supports screen readers and keyboard navigation using the Tab key. Don't forget to call [initPointer](/api/pointer#initPointer) to have pointer events enabled for the button.
     *
     * ```js
     * import { initPointer, Button } from 'kontra';
     * initPointer();
     *
     * button = Button({
     *   x: 200,
     *   y: 200,
     *   text: 'Click me',
     *   color: 'white',
     *   font: '20px Arial',
     *   onFocus() {
     *     this.color = 'red';
     *     canvas.style.cursor = 'pointer';
     *   },
     *   onBlur() {
     *     this.color = 'white';
     *     canvas.style.cursor = 'initial';
     *   },
     *   onDown() {
     *     this.color = 'blue';
     *   },
     *   onUp() {
     *     this.color = this.focused ? 'red' : 'white';
     *     console.log('click');
     *   }
     * });
     *
     * button.render();
     * ```
     *
     * @class Button
     * @extends Text
     *
     * @param {Object} properties - Properties of the button (in addition to all Text properties).
     * @param {Function} [properties.onEnable] - Function called when the button is enabled.
     * @param {Function} [properties.onDisable] - Function called when the button is disabled.
     * @param {Function} [properties.onFocus] - Function called when the button is focused either by the pointer or keyboard.
     * @param {Function} [properties.onBlur] - Function called when the button losses focus either by the pointer or keyboard.
     * @param {Function} [properties.onUp] - Function called when the button is clicked either by the pointer or keyboard.
     */
    init(properties) {
      let { text, ...props } = properties;
      super.init(props);
      track(this);

      this.textNode = Text$1(text);
      this.addChild(this.textNode);

      // create an accessible DOM node for screen readers
      // dn = dom node
      const button = this._dn = document.createElement('button');
      button.style = srOnlyStyle;
      button.textContent = this.text;

      // allow the DOM node to control the button
      button.addEventListener('focus', () => this.focus());
      button.addEventListener('blur', () => this.blur());
      button.addEventListener('click', () => this.onUp());

      document.body.appendChild(button);
    }

    get text() {
      return this.textNode.text;
    }

    set text(value) {
      this.textNode.text = value;
    }

    /**
     * Clean up the button.
     * @memberof Button
     * @function destroy
     */
    destroy() {
      this._dn.remove();
    }

    render() {
      // update DOM node text if it has changed
      if (this.textNode._d && this.text !== this._dn.textContent) {
        this._dn.textContent = this.text;
      }

      super.render();
    }

    /**
     * Enable the button. Calls [onEnable](/api/button#onEnable) if passed.
     * @memberof Button
     * @function enable
     */
    enable() {

      /**
       * If the button is disabled.
       * @memberof Button
       * @property {Boolean} disabled
       */
      this.disabled = this._dn.disabled = false;
      this.onEnable();
    }

    /**
     * Disable the button. Calls [onDisable](/api/button#onDisable) if passed.
     * @memberof Button
     * @function disable
     */
    disable() {
      this.disabled = this._dn.disabled = true;
      this.onDisable();
    }

    /**
     * Focus the button. Calls [onFocus](/api/button#onFOcus) if passed.
     * @memberof Button
     * @function focus
     */
    focus() {

      /**
       * If the button is focused.
       * @memberof Button
       * @property {Boolean} focused
       */
      this.focused = true;
      // prevent infinite loop
      if (document.activeElement != this._dn) this._dn.focus();

      this.onFocus();
    }

    /**
     * Blur the button. Calls [onBlur](/api/button#onBlur) if passed.
     * @memberof Button
     * @function blur
     */
    blur() {
      this.focused = false;
      // prevent infinite loop
      if (document.activeElement == this._dn) this._dn.blur();

      this.onBlur();
    }

    onOver() {

      /**
       * If the button is hovered.
       * @memberof Button
       * @property {Boolean} hovered
       */
      this.hovered = true;
      this.focus();
    }

    onOut() {
      this.hovered = false;
      this.blur();
    }

    /**
     * Function called when then button is enabled. Override this function to have the button do something when enabled.
     * @memberof Button
     * @function onEnable
     */
    onEnable() {}

    /**
     * Function called when then button is disabled. Override this function to have the button do something when disabled.
     * @memberof Button
     * @function onDisable
     */
    onDisable() {}

    /**
     * Function called when then button is focused. Override this function to have the button do something when focused.
     * @memberof Button
     * @function onFocus
     */
    onFocus() {}

    /**
     * Function called when then button is blurred. Override this function to have the button do something when blurred.
     * @memberof Button
     * @function onBlur
     */
    onBlur() {}

    onUp() {}
  }

  var Button$1 = Factory(Button);

  let alignment = {
    start(rtl) {
      return rtl ? 1 : 0;
    },
    center() {
      return 0.5;
    },
    end(rtl) {
      return rtl ? 0 : 1;
    }
  };

  let handler = {
    set(obj, prop, value) {

      // don't set dirty flag for private properties
      if (prop[0] != '_' && obj[prop] !== value) {
        obj._d = true;
      }

      obj[prop] = value;
      return true;
    }
  };

  class GridManager extends GameObject$1.class {
    init(properties = {}) {

      /**
       *
       */
      this.flow = 'column';

      /**
       *
       */

      /**
       *
       */
      this.align = this.justify = 'start';

      /**
       *
       */

       /**
        *
        */
      this.gapX = this.gapY = 0;

      /**
       *
       */
      this.numCols = 1;

      /**
       *
       */
      this.breakpoints = [];

      /**
       * this.dir
       */

      super.init(properties);

      // use a proxy so setting any property on the UI Manager will set the dirty
      // flag
      return new Proxy(this, handler);
    }

    // keep width and height getters/settings so we can set _w and _h and not
    // trigger infinite call loops
    get width() {
      // w = width
      return this._w;
    }

    set width(value) {
      this._w = value;
      this._d = true;
    }

    get height() {
      // h = height
      return this._h;
    }

    set height(value) {
      this._h = value;
      this._d = true;
    }

    addChild(child) {
      this._d = true;
      super.addChild(child);
    }

    removeChild(child) {
      this._d = true;
      super.removeChild(child);
    }

    setScale(x, y) {
      super.setScale(x, y);
      this._d = true;
    }

    render() {
      if (this._d) {
        this._p();
        this._cp();
      }
      super.render();
    }

    /**
     * Build the grid and calculate its width and height
     */
    _p() {
      this._d = false;

      // b = breakpoint
      this.breakpoints.map(breakpoint => {
        if (breakpoint.metric.call(this) && this._b !== breakpoint) {
          this._b = breakpoint;
          breakpoint.callback.call(this);
        }
      });

      // g = grid, cw = colWidths, rh = rowHeights
      let grid = this._g = [];
      let colWidths = this._cw = [];
      let rowHeights = this._rh = [];

      // let widths = [];
      // let heights = [];

      let children = this.children;

      // nc = numCols
      let numCols = this._nc = this.flow === 'column'
        ? 1
        : this.flow === 'row'
          ? children.length
          : this.numCols;

      let row = 0;
      let col = 0;
      for (let i = 0, child; child = children[i]; i++) {
        grid[row] = grid[row] || [];
        grid[row][col] = child;

        // prerender child to get current width/height
        if (child._p) {
          child._p();
        }

        // let { width, height } = getRect(child);
        rowHeights[row] = Math.max(rowHeights[row] || 0, child.height);
        // heights[row] = Math.max(heights[row] || 0, child.height);

        let colSpan = child.colSpan || 1;
        if (colSpan > 1 && col + colSpan <= numCols) {
          while(++col < colSpan) {

            grid[row][col] = child;
          }
        }
        // colSpan elements do not contribute to the colWidth
        else {
          colWidths[col] = Math.max(colWidths[col] || 0, child.width);
          // widths[col] = Math.max(widths[col] || 0, child.width);
        }

        if (++col >= numCols) {
          col = 0;
          row++;
        }
      }

      // fill remaining row
      while (col > 0 && col < numCols) {
        // add empty array item so we can reverse a row even when it
        // contains less items than another row
        grid[row][col++] = false;
      }
      let numRows = grid.length;

      // let gapX = this.gapX * this.scale.x;
      // let gapY = this.gapY * this.scale.y;

      this._w = colWidths.reduce((acc, width) => acc += width, 0) + this.gapX * (numCols - 1);
      this._h = rowHeights.reduce((acc, height) => acc += height, 0) + this.gapY * (numRows - 1);

      // this._w = widths.reduce((acc, width) => acc += width, 0) + this.gapX * (numCols - 1);
      // this._h = heights.reduce((acc, height) => acc += height, 0) + this.gapY * (numRows - 1);

      // reverse columns. direction property overrides canvas dir
      let dir = getCanvas().dir;
      let rtl =  this.dir === 'rtl';
      this._rtl = rtl;
      if (rtl) {
        this._g = grid.map(row => row.reverse());
        this._cw = colWidths.reverse();
      }
    }

    /**
     * Calculate the position of each child
     */
    _cp() {
      let topLeftY = 0;
      let rendered = [];

      let colWidths = this._cw;
      let rowHeights = this._rh;
      let gapX = this.gapX;
      let gapY = this.gapY;

      if (this.scale) {
        colWidths = colWidths.map(width => width * this.scale.x);
        rowHeights = rowHeights.map(height => height * this.scale.y);
        gapX *= this.scale.x;
        gapY *= this.scale.y;
      }

      this._g.map((gridRow, row) => {
        let topLeftX = 0;
        // let x = rtl && !this.parent
        //   ? canvas.width - (this.x + this._w * (1 - this.anchor.x * 2))
        //   : this.x;

        gridRow.map((child, col) => {
          // don't render the same child multiple times if it uses colSpan
          if (child && !rendered.includes(child)) {
            rendered.push(child);

            let justify = alignment[child.justifySelf || this.justify](this._rtl);
            let align = alignment[child.alignSelf || this.align]();

            let rowHeight = this._rh[row];

            let colSpan = child.colSpan || 1;
            let colWidth = colWidths[col];
            if (colSpan > 1 && col + colSpan <= this._nc) {
              for (let i = 1; i < colSpan; i++) {
                colWidth += colWidths[col + i] + gapX;
              }
            }

            let { x, y } = getRect(this);

            let pointX = x + colWidth * justify;
            let pointY = y + rowHeights[row] * align;

            let ptX;
            let ptY;
            let { width, height } = getRect(child);

            if (justify === 0) {
              ptX = pointX + width * child.anchor.x;
            }
            else if (justify === 0.5) {
              let sign = child.anchor.x < 0.5 ? -1 : child.anchor.x === 0.5 ? 0 : 1;
              ptX = pointX + sign * width * child.anchor.x;
            }
            else {
              ptX = pointX - (width * (1 - child.anchor.x));
            }

            if (align === 0) {
              ptY = pointY + height * child.anchor.y;
            }
            else if (align === 0.5) {
              let sign = child.anchor.y < 0.5 ? -1 : child.anchor.y === 0.5 ? 0 : 1;
              ptY = pointY + sign * height * child.anchor.y;
            }
            else {
              ptY = pointY - (height * (1 - child.anchor.y));
            }

            child.x = topLeftX + ptX;
            child.y = topLeftY + ptY;
          }

          topLeftX += colWidths[col] + gapX;
        });

        topLeftY += rowHeights[row] + gapY;
      });
    }
  }

  var GridManager$1 = Factory(GridManager);

  /**
   * A fast and memory efficient [object pool](https://gameprogrammingpatterns.com/object-pool.html) for sprite reuse. Perfect for particle systems or SHUMPs. The pool starts out with just one object, but will grow in size to accommodate as many objects as are needed.
   *
   * <canvas width="600" height="200" id="pool-example"></canvas>
   * <script src="assets/js/pool.js"></script>
   * @class Pool
   *
   * @param {Object} properties - Properties of the pool.
   * @param {() => {update: (dt?: number) => void, render: Function, init: (properties?: object) => void, isAlive: () => boolean}} properties.create - Function that returns a new object to be added to the pool when there are no more alive objects.
   * @param {Number} [properties.maxSize=1024] - The maximum number of objects allowed in the pool. The pool will never grow beyond this size.
   */
  class Pool {
    /**
     * @docs docs/api_docs/pool.js
     */

    constructor({create, maxSize = 1024} = {}) {

      // check for the correct structure of the objects added to pools so we know that the
      // rest of the pool code will work without errors
      // @ifdef DEBUG
      let obj;
      if (!create ||
          ( !( obj = create() ) ||
            !( obj.update && obj.init &&
               obj.isAlive && obj.render)
         )) {
        throw Error('Must provide create() function which returns an object with init(), update(), render(), and isAlive() functions');
      }
      // @endif

      // c = create
      this._c = create;

      /**
       * All objects currently in the pool, both alive and not alive.
       * @memberof Pool
       * @property {Object[]} objects
       */
      this.objects = [create()]; // start the pool with an object

      /**
       * The number of alive objects.
       * @memberof Pool
       * @property {Number} size
       */
      this.size = 0;

      /**
       * The maximum number of objects allowed in the pool. The pool will never grow beyond this size.
       * @memberof Pool
       * @property {Number} maxSize
       */
      this.maxSize = maxSize;
    }

    /**
     * Get and return an object from the pool. The properties parameter will be passed directly to the objects `init()` function. If you're using a [Sprite](api/sprite), you should also pass the `ttl` property to designate how many frames you want the object to be alive for.
     *
     * If you want to control when the sprite is ready for reuse, pass `Infinity` for `ttl`. You'll need to set the sprites `ttl` to `0` when you're ready for the sprite to be reused.
     *
     * ```js
     * // exclude-tablist
     * let sprite = pool.get({
     *   // the object will get these properties and values
     *   x: 100,
     *   y: 200,
     *   width: 20,
     *   height: 40,
     *   color: 'red',
     *
     *   // pass Infinity for ttl to prevent the object from being reused
     *   // until you set it back to 0
     *   ttl: Infinity
     * });
     * ```
     * @memberof Pool
     * @function get
     *
     * @param {Object} [properties] - Properties to pass to the objects `init()` function.
     *
     * @returns {Object} The newly initialized object.
     */
    get(properties = {}) {
      // the pool is out of objects if the first object is in use and it can't grow
      if (this.size === this.objects.length) {
        if (this.size === this.maxSize) {
          return;
        }
        // double the size of the array by adding twice as many new objects to the end
        else {
          for (let i = 0; i < this.size && this.objects.length < this.maxSize; i++) {
            this.objects.push(this._c());
          }
        }
      }

      // save off first object in pool to reassign to last object after unshift
      let obj = this.objects[this.size];
      this.size++;
      obj.init(properties);
      return obj;
    }

    /**
     * Returns an array of all alive objects. Useful if you need to do special processing on all alive objects outside of the pool, such as to add all alive objects to a [Quadtree](api/quadtree).
     * @memberof Pool
     * @function getAliveObjects
     *
     * @returns {Object[]} An Array of all alive objects.
     */
    getAliveObjects() {
      return this.objects.slice(0, this.size);
    }

    /**
     * Clear the object pool. Removes all objects from the pool and resets its [size](api/pool#size) to 1.
     * @memberof Pool
     * @function clear
     */
    clear() {
      this.size = this.objects.length = 0;
      this.objects.push(this._c());
    }

    /**
     * Update all alive objects in the pool by calling the objects `update()` function. This function also manages when each object should be recycled, so it is recommended that you do not call the objects `update()` function outside of this function.
     * @memberof Pool
     * @function update
     *
     * @param {Number} [dt] - Time since last update.
     */
    update(dt) {
      let obj;
      let doSort = false;
      for (let i = this.size; i--; ) {
        obj = this.objects[i];

        obj.update(dt);

        if (!obj.isAlive()) {
          doSort = true;
          this.size--;
        }
      }
      // sort all dead elements to the end of the pool
      if (doSort) {
        this.objects.sort((a, b) => b.isAlive() - a.isAlive());
      }
    }

    /**
     * Render all alive objects in the pool by calling the objects `render()` function.
     * @memberof Pool
     * @function render
     */
    render() {
      for (let i = this.size; i--; ) {
        this.objects[i].render();
      }
    }
  }

  var Pool$1 = Factory(Pool);

  /**
   * Determine which subnodes the object intersects with
   *
   * @param {Object} object - Object to check.
   * @param {Object} bounds - Bounds of the quadtree.
   *
   * @returns {Number[]} List of all subnodes object intersects.
   */
  function getIndices(object, bounds) {
    let indices = [];

    let verticalMidpoint = bounds.x + bounds.width / 2;
    let horizontalMidpoint = bounds.y + bounds.height / 2;

    let { x, y, width, height } = getRect(object);

    // save off quadrant checks for reuse
    let intersectsTopQuadrants = object.y < horizontalMidpoint;
    let intersectsBottomQuadrants = object.y + object.height >= horizontalMidpoint;

    // object intersects with the left quadrants
    if (object.x < verticalMidpoint) {
      if (intersectsTopQuadrants) {  // top left
        indices.push(0);
      }

      if (intersectsBottomQuadrants) {  // bottom left
        indices.push(2);
      }
    }

    // object intersects with the right quadrants
    if (object.x + object.width >= verticalMidpoint) {
      if (intersectsTopQuadrants) {  // top right
        indices.push(1);
      }

      if (intersectsBottomQuadrants) {  // bottom right
        indices.push(3);
      }
    }

    return indices;
  }

  /*
  The quadtree acts like an object pool in that it will create subnodes as objects are needed but it won't clean up the subnodes when it collapses to avoid garbage collection.

  The quadrant indices are numbered as follows (following a z-order curve):
       |
    0  |  1
   ----+----
    2  |  3
       |
  */


  /**
   * A 2D [spatial partitioning](https://gameprogrammingpatterns.com/spatial-partition.html) data structure. Use it to quickly group objects by their position for faster access and collision checking.
   *
   * <canvas width="600" height="200" id="quadtree-example"></canvas>
   * <script src="assets/js/quadtree.js"></script>
   * @class Quadtree
   *
   * @param {Object} [properties] - Properties of the quadtree.
   * @param {Number} [properties.maxDepth=3] - Maximum node depth of the quadtree.
   * @param {Number} [properties.maxObjects=25] - Maximum number of objects a node can have before splitting.
   * @param {{x: Number, y: Number, width: Number, height: Number}} [properties.bounds] - The 2D space (x, y, width, height) the quadtree occupies. Defaults to the entire canvas width and height.
   */
  class Quadtree {
    /**
     * @docs docs/api_docs/quadtree.js
     */

    constructor({maxDepth = 3, maxObjects = 25, bounds} = {}) {

      /**
       * Maximum node depth of the quadtree.
       * @memberof Quadtree
       * @property {Number} maxDepth
       */
      this.maxDepth = maxDepth;

      /**
       * Maximum number of objects a node can have before splitting.
       * @memberof Quadtree
       * @property {Number} maxObjects
       */
      this.maxObjects = maxObjects;

      /**
       * The 2D space (x, y, width, height) the quadtree occupies.
       * @memberof Quadtree
       * @property {{x: Number, y: Number, width: Number, height: Number}} bounds
       */
      let canvas = getCanvas();
      this.bounds = bounds || {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height
      };

      // since we won't clean up any subnodes, we need to keep track of which nodes are
      // currently the leaf node so we know which nodes to add objects to
      // b = branch, d = depth, o = objects, s = subnodes, p = parent
      this._b = false;
      this._d = 0;
      this._o = [];
      this._s = [];
      this._p = null;
    }

    /**
     * Removes all objects from the quadtree. You should clear the quadtree every frame before adding all objects back into it.
     * @memberof Quadtree
     * @function clear
     */
    clear() {
      this._s.map(function(subnode) {
        subnode.clear();
      });

      this._b = false;
      this._o.length = 0;
    }

    /**
     * Get an array of all objects that belong to the same node as the passed in object.
     *
     * **Note:** if the passed in object is also part of the quadtree, it will not be returned in the results.
     *
     * ```js
     * import { Sprite, Quadtree } from 'kontra';
     *
     * let quadtree = Quadtree();
     * let player = Sprite({
     *   // ...
     * });
     * let enemy1 = Sprite({
     *   // ...
     * });
     * let enemy2 = Sprite({
     *   // ...
     * });
     *
     * quadtree.add(player, enemy1, enemy2);
     * quadtree.get(player);  //=> [enemy1]
     * ```
     * @memberof Quadtree
     * @function get
     *
     * @param {{x: Number, y: Number, width: Number, height: Number}} object - Object to use for finding other objects. The object must have the properties `x`, `y`, `width`, and `height` so that its position in the quadtree can be calculated.
     *
     * @returns {Object[]} A list of objects in the same node as the object, not including the object itself.
     */
    get(object) {
      // since an object can belong to multiple nodes we should not add it multiple times
      let objects = new Set();

      // traverse the tree until we get to a leaf node
      while (this._s.length && this._b) {
        getIndices(object, this.bounds).map(index => {
          this._s[index].get(object).map(obj => objects.add(obj));
        });

        return Array.from(objects);
      }

      // don't add the object to the return list
      return this._o.filter(obj => obj !== object);
    }

    /**
     * Add objects to the quadtree and group them by their position. Can take a single object, a list of objects, and an array of objects.
     *
     * ```js
     * import { Quadtree, Sprite, Pool, GameLoop } from 'kontra';
     *
     * let quadtree = Quadtree();
     * let bulletPool = Pool({
     *   create: Sprite
     * });
     *
     * let player = Sprite({
     *   // ...
     * });
     * let enemy = Sprite({
     *   // ...
     * });
     *
     * // create some bullets
     * for (let i = 0; i < 100; i++) {
     *   bulletPool.get({
     *     // ...
     *   });
     * }
     *
     * let loop = GameLoop({
     *   update: function() {
     *     quadtree.clear();
     *     quadtree.add(player, enemy, bulletPool.getAliveObjects());
     *   }
     * });
     * ```
     * @memberof Quadtree
     * @function add
     *
     * @param {...Object[]} objects - Objects to add to the quadtree.
     */
    add(...objects) {
      objects.map(object => {
        // add a group of objects separately
        if (Array.isArray(object)) {
          this.add.apply(this, object);
          return;
        }

        // current node has subnodes, so we need to add this object into a subnode
        if (this._b) {
          this._a(object);
          return;
        }

        // this node is a leaf node so add the object to it
        this._o.push(object);

        // split the node if there are too many objects
        if (this._o.length > this.maxObjects && this._d < this.maxDepth) {
          this._sp();

          // move all objects to their corresponding subnodes
          this._o.map(obj => this._a(obj));
          this._o.length = 0;
        }
      });
    }

    /**
     * Add an object to a subnode.
     *
     * @param {Object} object - Object to add into a subnode
     */
    _a(object) {
      // add the object to all subnodes it intersects
      getIndices(object, this.bounds).map(index => {
        this._s[index].add(object);
      });
    }

    /**
     * Split the node into four subnodes.
     */
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
    _sp(subWidth, subHeight, i) {
      this._b = true;

      // only split if we haven't split before
      if (this._s.length) {
        return;
      }

      subWidth = this.bounds.width / 2 | 0;
      subHeight = this.bounds.height / 2 | 0;

      for (i = 0; i < 4; i++) {
        this._s[i] = new Quadtree({
          bounds: {
            x: this.bounds.x + (i % 2 === 1 ? subWidth : 0),  // nodes 1 and 3
            y: this.bounds.y + (i >= 2 ? subHeight : 0),      // nodes 2 and 3
            width: subWidth,
            height: subHeight
          },
          maxDepth: this.maxDepth,
          maxObjects: this.maxObjects,
        });

        // d = depth, p = parent
        this._s[i]._d = this._d+1;
        /* @ifdef VISUAL_DEBUG */
        this._s[i]._p = this;
        /* @endif */
      }
    }

    /**
     * Draw the quadtree. Useful for visual debugging.
     */
     /* @ifdef VISUAL_DEBUG **
     render() {
       // don't draw empty leaf nodes, always draw branch nodes and the first node
       if (this._o.length || this._d === 0 ||
           (this._p && this._p._b)) {

         context.strokeStyle = 'red';
         context.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

         if (this._s.length) {
           for (let i = 0; i < 4; i++) {
             this._s[i].render();
           }
         }
       }
     }
     /* @endif */
  }

  var Quadtree$1 = Factory(Quadtree);

  /**
   * A scene object for organizing a group of objects that will update and render together.
   *
   * ```js
   * import { Scene, Sprite } from 'kontra';
   *
   * sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   color: 'red'
   * });
   *
   * scene = Scene({
   *   id: 'game',
   *   children: [sprite]
   * });
   *
   * scene.render();
   * ```
   *
   * @class Scene
   * @extends GameObject
   *
   * @param {Object} properties - Properties of the scene.
   * @param {String} properties.id - The id of the scene.
   * @param {String} [properties.name=properties.id] - The name of the scene. Used by screen readers to identify each scene. Use this property to give the scene a human friendly name. Defaults to the id.
   */
  class Scene extends GameObject$1.class {

    init(properties) {
      /**
       * The id of the scene.
       * @memberof Scene
       * @property {String} id
       */

      /**
       * The name of the scene. Used by screen readers to identify each scene. Use this property to give the scene a human friendly name.
       * @memberof Scene
       * @property {String} name
       */
      this.name = properties.id;

      // create an accessible DOM node for screen readers
      // dn = dom node
      const section = this._dn = document.createElement('section');
      section.tabIndex = -1;
      section.style = srOnlyStyle;

      document.body.appendChild(section);

      // create the node before adding children so they can be added
      // to it
      super.init(properties);

      section.id = this.id;
      section.setAttribute('aria-label', this.name);
    }

    /**
     * Show the scene and resume update and render. Calls [onShow](/api/scene#onShow) if passed.
     * @memberof Scene
     * @function show
     */
    show() {

      /**
       * If the scene is hidden.
       * @memberof Scene
       * @property {Boolean} hidden
       */
      this.hidden = this._dn.hidden = false;

      // find first focusable child
      let focusableChild = this.children.find(child => child.focus);
      if (focusableChild) {
        focusableChild.focus();
      }
      else {
        this._dn.focus();
      }

      this.onShow();
    }

    /**
     * Hide the scene. A hidden scene will not update or render. Calls [onHide](/api/scene#onHide) if passed.
     * @memberof Scene
     * @function hide
     */
    hide() {
      this.hidden = this._dn.hidden = true;
      this.onHide();
    }

    addChild(object, options) {
      super.addChild(object, options);
      if (object._dn) {
        this._dn.appendChild(object._dn);
      }
    }

    removeChild(object) {
      super.removeChild(object);
      if (object._dn) {
        document.body.appendChild(object._dn);
      }
    }

    /**
     * Clean up the scene and call `destroy()` on all children.
     * @memberof Scene
     * @function destroy
     */
    destroy() {
      this._dn.remove();
      this.children.map(child => child.destroy && child.destroy());
    }

    /**
     * Update the scene and call `update()` on all children. A hidden scene will not update.
     * @memberof Scene
     * @function update
     *
     * @param {Number} [dt] - Time since last update.
     */
    update(dt) {
      if (!this.hidden) {
        super.update(dt);
      }
    }

    /**
     * Render the scene and call `render()` on all children. A hidden scene will not render nor will any children outside of the current game viewport.
     * @memberof Scene
     * @function render
     */
    render() {
      if (!this.hidden) {
        super.render();
      }
    }

    /**
     * Function called when the scene is shown. Override this function to have the scene do something when shown.
     * @memberof Scene
     * @function onShow
     */
    onShow() {}

    /**
     * Function called when the scene is hidden. Override this function to have the scene do something when hidden.
     * @memberof Scene
     * @function onHide
     */
    onHide() {}
  }

  var Scene$1 = Factory(Scene);

  /**
   * Parse a string of consecutive frames.
   *
   * @param {Number|String} frames - Start and end frame.
   *
   * @returns {Number|Number[]} List of frames.
   */
  function parseFrames(consecutiveFrames) {
    // return a single number frame
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
    if (+consecutiveFrames === consecutiveFrames) {
      return consecutiveFrames;
    }

    let sequence = [];
    let frames = consecutiveFrames.split('..');

    // coerce string to number
    // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#coercion-to-test-for-types
    let start = +frames[0];
    let end = +frames[1];
    let i = start;

    // ascending frame order
    if (start < end) {
      for (; i <= end; i++) {
        sequence.push(i);
      }
    }
    // descending order
    else {
      for (; i >= end; i--) {
        sequence.push(i);
      }
    }

    return sequence;
  }

  /**
   * A sprite sheet to animate a sequence of images. Used to create [animation sprites](api/sprite#animation-sprite).
   *
   * <figure>
   *   <a href="assets/imgs/character_walk_sheet.png">
   *     <img src="assets/imgs/character_walk_sheet.png" width="266" height="512" alt="11 frames of a walking pill-like alien wearing a space helmet.">
   *   </a>
   *   <figcaption>Sprite sheet image courtesy of <a href="https://kenney.nl/assets">Kenney</a>.</figcaption>
   * </figure>
   *
   * Typically you create a sprite sheet just to create animations and then use the animations for your sprite.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let image = new Image();
   * image.src = 'assets/imgs/character_walk_sheet.png';
   * image.onload = function() {
   *   let spriteSheet = SpriteSheet({
   *     image: image,
   *     frameWidth: 72,
   *     frameHeight: 97,
   *     animations: {
   *       // create a named animation: walk
   *       walk: {
   *         frames: '0..9',  // frames 0 through 9
   *         frameRate: 30
   *       }
   *     }
   *   });
   *
   *   let sprite = Sprite({
   *     x: 200,
   *     y: 100,
   *
   *     // use the sprite sheet animations for the sprite
   *     animations: spriteSheet.animations
   *   });
   * };
   * ```
   * @class SpriteSheet
   *
   * @param {Object} properties - Properties of the sprite sheet.
   * @param {HTMLImageElement|HTMLCanvasElement} properties.image - The sprite sheet image.
   * @param {Number} properties.frameWidth - The width of a single frame.
   * @param {Number} properties.frameHeight - The height of a single frame.
   * @param {Number} [properties.frameMargin=0] - The amount of whitespace between each frame.
   * @param {Object} [properties.animations] - Animations to create from the sprite sheet using [Animation](api/animation). Passed directly into the sprite sheets [createAnimations()](api/spriteSheet#createAnimations) function.
   */
  class SpriteSheet {
    constructor({image, frameWidth, frameHeight, frameMargin, animations} = {}) {
      // @ifdef DEBUG
      if (!image) {
        throw Error('You must provide an Image for the SpriteSheet');
      }
      // @endif

      /**
       * An object of named [Animation](api/animation) objects. Typically you pass this object into [Sprite](api/sprite) to create an [animation sprites](api/spriteSheet#animation-sprite).
       * @memberof SpriteSheet
       * @property {Object} animations
       */
      this.animations = {};

      /**
       * The sprite sheet image.
       * @memberof SpriteSheet
       * @property {HTMLImageElement|HTMLCanvasElement} image
       */
      this.image = image;

      /**
       * An object that defines properties of a single frame in the sprite sheet. It has properties of `width`, `height`, and `margin`.
       *
       * `width` and `height` are the width of a single frame, while `margin` defines the amount of whitespace between each frame.
       * @memberof SpriteSheet
       * @property {Object} frame
       */
      this.frame = {
        width: frameWidth,
        height: frameHeight,
        margin: frameMargin
      };

      // f = framesPerRow
      this._f = image.width / frameWidth | 0;

      this.createAnimations(animations);
    }

    /**
     * Create named animations from the sprite sheet. Called from the constructor if the `animations` argument is passed.
     *
     * This function populates the sprite sheets `animations` property with [Animation](api/animation) objects. Each animation is accessible by its name.
     *
     * ```js
     * import { Sprite, SpriteSheet } from 'kontra';
     *
     * let image = new Image();
     * image.src = 'assets/imgs/character_walk_sheet.png';
     * image.onload = function() {
     *
     *   let spriteSheet = SpriteSheet({
     *     image: image,
     *     frameWidth: 72,
     *     frameHeight: 97,
     *
     *     // this will also call createAnimations()
     *     animations: {
     *       // create 1 animation: idle
     *       idle: {
     *         // a single frame
     *         frames: 1
     *       }
     *     }
     *   });
     *
     *   spriteSheet.createAnimations({
     *     // create 4 animations: jump, walk, moonWalk, attack
     *     jump: {
     *       // sequence of frames (can be non-consecutive)
     *       frames: [1, 10, 1],
     *       frameRate: 10,
     *       loop: false,
     *     },
     *     walk: {
     *       // ascending consecutive frame animation (frames 2-6, inclusive)
     *       frames: '2..6',
     *       frameRate: 20
     *     },
     *     moonWalk: {
     *       // descending consecutive frame animation (frames 6-2, inclusive)
     *       frames: '6..2',
     *       frameRate: 20
     *     },
     *     attack: {
     *       // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
     *       frames: ['8..10', 13, '10..8'],
     *       frameRate: 10,
     *       loop: false,
     *     }
     *   });
     * };
     * ```
     * @memberof SpriteSheet
     * @function createAnimations
     *
     * @param {Object} animations - Object of named animations to create from the sprite sheet.
     * @param {Number|String|Number[]|String[]} animations.<name>.frames - The sequence of frames to use from the sprite sheet. It can either be a single frame (`1`), a sequence of frames (`[1,2,3,4]`), or a consecutive frame notation (`'1..4'`). Sprite sheet frames are `0` indexed.
     * @param {Number} animations.<name>.frameRate - The number frames to display per second.
     * @param {Boolean} [animations.<name>.loop=true] - If the animation should loop back to the beginning once completed.
     */
    createAnimations(animations) {
      let sequence, name;

      for (name in animations) {
        let { frames, frameRate, loop } = animations[name];

        // array that holds the order of the animation
        sequence = [];

        // @ifdef DEBUG
        if (frames === undefined) {
          throw Error('Animation ' + name + ' must provide a frames property');
        }
        // @endif

        // add new frames to the end of the array
        [].concat(frames).map(frame => {
          sequence = sequence.concat(parseFrames(frame));
        });

        this.animations[name] = Animation$1({
          spriteSheet: this,
          frames: sequence,
          frameRate,
          loop
        });
      }
    }
  }

  var SpriteSheet$1 = Factory(SpriteSheet);

  var accelerationMod = {
    i() {
      this.acceleration = Vector$1();
    },

    get ddx() {
      return this.acceleration.x;
    },

    get ddy() {
      return this.acceleration.y;
    },

    set ddx(value) {
      this.acceleration.x = value;
    },

    set ddy(value) {
      this.acceleration.y = value;
    }
  };

  var anchorMod = {
    i() {
      this.anchor = {x: 0, y: 0};
    }
  };

  var cameraMod = {
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

  var opacityMod = {
    i() {
      this.opacity = 1;
    },

    get finalOpacity() {
      return this.opacity;
    },

    set finalOpacity(value) {}
  };

  var rectMod = {
    i() {
      this.position = Vector$1();
      this.width = this.height = 0;
    },

    get x() {
      return this.position.x;
    },

    get y() {
      return this.position.y;
    },

    set x(value) {
      this.position.x = value;
    },

    set y(value) {
      this.position.y = value;
    }
  };

  var renderMod = {
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
        context.translate(viewX, viewY);
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

  var rotationMod = {
    i() {
      this.rotation = 0;
    }
  };

  var scaleMod = {
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

  var ttlMod = {
    i() {
      this.ttl = 0;
    },

    isAlive() {
      return this.ttl > 0;
    }
  };

  var velocityMod = {
    i() {
      this.velocity = Vector$1();
    },

    get dx() {
      return this.velocity.x;
    },

    get dy() {
      return this.velocity.y;
    },

    set dx(value) {
      this.velocity.x = value;
    },

    set dy(value) {
      this.velocity.y = value;
    }
  };

  class GameObject$2 {
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
        group,
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

  Factory(GameObject$2);

}());
