---
title: Assets
type: core
layout: docs
parent_section: core
order: 8
---

To keep everything in one place and to later help A-Frame decide what to block on, assets (such as images, videos, and mixins) should be placed in `<a-assets>`. Media files that are defined within their respective tags help the browser cache assets for future loading.

```html
<a-assets>
  <img id="horse" src="...">
  <video id="kentucky-derby" src="..."></video>
  <a-mixin id="giant" scale="5 5 5"></a-mixin>
</a-assets>
```
