/*eslint-disable */
/******/ (function(modules) { // webpackBootstrap
/******/  // The module cache
/******/  var installedModules = {};

/******/  // The require function
/******/  function __webpack_require__(moduleId) {

/******/    // Check if module is in cache
/******/    if(installedModules[moduleId])
/******/      return installedModules[moduleId].exports;

/******/    // Create a new module (and put it into the cache)
/******/    var module = installedModules[moduleId] = {
/******/      exports: {},
/******/      id: moduleId,
/******/      loaded: false
/******/    };

/******/    // Execute the module function
/******/    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/    // Flag the module as loaded
/******/    module.loaded = true;

/******/    // Return the exports of the module
/******/    return module.exports;
/******/  }


/******/  // expose the modules object (__webpack_modules__)
/******/  __webpack_require__.m = modules;

/******/  // expose the module cache
/******/  __webpack_require__.c = installedModules;

/******/  // __webpack_public_path__
/******/  __webpack_require__.p = "";

/******/  // Load entry module and return exports
/******/  return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

  /* global AFRAME */
  __webpack_require__(1);

  if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
  }

  /**
   * Tooltip component for A-Frame.
   */
  AFRAME.registerComponent('tooltip', {
    schema: {
      text: {default: ''},
      end: {type: 'vec3'},
      src: {default: ''},
      rotation: {type: 'vec3'},
      width: {default: 1, min: 0},
      height: {default: 1, min: 0},
      lineColor: {default: '#fff', type: 'color'},
      lineHorizontalAlign: {default: 'left', oneOf: ['left', 'right', 'center']},
      lineVerticalAlign: {default: 'center', oneOf: ['top', 'bottom', 'center']},
      opacity: {default: 1, min: 0, max: 1},
  /*
      targetType: {default: 'element', oneOf: ['element', 'position']},
      targetElement: {type: 'selector', if: {targetType: ['element']}},
  */
      targetPosition: {type: 'vec3', if: {targetType: ['position']}}
    },

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
      var el = this.el;
      var data = this.data;

      var quad = this.quad = document.createElement('a-entity');
      var self = this;

      quad.setAttribute('rotation', data.rotation);
      quad.setAttribute('text', {width: .25, color: '#fff', value: data.text, align: 'center'});
      el.appendChild(quad);

      // Line
      var material = this.material = new THREE.LineBasicMaterial({color: data.lineColor, opacity: data.opacity, transparent: data.opacity < 1});
      var geometry = this.geometry = new THREE.BufferGeometry();
      geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * 3), 3));

      this.line = new THREE.Line(geometry, material);
      this.el.setObject3D('tooltip-line', this.line);

    },

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */

     updateTooltip: (function () {
       var parentPosition = new THREE.Vector3();
       var targetPosition = new THREE.Vector3();
       var startPosition = new THREE.Vector3();

       return function () {
         var data = this.data;
         parentPosition.copy(this.el.getAttribute('position'));
         targetPosition.copy(data.targetPosition);

         var endPosition = targetPosition.sub(parentPosition);

         var data = this.data;
         var valign = {top: data.height / 2, bottom: -data.height / 2, center: 0};
         var halign = {left: -data.width / 2, right: data.width / 2, center: 0};

         var y = valign[data.lineVerticalAlign];
         var x = halign[data.lineHorizontalAlign];

         // Update geometry
         this.quad.object3D.updateMatrix();
         startPosition.set(x, y, 0);
         startPosition.applyMatrix4(this.quad.object3D.matrix);

         var pos = this.geometry.attributes.position.array;
         pos[0] = startPosition.x;
         pos[1] = startPosition.y;
         pos[2] = startPosition.z;
         pos[3] = endPosition.x;
         pos[4] = endPosition.y;
         pos[5] = endPosition.z;
         this.geometry.attributes.position.needsUpdate = true;

         this.material.opacity = data.opacity;
         this.material.transparent = data.opacity < 1;
         this.material.color.setStyle(data.color);
       }
     })(),

     update: function () {
       this.updateTooltip();
     }
   });


