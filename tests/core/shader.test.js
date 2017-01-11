/* global AFRAME, assert, process, setup, suite, test, teardown */
var entityFactory = require('../helpers').entityFactory;

var VIDEO = 'base/tests/assets/test.mp4';

suite('shader', function () {
  setup(function (done) {
    this.el = entityFactory();
    if (this.el.hasLoaded) { done(); } else { this.el.addEventListener('loaded', function () { done(); }); }
  });

  teardown(function () {
    var el = this.el;
    if (el.components.material) { el.components.material.remove(); }
    if (AFRAME.shaders['test-shader']) delete AFRAME.shaders['test-shader'];
  });

  suite('registerShader', function () {
    setup(function () {
      this.shader = AFRAME.registerShader('test-shader', {});
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

    test('shader instance receives methods and properties', function () {
      var shader = this.shader;
      var el = this.el;
      el.setAttribute('material', 'shader:test-shader');
      var material = el.components.material;
      var instance = material.shader;
      assert.ok(material);
      assert.ok(instance);
      assert.equal(instance.init, shader.prototype.init);
      assert.equal(instance.update, shader.prototype.update);
      assert.equal(instance.vertexShader, shader.prototype.vertexShader);
      assert.equal(instance.fragmentShader, shader.prototype.fragmentShader);
      assert.equal(Object.keys(instance.uniforms).length, 0);
      assert.equal(Object.keys(instance.attributes).length, 0);
      assert.ok(instance.material);
    });

    test('shader instance called init and update', function () {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      el.setAttribute('material', 'shader:test-shader');
      var material = el.components.material;
      var instance = material.shader;
      assert.ok(material);
      assert.ok(instance);
      assert.ok(initSpy.calledOnce);
      assert.ok(updateSpy.calledOnce);
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
      if (el.hasLoaded) { done(); } else { el.addEventListener('loaded', function () { done(); }); }
    });

    teardown(function () {
      var el = this.el;
      if (el.components.material) { el.components.material.remove(); }
      if (AFRAME.shaders['test-shader']) delete AFRAME.shaders['test-shader'];
    });

    test('src parameter of type map --> uniform src, not attribute', function () {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      el.setAttribute('material', 'shader:test-shader');
      var material = el.components.material;
      var instance = material.shader;
      assert.ok(instance);
      assert.ok(initSpy.calledOnce);
      assert.ok(updateSpy.calledOnce);
      // the value won't be assigned until the texture loads
      assert.ok(instance.uniforms['src']);
      assert.notOk(instance.attributes && (instance.attributes['map'] || instance.attributes['src']));
    });

    test('src loads inline video', function (done) {
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
        assert.equal(instance.material['_texture_src'].image.getAttribute('src'), VIDEO);
        done();
      });
      el.setAttribute('material', 'shader:test-shader; src:' + VIDEO);
      var material = el.components.material;
      var instance = material.shader;
      assert.ok(instance);
      assert.ok(initSpy.calledOnce);
      assert.ok(updateSpy.calledOnce);
      // the value won't be assigned until the texture loads
      assert.ok(instance.uniforms['src']);
      assert.notOk(instance.attributes && (instance.attributes['map'] || instance.attributes['src']));
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
        assert.equal(instance.material['_texture_' + 'otherMap'].image.getAttribute('src'), VIDEO);
        done();
      });
      el.setAttribute('material', 'shader:test-shader; otherMap:' + VIDEO);
      var material = el.components.material;
      var instance = material.shader;
      assert.ok(instance);
      assert.ok(initSpy.calledOnce);
      assert.ok(updateSpy.calledOnce);
      assert.ok(instance.uniforms['otherMap']);
      // the value won't be assigned until the texture loads
      assert.notOk(instance.attributes && instance.attributes['otherMap']);
    });

    test('vec2Uniform parameter --> uniform vec2Uniform, not attribute', function () {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      el.setAttribute('material', 'shader:test-shader');
      var material = el.components.material;
      var instance = material.shader;
      assert.ok(instance);
      assert.ok(initSpy.calledOnce);
      assert.ok(updateSpy.calledOnce);
      assert.ok(instance.uniforms['vec2Uniform']);
      assert.equal(instance.uniforms['vec2Uniform'].value.x, 1); // fails, why?
      assert.equal(instance.uniforms['vec2Uniform'].value.y, 2); // fails, why?
      assert.notOk(instance.attributes['vec2Uniform']);
    });

    test('vec2Attribute parameter --> attribute vec2Attribute, not uniform', function () {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      el.setAttribute('material', 'shader:test-shader');
      var material = el.components.material;
      var instance = material.shader;
      assert.ok(instance);
      assert.ok(initSpy.calledOnce);
      assert.ok(updateSpy.calledOnce);
      assert.ok(instance.attributes['vec2Attribute']);
      assert.equal(instance.attributes['vec2Attribute'].value.x, 3);
      assert.equal(instance.attributes['vec2Attribute'].value.y, 4);
      assert.notOk(instance.uniforms['vec2Attribute']);
    });

    test('vec2Neither parameter --> neither uniform nor attribute', function () {
      var shader = this.shader;
      var el = this.el;
      var initSpy = this.sinon.spy(shader.prototype, 'init');
      var updateSpy = this.sinon.spy(shader.prototype, 'update');
      assert.notOk(initSpy.called);
      assert.notOk(updateSpy.called);
      el.setAttribute('material', 'shader:test-shader');
      var material = el.components.material;
      var instance = material.shader;
      assert.ok(instance);
      assert.ok(initSpy.calledOnce);
      assert.ok(updateSpy.calledOnce);
      assert.notOk(instance.attributes['vec2Neither']);
      assert.notOk(instance.uniforms['vec2Neither']);
    });
  });
});
