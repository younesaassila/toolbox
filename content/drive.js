/// <reference path="../firefox-webext-browser.d.ts" />

/**
 * Wait for an element to be added to the DOM.
 * From https://stackoverflow.com/a/61511955
 * @param {string} selector
 * @returns {Promise<Element>}
 */
function waitForElement(selector) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const timeout = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element ${selector}`));
    }, 30000);

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearTimeout(timeout);
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Wait for a message from the background script.
 * @param {string} type
 * @returns {Promise<any>}
 */
function waitForMessage(type) {
  return new Promise((resolve, reject) => {
    let timeout = null;
    const listener = (message) => {
      if (message.type === type) {
        if (timeout) {
          clearTimeout(timeout);
        }
        browser.runtime.onMessage.removeListener(listener);
        resolve(message);
      }
    };
    timeout = setTimeout(() => {
      browser.runtime.onMessage.removeListener(listener);
      reject(new Error(`Timeout waiting for message ${type}`));
    }, 15000);
    browser.runtime.onMessage.addListener(listener);
  });
}

async function main() {
  let videoUrl;
  try {
    videoUrl = await waitForMessage("VIDEO_URL").then((message) => message.url);
  } catch (error) {
    return console.error(error);
  }

  const aElement = document.createElement("a");
  aElement.href = videoUrl;
  aElement.download = "";
  aElement.style.fontSize = "1rem";
  aElement.textContent = browser.i18n.getMessage("downloadGoogleDriveVideo");

  try {
    const menuElement = await waitForElement(
      'div[role="toolbar"] > div > div:last-child',
    );
    menuElement.prepend(aElement);
  } catch (error) {
    console.error(error);
    document.body.appendChild(aElement);
  }
}

main();
