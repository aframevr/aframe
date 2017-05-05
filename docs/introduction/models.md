---
title: "3D Models"
type: introduction
layout: docs
parent_section: introduction
order: 8.75
---

*work in progress*

## Model File Formats

*work in progress*

## Animating Models

*work in progress*

## Where to Find Models

*work in progress*

## How to Create Models

*work in progress*

## Troubleshooting

### I Don't See My Model

Check your console for errors. If there are no errors, try scaling your model
down. Often times there's a mismatch in the scale when you export, and this
will cause the camera to be inside the model, which means you won't be able to
see it.

```html
<a-entity gltf-model="#tree" scale="0.01 0.01 0.01"></a-entity>
```

If this doesn't work, open the Inspector by pressing `ctrl + alt + i` and zoom
out to verify the model is actually there.

### I Don't See Textures

Sometimes textures just won't work right off the bat. This is usually because
exporters use absolute paths for textures, which won't work on the Web:

1. Open the model (or .mtl if you're doing OBJ) in a plain text editor
2. Search for the name of your texture (e.g., `texture.jpg`)
3. Fix the path to the texture by making it relative instead of absolute

### My Model Isn't Animating

Don McCurdy has written the animation-mixer component in his aframe-extras
repository to provide an API for running model animations.

### My Model Looks Distorted

A common issue with models is incorrect orientation of normals. You'll know you
have an issue with normals if some of the faces on your geometry are
transparent, or there are "holes" in the mesh.

1. Import the model into Blender
2. Turn on backface culling in the shading section of the properties panel
(`n`) to get a better idea of which faces are incorrect.
3. Select the object
4. Go to edit mode (`<tab>`)
5. Press a to select all faces
6. Press `<ctrl> + n` to make normals consistent. If it looks like the opposite
of what you want, flip them via the toolbar (`t`).

## Model Performance

We may notice that when we import a large file or complex model, the browser
will slow to a halt or not even load. Complex models that were designed for
high fidelity renders aren't ideal for real time applications. However,
there're some things we can do to make them more performant while retaining
their appearance.

### Testing for Performance

[stats]: ../components/stats.md

To get an idea of how our scene is performing, enable the [stats component][stats]:

```html
<a-scene stats>
```

Move around our scene and test different scenarios while keeping an eye on the
graph and be sure to test on different hardware. A development PC will most
likely have an easier time handling the scene than a smartphone. If we're
noticing that we're not reaching 60 fps, try removing different elements in the
scene until we find the culprit. If the performance-offending entity is a 3D
model, we can try to optimize it.

### Optimizing Complex Models

One of the biggest factors for scene optimization is model complexity and face
count. The less geometry, the better.

A quick way to reduce the number of faces on a model is with the decimate
modifier in Blender. The decimate modifier reduces the amount of geometric
faces while retaining the model's UV coordinates. Nothing beats proper modeling
techniques, but the decimate modifier can be a great last resort to make poorly
optimized files run smoother. The settings for the modifier will be highly
dependent on the model and how much detail we wish to remove.

![Blender's Decimate Modifier](https://cloud.githubusercontent.com/assets/674727/25730604/f5402d90-30f2-11e7-9571-96bcdef11a6a.jpg)

Adjust the ratio (highlighted) to reduce the number of faces.

We may have to manually fix some of the faces at the end of the process. After
we're happy with the results, *save a copy*, and export to our desired file
type. Test it out, and adjust as needed. Note that we may have to apply the
modifier before it will take effect.
