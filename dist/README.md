## A-Frame Builds

> The `aframe.js` group of builds are deprecated and will be removed. Use the
> `aframe-dev.js` group of builds instead.

To include these files, you can either download and serve them locally. Or
serve directly from `rawgit.com` CDN.

```html
<html>
  <head>
    <script src="https://rawgit.com/aframevr/aframe/master/dist/FILENAME"></script>
  </head>
  <!-- ... -->
</html>
```

If serving from `rawgit.com`, we recommend locking the file to a specific hash
rather than tracking the master branch to prevent regressions:

```html
<script src="https://rawgit.com/aframevr/aframe/HASH/dist/FILENAME"></script>
```

### Release Builds

These builds are available via `https://aframe.io/releases/x.x.x/<filename>`
where `x.x.x` is the latest stable version.

- `aframe-vx.x.x.min.js` - Minified production build, **recommended**.
- `aframe-vx.x.x.min.js.map` - Source maps for minified production build.
- `aframe-vx.x.x.js` - Unminified build, for development or debugging.
- `aframe-vx.x.x.js.map` - Source maps for unminified build.

### Dev Builds

These builds are bleeding-edge **unstable builds** that contain newer fixes or
features from the master branch, but may contain regressions or breaking
changes.

- [`aframe-dev.min.js`][aframe-dev.min.js] - Minified production build.
- [`aframe-dev.min.js.map`][aframe-dev.min.js.map] - Source maps for minified production build.
- [`aframe-dev.js`][aframe-dev.js] - Unminified build, for development or debugging.
- [`aframe-dev.js.map`][aframe-dev.js.map] - Source maps for unminified build.
