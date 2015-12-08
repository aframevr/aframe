title: "Animation"
category: element
---

Animations and transitions in A-Frame are defined using the ```<a-animation>```
element as a child. The system is roughly based after the Web Animations
specification which is roughly based off of the SMIL specification. And it
uses tween.js internally.

As an introductory example, to define a 5-meter orbit on an entity about the
Y-axis that takes 10 seconds, we can offset the position and animate the
rotation. This animation starts with the initial rotation about the Y-axis of 0
degrees, and goes around 360 degrees. It's defined with a duration of 10000
milliseconds, maintains the final value on each cycle of the animation, and
loops infinitely.

```html
<a-entity position="5 0 0" rotation="0 0 0">
  <a-animation attribute="rotation" to="0 360 0"
               dur="10000" fill="forwards" repeat="indefinite"></a-animation>
</a-entity>
```

There are many attributes and values used to define animations. Below is a
table providing a quick overview of these attributes, and from there we'll
delve into more detail.

| Attribute   | Description                                                                                                             | Default Value  |
|-------------|-------------------------------------------------------------------------------------------------------------------------|----------------|
| attribute   | Attribute to animate. To specify a component attribute, use `componentName.attribute` syntax (e.g., `light.intensity`). | rotation       |
| begin       | Delay in milliseconds or event name to wait on before beginning animation.                                              | 0              |
| direction   | Direction of the animation (between `from` and `to`). One of `alternate`, `alternateReverse`, `normal`, `reverse`.      | normal         |
| dur         | Duration of the animation in milliseconds.                                                                              | 1000           |
| easing      | Easing function of the animation. There are very many to choose from.                                                   | ease           |
| fill        | Determines effect of animation when not actively in play. One of `backwards`, `both`, `forwards`, `none`.               | forwards       |
| from        | Starting value.                                                                                                         | Current value. |
| repeat      | Repeat count or `indefinite`.                                                                                           | 0              |
| to          | Ending value. Must be specified.                                                                                        | None           |

## Attribute

A-Frame's animation system can animate several possible categories of
attributes.

### Coordinate Attributes

A-Frame has several core coordinate-based components, that is position,
rotation, and scale. These components consist of three values: X, Y, and Z.  We
can pass three space-delimited numbers to the `from` and `to` attributes just
as we would define them on the entity. In this case, the animation system will
assume we are animating a coordinate value.

For example, if we want to animate an entity going from one spot to another, we
can animation the position component.

```html
<a-entity>
  <a-animation attribute="position" from="1 1 1" to="2 4 -8"></a-animation>
</a-entity>
```

### Boolean Attributes

A-Frame has several core components that accept a boolean value. Boolean values
can be "animated" as well, flipping the boolean at the end of each animation
cycle.

For example, we can define an animation that toggles the visibility of an
entity back and forth.

```html
<a-entity>
  <a-animation attribute="visible" to="false" repeat="indefinite"></a-animation>
</a-entity>
```

### Numeric Attributes

Although A-Frame does not currently have any core components that defined with
just a single numeric value, there are cases where we want to animate a flat
HTML attribute when we might have abstracted from the core entity-component
architecture.

For example, if we have a defined a custom element that wraps ```<a-entity
light="intensity: 1>``` as ```<a-light intensity="1">```, we want a way to be
able to animate light intensity. The animation system supports animating a numeric HTML
attribute.

```html
<a-light intensity="1">
  <a-animation attribute="intensity" to="3"></a-animation>
</a-light>
```

### Selecting a Component Attribute

Most often, we want to animate an attribute of a component. To do so, we select
the attribute using the dot syntax `componentName.attributeName`.

For example, to animate a cylinder's top radius, we can select the `radiusTop` value
with `geometry.radiusTop`.

```html
<a-entity geometry="primitive: cylinder; radiusTop: 1">
  <a-animation attribute="geometry.radiusTop" to="0.5"></a-animation>
</a-entity>
```

## Begin

The `begin` attribute defines when the animation should start playing.

This can either be a number for milliseconds to delay. For example, we can
define an animation that waits 2 seconds, from when the animation is attached,
before scaling an entity.

```html
<a-entity>
  <a-animation attribute="scale" begin="2000" to="2 2 2"></a-animation>
</a-entity>
```

Or it can be an event name to wait for the parent element to emit. For example, we
can define an animation that waits for the parent element to trigger an event
named `fade` before fading an entity.

```html
<a-entity id="fading-cube" geometry="primitive: cube" material="opacity: 1">
  <a-animation attribute="material.opacity" begin="fade" to="2 2 2"></a-animation>
</a-entity>
```

```js
// Trigger an event to begin fading.
document.querySelector('#fading-cube').emit('fade');
```

## Direction

The `direction` attribute defines which way to animate between the starting
value and the final value.

When an alternating direction is defined, which only takes effect when the
animation is set to repeat, the animation will go back and forth between the
values like a yo-yo.

| Attribute         | Description                                                                                                 |
|-------------------|--------------------------------------------------------------------------------------------------------------
| alternate         | On even-numbered cycles, animate from `from` to `to`. On odd-numbered cycles, animation from `to` to `from` |
| alternate-reverse | On odd-numbered cycles, animate from `from` to `to`. On even-numbered cycles, animation from `to` to `from` |
| normal            | Animate from `from` to `to`.                                                                                |
| reverse           | Animate from `to` to `from`.                                                                                |

## Easing

The `easing` attribute defines the easing function of the animation, which
defaults to `ease`. There are too many easing functions to list, but we can
implicitly explain what all of them are.

One possible value is `linear`. And the basic easing functions are `ease`,
`ease-in`, `ease-out`, and `ease-in-out`.

Then there are additional groups of easing functions. Each group of easing
functions are prefixed by the above basic easing functions. The groups of
easing functions are `cubic`, `quad`, `quart`, `quint`, `sine`, `expo`, `circ`,
`elastic`, `back`, and `bounce`.

For example, the `cubic` group of easing functions would consist of
`ease-cubic`, `ease-in-cubic`, `ease-out-cubic`, `ease-in-out-cubic`.

## Fill

The `fill` attribute defines the effect of animation when not actively in play.
Think of `fill` as what values the animation sets on the entity *before* and/or
*after* each animation cycle. Below are the possible values for `fill` and
their effects.

| Attribute | Description                                                                                                                                   |
|-----------|------------------------------------------------------------------------------------------------------------------------------------------------
| backwards | Before the animation starts, set the starting value to the `from` value.                                                                      |
| both      | Combine the effects of both backwards fill and forwards fill.                                                                                 |
| forwards  | After the animation finishes, the final value will stay at the `to` value. The default fill.                                                  |
| none      | Before the animation starts, set the starting value to the initial value. After the animation finishes, reset the value to the initial value. |

## Repeat

The `repeat` attribute defines how often the animation repeats. We call each
repeat of the animation a cycle. Repeat can either be a number that counts down
on each animation cycle until it reaches 0, at which the animation will end. Or
it can repeat can be set to `indefinite`, at which the animation will loop
continuously until the animation is manually removed or stopped.

## Events

The `<a-animation>` element emits a couple of events that will be useful for
programmatic usage.

| Event Name     | Description                                                                                                                           |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------|
| animationend   | Emitted when the animation finishes. In case of repeats, emitted when the repeat count reaches 0. Not emitted for indefinite repeats. |
| animationstart | Emitted immediately when the animation begins playing.                                                                                |
