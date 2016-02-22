---
title: <a-image>
type: primitives
layout: docs
parent_section: primitives
order: 6
---

The image primitive makes it easy to add JPG and PNG images to a scene. It wraps an entity that contains [`geometry`](../components/geometry.html) and [`material`](../components/material.html) components.

| Attribute | Default Value  | Component Mapping |
| --------- | -------------- | ----------------- |
| height    | 1.75           | geometry.height   |
| opacity   | 1.0            | material.opacity  |
| src       | None           | material.src      |
| width     | 1.75           | geometry.width    |

[View source on GitHub](https://github.com/aframevr/aframe/blob/master/elements/templates/a-image.html)

To ensure the image is not distorted, make sure the `width` and `height` ratio matches the source bitmap width/height ration. For example, if using an image that is sized 2000x1000 pixels, we would create our image like so:

```html
<a-image src="logo.png" width="200" height="100"></a-image>
```
... or any width/height value pair that matches the source bitmap aspect ratio. The default `<a-image>` dimensions are square: 1.75 x 1.75 meters.

## On transparencies

Transparency and alpha channels are tricky in 3D graphics. If you are having issues where transparent issues in the foreground do not composite correctly over images in the background, it is probably due to underlying design of the OpenGL compositor (which WebGL is an API for). In an ideal scenario, transparency in A-Frame would "just work", regardless of where the developer places an image in 3D space, or what order they define the elements in markup. In the current version of A-Frame, however, it is easy to create scenarios where foreground images occlude background images. This creates confusion and unwanted visual defects.

While we are somewhat limited in the degree to which we can improve this by the underlying architecture of OpenGL, we are planning improvements in future versions of A-Frame that will 1) reduce the probability of encountering unwanted occlusion, and 2) give developers better controls to manually override the default behaviors when they are undesirable. Track this work in aframe-core [issue 498](https://github.com/aframevr/aframe-core/issues/498).

## Examples

Image with an inline URL:

```html
<a-image src="https://aframe.io/aframe-core/examples/_images/pano/louvre.jpg"></a-image>
```

Image using an existing `<img>` element defined within [assets](../core/assets.html):

```html
<a-assets>
  <img id="louvre" src="https://aframe.io/aframe-core/examples/_images/pano/louvre.jpg">
</a-assets>

<a-scene>
  <a-image src="#louvre"></a-image>
</a-scene>
```
