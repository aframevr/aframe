title: "Geometry"
category: component
---

The geometry component defines the shape and size of an entity. The general
geometry is defined by the `primitive` attribute. "Geoemtric primitives", in
computer graphics, simply means an extremely basic shape. With the primitive
defined, additional attributes are used to further define the geometry. A
material component is usually defined alongside the geometry component.

We will go through the basic primitives and their respective attributes
one-by-one.

| Attribute | Description                                                                          | Default Value |
|-----------|--------------------------------------------------------------------------------------|---------------|
| primitive | One of `box`, `circle`, `cylinder`, `plane`, `ring`, `sphere`, `torus`, `torusKnot`. | None          |
| translate | Translates the geometry relative to its pivot point.                                 | 0 0 0         |

### Box

The box primitive defines boxes (square or rectangle).

```html
<a-entity geometry="primitive: box; width: 1; height: 1; depth: 1"></a-entity>
```

| Attribute | Description                        | Default Value |
|-----------|------------------------------------|---------------|
| width     | Width of the sides on the X axis.  | 2             |
| height    | Height of the sides on the Y axis. | 2             |
| depth     | Depth of the sides on the Z axis.  | 2             |

### Circle

The circle primitive defines two-dimensional circles, which can be complete
circles or partial circles (like Pac-Man). Note that because it is flat, only a
single side of the circle will be rendered if ```side: double``` is not
specified on the material component.

```html
<a-entity geometry="primitive: circle; radius: 1" material="side: double"></a-entity>
```

| Attribute   | Description                                                                                                                      | Default Value |
|-------------|----------------------------------------------------------------------------------------------------------------------------------|---------------|
| radius      | Radius of the circle.                                                                                                            | 1             |
| segments    | Number of triangles to construct the circle, like pizza slices. A higher number of segments means the circle will be more round. | 8             |
| thetaStart  | Start angle for first segment. Can be used to define a partial circle.                                                           | 0             |
| thetaLength | The central angle in degrees. Defaults to 360, which makes for a complete circle.                                                | 360           |

### Cylinder Primitive

The cylinder primitive can define cylinders in the traditional sense like a
Coca-Cola can. But it can also define shapes such as cones, tubes, curved surfaces. We'll go
over some of these cylinder recipes below.

#### Basic Cylinder

Traditional cylinders can be defined by using only a height and a radius:

```html
<a-entity geometry="primitive: cylinder; height: 3; radius: 2"></a-entity>
```

#### Cone

Cones can be defined by differing the bottom radius from the top radius:

```html
<a-entity geometry="primitive: cylinder; radiusBottom: 1; radiusTop: 0.1"></a-entity>
```

#### Tube

Tubes can be defined by making the cylinder open-ended, which removes the top
and bottom surfaces of the cylinder such that the inside is visible. A
double-sided material will be needed to render properly:

```
<!-- Tube. -->
<a-entity geometry="primitive: cylinder; openEnded: true" material="side: double"></a-entity>
```

#### Curved Surface

Curved surfaces can be defined by specifying the angle via ```thetaLength```
such that the cylinder doesn't curve all the way around, making the cylinder
open-ended, and then making the material double-sided.

```
<!-- Curved surface. -->
<a-entity geometry="primitive: cylinder; openEnded: true; thetaLength: 180"
          material="side: double"></a-entity>
```

| Attribute      | Description                                                         | Default Value |
|----------------|---------------------------------------------------------------------|---------------|
| radiusTop      | Radius of the cylinder at the top.                                  | 1             |
| radiusBottom   | Radius of the cylinder at the bottom.                               | 1             |
| height         | Height of the cylinder.                                             | 2             |
| segmentsRadial | Number of segmented faces around the circumference of the cylinder. | 36            |
| segmentsHeight | Number of rows of faces along the height of the cylinder.           | 18            |
| openEnded      | Whether the ends of the cylinder are open (true) or capped (false). | false         |
| thetaStart     | Starting angle in degrees.                                          | 0             |
| thetaLength    | Central angle in degrees.                                           | 360           |

### Plane

The plane primitive defines a flat surface. Note that because it is flat, only
a single side of the plane will be rendered if ```side: double``` is not
specified on the material component.

