<h1 align="center">A-Frame</h1>

<p align="center"><a href="https://aframe.io" target="_blank"><img width="480" alt="A-Frame" src="https://cloud.githubusercontent.com/assets/674727/21375108/2c10b308-c6e0-11e6-945e-2394beb9a8ed.png"></a></p>

<p align="center"><b>A web framework for building virtual reality experiences.</b></p>

<p align="center">
  <a href="https://travis-ci.org/aframevr/aframe"><img src="https://img.shields.io/travis/aframevr/aframe.svg?style=flat-square" alt="Build Status"></a>
  <a href="https://codecov.io/gh/aframevr/aframe">
    <img src="https://codecov.io/gh/aframevr/aframe/branch/master/graph/badge.svg" alt="Coverage Status">
  </a>
  <a href="https://npmjs.org/package/aframe">
    <img src="http://img.shields.io/npm/dt/aframe.svg?style=flat-square" alt="Downloads">
  </a>
  <a href="https://npmjs.org/package/aframe">
    <img src="http://img.shields.io/npm/v/aframe.svg?style=flat-square" alt="Version">
  </a>
  <a href="https://npmjs.com/package/aframe">
    <img src="https://img.shields.io/npm/l/aframe.svg?style=flat-square" alt="License"></a>
  </a>
</p>

<div align="center">
  <a href="https://aframe.io">Site</a>
  &mdash;
  <a href="https://aframe.io/docs/">Docs</a>
  &mdash;
  <a href="https://aframevr-slack.herokuapp.com">Slack</a>
  &mdash;
  <a href="https://aframe.io/blog/">Blog</a>
  &mdash;
  <a href="https://github.com/aframevr/awesome-aframe">awesome-aframe</a>
</div>

## Features

:eyeglasses: **Virtual reality made simple**: A-Frame handles the 3D and WebVR boilerplate required to get running across platforms including mobile, desktop, Vive, and Rift just by dropping in `<a-scene>`.

:heart: **Declarative HTML**: A-Frame is accessible to all developers due to its easy-to-read and copy-and-pastable HTML.

&#9881; **Entity-component pattern**: A-Frame is a powerful framework for three.js, providing an declarative, composable, reusable entity-component architecture.

&#128296; **Tool agnostic**: A-Frame interoperates beautifully with JavaScript DOM APIs and most libraries such as React, Vue.js, Angular, or d3.js.

:mag: **Visual Inspector**: A-Frame provides a built-in visual inspector that acts just like your browser's DevTools; open up a scene and hit `<ctrl> + <alt> + i`.

:package: **Registry**: A-Frame has a [Registry](https://aframe.io/aframe-registry), a curated component repository similar to the Unity Asset Store. Install some components and use them right from your HTML.

## Usage

### Basic Example

To get started playing now, open this [**CodePen example
scene**](http://codepen.io/team/mozvr/pen/BjygdO?editors=100).

```html
<html>
  <head>
    <title>My A-Frame Scene</title>
    <script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
      <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  </body>
</html>
```

### Builds

To use the latest stable build of A-Frame, include [`aframe.min.js`](https://aframe.io/releases/0.5.0/aframe.min.js):

```js
<head>
  <script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
</head>
```

To check out the stable and master builds, see the [`dist/` folder](dist/).

### npm

```sh
npm install --save aframe
```

```js
require('aframe')  // e.g., with Browserify or Webpack.
```

## Local Development

```sh
git clone https://github.com/aframevr/aframe.git  # Clone the repository.
cd aframe && npm install  # Install dependencies.
npm start  # Start the local development server.
```

And open in your browser **[http://localhost:9000](http://localhost:9000)**.

### Generating Builds

```sh
npm run dist
```

## Questions

For questions and support, [ask on StackOverflow](http://stackoverflow.com/questions/ask/?tags=aframe).

## Stay in Touch

- To hang out with the community, [join the A-Frame Slack](https://aframevr-slack.herokuapp.com).
- [Follow `A Week of A-Frame` on the A-Frame blog](https://aframe.io/blog).
- [Follow @aframevr on Twitter](https://twitter.com/aframevr).

## Contributing

Get involved! Check out the [Contributing Guide](CONTRIBUTING.md) for how to get started.

## License

This program is free software and is distributed under an [MIT License](LICENSE).
