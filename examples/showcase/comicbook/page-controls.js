/* global AFRAME, THREE */
AFRAME.registerComponent('page-controls', {
  init: function () {
    var self = this;
    var el = this.el;
    var pageEl = this.pageEl = document.querySelector('[layer]');
    pageEl.object3D.position.set(0, 1.8, -2.5);

    this.pageIndex = 0;
    this.pages = [
      {
        page: 'page1',
        color: '#494949'
      },
      {
        page: 'page2',
        color: '#d471aa'
      },
      {
        page: 'page3',
        color: '#794782'
      },
      {
        page: 'page4',
        color: '#7d0147'
      },
      {
        page: 'page5',
        color: '#b06c85'
      }];

    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.friction = 2.0;
    this.onThumbstickChanged = this.onThumbstickChanged.bind(this);
    this.turnPage = this.turnPage.bind(this);
    el.addEventListener('thumbstickmoved', this.onThumbstickChanged);
    el.addEventListener('triggerdown', this.turnPage);
    document.addEventListener('click', this.turnPage);
    el.addEventListener('bbuttondown', function () { self.zoomOut = true; });
    el.addEventListener('ybuttondown', function () { self.zoomOut = true; });
    el.addEventListener('bbuttonup', function () { self.zoomOut = false; });
    el.addEventListener('ybuttonup', function () { self.zoomOut = false; });
    el.addEventListener('abuttondown', function () { self.zoomIn = true; });
    el.addEventListener('xbuttondown', function () { self.zoomIn = true; });
    el.addEventListener('abuttonup', function () { self.zoomIn = false; });
    el.addEventListener('xbuttonup', function () { self.zoomIn = false; });
    el.addEventListener('thumbstickdown', function () { pageEl.components.layer.toggleCompositorLayer(); });
    this.el.sceneEl.addEventListener('enter-vr', function () { pageEl.object3D.position.set(0, 1.8, -1.5); });
  },

  turnPage: function () {
    var pages = this.pages;
    var pageId;
    this.pageIndex = (this.pageIndex + 1) % (pages.length);
    pageId = pages[this.pageIndex].page;
    this.pageEl.setAttribute('layer', 'src', '#' + pageId);
    this.el.sceneEl.setAttribute('background', 'color', pages[this.pageIndex].color);
  },

  tick: function (time, delta) {
    var timeDelta = delta / 1000;
    this.updateVelocity(timeDelta);
    this.updatePosition(timeDelta);
    this.zoom(timeDelta);
  },

  updateVelocity: function (delta) {
    this.velocity.x += this.acceleration.x * delta;
    this.velocity.y += this.acceleration.y * delta;

    var scaledEasing = Math.pow(1 / this.friction, delta * 60);
    this.velocity.x = this.velocity.x * scaledEasing;
    this.velocity.y = this.velocity.y * scaledEasing;

    if (Math.abs(this.velocity.x) < 0.0001) { this.velocity.x = 0; }
    if (Math.abs(this.velocity.y) < 0.0001) { this.velocity.y = 0; }
  },

  updatePosition: function (delta) {
    var newX = this.pageEl.object3D.position.x + this.velocity.x * delta;
    var newY = this.pageEl.object3D.position.y + this.velocity.y * delta;

    if (Math.abs(newX) < 1.5) { this.pageEl.object3D.position.x = newX; }
    if (Math.abs(newY) < 2) { this.pageEl.object3D.position.y = newY; }
  },

  onThumbstickChanged: function (evt) {
    this.acceleration.x = evt.detail.x * 80;
    this.acceleration.y = -evt.detail.y * 80;
  },

  zoom: function (delta) {
    var position = this.pageEl.object3D.position;
    if (position.z < -1.0 && this.zoomIn) {
      position.z += 2.5 * delta;
    }

    if (position.z > -1.8 && this.zoomOut) {
      position.z -= 2.5 * delta;
    }
  }
});
