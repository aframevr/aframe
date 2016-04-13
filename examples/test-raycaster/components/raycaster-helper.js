/* global AFRAME, THREE */
var originVector = new THREE.Vector3(0, 0, 0);

/**
 * Draw raycaster ray.
 */
AFRAME.registerComponent('raycaster-helper', {
  dependencies: ['material', 'raycaster'],

  init: function () {
    var el = this.el;
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({
      color: el.getComputedAttribute('material').color
    });
    var raycaster = el.components.raycaster.raycaster;
    var length = raycaster.far === Infinity ? 1000 : raycaster.far;

    geometry.vertices.push(originVector,
                           raycaster.ray.direction.clone().multiplyScalar(length));
    material.opacity = el.getComputedAttribute('material').opacity;
    material.transparent = true;
    el.setObject3D('line', new THREE.Line(geometry, material));
  }
});
