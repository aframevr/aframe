/* global assert, setup, suite, test, THREE */
var Component = require('components/text').Component;
var entityFactory = require('../helpers').entityFactory;

suite('text', function () {
  var component;
  var el;

  setup(function (done) {
    this.sinon.stub(Component.prototype, 'lookupFont', function (key) {
      return {
        default: '/base/tests/assets/test.fnt?foo',
        mozillavr: '/base/tests/assets/test.fnt?bar',
        roboto: '/base/tests/assets/test.fnt?baz'
      }[key];
    });

    el = entityFactory();

    this.doneCalled = false;
    el.addEventListener('componentinitialized', evt => {
      if (this.doneCalled) { return; }
      if (evt.detail.name !== 'text') { return; }
      component = el.components.text;
      this.doneCalled = true;
      done();
    });
    el.setAttribute('text', '');
  });

  suite('init', function () {
    test('creates text mesh', function () {
      assert.ok(el.getObject3D('text'));
      assert.ok(el.getObject3D('text') instanceof THREE.Mesh);
      assert.ok(el.getObject3D('text').geometry);
      assert.ok(el.getObject3D('text').material);
    });
  });

  suite('multiple', function () {
    test('can have multiple instances', function () {
      el.setAttribute('text__foo', {value: 'foo'});
      el.setAttribute('text__bar', {value: 'bar'});
      el.setAttribute('text__baz', {value: 'baz'});
      assert.ok(el.getObject3D('text') instanceof THREE.Mesh);
      assert.ok(el.getObject3D('text__foo') instanceof THREE.Mesh);
      assert.ok(el.getObject3D('text__bar') instanceof THREE.Mesh);
      assert.ok(el.getObject3D('text__baz') instanceof THREE.Mesh);
    });
  });

  suite('update', function () {
    test('updates geometry with value', function (done) {
      // There are two paths by which geometry update can happen:
      // 1. As after-effect of font change.
      // 2. As direct effect when no font change.
      var updateGeometrySpy = this.sinon.spy(component.geometry, 'update');
      el.setAttribute('text', 'value', 'foo');
      if (component.currentFont) {
        assert.equal(updateGeometrySpy.getCalls()[0].args[0].value, 'foo');
        done();
      } else {
        el.addEventListener('textfontset', evt => {
          assert.equal(updateGeometrySpy.getCalls()[0].args[0].value, 'foo');
          done();
        });
      }
    });

    test('updates geometry with align', function () {
      var updateGeometrySpy = this.sinon.spy(component.geometry, 'update');
      el.setAttribute('text', 'align', 'right');
      assert.equal(updateGeometrySpy.getCalls()[0].args[0].align, 'right');
    });

    test('updates geometry with letterSpacing', function () {
      var updateGeometrySpy = this.sinon.spy(component.geometry, 'update');
      el.setAttribute('text', 'letterSpacing', 2);
      assert.equal(updateGeometrySpy.getCalls()[0].args[0].letterSpacing, 2);
    });

    test('updates geometry with lineHeight', function () {
      var updateGeometrySpy = this.sinon.spy(component.geometry, 'update');
      el.setAttribute('text', 'lineHeight', 2);
      assert.equal(updateGeometrySpy.getCalls()[0].args[0].lineHeight, 2);
    });

    test('updates geometry with tabSize', function () {
      var updateGeometrySpy = this.sinon.spy(component.geometry, 'update');
      el.setAttribute('text', 'tabSize', 2);
      assert.equal(updateGeometrySpy.getCalls()[0].args[0].tabSize, 2);
    });

    test('updates geometry with whiteSpace', function () {
      var updateGeometrySpy = this.sinon.spy(component.geometry, 'update');
      el.setAttribute('text', 'whiteSpace', 'nowrap');
      assert.equal(updateGeometrySpy.getCalls()[0].args[0].whiteSpace, 'nowrap');
    });

    test('calls createOrUpdateMaterial if shader changes', function () {
      var updateMaterialSpy = this.sinon.spy(component, 'createOrUpdateMaterial');
      el.setAttribute('text', 'shader', 'standard');
      el.setAttribute('text', 'shader', 'sdf');
      assert.equal(updateMaterialSpy.getCalls().length, 2);
    });
  });

  suite('createOrUpdateMaterial', function () {
    test('defaults to msdf font', function () {
      assert.equal(component.shaderObject.name, 'msdf');
    });

    test('switches to sdf font if sdf font', function () {
      el.setAttribute('text', 'font', 'mozillavr');
      assert.equal(component.shaderObject.name, 'sdf');
    });

    test('switches back to msdf font if msdf font', function () {
      assert.equal(component.shaderObject.name, 'msdf');
      el.setAttribute('text', 'font', 'mozillavr');
      assert.equal(component.shaderObject.name, 'sdf');
      el.setAttribute('text', 'font', 'roboto');
      assert.equal(component.shaderObject.name, 'msdf');
    });

    test('updates material color', function () {
      var value;
      value = el.getObject3D('text').material.uniforms.color.value;
      assert.equal(new THREE.Color(value.x, value.y, value.z).getHexString(), 'ffffff');
      el.setAttribute('text', 'color', '#123456');
      value = el.getObject3D('text').material.uniforms.color.value;
      assert.equal(new THREE.Color(value.x, value.y, value.z).getHexString(), '123456');
    });

    test('updates material opacity', function () {
      var value;
      value = el.getObject3D('text').material.uniforms.opacity.value;
      assert.equal(value, 1);
      el.setAttribute('text', 'opacity', '0.55');
      value = el.getObject3D('text').material.uniforms.opacity.value;
      assert.equal(value, 0.55);
    });

    test('updates material side', function () {
      var value;
      value = el.getObject3D('text').material.side;
      assert.equal(value, THREE.FrontSide);
      el.setAttribute('text', 'side', 'double');
      value = el.getObject3D('text').material.side;
      assert.equal(value, THREE.DoubleSide);
    });
  });

  suite('updateFont', function () {
    test('loads font', function (done) {
      el.addEventListener('textfontset', evt => {
        assert.equal(evt.detail.font, 'mozillavr');
        assert.equal(component.texture.image.getAttribute('src'),
                     '/base/tests/assets/test.png?bar');
        assert.ok(el.getObject3D('text').visible);
        done();
      });
      el.setAttribute('text', 'font', 'mozillavr');
    });

    test('loads external font', function (done) {
      el.addEventListener('textfontset', evt => {
        assert.equal(evt.detail.font, '/base/tests/assets/test.fnt');
        assert.equal(component.texture.image.getAttribute('src'),
                     '/base/tests/assets/test.png');
        assert.ok(el.getObject3D('text').visible);
        done();
      });
      el.setAttribute('text', 'font', '/base/tests/assets/test.fnt');
    });

    test('updates geometry', function (done) {
      var updateGeometrySpy = this.sinon.spy(component.geometry, 'update');

      el.addEventListener('textfontset', evt => {
        assert.shallowDeepEqual(updateGeometrySpy.getCalls()[0].args[0].font,
                                evt.detail.fontObj);
        done();
      });
      el.setAttribute('text', 'font', 'mozillavr');
    });

    test('loads font with specified font image', function (done) {
      el.addEventListener('textfontset', evt => {
        assert.equal(evt.detail.font, 'mozillavr');
        assert.equal(component.texture.image.getAttribute('src'),
                     '/base/tests/assets/test2.png');
        done();
      });
      el.setAttribute('text', {font: 'mozillavr', fontImage: '/base/tests/assets/test2.png'});
    });
  });

  suite('updateLayout', function () {
    test('anchors left', function () {
      el.setAttribute('text', {anchor: 'left', value: 'a'});
      assert.equal(el.getObject3D('text').position.x, 0);
    });

    test('anchors right', function () {
      el.setAttribute('text', {anchor: 'right', value: 'a'});
      assert.equal(el.getObject3D('text').position.x, -1);
    });

    test('anchors center', function () {
      el.setAttribute('text', {anchor: 'center', value: 'a'});
      assert.equal(el.getObject3D('text').position.x, -0.5);
    });

    test('baselines bottom', function () {
      el.setAttribute('text', {baseline: 'bottom', value: 'a'});
      assert.equal(el.getObject3D('text').position.y, 0);
    });

    test('baselines top and center', function () {
      var yTop;
      var yCenter;
      el.setAttribute('text', {baseline: 'top', value: 'a'});
      yTop = el.getObject3D('text').position.y;
      el.setAttribute('text', {baseline: 'center', value: 'a'});
      yCenter = el.getObject3D('text').position.y;
      assert.ok(yTop < yCenter);
    });

    test('avoids z-fighting', function () {
      assert.ok(el.getObject3D('text').position.z);
    });

    test('sets text scale', function () {
      assert.notEqual(el.getObject3D('text').scale.x, 1);
      assert.notEqual(el.getObject3D('text').scale.y, 1);
      assert.notEqual(el.getObject3D('text').scale.z, 1);
    });

    test('autoscales mesh to text', function () {
      el.setAttribute('geometry', {primitive: 'plane', height: 0, width: 0});
      assert.equal(el.getAttribute('geometry').width, 0);
      assert.equal(el.getAttribute('geometry').height, 0);

      el.setAttribute('text', {width: 10, value: 'a'});
      assert.equal(el.getAttribute('geometry').width, 10);
      assert.ok(el.getAttribute('geometry').height);
    });

    test('autoscales text to mesh', function () {
      el.setAttribute('geometry', {primitive: 'plane', height: 1, width: 50000});
      el.setAttribute('text', {value: 'a', width: 0});
      assert.ok(el.getObject3D('text').scale.x > 10);
      assert.ok(el.getObject3D('text').scale.y < 10);
      assert.ok(el.getObject3D('text').scale.z > 10);
    });
  });

  suite('remove', function () {
    test('removes mesh', function (done) {
      el.parentNode.removeChild(el);
      setTimeout(() => {
        assert.notOk(el.getObject3D('text'));
        done();
      });
    });

    test('cleans up', function (done) {
      var geometryDisposeSpy = this.sinon.spy(component.material, 'dispose');
      var materialDisposeSpy = this.sinon.spy(component.geometry, 'dispose');
      var textureDisposeSpy = this.sinon.spy(component.texture, 'dispose');

      el.parentNode.removeChild(el);

      setTimeout(() => {
        assert.notOk(component.geometry);
        assert.notOk(component.material);
        assert.notOk(component.texture);
        assert.ok(geometryDisposeSpy.called);
        assert.ok(materialDisposeSpy.called);
        assert.ok(textureDisposeSpy.called);
        done();
      });
    });
  });
});
