/* global AFRAME, THREE */
AFRAME.registerComponent('hand-menu-button', {
  schema: {
    src: {default: ''},
    srcHover: {default: ''},
    mixin: {default: ''}
  },

  init: function () {
    this.onWatchButtonHovered = this.onWatchButtonHovered.bind(this);
    this.onAnimationComplete = this.onAnimationComplete.bind(this);
    this.onCollisionStarted = this.onCollisionStarted.bind(this);
    this.onCollisionEnded = this.onCollisionEnded.bind(this);
    this.onAnimationBegin = this.onAnimationBegin.bind(this);
    this.onPinchEnded = this.onPinchEnded.bind(this);

    this.el.addEventListener('obbcollisionstarted', this.onCollisionStarted);
    this.el.addEventListener('obbcollisionended', this.onCollisionEnded);
    this.el.object3D.renderOrder = 1000;

    this.menuEl = this.el.parentEl;
    this.handMenuEl = this.el.sceneEl.querySelector('[hand-menu]');

    this.menuEl.addEventListener('animationbegin', this.onAnimationBegin);
    this.menuEl.addEventListener('animationcomplete', this.onAnimationComplete);
  },

  onAnimationBegin: function (evt) {
    // To prevent menu activations while animation is running.
    if (evt.detail.name === 'animation__open') { this.menuOpen = false; }
  },

  onAnimationComplete: function (evt) {
    if (evt.detail.name === 'animation__open') { this.menuOpen = true; }
    if (evt.detail.name === 'animation__close') { this.menuOpen = false; }
  },

  onCollisionStarted: function (evt) {
    var withEl = evt.detail.withEl;
    if (this.handMenuEl === withEl ||
        !withEl.components['hand-tracking-controls']) { return; }
    if (!this.menuOpen) { return; }
    this.handHoveringEl = withEl;
    this.el.emit('watchbuttonhoverstarted');
  },

  onCollisionEnded: function (evt) {
    var withEl = evt.detail.withEl;
    if (this.handMenuEl === withEl ||
        !withEl.components['hand-tracking-controls']) { return; }
    this.disableHover();
    this.handHoveringEl = undefined;
    this.el.emit('watchbuttonhoverended');
  },

  enableHover: function () {
    this.handHoveringEl.addEventListener('pinchended', this.onPinchEnded);
    this.el.setAttribute('material', 'src', this.data.srcHover);
  },

  disableHover: function () {
    if (!this.handHoveringEl) { return; }
    this.handHoveringEl.removeEventListener('pinchended', this.onPinchEnded);
    this.el.setAttribute('material', 'src', this.data.src);
  },

  onPinchEnded: (function () {
    var spawnPosition = new THREE.Vector3(0, 1, 0);
    return function () {
      var cubeEl;
      var newEntityEl;
      if (!this.menuOpen) { return; }
      this.menuOpen = false;
      if (!this.handHoveringEl || !this.data.mixin) { return; }
      // Spawn shape a little above the menu.
      spawnPosition.set(0, 1, 0);
      // Apply rotation of the menu.
      spawnPosition.applyQuaternion(this.el.parentEl.object3D.quaternion);
      // 20cm above the menu.
      spawnPosition.normalize().multiplyScalar(0.2);
      spawnPosition.add(this.el.parentEl.object3D.position);

      newEntityEl = document.createElement('a-entity');
      newEntityEl.setAttribute('mixin', this.data.mixin);
      newEntityEl.setAttribute('position', spawnPosition);
      this.el.sceneEl.appendChild(newEntityEl);
      this.handHoveringEl.removeEventListener('pinchended', this.onPinchEnded);
    };
  })(),

  onWatchButtonHovered: function (evt) {
    if (evt.target === this.el || !this.handHoveringEl) { return; }
    this.disableHover();
    this.handHoveringEl = undefined;
  }
});

/*
   User's hand can collide with multiple buttons simulatenously but only want one in a hovered state.
   This system keeps track of all the collided buttons, keeping just the closest to the hand in a hovered state.
*/
AFRAME.registerSystem('hand-menu-button', {
  init: function () {
    this.onWatchButtonHovered = this.onWatchButtonHovered.bind(this);
    this.el.parentEl.addEventListener('watchbuttonhoverended', this.onWatchButtonHovered);
    this.el.parentEl.addEventListener('watchbuttonhoverstarted', this.onWatchButtonHovered);
    this.hoveredButtonEls = [];
  },

  tick: function () {
    var buttonWorldPosition = new THREE.Vector3();
    var thumbPosition;
    var smallestDistance = 1000000;
    var currentDistance;
    var closestButtonEl;
    if (this.hoveredButtonEls.length < 2) { return; }
    thumbPosition = this.hoveredButtonEls[0].components['hand-menu-button'].handHoveringEl.components['obb-collider'].trackedObject3D.position;
    for (var i = 0; i < this.hoveredButtonEls.length; ++i) {
      this.hoveredButtonEls[i].object3D.getWorldPosition(buttonWorldPosition);
      currentDistance = buttonWorldPosition.distanceTo(thumbPosition);
      if (currentDistance < smallestDistance) {
        closestButtonEl = this.hoveredButtonEls[i];
        smallestDistance = currentDistance;
      }
    }

    if (this.hoveredButtonEl === closestButtonEl) { return; }

    this.hoveredButtonEl = closestButtonEl;

    for (i = 0; i < this.hoveredButtonEls.length; ++i) {
      if (!this.hoveredButtonEls[i].components['hand-menu-button'].handHoveringEl) { continue; }
      if (this.hoveredButtonEls[i] === closestButtonEl) {
        this.hoveredButtonEls[i].components['hand-menu-button'].enableHover();
        continue;
      }
      this.hoveredButtonEls[i].components['hand-menu-button'].disableHover();
    }
  },

  onWatchButtonHovered: function (evt) {
    this.buttonEls = this.el.sceneEl.querySelectorAll('[hand-menu-button]');
    this.hoveredButtonEls = [];
    for (var i = 0; i < this.buttonEls.length; ++i) {
      if (!this.buttonEls[i].components['hand-menu-button'].handHoveringEl) { continue; }
      this.hoveredButtonEls.push(this.buttonEls[i]);
    }
    if (this.hoveredButtonEls.length === 1) {
      this.hoveredButtonEl = this.hoveredButtonEls[0];
      this.hoveredButtonEls[0].components['hand-menu-button'].enableHover();
    }
  }
});
