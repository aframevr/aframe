---
title: "Visible"
type: components
layout: docs
parent_section: components
order: 15
---

The `visible` component defines whether or not an entity is rendered.

```html
<a-entity visible="false"></a-entity>
```

| Value | Description                                                 |
|-------|--------------------------------------------------------------
| true  | The entity will be rendered and visible. The default value. |
| false | The entity will not be rendered, will not be visible, and will not be picked up by raycasters; however, the entity will still exist in the scene (similar to `display: none`). |
