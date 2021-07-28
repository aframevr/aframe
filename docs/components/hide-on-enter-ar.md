---
title: hide-on-enter-ar
type: components
layout: docs
parent_section: components
source_code: src/components/hide-on-enter-ar.js
examples: []
---

When the user enters AR this component will hide the component by toggling it's `visible` state.

This is used to hide background elements such as floors, sky boxes, environments and other large elements. Letting the user comfortably fit the remaining visible elements into their physical space.

You can also use this to disable scene lighting if you will be using lighting estimation instead.

## Example

```html
<a-light hide-on-enter-ar></a-light>
<a-sky hide-on-enter-ar color="skyblue"></a-sky>
```

## Properties

None

## Events

None
