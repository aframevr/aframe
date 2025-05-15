/* global AFRAME */
AFRAME.registerComponent('cubemap-switcher', {
  init: function () {
    var cubemapURL = getQueryVariable('cubemapURL');
    // Don't load cubemaps if not WebXR
    if (!this.el.sceneEl.hasWebXR) { return; }
    this.timeOnCubemap = 0;
    if (cubemapURL) {
      this.cubemaps = [{
        id: 'usercubemap',
        src: cubemapURL
      }];
      this.preloadCubemaps();
      this.el.setAttribute('layer', 'src', '#usercubemap');
      return;
    } else {
      this.cubemaps = [
        {
          id: 'imaginerealitycubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/23036_7E20F856-0889-4C02-8029-78A4D02F5834_pano.png',
          rotate: true
        },
        {
          id: 'realizationcubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/23252_C59E51B1-932C-4273-960F-FC7208C0A80E_pano.png',
          rotate: true
        },
        {
          id: 'raisedintooblivioncubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/13884_3821EBB8-134A-4C24-9176-FFBA6DCF3CC9_pano.png',
          rotate: false
        },
        {
          id: 'daybegancubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/9828_17AD4FA9-6C29-460D-B611-FEC36370C0A6_pano.png',
          rotate: true
        },
        {
          id: 'exploringmetaversecubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/20075_D4CDCFE8-E077-447A-ADA0-3C0F2BD5CBB6_pano.png',
          rotate: false
        },
        {
          id: 'deck75cubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/9828_37FE3467-547B-45B3-ACEF-DD070686C22E_pano.png',
          rotate: false
        },
        {
          id: 'learninganatomycubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/16976_E8CF73F1-0AE3-47B1-AF13-BD5F875D9D37_pano.png',
          rotate: true
        },
        {
          id: 'minimetaversecubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/14627_198A06E7-8742-4A26-9B99-B769F8DC4470_pano.png',
          rotate: false
        },
        {
          id: 'toystorycubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/5034_9D12BBB5-DFBC-4DEC-82D5-0CF7EE320F4F_pano.png',
          rotate: true
        },
        {
          id: 'losttimecubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/23624_2CA89B4A-6E0F-452E-99B6-5DC46B00C34D_pano.png',
          rotate: true
        },
        {
          id: 'betweencloudscubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/9425_29AEF0AF-3FD6-4E91-8477-9415FEBA4F4A_pano.png',
          rotate: true
        },
        {
          id: 'pursuitofmetaverse',
          src: 'https://vr1.otoycdn.net/vr/pano/20075_228BC925-E0ED-454C-953E-85E8FCE9371B_pano.png',
          rotate: false
        },
        {
          id: 'livingwithnaturecubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/18537_03DCCB5D-33A5-4136-83DA-3F8C758ED7AA_pano.png',
          rotate: true
        },
        {
          id: 'twosidescubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/21737_24A207C8-BDC7-4735-AB16-25A4C8A4004F_pano.png',
          rotate: false
        },
        {
          id: 'intheforestcubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/14320_F14EBF00-B2F8-4874-A4D9-4CE8C2D228A4_pano.png',
          rotate: false
        },
        {
          id: 'neonbuddhacubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/5034_E08E1DF3-8341-4091-A793-600173B39806_pano.png',
          rotate: true
        },
        {
          id: 'smallflatmetaversecubemap',
          src: 'https://vr1.otoycdn.net/vr/pano/2826_FFC73CBF-0502-4D98-827D-4EC33DE3FA4F_pano.png',
          rotate: false
        }
      ];

      this.cubemapIndex = 0;
      this.switchCubemap = this.switchCubemap.bind(this);
      this.checkInput = this.checkInput.bind(this);
      this.onThumbstickMoved = this.onThumbstickMoved.bind(this);

      this.leftHandEl = document.querySelector('#leftHand');
      this.rightHandEl = document.querySelector('#rightHand');
      this.leftHandEl.addEventListener('thumbstickmoved', this.onThumbstickMoved);
      this.rightHandEl.addEventListener('thumbstickmoved', this.onThumbstickMoved);

      this.el.sceneEl.addEventListener('enter-vr', function () {
        document.querySelector('#welcome').object3D.visible = false;
        document.querySelector('a-scene').removeAttribute('environment');
      });
      this.preloadCubemaps();
    }
  },

  tick: function (time, delta) {
    this.timeOnCubemap += delta;
  },

  onThumbstickMoved: function (evt) {
    var thumbstickDown = evt.detail.x < -0.8 || evt.detail.x > 0.8;
    if (thumbstickDown && !this.thumbstickDown) {
      if (evt.detail.x < -0.8) {
        this.switchCubemap(true);
      } else {
        this.switchCubemap(false);
      }
    }
    this.thumbstickDown = thumbstickDown;
  },

  preloadCubemaps: function () {
    var imgEl;
    var existingImgEl;
    var cubemaps = this.cubemaps;
    for (var i = 0; i < cubemaps.length; ++i) {
      existingImgEl = document.querySelector('#' + cubemaps[i].id);
      cubemaps[i].imgEl = existingImgEl;
      if (existingImgEl) { continue; }
      imgEl = document.createElement('img');
      imgEl.id = cubemaps[i].id;
      imgEl.crossOrigin = 'anonymous';
      imgEl.src = cubemaps[i].src;
      // imgEl.onload = function (evt) { self.preloadImages(evt.target); }
      cubemaps[i].imgEl = imgEl;
      this.el.sceneEl.appendChild(imgEl);
    }
  },

  preloadImages: function (imgEl) {
    this.el.components.layer.preGenerateCubeMapTextures(imgEl, this.checkInput);
  },

  checkInput: function () {
    var leftHandControls = this.leftHandEl.components['tracked-controls-webxr'];
    var rightHandControls = this.rightHandEl.components['tracked-controls-webxr'];
    if (leftHandControls) { leftHandControls.updateButtons(); }
    if (rightHandControls) { rightHandControls.updateButtons(); }
  },

  switchCubemap: function (previous) {
    var cubemapIndex = previous === true ? this.cubemapIndex - 1 : this.cubemapIndex + 1;

    this.timeOnCubemap = 0;

    if (cubemapIndex < 0) { cubemapIndex = this.cubemaps.length - 1; }
    if (cubemapIndex === this.cubemaps.length) { cubemapIndex = 0; }
    // var imgEl = this.cubemaps[cubemapIndex].imgEl;
    if (this.el.components.layer.pendingCubeMapUpdate) { return; }

    this.el.setAttribute('layer', {
      src: '#' + this.cubemaps[cubemapIndex].id,
      rotateCubemap: this.cubemaps[cubemapIndex].rotate
    });

    this.cubemapIndex = cubemapIndex;
    this.imgLoading = false;

    // nextImgEl = this.cubemaps[cubemapIndex+1] && this.cubemaps[cubemapIndex+1].imgEl;
    // if (nextImgEl) {
    //   if (nextImgEl.complete) {
    //     this.el.components.layer.preGenerateCubeMapTextures(this.cubemaps[cubemapIndex+1].imgEl, this.checkInput);
    //   } else {
    //     nextImgEl.onload = function (evt) { self.preloadImages(nextImgEl); }
    //   }
    // }
  }
});

function getQueryVariable (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  var pair;
  for (var i = 0; i < vars.length; i++) {
    pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  // console.log('Query variable %s not found', variable);
}
