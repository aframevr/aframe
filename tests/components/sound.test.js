/* global assert, process, sinon, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;
var Sound = require('components/sound').Component;

suite('sound', function () {
  setup(function (done) {
    var el = this.el = entityFactory();

    this.sinon.stub(Sound.prototype, 'play');
    this.sinon.stub(Sound.prototype, 'stop');

    el.setAttribute('sound', 'src: mysoundfile.mp3; autoplay: true; loop: true');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('creates sound', function () {
      var audio = this.el.getObject3D('sound');
      assert.equal(audio.type, 'Audio');
      assert.ok(audio.autoplay);
      assert.ok(audio.getLoop());
    });

    test('re-creates sound when changing src', function () {
      var el = this.el;
      var oldAudio = el.getObject3D('sound');
      el.setAttribute('sound', 'src', 'anothersound.wav');
      assert.notEqual(oldAudio.uuid, el.getObject3D('sound').uuid);
    });

    test('can change src', function () {
      var audio;
      var el = this.el;

      el.setAttribute('sound', 'src', 'anothersound.wav');
      audio = el.getObject3D('sound');
      assert.equal(audio.type, 'Audio');
      assert.ok(audio.autoplay);
      assert.ok(audio.getLoop());
    });

    test('can change volume', function () {
      var el = this.el;
      var audio = el.getObject3D('sound');
      el.setAttribute('sound', 'volume', 0.75);
      assert.equal(audio.getVolume(), 0.75);
    });
  });

  suite('pause', function () {
    test('does not call sound pause if not playing', function () {
      var el = this.el;
      var sound = el.components.sound.sound = {
        disconnect: sinon.stub(),
        pause: sinon.stub(),
        isPlaying: false,
        source: {buffer: true}
      };
      el.pause();
      assert.notOk(sound.pause.called);
    });

    test('calls sound pause if playing', function () {
      var el = this.el;
      var sound = el.components.sound.sound = {
        disconnect: sinon.stub(),
        pause: sinon.stub(),
        isPlaying: true,
        source: {buffer: true}
      };
      el.components.sound.isPlaying = true;
      el.pause();
      assert.ok(sound.pause.called);
    });
  });
});
