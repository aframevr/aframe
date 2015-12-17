# aframe

Building blocks for the VR Web.


## Usage

### CodePen

If you want to get started immediately, just fire up [__this CodePen example scene__](http://codepen.io/team/mozvr/pen/BjygdO?editors=100)!

### Downloads

If you would like to embed this library in your project, simply include this file:

* [`aframe.min.js`](https://aframe.io/releases/latest/aframe.min.js)

Or if you'd prefer the unminified version for local development (with source maps):

* [`aframe.js`](https://aframe.io/releases/latest/aframe.js)

__Also, be sure to check out the awesome [examples](https://aframe.io/examples/) (or [the ones in this repository](examples/)).__

### npm

First install from npm:

    npm install aframe

And in your Browserify/Webpack modules, simply require the module:

    require('aframe')


## Local installation and development

Alternatively, you can clone this repository to work locally on this project and explore the examples.

    git clone git@github.com:aframevr/aframe.git
    cd aframe && npm install

To start the local development server:

    npm start

And fire up __[http://localhost:9000](http://localhost:9000)__!

## Browser console logging

If you'd like to see helpful logs, warnings, and errors, you can enable logging from the console of your favourite developer tools:

    localStorage.logs = 1

And to disable:

    localStorage.logs = 0


## Maintainers

Ensure you have [cloned the repo and installed the dependencies](#local-installation-and-development).

### Developing alongside the other aframe packages (e.g., [`aframe-core`](https://github.com/aframevr/aframe-core/))

If you want to make changes to the [__`aframe-core`__](https://github.com/aframevr/aframe-core/) library and test with `aframe`, you'll need to run these commands to link things up correctly.

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

To publish to __https://aframevr.github.io/aframecore/__:

    npm run ghpages

To publish to __https://your_username.github.io/aframe/__:

    npm run ghpages your_username

## License

This program is free software and is distributed under an [MIT License](LICENSE).
