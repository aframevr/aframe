var register = require('../../core/component').registerComponent;
var Wakelock = require('../../../vendor/wakelock/wakelock');

module.exports.Component = register('wakelock', {
  dependencies: [ 'vr-mode' ],

  init: function () {
    var scene = this.el;
    if (!scene.isMobile) { return; }

    var wakelock = scene.wakelock = new Wakelock();
    scene.addEventListener('enter-vr', function () { wakelock.request(); });
    scene.addEventListener('exit-vr', function () { wakelock.release(); });
  }
});
