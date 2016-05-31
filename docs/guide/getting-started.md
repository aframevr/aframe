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

<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

There are several ways to get started with A-Frame:

* [Play with CodePen](#CodePen)
* [Grab the Boilerplate](#Boilerplate)
* [Include the JS Build](#Builds)
* [Install from npm](#npm)

## CodePen

[CodePen][codepen] is a playground for front-end web development. We can edit HTML and JavaScript directly in the browser with their text editor, see changes live, and share code snippets. This is a fast way to dive in without having to download or install anything. Check out the [official MozVR CodePens](http://codepen.io/mozvr/) and the [A-Frame Hello World CodePen][codepen]:

<p data-height="300" data-theme-id="0" data-slug-hash="BjygdO" data-default-tab="html" data-user="mozvr" class="codepen">See the Pen <a href="http://codepen.io/team/mozvr/pen/BjygdO/">Hello World â A-Frame</a> by Mozilla VR (<a href="http://codepen.io/mozvr">@mozvr</a>) on <a href="http://codepen.io">CodePen</a>.</p>

## Boilerplate

The boilerplate contains:

- A simple HTML file that links to the [current version of A-Frame](#builds-prod) of A-Frame
- An optional local development server
- An easy deployment workflow for [GitHub Pages][ghpages] to share with the world

We can grab the boilerplate in one of two ways:

<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/">Fork on GitHub</a>

<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/archive/master.zip" download="aframe-boilerplate.zip">Download .ZIP<span></span></a>

## Builds

If we want to just include the JS build from the CDN, we can drop a `<script>` tag straight into our HTML:

```html
<!-- Production Version, Minified -->
<script src="https://aframe.io/releases/{{ version }}/aframe.min.js"></script>

<!-- Development Version, Uncompressed with Source Maps -->
<script src="https://aframe.io/releases/{{ version }}/aframe.js"></script>
```

<script>
  // NOTE: Hack because variables doesn't get interpolated correctly in Markdown code blocks.
  var versionEls = document.querySelectorAll('.highlight .code .string');
  for (var i = 0; i < versionEls.length; ++i) {
    versionEls[i].textContent = versionEls[i].textContent.replace('\{\{ version \}\}', '{{ version }}');
  }
</script>

If we want to serve it locally, we can download the JS build:

<a id="builds-prod" class="btn btn-download" href="https://aframe.io/releases/{{ version }}/aframe.min.js" download>Production Version <span>{{ version }}</span></a> <em class="install-note">Minified</em>

<a id="builds-dev" class="btn btn-download" href="https://aframe.io/releases/{{ version }}/aframe.js" download>Development Version <span>{{ version }}</span></a> <em class="install-note">Uncompressed with Source Maps</em>

## npm

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

[codepen]: http://codepen.io/team/mozvr/pen/BjygdO
[ghpages]: https://pages.github.com/
