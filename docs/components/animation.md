---
title: animation
type: components
layout: docs
parent_section: components
source_code: src/components/animation.js
examples:
 - title: Animating on Events
   src: https://glitch.com/edit/#!/aframe-animation-events?path=index.html:1:0
 - title: Generated Animations
   src: https://glitch.com/~aframe-shooting-stars
---

[animationtimeline]: https://www.npmjs.com/package/aframe-animation-timeline-component

The animation component lets us animate and tween values including:

- Component values (e.g., `position`, `visible`)
- Component property values (e.g., `light.intensity`)

We can also tween values directly for better performance versus going through
`.setAttribute`, such as by animating values:

- On the `object3D` (e.g., `object3D.position.y`, `object3D.rotation.z`)
- Directly within a component (e.g., `components.material.material.color`, `components.text.material.uniforms.opacity.value`),

For example, translating a box:

```html
<a-box position="-1 1.6 -5" animation="property: position; to: 1 8 -10; dur: 2000; easing: linear; loop: true" color="tomato"></a-box>
```

Or orbiting a sphere in a 5-meter radius:

```html
<a-entity rotation="0 0 0" animation="property: rotation; to: 0 360 0; loop: true; dur: 10000">
        <a-sphere position="5 0 0" color="mediumseagreen"></a-sphere>
</a-entity>
```

Read more below for additional options and discovering how to properly animate
different types of values.

<!--toc-->

## API

### Properties

