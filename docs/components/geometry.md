---
title: geometry
type: components
layout: docs
parent_section: components
order: 6
---

The geometry component provides a basic shape for an entity. The general geometry is defined by the `primitive` property. Geometric primitives, in computer graphics, means an extremely basic shape. With the primitive defined, additional properties are used to further define the geometry. A material component is usually defined alongside to provide a appearance alongside the shape to create a complete mesh.

## Properties

We will go through the basic primitives and their respective properties one by one.

| Property  | Description                                                                                                      | Default Value |
|-----------|------------------------------------------------------------------------------------------------------------------|---------------|
| buffer    | Transform geometry into a BufferGeometry to reduce memory usage at the cost of being harder to manipulate.       | true          |
| primitive | One of `box`, `circle`, `cone`, `cylinder`, `plane`, `ring`, `sphere`, `torus`, `torusKnot`.                     | None          |
| skipCache | Disable retrieving the shared geometry object from the cache.                                                    | false         |

### Box

The box primitive defines boxes (i.e., any quadilateral, not just cubes).

```html
<a-entity geometry="primitive: box; width: 1; height: 1; depth: 1"></a-entity>
```

| Property | Description                                    | Default Value |
|----------|------------------------------------------------|---------------|
| width    | Width (in meters) of the sides on the X axis.  | 1             |
| height   | Height (in meters) of the sides on the Y axis. | 1             |
| depth    | Depth (in meters) of the sides on the Z axis.  | 1             |

### Circle

The circle primitive defines two-dimensional circles, which can be complete circles or partial circles (like Pac-Man). Note that because it is flat, only a single side of the circle will be rendered if "side: double" is not specified on the `material` component.

```html
<a-entity geometry="primitive: circle; radius: 1" material="side: double"></a-entity>
```

| Property    | Description                                                                                                                      | Default Value |
|-------------|----------------------------------------------------------------------------------------------------------------------------------|---------------|
| radius      | Radius (in meters) of the circle.                                                                                                | 1             |
| segments    | Number of triangles to construct the circle, like pizza slices. A higher number of segments means the circle will be more round. | 32            |
| thetaStart  | Start angle for first segment. Can be used to define a partial circle.                                                           | 0             |
| thetaLength | The central angle (in degrees). Defaults to `360`, which makes for a complete circle.                                            | 360           |

### Cone

The cone primitive under the hood is a cylinder primitive with varying top and bottom radiuses.

```html
<a-entity geometry="primitive: cone; radiusBottom: 1; radiusTop: 0.1"></a-entity>
```

| Property       | Description                                                     | Default Value |
|----------------|-----------------------------------------------------------------|---------------|
| height         | Height of the cone.                                             | 2             |
| openEnded      | Whether the ends of the cone are open (true) or capped (false). | false         |
| radiusBottom   | Radius of the bottom end of the cone.                           | 1             |
| radiusTop      | Radius of the top end of the cone.                              | 1             |
| segmentsRadial | Number of segmented faces around the circumference of the cone. | 36            |
| segmentsHeight | Number of rows of faces along the height of the cone.           | 18            |
| thetaStart     | Starting angle in degrees.                                      | 0             |
| thetaLength    | Central angle in degrees.                                       | 360           |

### Cylinder Primitive

The cylinder primitive can define cylinders in the traditional sense like a Coca-Cola™ can, but it can also define shapes such as tubes and curved surfaces. We'll go over some of these cylinder recipes below.

#### Basic Cylinder

Traditional cylinders can be defined by using only a height and a radius:

```html
<a-entity geometry="primitive: cylinder; height: 3; radius: 2"></a-entity>
```

#### Tube

Tubes can be defined by making the cylinder open-ended, which removes the top and bottom surfaces of the cylinder such that the inside is visible. A double-sided material will be needed to render properly:

```html
<!-- Tube -->
<a-entity geometry="primitive: cylinder; openEnded: true" material="side: double"></a-entity>
```

#### Curved Surface

Curved surfaces can be defined by specifying the angle via `thetaLength` such that the cylinder doesn't curve all the way around, making the cylinder open-ended, and then making the material double-sided.

```html
<!-- Curved surface -->
<a-entity geometry="primitive: cylinder; openEnded: true; thetaLength: 180"
          material="side: double"></a-entity>
```

| Property       | Description                                                         | Default Value |
|----------------|---------------------------------------------------------------------|---------------|
| radius         | Radius of the cylinder.                                             | 1             |
| height         | Height of the cylinder.                                             | 2             |
| segmentsRadial | Number of segmented faces around the circumference of the cylinder. | 36            |
| segmentsHeight | Number of rows of faces along the height of the cylinder.           | 18            |
| openEnded      | Whether the ends of the cylinder are open (true) or capped (false). | false         |
| thetaStart     | Starting angle in degrees.                                          | 0             |
| thetaLength    | Central angle in degrees.                                           | 360           |

#### Prisms

Other types [of prisms][prisms-wiki] can
be defined by varying the number of radial segments (i.e., sides). For example, to make
a hexagonal prism:

```html
<!-- Hexagonal prism -->
<a-entity geometry="primitive: cylinder; segmentsRadial: 6"></a-entity>
```

To play with an example of prism geometry, check out the [Hexagon example on Codepen][hexagon-codepen].

### Plane

The plane primitive defines a flat surface. Note that because it is flat, only a single side of the plane will be rendered if `side: double` is not specified on the `material` component.

```html
<a-entity geometry="primitive: plane; height: 10; width: 10"
          material="side: double"></a-entity>
```

