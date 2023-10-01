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
 * Wait for an attribute to be set on an element.
 * @param {Element} element
 * @param {string} attribute
 * @returns {Promise<string>}
 */
function waitForAttribute(element, attribute) {
  return new Promise((resolve, reject) => {
    if (element && element.getAttribute(attribute)) {
      return resolve(/** @type {string} */ (element.getAttribute(attribute)));
    }

    const timeout = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for attribute ${attribute}`));
    }, 15000);

    const observer = new MutationObserver(() => {
      if (element && element.getAttribute(attribute)) {
        clearTimeout(timeout);
        observer.disconnect();
        resolve(/** @type {string} */ (element.getAttribute(attribute)));
      }
    });

    observer.observe(element, {
      attributeFilter: [attribute],
    });
  });
}

async function main() {
  let videoSrc;
  try {
    videoSrc = await waitForElement("video").then((videoElement) =>
      waitForAttribute(videoElement, "src")
    );
  } catch (error) {
    return console.error(error);
  }

  const aElement = document.createElement("a");
  aElement.href = videoSrc;
  aElement.style.display = "inline-block";
  aElement.style.fontSize = "2rem";
  aElement.style.marginTop = "3rem";
  aElement.style.textAlign = "center";
  aElement.style.width = "100%";
  aElement.textContent = browser.i18n.getMessage("downloadZoomVideo");

  try {
    const playerViewElement = await waitForElement(".player-view");
    playerViewElement.appendChild(aElement);
  } catch (error) {
    console.error(error);
    document.body.appendChild(aElement);
  }
}

main();
