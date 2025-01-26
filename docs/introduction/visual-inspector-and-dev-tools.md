---
title: Visual Inspector & Dev Tools
type: introduction
layout: docs
parent_section: introduction
order: 11
---

[inspector]: https://github.com/aframevr/aframe-inspector
[motioncapture]: https://github.com/dmarcos/aframe-motion-capture-components

This section will go over many useful tools that will improve VR development
experience:

- [**A-Frame Inspector**][inspector] - Inspector tool to get a different view of the scene
  and see the visual effect of tweaking entities. The VR analog to the
  browser's DOM inspector. Can be opened on any A-Frame scene with `<ctrl> +
  <alt> + i`.
- Keyboard shortcuts.
- [**Motion Capture**][motioncapture] - A tool to record and replay headset and
  controller pose and events. Hit record, move around inside the VR headset,
  interact with objects with the controller. Then replay that recording back on
  any computer for rapid development and testing. Reduce the amount of time going
  in and out of the headset.

We'll touch on other tools that can ease development across multiple machines.

<!--toc-->

## A-Frame Inspector

The [A-Frame Inspector][inspector] is a visual tool for inspecting and tweaking
scenes. With the Inspector, we can:

- Drag, rotate, and scale entities using handles and helpers
- Tweak an entity's components and their properties using widgets
- Immediately see results from changing values without having to go back and
  forth between code and the browser

The Inspector is similar to the browser's DOM inspector but tailored for 3D and
A-Frame. We can toggle the Inspector to open up any A-Frame scene in the wild
Let's view source!

![Inspector Preview](https://cloud.githubusercontent.com/assets/674727/17754515/b5596eb6-6489-11e6-9485-4cb10fa5b100.png)

### Opening the Inspector

The easiest way to use is to press the **`<ctrl> + <alt> + i`** shortcut on
our keyboard. This will fetch the Inspector code via CDN and open up our scene
in the Inspector. The same shortcut toggles the Inspector closed.

Not only can we open our local scenes inside the Inspector, we can open any
A-Frame scene in the wild using the Inspector (as long as the author has not
explicitly disabled it).

See the [Inspector README][inspector] for details on serving local,
development, or custom builds of the Inspector.

### Using the Inspector

#### Scene Graph

The Inspector's scene graph is a tree-based representation of the scene.  We
can use the scene graph to *select, search, delete, clone, and add entities* or
exporting HTML.

![Inspector Scene Graph](https://cloud.githubusercontent.com/assets/674727/18565455/ae082fea-7b44-11e6-856f-2b9ca0e60bed.gif)

The scene graph lists A-Frame entities rather than internal three.js objects.
Given HTML is also a representation of the scene graph, the Inspector's scene
graph mirrors the underlying HTML closely. Entities are displayed using their
HTML ID or HTML tag name.

#### Viewport

The viewport displays the scene from the Inspector's point of the view. We can
rotate, pan, or zoom the viewport to change the view of the scene:

- **Rotate:** hold down left mouse button (or one finger down on a trackpad) and drag
- **Pan:** hold down right mouse button (or two fingers down on a trackpad) and drag
- **Zoom:** scroll up and down (or two-finger scroll on a trackpad)

From the viewport, we can also select entities and transform them:

- **Select**: left-click on an entity, double-click to focus the camera on it
- **Transform**: select a helper tool on the upper-right corner of the
  viewport, drag the red/blue/green helpers surrounding an entity to transform
  it

![Inspector Viewport](https://cloud.githubusercontent.com/assets/674727/18565454/ad047c84-7b44-11e6-8c4a-0f1fe55c6682.gif)

#### Components Panel

The components panel displays the selected entity's components and properties.
We can modify values of common components (e.g., position, rotation, scale),
modify values of attached components, add and remove mixins, and add and remove
components.

The type of widget for each property depends on the property type. For example,
booleans use a checkbox, numbers use a value slide, and colors use a color
picker.

We can copy the HTML output of individual components. This is useful for
visually tweaking and finding the desired value of a component and then syncing
it back to source code.

![Inspector Components](https://cloud.githubusercontent.com/assets/674727/18565449/aa63a7b6-7b44-11e6-999c-450c88812293.gif)

#### Shortcuts

We can press **`h`** key to see a list of all the shortcuts available.

## Mouse and Keyboard Shortcuts

[debugcursor](https://www.npmjs.com/package/aframe-debug-cursor-component)

Using `<a-entity cursor="rayOrigin: mouse"></a-entity>`, we can hover and click
entities using the mouse. These provide `mouseenter`, `mouseleave`, and `click`
events that are compatible with using the cursor on a controller (such as via
`<a-laser-controls>`). There is a [debug-cursor component](debugcursor) to log
cursor events.

It is useful to develop keyboard shortcut bindings to test actions within
the application using `document.addEventListener('keydown', function (evt) { //
... });`.

[debugcontrol]: https://gist.github.com/ngokevin/803e68351f70139da51fda48d3b484e3

There is [also a component that lets you control a controller in 6DoF using
keyboard][debugcontrol].

## Motion Capture

Room scale VR can be cumbersome to develop. Every change to the code, we have
to:

- Open a web page (often running on a separate computer)
- Enter VR
- Put on the headset
- Grab the controllers (often having to turn them back on)
- Do our test run with the headset and controllers
- Take off the headset and controllers and pop open the browser development tools
- Restart the browser if necessary since they're currently experimental and buggy
- Repeat

Room scale VR development becomes molasses. But we've come up with a workflow
to supercharge VR development so we can automate, develop rapidly, and on the
go with [A-Frame Motion Capture
Components](https://github.com/dmarcos/aframe-motion-capture-components/).

With the motion capture components, we can record VR actions (e.g., headset and
controller movement, controller button presses), and repeatedly replay those VR
actions, on any device from anywhere without a headset.

### Use Cases

![Rapid Development](https://cloud.githubusercontent.com/assets/674727/24733615/9cb99dae-1a2d-11e7-85e3-a75d6c06bb91.gif)

Below are several real-life use cases of motion capture vastly improving VR
development ergonomics:

1. **Faster test trials:** No need to take the headset on and off, enter VR,
grab the controllers, do manual actions, or restart browsers. Just record once
and develop for hours on a single recording.

2. **Development on the go**: Rather than having to re-enter the headset and VR
every time we want to test something, we can take our recording, send it to,
say, a Macbook, head out to a coffee shop, and continue developing our VR
application using the recording on a stable browser. Add some `console.log`s,
refactor our application, or freeze the replay with the A-Frame Inspector
(`<ctrl> + <alt> + i`) to poke around.

3. **Automated integration testing**: We can record a bunch of different recordings as
regression test cases and QA. Store the recordings, do some development, and
occasionally click through the recordings to make sure everything still works.
We store multiple recordings in projects for later testing.

4. **Multiple developers sharing one headset**: One developer can take a recording
with the Vive and go off somewhere else to develop with the recording, leaving
the Vive free for the other developers to use or take recordings.

5. **Requests for recordings**: Perhaps we don't have a Vive or Rift handy but our
colleague or friend does.  Give them a link to our web application maybe via
[ngrok](https://ngrok.io) (isn't the Web awesome?), have them take a recording,
and send it to us! Now we're unblocked from developing.

6. **Demonstrating bugs**: Or let's say we found a bug in a VR web application
and want to show it to someone. Take a recording and send it to them to debug.
No need to give bug reproduction steps, it's all in the recording!

7. **Automated unit testing**: We can use recordings with unit testing
frameworks such as Karma and Mocha to replay the recording and make assertions.
For example, touch an box and check that it changes color. See [A-Frame
Machinima Testing][machinima] by [William Murphy] for an example.

[machinima]: https://github.com/wmurphyrd/aframe-machinima-testing/
[William Murphy]: https://twitter.com/datatitian

### How to Record

Read the [Motion Capture
documentation](https://github.com/dmarcos/aframe-motion-capture-components/)
for more information. Here's how to set up the recording:

1. Drop the Motion Capture Components script tag into our HTML file (e.g., `<script src="https://unpkg.com/aframe-motion-capture-components/dist/aframe-motion-capture-components.min.js">`)
2. Add the `avatar-recorder` component to the scene (i.e., `<a-scene avatar-recorder>`)
3. Enter VR
4. Press `<space>` to start recording
5. Record movements and actions
6. Press `<space>` to stop recording
7. Save the recording JSON file or upload it by hitting `u` to get a short URL to share between computers

Now we can replay the recording. We can try recording the camera with WASD and
mouse drag controls right now on a desktop. Head to the [Record
Example](http://dmarcos.github.io/aframe-motion-capture-components/), open the
browser Console to get feedback, and hit `<space>` to start and stop recording!


![Record](https://cloud.githubusercontent.com/assets/674727/24766726/3d660b7e-1ab1-11e7-9f64-d97b5732ec43.gif)

### How to Replay

By default, the recording will also be saved and replayed from localStorage. If
we want to take our recording on the go, here's how to replay a recording
(assuming we already have the script tag above):

1. Put the recording file somewhere accessible to the web page (i.e., in the project directory or online)
2. Add `avatar-replayer` component to the scene (i.e., `<a-scene avatar-replayer>`)
3. Append `?avatar-recording=path/to/recording.json` to the URL *or* set `<a-scene avatar-replayer="src: path/to/recording.json">`

Then replay the recording on any device from anywhere without a headset to our
heart's content. Get in the headset, record some clicks, and then from a
laptop, we can build event handlers on top of the controller events we emitted
in the recording.

### Spectator Mode

The A-Frame Motion Capture Components have a Spectator Mode feature that can be
enabled from the `avatar-replayer` component:

```
<a-scene avatar-replayer="spectatorMode: true">
```

This lets us view the recording from a third-person view. This can be useful
since it is hard to see what was happening in first person. The first-person
view is naturally shaky, hands would occlude the camera, actions would be
happening off-screen, and its hard to focus on one place if the camera is
always moving away. The Spectator Mode lets us free move around the scene and
view at whatever angle or focus on whatever area.

![Spectator Mode](https://cloud.githubusercontent.com/assets/674727/24733331/f2bc6094-1a2b-11e7-9442-bcf30d18af79.gif)

## Cross-Machine Development

With VR development, it is common to develop across multiple machines. For
example, developing on a laptop and testing on a VR desktop. The tools below
help with that process:

### Synergy

![Synergy](https://cloud.githubusercontent.com/assets/674727/25640613/07a10392-2f45-11e7-94a5-f07cf8e32ad9.jpg)

[Synergy](https://symless.com/synergy) lets us share one mouse and keyboard
between multiple computers. For example, this lets us control a desktop from a
laptop. We can code from the laptop. Then using the laptop, we can control the
desktop to refresh the browser, enter VR, visit different URLs, take motion
capture recordings, or inspect the browser's developer tools. No need to have
two sets of keyboards and mice on our desk space.

A Synergy Basic license costs $19, but it is well worth it if we are developing
with multiple computers.

### ngrok

![ngrok](https://cloud.githubusercontent.com/assets/674727/25640652/38effdcc-2f45-11e7-99a9-c98bd694e79c.jpg)

[ngrok](https://ngrok.io) lets us easily expose a local development server for
other computers to access, even through firewalls or NAT networks. The steps
are to:

1. Download ngrok
2. Open the command line and head to the same directory ngrok was downloaded to
3. Have a local development server running (e.g., `python -m SimpleHTTPServer 8080`)
4. Run `./ngrok http <PORT>` (e.g., `./ngrok http 8080`)
5. An ngrok instance will spin up and provide a URL that the other computer can
access from its browser (e.g., `https://abcdef123456.ngrok.io`)

