/* global assert, suite, setup, test */
import * as srcLoader from 'utils/src-loader.js';
import { entityFactory } from '../helpers.js';

suite('utils.src-loader', function () {
  suite('validateEnvMapSrc', function () {
    setup(function (done) {
      var el;
      var imgAsset = document.createElement('img');
      imgAsset.setAttribute('id', 'image');
      imgAsset.setAttribute('src', 'base/tests/assets/test.png');
      var imgCubemap = constructACubemap('img');
      imgCubemap.setAttribute('id', 'cubemap-imgs');
      var assetCubemap = constructACubemap('a-asset-item');
      assetCubemap.setAttribute('id', 'cubemap-assets');

      el = this.el = entityFactory({assets: [imgAsset, imgCubemap, assetCubemap]});
      if (el.hasLoaded) { done(); }
      el.addEventListener('loaded', function () {
        done();
      });
    });

    test('validates six urls as cubemap', function (done) {
      const srcs = `url(base/tests/assets/test.png),
              url(base/tests/assets/test.png),
              url(base/tests/assets/test.png),
              url(base/tests/assets/test.png),
              url(base/tests/assets/test.png),
              url(base/tests/assets/test.png)`;
      srcLoader.validateEnvMapSrc(srcs, function isCubemapCb () {
        done();
      }, function isEquirectCb () {
        assert.fail();
      });
    });

    test('validates one url as equirectangular map', function (done) {
      const srcs = 'url(base/tests/assets/test.png)';
      srcLoader.validateEnvMapSrc(srcs, function isCubemapCb () {
        assert.fail();
      }, function isEquirectCb () {
        done();
      });
    });

    test('validates selector to <img> as equirectangular map', function (done) {
      const srcs = '#image';
      srcLoader.validateEnvMapSrc(srcs, function isCubemapCb () {
        assert.fail();
      }, function isEquirectCb () {
        done();
      });
    });

    test('validates selector to <a-cubemap> (with <img> children) as cubemap', function (done) {
      const srcs = '#cubemap-imgs';
      srcLoader.validateEnvMapSrc(srcs, function isCubemapCb () {
        done();
      }, function isEquirectCb () {
        assert.fail();
      });
    });

    test('validates selector to <a-cubemap> (without <img> children) as cubemap', function (done) {
      const srcs = '#cubemap-assets';
      srcLoader.validateEnvMapSrc(srcs, function isCubemapCb () {
        done();
      }, function isEquirectCb () {
        assert.fail();
      });
    });

    test('validates single non-wrapped URL as equirectangular map', function (done) {
      const srcs = 'base/tests/assets/test.png';
      srcLoader.validateEnvMapSrc(srcs, function isCubemapCb () {
        assert.fail();
      }, function isEquirectCb () {
        done();
      });
    });
  });
});

function constructACubemap (childTag) {
  var aCubemap = document.createElement('a-cubemap');
  for (let i = 0; i < 6; i++) {
    var child = document.createElement(childTag);
    child.setAttribute('src', 'base/tests/assets/test.png');
    aCubemap.appendChild(child);
  }
  return aCubemap;
}
