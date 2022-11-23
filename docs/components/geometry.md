---
title: geometry
type: components
layout: docs
parent_section: docs
section_title: Components
section_order: 4
source_code: src/components/geometry.js
examples:
 - title: Creating Shapes
   src: https://glitch.com/edit/#!/ex-2-geometry?path=index.html:1:0
 - title: Texture on Shapes
   src: https://glitch.com/edit/#!/ex-2a-texture-on-shape?path=index.html:1:0
 - title: Shape as Entity
   src: https://glitch.com/edit/#!/ex-2b-shape-as-entity?path=index.html:1:0
 - title: Animating Shapes
   src: https://glitch.com/edit/#!/ex-2c-animating-shapes?path=index.html:1:0
 - title: Animating Shapes with Components
   src: https://glitch.com/edit/#!/ex-2d-animating-shapes-with-components?path=index.html:1:0

---

The geometry component provides a basic shape for an entity. The `primitive`
property defines the general shape. Geometric primitives, in computer graphics,
are irreducible basic shapes. A material component is commonly defined to
provide an appearance alongside the shape to create a complete mesh.

<!--toc-->

## Base Properties

Every geometry type will have these properties:

| Property  | Description                                                                                                                          | Default Value |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------|---------------|
| primitive | Name of a geometry (e.g., one of the geometries listed below). Determines the geometry type and what other properties are available. | box           |
| skipCache | Disable retrieving the shared geometry object from the cache.                                                                        | false         |

## Built-in Geometries

### `box`

The box geometry defines boxes (i.e., any quadrilateral, not just cubes).

```html
<a-entity geometry="primitive: box; width: 1; height: 1; depth: 1"></a-entity>
```

| Property       | Description                                    | Default Value |
|----------------|------------------------------------------------|---------------|
| width          | Width (in meters) of the sides on the X axis.  | 1             |
| height         | Height (in meters) of the sides on the Y axis. | 1             |
| depth          | Depth (in meters) of the sides on the Z axis.  | 1             |
| segmentsDepth  | Number of segmented faces on the z-axis        | 1             |
| segmentsHeight | Number of segmented faces on the y-axis        | 1             |
| segmentsWidth  | Number of segmented faces on the x-axis        | 1             |

### `circle`

The circle geometry creates flat two-dimensional circles. These can be complete
circles or partial circles (like Pac-Man). Note that because circles are flat,
A-Frame will only render a single face of the circle if we don't specify `side:
double` on the `material` component.

```html
<a-entity geometry="primitive: circle; radius: 1" material="side: double"></a-entity>
```

| Property    | Description                                                                                                                      | Default Value |
|-------------|----------------------------------------------------------------------------------------------------------------------------------|---------------|
| radius      | Radius (in meters) of the circle.                                                                                                | 1             |
| segments    | Number of triangles to construct the circle, like pizza slices. A higher number of segments means the circle will be more round. | 32            |
| thetaStart  | Start angle for first segment. Can be used to define a partial circle.                                                           | 0             |
| thetaLength | The central angle (in degrees). Defaults to `360`, which makes for a complete circle.                                            | 360           |

#### `thetaLength` and `thetaStart` Properties

In degrees, `thetaStart` defines where to start a circle or arc and
`thetaLength` defines where a circle or arc ends. If we wanted to make a `(`
shape, we would start the circle halfway through and define the length as half
of a circle. We can do this with `thetaStart: 180; thetaLength: 180`. Or if we
wanted to make a `)` shape, we can do `thetaStart: 0; thetaLength: 180`.

Useful cases might be to animating `thetaStart` to create a spinner effect or
animating `thetaLength` on a fuse-based cursor for visual feedback.


### `cone`

The cone geometry is a cylinder geometry that have different top and bottom radii.

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

### `cylinder`

The cylinder geometry creates cylinders in the traditional sense like a
Coca-Cola™ can, but it can also define shapes such as tubes and curved
surfaces.

We can create a basic cylinder using height and radius:

```html
<a-entity geometry="primitive: cylinder; height: 3; radius: 2"></a-entity>
```

We can create a tube by making the cylinder open-ended, which removes the top
and bottom surfaces of the cylinder such that the inside is visible. Then we
need a double-sided material to render properly:

```html
<!-- Tube -->
<a-entity geometry="primitive: cylinder; openEnded: true" material="side: double"></a-entity>
```

We can create a curved surfaces by specifying the arc via `thetaLength` such
that the cylinder doesn't curve all the way around, making the cylinder
open-ended, and then making the material double-sided:

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

We can create [prisms][prisms-wiki] by changing the number of radial segments
(i.e., sides). For example, to make a hexagonal prism:

```html
<!-- Hexagonal prism -->
<a-entity geometry="primitive: cylinder; segmentsRadial: 6"></a-entity>
```

### `dodecahedron`

The dodecahedron geometry creates a polygon with twelve equally-sized faces.

```html
<a-entity geometry="primitive: dodecahedron; radius: 2"></a-entity>
```

| Property | Description                             | Default Value |
|----------|-----------------------------------------|---------------|
| radius   | Radius (in meters) of the dodecahedron. | 1             |

### `octahedron`

The octahedron geometry creates a polygon with eight equilateral triangular faces.

```html
<a-entity geometry="primitive: octahedron"></a-entity>
```

| Property | Description                            | Default Value |
|----------|----------------------------------------|---------------|
| radius   | Radius (in meters) of the octahedron. | 1             |

### `icosahedron`

The icosahedron geometry creates a polygon with twenty equilateral triangular faces.

```html
<a-entity geometry="primitive: icosahedron"></a-entity>
```

| Property | Description                            | Default Value |
|----------|----------------------------------------|---------------|
| radius   | Radius (in meters) of the icosahedron. | 1             |

### `plane`

The plane geometry creates a flat surface. Because planes are flat, A-Frame
will render only a single face of the plane unless we specify `side: double` on
the `material` component.

```html
<a-entity geometry="primitive: plane; height: 10; width: 10" material="side: double"></a-entity>
```

| Property       | Description                             | Default Value |
|----------------|-----------------------------------------|---------------|
| width          | Width along the X axis.                 | 1             |
| height         | Height along the Y axis.                | 1             |
| segmentsHeight | Number of segmented faces on the y-axis | 1             |
| segmentsWidth  | Number of segmented faces on the x-axis | 1             |

### `ring`

The ring geometry creates a flat ring, like a [CD][cd]. Because the ring is
flat, A-Frame will only render a single face of the ring unless we specify `side:
double` the `material` component.

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

### `sphere`

The sphere geometry creates spheres (e.g., balls). We can create a basic sphere:

```html
<a-entity geometry="primitive: sphere; radius: 2"></a-entity>
```

We can create polyhedrons and abstract shapes by specifying the number of
horizontal angles and faces:

```html
<a-entity geometry="primitive: sphere; segmentsWidth: 2; segmentsHeight: 8"></a-entity>
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

