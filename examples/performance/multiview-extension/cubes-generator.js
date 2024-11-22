/* global AFRAME */
AFRAME.registerComponent('cubes-generator', {
  schema: {objectsNumber: {default: 5000}},
  init: function () {
    var objectsNumber = this.data.objectsNumber;
    this.cubeDistributionWidth = 100;
    for (var i = 0; i < objectsNumber; i++) {
      var cubeEl = document.createElement('a-entity');
      cubeEl.setAttribute('position', this.getRandomPosition());
      cubeEl.setAttribute('geometry', {primitive: 'box'});
      cubeEl.setAttribute('material', {color: this.getRandomColor(), shader: 'flat'});
      cubeEl.setAttribute('rotate-obj3d', '');
      this.el.sceneEl.appendChild(cubeEl);
    }
  },

  getRandomPosition: function () {
    var cubeDistributionWidth = this.cubeDistributionWidth;
    return {
      x: Math.random() * cubeDistributionWidth - cubeDistributionWidth / 2,
      y: Math.random() * cubeDistributionWidth - cubeDistributionWidth / 2,
      z: Math.random() * cubeDistributionWidth - cubeDistributionWidth / 2
    };
  },

  getRandomColor: function () {
    return '#' + ('000000' + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
  }
});

function randomIncRad (multiplier) {
  return multiplier * Math.random();
}

// COMPONENTS
// ------------------
AFRAME.registerComponent('rotate-obj3d', {
  tick: function () {
    var el = this.el;
    el.object3D.rotation.x += randomIncRad(0.01);
    el.object3D.rotation.y += randomIncRad(0.02);
    el.object3D.rotation.z += randomIncRad(0.03);
  }
});
