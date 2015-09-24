# VR MARKUP [![Build Status](https://magnum.travis-ci.com/MozVR/vr-markup.svg?token=65kfkjdCsqTSnqx7qtHg&branch=dev)](https://magnum.travis-ci.com/MozVR/vr-markup)

The goal of this project is to design a set of HTML tags to describe 3D scenes in the browser.

We use three.js to render the new tags but the aim is to provide a way to declare 3D scenes independent from the rendering engine.


## Usage

__NOTE:__ For folks creating scenes and third-party components, we recommend getting started by instead using the [__`vr-components`__ library](https://github.com/MozVR/vr-components), a set of core resuable components.

Proceed below if you would like to use the minimal set of primitive components available here in __`vr-markup`__.

To get started, simply include these files in your project:

* [`vr-markup.min.js`](dist/vr-markup.min.js)
* [`vr-markup.min.css`](dist/vr-markup.min.css)

Or for local development you can use the unminified bundles (with source maps for the JS):

* [`vr-markup.js`](dist/vr-markup.js)
* [`vr-markup.css`](dist/vr-markup.css)

__Also, be sure to check out these awesome examples:__

* [__`vr-markup`__ examples](http://mozvr.github.io/vr-markup/examples/) ([source](https://github.com/MozVR/vr-markup/tree/master/examples/))
* [__`vr-components`__ examples](http://mozvr.github.io/vr-components/examples/) ([source](https://github.com/MozVR/vr-components/tree/master/examples/))


## Local installation

    git clone https://github.com/MozVR/vr-markup.git
    cd vr-markup

## Local development

    npm install
    npm start
    open http://localhost:9001/examples/

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

    npm run dist
    npm run release

## Publishing the latest official `dist` to GitHub Pages

    npm run gh-pages

## Publishing the latest changes to GitHub Pages

    npm run dist
    npm run gh-pages

## Publishing to Production

### Releasing and tagging a **production** release to GitHub

Assuming `dev` has already been reviewed and merged to `master`:

    git checkout master
    git pull --rebase
    npm run dist
    git tag 0.1.8
    git push origin head --tags


## License

This program is free software and is distributed under an [MIT License](LICENSE).
