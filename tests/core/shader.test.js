/* global AFRAME, assert, process, setup, suite, test, teardown */
const entityFactory = require('../helpers').entityFactory;

const THREE = require('lib/three');
const VIDEO = 'base/tests/assets/test.mp4';

suite('shader', function () {
  var el;

  setup(function (done) {
    el = entityFactory();
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () { done(); });
  });

  teardown(function () {
    el.removeAttribute('material');
    if (el.components.material) { el.components.material.remove(); }
    if (AFRAME.shaders.testShader) { delete AFRAME.shaders.testShader; }
  });

  suite('registerShader', function () {
    var shader;

    setup(function () {
      shader = AFRAME.registerShader('testShader', {});
    });

    test('shader prototype default methods and properties', function () {
      assert.ok(shader);
      assert.ok(shader.prototype.init);
      assert.ok(shader.prototype.update);
      assert.ok(shader.prototype.vertexShader);
      assert.ok(shader.prototype.fragmentShader);
      assert.notOk(shader.prototype.uniforms);
      assert.notOk(shader.prototype.attributes);
    });

    test('shader instance receives methods and properties', function () {
      el.setAttribute('material', 'shader: testShader');
      const material = el.components.material;
      const instance = material.shader;
      assert.ok(material);
      assert.ok(instance);
      assert.ok(instance.material instanceof THREE.ShaderMaterial);
      assert.notOk(instance.material instanceof THREE.RawShaderMaterial);
      assert.equal(instance.init, shader.prototype.init);
      assert.equal(instance.update, shader.prototype.update);
      assert.equal(instance.vertexShader, shader.prototype.vertexShader);
      assert.equal(instance.fragmentShader, shader.prototype.fragmentShader);
      assert.equal(Object.keys(instance.uniforms).length, 0);
      assert.equal(Object.keys(instance.attributes).length, 0);
      assert.ok(instance.material);
    });

    test('shader instance called init and update', function () {
      const initSpy = this.sinon.spy(shader.prototype, 'init');
      const updateSpy = this.sinon.spy(shader.prototype, 'update');
      el.setAttribute('material', 'shader: testShader');
      const material = el.components.material;
      const instance = material.shader;
      assert.ok(material, 'material');
      assert.ok(instance, 'shader');
      assert.ok(initSpy.calledOnce, 'init called once');
      assert.ok(updateSpy.calledOnce, 'update called once');
    });
  });

  suite('raw shader support', function () {
    setup(function () {
      this.shader = AFRAME.registerShader('testShader', {raw: true});
    });

    test('shader instance receives methods and properties', function () {
      el.setAttribute('material', 'shader: testShader');
      const material = el.components.material;
      const instance = material.shader;
      assert.ok(material);
      assert.ok(instance);
      assert.ok(instance.material instanceof THREE.RawShaderMaterial);
    });
  });
});