| Property      | Description                                                                                                                                                                                                                                                                                                                                       | Default Value | Values                  |
| --------      | -----------                                                                                                                                                                                                                                                                                                                                       | ------------- | ------                  |
| property      | Property to animate. Can be a component name, a dot-delimited property of a component (e.g., `material.color`), or a plain attribute.                                                                                                                                                                                                             |               |                         |
| isRawProperty | Flag to animate an arbitrary object property outside of A-Frame components for better performance. If set to true, for example, we can set `property` to like `components.material.material.opacity`. If `property` starts with `components` or `object3D`, this will be inferred to `true`.                                                      | false         |                         |
| from          | Initial value at start of animation. If not specified, the current property value of the entity will be used (will be sampled on each animation start). It is best to specify a `from` value when possible for stability.                                                                                                                         | null          |                         |
| to            | Target value at end of animation.                                                                                                                                                                                                                                                                                                                 | null          |                         |
| type          | Right now only supports `color` for tweening `isRawProperty` color XYZ/RGB vector  values.                                                                                                                                                                                                                                                        | ''            |                         |
| delay         | How long (milliseconds) to wait before starting.                                                                                                                                                                                                                                                                                                  | 0             |                         |
| dir           | Which dir to go from `from` to `to`.                                                                                                                                                                                                                                                                                                              | normal        | alternate, reverse      |
| dur           | How long (milliseconds) each cycle of the animation is.                                                                                                                                                                                                                                                                                           | 1000          |                         |
| easing        | Easing function of animation. To ease in, ease out, ease in and out.                                                                                                                                                                                                                                                                              | easeInQuad    | See [easings](#easings) |
| elasticity    | How much to bounce (higher is stronger).                                                                                                                                                                                                                                                                                                          | 400           |                         |
| loop          | How many times the animation should repeat. If the value is `true`, the animation will repeat infinitely.                                                                                                                                                                                                                                         | 0             |                         |
| round         | Whether to round values.                                                                                                                                                                                                                                                                                                                          | false         |                         |
| startEvents   | Comma-separated list of events to listen to trigger a restart and play. Animation will not autoplay if specified. `startEvents` will **restart** the animation, use `pauseEvents` to resume it. If there are other animation components on the entity animating the same property, those animations will be automatically paused to not conflict. | null          |                         |
| pauseEvents   | Comma-separated list of events to listen to trigger pause. Can be resumed with `resumeEvents`.                                                                                                                                                                                                                                                    | null          |                         |
| resumeEvents  | Comma-separated list of events to listen to trigger resume after pausing.                                                                                                                                                                                                                                                                         | null          |                         |
| autoplay      | Whether or not the animation should `autoplay`. Should be specified if the animation is defined for the [`animation-timeline` component][animationtimeline].                                                                                                                                                                                      | true      |                         |
| enabled       | If disabled, animation will stop and startEvents will not trigger animation start.                                                                                                                                                                                                                                                                                                                        | true          ||

### Multiple Animations

The component's base name is `animation`. We can attach multiple animations to
one entity by name-spacing the component with double underscores (`__`):

```html
<a-entity animation="property: rotation"
          animation__2="property: position"
          animation__color="property: material.color"></a-entity>
```

### Easings

Easings define the accelerations and speed throughout the cycle of the
animation.

| easeIn        | easeOut        | easeInOut        | Others |
|---------------|----------------|------------------|--------|
| easeInQuad    | easeOutQuad    | easeInOutQuad    | linear |
| easeInCubic   | easeOutCubic   | easeInOutCubic   |        |
| easeInQuart   | easeOutQuart   | easeInOutQuart   |        |
| easeInQuint   | easeOutQuint   | easeInOutQuint   |        |
| easeInSine    | easeOutSine    | easeInOutSine    |        |
| easeInExpo    | easeOutExpo    | easeInOutExpo    |        |
| easeInCirc    | easeOutCirc    | easeInOutCirc    |        |
| easeInBack    | easeOutBack    | easeInOutBack    |        |
| easeInElastic | easeOutElastic | easeInOutElastic |        |

### Events

| Property                | Description                                                            |
| --------                | -----------                                                            |
| animationbegin          | Animation began. Event detail contains `name` of animation.            |
| animationcomplete       | Animation completed. Event detail contains `name` of animation.        |
| animationcomplete__<id> | Animation completed if animation has an ID (e.g., `animation__click`). |

### Members

Accessed as `el.components.animation.<MEMBER>`.

| Member    | Description                |
|-----------|----------------------------|
| animation | anime.js object.           |
| config    | Config passed to anime.js. |

### Controlling Animations using setAttribute

Like any A-Frame component, the animation component can be configured from JavaScript by calling [setAttribute()]( https://aframe.io/docs/1.7.1/introduction/javascript-events-dom-apis.html#updating-a-component-with-setattribute) on an element.

By default, the animation will begin playing immediately (autoplay is true by default).

However, care should be taken when using the interface in this way.  If a finite (i.e. non-looping) animation is requested twice in a row, with identical parameters, the second animation will not play, and neither will it generate an animationcomplete event.

This is because A-Frame sees the second request as a duplicate request for configuration already applied to the element, and so the second request never reaches the animation component.

A better approach is to control the start of an animation using events (see next section)

- On initialization, configure all the animations that may be required on the object, with a custom event configured to start the animation.
- When you want to start a specific animation, do so by using emit() rather than setAttribute().

This gives more robust control of the animation (avoiding problems where you request the same animation twice in a row), and also reduces the overheads involved in setting up animation config, since it only needs to be done once.

## Animating on Events

We can use the `startEvents` property to animate upon events:

```html
<a-entity id="mouseCursor" cursor="rayOrigin: mouse"></a-entity>

<a-entity
  geometry="primitive: box"
  material="color: red"
  animation__mouseenter="property: components.material.material.color; type: color; to: blue; startEvents: mouseenter; dur: 500";
  animation__mouseleave="property: components.material.material.color; type: color; to: red; startEvents: mouseleave; dur: 500";
  animation__customevent="property: components.material.material.color; type: color; from: red; to: blue; startEvents: triggeranimation; dur: 500";>
</a-entity>
```

[eventsglitch]: https://glitch.com/edit/#!/aframe-animation-events?path=index.html:1:0

[Remix the Animating on Events Glitch][eventsglitch].

To start an animation by explicitly [emitting a custom event](https://aframe.io/docs/1.7.1/introduction/javascript-events-dom-apis.html#emitting-an-event-with-emit), you can do the following:

```
el.emit(`triggeranimation`, null, false);
```

The [third parameter of emit](https://aframe.io/docs/1.7.1/core/entity.html#emit-name-detail-bubbles) set to "false" parameter ensures the event won't bubble up to parents, so that you can target the animation at just one particular element.

This assumes that an animation has already been configured to respond to that custom start event, for example like this:

```
el.setAttribute('animation__001', {'property': 'position',
                                 'to': {x: 1, y: 1, z: 1},                                 
                                 'startEvents': 'startanim001'});
```

(configuring startEvents on the animation automatically disables autoplay).

## Animating Different Types of Values

We'll go over different cases of animating different types of values.

### Component Values

We can animate a single-property component value (e.g., `property: visible`,
we'll go over booleans in a bit) or animate a property of a multi-property
component using a dot `.` as a separator (e.g., `property: light.intensity`,
`property: material.color`).

If the property is a `vec3`, that is also supported (e.g., `property:
someComponent.vec3Value; to: 5 5 5`).

However, animating component values this way is not the most optimal way as it
will invoke `.setAttribute` on each frame of the animation. For an animation
here or there, it won't be a big deal, but we can save time and memory by
animating values directly.

A special note to try not to animate values of the `geometry` component as that
will recreate the geometry on each tick. Rather animate `scale` if we want to
animate the size.

### Boolean Values

We can "animate" boolean values where the `to` value will be applied at the end
of the animation. Like `property: visible; from: false; to: true; dur: 1`.

### Direct Values through `object3D` and `components`

The animation component supports animating values directly through `object3D`
or `components`.

For example, we can animate values on `object3D` like `property:
object3D.position.z; to: 5` which will tween the entity's `object3D.position.z`
value directly without calling `.setAttribute`; it's the most direct way and
lets us animate a single axis at a time. Note, for `object3D.rotation`, degrees
are used.

Or we can animate values by reaching into `components`. For example, rather than
animating `property: material.opacity` which would call `.setAttribute` on each
frame, we can animate the opacity value directly with `property:
components.material.material.opacity`. We use a dot-delimited path to walk the
object tree to find the value we want to animate, and the animation process
under the hood reduces down to changing a number.

#### Direct Color Values

We can animate three.js color values directly, but we'll need to specify `type:
color`. So rather than animating `property: material.color`, we can do
`property: components.material.material.color; type: color`.

A note on color values, we can specify color values using hex, color names,
hsl, or rgb (e.g., `from: red; to: #FFCCAA` or `from: rgb(100, 100, 100); to:
hsl(213, 100%, 70%)`)..

## Using anime.js Directly

anime is a popular and powerful animation engine. The component prefers to do
just basic tweening and touches the surface of what anime can do (e.g.,
timelines, motion paths, progress, seeking). If we need more animation
features, create a separate component that invokes anime.js directly. anime is
accessible via **`AFRAME.ANIME`**.

Read through and explore the [anime.js
documentation](https://github.com/juliangarnier/anime) and
[website](https://animejs.com).

## See Also

- [animation-timeline component][animationtimeline]
