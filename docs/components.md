title: "Components"
---

In the entity-component architecture, components are reusable and modular
chunks of data that modify an aspect of an entity, changing its appearance,
behavior, or functionality.

As an analogy, if a smartphone were defined as an entity, it might use
components to define its appearance (color, shape), to define its behavior
(vibrate when called, shut down on low battery), or to define its functionality
(camera, screen).

In A-Frame, components modify 3D entities in the scene's world.  We will go
into detail on what components look like under the hood and how we can define
our own custom components to do whatever we want. Below are a list of components
that currently ship with A-Frame.

| Component     |
|---------------|
| camera        |
| cursor        |
| fog           |
| geometry      |
| light         |
| loader        |
| look-at       |
| look-controls |
| material      |
| position      |
| raycaster     |
| rotation      |
| scale         |
| sound         |
| visible       |
| wasd-controls |

## Defining Component Data

To declaratively define component data, we can set HTML attributes using a CSS
style-like syntax.

```html
<a-entity geometry="primitive: box; width: 5"></a-entity>
```

And component data can also be declaratively defined and composed via mixins.

```html
<a-assets>
  <a-mixin id="red" material="color: red"></a-mixin>
  <a-mixin id="box" geometry="primitive: box; width: 5"></a-mixin>
</a-assets>

<a-entity mixin="red box"></a-entity>
```

To imperatively set component data, we can use the entity's `setAttribute`.

```js
var entity = document.querySelector('a-entity');
entity.setAttribute('material', 'color: red');
entity.setAttribute('geometry', { primitive: 'box' });
entity.setAttribute('geometry', 'width', 5);
```

## Accessing a Component

Components can be imperatively accessed through the entity element via
`components`, an object mapping component names to component instances.

```js
var entity = document.querySelector('a-entity');
console.log(entity.components);
```

## Component Definition and Lifecycle

Under the hood, components are object prototypes. They implement an interface
to modify the entity according to incoming data. Below we will go over the
properties and methods of a component prototype.

| Property | Description                                                                                        |
|----------|----------------------------------------------------------------------------------------------------|
| data     | Current component data object including defaults defined in schema and mixins.                     |
| el       | Reference to the entity element.                                                                   |
| schema   | Defines component data schema (e.g., possible attributes, default values, possible values, types). |

| Method          | Description                                                                                                                                     | Default Behavior |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| init()          | Lifecycle handler method. Called once when component is attached. Generally used for initial setup.                                             | no-op            |
| update(oldData) | Lifecycle handler method. Called when component is attached *and* when component data changes. Generally modifies the entity based on the data. | no-op            |
| remove()        | Lifecycle handler method. Called when a component is removed (via `removeAttribute`). Generally undoes previous modifications to the entity.    | no-op            |
| parse(value)    | Deserializes HTML attribute strings into a data object. Can be overridden to do custom parsing.                                                 | CSS style parser |
| stringify(data) | Serializes data into an HTML attribute string. Can be overridden to do custom stringify-ing.                                                    | CSS style parser |

## Component Schema

Components define a schema object that specifies default values and type
coercion/validation. Each key in the schema object refers to the name of a
component attribute. The values of the schema object are objects that can
specify several keys.

| Schema Key | Description                                                                                                                                                                    |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| default    | Default value. If no value is specified, this default value is set in the component `data` for its attribute. The default value is also used as a reference for type coercion. |
| oneOf      | An array that describes possible values for its attribute. If a value is set that is not in this array, a warning is thrown.                                                   |

For example, let's take a look at a piece of the light component schema.

```js
{
  intensity: {
    default: 1.0
  },
  type: {
    default: 'directional',
    oneOf: ['ambient', 'directional', 'hemisphere', 'point', 'spot']
  }
}
```

## Component Registration

To register your component, use the
`registerComponent(componentName, componentDefinition)` function exposed by the library.

## Example Component

Let's create an example component that rapidly vibrates an object by shifting
its position back and forth.

```js
require('aframe-core').registerComponent('vibrate', {
  schema: {
    dur: {
      default: 20
    },
    offset: {
      default: .01
    }
  },

  init: function () {
    this.animationEl = null;
  },

  update: function () {
    var anim = document.createElement('a-animation');
    var position = this.el.getAttribute('position');

    if (this.animationEl) {
      this.el.removeChild(this.animationEl);
    }

    anim.setAttribute('attribute', 'position');
    anim.setAttribute('direction', 'alternate');
    anim.setAttribute('dur', this.data.dur);
    anim.setAttribute('repeat', 'indefinite');
    anim.setAttribute('to', position.x + this.data.offset + ' ' +
                            position.y + this.data.offset +
                            position.z + this.data.offset);
    this.animationEl = anim;
  },

  remove: function () {
    if (this.animationEl) {
      this.el.removeChild(this.animationEl);
    }
  }
});
```
