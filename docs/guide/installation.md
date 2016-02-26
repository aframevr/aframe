---
title: Installation
type: guide
layout: docs
parent_section: guide
order: 2
show_guide: true
aframe_version: 0.1.2
nav_slug: install
---

## Boilerplate Starter Kit

The boilerplate starter kit is a great way to start a new A-Frame project. It includes a few basic elements within an `<a-scene>` element, and links to the [latest version](https://aframe.io/releases/latest/aframe.min.js) of the framework. There are several ways to get started with the boilerplate:

<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/archive/master.zip" download="aframe-boilerplate.zip">Download Boilerplate<span></span></a>
<a class="btn btn-download" href="http://codepen.io/team/mozvr/pen/BjygdO?editors=100">Fork Boilerplate CodePen</a>
<a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/">Clone Boilerplate Repo</a>

Cloning the repo is recommended for users who are comfortable with git. For npm users, the boilerplate also includes an optional local development server with Live Reloading (via [@mattdesl](https://github.com/mattdesl/)'s fantastic [budo](https://github.com/mattdesl/budo)) and built-in (optional) support for [Browserify](http://browserify.org/), as well as a [GitHub Pages](https://pages.github.com/) deployment workflow.

## Standalone Downloads

If you don't need the Boilerplate and want to work with just the A-Frame JavaScript, download or link to the version from below, and then include A-Frame within a `<script>` tag. This gives you access to the full A-Frame feature set, and registers `AFRAME` as a global variable.

<a class="btn btn-download" href="https://aframe.io/releases/latest/aframe.min.js" download>Production Version <span>{{aframe_version}}</span></a> <em class="install-note">Minified</em>
<a class="btn btn-download" href="https://aframe.io/releases/latest/aframe.js" download>Development Version <span>{{aframe_version}}</span></a> <em class="install-note">Uncompressed, includes source maps</em>

<div class="tip">_**Note:** The minified version is not recommended for use during development, as it does not provide the useful warnings for common mistakes that the unminified version does._</div>

## npm

npm is the recommended installation method when building scenes with A-Frame. It pairs nicely with a CommonJS module bundler such as [Webpack](http://webpack.github.io/) or [Browserify](http://browserify.org/).

```bash
# latest stable version
$ npm install aframe

# dev build (directly from GitHub)
$ npm install mozvr/aframe#dev
```

## AMD Module Loaders

The standalone downloads or versions installed via npm are wrapped with UMD so they can be used directly as an AMD module.
