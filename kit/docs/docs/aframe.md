# a-frame

Markup to construct 3D scenes in a declarative fashion.

Compatible with WebVR for Oculus and Cardboard.


## Usage

There are a couple ways to get started.

### Codepen

If you want to get hacking immediately:

[__Open Codepen example scene >__](http://codepen.io/team/mozvr/pen/1d1816df793bd808a3cc6b9515a163f6?editors=100)

### Downloads

If you would like to embed this library in your project, simply include these files:

* [`vr-components.min.js`](https://mozvr.github.io/aframe/dist/vr-components.min.js)
* [`vr-components.min.html`](https://mozvr.github.io/aframe/dist/vr-components.min.html)

Or if you'd prefer unminified files for local development (with source maps):

* [`vr-components.js`](https://mozvr.github.io/aframe/dist/vr-components.js)
* [`vr-components.html`](https://mozvr.github.io/aframe/dist/vr-components.html)

__Also, be sure to check out the awesome [examples](https://mozvr.github.io/aframe/examples/).__

### npm

First install from npm:

    npm install vr-components

And in your Browserify/Webpack modules, simply require the module:

    require('vr-components')


## Local Development

If you'd like to hack on components and/or examples, simply run these commands to get started:

    git clone git@github.com:MozVR/vr-components.git
    cd vr-components
    npm install
    npm start

If you'd like to hack on this project and don't have access to the npm packages, contact @cvan and he'll give you the info you'll need to log in:

    npm login

And fire up __[http://localhost:9000](http://localhost:9000)__!


### Working with [`vr-markup`](https://github.com/MozVR/vr-markup/) library

If you want to make changes to the [__`vr-markup`__](https://github.com/MozVR/vr-markup/) library and test with `vr-components`, you'll need to run these commands to link things up correctly.

#### Linking

When you are in the directory of your __`vr-markup`__ repo checkout:

    npm link

When you are in the directory of your __`vr-components`__ repo checkout:

    npm link @mozvr/vr-markup

Now when you make changes to `vr-markup`, those changes will get reflected when a bundle gets built (the page is refreshed or a `vr-components` file is changed), so you can test the `vr-markup` dependency against `vr-components` without having to manually push things to `npm` for testing (which is a big no no!).

#### Unlinking

You'll need to `npm unlink` when you are done testing things and want to actually use the npm-published versions, not your versions that are locally linked.

From your __`vr-markup`__ directory:

    npm unlink

From your __`vr-components`__ directory:

    npm unlink @mozvr/vr-markup


## Publishing to GitHub Pages

To publish to __https://mozvr.github.io/aframe/__:

    npm run ghpages

To publish to __https://cvan.github.io/aframe/__:

    npm run ghpages cvan
