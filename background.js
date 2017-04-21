chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.active) {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        load(tabs[0].id);
      });
    }
  });

// chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
//   if (change.status == "complete") {
//     load(tabId);
//   }
// });
//
// chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
//   load(tabId);
// });

function load(tabId) {
  chrome.tabs.sendRequest(tabId, {}, function(address) {
    chrome.pageAction.show(tabId);
  });
}
