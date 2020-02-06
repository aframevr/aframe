---
title: Entity-Component-System
type: introduction
layout: docs
order: 5
examples:
  - title: Community Components in Action
    src: https://glitch.com/edit/#!/aframe-registry?path=index.html
  - title: Animated Lights
    src: https://glitch.com/edit/#!/aframe-animated-lights?path=index.html
---

[ecs]: https://wikipedia.org/wiki/Entity_component_system

A-Frame is a three.js framework with an [entity-component-system][ecs] (ECS)
architecture. ECS architecture is a common and desirable pattern in 3D and game
development that follows the **composition over inheritance and hierarchy**
principle.

The benefits of ECS include:

1. Greater flexibility when defining objects by mixing and matching reusable parts.
2. Eliminates the problems of long inheritance chains with complex interwoven functionality.
3. Promotes clean design via decoupling, encapsulation, modularization, reusability.
4. Most scalable way to build a VR application in terms of complexity.
5. Proven architecture for 3D and VR development.
6. Allows for extending new features (possibly sharing them as community components).

On the 2D Web, we lay out elements that have fixed behavior in a hierarchy. 3D
and VR is different; there are infinite types of possible objects that have
unbounded behavior. ECS provides a manageable pattern to construct types of
objects.

Below are great introductory materials to ECS architecture. We recommend
skimming through them to get a better grasp of the benefits. ECS is well-suited
for VR development, and A-Frame is based entirely around this paradigm:

