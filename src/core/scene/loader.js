var components = require('../../core/component').components;
var THREE = require('../../lib/three');

var Loader = module.exports.Loader = function (sceneEl) {
  var camera = this.camera = new THREE.PerspectiveCamera();
  var geometry = this.geometry = this.getGeometry();
  var material = new THREE.LineBasicMaterial({ color: '#ef2d5e', linewidth: 2 });
  this.sceneEl = sceneEl;
  this.scene = new THREE.Scene();
  // save original clear color.
  this.rendererClearColor = sceneEl.renderer.getClearColor().getHexString();
  sceneEl.renderer.setClearColor(0x000000);
  camera.near = components.camera.schema.near.default;
  camera.far = components.camera.schema.far.default;
  camera.fov = components.camera.schema.fov.default;
  camera.position.set(0, 0, 2);
  sceneEl.addEventListener('renderstart', this.stop.bind(this));
  var mesh = this.mesh = new THREE.LineSegments(geometry, material);
  this.initParticules();
  this.initVertices();
  this.setVertices(this.cubeVertices);
  this.scene.add(mesh);
  this.render = this.render.bind(this);
  this.render();
};

Loader.prototype = {
  render: function (time) {
    var effect = this.sceneEl.effect;
    var timeDelta = time ? time - this.time : 0;
    if (this.stopped) { return; }

    effect.requestAnimationFrame(this.render);
    this.tick(time, timeDelta);
    this.sceneEl.renderer.clear();
    effect.render(this.scene, this.camera);
    this.time = time;
  },

  stop: function () {
    this.stopped = true;
    // Restore original clear color.
    this.sceneEl.renderer.setClearColor(this.rendererClearColor);
  },

  resize: function (size) {
    this.camera.aspect = size.width / size.height;
    this.camera.updateProjectionMatrix();
  },

  initVertices: function () {
    this.initCubeVertices();
    this.initPyramidVertices();
    this.initInterpolatedVertices();
  },

  initParticules: function () {
    var particles = new THREE.BufferGeometry();
    var particlePositions = this.particlePositions = new Float32Array(8 * 3);
    particles.addAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setDynamic(true));
    var material = new THREE.PointsMaterial({
      color: 'white',
      size: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: false
    });
    this.particles = new THREE.Points(particles, material);
    this.scene.add(this.particles);
  },

  rotateVertices: (function () {
    var axis = new THREE.Vector3(0, 0, 1);
    var vectors = [];
    vectors[0] = new THREE.Vector3();
    vectors[1] = new THREE.Vector3();
    vectors[2] = new THREE.Vector3();
    vectors[3] = new THREE.Vector3();
    vectors[4] = new THREE.Vector3();
    vectors[5] = new THREE.Vector3();
    vectors[6] = new THREE.Vector3();
    vectors[7] = new THREE.Vector3();
    return function (vertices, front, angle, previousAngle) {
      for (var i = 0; i < vertices.length; ++i) {
        if (vertices[i].z < 0 && front ||
            vertices[i].z > 0 && !front) { continue; }
        vertices[i].applyAxisAngle(axis, THREE.Math.DEG2RAD * angle);
      }
      return vectors;
    };
  })(),

  initInterpolatedVertices: function (radius) {
    var interpolatedVertices = this.interpolatedVertices = [];

    interpolatedVertices.push(new THREE.Vector3());
    interpolatedVertices.push(new THREE.Vector3());
    interpolatedVertices.push(new THREE.Vector3());
    interpolatedVertices.push(new THREE.Vector3());

    interpolatedVertices.push(new THREE.Vector3());
    interpolatedVertices.push(new THREE.Vector3());
    interpolatedVertices.push(new THREE.Vector3());
    interpolatedVertices.push(new THREE.Vector3());
  },

  initCubeVertices: function (radius) {
    var k;
    var cubeVertices = this.cubeVertices = [];

    if (typeof radius === 'undefined') { radius = 0.5; }
    k = radius / Math.sqrt(3);

    cubeVertices.push(new THREE.Vector3(k, k, k));
    cubeVertices.push(new THREE.Vector3(k, k, -k));
    cubeVertices.push(new THREE.Vector3(-k, k, -k));
    cubeVertices.push(new THREE.Vector3(-k, k, k));

    cubeVertices.push(new THREE.Vector3(k, -k, k));
    cubeVertices.push(new THREE.Vector3(k, -k, -k));
    cubeVertices.push(new THREE.Vector3(-k, -k, -k));
    cubeVertices.push(new THREE.Vector3(-k, -k, k));
  },

  initPyramidVertices: function (radius) {
    var k;
    var pyramidVertices = this.pyramidVertices = [];
    if (typeof radius === 'undefined') { radius = 1; }
    k = radius / Math.sqrt(3);
    pyramidVertices.push(new THREE.Vector3(0, k, 0));
    pyramidVertices.push(new THREE.Vector3(0, k, 0));
    pyramidVertices.push(new THREE.Vector3(0, k, 0));
    pyramidVertices.push(new THREE.Vector3(0, k, 0));

    pyramidVertices.push(new THREE.Vector3(k, -k, k));
    pyramidVertices.push(new THREE.Vector3(k, -k, -k));
    pyramidVertices.push(new THREE.Vector3(-k, -k, -k));
    pyramidVertices.push(new THREE.Vector3(-k, -k, k));
  },

  setVertices: function (vertices) {
    var positions = this.positions;
    var particlePositions = this.particlePositions;
    var particuleVertexPosition = 0;
    var vertexPosition = 0;

    // Particles
    particlePositions[particuleVertexPosition++] = vertices[0].x;
    particlePositions[particuleVertexPosition++] = vertices[0].y;
    particlePositions[particuleVertexPosition++] = vertices[0].z;

    particlePositions[particuleVertexPosition++] = vertices[1].x;
    particlePositions[particuleVertexPosition++] = vertices[1].y;
    particlePositions[particuleVertexPosition++] = vertices[1].z;

    particlePositions[particuleVertexPosition++] = vertices[2].x;
    particlePositions[particuleVertexPosition++] = vertices[2].y;
    particlePositions[particuleVertexPosition++] = vertices[2].z;

    particlePositions[particuleVertexPosition++] = vertices[3].x;
    particlePositions[particuleVertexPosition++] = vertices[3].y;
    particlePositions[particuleVertexPosition++] = vertices[3].z;

    particlePositions[particuleVertexPosition++] = vertices[4].x;
    particlePositions[particuleVertexPosition++] = vertices[4].y;
    particlePositions[particuleVertexPosition++] = vertices[4].z;

    particlePositions[particuleVertexPosition++] = vertices[5].x;
    particlePositions[particuleVertexPosition++] = vertices[5].y;
    particlePositions[particuleVertexPosition++] = vertices[5].z;

    particlePositions[particuleVertexPosition++] = vertices[6].x;
    particlePositions[particuleVertexPosition++] = vertices[6].y;
    particlePositions[particuleVertexPosition++] = vertices[6].z;

    particlePositions[particuleVertexPosition++] = vertices[7].x;
    particlePositions[particuleVertexPosition++] = vertices[7].y;
    particlePositions[particuleVertexPosition++] = vertices[7].z;

    // Cube

    // Top
    positions[vertexPosition++] = vertices[0].x;
    positions[vertexPosition++] = vertices[0].y;
    positions[vertexPosition++] = vertices[0].z;

    positions[vertexPosition++] = vertices[1].x;
    positions[vertexPosition++] = vertices[1].y;
    positions[vertexPosition++] = vertices[1].z;

    positions[vertexPosition++] = vertices[1].x;
    positions[vertexPosition++] = vertices[1].y;
    positions[vertexPosition++] = vertices[1].z;

    positions[vertexPosition++] = vertices[2].x;
    positions[vertexPosition++] = vertices[2].y;
    positions[vertexPosition++] = vertices[2].z;

    positions[vertexPosition++] = vertices[2].x;
    positions[vertexPosition++] = vertices[2].y;
    positions[vertexPosition++] = vertices[2].z;

    positions[vertexPosition++] = vertices[3].x;
    positions[vertexPosition++] = vertices[3].y;
    positions[vertexPosition++] = vertices[3].z;

    positions[vertexPosition++] = vertices[3].x;
    positions[vertexPosition++] = vertices[3].y;
    positions[vertexPosition++] = vertices[3].z;

    positions[vertexPosition++] = vertices[0].x;
    positions[vertexPosition++] = vertices[0].y;
    positions[vertexPosition++] = vertices[0].z;

    // Bottom
    positions[vertexPosition++] = vertices[4].x;
    positions[vertexPosition++] = vertices[4].y;
    positions[vertexPosition++] = vertices[4].z;

    positions[vertexPosition++] = vertices[5].x;
    positions[vertexPosition++] = vertices[5].y;
    positions[vertexPosition++] = vertices[5].z;

    positions[vertexPosition++] = vertices[5].x;
    positions[vertexPosition++] = vertices[5].y;
    positions[vertexPosition++] = vertices[5].z;

    positions[vertexPosition++] = vertices[6].x;
    positions[vertexPosition++] = vertices[6].y;
    positions[vertexPosition++] = vertices[6].z;

    positions[vertexPosition++] = vertices[6].x;
    positions[vertexPosition++] = vertices[6].y;
    positions[vertexPosition++] = vertices[6].z;

    positions[vertexPosition++] = vertices[7].x;
    positions[vertexPosition++] = vertices[7].y;
    positions[vertexPosition++] = vertices[7].z;

    positions[vertexPosition++] = vertices[7].x;
    positions[vertexPosition++] = vertices[7].y;
    positions[vertexPosition++] = vertices[7].z;

    positions[vertexPosition++] = vertices[4].x;
    positions[vertexPosition++] = vertices[4].y;
    positions[vertexPosition++] = vertices[4].z;

    // Sides
    positions[vertexPosition++] = vertices[0].x;
    positions[vertexPosition++] = vertices[0].y;
    positions[vertexPosition++] = vertices[0].z;

    positions[vertexPosition++] = vertices[4].x;
    positions[vertexPosition++] = vertices[4].y;
    positions[vertexPosition++] = vertices[4].z;

    positions[vertexPosition++] = vertices[1].x;
    positions[vertexPosition++] = vertices[1].y;
    positions[vertexPosition++] = vertices[1].z;

    positions[vertexPosition++] = vertices[5].x;
    positions[vertexPosition++] = vertices[5].y;
    positions[vertexPosition++] = vertices[5].z;

    positions[vertexPosition++] = vertices[2].x;
    positions[vertexPosition++] = vertices[2].y;
    positions[vertexPosition++] = vertices[2].z;

    positions[vertexPosition++] = vertices[6].x;
    positions[vertexPosition++] = vertices[6].y;
    positions[vertexPosition++] = vertices[6].z;

    positions[vertexPosition++] = vertices[3].x;
    positions[vertexPosition++] = vertices[3].y;
    positions[vertexPosition++] = vertices[3].z;

    positions[vertexPosition++] = vertices[7].x;
    positions[vertexPosition++] = vertices[7].y;
    positions[vertexPosition++] = vertices[7].z;
  },

  tick: (function () {
    var alpha = 0.0;
    var alphaPre = 0.0;
    // var to = 'pyramid';
    // var big = new THREE.Vector3(1, 1, 1);
    // var small = new THREE.Vector3(0.95, 0.95, 0.95);
    // var scaleTo = small;
    var animate = false;
    var animatePre = false;
    // var alphaAngle;
    // var alphaAnglePre;
    // var front = false;
    var angle = 0;
    var anglePre = 0;
    // var prev = 0;
    return function (time, delta) {
      // var fromVertices = to === 'pyramid' ? this.cubeVertices : this.pyramidVertices;
      // var toVertices = to === 'pyramid' ? this.pyramidVertices : this.cubeVertices;
      // alpha += delta / 1000;
      // if (alpha > 1.0) {
      //   to = to === 'pyramid' ? 'cube' : 'pyramid';
      //   alpha = 0.0;
      //   return;
      // }

      // this.interpolateVertices(fromVertices, toVertices, alpha)
      this.setVertices(this.cubeVertices);

      var scaleTime = (time / 1500 % 1.5);
      var newScale = 1.0 + 0.15 * Math.sin(scaleTime * 6.2831 * 3.0) * Math.exp(-scaleTime * 4.0);
      if (newScale > 1.1 || animate) {
        if (newScale > 1.1) {
          animate = true;
        }
        this.rotateVertices(this.cubeVertices, false, angle / 10);
        // prev = alpha;
        alpha += delta;
        angle += alpha > 45 * 10 ? 0 : delta;
        this.rotateVertices(this.cubeVertices, false, -angle / 10);
        this.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.position.needsUpdate = true;
        if (alpha / 10 > 45) {
          alpha = 0;
          animate = false;
        }
      }

      if (newScale < 0.95 || animatePre) {
        if (newScale < 0.95) {
          animatePre = true;
        }
        this.rotateVertices(this.cubeVertices, true, anglePre / 10);
        // prev = alphaPre;
        alphaPre += delta;
        anglePre += alphaPre > 45 * 10 ? 0 : delta;
        this.rotateVertices(this.cubeVertices, true, -anglePre / 10);
        this.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.position.needsUpdate = true;
        if (alphaPre / 10 > 45) {
          alphaPre = 0;
          animatePre = false;
        }
      }

      this.mesh.scale.set(newScale, newScale, newScale);
      this.particles.scale.set(newScale, newScale, newScale);
    };
  })(),

  interpolateVertices: (function () {
    var auxVertex = new THREE.Vector3();
    return function (fromVertices, toVertices, alpha) {
      var interpolatedVertices = this.interpolatedVertices;
      for (var i = 0; i < interpolatedVertices.length; ++i) {
        interpolatedVertices[i].copy(auxVertex.copy(fromVertices[i]).lerp(toVertices[i], alpha));
      }
    };
  })(),

  getGeometry: function (radius) {
    var geometry = new THREE.BufferGeometry();
    var positions = this.positions = new Float32Array(24 * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3).setDynamic(true));
    return geometry;
  }
};
