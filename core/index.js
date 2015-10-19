var modules = {
  'vr-template': require('./vr-template'),
  'vr-cube': require('./templates/vr-cube.html')
};

// Inline all HTML templates so we don't have to slowly import them all.
document.addEventListener('vr-markup-ready', function () {
  var vrSceneEl = document.querySelector('vr-scene');
  Object.keys(modules).forEach(function (key) {
    if (typeof modules[key] === 'string') {
      vrSceneEl.insertAdjacentHTML('afterend', modules[key]);
    }
  });
});

module.exports = modules;
