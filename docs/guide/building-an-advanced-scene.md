---
title: Building an Advanced Scene
type: guide
layout: docs
parent_section: guide
order: 4
show_guide: true
---

> Play with the [finished example on CodePen][http://codepen.io/team/mozvr/pen/PNoWEz/?editors=1000].

We built a [basic scene][basic], but how can we do more? A-Frame is just an abstraction on top of [three.js][three], and with [components][components] (not to be confused with Web Components), we can do just about anything three.js can, which is a lot. We're not limited to just the standard components that A-Frame ships. We can use components other people have published or we can write our own. Let's use powerful components to build an advanced scene where we can fire lasers at multiple enemies surrounding us. Let's start off by adding an enemy target:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/latest/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-assets>
        <img id="enemy-sprite" src="img/enemy.png">
      </a-assets>

      <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>

      <a-camera id="player" position="0 1.8 0"></a-camera>

      <a-sky color="#252243"></a-sky>
    </a-scene>
  </body>
<html>
```

This creates a basic static scene where the enemy just looks at you. Fairly boring. But we can use A-Frame components to enable us to add declaratively add appearance, behavior, or functionality, and add life and interactivity to the scene.

## Using Components

The [awesome A-Frame repository][awesome] is a great place to find components that the community has created to enable new features. Most components should provide builds in the `dist/` folders in their repositories. Take the [layout component][layout] for example. We can grab the build in `dist/` (view the raw GitHub URL and replace the domain with `rawgit.com`), drop it into our scene, and immediately be able to use a rudimentary 3D layout system to position our entities. Instead of having one enemy, let's have ten enemies that are positioned in a circle around the player:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/latest/aframe.min.js"></script>
    <!-- Drop in a component and use it from markup. -->
    <script src="https://rawgit.com/ngokevin/aframe-layout-component/master/dist/aframe-layout-component.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-assets>
        <img id="enemy-sprite" src="img/enemy.png">
      </a-assets>

      <!-- The layout component will be positioned the enemies in a circle. -->
      <a-entity layout="type: circle; radius: 5">
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
      </a-entity>
    </a-scene>
  </body>
<html>
```

It is a bit messy to have the enemy entity duplicated ten times. But with components, we can do some neat things. Let's drop in the [template component][template] to clean that up:

```html
<html>
  <head>
    <script src="https://aframe.io/releases/latest/aframe.min.js"></script>
    <script src="https://rawgit.com/ngokevin/aframe-layout-component/master/dist/aframe-layout-component.min.js"></script>
    <!-- Drop in another component and use it from markup. -->
    <script src="https://rawgit.com/ngokevin/aframe-template-component/master/dist/aframe-template-component.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-assets>
        <img id="enemy-sprite" src="img/enemy.png">

        <!-- Template component lets us use Handlebars, Jade, Mustache, Nunjucks. -->
        <script id="enemies" type="text/x-nunjucks-template">
          <a-entity layout="type: circle; radius: 5">
            {% for x in range(num) %}
              <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
            {% endfor %}
          </a-entity>
        </script>
      </a-assets>

      <!-- Behold, the power of components. -->
      <a-entity template="src: #enemies" data-num="10"></a-entity>
    </a-scene>
  </body>
<html>
```

By mixing and matching the layout and template components, we have ten enemies surrounding us. The static elements of the scene are in place. Let's enable gameplay by writing our own specific components.

## Writing Components

Developers that are comfortable with JavaScript and three.js can write components to add appearance, behavior, and functionality to the experience. As we've seen these components can then be reused and shared with the community. Though not all components have to be shared; they can be ad-hoc or one-off. Since A-Frame is based on an [entity-component-system pattern][ecs], most logic should be implemented within components. The development workflow within A-Frame should try to revolve around components. The [component documentation][components] goes into much more detail on what a component looks like and how to write one.

We want to be able to fire lasers at the enemies and have them disappear. We will need a component to create lasers on click, a component to generate clicks, a component to propel those lasers, a component to check when a laser comes in contact with an enemy.

### spawner Component

Let's start with being to create lasers. We want to be able to spawn entities that start at the player's position. We'll call it the *spawner component*. This component will listen to an event on the entity, and when that event is emitted, spawn an entity with a predefined [mixin][mixin] of components:

```js
AFRAME.registerComponent('spawner', {
  schema: {
    on: { default: 'click' },
    mixin: { default: '' }
  },

  /**
   * Add event listener.
   */
  update: function (oldData) {
    this.el.addEventListener(this.data.on, this.spawn.bind(this));
  },

  /**
   * Spawn new entity at entity's current position.
   */
  spawn: function () {
    var el = this.el;
    var entity = document.createElement('a-entity');
    var matrixWorld = el.object3D.matrixWorld;
    var position = new THREE.Vector3();
    var rotation = el.getAttribute('rotation');
    var entityRotation;

    position.setFromMatrixPosition(matrixWorld);
    entity.setAttribute('position', position);

    // Have the spawned entity face the same direction as the entity.
    // Allow the entity to further modify the inherited rotation.
    position.setFromMatrixPosition(matrixWorld);
    entity.setAttribute('position', position);
    entity.setAttribute('mixin', this.data.mixin);
    entity.addEventListener('loaded', function () {
      entityRotation = entity.getComputedAttribute('rotation');
      entity.setAttribute('rotation', {
        x: entityRotation.x + rotation.x,
        y: entityRotation.y + rotation.y,
        z: entityRotation.z + rotation.z
      });
    });
    el.sceneEl.appendChild(entity);
  }
});
```

From HTML, let's create the laser mixin and attach the spawner component to the player. Now when the player emits a `click` event, the spawner component will generate a laser in its position.

```html
<a-scene>
  <a-assets>
    <img id="enemy-sprite" src="img/enemy.png">

    <script id="enemies" type="text/x-nunjucks-template">
      <a-entity layout="type: circle; radius: 5">
        {% for x in range(num) %}
          <a-image look-at="#player" src="#enemy-sprite" transparent="true"></a-image>
        {% endfor %}
      </a-entity>
    </script>

    <!-- Laser. -->
    <a-mixin id="laser" geometry="primitive: cylinder; radius: 0.05; translate: 0 -2 0"
                        material="color: green; metalness: 0.2; opacity: 0.4; roughness: 0.3"
                        rotation="90 0 0"></a-mixin>
  </a-assets>

  <a-entity template="src: #enemies" data-num="10"></a-entity>

  <!-- Add spawner to a defined camera. -->
  <a-camera id="player" spawner="mixin: laser; on: click"></a-camera>
</a-scene>
```

### click-listener Component

Now we need to a way to generate that click event on the player entity. While we could just write a vanilla JavaScript event handler in a content script, it is more appropriate and reusable to write a component that can allow any entity to listen for clicks:

```js
AFRAME.registerComponent('click-listener', {
  init: function () {
    var el = this.el;
    window.addEventListener('click', function () {
      el.emit('click', null, false);
    });
  }
});
```

Then we attach the click-listener component to the player entity:

```html
<a-camera id="player" spawner="mixin: laser; on: click" click-listener></a-camera>
```

### projectile Component

Lasers will now spawn in front of us when we click, but we need them to fire. In the spawner component, we had the laser face in the rotation of the camera, and we rotated it 90-degrees around the X-axis to align it correctly. We can add a projectile component to add the behavior for the laser to travel straight:

```js
AFRAME.registerComponent('projectile', {
  schema: {
    speed: { default: -0.4 }
  },

  tick: function () {
    this.el.object3D.translateY(this.data.speed);
  }
});
```

Then attach the projectile component to the laser mixin. Fire the laser:

```html
<a-assets>
  <!-- Attach projectile behavior. -->
  <a-mixin id="laser" geometry="primitive: cylinder; radius: 0.05; translate: 0 -2 0"
                      material="color: green; metalness: 0.2; opacity: 0.4; roughness: 0.3"
                      projectile="speed: -0.5"></a-mixin>
</a-assets>
```

### collider Component

Last step is to add a collider component so we can detect when the laser hits an entity. We can do this using `THREE.Raycaster`, drawing a ray from one end of the laser, defined as a cylinder, to the other, then continuously checking if one of the targets is intersecting the ray. If a target is intersecting our ray, we tell it with an event that a collision occurred:

```html
AFRAME.registerComponent('collider', {
  schema: {
    target: { default: '' }
  },

  /**
   * Calculate targets.
   */
  init: function () {
    var targetEls = this.el.sceneEl.querySelectorAll(this.data.target);
    this.targets = [];
    for (var i = 0; i < targetEls.length; i++) {
      this.targets.push(targetEls[i].object3D);
    }
    this.el.object3D.updateMatrixWorld();
  },

  /**
   * Check for collisions (for cylinder).
   */
  tick: function (t) {
    var collisionResults;
    var directionVector;
    var el = this.el;
    var sceneEl = el.sceneEl;
    var mesh = el.getObject3D('mesh');
    var object3D = el.object3D;
    var raycaster;
    var vertices = mesh.geometry.vertices;
    var bottomVertex = vertices[0].clone();
    var topVertex = vertices[vertices.length - 1].clone();

    // Calculate absolute positions of start and end of entity.
    bottomVertex.applyMatrix4(object3D.matrixWorld);
    topVertex.applyMatrix4(object3D.matrixWorld);

    // Direction vector from start to end of entity.
    directionVector = topVertex.clone().sub(bottomVertex).normalize();

    // Raycast for collision.
    raycaster = new THREE.Raycaster(bottomVertex, directionVector, 1);
    collisionResults = raycaster.intersectObjects(this.targets, true);
    collisionResults.forEach(function (target) {
      // Tell collided entity about the collision.
      target.object.el.emit('collider-hit', {target: el});
    });
  }
});
```

Then attach a class to the enemies to designate them as targets, attach animations to listen for collisions to make them disappear, and attach the collider component to the laser that targets enemies. For good measure, let's make it a challenge and have the enemies march around you as well:

```html
<a-assets>
  <img id="enemy-sprite" src="img/enemy.png">

  <script id="enemies" type="text/x-nunjucks-template">
    <a-entity layout="type: circle; radius: 5">
      <!-- March enemies in a circle. -->
      <a-animation attribute="rotation" dur="8000" easing="linear" repeat="indefinite" to="0 360 0"></a-animation>

      {% for x in range(num) %}
        <!-- Attach enemy class. -->
        <a-image class="enemy" look-at="#player" src="#enemy-sprite" transparent="true">
          <!-- Attach collision handler animations. -->
          <a-animation attribute="opacity" begin="collider-hit" dur="400" ease="linear"
                       from="1" to="0"></a-animation>
          <a-animation attribute="scale" begin="collider-hit" dur="400" ease="linear"
                       to="0 0 0"></a-animation>
        </a-image>
      {% endfor %}
    </a-entity>
  </script>

  <!-- Attach collider that targets enemies. -->
  <a-mixin id="laser" geometry="primitive: cylinder; radius: 0.05; translate: 0 -2 0"
                      material="color: green; metalness: 0.2; opacity: 0.4; roughness: 0.3"
                      projectile="speed: -0.5" collider="target: .enemy"></a-mixin>
</a-assets>
```

And there we have a complete basic interactive scene where we can fire lasers at enemies. We package power into components that allows us to declaratively build scenes without losing control or flexibility. Components don't have to be published, shared, and documented; they can simply be part of the development workflow. The code in this example is [published on Github](https://github.com/ngokevin/aframe-fps-example).

[awesome]: https://github.com/aframevr/awesome-aframe#components
[basic]: ./building-a-basic-scene.html
[codepen]: http://codepen.io/team/mozvr/pen/PNoWEz/?editors=1000
[components]: ../core/component.html
[ecs]: ../core/index.html
[github]: https://github.com/ngokevin/aframe-fps-example
[layout]: https://github.com/ngokevin/aframe-layout-component
[mixin]: ../core/mixins.html
[template]: https://github.com/ngokevin/aframe-template-component
[three]: http://threejs.org
