/* globals HMDVRDevice, PositionSensorVRDevice, Promise */
(function () {
  'use strict';

  function VRLoader (url) {
    var self = this;

    self.fsElement = null;
    self.fsEntered = false;

    if ('onmozfullscreenchange' in window) {
      self.fsChangeEventName = 'mozfullscreenchange';
    } else if ('onwebkitfullscreenchange' in window) {
      self.fsChangeEventName = 'webkitfullscreenchange';
    } else {
      self.fsChangeEventName = 'fullscreenchange';
    }

    window.addEventListener(self.fsChangeEventName, self.postFullscreenStatus.bind(self));

    document.getElementById('a-enter-vr-button').addEventListener('click', function () {
      self.requestFullscreen();
      self.postFullscreenStatus.bind(self);
    });

    window.addEventListener('message', function (e) {
      var msg = e.data;
      if (!msg.type) {
        return;
      }

      switch (msg.type) {
        case 'ready':
          console.log('[VRLoader] got ready');
          // Use postMessage to know to know when to start.
          self.iframe.contentWindow.postMessage({type: 'loaderReady'}, '*');
          break;
        case 'navigate':
          console.log('[VRLoader] navigating', msg.data.url);
          self.navigate(msg.data.url);
          break;
        case 'checkVr':
          e.ports[0].postMessage({type: 'checkVr', data: {isVr: self.fsEntered}});
          break;
      }
    });

    if (url) {
      self.injectIframe(url);
    }

    self.vrReady.then(function (data) {
      self.headset = data.headset;  // The HMD.
      self.sensor = data.sensor;  // The HMD's orientation/position sensor.
    }, console.warn.bind(console));
  }

  VRLoader.prototype.postFullscreenStatus = function () {
    this.fsElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    this.fsEntered = !!this.fsElement;
    var fsData = this.fsEntered ? 'enter' : 'exit';
    this.iframe.contentWindow.postMessage({type: 'fullscreen', data: fsData}, '*');
  };

  VRLoader.prototype.injectIframe = function (url) {
    if (this.injected) {
      return;
    }

    // Element that is used to navigate between VR pages.
    this.container = document.createElement('div');
    this.container.id = 'webvr__container';
    this.container.className = 'webvr__container';
    this.container.style.cssText = 'border: 0; position: absolute; top: 0; left: 0; height: 100%; width: 100%; z-index: 99999';
    document.body.appendChild(this.container);

    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('allowfullscreen', '');
    this.iframe.id = 'webvr__iframe';
    this.iframe.className = 'webvr__iframe';
    this.iframe.style.cssText = 'border: 0; position: absolute; top: 0; left: 0; height: 100%; width: 100%; z-index: 99999';
    if (url) {
      this.iframe.src = url;
    }
    this.container.appendChild(this.iframe);
    this.iframe.focus();
    this.injected = true;
  };

  VRLoader.prototype.navigate = function (url) {
    var self = this;
    if (!this.injected) {
      this.injectIframe();
    }
    this.iframe.src = url;
    this.iframe.onload = function () {
      self.postFullscreenStatus();
    };
  };

  /**
   * Calls fullscreen with VR mode.
   */
  VRLoader.prototype.requestFullscreen = function () {
    var self = this;
    if (self.fsEntered) {
      return;
    }

    if (self.container.mozRequestFullScreen) {
      self.container.mozRequestFullScreen({vrDisplay: self.headset});
    } else if (self.container.webkitRequestFullscreen) {
      self.container.webkitRequestFullscreen({vrDisplay: self.headset});
    } else if (self.container.requestFullscreen) {
      self.container.requestFullscreen({vrDisplay: self.headset});
    }

    self.iframe.focus();
  };

  /**
   * Handles `navigator.getVRDevices()`.
   *
   * @return {Promise} Resolved with VR devices; rejected if we do not find a headset
   * or its corresponding sensors.
   */
  VRLoader.prototype.vrReady = new Promise(function (resolve, reject) {
    if (!navigator.getVRDevices) {
      return reject('No VR implementation found');
    }

    navigator.getVRDevices().then(function (devices) {
      var headset;
      var sensor;
      var i = 0;

      // Find headset device.
      for (i = 0; i < devices.length; ++i) {
        if (devices[i] instanceof HMDVRDevice) {
          headset = devices[i];
          break;
        }
      }

      if (!headset) {
        return reject('No headset found');
      }

      // Find orientation and position sensors.
      for (i = 0; i < devices.length; ++i) {
        if (devices[i] instanceof PositionSensorVRDevice &&
            devices[i].hardwareUnitId === headset.hardwareUnitId) {
          sensor = devices[i];
          break;
        }
      }

      if (sensor) {
        resolve({
          headset: headset,
          sensor: sensor
        });
      } else {
        reject("Found a headset, but didn't find a position and orientation");
      }
    });
  });

  window.VRLoader = VRLoader;

  return VRLoader;
})();
