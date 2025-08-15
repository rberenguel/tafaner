// Listener for messages from the content script (e.g., to trigger localhost)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "triggerLocalhost") {
    chrome.storage.local.get({ port: "3000" }, function (items) {
      const port = items.port;
      const url = `http://localhost:${port}/`;

      console.log(`Sending message to ${url}:`, request.message);

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: request.message,
      })
        .then((response) => response.text())
        .then((data) => console.log("Go server responded:", data))
        .catch((error) => console.error("Error contacting Go server:", error));
    });

    return true;
  }
});
