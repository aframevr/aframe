/* global assert, setup, suite, test */
let helpers = require('../../helpers');
let initMetaTags = require('core/scene/metaTags').inject;
let metaTags = require('core/scene/metaTags');
let constants = require('constants/');

suite('metaTags', function () {
  setup(function (done) {
    let el = this.el = helpers.entityFactory();
    let i;
    el.addEventListener('loaded', function () {
      let metaTagEls = document.querySelectorAll('meta');
      for (i = 0; i < metaTagEls.length; i++) {
        metaTagEls[i].parentNode.removeChild(metaTagEls[i]);
      }
      done();
    });
  });

  test('sets up meta tags', function () {
    let appleMobileWebAppCapableMetaTag;
    let sceneEl = this.el.sceneEl;
    let viewportMetaTag;
    let webAppCapableMetaTag;

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
    let appleMobileWebAppCapableMetaTag;
    let sceneEl = this.el.sceneEl;
    let viewportMetaTag;
    let webAppCapableMetaTag;

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
