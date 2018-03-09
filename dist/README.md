## A-Frame Builds

To include these builds, you can download and serve them locally.

To include the latest [master build](#master-builds) from a CDN, include the
script below from the [rawgit CDN](https://rawgit.com/):

```html
<html>
  <head>
    <script src="https://rawgit.com/aframevr/aframe/eb415df/dist/aframe-master.min.js"></script>
  </head>
  <body>
    <a-scene>
      <!-- ... -->
    </a-scene>
  </body>
</html>
```

### Release Builds

These builds are available via `https://aframe.io/releases/x.x.x/<filename>`
where `x.x.x` is the latest stable version.

- `aframe-vx.x.x.min.js` - Minified production build, **recommended**.
- `aframe-vx.x.x.min.js.map` - Source maps for minified production build.
- `aframe-vx.x.x.js` - Unminified build, for development or debugging.
- `aframe-vx.x.x.js.map` - Source maps for unminified build.

### Master Builds

These master builds are unstable **bleeding-edge unstable builds** that contain
newer fixes or features from the **master branch** on GitHub, but may contain
regressions or breaking changes.

If you're pointing to these builds via the [rawgit CDN](https://rawgit.com/),
we recommend locking it down to a commit hash rather than pointing directly at
master such that your scene does not break unexpectedly.

- [`aframe-master.min.js`](aframe-master.min.js) - Minified production build.
- [`aframe-master.min.js.map`](aframe-master.min.js.map) - Source maps for minified production build.
- [`aframe-master.js`](aframe-master.js) - Unminified build, for development or debugging.
- [`aframe-master.js.map`](aframe-master.js.map) - Source maps for unminified build.
