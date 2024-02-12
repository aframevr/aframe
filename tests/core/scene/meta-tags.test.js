/* global assert, setup, suite, test */
import * as helpers from '../../helpers.js';
import { inject as initMetaTags } from 'core/scene/metaTags.js';
import * as metaTags from 'core/scene/metaTags.js';
import * as constants from 'constants/index.js';

suite('metaTags', function () {
  setup(function (done) {
    var el = this.el = helpers.entityFactory();
    var i;
    el.addEventListener('loaded', function () {
      var metaTagEls = document.querySelectorAll('meta');
      for (i = 0; i < metaTagEls.length; i++) {
        metaTagEls[i].parentNode.removeChild(metaTagEls[i]);
      }
      done();
    });
  });

  test('sets up meta tags', function () {
    var appleMobileWebAppCapableMetaTag;
    var sceneEl = this.el.sceneEl;
    var viewportMetaTag;
    var webAppCapableMetaTag;

    initMetaTags(sceneEl);

    appleMobileWebAppCapableMetaTag = document.querySelector(
      'meta[name="apple-mobile-web-app-capable"]');
    webAppCapableMetaTag = document.querySelector('meta[name="mobile-web-app-capable"]');
    viewportMetaTag = document.querySelector('meta[name="viewport"]');

    assert.notOk(appleMobileWebAppCapableMetaTag);
    assert.equal(viewportMetaTag.content, metaTags.MOBILE_HEAD_TAGS[0].attributes.content);
    assert.ok(webAppCapableMetaTag);
  });

  test('sets up meta tags for iOS', function () {
    var appleMobileWebAppCapableMetaTag;
    var sceneEl = this.el.sceneEl;
    var viewportMetaTag;
    var webAppCapableMetaTag;

    sceneEl.isIOS = true;
    initMetaTags(sceneEl);

    appleMobileWebAppCapableMetaTag = document.querySelector(
      'meta[name="apple-mobile-web-app-capable"]');
    viewportMetaTag = document.querySelector('meta[name="viewport"]');
    webAppCapableMetaTag = document.querySelector('meta[name="mobile-web-app-capable"]');

    assert.ok(appleMobileWebAppCapableMetaTag);
    assert.ok(appleMobileWebAppCapableMetaTag.hasAttribute(constants.AFRAME_INJECTED));
    assert.equal(appleMobileWebAppCapableMetaTag.content, 'yes');

    assert.ok(viewportMetaTag);
    assert.ok(viewportMetaTag.hasAttribute(constants.AFRAME_INJECTED));
    assert.equal(viewportMetaTag.content, metaTags.MOBILE_HEAD_TAGS[0].attributes.content);

    assert.ok(webAppCapableMetaTag);
    assert.ok(webAppCapableMetaTag.hasAttribute(constants.AFRAME_INJECTED));
    assert.equal(webAppCapableMetaTag.content, 'yes');
  });
});
