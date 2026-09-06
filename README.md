<h1 align="center">A-Frame</h1>

<p align="center"><a href="https://aframe.io" target="_blank"><img width="480" alt="A-Frame" src="https://user-images.githubusercontent.com/674727/32120889-230ef110-bb0f-11e7-908c-76e39aa43149.jpg"></a></p>

<p align="center"><b>A web framework for building browser based 3D, AR and VR experiences.</b></p>

<p align="center">
  <a href="https://codecov.io/gh/aframevr/aframe">
    <img src="https://codecov.io/gh/aframevr/aframe/branch/master/graph/badge.svg" alt="Coverage Status">
  </a>
  <a href="https://npmjs.org/package/aframe">
    <img src="https://img.shields.io/npm/dt/aframe.svg?style=flat-square" alt="Downloads">
  </a>
  <a href="https://npmjs.org/package/aframe">
    <img src="https://img.shields.io/npm/v/aframe.svg?style=flat-square" alt="Version">
  </a>
  <a href="https://npmjs.com/package/aframe">
    <img src="https://img.shields.io/npm/l/aframe.svg?style=flat-square" alt="License"></a>
  </a>
</p>

<div align="center">
  <a href="https://aframe.io">Site</a>
  &mdash;
  <a href="https://aframe.io/docs/">Docs</a>
  &mdash;
  <a href="https://aframe.io/aframe/examples/">Examples</a>
  &mdash;
  <a href="https://aframe.io/school/">School</a>
  &mdash;
  <a href="https://aframe.io/community/">Community</a>
</div>

## Examples

<a href="https://supermedium.com/supercraft">
  <img alt="Supercraft" target="_blank" src="https://user-images.githubusercontent.com/674727/41085457-f5429566-69eb-11e8-92e5-3210e4c6c4a0.gif" height="190" width="32%">
</a>
<a href="https://aframe.io/a-painter/?url=https://ucarecdn.com/962b242b-87a9-422c-b730-febdc470f203/">
  <img alt="A-Painter" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531388/acfc3dda-156d-11e7-8563-5bd75252f70f.gif" height="190" width="32%">
</a>
<a href="https://supermedium.com">
  <img alt="Supermedium" target="_blank" src="https://user-images.githubusercontent.com/674727/37294616-7212cd20-25d3-11e8-9e7f-c0c61074f1e0.png" height="190" width="32%">
</a>
<a href="https://aframe.io/a-blast/">
  <img alt="A-Blast" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531440/0336e66e-156e-11e7-95c2-f2e6ebc0393d.gif" height="190" width="32%">
</a>
<a href="https://aframe.io/a-saturday-night/">
  <img alt="A-Saturday-Night" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/24531477/44272daa-156e-11e7-8ef9-d750ed430f3a.gif" height="190" width="32%">
</a>
<a href="https://github.com/googlecreativelab/webvr-musicalforest">
  <img alt="Musical Forest by @googlecreativelab" target="_blank" src="https://cloud.githubusercontent.com/assets/674727/25109861/b8e9ec48-2394-11e7-8f2d-ea1cd9df69c8.gif" height="190" width="32%">
</a>