suite('shader data binding', function () {
  var el;
  var initSpy;
  var shader;
  var updateSpy;

  setup(function (done) {
    AFRAME.registerShader('testShader', {
      schema: {
        src: {type: 'map', is: 'uniform'},
        otherMap: {type: 'map', is: 'uniform'},
        vec2Uniform: {type: 'vec2', default: {x: 1, y: 2}, is: 'uniform'},
        vec2Attribute: {type: 'vec2', default: {x: 3, y: 4}, is: 'attribute'},
        vec2Neither: {type: 'vec2', default: {x: 5, y: 6}}
      }
    });

    shader = AFRAME.shaders.testShader.Shader;
    initSpy = this.sinon.spy(shader.prototype, 'init');
    updateSpy = this.sinon.spy(shader.prototype, 'update');

    el = entityFactory();
    if (el.hasLoaded) { done(); }
    el.addEventListener('loaded', function () {
      done();
    });
  });

  teardown(function () {
    el.removeAttribute('material');
    if (AFRAME.shaders.testShader) { delete AFRAME.shaders.testShader; }
  });

  test('src parameter of type map is uniform', function () {
    assert.notOk(initSpy.called);
    assert.notOk(updateSpy.called);
    el.setAttribute('material', 'shader: testShader');
    const material = el.components.material;
    const instance = material.shader;
    assert.ok(instance);
    assert.ok(initSpy.calledOnce);
    assert.ok(updateSpy.calledOnce);
    // The value won't be assigned until the texture loads.
    assert.ok(instance.uniforms['src']);
    assert.notOk(instance.attributes && (instance.attributes['map'] ||
                                         instance.attributes['src']));
  });

  test('src loads inline video', function (done) {
    assert.notOk(initSpy.called);
    assert.notOk(updateSpy.called);
    // With Travis CI, the actual videos are never loaded,
    // so check for materialtextureloaded not materialvideoloadeddata,
    // and don't try to assert the uniform values
    el.addEventListener('materialtextureloaded', materialTextureLoaded);
    function materialTextureLoaded () {
      const material = el.components.material;
      const instance = material.shader;
      assert.equal(instance.material['_texture_src'].image.getAttribute('src'), VIDEO);
      el.removeEventListener('materialtextureloaded', materialTextureLoaded);
      done();
    }
    el.setAttribute('material', 'shader: testShader; src:' + VIDEO);
    const material = el.components.material;
    const instance = material.shader;
    assert.ok(instance);
    assert.ok(initSpy.calledOnce);
    assert.ok(updateSpy.calledOnce);
    // The value won't be assigned until the texture loads.
    assert.ok(instance.uniforms['src']);
    assert.notOk(instance.attributes && (instance.attributes['map'] ||
                                         instance.attributes['src']));
  });

  test('otherMap loads inline video', function (done) {
    assert.notOk(initSpy.called);
    assert.notOk(updateSpy.called);
    // With Travis CI, the actual videos are never loaded,
    // so check for materialtextureloaded not materialvideoloadeddata,
    // and don't try to assert the uniform values.
    el.addEventListener('materialtextureloaded', materialTextureLoaded);
    function materialTextureLoaded () {
      const material = el.components.material;
      const instance = material.shader;
      assert.equal(instance.material['_texture_' + 'otherMap'].image.getAttribute('src'),
                   VIDEO);
      el.removeEventListener('materialtextureloaded', materialTextureLoaded);
      done();
    }
    el.setAttribute('material', 'shader: testShader; otherMap:' + VIDEO);
    const material = el.components.material;
    const instance = material.shader;
    assert.ok(instance);
    assert.ok(initSpy.calledOnce);
    assert.ok(updateSpy.calledOnce);
    assert.ok(instance.uniforms['otherMap']);
    // The value won't be assigned until the texture loads.
    assert.notOk(instance.attributes && instance.attributes['otherMap']);
  });

  test('vec2Uniform parameter is uniform', function () {
    assert.notOk(initSpy.called);
    assert.notOk(updateSpy.called);
    el.setAttribute('material', 'shader: testShader');
    const material = el.components.material;
    const instance = material.shader;
    assert.ok(instance);
    assert.ok(initSpy.calledOnce);
    assert.ok(updateSpy.calledOnce);
    assert.ok(instance.uniforms['vec2Uniform']);
    assert.equal(instance.uniforms['vec2Uniform'].value.x, 1);
    assert.equal(instance.uniforms['vec2Uniform'].value.y, 2);
    assert.notOk(instance.attributes['vec2Uniform']);
  });

  test('vec2Attribute parameter is attribute', function () {
    assert.notOk(initSpy.called);
    assert.notOk(updateSpy.called);
    el.setAttribute('material', 'shader: testShader');
    const material = el.components.material;
    const instance = material.shader;
    assert.ok(instance);
    assert.ok(initSpy.calledOnce);
    assert.ok(updateSpy.calledOnce);
    assert.ok(instance.attributes['vec2Attribute']);
    assert.equal(instance.attributes['vec2Attribute'].value.x, 3);
    assert.equal(instance.attributes['vec2Attribute'].value.y, 4);
    assert.notOk(instance.uniforms['vec2Attribute']);
  });

  test('vec2Neither parameter is neither uniform nor attribute', function () {
    assert.notOk(initSpy.called);
    assert.notOk(updateSpy.called);
    el.setAttribute('material', 'shader: testShader');
    const material = el.components.material;
    const instance = material.shader;
    assert.ok(instance);
    assert.ok(initSpy.calledOnce);
    assert.ok(updateSpy.calledOnce);
    assert.notOk(instance.attributes['vec2Neither']);
    assert.notOk(instance.uniforms['vec2Neither']);
  });
});
