# VR MARKUP [![Build Status](https://magnum.travis-ci.com/MozVR/vr-markup.svg?token=65kfkjdCsqTSnqx7qtHg&branch=dev)](https://magnum.travis-ci.com/MozVR/vr-markup)

The goal of this project is to design a set of HTML tags to describe 3D scenes in the browser.

We use three.js to render the new tags but the aim is to provide a way to declare 3D scenes independent from the rendering engine.


## Usage

__NOTE:__ For folks creating scenes and third-party components, we recommend getting started by instead using the [__`vr-components`__ library](https://github.com/MozVR/vr-components), a set of core resuable components.

Proceed below if you would like to use the minimal set of primitive components available here in __`vr-markup`__.

### Downloads

To get started, simply include these files in your project:

* [`vr-markup.min.js`](dist/vr-markup.min.js)
* [`vr-markup.min.css`](dist/vr-markup.min.css)

Or for local development you can use the unminified bundles (with source maps for the JS):

* [`vr-markup.js`](dist/vr-markup.js)
* [`vr-markup.css`](dist/vr-markup.css)

__Also, be sure to check out these awesome examples:__

* [__`vr-markup`__ examples](http://mozvr.github.io/vr-markup/examples/) ([source](https://github.com/MozVR/vr-markup/tree/master/examples/))
* [__`vr-components`__ examples](http://mozvr.github.io/vr-components/examples/) ([source](https://github.com/MozVR/vr-components/tree/master/examples/))

### npm

First install from npm:

    npm install @mozvr/vr-markup

And in your Browserify/Webpack modules, simply require the module:

    require('@mozvr/vr-markup')

## Local installation

    git clone https://github.com/MozVR/vr-markup.git
    cd vr-markup

## Local development

    npm install
    npm start
    open http://localhost:9001/examples/

If you'd like to hack on this project and don't have access to the npm repos, contact @cvan and he'll give you the info you'll need to log in:

    npm login

### Browser console logging

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

To publish to __https://mozvr.github.io/vr-markup/__:

    npm run ghpages

To publish to __https://cvan.github.io/vr-markup/__:

    npm run ghpages cvan


## License

This program is free software and is distributed under an [MIT License](LICENSE).
