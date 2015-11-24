Unit tests use karma + Mocha (in TDD mode) + and Firefox Nightly.

## Testing Tips

- Write tests that are resistant to flux in the codebase. Things move quickly.
- When testing with an `<a-entity>`, we often to have wait until it fires the
  'loaded' event.
- karma may misreport test failures to other unit tests. Run one test suite at
  a time to isolate the test failure.
- Use `process.nextTick` after doing DOM manipulations. May have to use
  `setTimeout` when doing `removeAttribute`.
- Use `suite.only` or `test.only` to isolate test cases.
