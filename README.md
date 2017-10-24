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
  <a href="https://aframe.io/school/">School</a>
  &mdash;
  <a href="https://aframevr-slack.herokuapp.com">Slack</a>
  &mdash;
  <a href="https://aframe.io/blog/">Blog</a>
  &mdash;
  <a href="https://github.com/aframevr/awesome-aframe">awesome-aframe</a>
</div>

## Examples

<a href="https://aframe.io/a-painter/?url=https://ucarecdn.com/962b242b-87a9-422c-b730-febdc470f203/">
  <img alt="A-Painter" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531388/acfc3dda-156d-11e7-8563-5bd75252f70f.gif" height="190" width="32%">
</a>
<a href="https://aframe.io/a-blast/">
  <img alt="A-Blast" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531440/0336e66e-156e-11e7-95c2-f2e6ebc0393d.gif" height="190" width="32%">
</a>
<a href="https://aframe.io/a-saturday-night/">
  <img alt="A-Saturday-Night" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531477/44272daa-156e-11e7-8ef9-d750ed430f3a.gif" height="190" width="32%">
</a>
<a href="https://ngokevin.github.io/kframe/scenes/aincraft/">
  <img alt="Aincraft" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531777/25b8ff5e-1570-11e7-896c-3446d1419eb8.gif" height="190" width="32%">
</a>
<a href="https://github.com/googlecreativelab/webvr-musicalforest">
  <img alt="Musical Forest by @googlecreativelab" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/25109861/b8e9ec48-2394-11e7-8f2d-ea1cd9df69c8.gif" height="190" width="32%">
</a>
<a href="https://aframe-gallery.glitch.me">
  <img alt="360 Image Gallery" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24572552/72f81bec-162e-11e7-9851-037d0280abdb.gif" height="190" width="32%">
</a>

*Find more examples on [the homepage](https://aframe.io), [A Week of A-Frame](https://aframe.io/blog/), and [`awesome-aframe`](https://github.com/aframevr/awesome-aframe/).*

## Features

:eyeglasses: **Virtual Reality Made Simple**: A-Frame handles the 3D and WebVR
boilerplate required to get running across platforms including mobile, desktop,
Vive, and Rift just by dropping in `<a-scene>`.

:heart: **Declarative HTML**: HTML is easy to read and copy-and-paste. Since
A-Frame can be used from HTML, A-Frame is accessible to everyone: web
developers, VR enthusiasts, educators, artists, makers, kids.

:globe_with_meridians: **Cross-Platform**: Build VR applications for Vive,
Rift, Daydream, GearVR, and Cardboard. Don't have a headset or controllers? No
problem! A-Frame still works on standard desktop and smartphones.

:electric_plug: **Entity-Component Architecture**: A-Frame is a powerful framework,
providing a declarative, composable, reusable entity-component structure for
three.js. While A-Frame can be used from HTML, developers have unlimited access
to JavaScript, DOM APIs, three.js, WebVR, and WebGL.

:zap: **Performance**: A-Frame is optimized from the ground up for WebVR. While
A-Frame uses HTML, Custom Elements don't touch the browser layout engine. All
3D object updates are all done in memory with little overhead under a single
global `requestAnimationFrame` call.

&#128296; **Tool Agnostic**: A-Frame works with normal JavaScript DOM APIs and
therefore with all libraries such as
[React](https://github.com/aframevr/aframe-react/), Vue.js, jQuery, or d3.js.
Web developers don't have to jump ship to yet another framework, feeling right
at home with A-Frame.

:mag: **Visual Inspector**: A-Frame provides a built-in visual 3D inspector
with a workflow similar to a browser's developer tools and interface similar to
Unity. Open up any A-Frame scene and hit `<ctrl> + <alt> + i`.

:package: **Registry**: Reuse powerful components that other A-Frame developers
have created and shared. The [A-Frame
Registry](https://aframe.io/aframe-registry) collects and curates components
similar to the Unity Asset Store. Stand on the shoulders of giants and plug in
components right from HTML.

:runner: **Features**: Hit the ground running with A-Frame's built-in
components such as geometries, materials, lights, animations, models,
raycasters, shadows, positional audio, Vive / Touch / Cardboard controls. Get
even further with community components such as particle systems, physics,
multiuser, oceans, mountains, speech recognition, or teleportation!

## Usage

### Example

Build VR scenes in the browser with just a few lines of HTML! To start playing
and publishing now, remix the starter example on Glitch:

[![Remix](https://cloud.githubusercontent.com/assets/674727/24572421/688f7fc0-162d-11e7-8a35-b02bc050c043.jpg)](http://glitch.com/~aframe)

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.7.1/aframe.min.js"></script>
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

With A-Frame's [entity-component
architecture](https://aframe.io/docs/0.7.1/core/), we can drop in community
components from the ecosystem (e.g., ocean, physics) and plug them into our
objects straight from HTML:

[![Remix](https://cloud.githubusercontent.com/assets/674727/24572421/688f7fc0-162d-11e7-8a35-b02bc050c043.jpg)](http://glitch.com/~aframe-registry)

```html
<html>
  <head>
    <script src="https://aframe.io/releases/0.7.1/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-animation-component@3.2.1/dist/aframe-animation-component.min.js"></script>
    <script src="https://unpkg.com/aframe-particle-system-component@1.0.x/dist/aframe-particle-system-component.min.js"></script>
    <script src="https://unpkg.com/aframe-extras.ocean@%5E3.5.x/dist/aframe-extras.ocean.min.js"></script>
    <script src="https://unpkg.com/aframe-gradient-sky@1.0.4/dist/gradientsky.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-entity id="rain" particle-system="preset: rain; color: #24CAFF; particleCount: 5000"></a-entity>

      <a-entity id="sphere" geometry="primitive: sphere"
                material="color: #EFEFEF; shader: flat"
                position="0 0.15 -5"
                light="type: point; intensity: 5"
                animation="property: position; easing: easeInOutQuad; dir: alternate; dur: 1000; to: 0 -0.10 -5; loop: true"></a-entity>

      <a-entity id="ocean" ocean="density: 20; width: 50; depth: 50; speed: 4"
                material="color: #9CE3F9; opacity: 0.75; metalness: 0; roughness: 1"
                rotation="-90 0 0"></a-entity>

      <a-entity id="sky" geometry="primitive: sphere; radius: 5000"
                material="shader: gradient; topColor: 235 235 245; bottomColor: 185 185 210"
                scale="-1 1 1"></a-entity>

      <a-entity id="light" light="type: ambient; color: #888"></a-entity>
    </a-scene>
  </body>
</html>
```

### Builds

To use the latest stable build of A-Frame, include [`aframe.min.js`](https://aframe.io/releases/0.7.1/aframe.min.js):

```js
<head>
  <script src="https://aframe.io/releases/0.7.1/aframe.min.js"></script>
</head>
```

To check out the stable and master builds, see the [`dist/` folder](dist/).

### npm

```sh
npm install --save aframe
# Or yarn add aframe
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