| Property | Description              | Default Value |
|----------|--------------------------|---------------|
| width    | Width along the X axis.  | 1             |
| height   | Height along the Y axis. | 1             |

### Ring

The ring geometry defines a flat ring, like a [CD][cd]. Note that because it is flat, only a single side of the ring will be rendered if `side: double` is not specified on the `material` component.

```html
<a-entity geometry="primitive: ring; radiusInner: 0.5; radiusOuter: 1"
          material="side: double"></a-entity>
```

| Property      | Description                                                            | Default Value |
|---------------|------------------------------------------------------------------------|---------------|
| radiusInner   | Radius of the inner hole of the ring.                                  | 1             |
| radiusOuter   | Radius of the outer edge of the ring.                                  | 1             |
| segmentsTheta | Number of segments. A higher number means the ring will be more round. | 32            |
| segmentsPhi   | Number of triangles within each face defined by segmentsTheta.         | 8             |
| thetaStart    | Starting angle in degrees.                                             | 0             |
| thetaLength   | Central angle in degrees.                                              | 360           |

### Sphere

The sphere primitive can define spheres in the traditional sense like a basketball. But it can also define various polyhedrons and abstract shapes given that it can specify the number of horizontal and vertical angles and faces.

Sticking with a basic sphere, the default number of segments is high enough to make the sphere appear round.

```html
<a-entity geometry="primitive: sphere; radius: 2"></a-entity>
```

| Property       | Description                    | Default Value |
|----------------|--------------------------------|---------------|
| radius         | Radius of the sphere.          | 1             |
| segmentsWidth  | Number of horizontal segments. | 18            |
| segmentsHeight | Number of vertical segments.   | 36            |
| phiStart       | Horizontal starting angle.     | 0             |
| phiLength      | Horizontal sweep angle size.   | 360           |
| thetaStart     | Vertical starting angle.       | 0             |
| thetaLength    | Vertical sweep angle size.     | 360           |

### Torus

The torus primitive defines a donut shape.

```html
<!-- Half donut -->
<a-entity geometry="primitive: torus; radius: 2; radiusTubular: 0.5; arc: 180"></a-entity>
```

| Property        | Description                                                                                                     | Default Value |
|-----------------|-----------------------------------------------------------------------------------------------------------------|---------------|
| radius          | Radius of the outer edge of the torus.                                                                          | 1             |
| radiusTubular   | Radius of the tube.                                                                                             | 0.2           |
| segmentsRadial  | Number of segments along the circumference of the tube ends. A higher number means the tube will be more round. | 36            |
| segmentsTubular | Number of segments along the circumference of the tube face. A higher number means the tube will be more round. | 32            |
| arc             | Central angle.                                                                                                  | 360           |

### Torus Knot

The torus knot primitive defines a pretzel shape, the particular shape of which is defined by a pair of coprime integers, `p` and `q`. If `p` and `q` are not coprime the result will be a torus link.

```html
<a-entity geometry="primitive: torusKnot; p: 3; q:7"></a-entity>
```

| Property        | Description                                                                                                     | Default Value |
|-----------------|-----------------------------------------------------------------------------------------------------------------|---------------|
| radius          | Radius that contains the torus knot.                                                                            | 1             |
| radiusTubular   | Radius of the tubes of the torus knot.                                                                          | 0.2           |
| segmentsRadial  | Number of segments along the circumference of the tube ends. A higher number means the tube will be more round. | 36            |
| segmentsTubular | Number of segments along the circumference of the tube face. A higher number means the tube will be more round. | 32            |
| p               | Number that helps define the pretzel shape.                                                                     | 2             |
| q               | Number that helps define the pretzel shape.                                                                     | 3             |

## thetaLength and thetaStart

In degrees, `thetaStart` defines where to start a circle and `thetaLength` defines where a circle ends. If we wanted to make a `(` shape, we would start the circle halfway through and define the length as half of a circle. We can do this with `thetaStart: 180; thetaLength: 180`. Or if we wanted to make a `)` shape. We can do do `thetaStart: 0; thetaLength: 180`.

Useful cases might be to animating `thetaStart` to create a spinner effect or animating `thetaLength` on a fuse-based cursor for visual feedback.

## translate

The `translate` property translates the geometry. It is provided as a vec3.  This is a useful short-hand for translating the geometry to effectively move its pivot point when running animations.

```html
<!-- Translates the sphere such that its effective pivot point is at its bottom -->
<a-entity geometry="primitive: sphere; radius: 1; translate: 0 1 0"></a-entity>
```

## Defining Your Own Geometry

If there is a geometry that you need that is not provided by the standard geometry component, you can register your own geometry component. Later, we may introduce an API to register geometries:

```js
AFRAME.registerComponent('my-geometry', {
  /* Called on component attach and data update. */
  update: function () {
    // Grab the mesh.
    var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);

    // Provide your own geometry.
    var geometry = mesh.geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(-10,  10, 0),
      new THREE.Vector3(-10, -10, 0),
      new THREE.Vector3( 10, -10, 0)
    );
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.computeBoundingSphere();
  },

  /* Called on component detach. */
  remove: function () {
    this.el.getObject3D('mesh').geometry = new THREE.Geometry();
  }
});

[cd]: https://en.wikipedia.org/wiki/Compact_disc
[hexagon-codepen]: http://codepen.io/team/mozvr/pen/jWzVXJ
[prisms-wiki]: https://en.wikipedia.org/wiki/Prism_%28geometry%29
