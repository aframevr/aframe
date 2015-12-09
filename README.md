# aframe

Building blocks for the VR Web.


## Usage

### CodePen

If you want to get hacking immediately, just fire up [__this CodePen example scene__](http://codepen.io/team/aframevr/pen/6e013bf4b446e85d8f268e937ee09143?editors=100)!

### Downloads

If you would like to embed this library in your project, simply include this file:

* [`aframe.min.js`](https://aframevr.github.io/aframe/dist/aframe.min.js)

Or if you'd prefer unminified files for local development (with source maps):

* [`aframe.js`](https://aframevr.github.io/aframe/dist/aframe.js)

__Also, be sure to check out the awesome [examples](https://aframevr.github.io/aframe/examples/).__

### npm

First install from npm:

    npm install aframe

And in your Browserify/Webpack modules, simply require the module:

    require('aframe')


## Local Development

If you'd like to hack on components and/or examples, simply run these commands to get started:

    git clone git@github.com:aframevr/aframe.git
    cd aframe && npm install && npm start

If you'd like to hack on this project and don't have access to the npm packages, contact @cvan and he'll give you the info you'll need to log in:

    npm login

And fire up __[http://localhost:9000](http://localhost:9000)__!


### Working with [`aframe-core`](https://github.com/aframevr/aframe-core/) library

If you want to make changes to the [__`aframe-core`__](https://github.com/aframevr/aframe-core/) library and test with `aframe`, you'll need to run these commands to link things up correctly.

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

To publish to __https://aframevr.github.io/aframe/__:

    npm run ghpages

To publish to __https://your_username.github.io/aframe/__:

    npm run ghpages your_username
