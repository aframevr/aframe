---
title: 3D Models
type: introduction
layout: docs
parent_section: introduction
order: 10
examples:
 - title: Modifying Material of Model
   src: https://glitch.com/edit/#!/aframe-modify-model-material?path=index.html:1:0
---

[3loaders]: https://github.com/mrdoob/three.js/tree/dev/examples/js/loaders
[ecsfind]: ./entity-component-system.md#where-to-find-components
[glTF]: ../components/gltf-model.md
[OBJ]: ../components/obj-model.md
[recommend using glTF]: ../components/gltf-model.md#why-use-gltf

A-Frame provides components for loading [glTF] and [OBJ]. We [recommend
using glTF] if possible as glTF gains adoption as the standard for transmitting
3D models over the Web. Components can be written to handle any file format,
specifically any format that has a [three.js loader][3loaders]. We can also try
to [find components in the ecosystem][ecsfind] that have already been written
to handle other formats (e.g., PLY, FBX, JSON, three.js).

Models come in the format of plain text files containing vertices, faces, UVs,
textures, materials, and animations. They also come with images for textures,
usually alongside the model file. three.js loaders parse these files to render
them within a three.js scene as meshes. A-Frame model components wrap these
three.js loaders.

## Animating Models

[mixer]: https://github.com/c-frame/aframe-extras/tree/master/src/loaders#animation

We can use [Don McCurdy's animation-mixer component][mixer] to play a model's
built-in animations. Animations usually come in the model built via animation
tools or programs rather than being provided at the A-Frame level. The
animation-mixer component may be merged into A-Frame's core in the future.

For starting material on creating animations, see:

- [Blender Tutorial - Creating and Editing Actions for Re-use in Animations and
  Games](https://www.youtube.com/watch?v=Gb152Qncn2s)
- [Workflow: Animation from Blender to three.js by Arturo Paracuellos](http://unboring.net/workflows/animation.html)

## Where to Find Models

Places to find 3D models include:

- [Sketchfab](https://sketchfab.com)
- [Clara.io](http://clara.io)
- [Archive3D](http://archive3d.net)
- [Sketchup's 3D Warehouse](https://3dwarehouse.sketchup.com)
- [TurboSquid](http://www.turbosquid.com/Search/3D-Models/free)

## How to Create Models

Programs to create models include:

- [Blender](https://www.blender.org/)
- [MagicaVoxel](https://ephtracy.github.io/)
- [Autodesk Maya](https://www.autodesk.com/products/maya/overview) or [Maya LT](https://www.autodesk.com/products/maya-lt/overview)
- [Maxon Cinema4D](https://www.maxon.net/en-us/)
- [Supercraft](https://supermedium.com/supercraft/) (DEPRECATED) - Built **with** A-Frame to
  model directly within VR with no modeling skill required and load with
  [`aframe-supercraft-loader`](https://www.npmjs.com/package/aframe-supercraft-loader).

## Hosting Models

Refer to [Hosting and Publishing &mdash; Hosting
Models](./hosting-and-publishing.md#hosting-models).

## Modifying Materials

[modify]: https://glitch.com/edit/#!/aframe-modify-model-material?path=index.html:1:0

To modify the material of a model, we need to wait for the model to load, and
then modify the three.js meshes created from the model. What happens is an
A-Frame model component requests on the network the model, parses the model,
creates three.js meshes or objects, and loads them in under the `<a-entity>`
under `.getObject3D('mesh')`. We can reach into that mesh and modify whatever,
in this case, three.js materials.

See this live example of [modifying material of a loaded model][modify].

```html
<script>
  AFRAME.registerComponent('modify-materials', {
    init: function () {
      // Wait for model to load.
      this.el.addEventListener('model-loaded', () => {
        // Grab the mesh / scene.
        const obj = this.el.getObject3D('mesh');
        // Go over the submeshes and modify materials we want.
        obj.traverse(node => {
          if (node.name.indexOf('ship') !== -1) {
            node.material.color.set('red');
          }
        });
      });
    }
  });
</script>

<a-scene background="color: #ECECEC">
  <a-assets>
    <a-asset-item id="cityModel" src="https://cdn.aframe.io/test-models/models/glTF-2.0/virtualcity/VC.gltf"></a-asset-item>
  </a-assets>
  <a-entity gltf-model="#cityModel" modify-materials></a-entity>
</a-scene>
```

## Troubleshooting

[hostingmodels]: ./hosting-and-publishing.md#hosting-models

Before anything else, check your console for errors. Common issues related to
CORS can be solved by properly [hosting your models][hostingmodels] and the
console will also tell you if your model needs additional files that are
missing.

### I Don't See My Model

If there are no errors in the console, try scaling your model down. Often times
there's a mismatch in the scale when you export, and this will cause the camera
to be inside the model, which means you won't be able to see it.

```html
<a-entity gltf-model="#tree" scale="0.01 0.01 0.01"></a-entity>
```

If this doesn't work, open the Inspector by pressing `ctrl + alt + i` and zoom
out to verify the model is actually there.

### I Don't See Textures

Sometimes textures just won't work right off the bat. This is usually because
exporters use absolute paths like `C:\\Path\To\Model\texture.jpg` or
`/Path/To/Model/texture.jpg` for textures, which won't work on the Web. Instead,
use relative paths like `texture.jpg` or `images/texture.jpg`, relative to your
model or `.mtl` file.

1. Open the model (or .mtl if you're doing OBJ) in a plain text editor
2. Search for the name of your texture (e.g., `texture.jpg`)
3. Fix the path to the texture by making it relative instead of absolute

If this didn't work, you should check your MTL file and you might notice it is trying to use TGA or some other sort of textures that aren't plain images. In this case, you need to include additional three.js loaders. However it might be easier to try converting all the TGAs to just use images like PNGs using a converter, and replace all instances of 'tga' with 'png'.

### My Model Isn't Animating

[aframe-extras]: https://github.com/c-frame/aframe-extras

The [animation-mixer component][mixer], part of [aframe-extras] by Don McCurdy,
provides controls for playing animations in three.js (.json) and glTF (.gltf)
models.

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
