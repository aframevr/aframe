/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var Sound = require('components/sound').Component;

suite('sound', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('sound', 'src: mysoundfile.mp3; autoplay: true; loop: true');
    el.addEventListener('loaded', function () {
      done();
    });

    this.sinon.stub(Sound.prototype, 'play');
    this.sinon.stub(Sound.prototype, 'stop');
  });

  suite('update', function () {
    test('creates sound', function () {
      var audio = this.el.object3D.children[0];
      assert.equal(audio.type, 'Audio');
      assert.ok(audio.autoplay);
      assert.ok(audio.getLoop());
    });

    test('re-creates sound when changing src', function () {
      var el = this.el;
      var oldAudio = el.object3D.children[0];
      el.setAttribute('sound', 'src', 'anothersound.wav');
      assert.notEqual(oldAudio.uuid, el.object3D.children[0].uuid);
    });

    test('can change src', function () {
      var audio;
      var el = this.el;

      el.setAttribute('sound', 'src', 'anothersound.wav');
      audio = el.object3D.children[0];
      assert.equal(audio.type, 'Audio');
      assert.ok(audio.autoplay);
      assert.ok(audio.getLoop());
    });

    test('can change volume', function () {
      var el = this.el;
      var audio = el.object3D.children[0];
      el.setAttribute('sound', 'volume', 0.75);
      assert.equal(audio.getVolume(), 0.75);
    });
  });
});
