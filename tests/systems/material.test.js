/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('material system', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    var self = this;
    el.addEventListener('loaded', function () {
      self.system = el.sceneEl.systems.material;
      done();
    });
  });

  suite('createShader', function () {
    test('registers shader', function () {
      var shader;
      var system = this.system;
      assert.equal(system.shaders.indexOf(shader), -1);
      shader = system.createShader(this.el, {shader: 'flat'});
      assert.notEqual(system.shaders.indexOf(shader), -1);
    });
  });

  suite('unuseShader', function () {
    test('unregisters shader', function () {
      var system = this.system;
      var shader;
      shader = system.createShader(this.el, {shader: 'flat'});
      assert.notEqual(system.shaders.indexOf(shader), -1);
      system.unuseShader(shader);
      assert.equal(system.shaders.indexOf(shader), -1);
    });
  });
});
