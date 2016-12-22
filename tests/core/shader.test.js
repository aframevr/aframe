/* global AFRAME */
/* global assert, process, setup, suite, test, teardown */
var entityFactory = require('../helpers').entityFactory;
var componentName = 'shader';

var VIDEO = 'https://ucarecdn.com/bcece0a8-86ce-460e-856b-40dac4875f15/'; // 'base/tests/assets/test.mp4';

function isEmpty (map) {
  for (var key in map) {
    return !map.hasOwnProperty(key);
  }
  return true;
}

suite(componentName, function () {
  setup(function (done) {
    this.el = entityFactory();
    done();
  });

  teardown(function (done) {
    var el = this.el;
    process.nextTick(function () {
      if (el.components.material) { el.components.material.remove(); }
      if (AFRAME.shaders['test-shader']) delete AFRAME.shaders['test-shader'];
      process.nextTick(function () {
        done();
      });
    });
  });

  suite('registerShader', function () {
    setup(function (done) {
      this.shader = AFRAME.registerShader('test-shader', {});
      done();
    });

    test('shader prototype default methods and properties', function () {
      var shader = this.shader;
      assert.ok(shader);
      assert.ok(shader.prototype.init);
      assert.ok(shader.prototype.update);
      assert.ok(shader.prototype.vertexShader);
      assert.ok(shader.prototype.fragmentShader);
      assert.notOk(shader.prototype.uniforms);
      assert.notOk(shader.prototype.attributes);
    });

    test('shader instance receives methods and properties', function (done) {
      var shader = this.shader;
      var el = this.el;
      el.setAttribute('material', 'shader:test-shader');
      process.nextTick(function () {
        var material = el.components.material;
        var instance = material.shader;
        assert.ok(material);
        assert.ok(instance);
        assert.equal(instance.init, shader.prototype.init);
        assert.equal(instance.update, shader.prototype.update);
        assert.equal(instance.vertexShader, shader.prototype.vertexShader);
        assert.equal(instance.fragmentShader, shader.prototype.fragmentShader);
        assert.ok(isEmpty(instance.uniforms));
        assert.ok(isEmpty(instance.attributes));
        assert.ok(instance.material);
        done();
      });
    });

    test('shader instance called init and update', function (done) {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      el.setAttribute('material', 'shader:test-shader');
      process.nextTick(function () {
        var material = el.components.material;
        var instance = material.shader;
        assert.ok(material);
        assert.ok(instance);
        assert.ok(initSpy.calledOnce);
        assert.ok(updateSpy.calledOnce);
        done();
      });
    });
  });

  suite('data binding', function () {
    setup(function (done) {
      var el = this.el;
      this.shader = AFRAME.registerShader('test-shader', {
        schema: {
          src: {type: 'map', is: 'uniform'},
          otherMap: {type: 'map', is: 'uniform'},
          vec2Uniform: {type: 'vec2', default: {x: 1, y: 2}, is: 'uniform'},
          vec2Attribute: {type: 'vec2', default: {x: 3, y: 4}, is: 'attribute'},
          vec2Neither: {type: 'vec2', default: {x: 5, y: 6}}
        }
      });
      if (el.hasLoaded) { done(); }
      el.addEventListener('loaded', function () {
        done();
      });
    });

    teardown(function (done) {
      var el = this.el;
      process.nextTick(function () {
        if (el.components.material) { el.components.material.remove(); }
        if (AFRAME.shaders['test-shader']) delete AFRAME.shaders['test-shader'];
        process.nextTick(function () {
          done();
        });
      });
    });

    test('src parameter of type map --> uniform map, not attribute', function (done) {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      el.setAttribute('material', 'shader:test-shader');
      process.nextTick(function () {
        var material = el.components.material;
        var instance = material.shader;
        assert.ok(instance);
        assert.ok(initSpy.calledOnce);
        assert.ok(updateSpy.calledOnce);
        assert.ok(instance.uniforms['map']);
        // the value won't be assigned until the texture loads
        assert.notOk(instance.uniforms['src']);
        assert.notOk(instance.attributes && instance.attributes['map']);
        done();
      });
    });

    test('src --> map loads inline video', function (done) {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      // With Travis CI, the actual videos are never loaded,
      // so check for materialtextureloaded not materialvideoloadeddata,
      // and don't try to assert the uniform values
      el.addEventListener('materialtextureloaded', function () {
        var material = el.components.material;
        var instance = material.shader;
        // assert.ok(instance.uniforms['map'].value);
        assert.equal(instance.material.map.image.getAttribute('src'), VIDEO);
        done();
      });
      el.setAttribute('material', 'shader:test-shader; src:' + VIDEO);
      process.nextTick(function () {
        var material = el.components.material;
        var instance = material.shader;
        assert.ok(instance);
        assert.ok(initSpy.calledOnce);
        assert.ok(updateSpy.calledOnce);
        assert.ok(instance.uniforms['map']);
        // the value won't be assigned until the texture loads
        assert.notOk(instance.uniforms['src']);
        assert.notOk(instance.attributes && instance.attributes['map']);
      });
    });

    test('otherMap loads inline video', function (done) {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      // With Travis CI, the actual videos are never loaded,
      // so check for materialtextureloaded not materialvideoloadeddata,
      // and don't try to assert the uniform values
      el.addEventListener('materialtextureloaded', function () {
        var material = el.components.material;
        var instance = material.shader;
        // assert.ok(instance.uniforms['otherMap'].value);
        assert.equal(instance.material['_texture_' + 'otherMap'].image.getAttribute('src'), VIDEO);
        done();
      });
      el.setAttribute('material', 'shader:test-shader; otherMap:' + VIDEO);
      process.nextTick(function () {
        var material = el.components.material;
        var instance = material.shader;
        assert.ok(instance);
        assert.ok(initSpy.calledOnce);
        assert.ok(updateSpy.calledOnce);
        assert.ok(instance.uniforms['otherMap']);
        // the value won't be assigned until the texture loads
        assert.notOk(instance.attributes && instance.attributes['otherMap']);
      });
    });

    test('vec2Uniform parameter --> uniform vec2Uniform, not attribute', function (done) {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      el.setAttribute('material', 'shader:test-shader');
      process.nextTick(function () {
        var material = el.components.material;
        var instance = material.shader;
        assert.ok(instance);
        assert.ok(initSpy.calledOnce);
        assert.ok(updateSpy.calledOnce);
        process.nextTick(function () {
          assert.ok(instance.uniforms['vec2Uniform']);
          assert.equal(instance.uniforms['vec2Uniform'].value.x, 1); // fails, why?
          assert.equal(instance.uniforms['vec2Uniform'].value.y, 2); // fails, why?
          assert.notOk(instance.attributes['vec2Uniform']);
          done();
        });
      });
    });

    test('vec2Attribute parameter --> attribute vec2Attribute, not uniform', function (done) {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      el.setAttribute('material', 'shader:test-shader');
      process.nextTick(function () {
        var material = el.components.material;
        var instance = material.shader;
        assert.ok(instance);
        assert.ok(initSpy.calledOnce);
        assert.ok(updateSpy.calledOnce);
        process.nextTick(function () {
          assert.ok(instance.attributes['vec2Attribute']);
          assert.equal(instance.attributes['vec2Attribute'].value.x, 3);
          assert.equal(instance.attributes['vec2Attribute'].value.y, 4);
          assert.notOk(instance.uniforms['vec2Attribute']);
          done();
        });
      });
    });

    test('vec2Neither parameter --> neither uniform nor attribute', function (done) {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      el.setAttribute('material', 'shader:test-shader');
      process.nextTick(function () {
        var material = el.components.material;
        var instance = material.shader;
        assert.ok(instance);
        assert.ok(initSpy.calledOnce);
        assert.ok(updateSpy.calledOnce);
        process.nextTick(function () {
          assert.notOk(instance.attributes['vec2Neither']);
          assert.notOk(instance.uniforms['vec2Neither']);
          done();
        });
      });
    });
  });
});
