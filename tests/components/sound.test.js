/* global assert, process, sinon, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('sound', function () {
  setup(function (done) {
    var el = this.el = entityFactory();

    el.setAttribute('sound', 'src: url(mysoundfile.mp3); autoplay: true; loop: true; poolSize: 3;');
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
        assert.ok(audio.autoplay);
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
        assert.ok(audio.autoplay);
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
        isPlaying: false,
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
        isPlaying: true,
        source: {buffer: true}
      };
      el.components.sound.isPlaying = true;
      el.pause();
      assert.ok(sound.pause.called);
    });
  });

  suite('play', function () {
    test('does not call sound pause if not playing', function () {
      var el = this.el;
      var sound = el.components.sound.pool.children[0] = {
        disconnect: sinon.stub(),
        play: sinon.stub(),
        isPlaying: false,
        source: {buffer: true}
      };
      el.components.sound.autoplay = true;
      el.play();
      assert.notOk(sound.play.called);
    });
  });
});
