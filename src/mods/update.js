export default {
  update(dt) {
    // @ifdef GAMEOBJECT_VELOCITY||GAMEOBJECT_ACCELERATION||GAMEOBJECT_TTL
    this.advance(dt);
    // @endif
  },

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
};