### `tetrahedron`

The tetrahedron geometry creates a polygon with four triangular faces.

```html
<a-entity geometry="primitive: tetrahedron; radius: 2"></a-entity>
```

| Property | Description                                                                  | Default Value |
|----------|------------------------------------------------------------------------------|---------------|
| radius   | Radius (in meters) of the tetrahedron.                                       | 1             |

### `torus`

The torus geometry creates a donut or curved tube shape:

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

### `torusKnot`

The torus knot geometry creates a pretzel shape. A pair of coprime integers,
`p` and `q`, defines the particular shape of the pretzel. If `p` and `q` are
not coprime the result will be a torus link:

```html
<a-entity geometry="primitive: torusKnot; p: 3; q:7"></a-entity>
```

| Property        | Description                                                                                                     | Default Value |
|-----------------|-----------------------------------------------------------------------------------------------------------------|---------------|
| radius          | Radius that contains the torus knot.                                                                            | 1             |
| radiusTubular   | Radius of the tubes of the torus knot.                                                                          | 0.2           |
| segmentsRadial  | Number of segments along the circumference of the tube ends. A higher number means the tube will be more round. | 36            |
| segmentsTubular | Number of segments along the circumference of the tube face. A higher number means the tube will be more round. | 32            |
| p               | How many times the geometry winds around its axis of rotational symmetry.                                       | 2             |
| q               | How many times the geometry winds around a circle in the interior of the torus.                                 | 3             |

### `triangle`

The triangle geometry creates a flat two-dimensional triangle. Because triangles are flat,
A-Frame will render only a single face, which is the one with `vertexA`, `vertexB`, and
`vertexC` appear in counterclockwise order on the screen, unless we specify `side: double` on
the `material` component.

```html
<a-entity geometry="primitive: triangle" material="side: double"></a-entity>
```

| Property | Description                                | Default Value |
|----------|--------------------------------------------|---------------|
| vertexA  | Coordinates of one of the three vertices   |    0  0.5 0   |
| vertexB  | Coordinates of one of the three vertices   | -0.5 -0.5 0   |
| vertexC  | Coordinates of one of the three vertices   |  0.5 -0.5 0   |

## Register a Custom Geometry

We can register our own geometries using `AFRAME.registerGeometry` and creating
an object that is an instance of [`THREE.Geometry`][three-geometry]. A-Frame
registers all built-in geometries using this API. Here is how A-Frame registers
the `box` geometry:

```js
AFRAME.registerGeometry('box', {
  schema: {
    depth: {default: 1, min: 0},
    height: {default: 1, min: 0},
    width: {default: 1, min: 0},
    segmentsHeight: {default: 1, min: 1, max: 20, type: 'int'},
    segmentsWidth: {default: 1, min: 1, max: 20, type: 'int'},
    segmentsDepth: {default: 1, min: 1, max: 20, type: 'int'}
  },

  init: function (data) {
    this.geometry = new THREE.BoxGeometry(data.width, data.height, data.depth);
  }
});
```

Like with registering components, we provide a name, a
[schema][component-schema] that will expose the properties of the geometry, and
lifecycle methods. Then we need to create the geometry and set on
`this.geometry` through the `init` lifecycle method.

When a geometry component sets its `primitive` property to the custom geometry
name, we can set the properties of the custom geometry on the geometry
component. Say we registered a custom geometry:

```js
AFRAME.registerGeometry('example', {
  schema: {
    vertices: {
      default: ['-10 10 0', '-10 -10 0', '10 -10 0'],
    }
  },

  init: function (data) {
    var geometry = new THREE.BufferGeometry();
     const pointsArray = new Array();
     data.vertices.map(function (vertex) {
     var points = vertex.split(' ').map(function(x){return parseInt(x);});
     pointsArray.push(new THREE.Vector3(points[0], points[1], points[2]));
     });
     geometry.setFromPoints(pointsArray);
     geometry.computeBoundingBox();
     geometry.computeVertexNormals();
     this.geometry = geometry;
  }
});
```

We can then use that custom geometry in HTML:

```html
<a-entity geometry="primitive: example; vertices: 1 1 -3, 3 1 -3, 2 2 -3"></a-entity>
```

[cd]: https://en.wikipedia.org/wiki/Compact_disc
[component-schema]: ../core/component.md#schema
[prisms-wiki]: https://en.wikipedia.org/wiki/Prism_%28geometry%29
[three-geometry]: https://threejs.org/docs/#api/core/Geometry
