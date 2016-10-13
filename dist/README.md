## A-Frame Builds

To include these files, you can either download and serve them locally. Or
serve directly from `rawgit.com` CDN:

```html
<html>
  <head>
    <script src="https://rawgit.com/aframevr/aframe/master/dist/FILENAME"></script>
  </head>
  <!-- ... -->
</html>
```

### Stable Builds

These builds are available via `https://aframe.io/releases/x.x.x/<filename>`
where `x.x.x` is the latest stable version.

- `aframe-vx.x.x.min.js` - Minified production build, **recommended**.
- `aframe-vx.x.x.min.js.map` - Source maps for minified production build.
- `aframe-vx.x.x.js` - Unminified build, for development or debugging.
- `aframe-vx.x.x.js.map` - Source maps for unminified build.

### Master Builds

These builds are bleeding-edge **unstable builds** that contain newer fixes or
features, but may contain regressions or breaking changes.

- `aframe.min.js` - Minified production build.
- `aframe.min.js.map` - Source maps for minified production build.
- `aframe.js` - Unminified build, for development or debugging.
- `aframe.js.map` - Source maps for unminified build.