```html
<a-entity geometry="primitive: plane; height: 10; width: 10"
          material="side: double"></a-entity>
```

| Attribute | Description              | Default Value |
|-----------|--------------------------|---------------|
| width     | Width along the X axis.  | 2             |
| height    | Height along the Y axis. | 2             |

### Ring

The ring geometry defines a flat ring, like a CD. Note that because it is
flat, only a single side of the ring will be rendered if ```side: double``` is
not specified on the material component.

```html
<a-entity geometry="primitive: ring; radiusInner: 0.5; radiusOuter: 1"
          material="side: double"></a-entity>
```

| Attribute     | Description                                                            | Default Value |
|---------------|------------------------------------------------------------------------|---------------|
| radiusInner   | Radius of the inner hole of the ring.                                  | 1             |
| radiusOuter   | Radius of the outer edge of the ring.                                  | 1             |
| segmentsTheta | Number of segments. A higher number means the ring will be more round. | 2             |
| segmentsPhi   | Number of triangles within each face defined by segmentsTheta.         | 8             |
| thetaStart    | Starting angle in degrees.                                             | 0             |
| thetaLength   | Central angle in degrees.                                              | 360           |

### Sphere

The sphere primitive can define spheres in the traditional sense like a
basketball. But it can also define various polyhedrons and abstract shapes given that
it can specify the number of horizontal and vertical angles and faces.

Sticking with a basic sphere, the default number of segments is high enough to
make the sphere appear round.

```html
<a-entity geometry="primitive: sphere; radius: 2"></a-entity>
```

Play around with the other attributes and see what you get.

| Attribute      | Description                    | Default Value |
|----------------|--------------------------------|---------------|
| radius         | Radius of the sphere.          | 1             |
| segmentsWidth  | Number of horizontal segments. | 18            |
| segmentsHeight | Number of vertical segments.   | 36            |
| phiStart       | Horizontal starting angle.     | 0             |
| phiLength      | Horizontal sweep angle size.   | 360           |
| thetaStart     | Vertical starting angle.       | 0             |
| thetaLength    | Vertical sweep angle size.     | 360           |

### Torus

The torus primitive defines a doughnut shape.

```html
<!-- Half doughnut. -->
<a-entity geometry="primitive: torus; radius: 2; radiusTubular: 0.5; arc: 180"></a-entity>
```

| Attribute       | Description                                                                                                     | Default Value |
|-----------------|-----------------------------------------------------------------------------------------------------------------|---------------|
| radius          | Radius of the outer edge of the torus.                                                                          | 1             |
| radiusTubular   | Radius of the tube.                                                                                             | 0.2           |
| segmentsRadial  | Number of segments along the circumference of the tube ends. A higher number means the tube will be more round. | 36            |
| segmentsTubular | Number of segments along the circumference of the tube face. A higher number means the tube will be more round. | 0             |
| arc             | Central angle.                                                                                                  | 360           |

### Torus Knot

The torus knot primitive defines a pretzel shape, the particular shape of which is defined
by a pair of coprime integers, `p` and `q`. If `p` and `p` are not coprime the result
will be a torus link.

```html
<a-entity geometry="primitive: torusKnot; p: 3; q:7"></a-entity>
```

| Attribute       | Description                                                                                                     | Default Value |
|-----------------|-----------------------------------------------------------------------------------------------------------------|---------------|
| radius          | Radius that contains the torus knot.                                                                            | 1             |
| radiusTubular   | Radius of the tubes of the torus knot.                                                                          | 0.2           |
| segmentsRadial  | Number of segments along the circumference of the tube ends. A higher number means the tube will be more round. | 36            |
| segmentsTubular | Number of segments along the circumference of the tube face. A higher number means the tube will be more round. | 8             |
| p               | Number that helps define the pretzel shape.                                                                     | 2             |
| q               | Number that helps define the pretzel shape.                                                                     | 3             |

## Geometry Translate

The `translate` attribute translates the geometry relative to its pivot point.
It is defined as a coordinate.

```html
<!-- Translates the sphere such that the pivot point as at its bottom. -->
<a-entity geometry="primitive: sphere; radius: 1; translate: 0 1 0"></a-entity>
```
