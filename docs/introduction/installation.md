---
title: Installation
type: introduction
layout: docs
parent_section: introduction
order: 2
---

This installation section offers several ways to get started with A-Frame,
although most methods don't require any actual installation since A-Frame
is primarily HTML and JavaScript.

<!--toc-->

## Code Editors in the Browser

The fastest way is to start playing from within the browser.

### Remix on Glitch

![Glitch](https://cloud.githubusercontent.com/assets/674727/24480466/54b17d22-1499-11e7-8a18-d4f76b49ad07.jpg)

[glitch]: https://glitch.com/~aframe

[Glitch][glitch] provides an online code editor with instant deployment and
hosting of web sites. The editor supports both front-end and back-end code as
well as multiple files and directories. Glitch lets us remix (i.e., copy)
existing projects and make them our own and instantly host and deploy changes
for everyone to see.

[Hit **Remix** on this A-Frame project][glitch], mess with the HTML in
`index.html`, and see your site published live on each change! The base A-Frame
Glitch, for example, is published at `aframe.glitch.me`, but we will provide your
own custom URL name.

Below are a few other A-Frame Glitches for starters:

- [aframe-aincraft](https://glitch.com/~aframe-aincraft) - Minecraft demo.
- [aframe-gallery](https://glitch.com/~aframe-gallery) - 360&deg; image gallery.
- [aframe-registry](https://glitch.com/~aframe-registry) - Showcase of various components.
- [aframe-vaporwave](https://glitch.com/~aframe-vaporwave) - Retro-futuristic scene.
- [networked-aframe](https://glitch.com/~networked-aframe) - Multiuser.

### Other Code Editors

Below are a couple of A-Frame starter kits on other browser-based code
editors. Both support remixing or forking:

- [CodePen &mdash; A-Frame](https://codepen.io/mozvr/pen/BjygdO)

## Local Development

### Use a Local Server

For the options below, we should develop projects using a local server so that
files are properly served. Options of local servers include:

- Downloading the [Mongoose](https://www.cesanta.com/products/binary) application
  and opening it from the same directory as your HTML file.
- Running `python -m SimpleHTTPServer` (or `python -m http.server` for Python 3)
  in a terminal in the same directory as your HTML file.
- Running `npm install -g live-server && live-server` in a terminal in the same
  directory as your HTML file.

Once we are running our server, we can open our project in the browser using
the local URL and port which the server is running on (e.g.,
`http://localhost:8000`). Try *not* to open the project using the `file://`
protocol which does not provide a domain; absolute and relative URLs may not
work.

### Download the Boilerplate on GitHub

[ghpages]: https://pages.github.com/

The boilerplate contains:

- A simple HTML file that links to the [current version of A-Frame](#builds-prod)
- An optional local development server
- An easy deployment workflow for [GitHub Pages][ghpages] to share with the world

We can grab the boilerplate in one of two ways:

<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/">Fork on GitHub</a>
<br>(Note this is marked as 'discontinued', the Aframe version packaged with this is 0.5)

<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/archive/master.zip" download="aframe-boilerplate.zip">Download .ZIP<span></span></a>

### Include the JS Build

To include A-Frame in an HTML file, we drop a `<script>` tag pointing to the
CDN build:

```html
<head>
  <script src="https://aframe.io/releases/1.0.4/aframe.min.js"></script>
</head>
```

If we want to serve it ourselves, we can download the JS build:

<a id="builds-prod" class="btn btn-download" href="https://aframe.io/releases/1.0.4/aframe.min.js" download>Production Version <span>1.0.4</span></a> <em class="install-note">Minified</em>
<a id="builds-dev" class="btn btn-download" href="https://aframe.io/releases/1.0.4/aframe.js" download>Development Version <span>1.0.4</span></a> <em class="install-note">Uncompressed with Source Maps</em>

### Install from npm

We can also install A-Frame through npm:

```bash
$ npm install aframe
```

Then we can bundle A-Frame into our application. For example, with Browserify
or Webpack:

```js
require('aframe');
```

[angle]: https://www.npmjs.com/package/angle

If you use npm, you can use [`angle`][angle], a command line interface for
A-Frame.  `angle` can initialize a scene template with a single command:

```sh
npm install -g angle && angle initscene
```

## Cordova Development

A-Frame is compatible with Cordova apps. Currently, network access is required as A-Frame and its dependencies load assets from CDN sources.

[Cordova A-Frame Showcase App (demo)](https://github.com/benallfree/cordova-aframe-showcase)

### Installation

Install the [cordova-plugin-xhr-local-file](https://github.com/benallfree/cordova-plugin-xhr-local-file) plugin. This is needed because
Cordova runs from `file://`, and XHR requests to local `file://` assets (JSON fonts, 3D models, etc) will fail without this plugin.

```bash
cordova plugin add cordova-plugin-xhr-local-file
```

In your `index.html`, adjust as follows:

```html
<head>
  <meta
        http-equiv="Content-Security-Policy"
        content="
          default-src 
            'self' 
            data: 
            gap: 
            https://ssl.gstatic.com 
            'unsafe-eval' 
            https://cdn.aframe.io         <-- required
            https://dpdb.webvr.rocks      <-- required
            https://fonts.googleapis.com  <-- required
            https://cdn.jsdelivr.net      <-- your choice, see below
            ; 
          style-src 
            'self' 
            'unsafe-inline'
            ; 
          media-src *; 
          img-src 
            'self' 
            data:                         <-- required
            content:                      <-- required
            blob:                         <-- required
            ;
        "
      />
  ...
  <script src="https://cdn.jsdelivr.net/npm/aframe@1.0.4/dist/aframe-master.min.js"></script>
  <script id='my-scene' type="text/html">
    ...your scene goes here...
  </script>
  <script>
    document.addEventListener('deviceready', function() {
      // After the 'deviceready' event, Cordova is ready for you to render your A-Frame scene.
      document.getElementById('scene-root').innerHTML = document.getElementById('my-scene').innerHTML
    })
  </script>
</head>
<body>
  <div id='scene-root'></div>
  ...
</body>
```

### Discussion


#### deviceready
The most important difference between a browser environment and a Cordova environment is waiting for the `deviceready` event
before rendering your scene. 

The sample above shows a pure DOM+JS approach, but you can also use a framework like React:

```javascript
document.addEventListener('deviceready', () => {
  ReactDOM.render(<Root />, document.getElementById('root'))
})
```

#### Layout

Depending on your target device, you may find that A-Frame's default CSS causes certain buttons and controls to appear out of
position or too close to the edge of the phone screen. Supply your own CSS overrides to adjust positioning to fit
the target device.
