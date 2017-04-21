var storage = chrome.storage.local;
storage.get('options', function(items) {
  if (items.options) {
    method().value = items.options.method;
    quality().value = items.options.quality;
    framerate().value = items.options.framerate;
  }
});

document.querySelector('#record').addEventListener('click',
  function(evt) {

    var options = {
      method: parseInt(method().value),
      quality: parseInt(quality().value),
      framerate: parseInt(framerate().value)
    };
    storage.set({
      options: options
    });

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        run: true,
        options: options
      });
    });
  }, false);

function method() {
  return document.querySelector('#method');
}

function quality() {
  return document.querySelector('#quality');
}

function framerate() {
  return document.querySelector('#framerate');
}
