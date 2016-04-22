/* global AFRAME */

/**
 * Create ton of entities at random positions.
 * Update raycasters to realize the boxes.
 */
AFRAME.registerComponent('entity-generator', {
  schema: {
    mixin: {default: ''},
    num: {default: 1000},
    raycasterEls: {default: '[mixin~="raycaster"]', type: 'selectorAll'},
    spread: {default: 20}
  },

  init: function () {
    var data = this.data;

    // Create entities with supplied mixin.
    for (var i = 0; i < data.num; i++) {
      var entity = document.createElement('a-entity');
      entity.setAttribute('mixin', data.mixin);
      // Set random position with supplied spread.
      entity.setAttribute('position', {
        x: getSpread(data.spread),
        y: getSpread(data.spread),
        z: getSpread(data.spread)
      });
      this.el.appendChild(entity);
    }

    // Refresh raycasters.
    if (!data.raycasterEls) { return; }
    for (i = 0; i < data.raycasterEls.length; i++) {
      data.raycasterEls[i].components.raycaster.refreshObjects();
    }
  }
});

function getSpread (spread) {
  return Math.random() * spread - spread / 2;
}
