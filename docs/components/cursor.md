---
title: cursor
type: components
layout: docs
parent_section: components
order: 4
---

The `cursor` component defines interaction with other entities through clicking and gazing, by using the [raycaster](raycaster.html) component to determine which object has been clicked. When the mouse is clicked, the closest visible entity intersecting the cursor will have a DOM `click` event triggered. Note the `cursor` component only defines the behavior. To define the appearance, you might apply the geometry component.

## Example

For example, we define a cursor in the shape of a ring positioned on the center of the screen. To have the cursor fixed on the screen, we place it as a child of a camera entity. Whenever the cursor clicks on the cube, we can listen the the click event. This might feel familiar to web developers.

```html
<a-entity camera>
  <a-entity cursor="fuse: true; maxDistance: 30; timeout: 500"
            position="0 0 -5"
            geometry="primitive: ring"
            material="color: white; shader: flat">
  </a-entity>
</a-entity>

<a-entity id="cube" geometry="primitive: box" material="color: blue"></a-entity>
```

```js
document.querySelector('#cube').addEventListener('click', function () {
  this.setAttribute('material', 'color', 'red');
  console.log('I was clicked!');
});
```

## Properties

| Property    | Description                                                                | Default Value                    |
|-------------+----------------------------------------------------------------------------+----------------------------------|
| fuse        | Whether cursor should also be fuse-based.                                  | false on desktop, true on mobile |
| maxDistance | Maximum distance to check for intersections on entities for clicks.        | 5                                |
| timeout     | How long to wait (in milliseconds) to trigger a click event if fuse-based. | 1500                             |

## States

The cursor will add states to the cursor entity on certain events.

| State Name | Description                                            |
|------------+--------------------------------------------------------|
| fusing     | Added when the cursor is fusing on another entity.     |
| hovering   | Added when the cursor is hovering over another entity. |

The cursor will add states to the **target** entity on certain events.

| State Name | Description                                              |
|------------+----------------------------------------------------------|
| hovered    | Added when target entity is being hovered by the cursor. |

## Events

| Event Name | Description                           |
|------------+---------------------------------------|
| click      | Triggered when an entity is clicked.  |
| mousedown  | Triggered on mousedown of the canvas. |
| mouseup    | Triggered on mouseup of the canvas.   |

## Fuse-Based Cursor

If the cursor is set to be fuse-based, the cursor will trigger a click if the user gazes at one entity for a set amount of time. Imagine a laser strapped to the user's head, and the laser extends out into the scene. After the timeout, whatever entity the laser intersects first will be clicked.

Fuse-based interactions can feel natural for VR and do not require any additional input devices other than the headset.

## Adding Visual Feedback

To add visual feedback to the cursor in order to display indication when the cursor is clicking or fusing, we can use the animation system. When the cursor adds a state to the entity, the animation system will pick up added state with the `begin` attribute and play.

```html
<a-entity cursor="fuse: true; maxDistance: 30; timeout: 500"
          position="0 0 -5"
          geometry="primitive: ring"
          material="color: white; shader: flat">
  <a-animation begin="click" easing="ease-in" attribute="scale"
               fill="backwards" from="0.1 0.1 0.1" to="1 1 1"></a-animation>
  <a-animation begin="fusing" easing="ease-in" attribute="scale"
               fill="forwards" from="1 1 1" to="0.1 0.1 0.1"></a-animation>
</a-entity>
```

To play with an example of a cursor with visual feedback, check out the [Cursor with Visual Feedback example on Codepen](http://codepen.io/team/mozvr/pen/RrxgwE).

## Caveats

The raycaster currently picks up non-visible entities. This issue will be addressed in a later release.
