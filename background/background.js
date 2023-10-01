/// <reference path="../firefox-webext-browser.d.ts" />

// Google Drive
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log("Sending VIDEO_URL message to tab", details.tabId);
    browser.tabs.sendMessage(details.tabId, {
      type: "VIDEO_URL",
      url: details.url,
    });
  },
  { urls: ["*://*.drive.google.com/videoplayback*"] },
);
