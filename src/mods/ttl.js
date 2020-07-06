export default {
  i() {
    this.ttl = 0;
  },

  isAlive() {
    return this.ttl > 0;
  }
};