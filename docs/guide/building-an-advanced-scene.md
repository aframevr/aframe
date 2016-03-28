---
title: Building an Advanced Scene
type: guide
layout: docs
parent_section: guide
order: 4
show_guide: true
---

<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

> Play with the [finished example on CodePen][http://codepen.io/team/mozvr/pen/PNoWEz/?editors=1000].

We built a [basic scene][basic], but how can we do more? A-Frame is just an abstraction on top of [three.js][three], and with [A-Frame components][components] (not to be confused with Web Components), we can do just about anything three.js can, which is a lot. Let's go through an example building a scene where the workflow revolves around writing components. We'll build an interactive scene in which we fire lasers at enemies surrounding us. We can use the standard components that ship with A-Frame, or use components that A-Frame developers have published to the ecosystem. Better yet, we can write our own components to do whatever we want!

Let's start by adding an enemy target:

<p data-height="500" data-theme-id="0" data-slug-hash="wGBLeB" data-default-tab="html" data-user="mozvr" class="codepen">See the Pen <a href="http://codepen.io/team/mozvr/pen/wGBLeB/">Laser Shooter - Step 1</a> by MozVR (<a href="http://codepen.io/mozvr">@mozvr</a>) on <a href="http://codepen.io">CodePen</a>.</p>

This creates a basic static scene where the enemy stares at you even as you move around. We can use A-Frame components from the ecosystem to do some neat things.

## Using Components

The [awesome-aframe repository][awesome] is a great place to find components that the community has created to enable new features. Many of these components are started from the [Component Boilerplate][boilerplate and should provide builds in the `dist/` folders in their repositories. Take the [layout component][layout] for example. We can grab the build, drop it into our scene, and immediately be able to use a 3D layout system to automatically position entities. Instead of having one enemy, let's have ten enemies positioned in a circle around the player:

<p data-height="500" data-theme-id="0" data-slug-hash="bpNPjp" data-default-tab="html" data-user="mozvr" class="codepen">See the Pen <a href="http://codepen.io/team/mozvr/pen/bpNPjp/">Laser Shooter - Step 2</a> by MozVR (<a href="http://codepen.io/mozvr">@mozvr</a>) on <a href="http://codepen.io">CodePen</a>.</p>

It is messy in markup to have the enemy entity duplicated ten times. We can drop in the [template component][template] to clean that up. We can also use the [animation system][animation] to have enemies march in a circle around us:

<p data-height="500" data-theme-id="0" data-slug-hash="JXoQBm" data-default-tab="html" data-user="mozvr" class="codepen">See the Pen <a href="http://codepen.io/team/mozvr/pen/JXoQBm/">Laser Shooter - Step 3</a> by MozVR (<a href="http://codepen.io/mozvr">@mozvr</a>) on <a href="http://codepen.io">CodePen</a>.</p>

By mixing and matching the layout and template components, we now have ten enemies surrounding us in a circle. Let's enable gameplay by writing our own components.

## Writing Components

Developers that are comfortable with JavaScript and three.js can write components to add appearance, behavior, and functionality to the experience. As we've seen these components can then be reused and shared with the community. Though not all components have to be shared; they can be ad-hoc or one-off. Since A-Frame is based on an [entity-component-system pattern][ecs], most logic should be implemented within components. The development workflow within A-Frame should try to revolve around components. The [component documentation][components] goes into much more detail on what a component looks like and how to write one.

We want to be able to fire lasers at the enemies and have them disappear. We will need a component to create lasers on click, a component to generate clicks, a component to propel those lasers, a component to check when a laser comes in contact with an enemy.

### spawner Component

Let's start by being able to create lasers. We want to be able to spawn a laser entity that starts at the player's current position. We'll create a spawner component that listens to an event on the entity, and when that event is emitted, we'll spawn an entity with a predefined [mixin][mixin] of components:

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

### click-listener Component

Now we need to a way to generate a click event on the player entity in order to spawn the laser. We could just write a vanilla JavaScript event handler in a content script, but it is more reusable to write a component that can allow any entity to listen for clicks:

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

From HTML, we define the laser mixin and attach the spawner and click-listener components to the player. When we click, the spawner component will generate a laser starting in front of the camera:

<p data-height="500" data-theme-id="0" data-slug-hash="jqEjvB" data-default-tab="html" data-user="mozvr" class="codepen">See the Pen <a href="http://codepen.io/team/mozvr/pen/jqEjvB/">Laser Shooter - Step 4</a> by MozVR (<a href="http://codepen.io/mozvr">@mozvr</a>) on <a href="http://codepen.io">CodePen</a>.</p>

### projectile Component

Now lasers will spawn in front of us when we click, but we need them to fire and travel. In the spawner component, we had the laser point in the rotation of the camera, and we rotated it 90-degrees around the X-axis to align it correctly. We can add a projectile component to have the laser travel straight in the direction it's already facing (its local Y-axis in this case):

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

Then attach the projectile component to the laser mixin:

```html
<a-assets>
  <!-- Attach projectile behavior. -->
  <a-mixin id="laser" geometry="primitive: cylinder; radius: 0.05; translate: 0 -2 0"
                      material="color: green; metalness: 0.2; opacity: 0.4; roughness: 0.3"
                      projectile="speed: -0.5"></a-mixin>
</a-assets>
```

The laser will now fire like a projectile on click:

<p data-height="500" data-theme-id="0" data-slug-hash="YqPmzK" data-default-tab="result" data-user="mozvr" class="codepen">See the Pen <a href="http://codepen.io/team/mozvr/pen/YqPmzK/">Laser Shooter - Step 5</a> by MozVR (<a href="http://codepen.io/mozvr">@mozvr</a>) on <a href="http://codepen.io">CodePen</a>.</p>

### collider Component

The last step is to add a collider component so we can detect when the laser hits an entity. We can do this using the [three.js Raycaster][raycaster], drawing a ray (line) from one end of the laser to the other, then continuously checking if one of the enemies are intersecting the ray. If an enemy is intersecting our ray, then it is touching the laser, and we use an event to tell the enemy that it got hit:

```js
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

Then we attach a class to the enemies to designate them as targets, attach animations that trigger on collision to make them disappear, and finally attach the collider component to the laser that targets enemies:

```html
<a-assets>
  <img id="enemy-sprite" src="img/enemy.png">

  <script id="enemies" type="text/x-nunjucks-template">
    <a-entity layout="type: circle; radius: 5">
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

And there we have a complete basic interactive scene in A-Frame that can be viewed in VR. We package power into components that allow us to declaratively build scenes without losing control or flexibility. The result is a rudimentary FPS game that supports VR in ultimately **just 30 lines of HTML**:

<p data-height="500" data-theme-id="0" data-slug-hash="reaXNr" data-default-tab="result" data-user="mozvr" class="codepen">See the Pen <a href="http://codepen.io/team/mozvr/pen/reaXNr/">Laser Shooter - Final</a> by MozVR (<a href="http://codepen.io/mozvr">@mozvr</a>) on <a href="http://codepen.io">CodePen</a>.</p>

[animation]: ../core/animation.md
[awesome]: https://github.com/aframevr/awesome-aframe#components
[basic]: ./building-a-basic-scene.md
[boilerplate]: https://github.com/ngokevin/aframe-component-boilerplate
[codepen]: http://codepen.io/team/mozvr/pen/PNoWEz/?editors=1000
[components]: ../core/component.md
[ecs]: ../core/index.md
[github]: https://github.com/ngokevin/aframe-fps-example
[layout]: https://github.com/ngokevin/aframe-layout-component
[mixin]: ../core/mixins.md
[raycaster]: http://threejs.org/docs/index.html#Reference/Core/Raycaster
[template]: https://github.com/ngokevin/aframe-template-component
[three]: http://threejs.org
