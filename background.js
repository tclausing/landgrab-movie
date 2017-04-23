chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  fns[request.fn](request);
});

// chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
//   if (change.status == "complete") {
//     fns.terminatePool();
//   }
// });

// chrome.tabs.onSelectionChanged.addListener(function(tabId, info) {
//   load(tabId);
// });

var fns = {

  load: function() {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendRequest(tabs[0].id, {}, function(address) {
        chrome.pageAction.show(tabs[0].id);
      });
    });
  },
};
