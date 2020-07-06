// import { getContext } from './core.js'
// import Vector from './vector.js'

// let modularSprite = {
//   rect: {
//     i: 0,
//     init() {
//       this.position = Vector();
//       this.width = this.height = 0;
//     },

//     get x() {
//       return this.position.x;
//     },

//     get y() {
//       return this.position.y;
//     },

//     set x(value) {
//       this.position.x = value;
//     },

//     set y(value) {
//       this.position.y = value;
//     }
//   },

//   velocity: {
//     i: 0,
//     init() {
//       this.velocity =Vector()
//     },

//     get dx() {
//       return this.velocity.x;
//     },

//     get dy() {
//       return this.velocity.y;
//     },

//     set dx(value) {
//       this.velocity.x = value;
//     },

//     set dy(value) {
//       this.velocity.y = value;
//     }
//   },

//   acceleration: {
//     i: 0,
//     init() {
//       this.acceleration = Vector();
//     },

//     get ddx() {
//       return this.acceleration.x;
//     },

//     get ddy() {
//       return this.acceleration.y;
//     },

//     set ddx(value) {
//       this.acceleration.x = value;
//     },

//     set ddy(value) {
//       this.acceleration.y = value;
//     }
//   },

//   renderable: {
//     i: 0,
//     init() {
//       this.context = getContext();
//     },

//     render() {
//       let context = this.context;
//       context.save();

//       // // want to be able to use ?? and optional chaining but
//       // // they are not supported in terser yet
//       // // @see https://github.com/terser/terser/issues/567
//       // let viewX = this.viewX ?? this.x;
//       // let viewY = this.viewY ?? this.y;

//       // if (viewX || viewY) {
//       //   context.translate(viewX, viewY)
//       // }

//       // if (this.rotation) {
//       //   context.rotate(this.rotation);
//       // }

//       // let scaleX = this.scale?.x;
//       // let scaleY = this.scale?.y;

//       // if (scaleX != 1 || scaleY != 1) {
//       //   context.scale(scaleX, scaleY);
//       // }

//       // let x = -this.width * this.anchor?.x;
//       // let y = -this.height * this.anchor?.y;

//       // if (x || y) {
//       //   context.translate(x, y);
//       // }

//       // this._rf();
//       // context.restore();
//     }
//   },

//   rectSprite: {
//     i: 0,
//     draw() {
//       this.context.fillStyle = this.color;
//       this.context.fillRect(0, 0, this.width, this.height);
//     }
//   },

//   anchor: {
//     i: 0,
//     init() {
//       this.anchor = {x: 0, y: 0};
//     }
//   },

//   scale: {
//     i: 0,
//     init() {
//       this.scale = {x: 0, y: 0};
//     },

//     setScale(x, y = x) {
//       this.scale = {x, y};
//     },

//     get scaledWidth() {
//       return this.width * this.scale.x;
//     },

//     get scaledHeight() {
//       return this.height * this.scale.y;
//     },

//     set scaledWidth(value) {},
//     set scaledHeight(value) {}
//   },

//   camera: {
//     i: 0,
//     init() {
//       this.sx = this.sy = 0;
//     },

//     get viewX() {
//       return this.x - this.sx;
//     },

//     get viewY() {
//       return this.y - this.sy;
//     },

//     set viewX(value) {},
//     set viewY(value) {}
//   },

//   group: {
//     i: 9,
//     init() {
//       this.children = [];
//     },

//     addChild(child) {
//       this.children.push(child);
//     },

//     removeChild(child) {
//       this.children = this.children.filter(c => c != child);
//     },

//     // how to do this part? amazingly you can redefine properties
//     // this way even though they have already been defined
//     // set x(value) {
//     //   this.children.map(child => {
//     //     child.x += value - this.position.x;
//     //   });
//     //   this.position.x = value;
//     // },

//     // // without the getter, only the setter is copied over and
//     // // you cannot get the value anymore
//     // get x() {
//     //   return this.position.x;
//     // }
//   }
// };

// ['x', 'y', 'sx', 'sy', 'rotation', 'scale'].map(prop => {
//   let propName = '_' + prop;
//   Object.defineProperty(modularSprite.group, prop, {
//     get() {
//       return this[propName];
//     },
//     set(value) {
//       this.children.map(child => {
//         child[prop] += value - this[propName];
//       });
//       this[propName] = value;
//     }
//   });
// });

// export default modularSprite;