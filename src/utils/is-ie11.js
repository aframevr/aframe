// https://stackoverflow.com/a/17907562
function getInternetExplorerVersion () {
  let version = -1;
  let userAgent = navigator.userAgent;
  let re;
  if (navigator.appName === 'Microsoft Internet Explorer') {
    re = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})');
    if (re.exec(userAgent) != null) { version = parseFloat(RegExp.$1); }
  } else if (navigator.appName === 'Netscape') {
    re = new RegExp('Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})');
    if (re.exec(userAgent) != null) { version = parseFloat(RegExp.$1); }
  }
  return version;
}

module.exports = getInternetExplorerVersion() === 11;
