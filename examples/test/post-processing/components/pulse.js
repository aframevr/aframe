/* global AFRAME */

AFRAME.registerComponent('pulse', {
  /*
   * Two way connections for nodes of the runtime execution graph.
   * .precedents here don't affect logic, but cause order to change.
   */
  precedents: ['envmap'], //  execute after all env-map components.
  following: ['post-process'], // execute before any post-process component.

  // .dependencies form the dependency graph. One way, incoming, one property.
  dependencies: ['geometry', 'material'],

  schema: {
    phase: { default: 0, min: 0, max: 1 },
    exponent: { default: 1 }
  },

  remove: function () {
    var m = this.el.object3DMap.mesh;
    delete m.postOpacity;
  },

  tick: function (time) {
    var m = this.el.object3DMap.mesh;

    // Don't set opacity immediately, let the post effect handle that in it's tock()
    var calc = Math.abs(Math.sin(time / 1000 + this.data.phase));
    m.material.postOpacity = Math.pow(calc, this.data.exponent);
    var scale = 1 + 0.2 * (1 - calc);
    m.scale.set(scale, scale, scale);
  }
});
