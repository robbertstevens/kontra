// @ifdef GAMEOBJECT_TTL
export default {
  i() {
    this.ttl = Infinity;
  },

  isAlive() {
    return this.ttl > 0;
  }
};
// @endif