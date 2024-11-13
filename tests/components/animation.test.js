/* global assert, setup, suite, test, THREE */
var entityFactory = require('../helpers').entityFactory;
var components = require('index').components;
var registerComponent = require('index').registerComponent;

suite('animation', function () {
  var component;
  var el;

  setup(function (done) {
    this.done = false;
    el = entityFactory();
    el.addEventListener('componentinitialized', function handler (evt) {
      if (evt.detail.name !== 'animation' || this.done) { return; }
      component = el.components.animation;
      this.done = true;
      el.removeEventListener('componentinitialized', handler);
      done();
    });
    el.setAttribute('animation', '');
  });

  suite('basic animation', () => {
    test('sets from value', function () {
      el.setAttribute('animation', {property: 'light.intensity', from: 0.5, to: 1});
      component.tick(0, 20);
      assert.equal(el.getAttribute('light').intensity, 0.5);
    });

    test('sets between value', function () {
      el.setAttribute('animation', {property: 'light.intensity', from: 0.5, to: 1.0, dur: 500});
      component.tick(0, 100);
      component.tick(0, 100);
      assert.ok(el.getAttribute('light').intensity > 0.5);
      assert.ok(el.getAttribute('light').intensity < 1.0);
    });

    test('sets to value', function () {
      el.setAttribute('animation', {property: 'light.intensity', from: 0.5, to: 1.0, dur: 500});
      component.tick(0, 1);
      component.tick(0, 500);
      assert.equal(el.getAttribute('light').intensity, 1.0);
    });

    test('can infer from value', function () {
      el.setAttribute('light', 'intensity', 0.75);
      el.setAttribute('animation', {property: 'light.intensity', to: 1});
      assert.equal(component.config.targets.aframeProperty, 0.75);
    });

    test('handles non-truthy from value (i.e., 0)', function () {
      el.setAttribute('text', {value: 'supermedium'});
      el.setAttribute('animation', {
        property: 'components.text.material.uniforms.opacity.value',
        from: 0,
        to: 1,
        dur: 1000
      });
      component.tick(0, 1);
      assert.equal(el.components.text.material.uniforms.opacity.value, 0);
    });

    test('handles non-truthy to value (i.e., 0)', function () {
      el.setAttribute('animation', {
        property: 'object3D.scale.y',
        from: 1,
        to: 0,
        dur: 1000
      });
      component.tick(0, 1);
      assert.equal(el.object3D.scale.y, 1);
      component.tick(0, 1000);
      assert.equal(el.object3D.scale.y, 0);
    });
  });

  suite('direct component value animation', () => {
    test('can animate component value or member directly', function () {
      el.setAttribute('material', 'opacity', 0);
      el.setAttribute('animation', {
        property: 'components.material.material.opacity',
        dur: 1000,
        from: 0,
        to: 1
      });
      component.tick(0, 1);
      assert.equal(el.components.material.material.opacity, 0);
      component.tick(0, 500);
      assert.ok(el.components.material.material.opacity > 0);
      assert.ok(el.components.material.material.opacity < 1.0);
      component.tick(0, 500);
      assert.equal(el.components.material.material.opacity, 1.0);
    });

    test('can infer from value', function () {
      el.setAttribute('material', 'opacity', 0.75);
      el.setAttribute('animation', {
        property: 'components.material.material.opacity',
        dur: 1000,
        to: 1
      });
      assert.equal(component.config.targets.aframeProperty, 0.75);
    });
  });

  suite('direct object3D value animation', () => {
    test('can animate object3D value directly', function () {
      el.setAttribute('animation', {
        property: 'object3D.position.x',
        dur: 1000,
        from: 0,
        to: 10
      });
      component.tick(0, 1);
      assert.equal(el.object3D.position.x, 0);
      component.tick(0, 500);
      assert.ok(el.object3D.position.x > 0);
      assert.ok(el.object3D.position.x < 10);
      component.tick(0, 500);
      assert.equal(el.object3D.position.x, 10);
    });

    test('can infer from value', function () {
      el.object3D.position.z = 0.75;
      el.setAttribute('animation', {
        property: 'object3D.position.z',
        dur: 1000,
        to: 1
      });
      assert.equal(component.config.targets.aframeProperty, 0.75);
    });

    test('uses degrees for rotation', function () {
      el.setAttribute('animation', {
        property: 'object3D.rotation.x',
        dur: 1000,
        from: 0,
        to: 360
      });
      component.tick(0, 1);
      assert.equal(el.object3D.position.x, 0);
      component.tick(0, 500);
      assert.equal(THREE.MathUtils.degToRad(component.config.targets.aframeProperty),
                   el.object3D.rotation.x);
    });
  });

  suite('color animation', () => {
    test('can animate color object directly', function () {
      el.setAttribute('material', '');
      el.setAttribute('animation', {
        property: 'components.material.material.color',
        dur: 1000,
        from: 'blue',
        to: 'red',
        type: 'color'
      });
      component.tick(0, 1);
      assert.equal(el.components.material.material.color.b, 1);
      assert.equal(el.components.material.material.color.r, 0);
      component.tick(0, 500);
      assert.ok(el.components.material.material.color.b > 0);
      assert.ok(el.components.material.material.color.b < 1);
      assert.ok(el.components.material.material.color.r > 0);
      assert.ok(el.components.material.material.color.r < 1);
      component.tick(0, 500);
      assert.equal(el.components.material.material.color.b, 0);
      assert.equal(el.components.material.material.color.r, 1);
    });

    test('can infer from value', function () {
      el.setAttribute('material', '');
      el.components.material.material.color.r = 0.1;
      el.components.material.material.color.g = 0.2;
      el.components.material.material.color.b = 0.3;
      el.setAttribute('animation', {
        property: 'components.material.material.color',
        dur: 1000,
        to: '#FFF',
        type: 'color'
      });
      assert.equal(component.config.targets[0].r, 0.1);
      assert.equal(component.config.targets[0].g, 0.2);
      assert.equal(component.config.targets[0].b, 0.3);
    });
  });

  suite('vec3 animation', () => {
    setup(function () {
      components.dummy = undefined;
    });

    test('can animate vec3', function () {
      el.setAttribute('animation', {
        property: 'position',
        dur: 1000,
        from: '1 1 1',
        to: '0 0 0'
      });
      component.tick(0, 1);
      assert.equal(el.object3D.position.x, 1);
      assert.equal(el.object3D.position.y, 1);
      assert.equal(el.object3D.position.z, 1);
      component.tick(0, 500);
      assert.ok(el.object3D.position.x > 0);
      assert.ok(el.object3D.position.x < 1);
      component.tick(0, 500);
      assert.equal(el.object3D.position.x, 0);
      assert.equal(el.object3D.position.y, 0);
      assert.equal(el.object3D.position.z, 0);
    });

    test('can infer from value', function () {
      el.object3D.position.set(5, 5, 5);
      el.setAttribute('animation', {
        property: 'position',
        dur: 1000,
        to: '10 10 10'
      });
      assert.equal(component.config.targets[0].x, 5);
      assert.equal(component.config.targets[0].y, 5);
      assert.equal(component.config.targets[0].z, 5);
    });

    test('uses degrees for rotation', function () {
      el.setAttribute('animation', {
        property: 'rotation',
        dur: 1000,
        from: '0 0 0',
        to: '30 60 90'
      });
      component.tick(0, 1);
      component.tick(0, 1000);
      assert.equal(el.object3D.rotation.x, THREE.MathUtils.degToRad(30));
      assert.equal(el.object3D.rotation.y, THREE.MathUtils.degToRad(60));
      assert.equal(el.object3D.rotation.z, THREE.MathUtils.degToRad(90));
    });

    test('can animate vec3 single-property custom component', function () {
      registerComponent('dummy', {
        schema: {type: 'vec3'}
      });
      el.setAttribute('dummy');
      el.setAttribute('animation', {
        property: 'dummy',
        dur: 1000,
        from: '1 1 1',
        to: '0 0 0'
      });
      component.tick(0, 1);
      assert.equal(el.components.dummy.data.x, 1);
      assert.equal(el.components.dummy.data.y, 1);
      assert.equal(el.components.dummy.data.z, 1);
      component.tick(0, 500);
      assert.ok(el.components.dummy.data.x > 0);
      assert.ok(el.components.dummy.data.x < 1);
      component.tick(0, 500);
      assert.equal(el.components.dummy.data.x, 0);
      assert.equal(el.components.dummy.data.y, 0);
      assert.equal(el.components.dummy.data.z, 0);
    });

    test('can animate vec3 property of custom component', function () {
      registerComponent('dummy', {
        schema: {vector: {type: 'vec3'}}
      });
      el.setAttribute('dummy', '');
      el.setAttribute('animation', {
        property: 'dummy.vector',
        dur: 1000,
        from: '1 1 1',
        to: '0 0 0'
      });
      component.tick(0, 1);
      assert.equal(el.components.dummy.data.vector.x, 1);
      assert.equal(el.components.dummy.data.vector.y, 1);
      assert.equal(el.components.dummy.data.vector.z, 1);
      component.tick(0, 500);
      assert.ok(el.components.dummy.data.vector.x > 0);
      assert.ok(el.components.dummy.data.vector.x < 1);
      component.tick(0, 500);
      assert.equal(el.components.dummy.data.vector.x, 0);
      assert.equal(el.components.dummy.data.vector.y, 0);
      assert.equal(el.components.dummy.data.vector.z, 0);
    });
  });

  suite('boolean animation', () => {
    test('can toggle from false to true via strings', function () {
      el.setAttribute('animation', {property: 'visible', from: 'false', to: 'true', dur: 1000});
      component.tick(0, 1);
      assert.equal(el.object3D.visible, false);
      component.tick(0, 500);
      assert.equal(el.object3D.visible, false);
      component.tick(0, 500);
      assert.equal(el.object3D.visible, true);
    });

    test('can toggle from false to true via bools', function () {
      el.setAttribute('animation', {property: 'visible', from: false, to: true, dur: 1000});
      component.tick(0, 1);
      assert.equal(el.object3D.visible, false);
      component.tick(0, 500);
      assert.equal(el.object3D.visible, false);
      component.tick(0, 500);
      assert.equal(el.object3D.visible, true);
    });
  });

  suite('dir (direction)', () => {
    test('can reverse', function () {
      el.setAttribute('animation', {
        property: 'light.intensity',
        from: 0.5,
        to: 1,
        dir: 'reverse',
        dur: 1000
      });
      component.tick(0, 1);
      assert.equal(el.getAttribute('light').intensity, 1.0);
      component.tick(0, 500);
      assert.ok(el.getAttribute('light').intensity < 1.0);
      assert.ok(el.getAttribute('light').intensity > 0.5);
      component.tick(0, 500);
      assert.equal(el.getAttribute('light').intensity, 0.5);
    });

    test('can alternate', function () {
      el.setAttribute('animation', {
        property: 'object3D.rotation.x',
        from: 0,
        to: 360,
        dir: 'alternate',
        dur: 1000,
        loop: true
      });

      component.tick(0, 1);
      assert.equal(el.object3D.rotation.x, 0);

      // Now going up.
      component.tick(0, 1000);
      assert.equal(el.object3D.rotation.x, Math.PI * 2);

      // Now going down.
      component.tick(0, 500);
      assert.ok(el.object3D.rotation.x > 0);
      assert.ok(el.object3D.rotation.x < Math.PI * 2);
    });
  });

  suite('loop', () => {
    test('can loop', function () {
      el.setAttribute('animation', {
        property: 'light.intensity',
        from: 0,
        to: 1,
        loop: true,
        dur: 1000
      });
      component.tick(0, 1);
      assert.equal(el.getAttribute('light').intensity, 0);
      component.tick(0, 1000);
      assert.equal(el.getAttribute('light').intensity, 1.0);
      component.tick(0, 1);
      assert.equal(Math.round(el.getAttribute('light').intensity), 0);
      component.tick(0, 1000);
      assert.equal(el.getAttribute('light').intensity, 1.0);
    });
  });

  test('can set easing', function () {
    el.setAttribute('animation', {
      property: 'light.intensity',
      from: 0,
      to: 1,
      easing: 'easeInOutCubic'
    });
    assert.equal(component.config.easing, 'easeInOutCubic');
  });

  test('can set round', function () {
    el.setAttribute('animation', {
      property: 'light.intensity',
      from: 0,
      to: 1,
      round: true
    });
    assert.equal(component.config.round, true);
  });

  test('can set elasticity', function () {
    el.setAttribute('animation', {
      property: 'light.intensity',
      from: 0,
      to: 1,
      elasticity: 2
    });
    assert.equal(component.config.elasticity, 2);
  });

  suite('startAnimation', function () {
    test('plays by default', function () {
      el.setAttribute('animation', {property: 'position'});
      assert.ok(component.animationIsPlaying);
    });

    test('plays on delay', function (done) {
      el.setAttribute('animation', {property: 'position', delay: 100});
      assert.notOk(component.animationIsPlaying);
      setTimeout(() => {
        assert.ok(component.animationIsPlaying);
        done();
      }, 100);
    });

    test('does not play if startEvents', function () {
      el.setAttribute('animation', {property: 'position', startEvents: 'foo'});
      assert.notOk(component.animationIsPlaying);
    });

    test('does not play if not autoplay', function () {
      el.setAttribute('animation', {property: 'position', autoplay: false});
      assert.notOk(component.animationIsPlaying);
    });
  });

  suite('event listeners', () => {
    test('plays on startEvents', function (done) {
      el.setAttribute('animation', {property: 'position', startEvents: ['foo', 'far']});
      assert.notOk(component.animationIsPlaying);
      el.addEventListener('foo', function handler () {
        assert.ok(component.animationIsPlaying);
        el.removeEventListener('foo', handler);
        done();
      });
      el.emit('foo');
    });

    test('restarts animation on startEvents', function (done) {
      el.setAttribute('animation', {
        property: 'object3D.scale.z',
        from: 1,
        to: 2,
        startEvents: ['foo', 'foo2']
      });

      el.addEventListener('foo', function handler () {
        assert.ok(component.animationIsPlaying);
        assert.equal(el.object3D.scale.z, 1);
        component.tick(0, 1);
        component.tick(0, 550);
        assert.ok(el.object3D.scale.z > 1);
        el.emit('foo2');
        el.removeEventListener('foo', handler);
      });

      el.addEventListener('foo2', function handler2 () {
        component.tick(0, 1);
        assert.ok(component.animationIsPlaying);
        assert.equal(el.object3D.scale.z, 1);
        component.tick(0, 550);
        assert.ok(el.object3D.scale.z > 1);
        el.removeEventListener('foo2', handler2);
        done();
      });

      component.tick(0, 1);
      component.tick(0, 500);
      el.emit('foo');
    });

    test('pauses on pauseEvents', function (done) {
      el.setAttribute('animation', {property: 'position', pauseEvents: 'bar, boo'});
      assert.ok(component.animationIsPlaying);
      el.addEventListener('bar', function handler () {
        setTimeout(() => {
          assert.notOk(component.animationIsPlaying);
          el.removeEventListener('bar', handler);
          done();
        });
      });
      el.emit('bar');
    });

    test('resumes on resumeEvents', function (done) {
      el.setAttribute('text', {opacity: 0, value: 'supermedium'});
      el.setAttribute('animation', {
        property: 'components.text.material.uniforms.opacity.value',
        from: 0,
        to: 1,
        dur: 1000,
        pauseEvents: 'bar',
        resumeEvents: 'qux'
      });
      el.addEventListener('bar', function handler () {
        assert.notOk(component.animationIsPlaying);
        el.removeEventListener('bar', handler);
        el.emit('qux');
      });
      el.addEventListener('qux', function handler2 () {
        assert.ok(component.animationIsPlaying);
        assert.ok(el.components.text.material.uniforms.opacity.value > 0, 'More than 0');
        assert.ok(el.components.text.material.uniforms.opacity.value < 1, 'Less than 1');
        component.tick(0, 500);
        assert.equal(el.components.text.material.uniforms.opacity.value, 1);
        el.removeEventListener('qux', handler2);
        done();
      });

      assert.ok(component.animationIsPlaying, 'Should be playing');
      component.tick(0, 1);
      component.tick(0, 500);
      assert.ok(el.components.text.material.uniforms.opacity.value > 0, 'More than 0');
      assert.ok(el.components.text.material.uniforms.opacity.value < 1, 'Less than 1');
      el.emit('bar');
    });
  });

  suite('event emissions', function () {
    test('emits animationbegin event', function (done) {
      el.addEventListener('animationbegin', evt => { done(); });
      el.setAttribute('animation', {property: 'position', to: '2 2 2'});
    });

    test('emits animationcomplete event', function (done) {
      el.addEventListener('animationbegin', evt => {
        el.addEventListener('animationcomplete', evt => { done(); });
        component.tick(1, 1);
        component.tick(100000, 99999);
      });
      el.setAttribute('animation', {property: 'position', to: '2 2 2'});
    });

    test('emits animationcomplete event twice', function (done) {
      var calledOnce = false;
      el.addEventListener('animationbegin', evt => {
        component.tick(1, 1);
        component.tick(100000, 99999);
      });

      el.addEventListener('animationcomplete', evt => {
        if (calledOnce) {
          done();
        } else {
          calledOnce = true;
          component.el.emit('startAnimation');
        }
      });

      el.setAttribute('animation', {
        property: 'position',
        to: '2 2 2',
        startEvents: 'startAnimation'
      });
      component.el.emit('startAnimation');
    });
  });

  suite('tick', function () {
    test('only calls animejs animation.tick if playing', function () {
      el.setAttribute('animation', 'property', 'position');
      let animationTickSpy = this.sinon.spy(component.animation, 'tick');
      component.animationIsPlaying = false;
      component.tick(0, 10);
      assert.notOk(animationTickSpy.called);
      component.animationIsPlaying = true;
      component.tick(0, 10);
      assert.ok(animationTickSpy.called);
      assert.equal(animationTickSpy.getCalls()[0].args[0], 10);
    });
  });

  suite('remove', function () {
    test('stops animation', function () {
      el.setAttribute('animation', {property: 'position'});
      assert.ok(component.animationIsPlaying);
      el.removeAttribute('animation');
      assert.notOk(component.animationIsPlaying);
    });

    test('removes event listeners', function (done) {
      el.setAttribute('animation', {property: 'position', startEvents: 'foo'});
      el.removeAttribute('animation');
      el.emit('foo');
      setTimeout(() => {
        assert.notOk(component.animationIsPlaying);
        done();
      }, 10);
    });
  });

  suite('stopRelatedAnimations', function () {
    test('stops related animations', function (done) {
      el.setAttribute('animation__mouseenter', {
        property: 'position',
        startEvents: 'mouseenter',
        dur: 10000
      });

      el.setAttribute('animation__mouseleave', {
        property: 'position',
        startEvents: 'mouseleave',
        dur: 10000
      });

      let mouseenterComponent = el.components['animation__mouseenter'];
      let mouseleaveComponent = el.components['animation__mouseleave'];
      assert.notOk(mouseenterComponent.animationIsPlaying);
      assert.notOk(mouseleaveComponent.animationIsPlaying);

      el.emit('mouseenter');
      setTimeout(() => {
        assert.ok(mouseenterComponent.animationIsPlaying);
        assert.notOk(mouseleaveComponent.animationIsPlaying);
        el.emit('mouseleave');
        setTimeout(() => {
          assert.notOk(mouseenterComponent.animationIsPlaying);
          assert.ok(mouseleaveComponent.animationIsPlaying);
          done();
        }, 10);
      }, 10);
    });
  });

  test('exposes anime.js', () => {
    assert.ok(window.AFRAME.ANIME);
  });
});
