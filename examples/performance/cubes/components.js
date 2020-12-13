/* global AFRAME, THREE */
function randomIncRad (multiplier) {
  return multiplier * Math.random();
}

function randomIncDeg (multiplier) {
  return randomIncRad(multiplier) * THREE.Math.RAD2DEG;
}

// COMPONENTS
// ------------------
AFRAME.registerComponent('rotate-obj3d', {
  tick: function () {
    let el = this.el;
    el.object3D.rotation.x += randomIncRad(0.1);
    el.object3D.rotation.y += randomIncRad(0.2);
    el.object3D.rotation.z += randomIncRad(0.3);
  }
});

AFRAME.registerComponent('rotate-get-obj3d', {
  tick: function () {
    let el = this.el;
    let rotation = el.getAttribute('rotation');

    rotation.x += randomIncRad(0.1);
    rotation.y += randomIncRad(0.2);
    rotation.z += randomIncRad(0.3);

    el.object3D.rotation.x = rotation.x;
    el.object3D.rotation.y = rotation.y;
    el.object3D.rotation.z = rotation.z;
  }
});

AFRAME.registerComponent('rotate-obj3d-set', {
  tick: function () {
    let el = this.el;
    let rotation = el.getAttribute('rotation');

    rotation.x += randomIncDeg(0.1);
    rotation.y += randomIncDeg(0.2);
    rotation.z += randomIncDeg(0.3);

    el.setAttribute('rotation', rotation);
  }
});

AFRAME.registerComponent('rotate-get-set', {
  tick: function () {
    let el = this.el;
    let rotationAux = this.rotationAux = this.rotationAux || {x: 0, y: 0, z: 0};
    let rotation = el.getAttribute('rotation');
    rotationAux.x = rotation.x + randomIncDeg(0.1);
    rotationAux.y = rotation.y + randomIncDeg(0.2);
    rotationAux.z = rotation.z + randomIncDeg(0.3);
    el.setAttribute('rotation', rotationAux);
  }
});

AFRAME.registerComponent('rotate-get-settext', {
  tick: function () {
    let el = this.el;
    let rotation = el.getAttribute('rotation');

    rotation.x += randomIncDeg(0.1);
    rotation.y += randomIncDeg(0.2);
    rotation.z += randomIncDeg(0.3);

    el.setAttribute('rotation', rotation.x + ' ' + rotation.y + ' ' + rotation.z);
  }
});
