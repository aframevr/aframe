---
title: cursor
type: components
layout: docs
parent_section: components
source_code: src/components/cursor.js
examples:
  - title: Mouse Click Example
    src: https://glitch.com/edit/#!/a-frame-mouse-click-example
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
`mouseleave`, and `click` events. We use the name `mouse` to mimic
traditional web development for now. Under the hood, the cursor component uses
the `raycaster-intersection` and `raycaster-intersection-cleared` events,
capturing the closest visible intersected entity.

By default, the cursor is configured to be used in a gaze-based mode and will
register user input via mouse or touch. Specifying the `downEvents` and
`upEvents` properties allows the cursor to work with controllers. For example,
the [laser-controls component][laser-controls] automatically configures these
properties to work with most controllers.

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
<a-entity camera look-controls>
  <a-entity cursor="fuse: true; fuseTimeout: 500"
            position="0 0 -1"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: black; shader: flat">
  </a-entity>
</a-entity>

<a-entity id="box" cursor-listener geometry="primitive: box" material="color: blue"></a-entity>
```

```js
// Component to change to a sequential color on click.
AFRAME.registerComponent('cursor-listener', {
  init: function () {
    var lastIndex = -1;
    var COLORS = ['red', 'green', 'blue'];
    this.el.addEventListener('click', function (evt) {
      lastIndex = (lastIndex + 1) % COLORS.length;
      this.setAttribute('material', 'color', COLORS[lastIndex]);
      console.log('I was clicked at: ', evt.detail.intersection.point);
    });
  }
});
```

## Properties

| Property           | Description                                                                                                                                        | Default Value                    |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|
| downEvents         | Array of additional events on the entity to *listen* to for triggering `mousedown` (e.g., `triggerdown` for vive-controls).                        | []                               |
| fuse               | Whether cursor is fuse-based.                                                                                                                      | false on desktop, true on mobile |
| fuseTimeout        | How long to wait (in milliseconds) before triggering a fuse-based click event.                                                                     | 1500                             |
| mouseCursorStylesEnabled | Whether to show pointer cursor in `rayOrigin: mouse` mode when hovering over entity.                                                               | true                             |
| rayOrigin          | Where the intersection ray is cast from (i.e. xrselect ,entity or mouse). `rayOrigin: mouse` is extremely useful for VR development on a mouse and keyboard. | entity
| upEvents           | Array of additional events on the entity to *listen* to for triggering `mouseup` (e.g., `trackpadup` for daydream-controls).                       | []                               |

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

### Event Data

Additional detail is included in the `detail` object on the event as follows:

#### intersection

Relevant events will contain in the event detail `intersection`, which will
contain `{distance, point, face, faceIndex, indices, object}` about specific
data about the intersection:

```js
this.el.addEventListener('click', function (evt) {
  console.log(evt.detail.intersection.point);
});
```

#### intersectedEl

Events emitted on the cursor entity also include event detail `intersectedEl`, which provides a reference to the intersected entity.

#### mouseEvent and touchEvent

Where the trigger for a cursor event is a [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) or [TouchEvent](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent), event detail `mouseEvent` or `touchEvent` provides a reference to that event.

These events provide a wealth of additional detail about the event, as detailed in the APIs linked above.  Among other things, they can indicate:

- which mouse button was used
- information about the state of the mouse buttons (or multi-touch for touch events), and relevant keys shuch as Shift, Ctrl etc. at the time of the mouse or touch event.
- the screen co-ordinates where the event occured.

This information can be used by applications to handle cursor events differently, depending on this information (e.g. different handling of left click & right click).

For example:

```
this.el.addEventListener('click', function (evt) {
  if (!evt.detail.mouseEvent || evt.detail.mouseEvent.button === 0) {
    console.log("left button clicked (or touch event / no information)");
  
  } else if (evt.detail.mouseEvent.button === 2) {
    console.log("right button clicked"); 
  }
});
```

At most one of  `mouseEvent` or `touchEvent` will be present on a cursor event, and sometimes neither will.  Neither will be present on `mousenter`, `mouseleave` and `fusing` events, nor on a `click` event that has been triggered by a fuse timeout rather than a mouse click or touch event.

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

[animation]: ./animation.md

To add visual feedback to the cursor to show when the cursor is clicking or
fusing, we can use the [animation component][animation].  When the cursor
intersects the entity, it will emit an event, and the animation system will
pick up event with the `begin` attribute:

```html
<a-entity
  animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 1 1 1"
  animation__fusing="property: scale; startEvents: fusing; easing: easeInCubic; dur: 1500; from: 1 1 1; to: 0.1 0.1 0.1"
  animation__mouseleave="property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 500; to: 1 1 1"
  cursor="fuse: true;"
  material="color: black; shader: flat"
  position="0 0 -3"
  geometry="primitive: ring"></a-entity>
```

[cursor-codepen]: https://codepen.io/Absulit/pen/WEKjqm

To play with an example of a cursor with visual feedback, check out the [Cursor
with Visual Feedback example on CodePen][cursor-codepen].

## XR Select Cursor

When an XR `"selectstart"` event happens the raycaster picks an element based upon it's current location.
This works for handheld AR, and headmounted VR and AR. This works well with the mouse `rayOrigin` too.

```html
<a-scene
  cursor__mouse="rayOrigin: mouse"
  cursor__xrselect="rayOrigin: xrselect"
  raycaster="objects:#objects *;"
>
```
