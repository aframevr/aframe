---
title: Getting Started
type: guide
layout: docs
parent_section: guide
order: 2
show_guide: true
version: 0.2.0
nav_slug: install
---

There are several ways to get started with A-Frame:

* [Play with CodePen](#CodePen)
* [Grab the Boilerplate](#Boilerplate)
* [Include the JS Build](#Builds)
* [Install from npm](#npm)

## CodePen

[Codepen][codepen] is a playground for front-end web. We can edit HTML and JavaScript directly in the browser with their text editor, see changes live, and share code snippets. This is a fast way to dive in without having to download or install anything. Check out the [official MozVR CodePens](http://codepen.io/team/mozvr/) and the [A-Frame Hello World CodePen][codepen].

## Boilerplate

The boilerplate contains:

- A simple HTML file that links to the [current version of A-Frame][current] of A-Frame
- An optional local development server
- An easy deployment workflow for [GitHub Pages][ghpages] to share with the world

We can grab the boilerplate in one of two ways:

<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/">Fork on GitHub</a>
<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/archive/master.zip" download="aframe-boilerplate.zip">Download .ZIP<span></span></a>

## Builds

If we want to just include the JS build from the CDN, we can drop a script tag straight into our HTML:

```html
<!-- Production Version, Minified -->
<script src="https://aframe.io/releases/{{ aframe_version }}/aframe.min.js></script>

<!-- Development Version, Uncompressed with Source Maps -->
<script src="https://aframe.io/releases/{{ aframe_version }}/aframe.js></script>
```

If we want to serve it locally, we can download the JS build:

<a class="btn btn-download" href="https://aframe.io/releases/{{ aframe_version }}/aframe.min.js" download>Production Version <span>{{ aframe_version }}</span></a> <em class="install-note">Minified</em>
<a class="btn btn-download" href="https://aframe.io/releases/{{ aframe_version }}/aframe.js" download>Development Version <span>{{ aframe_version }}</span></a> <em class="install-note">Uncompressed with Source Maps</em>

## npm

For more advanced users that want to use their own build steps, we can install through npm:

```bash
# Latest stable version.
$ npm install aframe

# Bleeding-edge version (https://github.com/aframevr/aframe/tree/dev)
$ npm install aframevr/aframe#dev
```

Then we can just require A-Frame into our app, perhaps built with Browserify or Webpack:

```js
require('aframe');
```

[codepen]: http://codepen.io/team/mozvr/pen/BjygdO?editors=100
[current]: https://aframe.io/releases/0.2.0/aframe.min.js
[ghpages]: https://pages.github.com/
