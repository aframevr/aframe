/* global THREE */
var utils = require('../../utils/');
var styleParser = utils.styleParser;

var sceneEl;
var titleEl;
var getSceneCanvasSize;

var ATTR_NAME = 'loading-screen';
var LOADER_TITLE_CLASS = 'a-loader-title';

module.exports.setup = function setup (el, getCanvasSize) {
  sceneEl = el;
  getSceneCanvasSize = getCanvasSize;
  var loaderAttribute = sceneEl.hasAttribute(ATTR_NAME) ? styleParser.parse(sceneEl.getAttribute(ATTR_NAME)) : undefined;
  var dotsColor = loaderAttribute && loaderAttribute.dotsColor || 'white';
  var backgroundColor = loaderAttribute && loaderAttribute.backgroundColor || '#24CAFF';
  var loaderEnabled = loaderAttribute === undefined || loaderAttribute.enabled === 'true' || loaderAttribute.enabled === undefined; // true default
  var loaderScene;
  var sphereGeometry;
  var sphereMaterial;
  var sphereMesh1;
  var sphereMesh2;
  var sphereMesh3;
  var camera;
  var clock;
  var time;
  var render;

  if (!loaderEnabled) { return; }

  // Setup Scene.
  loaderScene = new THREE.Scene();
  sphereGeometry = new THREE.SphereGeometry(0.20, 36, 18, 0, 2 * Math.PI, 0, Math.PI);
  sphereMaterial = new THREE.MeshBasicMaterial({color: dotsColor});
  sphereMesh1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh2 = sphereMesh1.clone();
  sphereMesh3 = sphereMesh1.clone();
  camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.0005, 10000);
  clock = new THREE.Clock();
  time = 0;
  render = function () {
    sceneEl.renderer.render(loaderScene, camera);
    time = clock.getElapsedTime() % 4;
    sphereMesh1.visible = time >= 1;
    sphereMesh2.visible = time >= 2;
    sphereMesh3.visible = time >= 3;
  };

  loaderScene.background = new THREE.Color(backgroundColor);
  loaderScene.add(camera);
  sphereMesh1.position.set(-1, 0, -15);
  sphereMesh2.position.set(0, 0, -15);
  sphereMesh3.position.set(1, 0, -15);
  camera.add(sphereMesh1);
  camera.add(sphereMesh2);
  camera.add(sphereMesh3);
  setupTitle();

  // Delay 200ms to avoid loader flashes.
  setTimeout(function () {
    if (sceneEl.hasLoaded) { return; }
    resize(camera);
    titleEl.style.display = 'block';
    window.addEventListener('resize', function () { resize(camera); });
    sceneEl.renderer.setAnimationLoop(render);
  }, 200);
};

module.exports.remove = function remove () {
  window.removeEventListener('resize', resize);
  if (!titleEl) { return; }
  // Hide title.
  titleEl.style.display = 'none';
};

function resize (camera) {
  var embedded = sceneEl.hasAttribute('embedded');
  var size = getSceneCanvasSize(sceneEl.canvas, embedded, sceneEl.maxCanvasSize, sceneEl.is('vr-mode'));
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
   // Notify renderer of size change.
  sceneEl.renderer.setSize(size.width, size.height, false);
}

function setupTitle () {
  titleEl = document.createElement('div');
  titleEl.className = LOADER_TITLE_CLASS;
  titleEl.innerHTML = document.title;
  titleEl.style.display = 'none';
  sceneEl.appendChild(titleEl);
}
