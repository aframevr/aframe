---
title: Getting Started
type: introduction
layout: docs
parent_section: introduction
order: 2
installation: true
---

<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

Welcome! Make sure to read the [introduction][introduction]. If you're ready to
go, there are multiple ways of getting started.

<!--toc-->

## Play with CodePen

[CodePen][codepen] is a playground for front-end web development. We can edit
HTML and JavaScript directly in the browser with its text editor, see changes
live, and share code snippets. This is a fast way to dive in without having to
download or install anything. Check out the [official MozVR
CodePens](http://codepen.io/mozvr/) and the [A-Frame Hello World
CodePen][codepen]:

**Note:** VR mode currently won't work until the `allowvr` attribute is added to CodePen's I-Frames.

<p data-height="300" data-theme-id="0" data-slug-hash="BjygdO" data-default-tab="html" data-user="mozvr" class="codepen">See the Pen <a href="http://codepen.io/team/mozvr/pen/BjygdO/">Hello World â A-Frame</a> by Mozilla VR (<a href="http://codepen.io/mozvr">@mozvr</a>) on <a href="http://codepen.io">CodePen</a>.</p>

## Grab the Boilerplate

The boilerplate contains:

- A simple HTML file that links to the [current version of A-Frame](#builds-prod) of A-Frame
- An optional local development server
- An easy deployment workflow for [GitHub Pages][ghpages] to share with the world

We can grab the boilerplate in one of two ways:

<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/">Fork on GitHub</a>

<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/archive/master.zip" download="aframe-boilerplate.zip">Download .ZIP<span></span></a>

In either case, it is important to [serve the boilerplate from a local server](#using-a-local-server) so that assets load correctly.

## Include the JS Build

If we want to just include the JS build from the CDN, we can drop a `<script>` tag straight into our HTML:

```html
<!-- Production Version, Minified -->
<script src="https://aframe.io/releases/0.4.0/aframe.min.js"></script>

<!-- Development Version, Uncompressed with Source Maps -->
<script src="https://aframe.io/releases/0.4.0/aframe.js"></script>
```

If we want to serve it locally, we can download the JS build:

<a id="builds-prod" class="btn btn-download" href="https://aframe.io/releases/0.4.0/aframe.min.js" download>Production Version <span>0.4.0</span></a> <em class="install-note">Minified</em>
<a id="builds-dev" class="btn btn-download" href="https://aframe.io/releases/0.4.0/aframe.js" download>Development Version <span>0.4.0</span></a> <em class="install-note">Uncompressed with Source Maps</em>

It is important to [serve the HTML from a local server](#using-a-local-server) so that assets load correctly.

## Install from npm

For more advanced users who want to use their own build steps, we can install through npm:

```bash
# Latest stable version (https://www.npmjs.com/package/aframe)
$ npm install aframe

# Bleeding-edge version (https://github.com/aframevr/aframe)
$ npm install aframevr/aframe
```

Then we can just require A-Frame from our app, perhaps built with Browserify or Webpack:

```js
require('aframe');
```

## Using a Local Server

We should develop with a local server so that files are properly served. We can either:

- Download the [Mongoose](https://www.cesanta.com/products/binary) application
  and open it from the same directory as your HTML file.
- Use Node and npm to start the local server with `npm install && npm run start`.

[angle]: https://www.npmjs.com/package/angle

If you have npm, you can get started with scene template right from the command
line with [`angle`][angle], a command line interface for A-Frame:

```sh
npm install -g angle && angle initscene
```

[codepen]: http://codepen.io/team/mozvr/pen/BjygdO
[introduction]: ./index.md
[ghpages]: https://pages.github.com/
