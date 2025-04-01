<h1 align="center">A-Frame</h1>

<p align="center"><a href="https://aframe.io" target="_blank"><img width="480" alt="A-Frame" src="https://user-images.githubusercontent.com/674727/32120889-230ef110-bb0f-11e7-908c-76e39aa43149.jpg"></a></p>

<p align="center"><b>A web framework for building browser based 3D, AR and VR experiences.</b></p>

<p align="center">
  <a href="https://codecov.io/gh/aframevr/aframe">
    <img src="https://codecov.io/gh/aframevr/aframe/branch/master/graph/badge.svg" alt="Coverage Status">
  </a>
  <a href="https://npmjs.org/package/aframe">
    <img src="https://img.shields.io/npm/dt/aframe.svg?style=flat-square" alt="Downloads">
  </a>
  <a href="https://npmjs.org/package/aframe">
    <img src="https://img.shields.io/npm/v/aframe.svg?style=flat-square" alt="Version">
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
  <a href="https://aframe.io/aframe/examples/">Examples</a>
  &mdash;
  <a href="https://aframe.io/school/">School</a>
  &mdash;
  <a href="https://aframe.io/community/">Community</a>
</div>

## Examples

<a href="https://supermedium.com/supercraft">
  <img alt="Supercraft" target="_blank" src="https://user-images.githubusercontent.com/674727/41085457-f5429566-69eb-11e8-92e5-3210e4c6c4a0.gif" height="190" width="32%">
</a>
<a href="https://aframe.io/a-painter/?url=https://ucarecdn.com/962b242b-87a9-422c-b730-febdc470f203/">
  <img alt="A-Painter" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531388/acfc3dda-156d-11e7-8563-5bd75252f70f.gif" height="190" width="32%">
</a>
<a href="https://supermedium.com">
  <img alt="Supermedium" target="_blank" src="https://user-images.githubusercontent.com/674727/37294616-7212cd20-25d3-11e8-9e7f-c0c61074f1e0.png" height="190" width="32%">
</a>
<a href="https://aframe.io/a-blast/">
  <img alt="A-Blast" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531440/0336e66e-156e-11e7-95c2-f2e6ebc0393d.gif" height="190" width="32%">
</a>
<a href="https://aframe.io/a-saturday-night/">
  <img alt="A-Saturday-Night" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531477/44272daa-156e-11e7-8ef9-d750ed430f3a.gif" height="190" width="32%">
</a>
<a href="https://github.com/googlecreativelab/webvr-musicalforest">
  <img alt="Musical Forest by @googlecreativelab" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/25109861/b8e9ec48-2394-11e7-8f2d-ea1cd9df69c8.gif" height="190" width="32%">
</a>