ngrok is most ergonomic if we get a premium account and reserve our own
domains to get easy-to-remember URLs. Otherwise, the URL is randomized each
time and very hard to type. The Basic license provides 3 reserved domains for
$5/mo, and the Pro license provides 2 simultaneous instances for $8.25/mo. [See
ngrok pricing details](https://ngrok.com/product#pricing).

With reserved domains, we can reserve a URL like `https://abc.ngrok.io`. Note
`abc` is just an example, and it is currently taken. Then every time we start
ngrok, we pass the domain:

```
./ngrok http --subdomain=abc 8080
```

Every time we start ngrok, we can reliably use the same URL. To make it even
simpler, we could add a Bash alias:

```
alias ngrok="~/path/to/ngrok http --subdomain=abc"
```

And use it simply from the command line from anywhere:

```
ngrok 8080
```

Alternatively, we could have both computers connected on the same local
network, and use `ipconfig` or `ifconfig` to point one computer to the other
using the local IP address (e.g., `http://192.168.1.135:8000`). But that can
disrupt workflow because we have to run commands to get the local IP address,
the local IP address often changes, and it's hard to remember and type the IP.

### Motion Capture

Motion capture was described above, but to reiterate, motion capture helps
immensely in developing across machines. The VR recordings can be shared, and
replayed on other computers. After taking a motion capture recording with
`<space>`, press `u` on the keyboard to upload the recording data and get a URL
that can easily be transferred (versus emailing ourselves). Alternatively,
recordings can be transferred using [file.io](https://file.io).
