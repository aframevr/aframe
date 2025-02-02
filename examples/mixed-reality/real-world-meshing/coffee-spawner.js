/* global AFRAME */
AFRAME.registerComponent('coffee-spawner', {
  schema: {
    delay: {default: 250},
    targetElementSelector: {default: ''}
  },
  init: function () {
    var el = this.el;
    this.delaySpawn = this.delaySpawn.bind(this);
    this.cancelDelayedSpawn = this.cancelDelayedSpawn.bind(this);
    this.onCollisionEnded = this.onCollisionEnded.bind(this);
    this.onCollisionStarted = this.onCollisionStarted.bind(this);
    this.el.addEventListener('pinchstarted', this.delaySpawn);
    this.el.addEventListener('pinchended', this.cancelDelayedSpawn);
    el.addEventListener('obbcollisionstarted', this.onCollisionStarted);
    el.addEventListener('obbcollisionended', this.onCollisionEnded);
    this.enabled = true;
  },

  delaySpawn: function (evt) {
    this.pinchEvt = evt;
    this.spawnDelay = this.data.delay;
  },

  cancelDelayedSpawn: function (evt) {
    this.spawnDelay = undefined;
  },

  tick: function (time, delta) {
    if (!this.spawnDelay) { return; }
    this.spawnDelay -= delta;
    if (this.spawnDelay <= 0) {
      this.spawn(this.pinchEvt);
      this.spawnDelay = undefined;
    }
  },

  spawn: function (evt) {
    var sceneEl = this.el.sceneEl;
    var saucerEl = document.createElement('a-entity');
    var cupEl = document.createElement('a-entity');
    var animateScale = function (evt) {
      evt.target.setAttribute('animation', {
        property: 'scale',
        from: {x: 0, y: 0, z: 0},
        to: {x: 0.0015, y: 0.0015, z: 0.0015},
        dur: 200
      });
    };

    if (!this.enabled) { return; }
    if (this.data.targetElementSelector && !this.targetEl) { return; }

    saucerEl.setAttribute('gltf-model', '#coffee');
    saucerEl.setAttribute('grabbable', '');
    saucerEl.setAttribute('hide-model-parts', 'parts: coffee, cup, handle');
    saucerEl.setAttribute('scale', '0.0015 0.0015 0.0015');
    saucerEl.setAttribute('position', evt.detail.position);
    saucerEl.addEventListener('loaded', animateScale);
    sceneEl.appendChild(saucerEl);

    cupEl.setAttribute('gltf-model', '#coffee');
    cupEl.setAttribute('grabbable', '');
    cupEl.setAttribute('hide-model-parts', 'parts: saucer');
    cupEl.setAttribute('rotation', '0 90 0');
    cupEl.setAttribute('scale', '0.0015 0.0015 0.0015');
    cupEl.setAttribute('position', evt.detail.position);
    cupEl.addEventListener('loaded', animateScale);
    sceneEl.appendChild(cupEl);
  },

  onCollisionStarted: function (evt) {
    var targetElementSelector = this.data.targetElementSelector;
    var targetEl = targetElementSelector && this.el.sceneEl.querySelector(targetElementSelector);
    if (targetEl === evt.detail.withEl) {
      this.targetEl = targetEl;
      return;
    }
    this.enabled = false;
  },

  onCollisionEnded: function (evt) {
    var targetElementSelector = this.data.targetElementSelector;
    var targetEl = targetElementSelector && this.el.sceneEl.querySelector(targetElementSelector);
    if (targetEl === evt.detail.withEl) {
      this.targetEl = undefined;
      return;
    }
    this.enabled = true;
  }
});
