# aframe

Building blocks for the VR Web.


## Usage

### Codepen

If you want to get hacking immediately, just fire up [__this Codepen example scene__](http://codepen.io/team/mozvr/pen/6e013bf4b446e85d8f268e937ee09143?editors=100)!

### Downloads

If you would like to embed this library in your project, simply include these files:

* [`aframe.min.js`](https://mozvr.github.io/aframe/dist/aframe.min.js)
* [`aframe.min.html`](https://mozvr.github.io/aframe/dist/aframe.min.html)

Or if you'd prefer unminified files for local development (with source maps):

* [`aframe.js`](https://mozvr.github.io/aframe/dist/aframe.js)
* [`aframe.html`](https://mozvr.github.io/aframe/dist/aframe.html)

__Also, be sure to check out the awesome [examples](https://mozvr.github.io/aframe/examples/).__

### npm

First install from npm:

    npm install aframe

And in your Browserify/Webpack modules, simply require the module:

    require('aframe')


## Local Development

If you'd like to hack on components and/or examples, simply run these commands to get started:

    git clone git@github.com:MozVR/aframe.git
    cd aframe
    npm install
    npm start

If you'd like to hack on this project and don't have access to the npm packages, contact @cvan and he'll give you the info you'll need to log in:

    npm login

And fire up __[http://localhost:9000](http://localhost:9000)__!


### Working with [`aframe-core`](https://github.com/MozVR/aframe-core/) library

If you want to make changes to the [__`aframe-core`__](https://github.com/MozVR/aframe-core/) library and test with `aframe`, you'll need to run these commands to link things up correctly.

#### Linking

When you are in the directory of your __`aframe-core`__ repo checkout:

    npm link

When you are in the directory of your __`aframe`__ repo checkout:

    npm link @mozvr/aframe-core

Now when you make changes to `aframe-core`, those changes will get reflected when a bundle gets built (the page is refreshed or a `aframe` file is changed), so you can test the `aframe-core` dependency against `aframe` without having to manually push things to `npm` for testing (which is a big no no!).

#### Unlinking

You'll need to `npm unlink` when you are done testing things and want to actually use the npm-published versions, not your versions that are locally linked.

From your __`aframe-core`__ directory:

    npm unlink

From your __`aframe`__ directory:

    npm unlink @mozvr/aframe-core


## Publishing to GitHub Pages

To publish to __https://mozvr.github.io/aframe/__:

    npm run ghpages

To publish to __https://cvan.github.io/aframe/__:

    npm run ghpages cvan
