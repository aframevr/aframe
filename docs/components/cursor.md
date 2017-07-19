---
title: cursor
type: components
layout: docs
parent_section: components
source_code: src/components/cursor.js
---

[a-cursor]: ../primitives/a-cursor.md
[laser-controls]: ./laser-controls.md
[raycaster]: ./raycaster.md

The cursor component provides hover and click states for interaction on top of
the [raycaster component][raycaster]. The cursor component can be used for
both gaze-based and controller-based interactions, but the appearance needs
to be configured depending on the use case. The [`<a-cursor>`
primitive][a-cursor] provides a default reticle appearance for a gaze-based
cursor, and the [laser-controls component][laser-controls] configures the
cursor for all controllers.

The cursor component listens to events and keeps state on what's being hovered
and pressed in order to provide `mousedown`, `mouseup`, `mouseenter`,
`mouseleave`, and `click` events. We name use the `mouse` name to mimic
traditional web development for now. Under the hood, the cursor component uses
the `raycaster-intersected` and `raycaster-intersection-cleared` events,
capturing the closest visible intersected entity.

By default, the cursor is configured to be used in a gaze-based mode.
Specifying the `downEvents` and `upEvents` properties allows the cursor to work
with controllers.  The [laser-controls component][laser-controls] automatically
configures those.

[geometry]: ./geometry.md
[line]: ./line.md
[material]: ./material.md

To provide a shape or appearance to the cursor, we should apply either the
[geometry][geometry] and [material][material] components or use the raycaster
component's `showLine` property to draw a line using the [line
component][line].

## Example

[camera]: ./camera.md

For example, we can create a ring-shaped cursor fixed to the center of the
screen. To fix the cursor to the screen so the cursor is always present no
matter where we look, we place it as a child of the active [camera][camera]
entity. We pull it in front of the camera by placing it on the negative Z axis.
When the cursor clicks on the box, we can listen to the click event.

```html
<a-entity camera>
  <a-entity cursor="fuse: true; fuseTimeout: 500"
            position="0 0 -1"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
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

| Property    | Description                                                                                                                | Default Value                    |
|-------------|----------------------------------------------------------------------------------------------------------------------------|----------------------------------|
| downEvents  | Array of additional events on the entity to *listen* to for triggering `mousedown` (e.g., `triggerdown` for vive-controls).  | []                               |
| fuse        | Whether cursor is fuse-based.                                                                                              | false on desktop, true on mobile |
| fuseTimeout | How long to wait (in milliseconds) before triggering a fuse-based click event.                                             | 1500                             |
| rayOrigin     | Where the intersection ray is cast from (i.e.,entity or mouse) | entity
| upEvents    | Array of additional events on the entity to *listen* to for triggering `mouseup` (e.g., `trackpadup` for daydream-controls). | []                               |

To further customize the cursor component, we configure the cursor's dependency
component, [the raycaster component][raycaster].

## Events

| Event         | Description                                                                                                                 |
|---------------|-----------------------------------------------------------------------------------------------------------------------------|
| click         | Emitted on both cursor and intersected entity if a currently intersected entity is clicked (whether by mouse or by fuse).   |
| fusing        | Emitted on both cursor and intersected entity when fuse-based cursor starts counting down.                                  |
| mousedown     | Emitted on both cursor and intersected entity (if any) on mousedown on the canvas element.                                  |
| mouseenter    | Emitted on both cursor and intersected entity (if any) when cursor intersects with an entity.                               |
| mouseleave    | Emitted on both cursor and intersected entity (if any) when cursor no longer intersects with previously intersected entity. |
| mouseup       | Emitted on both cursor and intersected entity (if any) on mouseup on the canvas element.                                    |

## States

The cursor will add states to the cursor entity on certain events:

| State           | Description                                            |
|-----------------|--------------------------------------------------------|
| cursor-fusing   | Added when the cursor is fusing on another entity.     |
| cursor-hovering | Added when the cursor is hovering over another entity. |

The cursor will add states to intersected entities on certain events:

| State          | Description                                                          |
|----------------|----------------------------------------------------------------------|
| cursor-hovered | Added to the intersected entity when the cursor is hovering over it. |

## Configuring the Cursor through the Raycaster Component

[raycasterprops]: ./raycaster.md#properties

The cursor builds on top of and depends on the raycaster component. If we
want to customize the raycasting pieces of the cursor, we can do by changing
the [raycaster component properties][raycasterprops]. Say we want set a max
distance, check for intersections less frequently, and set which objects are
clickable:

```html
<a-entity cursor raycaster="far: 20; interval: 1000; objects: .clickable"></a-entity>
```

## Fuse-Based Cursor

Also known as gaze-based cursor. If we set the cursor to be fuse-based, the
cursor will trigger a click if the user gazes at an entity for a set amount of
time. Imagine a laser strapped to the user's head, and the laser extends out
into the scene. If the user stares at an entity long enough (i.e., the
`fuseTimeout`), then the cursor will trigger a click.

The advantage of fuse-based interactions for VR is that it does not require
extra input devices other than the headset. The fuse-based cursor is primarily
intended for Google Cardboard applications. The disadvantage of fuse-based
interactions is that it requires the user to turn their head a lot.

## Adding Visual Feedback

[animation]: ../core/animations.md

To add visual feedback to the cursor to show when the cursor is clicking or
fusing, we can use the [animation system][animation].  When the cursor
intersects the entity, it will emit an event, and the animation system will
pick up event with the `begin` attribute:

```html
<a-entity cursor="fuse: true; fuseTimeout: 500"
          position="0 0 -1"
          geometry="primitive: ring"
          material="color: black; shader: flat">
  <a-animation begin="click" easing="ease-in" attribute="scale"
               fill="backwards" from="0.1 0.1 0.1" to="1 1 1"></a-animation>
  <a-animation begin="cursor-fusing" easing="ease-in" attribute="scale"
               fill="backwards" from="1 1 1" to="0.1 0.1 0.1"></a-animation>
</a-entity>
```

[cursor-codepen]: http://codepen.io/anon/pen/dpmpJP

To play with an example of a cursor with visual feedback, check out the [Cursor
with Visual Feedback example on CodePen][cursor-codepen].
