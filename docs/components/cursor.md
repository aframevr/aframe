title: "Cursor"
category: component
---

The cursor component defines interaction with the scene through clicking and
gazing, by using a raycaster to determine which object has been clicked. When the mouse
is clicked, the closest visible entity intersecting the cursor will have a DOM click event
triggered.

For example, we define a cursor in the shape of a ring positioned on the center
of the screen. Whenever the cursor clicks on the cube, we can listen the the
click event. This might feel familiar to web developers.

```html
<a-entity cursor="fuse: true; maxDistance: 30; timeout: 500"
          position="0 0 -5" geometry="primitive: ring" material="color: white; shader: flat">
</a-entity

<a-entity id="cube" geometry="primitive: box" material="color: blue"></a-entity>
```

```js
document.querySelector('#cube').addEventListener('click', function () {
  this.setAttribute('material', 'color', 'red');
  console.log('I was clicked!');
});
```

| Attribute   | Description                                                              | Default Value  |
|-------------|--------------------------------------------------------------------------|----------------|
| fuse        | Whether cursor should also be fuse-based.                                | false          |
| maxDistance | Maximum distance to check for intersections on entities for clicks.      | 5              |
| timeout     | How long to wait in milliseconds to trigger a click event if fuse-based. | 1500           |

## Fuse-Based Cursor

If the cursor is set to be fuse-based, the cursor will trigger a click if the
user gazes at one entity for a set amount of time. Imagine a laser strapped to
the user's head, and the laser extends out into the scene. After the timeout,
whatever entity the laser intersects first will be clicked.

Fuse-based interactions can feel natural for VR and do not require any
additional input devices other than the headset.
