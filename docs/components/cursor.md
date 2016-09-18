---
title: cursor
type: components
layout: docs
parent_section: components
---

The cursor component lets us interact with entities through clicking and gazing. It is a specific application of the [raycaster][raycaster] component in that it:

- Listens for mouse clicks and gaze-based fuses.
- Captures only the first intersected entity.
- Emits special mouse and hover events (e.g., relating to mouse down/up/enter/leave).
- Has additional states for hovering.

When the mouse is clicked, the closest visible entity intersecting the cursor, if any, will emit a `click` event. Note the cursor component only applies the raycasting behavior. To provide a shape or appearance to the cursor, you could apply the [geometry][geometry] and [material][material] components.

## Example

For example, we can create a ring-shaped cursor that is fixed to the center of the screen. To fix it to the screen such that it is always present no matter where we look, we place it as a child of the active [camera][camera] entity. We pull it in front of the camera by placing it on the negative Z axis. When the cursor clicks on the box, we can listen to the click event.

```html
<a-entity camera>
  <a-entity cursor="fuse: true; fuseTimeout: 500"
            position="0 0 -1"
            geometry="primitive: ring"
            material="color: black; shader: flat">
  </a-entity>
</a-entity>

<a-entity id="box" cursor-listener geometry="primitive: box" material="color: blue"></a-entity>
```

```js
// Component to change to random color on click.
AFRAME.registerComponent('cursor-listener', {
  init: function () {
    var COLORS = ['red', 'green', 'blue'];
    this.el.addEventListener('click', function (evt) {
      var randomIndex = Math.floor(Math.random() * COLORS.length);
      this.setAttribute('material', 'color', COLORS[randomIndex]);
      console.log('I was clicked at: ', evt.detail.intersection.point);
    });
  }
});
```

## Properties

Note, to further customize the cursor component, we can set the properties of the raycaster component.

| Property    | Description                                                                    | Default Value                    |
|-------------|--------------------------------------------------------------------------------|----------------------------------|
| fuse        | Whether cursor is fuse-based.                                                  | false on desktop, true on mobile |
| fuseTimeout | How long to wait (in milliseconds) before triggering a fuse-based click event. | 1500                             |

## Events

| Event             | Description                                                                                                                 |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------|
| click      | Emitted on both cursor and intersected entity if a currently intersected entity is clicked (whether by mouse or by fuse).   |
| mousedown  | Emitted on both cursor and intersected entity (if any) on mousedown on the canvas element.                                  |
| mouseenter | Emitted on both cursor and intersected entity (if any) when cursor intersects with an entity.                               |
| mouseleave | Emitted on both cursor and intersected entity (if any) when cursor no longer intersects with previously intersected entity. |
| mouseup    | Emitted on both cursor and intersected entity (if any) on mouseup on the canvas element.                                    |

## States

The cursor will add states to the cursor entity on certain events:

| State           | Description                                                          |
|-----------------|----------------------------------------------------------------------|
| cursor-fusing   | Added to the cursor entity when it is fusing on another entity.      |
| cursor-hovering | Added to the cursor entity when it is hovering over another entity.  |

The cursor will add states to intersected entities on certain events:

| State          | Description                                                          |
|----------------|----------------------------------------------------------------------|
| cursor-hovered | Added to the intersected entity when the cursor is hovering over it. |

## Configuring the Cursor through the Raycaster Component

The cursor is built on top of and depends on the raycaster component. If we want to customize the raycasting pieces of the cursor, we can do by changing the [raycaster component properties][raycasterprops]. Say we want set a max distance, check for intersections less frequently, and set which objects are clickable:

```html
<a-entity cursor raycaster="far: 20; interval: 1000; objects: .clickable"></a-entity>
```

## Fuse-Based Cursor

Also known as gaze-based cursor. If the cursor is set to be fuse-based, the cursor will trigger a click if the user gazes at an entity for a set amount of time. Imagine a laser strapped to the user's head, and the laser extends out into the scene. If the user stares at an entity long enough (i.e., the `fuseTimeout`), then the cursor will trigger a click.

The advantage of fuse-based interactions for VR is that it does not require additional input devices other than the headset. It is primarily intended for Google Cardboard applications. The disadvantage of fuse-based interactions is that it requires the user to turn their head a lot.

## Adding Visual Feedback

To add visual feedback to the cursor in order to display indication when the cursor is clicking or fusing, we can use the [animation system][animation]. When the cursor intersects the entity, it will emit an event, and the animation system will pick up event with the `begin` attribute:

```html
<a-entity cursor="fuse: true; fuseTimeout: 500"
          position="0 0 -1"
          geometry="primitive: ring"
          material="color: black; shader: flat">
  <a-animation begin="click" easing="ease-in" attribute="scale"
               fill="backwards" from="0.1 0.1 0.1" to="1 1 1"></a-animation>
  <a-animation begin="cursor-fusing" easing="ease-in" attribute="scale"
               fill="forwards" from="1 1 1" to="0.1 0.1 0.1"></a-animation>
</a-entity>
```

To play with an example of a cursor with visual feedback, check out the [Cursor with Visual Feedback example on CodePen][cursor-codepen].

[animation]: ../core/animations.md
[camera]: ./camera.md
[cursor-codepen]: http://codepen.io/team/mozvr/pen/RrxgwE
[geometry]: ./geometry.md
[material]: ./material.md
[raycaster]: ./raycaster.md
[raycasterprops]: ./raycaster.md#Properties