*Find more examples on [the homepage](https://aframe.io), [A Week of A-Frame](https://aframe.io/blog/), and [WebVR Directory](https://webvr.directory).*

## Features

:eyeglasses: **Virtual Reality Made Simple**: A-Frame handles the 3D and WebXR
boilerplate required to get running across platforms including mobile, desktop, and all headsets (compatible with a WebXR capable browser) just by dropping in `<a-scene>`.

:heart: **Declarative HTML**: HTML is easy to read and copy-and-paste. Since
A-Frame can be used from HTML, A-Frame is accessible to everyone: web
developers, VR and AR enthusiasts, educators, artists, makers, kids.

:electric_plug: **Entity-Component Architecture**: A-Frame is a powerful
framework on top of three.js, providing a declarative, composable, reusable
entity-component structure for three.js. While A-Frame can be used from HTML,
developers have unlimited access to JavaScript, DOM APIs, three.js, WebXR, and
WebGL.

:zap: **Performance**: A-Frame is a thin framework on top of three.js.
Although A-Frame uses the DOM, A-Frame does not touch the browser layout
engine. Performance is a top priority, being battle-tested on highly
interactive WebXR experiences.

:globe_with_meridians: **Cross-Platform**: Build VR and AR applications for any headset compatible with a WebXR capable browser. Don't have a headset or controllers? No
problem! A-Frame still works on standard desktop and smartphones.

:mag: **Visual Inspector**: A-Frame provides a built-in visual 3D inspector
with a workflow similar to a browser's developer tools and interface similar to
Unity. Open up any A-Frame scene and hit `<ctrl> + <alt> + i`.

:runner: **Features**: Hit the ground running with A-Frame's built-in
components such as geometries, materials, lights, animations, models,
raycasters, shadows, positional audio, tracked controllers. Get even further
with community components such as particle systems, physics, multiuser, oceans,
mountains, speech recognition, or teleportation!

## Usage

### Example

Build VR and AR scenes in the browser with just a few lines of HTML! To start playing
and publishing now, remix the starter example on:

[![Remix](https://cloud.githubusercontent.com/assets/674727/24572421/688f7fc0-162d-11e7-8a35-b02bc050c043.jpg)](https://glitch.com/~aframe)
```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.7.1/aframe.min.js"></script>
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
architecture](https://aframe.io/docs/1.7.1/introduction/entity-component-system.html), we can drop in community
components from the ecosystem (e.g., ocean, physics) and plug them into our
objects straight from HTML:

[![Remix](https://cloud.githubusercontent.com/assets/674727/24572421/688f7fc0-162d-11e7-8a35-b02bc050c043.jpg)](https://glitch.com/~aframe-registry)

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.7.1/aframe.min.js"></script>
    <script src="https://unpkg.com/@c-frame/aframe-particle-system-component@1.2.x/dist/aframe-particle-system-component.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.5.0/dist/aframe-extras.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@fern-solutions/aframe-sky-background/dist/sky-background.umd.min.js"></script>
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

      <a-sky-background top-color="#EBEBF5" bottom-color="#B9B9D2"></a-sky-background>

      <a-entity id="light" light="type: ambient; color: #888"></a-entity>
    </a-scene>
  </body>
</html>
```

### Builds

To use the latest stable build of A-Frame, include [`aframe.min.js`](https://aframe.io/releases/1.7.1/aframe.min.js):

```js
<head>
  <script src="https://aframe.io/releases/1.7.1/aframe.min.js"></script>
</head>
```

To check out the stable and master builds, see the [`dist/` folder](dist/).

### npm

```sh
npm install --save aframe
# Or yarn add aframe
```

```js
import AFRAME from 'aframe';  // e.g., with Webpack or Vite.
```

## Local Development

```sh
git clone https://github.com/aframevr/aframe.git  # Clone the repository.
cd aframe && npm install  # Install dependencies.
npm start  # Start the local development server.
```

And open in your browser [http://localhost:8080](http://localhost:8080).

If you want to test the examples in VR, you need to run it with https:

```sh
npm run start:https
```

Look at the "On Your Network (IPv4)" line in the console, and copy and paste
the url to https://hmd.link service.
Then open the browser in your headset and type hmd.link in the address bar
then click on the copied url that will show up if you're connected to the same
network as your machine.
You will see a message about the page being dangerous because we're using a
self-signed certificate, you can ignore that warning and continue to the page.

### Generating Builds

```sh
npm run dist
```

## Questions

For questions and support, [ask on StackOverflow](https://stackoverflow.com/questions/ask/?tags=aframe).

## Stay in Touch

- Hang out with the [community](https://aframe.io/community/)
- [Follow @aframevr on X](https://x.com/aframevr).

And get in touch with the maintainers!

- [Diego Marcos](https://x.com/dmarcos)
- [Don McCurdy](https://x.com/donrmccurdy)
- [Kevin Ngo](https://x.com/andgokevin)

## Contributing

Get involved! Check out the [Contributing Guide](CONTRIBUTING.md) for how to get started.

You can also support development by [buying a gorgeous A-Frame t-shirt with exclusive designs](https://cottonbureau.com/products/a-frame-og#/9479538/tee-men-standard-tee-vintage-black-tri-blend-s)

## License

This program is free software and is distributed under an [MIT License](LICENSE).
