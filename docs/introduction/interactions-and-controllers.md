---
title: "Interactions & Controllers"
type: introduction
layout: docs
parent_section: introduction
order: 8.5
examples:
  - title: Basic Interaction
    src: https://glitch.com/edit/#!/aframe-basic-interaction?path=index.html:1:0
  - title: Escape the Room
    src: https://glitch.com/edit/#!/wide-cream?path=index.html:1:0
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
[mouse-cursor component][mousecursor] creates a synthetic `click` event when
clicking directly on the entity using a raycaster.

## Gaze-Based Interactions with cursor Component

[Remix this cursor example on Glitch](https://glitch.com/~aframe-school-cursor-handler/).

We'll first go over gaze-based interactions. Gaze-based interactions rely on
rotating our heads and looking at objects to interact with them. This type of
interaction is for headsets without a controller. Even with a rotation-only
controller (Daydream, GearVR), the interaction is still similar. Since A-Frame
provides mouse-drag controls by default, gaze-based can sort of be used on
desktop to preview the interaction by dragging the camera rotation.

[configureraycaster]: ../components/cursor.md#configuring-the-cursor-through-the-raycaster-component
[cursor]: ../components/cursor.md

To add gaze-based interaction, we need to add or implement a component. A-Frame
comes with a [cursor component][cursor] that provides gaze-based interaction if
attached to the camera:

1. Explicitly define [`<a-camera>`](../components/camera.md) entity.
   Previously, A-Frame was providing the default camera.
2. Add [`<a-cursor>`][cursor] entity as a child element underneath the camera entity.
3. Optionally, [configure the raycaster used by the cursor][configureraycaster].

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
<a-entity event-set__makevisible="_event: mouseenter; visible: true">
```

If we want to change the color of a box on hover and restore it when no longer
hovering:

```html
<script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
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
<script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
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
<script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
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
<script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
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

The controller components following are only activated if they detect the
controller is found and seen as connected in the Gamepad API.

### Adding 3DoF Controllers (daydream-controls, gearvr-controls)

[dof]: http://www.roadtovr.com/introduction-positional-tracking-degrees-freedom-dof/

Controllers with *3 degrees of freedom* (3DoF) are limited to rotational
tracking. 3DoF controllers have no positional tracking meaning we can't reach
out nor move our hand back-and-forth or up-and-down. Having a controller with
only 3DoF is like having a hand and wrist without an arm. [Read more about
degrees of freedom for VR][dof].

The 3DoF controller components provide rotational tracking, a default model
matching the real-life hardware, and events to abstract the button mappings.
The controllers for Google Daydream and Samsung GearVR have 3DoF, and both
support only one controller for one hand.

[daydreamcomponent]: ../components/daydream-controls.md

To add a controller for Google Daydream, use the [daydream-controls
component][daydreamcomponent]. Then try it out on Chrome for Android on a
Daydream smartphone:

```html
<a-entity daydream-controls></a-entity>
```

[gearvrcomponent]: ../components/gearvr-controls.md

To add a controller for Samsung GearVR, use the [gearvr-controls
component][gearvrcomponent]. Then try it out on Oculus Carmel or Samsung
Internet on a smartphone with GearVR:

```html
<a-entity gearvr-controls></a-entity>
```

### Adding 6DoF Controllers (vive-controls, oculus-touch-controls)

Controllers with *6 degrees of freedom* (6DoF) have both rotational and
positional tracking. Unlike controllers with 3DoF which are constrained to
orientation, controllers with 6DoF are able to move freely in 3D space. 6DoF
allows us to reach forward, behind our backs, move our hands across our body or
close to our face. Having 6DoF is like reality where we have both hands and
arms. 6DoF also applies to the headset and additional trackers (e.g., feet,
props). Having 6DoF is a minimum for providing a truly immersive VR experience.

The 6DoF controller components provide full tracking, a default model matching
the real-life hardware, and events to abstract the button mappings.  HTC Vive
and Oculus Rift with Touch provide 6DoF and controllers for both hands. HTC
Vive also provides trackers for tracking additional objects in the real world
into VR.

[rocks]: https://webvr.rocks
[vivecomponent]: ../components/vive-controls.md

To add controllers for HTC Vive, use the [vive-controls
component][vivecomponent] for both hands. Then try it out on a [WebVR-enabled
desktop browser][rocks]:

```html
<a-entity vive-controls="hand: left"></a-entity>
<a-entity vive-controls="hand: right"></a-entity>
```

[riftcomponent]: ../components/oculus-touch-controls.md

To add controllers for Oculus Touch, use the [oculus-touch-controls
component][riftcomponent] for both hands. Then try it out on a [WebVR-enabled
desktop browser][rocks]:

```html
<a-entity oculus-touch-controls="hand: left"></a-entity>
<a-entity oculus-touch-controls="hand: right"></a-entity>
```

## Supporting Multiple Types of Controllers

The Web has the benefit of being able to support multiple platforms. Though
it's less clear in VR what supporting multiple platforms entails since a 3DoF
platform versus a 6DoF platform provide different interactions and require
different user experience treatent. It will be up to the application what
"responsive" means for VR on the Web. What we can show are several different
methods, but none that are truly one-size-fits-all.

### hand-controls Component

[handcontrols]: ../components/hand-controls.md
[lasercontrols]: ../components/laser-controls.md

A-Frame provides an implementation for supporting multiple types of 6DoF
controllers (Vive, Oculus Touch) via the [hand-controls
component][handcontrols]. The hand-controls component is primarily for 6DoF
controllers since it's geared towards room scale interactions such as grabbing
objects.  The hand-controls component works on top of both Vive and Oculus
Touch controllers by:

- Setting both the vive-controls and oculus-touch-controls component
- Overriding the controller models with a simple hand model
- Mapping Vive-specific and Oculus Touch-specific events to hand events and
  gestures (e.g., `gripdown` and `triggerdown` to `thumbup`)

To add the hand-controls component:

```html
<a-entity hand-controls="left"></a-entity>
<a-entity hand-controls="right"></a-entity>
```

Unfortunately, there is not yet a 3DoF controller component that abstracts well
all the types of 3DoF controllers (i.e., Daydream, GearVR). We could create a
custom controller that works with both controllers. It would be fairly easy to
cover since 3DoF controllers do not offer much potential for interaction (i.e.,
only rotational tracking with a touchpad).

However, there is a controller component that covers all 6DoF and 3DoF controllers
currently supported by A-Frame: [laser-controls][lasercontrols].

### Creating Custom Controllers

[handcontrolssource]: https://github.com/aframevr/aframe/blob/master/src/components/hand-controls.js

As mentioned previously, applications are best when controllers are
custom-tailored to the experience. Most VR applications have their own distinct
controllers. This means different models, animations, gestures, visual
feedback, and states.

Looking at the [hand-controls source code][handcontrolssource] is a decent way
to understand how to do a custom controller without having to do everything
from scratch:

- The tracked-controls component will provide pose and events
- The vive-controls, oculus-touch-controls, daydream-controls, or
  gearvr-controls components provide button mappings controller-specific events
- Our custom controller component will build on all of the above, plus
  overriding the model, animations, visual feedback, states, etc.,

The first piece is to set which controller components will be supported. The
controller components will inject the tracked-control components as well. For
example, to support all controllers, set all of the controller components while
providing the hand and overriding the model:

```js
AFRAME.registerComponent('custom-controls', {
  schema: {
    hand: {default: ''},
    model: {default: 'customControllerModel.gltf'}
  },

  update: function () {
    var controlConfiguration = {
      hand: this.data.hand,
      model: false,
      rotationOffset: hand === 'left' ? 90 : -90
    };

    // Build on top of controller components.
    el.setAttribute('vive-controls', controlConfiguration);
    el.setAttribute('oculus-touch-controls', controlConfiguration);
    el.setAttribute('daydream-controls', controlConfiguration);
    el.setAttribute('gearvr-controls', controlConfiguration);
    el.setAttribute('windows-motion-controls', controlConfiguration);

    // Set a model.
    el.setAttribute('gltf-model', this.data.model);
  }
});
```

[a-blast]: https://github.com/aframevr/a-blast/blob/master/src/components/shoot-controls.js
[a-painter]: https://github.com/aframevr/a-painter/blob/master/src/components/paint-controls.js

For advanced examples on real applications, see the [paint-controls component
for A-Painter][a-painter] or the [shoot-controls component for
A-Blast][a-blast].

## Listening for Button and Axis Events

Controllers have many buttons and emit many events. For each button, every time
a button is pressed down, released, or for some cases, even touched. And for
each axis (e.g., trackpad, thumbstick), an event is emitted every time it is
touched. To handle buttons, look for the event name in the respective
controller component documentation pages at the event tables, then register
event handlers how we want:

- [daydream-controls events](../components/daydream-controls.md#events)
- [gearvr-controls events](../components/gearvr-controls.md#events)
- [hand-controls events](../components/hand-controls.md#events)
- [oculus-touch-controls events](../components/oculus-touch-controls.md#events)
- [vive-controls events](../components/vive-controls.md#events)
- [windows-motion-controls events](../components/windows-motion-controls.md#events)

For example, we can listen to the Oculus Touch X button press, and toggle
visibility of an entity. In component form:

```js
AFRAME.registerComponent('x-button-listener', {
  init: function () {
    var el = this.el;
    el.addEventListener('xbuttondown', function (evt) {
      el.setAttribute('visible', !el.getAttribute('visible'));
    });
  }
});
```

Then attach the component:

```html
<a-entity oculus-touch-controls x-button-listener></a-entity>
```

## Adding Laser Interactions for Controllers

[laser-controls]: ../components/laser-controls.md

Laser interactions refer to placing a visible raycaster (line) shooting out of
the controller. Interactions occur when entities intersect the line, a
controller button changes during intersection, and/or when entities no longer
intersect the line. This interaction is very similar to gaze-based interaction,
except the raycaster is now affixed to the controller rather than the headset.

The [laser-controls component][laser-controls] component provides laser
interactions for controllers.  The usage is almost exactly similar to the
cursor component, but attach the component to the controller rather than under
the camera:

```html
<a-entity laser-controls="hand: right"></a-entity>
```

[raycasterfar]: ../components/raycaster.html#properties_far

Then default length of the laser is configured by [adjusting the length of the
raycaster][raycasterfar]. When the laser intersects with an entity, the length
of the laser will be truncated.

```html
<a-entity hand-controls controller-cursor raycaster="far: 2"></a-entity>
```

[gaze]: #gaze-based-interactions-with-cursor-component

Then handling events and interactions is the exact same as [gaze-based
interactions with the cursor component][gaze] . Refer to the section above!

## Adding Room Scale Interactions for Controllers

Room scale interactions are harder. These include interactions in 3D space and
two-handed interactions such as grabbing, throwing, stretching, hitting,
turning, pulling, or pushing. The number or complexity of room scale
interactions is not something we can completely cover. This is unlike the 2D
Web where there is just mouse and touchscreen or 3DoF VR where there is only
wiggling the controller. But we can show various implementations that can be
used as is or as a reference.

Rather than using raycasters to detect for intersections with objects, room
scale and 3D interactions involve *colliders*. Whereas raycasters are 2D lines,
colliders are 3D volumes. There are different shapes of colliders (AABB/box,
sphere, mesh) that wrap around objects, and when those shapes intersect, a
collision is detected.

### super-hands Component

[superhands]: https://github.com/wmurphyrd/aframe-super-hands-component
[superhandsdocs]: https://github.com/wmurphyrd/aframe-super-hands-component#description
[superhandsex]: https://wmurphyrd.github.io/aframe-super-hands-component/examples/

The [super-hands component by William Murphy][superhands] provides all-in-one
natural hand controller interaction. The component interprets input from
tracked controllers and collision detection components into interaction
gestures and communicates those gestures to target entities for them to
respond.

The currently implemented gestures are:

- Hover: Holding a controller in the collision space of an entity
- Grab: Pressing a button while hovering an entity, potentially also moving it
- Stretch: Grabbing an entity with two hands and resizing
- Drag-drop: Dragging an entity onto another entity

For an entity to respond to the super-hands gestures, the entity needs to have
components attached to translate the gestures into actions. super-hands
includes components for typical reactions to the implemented gestures:
hoverable, grabbable, stretchable, and drag-droppable.

The [documentation for super-hands][superhandsdocs] and
[examples][superhandsex] are excellent for getting started. We defer to those.

### Other Examples

[aframe-extras]: https://github.com/donmccurdy/aframe-extras
[aframe-physics]: https://github.com/donmccurdy/aframe-physics-system

Other examples to look at include:

- [tracked-controls](https://github.com/aframevr/aframe/tree/master/examples/showcase/tracked-controls) -
  Interaction through sphere-collider and grab components.
- [ball-throw](https://github.com/bryik/aframe-ball-throw) - Grab and throw
  using [aframe-extras] and [aframe-physics].
- [vr-editor](https://github.com/caseyyee/aframe-vreditor-component) - Interaction through
  a single vr-editor component for cloning, moving, deleting, placing, and scaling.
