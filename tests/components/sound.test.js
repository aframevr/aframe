/* global assert, process, sinon, setup, suite, test */
let entityFactory = require('../helpers').entityFactory;
let THREE = require('index').THREE;

suite('sound', function () {
  setup(function (done) {
    let el = this.el = entityFactory();
    THREE.Cache.files = {};
    setTimeout(() => {
      el.sceneEl.addEventListener('loaded', function () { done(); });

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
    });
  });

  suite('update', function () {
    test('creates sound', function () {
      let el = this.el;
      let audioPool = el.getObject3D(el.components.sound.attrName);
      for (let i = 0; i < audioPool.children.length; i++) {
        let audio = audioPool.children[i];
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
      let el = this.el;
      let oldAudio = el.getObject3D('sound').children[0];
      el.setAttribute('sound', 'src', 'url(anothersound.wav)');
      let newAudio = el.getObject3D('sound').children[0];
      assert.notEqual(oldAudio.uuid, newAudio.uuid);
    });

    test('can change src', function () {
      let el = this.el;
      el.setAttribute('sound', 'src', 'url(anothersound.wav)');
      let audioPool = el.getObject3D(el.components.sound.attrName);
      for (let i = 0; i < audioPool.children.length; i++) {
        let audio = audioPool.children[i];
        assert.equal(audio.type, 'Audio');
        assert.notOk(audio.autoplay);
        assert.ok(audio.getLoop());
      }
    });

    test.skip('can change volume', function () {
      let audioPool;
      let el = this.el;
      let i;

      el.setAttribute('sound', 'volume', 0.75);
      audioPool = el.getObject3D(el.components.sound.attrName);
      for (i = 0; i < audioPool.children.length; i++) {
        assert.equal(audioPool.children[i].getVolume(), 0.75);
      }
    });
  });

  suite('pause', function () {
    test('does not call sound pause if not playing', function () {
      let el = this.el;
      let sound = el.components.sound.pool.children[0] = {
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
      let el = this.el;
      let sound = el.components.sound.pool.children[0] = {
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
      let el = this.el;
      let sound = el.components.sound.pool.children[0] = {
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
      let el = this.el;
      let sound = el.components.sound.pool.children[0] = {
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
      let el = this.el;
      let sound = el.components.sound.pool.children[0] = {
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
      let el = this.el;
      let sound = el.components.sound.pool.children[0] = {
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
      let el = this.el;
      let playSoundStub = el.components.sound.playSound = sinon.stub();
      el.components.sound.stopSound = sinon.stub();
      el.addEventListener('sound-loaded', function () {
        assert.ok(playSoundStub.called);
        done();
      });
      el.setAttribute('sound', 'src', 'url(base/tests/assets/test.ogg)');
      el.components.sound.isPlaying = true;
    });

    test('plays sound on event', function (done) {
      const el = this.el;
      el.setAttribute('sound', 'on', 'foo');
      const playSoundStub = el.components.sound.playSound = sinon.stub();
      el.emit('foo');
      setTimeout(() => {
        assert.ok(playSoundStub.called);
        done();
      });
    });
  });

  suite('stopSound', function () {
    test('stops sound', function () {
      let el = this.el;
      let sound = el.components.sound.pool.children[0] = {
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

  suite('asset', function () {
    test('audio tag', function (done) {
      let sceneEl = this.el.sceneEl;
      let assetsEl = sceneEl.querySelector('a-assets');
      sceneEl.removeChild(assetsEl);
      process.nextTick(function () {
        assetsEl = document.createElement('a-assets');
        let audioEl = document.createElement('audio');
        audioEl.setAttribute('src', 'base/tests/assets/test.ogg');
        audioEl.setAttribute('id', 'testogg');
        assetsEl.appendChild(audioEl);
        sceneEl.appendChild(assetsEl);
        setTimeout(function () {
          let el = document.createElement('a-entity');
          el.addEventListener('sound-loaded', function () {
            assert.ok(this.components.sound.loaded);
            done();
          });
          el.setAttribute('sound', 'src', '#testogg');
          sceneEl.appendChild(el);
        });
      });
    });

    test.skip('preloading audio tag', function (done) {
      let sceneEl = this.el.sceneEl;
      let assetsEl = sceneEl.querySelector('a-assets');
      sceneEl.removeChild(assetsEl);
      process.nextTick(function () {
        assetsEl = document.createElement('a-assets');
        let audioEl = document.createElement('audio');
        audioEl.setAttribute('src', 'base/tests/assets/test.ogg');
        audioEl.setAttribute('id', 'testogg');
        audioEl.setAttribute('autoplay', '');
        assetsEl.appendChild(audioEl);
        sceneEl.appendChild(assetsEl);
        setTimeout(function () {
          let el = document.createElement('a-entity');
          el.addEventListener('sound-loaded', function () {
            assert.ok(this.components.sound.loaded);
            done();
          });
          el.setAttribute('sound', 'src', '#testogg');
          sceneEl.appendChild(el);
        }, 10);
      });
    });

    test('a-asset-item', function (done) {
      let sceneEl = this.el.sceneEl;
      let assetsEl = sceneEl.querySelector('a-assets');
      sceneEl.removeChild(assetsEl);
      process.nextTick(function () {
        assetsEl = document.createElement('a-assets');
        let assetItemEl = document.createElement('a-asset-item');
        assetItemEl.setAttribute('src', 'base/tests/assets/test.ogg');
        assetItemEl.setAttribute('id', 'testogg');
        assetItemEl.setAttribute('response-type', 'arraybuffer');
        assetsEl.appendChild(assetItemEl);
        sceneEl.appendChild(assetsEl);
        process.nextTick(function () {
          let el = document.createElement('a-entity');
          el.setAttribute('sound', 'src', '#testogg');
          el.addEventListener('sound-loaded', function () {
            assert.ok(this.components.sound.loaded);
            done();
          });
          sceneEl.appendChild(el);
        });
      });
    });
  });

  suite('use the same src twice', function () {
    test('use the same src twice', function (done) {
      let sceneEl = this.el.sceneEl;
      let el1 = document.createElement('a-entity');
      let el2 = document.createElement('a-entity');
      el1.setAttribute('sound', 'src', 'url(base/tests/assets/test.ogg)');
      el2.setAttribute('sound', 'src', 'url(base/tests/assets/test.ogg)');
      let loadedCount = 0;
      el1.addEventListener('sound-loaded', function () {
        assert.ok(el1.components.sound.loaded);
        loadedCount++;
        if (loadedCount === 2) {
          done();
        }
      });
      el2.addEventListener('sound-loaded', function () {
        assert.ok(el2.components.sound.loaded);
        loadedCount++;
        if (loadedCount === 2) {
          done();
        }
      });
      sceneEl.appendChild(el1);
      sceneEl.appendChild(el2);
    });
  });
});
