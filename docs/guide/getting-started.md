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

## Beginners:
You can quickly check out and play with A-frame [in CodePen](#CodePen):

[CodePen][codepen] is a playground for front-end web development. We can edit HTML and JavaScript directly in the browser with their text editor, see changes live, and share code snippets. This is a fast way to dive in without having to download or install anything. Check out the [official MozVR CodePens](http://codepen.io/mozvr/) and the [A-Frame Hello World CodePen][codepen]:

<p data-height="300" data-theme-id="0" data-slug-hash="BjygdO" data-default-tab="html" data-user="mozvr" class="codepen">See the Pen <a href="http://codepen.io/team/mozvr/pen/BjygdO/">Hello World, A-Frame</a> by Mozilla VR (<a href="http://codepen.io/mozvr">@mozvr</a>) on <a href="http://codepen.io">CodePen</a>.</p>

Now you can get started developing your own A-frame sites.  

1) If you don't have one already, you’ll need a place to store and publish your code.  [Create a github account.](https://github.com/join)

2) Next you’ll need a way to keep track of the changes you make to your code as it is developed.  
[Download and install git.](http://git-scm.com/download)

Git is open source version control software that helps you track changes to your code as it is developed.  It is the de facto standard for developers to help them keep track of changes in their code.

3) Download the A-frame framework for creating virtual reality web experiences from Github.  <a class="btn btn-download" href="https://github.com/aframevr/aframe-boilerplate/archive/master.zip" download="aframe-boilerplate.zip">Download .ZIP<span></span></a>

4) Install Node.  Node simply executes your code so that you can view it in your browser.  [Download node.](https://nodejs.org/en/download/)

As part of the installation you just did for Node, a program called NPM was installed.  NPM checks for packages of code on your computer and looks for dependencies on other packages to help you know which versions of code you are working with and help you find what is missing.  

Here’s a [great resource] (https://try.github.io/levels/1/challenges/1) to learn a bit more about how to use git and the command line.

5) Next you can start your very own development server with these magical words in the terminal:
```bash
# Start your server 
$ npm start
```


6) Go to your Firefox browser window and put in 
```bash
http://localhost:9000
``` 
as the URL or address.

7) Right click on an example file in your A-frame folder to open in Firefox.  

You should see that scene working in your browser!  

8) Now, open an HTML text editor like [Atom](https://atom.io/) or your favorite text editor.  

You can start testing out and making changes in your text editor to build your virtual reality environments.

9) Once you've made a change in your text editor, the easiest way to publish your virtual reality page is through [github pages.](https://pages.github.com/)  You can follow these quick and easy instructions to [publish your site.](https://pages.github.com/)


## Developers:

Download the A-frame boilerplate that contains:

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
