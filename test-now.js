// import { setStoreItem } from './kontra.mjs';
import { GameObject } from './kontra.mjs';

let object = GameObject({
  x: 10,
  y: 10,
  width: 20,
  height: 40,
  color: 'red',
  render() {
    this.context.fillStyle = 'red';
    this.context.fillRect(0, 0, this.width, this.height);
  }
});

// let collide = radToDeg(12);

// setStoreItem('foo', 1);