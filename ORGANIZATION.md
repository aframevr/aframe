# Directory Structure

- `dist` - Builds for both the stable version and the bleeding-edge version, including minified. Generated with `npm run dist`.
- `docs` - Complete documentation in Markdown. Used to generate the documentation on the [A-Frame Site](https://github.com/aframevr/aframe-site).
- `examples` - Examples. `index.html` lists all of the examples.
- `src` - Source code.
  - `components` - Standard components. They are required via `components/index.js`.
    - `scene` - Standard components that apply only to the scene.
  - `constants` - Common constants.
  - `core` - Core custom elements and API.
    - `scene` - Scene custom element and modules.
  - `extras` - Convenience and abstraction layers such as primitives.
    - `primitives` - Code for registering primitive custom elements.
      - `primitives` - Standard primitives such as `<a-box>`.
  - `index.js` - Main file that will be exported to `window.AFRAME`.
  - `lib` - Integration with third-party modules.
  - `shaders` - Standard shaders. They are required via `shaders/index.js`.
  - `style` - Core CSS.
  - `systems` - Standard systems. They are required via `systems/index.js`.
  - `utils` - Utility function and modules. They should all be exposed in `utils/index.js` which is exported to `window.AFRAME.utils`.
- `tests` - Functional and unit tests with Karma, Mocha, Sinon, and Chai.
- `vendor` - Third-party modules not available via NPM.

# Major Dependencies

- [document-register-element](https://github.com/WebReflection/document-register-element) - Polyfill for the Custom Elements specification.
- [three.js](https://github.com/mrdoob/three.js) - 3D library.
- [tween.js](https://github.com/tweenjs/tween.js/) - Animation and interpolation library.
- [webvr-polyfill](https://github.com/borismus/webvr-polyfill) - Polyfill for the WebVR specification.
