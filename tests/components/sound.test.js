/* global assert, process, sinon, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('sound', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('sound', {
      autoplay: true,
      src: 'url(mysoundfile.mp3)',
      loop: true,
      distanceModel: 'exponential',
      maxDistance: 20000,
      refDistance: 2,
      rolloffFactor: 4,
      poolSize: 3
    });
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('creates sound', function () {
      var el = this.el;
      var audioPool = el.getObject3D(el.components.sound.attrName);
      for (var i = 0; i < audioPool.children.length; i++) {
        var audio = audioPool.children[i];
        assert.equal(audio.type, 'Audio');
        assert.equal(audio.getDistanceModel(), 'exponential');
        assert.equal(audio.getMaxDistance(), 20000);
        assert.equal(audio.getRefDistance(), 2);
        assert.equal(audio.getRolloffFactor(), 4);
        console.log(audio.autoplay);
        assert.notOk(audio.autoplay);
        assert.ok(audio.getLoop());
      }
    });

    test('re-creates sound when changing src', function () {
      var el = this.el;
      var oldAudio = el.getObject3D('sound').children[0];
      el.setAttribute('sound', 'src', 'url(anothersound.wav)');
      var newAudio = el.getObject3D('sound').children[0];
      assert.notEqual(oldAudio.uuid, newAudio.uuid);
    });

    test('can change src', function () {
      var el = this.el;
      el.setAttribute('sound', 'src', 'url(anothersound.wav)');
      var audioPool = el.getObject3D(el.components.sound.attrName);
      for (var i = 0; i < audioPool.children.length; i++) {
        var audio = audioPool.children[i];
        assert.equal(audio.type, 'Audio');
        assert.notOk(audio.autoplay);
        assert.ok(audio.getLoop());
      }
    });

    test('can change volume', function () {
      var el = this.el;
      el.setAttribute('sound', 'volume', 0.75);

      var audioPool = el.getObject3D(el.components.sound.attrName);
      for (var i = 0; i < audioPool.children.length; i++) {
        var audio = audioPool.children[i];
        assert.equal(audio.getVolume(), 0.75);
      }
    });
  });

  suite('pause', function () {
    test('does not call sound pause if not playing', function () {
      var el = this.el;
      var sound = el.components.sound.pool.children[0] = {
        disconnect: sinon.stub(),
        pause: sinon.stub(),
        stop: sinon.stub(),
        isPlaying: false,
        buffer: true,
        source: {buffer: true}
      };
      el.pause();
      assert.notOk(sound.pause.called);
    });

    test('calls sound pause if playing', function () {
      var el = this.el;
      var sound = el.components.sound.pool.children[0] = {
        disconnect: sinon.stub(),
        pause: sinon.stub(),
        stop: sinon.stub(),
        isPlaying: true,
        buffer: true,
        source: {buffer: true}
      };
      el.components.sound.isPlaying = true;
      el.pause();

      // Currently we're calling stop when the component is paused as we reset
      // the state on `play` instad of resuming it
      assert.notOk(sound.pause.called);
      assert.ok(sound.stop.called);
    });
  });

  suite('play', function () {
    test('does not call sound pause if not playing', function () {
      var el = this.el;
      var sound = el.components.sound.pool.children[0] = {
        disconnect: sinon.stub(),
        play: sinon.stub(),
        stop: sinon.stub(),
        isPlaying: false,
        buffer: true,
        source: {buffer: true}
      };
      el.components.sound.autoplay = true;
      el.play();
      assert.notOk(sound.play.called);
    });
  });

  suite('pauseSound', function () {
    test('pauses sound', function () {
      var el = this.el;
      var sound = el.components.sound.pool.children[0] = {
        disconnect: sinon.stub(),
        isPlaying: true,
        isPaused: false,
        stop: sinon.stub(),
        pause: sinon.stub(),
        buffer: true,
        source: {buffer: true}
      };
      el.components.sound.pauseSound();
      assert.ok(sound.pause.called);
      assert.ok(sound.isPaused);
    });
  });

  suite('playSound', function () {
    test('plays sound when not loaded', function () {
      var el = this.el;
      var sound = el.components.sound.pool.children[0] = {
        disconnect: sinon.stub(),
        play: sinon.stub(),
        stop: sinon.stub(),
        isPlaying: false,
        buffer: true,
        source: {buffer: true}
      };
      el.components.sound.loaded = false;

      el.components.sound.playSound();
      assert.notOk(sound.play.called);
    });

    test('plays sound when loaded', function () {
      var el = this.el;
      var sound = el.components.sound.pool.children[0] = {
        disconnect: sinon.stub(),
        play: sinon.stub(),
        stop: sinon.stub(),
        isPlaying: false,
        buffer: true,
        source: {buffer: true}
      };
      el.components.sound.loaded = true;

      el.components.sound.playSound();
      assert.ok(sound.play.called);
    });

    test('plays sound if sound already playing when changing src', function (done) {
      var el = this.el;
      var playSoundStub = el.components.sound.playSound = sinon.stub();
      el.components.sound.stopSound = sinon.stub();
      el.addEventListener('sound-loaded', function () {
        assert.ok(playSoundStub.called);
        done();
      });
      el.setAttribute('sound', 'src', 'url(base/tests/assets/test.ogg)');
      el.components.sound.isPlaying = true;
    });
  });

  suite('stopSound', function () {
    test('stops sound', function () {
      var el = this.el;
      var sound = el.components.sound.pool.children[0] = {
        disconnect: sinon.stub(),
        isPlaying: true,
        stop: sinon.stub(),
        buffer: true,
        source: {buffer: true}
      };
      el.components.sound.stopSound();
      assert.ok(sound.stop.called);
    });
  });
});
