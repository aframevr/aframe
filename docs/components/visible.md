title: "Visible"
category: component
---

The visible component defines whether or not an entity is rendered.

```html
<a-entity visible="false"></a-entity>
```

| Value | Description                                                 |
|-------|--------------------------------------------------------------
| true  | The entity will be rendered and visible. The default value. |
| false | The entity will not be rendered, will not be visible, and will not be picked up by raycasters. However, the entity will still exist in the scene. Similar to `display: none;` |
