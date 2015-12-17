# A-Frame Core

A DOM-based [Entity-Component System](https://en.wikipedia.org/wiki/Entity_component_system) to declaratively create 3D and VR worlds in the browser.

> This library is specific to the core A-Frame library. For more information about the A-Frame project as a whole, head over to [the A-Frame site](https://aframe.io) or [the `aframe` repo](https://github.com/aframevr/aframe/).

## Entity-Component System

[Entity-Component System](https://en.wikipedia.org/wiki/Entity_component_system) is an architectural pattern commonly used in game engines such as Unity, PlayCanvas, an Unreal Engine 4+.

There's only one basic element called an **entity** that defines a scale, a position, and a rotation in the scene. **Components** encapsulate logic and data that can be attached to entities to extend their functionality, appearance, and behavior. In A-Frame, **entities** are represented by `<a-entity>` DOM __elements__ and **components** as their __attributes__. This is what a simple scene with a cube and a camera looks like:

```html
<a-scene>
    <a-entity camera="fov: 45"></a-entity>
    <a-entity position="0 0 -10" rotation="45 30 0"
              geometry="primitive: box; height: 4; width: 4; depth: 4"
              material="color: green"></a-entity>
</a-scene>
```

## Usage

__NOTE:__ For folks creating scenes and third-party components and elements, we recommend getting started by instead using the [__`aframe`__ library](https://github.com/aframevr/aframe/), a set of core resuable elements.

Proceed below if you would like to use the minimal set of primitive components and elements available here in __`aframe-core`__.

### CodePen

If you want to get started immediately, just fire up __[this CodePen example scene](http://codepen.io/team/mozvr/pen/BjygdO?editors=100)__!

### Downloads

To get started, simply include these files in your project:

* [`aframe.min.js`](https://aframevr.github.io/aframe/dist/aframe.min.js)

Or if you'd prefer the unminified version for local development (with source maps):

* [`aframe-core.js`](dist/aframe-core.js)

__Also, be sure to check out these awesome examples:__

* [__`aframe-core`__ examples](https://aframevr.github.io/aframe-core/examples/) ([source](https://github.com/aframevr/aframe-core/tree/master/examples/))
* [__`aframe`__ examples](https://aframevr.github.io/aframe/examples/) ([source](https://github.com/aframevr/aframe/tree/master/examples/))

### npm

First install from npm:

    npm install aframe-core

And in your Browserify/Webpack modules, simply require the module:

    require('aframe-core')

## Local installation and development

Alternatively, you can clone this repository to work locally on this project.

    git clone https://github.com/aframevr/aframe-core.git
    cd aframe-core
    npm install

To start the local development server:

    npm start

And fire up __[http://localhost:9001](http://localhost:9001)__!


### Running tests

After you have [cloned the repo and installed the dependencies](#local-installation-and-development), simply run the tests like so:

    npm test

## Browser console logging

If you'd like to see helpful logs, warnings, and errors, you can enable logging from the console of your favourite developer tools:

    localStorage.logs = 1

And to disable:

    localStorage.logs = 0

## Maintainers

Ensure you have [cloned the repo and installed the dependencies](#local-installation-and-development).

### Developing alongside the other aframe packages (e.g., [`aframe`](https://github.com/aframevr/aframe/))

If you want to make changes to the [__`aframe`__](https://github.com/aframevr/aframe/) library and test with `aframe-core`, you'll need to run these commands to link things up correctly.

#### Linking

When you are in the directory of your __`aframe-core`__ repo checkout:

    npm link

When you are in the directory of your __`aframe`__ repo checkout:

    npm link aframe-core

Now when you make changes to `aframe-core`, those changes will get reflected when a bundle gets built (the page is refreshed or a `aframe` file is changed), so you can test the `aframe-core` dependency against `aframe` without having to manually push things to `npm` for testing (which is a big no no!).

#### Unlinking

You'll need to `npm unlink` when you are done testing things and want to actually use the npm-published versions, not your versions that are locally linked.

From your __`aframe-core`__ directory:

    npm unlink

From your __`aframe`__ directory:

    npm unlink aframe-core

### Releasing and publishing a new version to [npm](https://www.npmjs.com/)

To increment the preminor version of the package (e.g., `0.1.19` to `0.1.20`) and create a git tag (e.g., `v0.1.20`):

    npm run release:bump

___NOTE:___ npm versions __cannot__ be unpublished.

Once the package is 100% ready to go, to push the new version to npm (e.g., `0.1.20`) and to the new tag to GitHub (e.g., `v0.1.20`):

    npm run release:push

## Updating `dist` files

    npm run dist
    git commit -am 'Bump dist'

## Publishing to GitHub Pages

To publish to __https://aframevr.github.io/aframe-core/__:

    npm run ghpages

To publish to __https://your_username.github.io/aframe-core/__:

    npm run ghpages your_username

## License

This program is free software and is distributed under an [MIT License](LICENSE).
