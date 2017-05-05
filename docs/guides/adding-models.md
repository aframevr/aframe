## Troubleshooting 3D Models

### I don’t see my model

Check your console for errors. If there are no errors, try scaling your model down. Often times there’s a mismatch in the scale when you export, and this will cause the camera to be inside the model, which means you won’t be able to see it.

```<a-entity gltf-model="#tree" scale="0.01 0.01 0.01"></a-entity>```

If this doesn't work, open the inspector by pressing `ctrl + alt + i` and zoom out to verify the model is actually there. 

### No textures

Sometimes textures just won’t work right off the bat. This is usually because exporters use absolute paths for textures, which won't work on the web. 

1. Open the model (or .mtl if you're doing OBJ) in a plain text editor
2. Search for the name of your texture, e.g., texture.jpg
3. Fix the path to the texture by making it relative instead of absolute

### My model isn’t animating

Animated models at the time of this writing (0.5.0) are not supported by A-Frame without custom components. Don McCurdy has written the animation-mixer component in his aframe-extras repository to address this.

### My model looks distorted

A common issue with models is incorrect orientation of normals. You'll know you have an issue with normals if some of the faces on your geometry are transparent, or there are "holes" in the mesh.

1. Import the model into Blender
2. Turn on backface culling in the shading section of the properties panel (n) to get a better idea of which faces are incorrect.
3. Select the object
4. Go to edit mode (tab)
5. Press a to select all faces
6. Press ctrl + n to make normals consistent. If it looks like the opposite of what you want, flip them via the toolbar (t).

## Performance Considerations

You may notice that when you import a large file or complex model, the browser will slow to a halt or not even load. Complex models that were designed for high fidelity renders aren't ideal for real time applications. However, there’s some things you can do to make them more performant while retaining their appearance.

### Testing for Performance

To get an idea of how your scene is performing, add the built-in `stats` component to your scene like so:

```<a-scene stats></a-scene>```

![A-Frame Stats Component](https://takeshape-prod.imgix.net/f7640501-2997-427e-b82e-ce0b3bd0b37e/dev/581fe510-b4d4-4fc8-a851-37388c371d91/stats2.jpg?auto=compress%2Cformat)

You’ll notice when you refresh that you have an overlay with helpful statistics about your scene. If you're curious about what each stat means, you can find the list here. The most important stat is framerate. The goal is to keep a consistent 60fps (90fps for high end headsets). 

Move around your scene and test different scenarios while keeping an eye on the graph, and be sure to test on different hardware. Your development PC will most likely have an easier time handling the scene than a smartphone. If you're noticing that you're not reaching 60 fps, try removing different elements in the scene until you find the culprit. If it's a 3D model, you can try to optimize it.

### Optimizing Complex Models

One of the biggest factors for scene optimization is model complexity and face count. The less geometry, the better. 
A quick way to reduce the number of faces on a model is with the decimate modifier in Blender. It reduces the amount of geometric faces while retaining the model's UV coordinates. Nothing beats proper modeling techniques, but the decimate modifier can be a great last resort to make poorly optimized files run smoother. I could list settings and configuration here, but it’s highly dependent on what your model is and how much detail you need to remove. 

![Blender's Decimate Modifier](https://takeshape-prod.imgix.net/f7640501-2997-427e-b82e-ce0b3bd0b37e/dev/0b7c6472-03a5-450c-82d5-50f17141ee5b/decimate2.jpg?auto=compress%2Cformat)

Adjust the ratio (highlighted) to reduce the number of faces.

You may have to manually fix some of the faces at the end of the process. After you’re happy with the results, *save a copy* and export to your desired file type. Test it out, and adjust as needed. Note that you may have to apply the modifier before it will take effect.

