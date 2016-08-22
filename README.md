# A-Frame

**Building Blocks for the VR Web**

[![build status][travis-image]][travis-url]
[![codecov][codecov-image]][codecov-url]
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]
[![js-semistandard-style][semistandard-image]][semistandard-url]

A-Frame is a framework for creating virtual reality web experiences.

![<a-montage>](https://cloud.githubusercontent.com/assets/674727/14156618/3258460c-f67c-11e5-8176-5b66c3169a1c.gif)

- **Virtual Reality**: Drop in the library and have a WebVR scene within a few lines of markup.
- **Based on the DOM**: Manipulate with JavaScript, use with your favorite [libraries and frameworks](https://github.com/aframevr/awesome-aframe).
- **[Entity-Component-System](https://aframe.io/docs/core/)**: Based on an entity-component-system pattern for better composability and extensibility.

Find out more:

- [Guide](https://aframe.io/docs/guide/)
- [Examples](https://aframe.io/examples/)
- [awesome-aframe](https://github.com/aframevr/awesome-aframe)
- [Ask us on Slack!](https://aframevr-slack.herokuapp.com/)

## Usage

### CodePen

To get started immediately, just fire up [__this CodePen example scene__](http://codepen.io/team/mozvr/pen/BjygdO?editors=100)!

### Downloads

To embed this library in your project, include this file:

* [`aframe.min.js`](https://aframe.io/releases/0.2.0/aframe.min.js)

For the unminified version for local development (with source maps), include this file:

* [`aframe.js`](https://aframe.io/releases/0.2.0/aframe.js)

__Also, be sure to check out the awesome [examples](https://aframe.io/examples/) (or [the ones in this repository](examples/)).__

### npm

First install from npm:

```sh
npm install aframe
```

And in your Browserify/Webpack modules, simply require the module:

```js
require('aframe')
```


## Local Installation and Development

Alternatively, you can clone this repository to work locally on this project and explore the examples.

```sh
git clone git@github.com:aframevr/aframe.git
cd aframe && npm install
```

To start the local development server:

```sh
npm start
```

And fire up __[http://localhost:9000](http://localhost:9000)__!

## Maintainers

Ensure you have [cloned the repo and installed the dependencies](#local-installation-and-development).

### Publishing to [npm](https://www.npmjs.com/)

To increment the preminor version of the package (e.g., `0.1.19` to `0.1.20`) and create a git tag (e.g., `v0.1.20`):

```sh
npm run release:bump
```

___NOTE:___ npm versions __cannot__ be unpublished.

Once the package is 100% ready to go, to push the new version to npm (e.g., `0.1.20`) and to the new tag to GitHub (e.g., `v0.1.20`):

```sh
npm run release:push
```

## Updating `dist` Files

```sh
npm run dist
```

## Publishing to GitHub Pages

To publish to __https://aframevr.github.io/aframe/__:

```sh
npm run ghpages
```

To publish to __https://your_username.github.io/aframe/__:

```sh
npm run ghpages your_username
```

## Contributing

Get involved! Check out the [Contributing Guide](CONTRIBUTING.md) for how to get started.

## License

This program is free software and is distributed under an [MIT License](LICENSE).

[npm-image]: https://img.shields.io/npm/v/aframe.svg?style=flat-square
[npm-url]: https://npmjs.org/package/aframe
[travis-image]: https://img.shields.io/travis/aframevr/aframe.svg?style=flat-square
[travis-url]: http://travis-ci.org/aframevr/aframe
[downloads-image]: http://img.shields.io/npm/dm/aframe.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/aframe
[semistandard-image]: https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square
[semistandard-url]: https://github.com/Flet/semistandard
<!-- codecov -->
[codecov-image]: https://codecov.io/gh/aframevr/aframe/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/aframevr/aframe
