/* global suite, test, teardown, setTimeout, document */

/**
 * Real-browser regression test for Content-Security-Policy 'unsafe-eval'.
 *
 * Loading the A-Frame bundle must not require 'unsafe-eval', i.e. it must not
 * call eval() or the Function constructor (which a CSP without 'unsafe-eval'
 * blocks, reporting a `securitypolicyviolation`). This is generic: it does not
 * matter where an eval()/new Function() is pulled in from, this test catches it.
 *
 * It was motivated by three-bmfont-text (a dependency of the text component),
 * whose text layout built its property getters with `new Function(...)` at load
 * time, which broke pages such as examples/test/text/index.html that ship a CSP
 * without 'unsafe-eval'.
 *
 * The bundle is loaded inside an iframe pointing at tests/csp/csp-host.html,
 * which enforces such a CSP. It loads the built dist bundle (not the in-memory
 * karma-webpack bundle, which is istanbul-instrumented under TEST_ENV=ci and
 * that instrumentation itself uses new Function()). CI rebuilds dist via
 * `npm run dist` before tests; run it locally too for an accurate result. The
 * test uses the real browser like CI does in Chrome and Firefox.
 */
suite('A-Frame bundle Content-Security-Policy', function () {
  var iframe;

  teardown(function () {
    if (iframe && iframe.parentNode) { iframe.parentNode.removeChild(iframe); }
    iframe = null;
  });

  test('loading the A-Frame bundle does not require unsafe-eval', function (done) {
    this.timeout(15000);

    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = '/base/tests/csp/csp-host.html';
    document.body.appendChild(iframe);

    // securitypolicyviolation events are dispatched asynchronously and the
    // bundle takes a moment to evaluate. Poll until an eval violation is
    // reported or the bundle finished evaluating (it assigns the global AFRAME).
    var step = 50;
    var elapsed = 0;
    var deadline = 12000;
    function check () {
      var win = iframe.contentWindow;
      var violations = (win && win.__cspViolations) || [];
      // Each entry is "<directive>|<blockedURI>|<source>". Only eval() /
      // new Function() produce a script-src violation whose blockedURI is the
      // "eval"/"wasm-eval" keyword (inline and same-origin script loads are
      // allowed by the host page's CSP, so they do not show up here).
      var evalViolations = violations.filter(function (entry) {
        var parts = entry.split('|');
        var directive = parts[0] || '';
        var blockedURI = parts[1] || '';
        return directive.indexOf('script-src') !== -1 &&
          (blockedURI === 'eval' || blockedURI === 'wasm-eval');
      });
      if (evalViolations.length) {
        return done(new Error(
          'Loading the A-Frame bundle triggered a CSP unsafe-eval violation: ' +
          evalViolations.join(', ') + '. The bundle (or one of its ' +
          'dependencies) must not use eval() / new Function().'));
      }
      if (win && win.AFRAME) {
        // Bundle fully evaluated with no eval violation: success.
        return done();
      }
      elapsed += step;
      if (elapsed >= deadline) {
        return done(new Error(
          'A-Frame did not finish loading inside the CSP iframe and no ' +
          'violation was reported. Was dist/aframe-master.js built ' +
          '(npm run dist)?'));
      }
      setTimeout(check, step);
    }
    setTimeout(check, step);
  });
});