/***/ }),
/* 1 */
/***/ (function(module, exports) {

  /* global AFRAME */

  if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
  }

  /**
   * Slice9 component for A-Frame.
   */
  AFRAME.registerComponent('slice9', {
    schema: {
      width: {default: 1, min: 0},
      height: {default: 1, min: 0},
      left: {default: 0, min: 0},
      right: {default: 0, min: 0},
      bottom: {default: 0, min: 0},
      top: {default: 0, min: 0},
      side: {default: 'front', oneOf: ['front', 'back', 'double']},
      padding: {default: 0.1, min: 0.01},
      color: {type: 'color', default: '#fff'},
      opacity: {default: 1.0, min: 0, max: 1},
      transparent: {default: true},
      debug: {default: false},
      src: {type: 'map'}
    },

    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
      var data = this.data;
      var material = this.material = new THREE.MeshBasicMaterial({color: data.color, opacity: data.opacity, transparent: data.transparent, wireframe: data.debug});
      var geometry = this.geometry = new THREE.PlaneBufferGeometry(data.width, data.height, 3, 3);

      var textureLoader = new THREE.TextureLoader();
      this.plane = new THREE.Mesh(geometry, material);
      this.el.setObject3D('mesh', this.plane);
      this.textureSrc = null;
    },

    updateMap: function () {
      var src = this.data.src;

      if (src) {
        if (src === this.textureSrc) { return; }
        // Texture added or changed.
        this.textureSrc = src;
        this.el.sceneEl.systems.material.loadTexture(src, {src: src}, setMap.bind(this));
        return;
      }

      // Texture removed.
      if (!this.material.map) { return; }
      setMap(null);


      function setMap (texture) {
        this.material.map = texture;
        this.material.needsUpdate = true;
        this.regenerateMesh();
      }
    },

    regenerateMesh: function () {
      var data = this.data;
      var pos = this.geometry.attributes.position.array;
      var uvs = this.geometry.attributes.uv.array;
      var image = this.material.map.image;

      if (!image) {return;}

      /*
        0--1------------------------------2--3
        |  |                              |  |
        4--5------------------------------6--7
        |  |                              |  |
        |  |                              |  |
        |  |                              |  |
        8--9-----------------------------10--11
        |  |                              |  |
        12-13----------------------------14--15
      */
      function setPos(id, x, y) {
        pos[3 * id] = x;
        pos[3 * id + 1] = y;
      }

      function setUV(id, u, v) {
        uvs[2 * id] = u;
        uvs[2 * id + 1] = v;
      }

      // Update UVS
      var uv = {
        left: data.left / image.width,
        right: data.right / image.width,
        top: data.top / image.height,
        bottom: data.bottom / image.height
      };

      setUV(1,  uv.left,  1);
      setUV(2,  uv.right, 1);

      setUV(4,  0,        uv.bottom);
      setUV(5,  uv.left,  uv.bottom);
      setUV(6,  uv.right, uv.bottom);
      setUV(7,  1,        uv.bottom);

      setUV(8,  0,        uv.top);
      setUV(9,  uv.left,  uv.top);
      setUV(10, uv.right, uv.top);
      setUV(11, 1,        uv.top);

      setUV(13, uv.left,  0);
      setUV(14, uv.right, 0);

      // Update vertex positions
      var w2 = data.width / 2;
      var h2 = data.height / 2;
      var left = -w2 + data.padding;
      var right = w2 - data.padding;
      var top = h2 - data.padding;
      var bottom = -h2 + data.padding;

      setPos(0, -w2,    h2);
      setPos(1, left,   h2);
      setPos(2, right,  h2);
      setPos(3, w2,     h2);

      setPos(4, -w2,    top);
      setPos(5, left,   top);
      setPos(6, right,  top);
      setPos(7, w2,     top);

      setPos(8, -w2,    bottom);
      setPos(9, left,   bottom);
      setPos(10, right, bottom);
      setPos(11, w2,    bottom);

      setPos(13, left,  -h2);
      setPos(14, right, -h2);
      setPos(12, -w2,   -h2);
      setPos(15, w2,    -h2);

      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.uv.needsUpdate = true;
    },

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */
     update: function (oldData) {
       var data = this.data;

       this.material.color.setStyle(data.color);
       this.material.opacity = data.opacity;
       this.material.transparent = data.transparent;
       this.material.wireframe = data.debug;
       this.material.side = parseSide(data.side);

       var diff = AFRAME.utils.diff(data, oldData);
       if ('src' in diff) {
         this.updateMap();
       }
       else if ('width' in diff || 'height' in diff || 'padding' in diff || 'left' in diff || 'top' in diff || 'bottom' in diff || 'right' in diff) {
         this.regenerateMesh();
       }
     },

    /**
     * Called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     */
    remove: function () { },

    /**
     * Called on each scene tick.
     */
    // tick: function (t) { },

    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     */
    pause: function () { },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function () { }
  });

  function parseSide (side) {
    switch (side) {
      case 'back': {
        return THREE.BackSide;
      }
      case 'double': {
        return THREE.DoubleSide;
      }
      default: {
        // Including case `front`.
        return THREE.FrontSide;
      }
    }
  }


/***/ })
/******/ ]);
/* eslint-enable */
