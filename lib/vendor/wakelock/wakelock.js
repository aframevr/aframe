/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Util = require('./util.js');

/**
 * Android and iOS compatible wakelock implementation.
 *
 * Refactored thanks to dkovalev@.
 */
function AndroidWakeLock() {
  var video = document.createElement('video');

  video.addEventListener('ended', function() {
    video.play();
  });

  this.request = function() {
    if (video.paused) {
      // Base64 version of videos_src/no-sleep-60s.webm.
      video.src = Util.base64('video/webm', 'GkXfowEAAAAAAAAfQoaBAUL3gQFC8oEEQvOBCEKChHdlYm1Ch4ECQoWBAhhTgGcBAAAAAAAH4xFNm3RALE27i1OrhBVJqWZTrIHfTbuMU6uEFlSua1OsggEwTbuMU6uEHFO7a1OsggfG7AEAAAAAAACkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmAQAAAAAAAEUq17GDD0JATYCNTGF2ZjU2LjQwLjEwMVdBjUxhdmY1Ni40MC4xMDFzpJAGSJTMbsLpDt/ySkipgX1fRImIQO1MAAAAAAAWVK5rAQAAAAAAADuuAQAAAAAAADLXgQFzxYEBnIEAIrWcg3VuZIaFVl9WUDmDgQEj44OEO5rKAOABAAAAAAAABrCBsLqBkB9DtnUBAAAAAAAAo+eBAKOmgQAAgKJJg0IAAV4BHsAHBIODCoAACmH2MAAAZxgz4dPSTFi5JACjloED6ACmAECSnABMQAADYAAAWi0quoCjloEH0ACmAECSnABNwAADYAAAWi0quoCjloELuACmAECSnABNgAADYAAAWi0quoCjloEPoACmAECSnABNYAADYAAAWi0quoCjloETiACmAECSnABNIAADYAAAWi0quoAfQ7Z1AQAAAAAAAJTnghdwo5aBAAAApgBAkpwATOAAA2AAAFotKrqAo5aBA+gApgBAkpwATMAAA2AAAFotKrqAo5aBB9AApgBAkpwATIAAA2AAAFotKrqAo5aBC7gApgBAkpwATEAAA2AAAFotKrqAo5aBD6AApgDAkpwAQ2AAA2AAAFotKrqAo5aBE4gApgBAkpwATCAAA2AAAFotKrqAH0O2dQEAAAAAAACU54Iu4KOWgQAAAKYAQJKcAEvAAANgAABaLSq6gKOWgQPoAKYAQJKcAEtgAANgAABaLSq6gKOWgQfQAKYAQJKcAEsAAANgAABaLSq6gKOWgQu4AKYAQJKcAEqAAANgAABaLSq6gKOWgQ+gAKYAQJKcAEogAANgAABaLSq6gKOWgROIAKYAQJKcAEnAAANgAABaLSq6gB9DtnUBAAAAAAAAlOeCRlCjloEAAACmAECSnABJgAADYAAAWi0quoCjloED6ACmAECSnABJIAADYAAAWi0quoCjloEH0ACmAMCSnABDYAADYAAAWi0quoCjloELuACmAECSnABI4AADYAAAWi0quoCjloEPoACmAECSnABIoAADYAAAWi0quoCjloETiACmAECSnABIYAADYAAAWi0quoAfQ7Z1AQAAAAAAAJTngl3Ao5aBAAAApgBAkpwASCAAA2AAAFotKrqAo5aBA+gApgBAkpwASAAAA2AAAFotKrqAo5aBB9AApgBAkpwAR8AAA2AAAFotKrqAo5aBC7gApgBAkpwAR4AAA2AAAFotKrqAo5aBD6AApgBAkpwAR2AAA2AAAFotKrqAo5aBE4gApgBAkpwARyAAA2AAAFotKrqAH0O2dQEAAAAAAACU54J1MKOWgQAAAKYAwJKcAENgAANgAABaLSq6gKOWgQPoAKYAQJKcAEbgAANgAABaLSq6gKOWgQfQAKYAQJKcAEagAANgAABaLSq6gKOWgQu4AKYAQJKcAEaAAANgAABaLSq6gKOWgQ+gAKYAQJKcAEZAAANgAABaLSq6gKOWgROIAKYAQJKcAEYAAANgAABaLSq6gB9DtnUBAAAAAAAAlOeCjKCjloEAAACmAECSnABF4AADYAAAWi0quoCjloED6ACmAECSnABFwAADYAAAWi0quoCjloEH0ACmAECSnABFoAADYAAAWi0quoCjloELuACmAECSnABFgAADYAAAWi0quoCjloEPoACmAMCSnABDYAADYAAAWi0quoCjloETiACmAECSnABFYAADYAAAWi0quoAfQ7Z1AQAAAAAAAJTngqQQo5aBAAAApgBAkpwARUAAA2AAAFotKrqAo5aBA+gApgBAkpwARSAAA2AAAFotKrqAo5aBB9AApgBAkpwARQAAA2AAAFotKrqAo5aBC7gApgBAkpwARQAAA2AAAFotKrqAo5aBD6AApgBAkpwAROAAA2AAAFotKrqAo5aBE4gApgBAkpwARMAAA2AAAFotKrqAH0O2dQEAAAAAAACU54K7gKOWgQAAAKYAQJKcAESgAANgAABaLSq6gKOWgQPoAKYAQJKcAESAAANgAABaLSq6gKOWgQfQAKYAwJKcAENgAANgAABaLSq6gKOWgQu4AKYAQJKcAERgAANgAABaLSq6gKOWgQ+gAKYAQJKcAERAAANgAABaLSq6gKOWgROIAKYAQJKcAEQgAANgAABaLSq6gB9DtnUBAAAAAAAAlOeC0vCjloEAAACmAECSnABEIAADYAAAWi0quoCjloED6ACmAECSnABEAAADYAAAWi0quoCjloEH0ACmAECSnABD4AADYAAAWi0quoCjloELuACmAECSnABDwAADYAAAWi0quoCjloEPoACmAECSnABDoAADYAAAWi0quoCjloETiACmAECSnABDgAADYAAAWi0quoAcU7trAQAAAAAAABG7j7OBALeK94EB8YIBd/CBAw==');
      video.play();
    }
  };

  this.release = function() {
    video.pause();
    video.src = '';
  };
}

function iOSWakeLock() {
  var timer = null;

  this.request = function() {
    if (!timer) {
      timer = setInterval(function() {
        window.location = window.location;
        setTimeout(window.stop, 0);
      }, 30000);
    }
  }

  this.release = function() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
}


function getWakeLock() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
    return iOSWakeLock;
  } else {
    return AndroidWakeLock;
  }
}

module.exports = getWakeLock();
