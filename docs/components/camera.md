title: "Camera"
category: component
---

The camera component defines from what perspective the user views the scene.
It is often paired with control-related components such that user input moves
and rotates the camera.

```html
<a-entity>
 <a-entity camera look-controls wasd-controls></a-entity>
</a-entity>
```

| Attribute | Description                                                                          | Default Value  |
|-----------|--------------------------------------------------------------------------------------|----------------|
| far       | Camera frustum far clipping plane.                                                   | 10000          |
| fov       | Field of view, in degrees                                                            | 80             |
| near      | Camera frustum near clipping plane.                                                  | 0.5            |
