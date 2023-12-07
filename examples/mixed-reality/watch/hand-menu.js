/* global AFRAME, THREE */
AFRAME.registerComponent('hand-menu', {
  schema: {
    location: {default: 'palm', oneOf: ['wrist', 'palm']}
  },

  menuHTML: /* syntax: html */ `
   <a-entity
      scale="0 0 0"
      animation__open="startEvents: open; dur: 200; property: scale; from: 0 0 1; to: 0.1 0.1 0.1"
      animation__close="startEvents: close; dur: 200; property: scale; from: 0.1 0.1 0.1; to: 0 0 1">

        <a-entity
          obb-collider
          hand-menu-button="src: #infoButton; srcHover: #infoButtonHover"
          position="0 0 0"
          rotation="0 180 0"
          geometry="primitive: plane; width: 1; height: 1;"
          material="side: double; color: white; shader: flat; src: #infoButton; transparent: true;">
        </a-entity>

        <a-entity
          obb-collider
          hand-menu-button="src: #cubeButton; srcHover: #cubeButtonHover; mixin: cube"
          position="0 1.12 0"
          geometry="primitive: plane; width: 1; height: 1;"
          material="side: double; color: white; shader: flat; src: #cubeButton; transparent: true">
        </a-entity>

        <a-entity
          obb-collider
          hand-menu-button="src: #cylinderButton; srcHover: #cylinderButtonHover; mixin: cylinder"
          position="0 -1.12 0"
          geometry="primitive: plane; width: 1; height: 1;"
          material="side: double; color: white; shader: flat; src: #cylinderButton; transparent: true">
        </a-entity>

        <a-entity
          obb-collider
          hand-menu-button="src: #planeButton; srcHover: #planeButtonHover; mixin: plane"
          position="-1.12 0 0"
          geometry="primitive: plane; width: 1; height: 1;"
          material="side: double; color: white; shader: flat; src: #planeButton; transparent: true">
        </a-entity>

        <a-entity
          obb-collider
          hand-menu-button="src: #sphereButton; srcHover: #sphereButtonHover; mixin: sphere"
          position="1.12 0 0"
          geometry="primitive: plane; width: 1; height: 1;"
          material="side: double; color: white; shader: flat; src: #sphereButton; transparent: true">
        </a-entity>
    </a-entity>
  `,

  init: function () {
    this.onCollisionStarted = this.onCollisionStarted.bind(this);
    this.onCollisionEnded = this.onCollisionEnded.bind(this);
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onSceneLoaded = this.onSceneLoaded.bind(this);
    this.onEnterVR = this.onEnterVR.bind(this);

    this.throttledOnPinchEvent = AFRAME.utils.throttle(this.throttledOnPinchEvent, 50, this);

    this.el.sceneEl.addEventListener('loaded', this.onSceneLoaded);
    this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR);
  },

  onEnterVR: function () {
    this.setupMenu();
  },

  onSceneLoaded: function () {
    var handEls = this.el.sceneEl.querySelectorAll('[hand-tracking-controls]');
    for (var i = 0; i < handEls.length; i++) {
      if (handEls[i] === this.el) { continue; }
      this.handElement = handEls[i];
    }
  },

  setupMenu: function () {
    var template = document.createElement('template');
    template.innerHTML = this.menuHTML;
    this.menuEl = template.content.children[0];
    this.el.sceneEl.appendChild(this.menuEl);

    if (this.data.location === 'wrist') {
      this.setupWatch();
    } else {
      this.setupPalm();
    }
  },

  setupWatch: function () {
    var el = this.openMenuEl = document.createElement('a-entity');
    el.setAttribute('gltf-model', '#watch');
    el.setAttribute('scale', '0.05 0.05 0.05');
    el.setAttribute('position', '0 0.035 0');
    if (this.el.getAttribute('hand-tracking-controls').hand === 'right') {
      el.setAttribute('rotation', '0 180 0');
    }
    el.setAttribute('obb-collider', 'centerModel: true');

    el.addEventListener('model-loaded', this.onModelLoaded);
    el.addEventListener('obbcollisionstarted', this.onCollisionStarted);
    el.addEventListener('obbcollisionended', this.onCollisionEnded);

    var timeEl = this.timeEl = document.createElement('a-entity');
    timeEl.setAttribute('text', 'align: center');
    timeEl.setAttribute('time', '');
    if (this.el.getAttribute('hand-tracking-controls').hand === 'right') {
      timeEl.setAttribute('rotation', '-90 -90 0');
      timeEl.setAttribute('position', '0.024 0.038 -0.001');
    } else {
      timeEl.setAttribute('rotation', '-90 -90 180');
      timeEl.setAttribute('position', '-0.024 0.038 0');
    }
    timeEl.setAttribute('scale', '0.09 0.09 0.09');
    el.appendChild(timeEl);

    this.el.appendChild(el);
  },

  setupPalm: function () {
    var el = this.openMenuEl = document.createElement('a-entity');
    el.setAttribute('geometry', 'primitive: circle; radius: 0.025');
    el.setAttribute('material', 'side: double; src: #palmButton; shader: flat');
    el.setAttribute('rotation', '90 0 180');
    el.setAttribute('position', '0 -0.035 -0.07');
    el.setAttribute('obb-collider', '');
    el.addEventListener('obbcollisionstarted', this.onCollisionStarted);
    el.addEventListener('obbcollisionended', this.onCollisionEnded);
    this.el.appendChild(el);
  },

  throttledOnPinchEvent: function (evt) {
    if (evt.type === 'pinchstarted') { this.onPinchStarted(evt); }
    if (evt.type === 'pinchended') { this.onPinchEnded(evt); }
  },

  onModelLoaded: function (evt) {
    var textureImage = document.querySelector('#watchDisplayHover');
    this.watchDisplayObject = evt.detail.model.getObjectByName('Object_24');
    this.watchDisplayTextureHover = new THREE.Texture(textureImage);
    this.watchDisplayTexture = this.watchDisplayObject.material.map;
  },

  onCollisionStarted: function (evt) {
    var withEl = evt.detail.withEl;
    if (this.handElement !== withEl) { return; }
    withEl.addEventListener('pinchstarted', this.throttledOnPinchEvent);
    withEl.addEventListener('pinchended', this.throttledOnPinchEvent);
    this.handHoveringEl = withEl;
    this.updateUI();
  },

  onCollisionEnded: function (evt) {
    var withEl = evt.detail.withEl;
    if (this.handElement !== withEl) { return; }
    withEl.removeEventListener('pinchstarted', this.throttledOnPinchEvent);
    if (!this.opened) {
      withEl.removeEventListener('pinchended', this.throttledOnPinchEvent);
    }
    this.handHoveringEl = undefined;
    this.updateUI();
  },

  updateUI: function () {
    var watchDisplayObject = this.watchDisplayObject;
    var palmButtonImage;
    if (this.data.location === 'wrist' && watchDisplayObject) {
      watchDisplayObject.material.map = this.handHoveringEl ? this.watchDisplayTextureHover : this.watchDisplayTexture;
      watchDisplayObject.material.map.needsUpdate = true;
      watchDisplayObject.material.needsUpdate = true;
      return;
    }
    if (this.data.location === 'palm') {
      palmButtonImage = this.handHoveringEl ? '#palmButtonHover' : '#palmButton';
      this.openMenuEl.setAttribute('material', 'src', palmButtonImage);
      return;
    }
  },

  onPinchStarted: (function () {
    var auxMaxtrix = new THREE.Matrix4();
    var auxQuaternion = new THREE.Quaternion();
    return function (evt) {
      if (!this.handHoveringEl || this.opened) { return; }
      this.opened = true;
      this.menuEl.object3D.position.copy(evt.detail.position);
      this.menuEl.emit('open');
      function lookAtVector (sourcePoint, destPoint) {
        return auxQuaternion.setFromRotationMatrix(
            auxMaxtrix.identity()
            .lookAt(sourcePoint, destPoint, new THREE.Vector3(0, 1, 0)));
      }

      var cameraEl = this.el.sceneEl.querySelector('[camera]');
      var rotationQuaternion = lookAtVector(this.menuEl.object3D.position, cameraEl.object3D.position);
      this.menuEl.object3D.quaternion.copy(rotationQuaternion);
      this.pinchedEl = this.handHoveringEl;
      if (this.data.location === 'palm') { this.openMenuEl.object3D.visible = false; }
    };
  })(),

  onPinchEnded: function (evt) {
    if (!this.pinchedEl) { return; }
    this.opened = false;
    this.menuEl.emit('close');
    this.pinchedEl = undefined;
    this.openMenuEl.object3D.visible = true;
  },

  lookAtCamera: (function () {
    var auxVector = new THREE.Vector3();
    var auxObject3D = new THREE.Object3D();
    return function (el) {
      var cameraEl = this.el.sceneEl.querySelector('[camera]');
      auxVector.subVectors(cameraEl.object3D.position, el.object3D.position).add(el.object3D.position);
      el.object3D.lookAt(auxVector);
      el.object3D.rotation.z = 0;
    };
  })()
});

/*

Watch style UI that work both in VR and AR with @aframevr in one line of <HTML>

Try now on @Meta Quest Browser

https://a-watch.glitch.me/

Just 400 lines of code: https://glitch.com/edit/#!/a-watch

Watch-style intuitive but easy to occlude hands ⌚️
Palm- style less familiar but more robust ✋

Enjoy! Wanna see more of this? sponsor me on @github

https://github.com/sponsors/dmarcos

*/
