---
title: "Interactions & Controllers"
type: introduction
layout: docs
parent_section: introduction
order: 8.5
---

There is no one true way for adding interactions due to variety of platforms,
devices, input methods that A-Frame can support. On top of that, VR interaction
is open-ended. Unlike the 2D Web where we only have to worry about mouse and
touch input, and unlike Cardboard where we only have to worry about one button,
we can do anything in VR: grab, throw, rub, flip, poke, stretch, press, etc.
Going further, mixed reality, trackers, and custom controllers provide even
more creativity in interaction!

What we can do in this section is go over existing components for common
interactions. And we can show *how* these input-based and interaction-based
components are built in order to give us the knowledge to build our own
interactions. In a sense, learn how to fish rather than being given a fish.

<!--toc-->

## Events

[events]: ./javascript-events-dom-apis.md#events-and-event-listeners
[addeventlistener]: https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener

In the 2D Web, input and interactions are handled through [browser
events][events] (e.g., `click`, `mouseenter`, `mouseleave`, `touchstart`,
`touchend`). Whenever an input-based event happens, the browser will emit
an event that we can listen to and handle with
[`Element.addEventListener`][addeventlistener]:

```js
// `click` event emitted by browser on mouse click.
document.querySelector('p').addEventListener('click', function (evt) {
  console.log('This 2D element was clicked!');
});
```

[synthetic]: https://developer.mozilla.org/docs/Web/Guide/Events/Creating_and_triggering_events

Just like the 2D Web, A-Frame relies on events and event listeners. However
because A-Frame is a JavaScript framework and everything is done in WebGL,
**A-Frame's events are [synthetic custom events][synthetic]** that can be
emitted by any component describing any event:

```js
// `collide` event emitted by a component such as some collider or physics component.
document.querySelector('a-entity').addEventListener('collide', function (evt) {
  console.log('This A-Frame entity collided with another entity!');
});
```

[mousecursor]: https://github.com/mayognaise/aframe-mouse-cursor-component

A common misbelief is that we can add a `click` event listener to an A-Frame
entity and expect it to work by directly clicking on the entity with our mouse.
In WebGL, we must provide the input and interaction that provides such `click`
events. For example, A-Frame's `cursor` component creates a synthetic `click`
event on gaze using a raycaster. Or as another example, Mayo Tobita's
[`mouse-cursor` component][mousecursor] creates a synthetic `click` event when
clicking directly on the entity using a raycaster.

## Gaze-Based Interactions

[Remix this cursor example on Glitch](https://glitch.com/~aframe-school-cursor-handler/).

We'll first go over gaze-based interactions. Gaze-based interactions rely on
rotating our heads and looking at objects to interact with them. This type of
interaction is for headsets without a controller. Even with a rotation-only
controller (Daydream, GearVR), the interaction is still similar. Since A-Frame
provides mouse-drag controls by default, gaze-based can sort of be used on
desktop to preview the interaction by dragging the camera rotation.

[cursor]: ../components/cursor.md

To add gaze-based interaction, we need to add or implement a component. A-Frame
comes with a [cursor component][cursor] that provides gaze-based interaction if
attached to the camera:

1. Explicitly define [`<a-camera>`](../components/camera.md) entity.
   Previously, A-Frame was providing the default camera.
2. Add [`<a-cursor>`][cursor] entity as a child element underneath the camera entity.

```html
<a-scene>
  <a-camera>
    <a-cursor></a-cursor>
    <!-- Or <a-entity cursor></a-entity> -->
  </a-camera>
</a-scene>
```

### Handling Events with event-set Component

[Remix this event set component example on Glitch](https://glitch.com/~aframe-event-set-component).

[event-set]: https://github.com/ngokevin/kframe/tree/master/components/event-set

Now let's handle the events that the cursor component provides. The cursor
component emits synthetic events like `click`, `mouseenter`, `mouseleave`,
`mousedown`, `mouseup`, and `fusing`. We named them similarly to the browser's
native events to be familiar for newcomers, but again note they are synthetic
events.

For basic event handler where we listen to an event and set a property in
response, we can use the [event-set component][event-set]. The event-set
component makes basic event handlers declarative. The API for the event-set
component looks like:

```html
<a-entity event-set__${id}="_event: ${eventName}; ${someProperty}: ${toValue}">
```

The `__${id}` piece lets us attach multiple event-set components on the same
entity. We provide `${eventName}` for which event the instance will handle. And
then we pass property names and values that we want to set when the event
occurs on or from the entity.

For example, to make an entity visible when it's hovered over or looked at. The
cursor component provides the `mouseenter` event:

```html
<a-entity event-set__makevisible="_event: mouseenter; visible: false">
```

If we want to change the color of a box on hover and restore it when no longer
hovering:

```html
<script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
<script src="https://unpkg.com/aframe-event-set-component@3.0.3/dist/aframe-event-set-component.min.js"></script>
<body>
  <a-scene>
    <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"
           event-set__enter="_event: mouseenter; color: #8FF7FF"
           event-set__leave="_event: mouseleave; color: #4CC3D9"></a-box>

    <a-camera>
      <a-cursor></a-cursor>
    </a-camera>
  </a-scene>
</body>
```

The event-set component can also target other entities using `_target:
${selector}`. If we want to display a text label when an entity is hovered
over:

```html
<script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
<script src="https://unpkg.com/aframe-event-set-component@3.0.3/dist/aframe-event-set-component.min.js"></script>
<body>
  <a-scene>
    <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"
                event-set__enter="_event: mouseenter; _target: #cylinderText; visible: true"
                event-set__leave="_event: mouseleave; _target: #cylinderText; visible: false">
      <a-text id="cylinderText" value="This is a cylinder" align="center" color="#FFF" visible="false" position="0 -0.55 0.55"
              geometry="primitive: plane; width: 1.75" material="color: #333"></a-text>
    </a-cylinder>

    <a-camera>
      <a-cursor></a-cursor>
    </a-camera>
  </a-scene>
</body>
```

The event-set component also works with components that have multiple
properties using A-Frame component dot syntax (i.e.,
`${componentName}.${propertyName}`):

```html
<script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
<script src="https://unpkg.com/aframe-event-set-component@3.0.3/dist/aframe-event-set-component.min.js"></script>
<body>
  <a-scene>
    <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"
             event-set__down="_event: mousedown; material.wireframe: true"
             event-set__up="_event: mouseup; material.wireframe: false"
             event-set__leave="_event: mouseleave; material.wireframe: false"></a-plane>

    <a-camera>
      <a-cursor></a-cursor>
    </a-camera>
  </a-scene>
</body>
```

### Handling Events With JavaScript

[Remix this cursor handler example on Glitch](https://glitch.com/~aframe-school-cursor-handler/)

## VR Controllers

### Tracked Controls

### 3DoF (Daydream, GearVR)

### 6DoF (Vive, Oculus Touch)

### Supporting Multiple Controllers (Hand Controls)

## Laser Interactions for Controllers

## Room Scale Interactions for Controllers
