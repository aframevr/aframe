---
title: splat
type: components
layout: docs
parent_section: components
source_code: src/components/splat.js
examples: []
---

A loader for 3D Gaussian Splats files.

## Example
```html
<a-scene>
  <a-entity splat="src: https://url.to/scene.splat;" ></a-entity>
</a-scene>
```

## Properties

| Property      | Description                                       | Default Value |
|---------------|---------------------------------------------------|---------------|
| src           | URL to the splat file                             |               |
| cutoutEntity  | entity to define a cutout area (splats outside won't render)                             |               |
| pixelRatio    | To downscale resolution for better performance    | 1             |
| xrPixelRatio  | Downscale resolution in VR for better performance | 0.5           |
