/* global AFRAME, THREE */

var DEFAULT_CLIP = '__auto__';

AFRAME.registerComponent('animation-mixer', {
  schema: {
    clip: {default: DEFAULT_CLIP},
    duration: {default: 0}
  },

  init: function () {
    var model = this.el.getObject3D('mesh');

    this.model = null;
    this.mixer = null;
    this.activeAction = null;

    if (model) {
      this.load(model);
    } else {
      this.el.addEventListener('model-loaded', function (e) {
        this.load(e.detail.model);
      }.bind(this));
    }
  },

  load: function (model) {
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    if (this.data.clip) { this.update({}); }
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();
  },

  update: function (previousData) {
    if (!previousData) return;

    var data = this.data;

    if (data.clip !== previousData.clip) {
      if (this.activeAction) this.activeAction.stop();
      if (data.clip) this.playClip(data.clip);
    }

    if (!this.activeAction) return;

    if (data.duration) {
      this.activeAction.setDuration(data.duration);
    }
  },

  playClip: function (clipName) {
    if (!this.mixer) return;

    var clip;
    var data = this.data;
    var model = this.model;
    var animations = model.animations || (model.geometry || {}).animations || [];

    if (!animations.length) { return; }

    clip = clipName === DEFAULT_CLIP
      ? animations[0]
      : THREE.AnimationClip.findByName(animations, data.clip);

    if (!clip) {
      console.error('[animation-mixer] Clip "%s" not found.', data.clip);
      return;
    }

    this.activeAction = this.mixer.clipAction(clip, model);
    this.activeAction.play();
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) this.mixer.update(dt / 1000);
  }
});
