/* global AFRAME, THREE */
let originVector = new THREE.Vector3(0, 0, 0);

/**
 * Draw raycaster ray.
 */
AFRAME.registerComponent('raycaster-helper', {
  dependencies: ['material', 'raycaster'],

  init: function () {
    let el = this.el;
    let geometry = new THREE.Geometry();
    let material = new THREE.LineBasicMaterial({
      color: el.getAttribute('material').color
    });
    let raycaster = el.components.raycaster.raycaster;
    let length = raycaster.far === Infinity ? 1000 : raycaster.far;

    geometry.vertices.push(originVector,
                           raycaster.ray.direction.clone().multiplyScalar(length));
    material.opacity = el.getAttribute('material').opacity;
    material.transparent = true;
    el.setObject3D('line', new THREE.Line(geometry, material));
  }
});
