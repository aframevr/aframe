# VR MARKUP

The goal of this project is to design a set of HTML tags to describe 3D scenes in the browser.

We use three.js to render the new tags but the aim is to provide a way to declare 3D scenes independent from the rendering engine.


## Usage

If you would like to embed this library in your project, simply include these files:

* [`vr-markup.min.js`](dist/vr-markup.min.js)
* [`vr-markup.min.css`](dist/vr-markup.min.css)

Or if you'd prefer unminified files for local development (and source maps for the JS):

* [`vr-markup.css`](dist/vr-markup.css)
* [`vr-markup.js`](dist/vr-markup.js)

__Also, be sure to check out the awesome [examples](examples/).__


## Contributing to the Gazebo library

## Local installation

    git clone https://github.com/MozVR/vr-markup.git
    cd vr-markup

## Local development

    npm i
    npm start
    open http://localhost:9000/examples/

## Pulling the lastest remote changes

    git checkout dev
    git pull --rebase
    npm i
    npm start
    open http://localhost:9000/examples/

## Releasing and publishing a new version to npm

Assuming you want to publish a version of `dev` to the private package for testing:

    npm run dist
    npm run release

## Publishing the latest official `dist` to GitHub Pages

    npm run deploy

## Publishing the latest changes to GitHub Pages

    npm run dist
    npm run deploy

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
