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

Just like the 2D Web, A-Frame relies on events and event listeners for
interactivity and dynamicity. However because A-Frame is a JavaScript framework
and everything is done in WebGL, **A-Frame's events are [synthetic custom
events][synthetic]** that can be emitted by any component describing any event:

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

[writingcomponent]: ./writing-a-component.md

The event set component is good for basic setting operations, but it is
important to know how to handle events in JavaScript. We might want to do more
complex operations (e.g., make API calls, store data, affect the application
state) in response to events. For those cases, we'll need to use JavaScript,
and for A-Frame, we prescribe that code be placed within [A-Frame
components][writingcomponent].

To demonstrate what the event set component does under the hood, let's have a
box change color on hover and on leaving hover with JavaScript:

```html
<script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
<script>
  AFRAME.registerComponent('change-color-on-hover', {
    schema: {
      color: {default: 'red'}
    },

    init: function () {
      var data = this.data;
      var el = this.el;  // <a-box>
      var defaultColor = el.getAttribute('material').color;

      el.addEventListener('mouseenter', function () {
        el.setAttribute('color', data.color);
      });

      el.addEventListener('mouseleave', function () {
        el.setAttribute('color', defaultColor);
      });
    }
  });
</script>
<body>
  <a-scene>
    <a-box color="#EF2D5E" position="0 1 -4" change-color-on-hover="color: blue"></a-box>

    <a-camera><a-cursor></a-cursor></a-camera>
  </a-scene>
</body>
```

While we do a simple `.setAttribute`, we could technically do anything within
the component in response to the event since we have full access to JavaScript,
three.js, and Web APIs.

We'll move onto describing and implementing interactivity for VR controllers,
but the concepts of events and event listeners will still apply.

## VR Controllers

Controllers are vital for immersing people into a VR application. The potential
of VR is not met without them, namely controllers that provide six degrees of
freedom (6DoF). With controllers, people can reach out and around the scene and
interact with objects with their hands.

[gamepad]: https://developer.mozilla.org/docs/Web/API/Gamepad_API/Using_the_Gamepad_API

A-Frame provides components for controllers across the spectrum as supported by
their respective WebVR browsers through the [Gamepad Web API][gamepad]. There
are components for Vive, Oculus Touch, Daydream, and GearVR controllers.

To inspect the Gamepad object for poking around or to get the Gamepad ID, we
can call `navigator.getGamepads()` in the browser console. This will return a
`GamepadList` array with all of the connected controllers.

For advanced applications, controllers are built and tailored for the
application (i.e., custom 3D models, animations, mappings, gestures). For
example, a medieval knight might have metal gauntlets, or a robot might have a
robot hand that can shoot lasers or display information on the wrist.

The controller components that A-Frame provide primarily act as defaults,
starter components, or a base from which to derive more custom controller
components.

### tracked-controls Component

[trackedcontrols]: ../components/tracked-controls.md
[vivecontrols]: ../components/vive-controls.md

The [tracked-controls component][trackedcontrols] is A-Frame's base controller
component that provides the foundation for all of A-Frame's controller
components. The tracked-controls component:

- Grabs a Gamepad object from the Gamepad API given an ID or prefix.
- Applies pose (position and orientation) from the Gamepad API to read controller motion.
- Looks for changes in the Gamepad object's button values to provide events
  when buttons are pressed or touched and when axis and touchpads are changed
  (i.e., `axischanged`, `buttonchanged`, `buttondown`, `buttonup`,
  `touchstart`, `touchend`).

All of A-Frame's controller components build on top of the tracked-controls
component by:

- Setting the tracked-controls component on the entity with the appropriate
  Gamepad ID (e.g., `Oculus Touch (Right)`). For example, the [vive-controls
  component][vivecontrols] does `el.setAttribute('tracked-controls', {idPrefix:
  'OpenVR'})`. tracked-controls will then connect to the appropriate Gamepad
  object to provide pose and events for the entity.
- Abstracting the events provided by tracked-controls. tracked-controls events are
  low-level; it'd difficult for us to tell which buttons were pressed based
  off of those events alone because we'd have to know the button mappings beforehand.
  Controller components can know the mappings beforehand for their respective
  controllers and provide more semantic events such as `triggerdown` or `xbuttonup`.
- Providing a model. tracked-controls alone does not provide any appearance.
  Controller components can provide a model that shows visual feedback,
  gestures, and animations when buttons are pressed or touched.

### 3DoF Controller Components (Daydream, GearVR)

### 6DoF Controller Components (Vive, Oculus Touch)

### Abstracted Controller Components (hand-controls)

## Laser Interactions for Controllers

## Room Scale Interactions for Controllers
