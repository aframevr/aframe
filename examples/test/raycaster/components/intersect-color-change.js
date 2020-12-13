/* global AFRAME */

/**
 * Change color if entity when intersected by raycaster.
 */
AFRAME.registerComponent('intersect-color-change', {
  init: function () {
    let el = this.el;
    let material = el.getAttribute('material');
    let initialColor = material.color;
    let initialOpacity = material.opacity;

    // Set color using raycaster parent color.
    el.addEventListener('raycaster-intersected', function (evt) {
      let raycasterEl = evt.detail.el;
      let fingerColor = raycasterEl.parentNode.getAttribute('material').color;
      el.setAttribute('material', 'color', fingerColor);
      el.setAttribute('material', 'opacity', 1.0);
    });

    // Reset color.
    el.addEventListener('raycaster-intersected-cleared', function (evt) {
      el.setAttribute('material', 'color', initialColor);
      el.setAttribute('material', 'opacity', initialOpacity);
    });
  }
});
