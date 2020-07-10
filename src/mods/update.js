export default {
  update(dt) {
    // @ifdef GAMEOBJECT_VELOCITY||GAMEOBJECT_ACCELERATION||GAMEOBJECT_TTL
    this.advance(dt);
    // @endif
  },

  advance(dt) {
    // @ifdef GAMEOBJECT_VELOCITY

    // @ifdef GAMEOBJECT_ACCELERATION
    if (this.velocity && this.acceleration) {
      this.velocity = this.velocity.add(this.acceleration, dt);
    }
    // @endif

    if (this.position && this.velocity) {
      this.position = this.position.add(this.velocity, dt);
    }
    // @endif

    // @ifdef GAMEOBJECT_TTL
    this.ttl--;
    // @endif
  }
};