/* global window */

/**
 * A-Frame entry chunk used by tests/csp/no-unsafe-eval.test.js.
 *
 * It is bundled (in memory) by karma-webpack like the rest of the suite and is
 * loaded inside a CSP-restricted iframe to evaluate the whole A-Frame bundle
 * (which imports the text component and, transitively, three-bmfont-text).
 * Under a Content-Security-Policy without 'unsafe-eval' this must not trigger
 * any eval()/new Function().
 */
import 'index.js';

// Signals (to the iframe's parent) that the bundle finished evaluating without
// being aborted by a blocked eval()/new Function().
window.__aframeEntryLoaded = true;
