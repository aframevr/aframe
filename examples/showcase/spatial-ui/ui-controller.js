/* global AFRAME */

AFRAME.registerComponent('ui-controller', {
  schema: {
    modalElement: {type: 'selector', default: '[spatial-modal]'}
  },

  init: function () {
    this.onStartButtonClicked = this.onStartButtonClicked.bind(this);
    this.onCloseButtonClicked = this.onCloseButtonClicked.bind(this);
    this.onTileClicked = this.onTileClicked.bind(this);

    this.onSceneLoaded = this.onSceneLoaded.bind(this);

    this.el.sceneEl.addEventListener('loaded', this.onSceneLoaded);

    var tileEls = document.querySelectorAll('[tile]');
    for (var i = 0; i < tileEls.length; i++) {
      tileEls[i].addEventListener('click', this.onTileClicked);
    }

    document.querySelector('[spatial-button]').addEventListener('click', this.onStartButtonClicked);
    document.querySelector('[spatial-close-button]').addEventListener('click', this.onCloseButtonClicked);
  },

  onTileClicked: function (evt) {
    var self = this;
    var el = this.el;
    var objects = el.sceneEl.getAttribute('raycaster').objects;
    var cameraCursorEl = el.sceneEl.querySelector('.camera-cursor');

    objects = objects.split(',').filter(item => item !== '.tile').toString();
    el.sceneEl.setAttribute('raycaster', 'objects', objects);
    el.sceneEl.components.raycaster.refreshObjects();

    cameraCursorEl.setAttribute('raycaster', 'objects', objects);
    cameraCursorEl.components.raycaster.refreshObjects();

    el.sceneEl.querySelector('[spatial-window]').setAttribute('spatial-window', 'focused', false);
    el.sceneEl.querySelector('[spatial-modal-image]').setAttribute('spatial-modal-image', 'src', evt.target.getAttribute('tile').src);
    el.sceneEl.querySelector('.movie-title').setAttribute('value', evt.target.getAttribute('title'));
    el.sceneEl.querySelector('.movie-synopsis').setAttribute('value', evt.target.getAttribute('synopsis'));

    setTimeout(function () {
      self.data.modalElement.setAttribute('visible', true);
    }, 100);
  },

  onSceneLoaded: function () {
    var el = this.el;
    var objects = el.sceneEl.getAttribute('raycaster').objects;
    var cameraCursorEl = el.sceneEl.querySelector('.camera-cursor');

    objects = objects.split(',').filter(item => item !== '.tile').join(',');
    el.sceneEl.setAttribute('raycaster', 'objects', objects);
    el.sceneEl.components.raycaster.refreshObjects();

    cameraCursorEl.setAttribute('raycaster', 'objects', objects);
    cameraCursorEl.components.raycaster.refreshObjects();
  },

  onCloseButtonClicked: function () {
    var el = this.el;
    var objects = el.sceneEl.getAttribute('raycaster').objects;
    var cameraCursorEl = el.sceneEl.querySelector('.camera-cursor');

    objects = objects === '' ? [] : objects.split(',');
    objects.push('.tile');
    objects = objects.join(',');

    el.sceneEl.setAttribute('raycaster', 'objects', objects);
    el.sceneEl.components.raycaster.refreshObjects();

    cameraCursorEl.setAttribute('raycaster', 'objects', objects);
    cameraCursorEl.components.raycaster.refreshObjects();

    el.sceneEl.querySelector('[spatial-window]').setAttribute('spatial-window', 'focused', true);
    this.el.sceneEl.querySelector('[spatial-modal]').setAttribute('visible', false);
  },

  onStartButtonClicked: function () {
    var el = this.el;
    var cameraCursorEl = el.sceneEl.querySelector('.camera-cursor');

    el.sceneEl.setAttribute('raycaster', 'objects', '.tile');
    el.sceneEl.components.raycaster.refreshObjects();

    cameraCursorEl.setAttribute('raycaster', 'objects', '.tile');
    cameraCursorEl.components.raycaster.refreshObjects();

    el.querySelector('[spatial-hero-image]').setAttribute('visible', false);
    el.querySelector('#image-grid').setAttribute('visible', true);
  }
});
