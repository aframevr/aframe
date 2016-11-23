## A-Frame Builds

> The `aframe.js` group of builds are deprecated and will be removed. Use the
> `aframe-master.js` group of builds instead.

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

### Master Builds

These master builds are unstable **bleeding-edge unstable builds** that contain
newer fixes or features from the **master branch** on GitHub, but may contain
regressions or breaking changes.

- [`aframe-master.min.js`](aframe-master.min.js) - Minified production build.
- [`aframe-master.min.js.map`](aframe-master.min.js.map) - Source maps for minified production build.
- [`aframe-master.js`](aframe-master.js) - Unminified build, for development or debugging.
- [`aframe-master.js.map`](aframe-master.js.map) - Source maps for unminified build.

### Deprecated Builds

The builds such as `aframe.js` or `aframe.min.js` are deprecated. They will be
removed in time. We are currently allowing time for people to switch pointing
their scenes to these builds through `rawgit.com`.
