Before contributing code, please note:

* You agree to license your contributions under the [license](LICENSE).
* Follow [jshint](http://eslint.org/docs/rules/) [see our rules](.jshintrc).

Thank you for contributing code. Read on for instructions.


# Contributing to the Gazebo library

## Local installation

    git clone https://github.com/MozVR/vr-markup.git
    cd vr-markup

## Local development

    npm i
    npm start
    open http://localhost:9000/examples/

## Publishing a new npm version

	npm run dist
	git commit -am 'bump dist'
	npm patch version --minor
	npm publish
	git push origin head

## Publishing the latest official `dist` to GitHub Pages

    npm run deploy

## Publishing the latest changes to GitHub Pages

	npm run dist
    npm run deploy


# Creating your own custom Gazebo component

    npm login
