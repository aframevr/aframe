import { isIOS } from './device.js';

// Safari regression introduced in iOS 12 and remains in iOS 13.
// https://stackoverflow.com/questions/62717621/white-space-at-page-bottom-after-device-rotation-in-ios-safari
if (isIOS()) {
  window.addEventListener('orientationchange', function () {
    document.documentElement.style.height = 'initial';
    setTimeout(function () {
      document.documentElement.style.height = '100%';
      setTimeout(function () {
        // this line prevents the content
        // from hiding behind the address bar
        window.scrollTo(0, 1);
      }, 500);
    }, 500);
  });
}
