title: "Raycaster"
category: component
---

The raycaster component defines the functionality for an entity to do
intersection testing with a raycaster. By itself, this component does not do
anything, but it can be and is used by components such as the cursor. The
raycaster component will poll for intersections with other entities and set
`this.intersectedEl` to the closest intersected entity.

Since it can be useful for other components but inherently does not add
behavior, we will instead document the properties of the raycaster component
prototype.

| Property      | Description                                      |
|---------------|--------------------------------------------------|
| intersectedEl | The entity currently intersecting the raycaster. |
| raycaster     | three.js raycaster object                        |
