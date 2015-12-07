# AFrame Core

A DOM based [Entity Component System](https://en.wikipedia.org/wiki/Entity_component_system) to declaratively create 3D worlds in the browser.

## Entity Component

It's an architectural pattern commonly used in game engines like Unity, Playcanvas or Unreal Engine 4+.

There's only one basic element called **entity** that defines a scale, position and a rotation in the scene. **Components** encapsulate logic and data that can be attached to entities to extend their functionality, appearance and behaviour. Entities are represented by ```a-entity``` DOM elements and components as their attributes. This is what a simple scene with a cube and a camera looks like:

````html
<a-scene>
    <a-entity camera="fov: 45"></a-entity>
    <a-entity position="0 0 -10" rotation="45 30 0"
              geometry="primitive: box; height: 4; width: 4; depth: 4;"
              material="color: green;"></a-entity>
</a-scene>
````

## Usage

__NOTE:__ For folks creating scenes and third-party components + elements, we recommend getting started by instead using the [__`aframe`__ library](https://github.com/aframevr/aframe), a set of core resuable elements.

Proceed below if you would like to use the minimal set of primitive components and elements available here in __`aframe-core`__.

### CodePen

If you want to get hacking immediately, just fire up __[this CodePen example scene](http://codepen.io/team/mozvr/pen/df736964b5ee14288a18199d4e27afe3?editors=100)__!

### Downloads

To get started, simply include these files in your project:

* [`aframe-core.min.js`](dist/aframe-core.min.js)
* [`aframe-core.min.css`](dist/aframe-core.min.css)

Or for local development you can use the unminified bundles (with source maps for the JS):

* [`aframe-core.js`](dist/aframe-core.js)
* [`aframe-core.css`](dist/aframe-core.css)

__Also, be sure to check out these awesome examples:__

* [__`aframe-core`__ examples](http://aframevr.github.io/aframe-core/examples/) ([source](https://github.com/aframevr/aframe-core/tree/master/examples/))
* [__`aframe`__ examples](http://aframevr.github.io/aframe/examples/) ([source](https://github.com/aframevr/aframe/tree/master/examples/))

### npm

First install from npm:

    npm install @mozvr/aframe-core

And in your Browserify/Webpack modules, simply require the module:

    require('@mozvr/aframe-core')

## Local installation

    git clone https://github.com/aframevr/aframe-core.git
    cd aframe-core

## Local development

    npm install
    npm start
    open http://localhost:9001/examples/

If you'd like to hack on this project and don't have access to the npm repos, contact @cvan and he'll give you the info you'll need to log in:

    npm login

### Working with [`aframe`](https://github.com/aframevr/aframe/) library

If you want to make changes to the [__`aframe`__](https://github.com/aframevr/aframe/) library and test with `aframe-core`, you'll need to run these commands to link things up correctly.

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

## Browser console logging

If you'd like to see helpful logs, warnings, and errors, you can enable logging from the console of your favourite developer tools:

    localStorage.logs = 1

And to disable:

    localStorage.logs = 0

## Running tests

    npm test

## Pulling the lastest remote changes

    git checkout dev
    git pull --rebase
    npm install
    npm start
    open http://localhost:9001/examples/

## Releasing and publishing a new version to npm

Assuming you want to publish a version of `dev` to the private package for testing:

    npm run release

And to push the tags to GitHub:

    git push --tags

## Updating `dist` files

    npm run dist
    git commit -am 'Bump dist'

## Publishing to GitHub Pages

To publish to __https://aframevr.github.io/aframe-core/__:

    npm run ghpages

To publish to __https://cvan.github.io/aframe-core/__:

    npm run ghpages cvan


## License

This program is free software and is distributed under an [MIT License](LICENSE).