*Find more examples on [the homepage](https://aframe.io), [A Week of A-Frame](https://aframe.io/blog/), and [WebVR Directory](https://webvr.directory).*

## Features

:eyeglasses: **Virtual Reality Made Simple**: A-Frame handles the 3D and WebXR
boilerplate required to get running across platforms including mobile, desktop, and all headsets (compatible with a WebXR capable browser) just by dropping in `<a-scene>`.

:heart: **Declarative HTML**: HTML is easy to read and copy-and-paste. Since
A-Frame can be used from HTML, A-Frame is accessible to everyone: web
developers, VR and AR enthusiasts, educators, artists, makers, kids.

:electric_plug: **Entity-Component Architecture**: A-Frame is a powerful
framework on top of three.js, providing a declarative, composable, reusable
entity-component structure for three.js. While A-Frame can be used from HTML,
developers have unlimited access to JavaScript, DOM APIs, three.js, WebXR, and
WebGL.

:zap: **Performance**: A-Frame is a thin framework on top of three.js.
Although A-Frame uses the DOM, A-Frame does not touch the browser layout
engine. Performance is a top priority, being battle-tested on highly
interactive WebXR experiences.

:globe_with_meridians: **Cross-Platform**: Build VR and AR applications for any headset compatible with a WebXR capable browser. Don't have a headset or controllers? No
problem! A-Frame still works on standard desktop and smartphones.

:mag: **Visual Inspector**: A-Frame provides a built-in visual 3D inspector
with a workflow similar to a browser's developer tools and interface similar to
Unity. Open up any A-Frame scene and hit `<ctrl> + <alt> + i`.

:runner: **Features**: Hit the ground running with A-Frame's built-in
components such as geometries, materials, lights, animations, models,
raycasters, shadows, positional audio, tracked controllers. Get even further
with community components such as particle systems, physics, multiuser, oceans,
mountains, speech recognition, or teleportation!

## Usage

### Example

Build VR and AR scenes in the browser with just a few lines of HTML! To start playing
and publishing now, remix the starter example on:

[![Remix](https://cloud.githubusercontent.com/assets/674727/24572421/688f7fc0-162d-11e7-8a35-b02bc050c043.jpg)](https://glitch.com/~aframe)
```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
      <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
      <a-sky color="#ECECEC"></a-sky>
    </a-scene>
  </body>
</html>
```

With A-Frame's [entity-component
architecture](https://aframe.io/docs/1.8.0/introduction/entity-component-system.html), we can drop in community
components from the ecosystem (e.g., ocean, physics) and plug them into our
objects straight from HTML:

[See example](https://aframe.io/aframe/examples/docs/community-components/)

```html
<html>
  <head>
    <script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-particle-system-component@1.2.x/dist/aframe-particle-system-component.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.7.x/dist/aframe-extras.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@fern-solutions/aframe-sky-background/dist/sky-background.umd.min.js"></script>
  </head>
  <body>
    <a-scene>
      <a-entity id="rain" particle-system="preset: rain; color: #24CAFF; particleCount: 5000"></a-entity>

      <a-entity id="sphere" geometry="primitive: sphere"
                material="color: #EFEFEF; shader: flat"
                position="0 0.15 -5"
                light="type: point; intensity: 15.7"
                animation="property: position; easing: easeInOutQuad; dir: alternate; dur: 1000; to: 0 -0.10 -5; loop: true"></a-entity>

      <a-entity id="ocean" ocean="density: 20; width: 50; depth: 50; speed: 4"
                material="color: #9CE3F9; opacity: 0.75; metalness: 0; roughness: 1"
                rotation="-90 0 0"></a-entity>

      <a-sky-background top-color="#EBEBF5" bottom-color="#B9B9D2"></a-sky-background>

      <a-entity id="light" light="type: ambient; color: #888"></a-entity>
    </a-scene>
  </body>
</html>
```

### Builds

To use the latest stable build of A-Frame, include [`aframe.min.js`](https://aframe.io/releases/1.8.0/aframe.min.js):

```js
<head>
  <script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>
</head>
```

To check out the stable and master builds, see the [`dist/` folder](dist/).

### npm

```sh
npm install --save aframe
# Or yarn add aframe
```

```js
import AFRAME from 'aframe';  // e.g., with Webpack or Vite.
```

## Local Development

```sh
git clone https://github.com/aframevr/aframe.git  # Clone the repository.
cd aframe && npm install  # Install dependencies.
npm start  # Start the local development server.
```

And open in your browser [http://localhost:8080](http://localhost:8080).

If you want to test the examples in VR, you need to run it with https:

```sh
npm run start:https
```

Look at the "On Your Network (IPv4)" line in the console, and copy and paste
the url to https://hmd.link service.
Then open the browser in your headset and type hmd.link in the address bar
then click on the copied url that will show up if you're connected to the same
network as your machine.
You will see a message about the page being dangerous because we're using a
self-signed certificate, you can ignore that warning and continue to the page.

### Generating Builds

```sh
npm run dist
```

## Questions

For questions and support, [ask on StackOverflow](https://stackoverflow.com/questions/ask/?tags=aframe).

## Stay in Touch

- Hang out with the [community](https://aframe.io/community/)
- [Follow @aframevr on X](https://x.com/aframevr).

And get in touch with the maintainers!

- [Diego Marcos](https://x.com/dmarcos)
- [Don McCurdy](https://x.com/donrmccurdy)
- [Kevin Ngo](https://x.com/andgokevin)

## Contributing

Get involved! Check out the [Contributing Guide](CONTRIBUTING.md) for how to get started.

You can also support development by [buying a gorgeous A-Frame t-shirt with exclusive designs](https://cottonbureau.com/products/a-frame-og#/9479538/tee-men-standard-tee-vintage-black-tri-blend-s)

## License

This program is free software and is distributed under an [MIT License](LICENSE).


## 🌐 Web Resources & Interactive Index
- [DARLING DOLL](https://quizverses.pages.dev/darling-doll.html)
- [CATEGORY QUIZ40](https://themindplay.pages.dev/category-quiz40.html)
- [CATEGORY PROXIES](https://thequizzone.pages.dev/category-proxies.html)
- [JELLY MATH 3D](https://learnquesters.pages.dev/jelly-math-3d.html)
- [CATEGORY PHYSICS371](https://learnquester.pages.dev/category-physics371.html)
- [CATEGORY SURVIVAL](https://quizverses-9d2f2.web.app/category-survival.html)
- [BOO TIFUL PRINCESS MATCH](https://quizverses.github.io/boo-tiful-princess-match.html)
- [MY HAPPY FARM](https://learnquester.pages.dev/my-happy-farm.html)
- [PLANET DEMOLISH](https://learnquester.pages.dev/planet-demolish.html)
- [HEROES OF THE ARENA](https://thelearnquesters.pages.dev/heroes-of-the-arena.html)
- [IDLE LUNCH](https://quizverses.github.io/idle-lunch.html)
- [MONSTER SCHOOL 2](https://thelearnquesters.pages.dev/monster-school-2.html)
- [CATEGORY FLASH 3](https://thequizzone.pages.dev/category-flash-3.html)
- [LOVE TILE TRIO](https://quizverses.pages.dev/love-tile-trio.html)
- [SOCCER DUEL](https://quizverses.pages.dev/soccer-duel.html)
- [CATEGORY HORROR90](https://quizverses-9d2f2.web.app/category-horror90.html)
- [BLOCK STACKING](https://learnquester.pages.dev/block-stacking.html)
- [INDEX15](https://studyquests.github.io/index15.html)
- [FASHION WEEK 2025](https://learnquester.pages.dev/fashion-week-2025.html)
- [FIREBOY WATERGIRL 7 AND FRIENDS](https://quizverses.pages.dev/fireboy-watergirl-7-and-friends.html)
- [CATEGORY MOUSE1 707](https://learnquesters.pages.dev/category-mouse1-707.html)
- [CATEGORY PUZZLE 9](https://thelearnquesters.pages.dev/category-puzzle-9.html)
- [CATEGORY AGILITY 3](https://studyquests.github.io/category-agility-3.html)
- [LITTLE BUGS](https://quizverses.github.io/little-bugs.html)
- [INDEX4](https://quizverses.github.io/index4.html)
- [CATEGORY AGILITY](https://thelearnquesters.pages.dev/category-agility.html)
- [FALLING MAN](https://thelearnquesters.pages.dev/falling-man.html)
- [BRICK BREAKER](https://learnquester.pages.dev/brick-breaker.html)
- [TROPICAL MATCH 2](https://thelearnquesters.pages.dev/tropical-match-2.html)
- [CATEGORY PUZZLE 4](https://quizverses-9d2f2.web.app/category-puzzle-4.html)
- [CATEGORY CASUAL 11](https://quizverses.github.io/category-casual-11.html)
- [CATEGORY BIKE 3](https://thequizzone.pages.dev/category-bike-3.html)
- [CATEGORY FPS GAMES](https://studyquests.github.io/category-fps-games.html)
- [CATEGORY RUNNING107](https://thequizzone.pages.dev/category-running107.html)
- [CATEGORY MAHJONG CONNECT](https://learnquesters.pages.dev/category-mahjong-connect.html)
- [CATEGORY SIMULATION](https://studyplaying.github.io/category-simulation.html)
- [ICE FISHING 3D](https://quizverses.pages.dev/ice-fishing-3d.html)
- [CATEGORY ESCAPE](https://learnquesters.pages.dev/category-escape.html)
- [CATEGORY FPS 2](https://learnquester.pages.dev/category-fps-2.html)
- [HAMMER MASTERCRAFT DESTROY](https://studyquests.github.io/hammer-mastercraft-destroy.html)
- [INDEX6](https://learnquesters.pages.dev/index6.html)
- [GALAXY CLICKER](https://learnquester.pages.dev/galaxy-clicker.html)
- [ZOMBIE ARENA 2 FURY ROAD](https://thelearnquesters.pages.dev/zombie-arena-2-fury-road.html)
- [SNAKEMAXX](https://studyquests.github.io/snakemaxx.html)
- [MERGE PLANETS](https://quizverses.pages.dev/merge-planets.html)
- [BFF LOVELY KAWAII OUTFITS](https://quizverses.pages.dev/bff-lovely-kawaii-outfits.html)
- [CRASH THE ROBOT](https://learnquesters.pages.dev/crash-the-robot.html)
- [CATEGORY LOGIC538](https://quizverses-9d2f2.web.app/category-logic538.html)
- [FIGHT TO THE END](https://thelearnquesters.pages.dev/fight-to-the-end.html)
- [DUNK CHALLENGE](https://thelearnquesters.pages.dev/dunk-challenge.html)
- [CATEGORY FLASH](https://studyplaying.github.io/category-flash.html)
- [INDEX19](https://thelearnquesters.pages.dev/index19.html)
- [CHICKEN WARS MERGE GUNS](https://quizverses.github.io/chicken-wars-merge-guns.html)
- [ROPE STITCH PUZZLE](https://quizverses-9d2f2.web.app/rope-stitch-puzzle.html)
- [INDEX34](https://quizverses.github.io/index34.html)
- [CATEGORY DOG18](https://quizverses-9d2f2.web.app/category-dog18.html)
- [HALLOWEEN STICKMAN](https://studyquests.github.io/halloween-stickman.html)
- [CATEGORY PUZZLE 2](https://thelearnquesters.pages.dev/category-puzzle-2.html)
- [CATEGORY IO](https://learnquesters.pages.dev/category-io.html)
- [VARIETY MECHA](https://studyquests.github.io/variety-mecha.html)
- [SOCCER EURO CUP 2025](https://learnquester.pages.dev/soccer-euro-cup-2025.html)
- [SEA MONSTERS MAHJONG](https://learnquesters.pages.dev/sea-monsters-mahjong.html)
- [ASMR BEAUTY SUPERSTAR](https://quizverses-9d2f2.web.app/asmr-beauty-superstar.html)
- [CATEGORY UNBLOCKERS](https://thequizzone.pages.dev/category-unblockers.html)
- [INDEX20](https://learnquesters.pages.dev/index20.html)
- [CATEGORY GROW99](https://quizverses-9d2f2.web.app/category-grow99.html)
- [CATEGORY ART](https://quizverses.github.io/category-art.html)
- [CATEGORY ADVENTURE 3](https://quizverses.github.io/category-adventure-3.html)
- [KOI FISH POND IDLE MERGE GAME](https://thelearnquesters.pages.dev/koi-fish-pond-idle-merge-game.html)
- [CATEGORY ADVENTURE 2](https://thequizzone.pages.dev/category-adventure-2.html)
- [ATOMIC MERGE 2048](https://thequizzone.pages.dev/atomic-merge-2048.html)
- [INDEX33](https://quizverses.github.io/index33.html)
- [FAR ORION NEW WORLDS](https://learnquester.pages.dev/far-orion-new-worlds.html)
- [CATEGORY RACING DRIVING](https://thelearnquesters.pages.dev/category-racing-driving.html)
- [FOOTBALL PENALTY 2026](https://studyquests.github.io/football-penalty-2026.html)
- [CUTE ANIMAL WORLD](https://quizverses.pages.dev/cute-animal-world.html)
- [CATEGORY CASUAL 12](https://studyplaying.github.io/category-casual-12.html)
- [CATEGORY MAGIC46](https://thelearnquesters.pages.dev/category-magic46.html)
- [BITBALL](https://studyquests.github.io/bitball.html)
- [CATEGORY STRATEGY 3](https://thelearnquesters.pages.dev/category-strategy-3.html)
- [DEAD PARADISE](https://studyquests.pages.dev/dead-paradise.html)
- [MEGA MAKEUP SEASONS BEST](https://thelearnquesters.pages.dev/mega-makeup-seasons-best.html)
- [FALLLING JEWELS](https://quizverses.github.io/fallling-jewels.html)
- [CATEGORY MONSTER207](https://quizverses.pages.dev/category-monster207.html)
- [ROBYBOX SPACE STATION WAREHOUSE](https://quizverses.github.io/robybox-space-station-warehouse.html)
- [CATEGORY QUIZ](https://thelearnquesters.pages.dev/category-quiz.html)
- [CATEGORY CASUAL 3](https://studyquests.github.io/category-casual-3.html)
- [CATEGORY BATTLE524](https://quizverses.pages.dev/category-battle524.html)
- [HAPPY GLASS GAME](https://quizverses.pages.dev/happy-glass-game.html)
- [HYPERSPACE   QUANTUM FRACTURE FEZ](https://learnquesters.pages.dev/hyperspace---quantum-fracture-fez.html)
- [SNAKE KING](https://learnquester.pages.dev/snake-king.html)
- [CATEGORY CAN T STOP PLAYING215](https://studyquesthub.web.app/category-can-t-stop-playing215.html)
- [CUT IN HALF](https://quizverses.github.io/cut-in-half.html)
- [CATEGORY AVOID295](https://learnquesters.pages.dev/category-avoid295.html)
- [CATEGORY ADVENTURE 3](https://learnquester.pages.dev/category-adventure-3.html)
- [CATEGORY UNBLOCKED GAMES](https://thequizzone.pages.dev/category-unblocked-games.html)
- [MINI SHOOTERS](https://learnquester.pages.dev/mini-shooters.html)
- [GOBATTLEIO](https://quizverses-9d2f2.web.app/gobattleio.html)
- [DELIVERY CHAOS](https://thelearnquesters.pages.dev/delivery-chaos.html)
- [CATEGORY SCRATCH17](https://thelearnquesters.pages.dev/category-scratch17.html)
- [CATEGORY MOBILE2 112](https://quizverses.pages.dev/category-mobile2-112.html)
- [WOODS OF NEVIA FOREST SURVIVAL](https://quizverses.github.io/woods-of-nevia-forest-survival.html)
- [METEOHEROES](https://studyquests.pages.dev/meteoheroes.html)
- [THREAD MATCH 2](https://studyquests.pages.dev/thread-match-2.html)
- [INDEX42](https://thelearnquesters.pages.dev/index42.html)
- [BOBB S WORLD](https://studyquests.pages.dev/bobb-s-world.html)
- [WATER SHOOTER](https://studyquests.github.io/water-shooter.html)
- [CONTACT](https://studyquests.github.io/contact.html)
- [CATEGORY MERGE 2](https://thelearnquesters.pages.dev/category-merge-2.html)
- [CATEGORY BATTLE 2](https://thequizzone.pages.dev/category-battle-2.html)
- [INDEX38](https://quizverses.github.io/index38.html)
- [SKIBIDI TOILET VS CAMERAMAN SNIPER GAME](https://thelearnquesters.pages.dev/skibidi-toilet-vs-cameraman-sniper-game.html)
- [FRUIT CATCHER](https://thelearnquesters.pages.dev/fruit-catcher.html)
- [SLINGER BLOCK](https://thelearnquesters.pages.dev/slinger-block.html)
- [COLOR NONOGRAM PUZZLE](https://thelearnquesters.pages.dev/color-nonogram-puzzle.html)
- [MERGE TIKTOK GRAVITY KNIFE](https://thequizzone.pages.dev/merge-tiktok-gravity-knife.html)
- [THUMBPINBALL](https://thelearnquesters.pages.dev/thumbpinball.html)
- [CATEGORY BASKETBALL 3](https://thequizzone.pages.dev/category-basketball-3.html)
- [CATEGORY CASUAL 8](https://studyquests.github.io/category-casual-8.html)
- [STAND ON THE RIGHT COLOR ROBBY](https://learnquesters.pages.dev/stand-on-the-right-color-robby.html)
- [CATEGORY FLASH](https://quizverses-9d2f2.web.app/category-flash.html)
- [ZINDEX](https://thelearnquesters.pages.dev/zindex.html)
- [SORT WORKS NUTS ORDER](https://studyquests.github.io/sort-works-nuts-order.html)
- [CATEGORY PUZZLE](https://thelearnquesters.pages.dev/category-puzzle.html)
- [CHRISTMAS CANDY ESCAPE 3D](https://studyquests.github.io/christmas-candy-escape-3d.html)
- [BATTLE FOR THE GALAXY](https://thelearnquesters.pages.dev/battle-for-the-galaxy.html)
- [TERMS](https://learnquesters.pages.dev/terms.html)
- [FLICK BASEBALL SUPER HOMERUN](https://studyquests.pages.dev/flick-baseball-super-homerun.html)
- [BALL DROP](https://studyquesthub.web.app/ball-drop.html)
- [HERO PIPE](https://studyquests.github.io/hero-pipe.html)
