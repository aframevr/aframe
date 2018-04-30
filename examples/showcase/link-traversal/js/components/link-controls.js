/* global AFRAME, THREE */

AFRAME.registerSystem('link-controls', {
  init: function () {
    this.peeking = false;
  }
});

/**
 * Link controls component. Provides the interaction model for links and hand controllers
 * When the user points to the link she can trigger the peek mode on the link to get a 360
 * preview of the linked experience without traversing to it.
 *
 * @member {object} hiddenEls - Stores the hidden elements during peek mode.
 */
AFRAME.registerComponent('link-controls', {
  schema: {hand: {default: 'left'}},

  init: function () {
    var el = this.el;
    var self = this;

    el.setAttribute('laser-controls', {hand: this.data.hand});
    el.setAttribute('raycaster', {far: 100, objects: '[link]'});
    // Wait for controller to connect before
    el.addEventListener('controllerconnected', function (evt) {
      var isMobile = AFRAME.utils.device.isMobile();
      var componentName = evt.detail.name;
      var gearVRorDaydream = componentName === 'daydream-controls' || componentName === 'gearvr-controls';
      // Hide second controller for one-controller platforms.
      if (gearVRorDaydream && self.data.hand === 'left') {
        self.el.setAttribute('raycaster', 'showLine', false);
        return;
      }
      self.controller = componentName;
      self.addControllerEventListeners();
      self.initTooltips();
      if (!isMobile) { self.initURLView(); }
    });
    this.cameraPosition = new THREE.Vector3();
    this.peeking = false;
    this.linkPositionRatio = 0.0;
    this.linkAnimationDuration = 250;
    this.bindMethods();
  },

  tick: function (time, delta) {
    this.animate(delta);
  },

  initURLView: function () {
    var urlEl = this.urlEl = document.createElement('a-entity');
    var urlBackgroundEl = this.urlBackgroundEl = document.createElement('a-entity');

    // Set text that displays the link title / url
    urlEl.setAttribute('text', {
      color: 'white',
      align: 'center',
      font: 'kelsonsans',
      value: '',
      width: 0.5
    });
    urlEl.setAttribute('position', '0 0.1 -0.25');
    urlEl.setAttribute('visible', false);
    urlBackgroundEl.setAttribute('position', '0 -0.0030 -0.001');
    urlBackgroundEl.setAttribute('slice9', 'width: 0.5; height: 0.1; left: 32; right: 32; top: 64; bottom: 32; src: images/tooltip.png');
    urlBackgroundEl.setAttribute('scale', '1 0.5 1');
    urlEl.appendChild(urlBackgroundEl);
    this.el.appendChild(urlEl);
  },

  tooltips: {
    'vive-controls': {
      left: {
        touchpad: {
          tooltip: 'text: Press and hold touchpad to peek link; width: 0.1; height: 0.04; targetPosition: 0 0.05 0',
          position: '0.1 0.05 0.048',
          rotation: '-90 0 0'
        },
        trigger: {
          tooltip: 'text: Press trigger to traverse link; width: 0.11; height: 0.04; targetPosition: 0 -0.06 0.06; lineHorizontalAlign: right;',
          position: '-0.11 -0.055 0.04',
          rotation: '-90 0 0'
        }
      },
      right: {
        touchpad: {
          tooltip: 'text: Press and hold touchpad to peek link; width: 0.1; height: 0.04; targetPosition: 0 0.05 0',
          position: '0.1 0.05 0.048',
          rotation: '-90 0 0'
        },
        trigger: {
          tooltip: 'text: Press trigger to traverse link; width: 0.11; height: 0.04; targetPosition: 0 -0.06 0.06; lineHorizontalAlign: right;',
          position: '-0.11 -0.055 0.04',
          rotation: '-90 0 0'
        }
      }
    },
    'oculus-touch-controls': {
      left: {
        xbutton: {
          tooltip: 'text: Press X to peek link; width: 0.1; height: 0.04; targetPosition: 0.01 0.05 0',
          position: '0.09 0.055 0.050',
          rotation: '-90 0 0'
        },
        trigger: {
          tooltip: 'text: Press trigger to traverse link; width: 0.11; height: 0.04; targetPosition: 0.01 -0.06 0.06; lineHorizontalAlign: right;',
          position: '-0.13 -0.055 0.04',
          rotation: '-90 0 0'
        }
      },
      right: {
        abutton: {
          tooltip: 'text: Press A to peek link; width: 0.1; height: 0.04; targetPosition: -0.01 0.05 0',
          position: '0.09 0.055 0.050',
          rotation: '-90 0 0'
        },
        trigger: {
          tooltip: 'text: Press trigger to traverse link; width: 0.11; height: 0.04; targetPosition: -0.005 -0.06 0.06; lineHorizontalAlign: right;',
          position: '-0.11 -0.055 0.04',
          rotation: '-90 0 0'
        }
      }
    },
    'daydream-controls': {
      touchpad: {
        tooltip: 'text: Touch to peek, click to traverse link; width: 0.11; height: 0.04; targetPosition: -0.005 -0.06 0.06; lineHorizontalAlign: right;',
        position: '-0.11 -0.055 0.04',
        rotation: '-90 0 0'
      }
    },
    'gearvr-controls': {
      touchpad: {
        tooltip: 'text: Touch to peek, click to traverse link; width: 0.11; height: 0.04; targetPosition: -0.005 -0.06 0.06; lineHorizontalAlign: right;',
        position: '-0.11 -0.055 0.04',
        rotation: '-90 0 0'
      }
    }
  },

  initTooltips: function () {
    var controllerTooltips;
    var tooltips = this.tooltips;
    var el = this.el;
    if (!this.controller) { return; }
    var hand = el.getAttribute(this.controller).hand;
    controllerTooltips = hand ? tooltips[this.controller][hand] : tooltips[this.controller];
    Object.keys(controllerTooltips).forEach(function (key) {
      var tooltip = controllerTooltips[key];
      var tooltipEl = document.createElement('a-entity');
      tooltipEl.setAttribute('tooltip', tooltip.tooltip);
      tooltipEl.setAttribute('position', tooltip.position);
      tooltipEl.setAttribute('rotation', tooltip.rotation);
      el.appendChild(tooltipEl);
    });
  },

  bindMethods: function () {
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.startPeeking = this.startPeeking.bind(this);
    this.stopPeeking = this.stopPeeking.bind(this);
  },

  play: function () {
    var sceneEl = this.el.sceneEl;
    sceneEl.addEventListener('mouseenter', this.onMouseEnter);
    sceneEl.addEventListener('mouseleave', this.onMouseLeave);
    this.addControllerEventListeners();
  },

  pause: function () {
    var sceneEl = this.el.sceneEl;
    sceneEl.removeEventListener('mouseenter', this.onMouseEnter);
    sceneEl.removeEventListener('mouseleave', this.onMouseLeave);
    this.removeControllerEventListeners();
  },

  addControllerEventListeners: function () {
    var el = this.el;
    if (!this.controller) { return; }
    switch (this.controller) {
      case 'vive-controls':
        el.addEventListener('trackpaddown', this.startPeeking);
        el.addEventListener('trackpadup', this.stopPeeking);
        break;
      case 'daydream-controls':
        el.addEventListener('trackpadtouchstart', this.startPeeking);
        el.addEventListener('trackpadtouchend', this.stopPeeking);
        break;
      case 'oculus-touch-controls':
        el.addEventListener('xbuttondown', this.startPeeking);
        el.addEventListener('xbuttonup', this.stopPeeking);
        el.addEventListener('abuttondown', this.startPeeking);
        el.addEventListener('abuttonup', this.stopPeeking);
        break;
      case 'gearvr-controls':
        el.addEventListener('trackpadtouchstart', this.startPeeking);
        el.addEventListener('trackpadtouchend', this.stopPeeking);
        break;
      default:
        console.warn('Unknown controller ' + this.controller + '. Cannot attach link event listeners.');
    }
  },

  removeControllerEventListeners: function () {
    var el = this.el;
    switch (!this.controller) {
      case 'vive-controls':
        el.removeEventListeners('trackpaddown', this.startPeeking);
        el.removeEventListeners('trackpadup', this.stopPeeking);
        break;
      case 'daydream-controls':
        el.removeEventListeners('trackpadtouchstart', this.startPeeking);
        el.removeEventListeners('trackpadtouchend', this.stopPeeking);
        break;
      case 'oculus-touch-controls':
        el.removeEventListener('xbuttondown', this.startPeeking);
        el.removeEventListener('xbuttonup', this.stopPeeking);
        el.removeEventListener('abuttondown', this.startPeeking);
        el.removeEventListener('abuttonup', this.stopPeeking);
        break;
      case 'gearvr-controls':
        el.removeEventListener('trackpadtouchstart', this.startPeeking);
        el.removeEventListener('trackpadtouchend', this.stopPeeking);
        break;
      default:
        console.warn('Unknown controller ' + this.controller + '. Cannot remove link event listeners.');
    }
  },

  startPeeking: function () {
    var selectedLinkEl = this.selectedLinkEl;
    if (!selectedLinkEl || this.system.peeking || this.animatedEl) { return; }
    this.peeking = true;
    this.system.peeking = true;
    this.animatedEl = selectedLinkEl;
    this.animatedElInitPosition = selectedLinkEl.getAttribute('position');
    this.updateCameraPosition();
  },

  stopPeeking: function () {
    this.peeking = false;
    this.system.peeking = false;
  },

  updateCameraPosition: function () {
    var camera = this.el.sceneEl.camera;
    camera.parent.updateMatrixWorld();
    camera.updateMatrixWorld();
    this.cameraPosition.setFromMatrixPosition(camera.matrixWorld);
  },

  animate: (function () {
    var linkPosition = new THREE.Vector3();
    var portalToCameraVector = new THREE.Vector3();
    var easeOutCubic = function (t) { return (--t) * t * t + 1; };
    return function (delta) {
      var animatedEl = this.animatedEl;
      // There's no element to animate.
      if (!animatedEl) { return; }
      // User is not peeking and animation reached the end
      if (!this.peeking && this.linkPositionRatio === 0.0) {
        // Restore portal initial position after animation
        animatedEl.setAttribute('position', this.animatedElInitPosition);
        // Exit peekmode and show all the elements in the scene
        animatedEl.setAttribute('link', 'peekMode', false);
        animatedEl.components.link.showAll();
        // We're done with the animation
        this.animatedEl = undefined;
        return;
      }
      // If we're peeking and the animation towards the camera has finished
      if (this.peeking && this.linkPositionRatio === 1.0) {
        animatedEl.setAttribute('link', 'peekMode', true);
      } else {
        // Hide all elements during animation to avoid clipping artifacts
        animatedEl.components.link.hideAll();
      }
      // Calculate animation step
      var step = delta / this.linkAnimationDuration;
      // From [0..1] progress of the animation
      this.linkPositionRatio += this.peeking ? step : -step;
      // clamp to [0,1]
      this.linkPositionRatio = Math.min(Math.max(0.0, this.linkPositionRatio), 1.0);
      // Update Portal Position
      linkPosition.copy(this.animatedElInitPosition);
      // Move link towards the camera: Camera <----- Link
      portalToCameraVector.copy(this.cameraPosition).sub(linkPosition);
      var distanceToCamera = portalToCameraVector.length();
      // Unit vector
      portalToCameraVector.normalize();
      portalToCameraVector.multiplyScalar(distanceToCamera * easeOutCubic(this.linkPositionRatio));
      // Adds direction vector to the
      linkPosition.add(portalToCameraVector);
      // Hides / Shows link URL to prevent jarring animation when moving
      // the portal towards the user
      if (this.linkPositionRatio > 0.0 && this.linkPositionRatio < 1.0) {
        animatedEl.components.link.textEl.setAttribute('visible', false);
      } else {
        animatedEl.components.link.textEl.setAttribute('visible', true);
      }
      // We won't move the portal closer than 0.5m from the user.
      if (distanceToCamera <= 0.5 && this.peeking) { return; }
      // Update portal position
      animatedEl.setAttribute('position', linkPosition);
    };
  })(),

  onMouseEnter: function (evt) {
    var link;
    var previousSelectedLinkEl = this.selectedLinkEl;
    var selectedLinkEl = evt.detail.intersectedEl;
    var urlEl = this.urlEl;
    if (!selectedLinkEl || previousSelectedLinkEl || selectedLinkEl.components.link === undefined) { return; }
    selectedLinkEl.setAttribute('link', 'highlighted', true);
    this.selectedLinkElPosition = selectedLinkEl.getAttribute('position');
    this.selectedLinkEl = selectedLinkEl;
    if (!urlEl) { return; }
    link = selectedLinkEl.getAttribute('link');
    urlEl.setAttribute('text', 'value', link.title || link.href);
    urlEl.setAttribute('visible', true);
  },

  onMouseLeave: function (evt) {
    var selectedLinkEl = this.selectedLinkEl;
    var urlEl = this.urlEl;
    if (!selectedLinkEl || !evt.detail.intersectedEl) { return; }
    selectedLinkEl.setAttribute('link', 'highlighted', false);
    this.selectedLinkEl = undefined;
    if (!urlEl) { return; }
    urlEl.setAttribute('visible', false);
  }
});
