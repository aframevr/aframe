# A-Frame

> For the core library, check out [A-Frame Core](https://github.com/aframevr/aframe-core/).

__Building blocks for the VR Web.__

- **Virtual Reality**: Drop in the library and have a WebVR scene within a few lines of markup.
- **Based on the DOM**: Manipulate with JavaScript, use with your favorite [libraries and frameworks](https://github.com/aframevr/awesome-aframe).
- **[Entity-Component System](https://aframe.io/docs/core/)**: Use the entity-component system for better composability and flexibility.

Find out more:

- [Guide](https://aframe.io/docs/guide/)
- [Docs](https://aframe.io/docs/core/)
- [Examples](https://aframe.io/examples/)

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


## Local Installation and Development

Alternatively, you can clone this repository to work locally on this project and explore the examples.

    git clone git@github.com:aframevr/aframe.git
    cd aframe && npm install

To start the local development server:

    npm start

And fire up __[http://localhost:9000](http://localhost:9000)__! Saving local JS and HTML files will reload the page.

To have the URL open after the server starts:

    OPEN=1 npm start

To disable live reloading (i.e., automatic page refreshing upon any file changes):

    OPEN=1 LIVE=0 npm start

## Browser console logging

If you'd like to see helpful logs, warnings, and errors, you can enable logging from the console of your favourite developer tools:

    localStorage.logs = 1

And to disable:

    localStorage.logs = 0


## Maintainers

Ensure you have [cloned the repo and installed the dependencies](#local-installation-and-development).

### Publishing to [npm](https://www.npmjs.com/)

To increment the preminor version of the package (e.g., `0.1.19` to `0.1.20`) and create a git tag (e.g., `v0.1.20`):

    npm run release:bump

___NOTE:___ npm versions __cannot__ be unpublished.

Once the package is 100% ready to go, to push the new version to npm (e.g., `0.1.20`) and to the new tag to GitHub (e.g., `v0.1.20`):

    npm run release:push

## Updating `dist` Files

    npm run dist
    git commit -am 'Bump dist'

## Publishing to GitHub Pages

To publish to __https://aframevr.github.io/aframe/__:

    npm run ghpages

To publish to __https://your_username.github.io/aframe/__:

    npm run ghpages your_username

## License

This program is free software and is distributed under an [MIT License](LICENSE).
