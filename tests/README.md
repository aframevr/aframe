# A-Frame Unit Tests

The A-Frame codebase aims for as much unit test coverage as possible. Tests
give us confidence that changes work and that they do not unexpectedly regress
other parts of the code.

Pull requests changing code behavior will usually be asked to accompany unit
tests. Bug fixes will also usually be asked to provide unit tests to prevent
future regressions.

## Toolchain

Unit tests use:

- [karma](https://karma-runner.github.io/) - The test runner. We configured
  `npm run test` to run karma on the command line.
- [Mocha](https://mochajs.org/) (in TDD mode) - The test framework. Provides
   things such as test methods, setup/teardown hooks, the reporter.
- [chai](http://chaijs.com/) - An assertion library. In unit tests, we write
  code, and assert that certain values are what we think they should be
  (e.g., `assert.equal(value, 5)`).
- [sinon](http://sinonjs.org/) - A library for stubbing, spying, and mocking.
  This lets us do things such as assert that functions were or were not called,
  to stub out and isolate code that we don't want to be executed, or create mock
  objects. *Most tests will not need Sinon.*

## Running Tests

Run `npm run test` to run the entire test suite. This starts a watcher. Every
change to the codebase will automatically trigger the tests. This is useful in
that you don't have to re-run a command every time you want to run the tests.

If you wish to only run a single test suite or a single test case, then you can
add `.only` to the suite or test you wish to run. For example:

```js
// To run just this suite, change:
suite('lorum ipsum', function () { // ... });
// to...
suite.only('lorum ipsum', function () { // ... });

// To run just this test, change:
test('lorem ipsum', function () { // ... });
// to...
test.only('lorem ipsum', function () { // ... });
```

## Writing a Test

The **most useful** thing to do is read the existing tests and mimic their
structure and style.

Tests are structured with each module, component, or custom element getting
their own test suite. Methods or features are inner suites within their
respective module, component, or custom element. And then test cases go within
those inner suites:

```js
suite('module/component/custom element', function () {
  /**
   * `setup` hook is run before every test.
   */
  setup(function (done) {
    done();  // If asynchrony is involved, use `done` to tell when finished.
  });

  suite('method/feature', function () [
    /**
     * A synchronous test case. No need to specify `done`.
     */
    test('does this', function () {
      assert.equal(1, 1);
    });

    /**
     * An asynchronous test case.
     */
    test('does that', function (done) {
      process.nextTick(function () {
        assert.notEqual(1, 2);
        done();  // Use `done` to tell when finished in asynchronous test.
      });
    });
  });
});
```

### Testing Tips

[coverage]: https://en.wikipedia.org/wiki/Code_coverage
[codecov-chrome]: https://chrome.google.com/webstore/detail/codecov-extension/keefkhehidemnokodkdkejapdgfjmijf
[codecov-ff]: https://addons.mozilla.org/en-US/firefox/addon/codecov-extension/

- Install the Codecov [Chrome Extension][codecov-chrome] or
  [Firefox Add-on](codecov-ff) to view [code coverage][coverage] information on GitHub's UI.
- `helpers.js:entityFactory` is common called in `setup` hooks to setup an
  entity within a scene that is attached to the body.
- When testing with an `<a-entity>`, we often to have wait until it fires the
  'loaded' event.
- karma may sometimes misreport test failures to other unit tests. Run one test
  suite or case at a time to isolate the test failure.
- Use `process.nextTick` after doing DOM manipulations. However, you will not
  need to do this after `Entity.setAttribute` as we have made that synchronous.