- [*Entity-component-system* on Wikipedia](https://en.wikipedia.org/wiki/Entity%E2%80%93component%E2%80%93system)
- [*What is an Entity System?* by Adam Martin](http://t-machine.org/index.php/2007/11/11/entity-systems-are-the-future-of-mmog-development-part-2/)
- [*Decoupling Patterns &mdash; Component* on Game Programming Patterns](http://gameprogrammingpatterns.com/component.html)
- [*Evolve Your Hierarchy* by Mick West](http://cowboyprogramming.com/2007/01/05/evolve-your-heirachy/)

A well-known game engine implementing ECS is Unity. Although there are pain
points in cross-entity communication, we'll see how A-Frame, the DOM, and
declarative HTML really make ECS shine.

<!--toc-->

## Concept

[entity]: ../core/entity.md
[component]: ../core/component.md
[system]: ../core/systems.md

![ECS Minecraft](https://cloud.githubusercontent.com/assets/674727/20289898/71f7fea0-aa91-11e6-8307-d8dc68dff285.png)

A basic definition of ECS involves:

- **[Entities][entity]** are container objects into which components can be
  attached. Entities are the base of all objects in the scene. Without
  components, entities neither do nor render anything, similar to empty `<div>`s.
- **[Components][component]** are reusable modules or data containers that can
  be attached to entities to provide appearance, behavior, and/or
  functionality. Components are like plug-and-play for objects. All logic is
  implemented through components, and we define different types of objects by
  mixing, matching, and configuring components. Like alchemy!
- **[Systems][system]** provide global scope, management, and services for
  classes of components. Systems are often optional, but we can use them to
  separate logic and data; systems handle the logic, components act as data
  containers.

### Examples

Some abstract examples of different types of entities built from composing
together different components:

- `Box = Position + Geometry + Material`
- `Light Bulb = Position + Light + Geometry + Material + Shadow`
- `Sign = Position + Geometry + Material + Text`
- `VR Controller = Position + Rotation + Input + Model + Grab + Gestures`
- `Ball = Position + Velocity + Physics + Geometry + Material`
- `Player = Position + Camera + Input + Avatar + Identity`

As another abstract example, imagine we want to build a car entity by
assembling components:

- We can attach a `material` component that has properties such as "color" or
  "shininess" that affects the appearance of the car.
- We can attach an `engine` component that has properties such as "horsepower" or
  "weight" that affects the functionality of the car.
- We can attach a `tire` component that has properties such as "number of
  tires" or "steering angle" that affects the behavior of the car.

So we can create different types of cars by varying the properties of the
`material`, `engine`, and `tire` component. The `material`, `engine`, and
`tire` components don't have to know about each other and can even be used in
isolation for other cases. We could mix and match them to create even
different types of vehicles:

- To create a *boat* entity: remove the `tire` component.
- To create a *motorcycle* entity: change `tire` component's number of tires to 2,
  configure the `engine` component to be smaller.
- To create an *airplane* entity: attach `wing` and `jet` components.

Contrast this to traditional inheritance where if we want to extend an object,
we would have to create a large class that tries to handle everything or an
inheritance chain.

## ECS in A-Frame

A-Frame has APIs that represents each piece of ECS:

- **Entities** are represented by the `<a-entity>` element and prototype.
- **Components** are represented by HTML attributes on `<a-entity>`'s. Underneath,
  components are objects containing a schema, lifecycle handlers, and methods.
  Components are registered via the `AFRAME.registerComponent (name, definition)`
  API.
- **Systems** are represented by `<a-scene>`'s HTML attributes. System are
  similar to components in definition. Systems are registered via the
  `AFRAME.registerSystem (name, definition)` API.

### Syntax

[style]: https://developer.mozilla.org/docs/Web/API/HTMLElement/style

We create `<a-entity>` and attach components as HTML attributes. Most
components have multiple properties that are represented by a syntax similar to
[`HTMLElement.style` CSS][style]. This syntax takes the form with a colon
(`:`) separating property names from property values, and a semicolon (`;`)
separating different property declarations:

`<a-entity ${componentName}="${propertyName1}: ${propertyValue1}; ${propertyName2}: ${propertyValue2}">`

[geometry]: ../components/geometry.md
[material]: ../components/material.md
[light]: ../components/light.md
[position]: ../components/position.md

For example, we have `<a-entity>` and attach the [geometry], [material],
[light], and [position] components with various properties and property values:

```html
<a-entity geometry="primitive: sphere; radius: 1.5"
          light="type: point; color: white; intensity: 2"
          material="color: white; shader: flat; src: glow.jpg"
          position="0 0 -5"></a-entity>
```

### Composition

From there, we could attach more components to add additional appearance,
behavior, or functionality (e.g., physics). Or we could update the component
values to configure the entity (either declaratively or through
`.setAttribute`).

[composegif]: https://cloud.githubusercontent.com/assets/674727/25463804/896c04c2-2aad-11e7-8015-2fc84118a01c.gif

![Composing an Entity][composegif]

A common type of entity to compose from multiple components are the player's
hands in VR. The player's hands can have many components: appearance, gestures,
behaviors, interactivity with other objects.

We plug in components into a hand entity to provide it behavior as if we were
attaching superpowers or augmentations for VR! Each of the components below
have no knowledge of each other, but can be combined to define a complex
entity:

```html
<a-entity
  tracked-controls  <!-- Hook into the Gamepad API for pose. -->
  vive-controls  <!-- Vive button mappings. -->
  oculus-touch-controls  <!-- Oculus button mappings. -->
  hand-controls  <!-- Appearance (model), gestures, and events. -->
  laser-controls <!-- Laser to interact with menus and UI. -->
  sphere-collider  <!-- Listen when hand is in contact with an object. -->
  grab  <!-- Provide ability to grab objects. -->
  throw <!-- Provide ability to throw objects. -->
  event-set="_event: grabstart; visible: false"  <!-- Hide hand when grabbing object. -->
  event-set="_event: grabend; visible: true"  <!-- Show hand when no longer grabbing object. -->
>
```

### Declarative DOM-Based ECS

A-Frame takes ECS to another level by making it declarative and based on the
DOM. Traditionally, ECS-based engines would create entities, attach components,
update components, remove components all through code. But A-Frame has HTML and
the DOM which makes ECS ergonomic and resolves many of its weaknesses. Below
are abilities that the DOM provides for ECS:

1. **Referencing Other Entities with Query Selectors**: The DOM provides a powerful
query selector system which lets us query the scene graph and select an entity
or entities that match a condition. We can get references to entities by IDs,
classes, or data attributes. Because A-Frame is based on HTML, we can use query
selectors out of the box. `document.querySelector('#player')`.
2. **Decoupled Cross-Entity Communication with Events**: The DOM provides the
ability to listen to and emit events. This provides a publish-subscribe
communication system between entities. Components don't have to know about each
other, they can just emit an event (which could bubble up), and other
components can listen to those events without calling each other.
`ball.emit('collided')`.
3. **APIs for Lifecycle Management with DOM APIs**: The DOM provides APIs to
update HTML elements and the tree including `.setAttribute`,
`.removeAttribute`, `.createElement`, and `.removeChild`. These can be used as
is just like in normal web development.
4. **Entity-Filtering with Attribute Selectors**: The DOM provides attribute
selectors which allows us to query for an entity or entities that have or don't
have certain HTML attributes. This means we can ask for entities that have or
don't have a certain set of components.
`document.querySelector('[enemy]:not([alive])')`.
5. **Declarativeness**: Lastly, the DOM provides HTML. A-Frame bridges between
ECS and HTML making an already clean pattern declarative, readable, and
copy-and-pasteable.

### Extensibility

A-Frame components can do anything. Developers are given permissionless
innovation to create components to extend any feature. Components have full
access to JavaScript, three.js, and Web APIs (e.g., WebRTC, Speech
Recognition).

[writecomponent]: ./writing-a-component.md

We will later go over in detail how to [write an A-Frame
component][writecomponent]. As a preview, the structure of a basic component
may look like:

```js
AFRAME.registerComponent('foo', {
  schema: {
    bar: {type: 'number'},
    baz: {type: 'string'}
  },

  init: function () {
    // Do something when component first attached.
  },

  update: function () {
    // Do something when component's data is updated.
  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  }
});
```

Declarative ECS grants us the ability to write a JavaScript module and abstract
it through HTML. Once the component is registered, we can declaratively plug
this module of code into an entity via an HTML attribute.  This code-to-HTML
abstraction makes ECS powerful and easy to reason. `foo` is the name of the
component we just registered, and the data contains `bar` and `baz` properties:

```html
<a-entity foo="bar: 5; baz: bazValue"></a-entity>
```

### Component-Based Development

**For building VR applications, we recommend placing all application code
within components (and systems).** An ideal A-Frame codebase consists purely of
modular, encapsulated, and decoupled components. These components can be unit
tested in isolation or alongside other components.

When an application is created solely with components, all parts of its
codebase become reusable! Components can be shared for other developers to use
or we can reuse them in our other projects. Or the components can be forked and
modified to adapt to other use cases.

A simple ECS codebase might be structured like:

```
index.html
components/
  ball.js
  collidable.js
  grabbable.js
  enemy.js
  scoreboard.js
  throwable.js
```

### Higher-Order Components

[cursor]: ../components/cursor.md
[hand-controls]: ../components/hand-controls.md
[oculus-touch-controls]: ../components/oculus-touch-controls.md
[raycaster]: ../components/raycaster.md
[tracked-controls]: ../components/tracked-controls.md
[vive-controls]: ../components/vive-controls.md

Components can set other components on the entity, making them a higher-order
or higher-level component in abstraction.

For example, the [cursor component][cursor] sets and builds on top of the
[raycaster component][raycaster]. Or the [hand-controls
component][hand-controls] sets and builds on top of the [vive-controls
component][vive-controls] and [oculus-touch-controls
component][oculus-touch-controls] which in turn build on top of the
[tracked-controls component][tracked-controls].

## Community Component Ecosystem

Components can be shared into the A-Frame ecosystem for the community to use.
The wonderful thing about A-Frame's ECS is extensibility. An experienced
developer can develop a physics system or graphics shader components, and an
novice developer can take those components and use them in their scene from
HTML just by dropping in a `<script>` tag. We can use powerful published
components without having to touch JavaScript.

### Where to Find Components

There are hundreds of components out in the wild. We try our best to make them
discoverable. If you develop a component, please submit it through these
channels to share!

#### npm

[search]: https://www.npmjs.com/search?q=aframe-component

Most A-Frame components are published on npm as well as GitHub. We can use
[npm's search to search for `aframe-components`][search]. npm lets us sort by
quality, popularity, and maintenance. This is a great place to look for a more
complete list of components.

#### GitHub Projects

[github]: https://github.com

Many A-Frame applications are developed purely from components, and many of
those A-Frame applications are open source on [GitHub]. Their codebases will
contain components that we can use directly, refer to, or copy from. Projects
to look at include:

- [BeatSaver Viewer](https://github.com/supermedium/beatsaver-viewer/)
- [Super Says](https://github.com/supermedium/supersays/)
- [A-Painter](https://github.com/aframevr/a-painter/)
- [A-Blast](https://github.com/aframevr/a-blast/)

#### *A Week of A-Frame*

[blog]: https://aframe.io/blog/
[homepage]: https://aframe.io/

[Every week on the blog][blog], we round up all the activity in the A-Frame
community and ecosystem. This includes featuring components that have been
freshly released or updated. [The homepage of A-Frame][homepage] will usually
have a link to the most recent *A Week of A-Frame* entry.

### Using a Community Component

[particlesystem]: https://www.npmjs.com/package/aframe-particle-system-component

Once we find a component that we want to use, we can include the component as a
`<script>` tag and use it from HTML.

[unpkg.com]: http://unpkg.com/

For example, let's use IdeaSpaceVR's [particle system component][particlesystem]:

#### Using unpkg

First, we have to grab a CDN link to the component JS file. The documentation
of the component will usually have a CDN link or usage information. But a way
to get the most up-to-date CDN link is to use [unpkg.com].

unpkg is a CDN that automatically hosts everything that is published to npm.
unpkg can resolve semantic versioning and provide us the version of the
component we want. A URL takes the form of:

```
https://unpkg.com/<npm package name>@<version>/<path to file>
```

If we want the latest version, we can exclude the `version`:

```
https://unpkg.com/<npm package name>/<path to file>
```

Rather than typing in the path to the built component JS file, we can exclude
`path to file` to be able to browse the directories of the component package.
The JS file will usually be in a folder called `dist/` or `build/` and end with
`.min.js`.

For the particle system component, we head to:

```
https://unpkg.com/aframe-particle-system-component/
```

Note the ending slash (`/`). Find the file we need, right click, and hit *Copy
Link to Address* to copy the CDN link into our clipboard.

![unpkg](https://cloud.githubusercontent.com/assets/674727/25502028/cbfd7b3a-2b49-11e7-914d-a8280aa47ace.jpg)

#### Including the Component JS File

Then head to our HTML. Under the `<head>`, *after* the A-Frame JS `<script>`
tag, and *before* `<a-scene>`, we will include our JS file with a `<script>`
tag.

For the particle system component, the CDN link we found earlier (at time of
writing) was:

```
https://unpkg.com/aframe-particle-system-component@1.0.9/dist/aframe-particle-system-component.min.js
```

Now we can include it into our HTML:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.0.4/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-particle-system-component@1.0.9/dist/aframe-particle-system-component.min.js"></script>
  </head>
  <body>
    <a-scene>
    </a-scene>
  </body>
</html>
```

#### Using the Component

Follow the documentation of the component on how to use it in implementation.
But generally, the usage involves attaching the component to an entity and
configuring it. For the particle system component:

Now we can include it into our HTML:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.0.4/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-particle-system-component@1.0.9/dist/aframe-particle-system-component.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-entity particle-system="preset: snow" position="0 0 -10"></a-entity>
    </a-scene>
  </body>
</html>
```

### Example

[glitch]: http://glitch.com/~aframe-registry

![Registry Example](https://cloud.githubusercontent.com/assets/674727/25502318/0f76ceec-2b4b-11e7-9829-cb3784b20dc1.gif)

Below is a complete example of using various community components from the
Registry and using the unpkg CDN. We can [remix or check out this example on
Glitch][glitch].

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.0.4/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-animation-component@3.2.1/dist/aframe-animation-component.min.js"></script>
    <script src="https://unpkg.com/aframe-particle-system-component@1.0.x/dist/aframe-particle-system-component.min.js"></script>
    <script src="https://unpkg.com/aframe-extras.ocean@%5E3.5.x/dist/aframe-extras.ocean.min.js"></script>
    <script src="https://unpkg.com/aframe-gradient-sky@1.0.4/dist/gradientsky.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-entity id="rain" particle-system="preset: rain; color: #24CAFF; particleCount: 5000"></a-entity>

      <a-entity id="sphere" geometry="primitive: sphere"
                material="color: #EFEFEF; shader: flat"
                position="0 0.15 -5"
                light="type: point; intensity: 5"
                animation="property: position; easing: easeInOutQuad; dir: alternate; dur: 1000; to: 0 -0.10 -5; loop: true"></a-entity>

      <a-entity id="ocean" ocean="density: 20; width: 50; depth: 50; speed: 4"
                material="color: #9CE3F9; opacity: 0.75; metalness: 0; roughness: 1"
                rotation="-90 0 0"></a-entity>

      <a-entity id="sky" geometry="primitive: sphere; radius: 5000"
                material="shader: gradient; topColor: 235 235 245; bottomColor: 185 185 210"
                scale="-1 1 1"></a-entity>

      <a-entity id="light" light="type: ambient; color: #888"></a-entity>
    </a-scene>
  </body>
</html>
```
