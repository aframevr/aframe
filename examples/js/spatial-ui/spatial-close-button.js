/* global AFRAME, THREE */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Spatial Window component for A-Frame.
 */
AFRAME.registerComponent('spatial-close-button', {
  schema: {
    color: {type: 'color', default: '#ffffff'},
    width: {default: 1, min: 0},
    height: {default: 1, min: 0},
    focused: {default: true}
  },

  init: function () {
    var data = this.data;
    var geometry = this.geometry = new THREE.CircleGeometry(0.025, 32);

    var material = this.material = new THREE.MeshPhysicalMaterial({
      roughness: 0.8,
      transmission: 1,
      color: new THREE.Color(data.color)
    });

    var planeGeometry = this.planeGeometry = new THREE.PlaneGeometry(0.05, 0.05);
    var planeMaterial = this.planeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(data.color),
      transparent: true
    });

    var texture = new THREE.TextureLoader().load('./close-button.png', function () {
      // material.needsUpdate = true;
    });
    planeMaterial.map = texture;
    texture.colorSpace = THREE.SRGBColorSpace;

    this.circle = new THREE.Mesh(geometry, material);
    this.el.setObject3D('mesh', this.circle);

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.position.set(0, 0, 0.001);
    this.el.setObject3D('plane', this.plane);

    var targetPlaneEl = this.targetPlaneEl = document.createElement('a-entity');
    targetPlaneEl.setAttribute('geometry', {primitive: 'plane', width: 0.1, height: 0.1});
    targetPlaneEl.setAttribute('position', '0 0 0.002');
    targetPlaneEl.setAttribute('visible', false);
    targetPlaneEl.classList.add('close-button');

    this.el.appendChild(targetPlaneEl);

    targetPlaneEl.addEventListener('mouseenter', function () { material.roughness = 0.9; });
    targetPlaneEl.addEventListener('mouseleave', function () { material.roughness = 0.8; });
  },

  update: function () {
  }
});
