// Important: this structure might change at any time, of course.

let contactNameToMatch = "Max Mustermann"; // Default value

// Load the custom name from storage
chrome.storage.local.get({ contactName: "You" }, function (items) {
  contactNameToMatch = items.contactName;
  console.log(`Will look for contact name: "${contactNameToMatch}"`);
  observeChat(); // Start observer only after settings are loaded
});

function isChatWithSelf() {
  return Array.from(document.querySelectorAll("header"))
    .map((h) => h.innerText.startsWith(contactNameToMatch))
    .some((v) => v);
}

const observeChat = () => {
  const chatPanel = document.querySelector("div#main");
  if (!chatPanel) {
    setTimeout(observeChat, 1000);
    return;
  }

  const observer = new MutationObserver((mutationsList) => {
    // Only proceed if the chat is with yourself to avoid unnecessary work
    if (!isChatWithSelf()) {
      return;
    }

    const addedMessages = [];

    // 1. Collect all valid outgoing message nodes from the batch of mutations
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.querySelector(".message-out")) {
            addedMessages.push(node);
          }
        });
      }
    }

    // 2. If any messages were found, process only the VERY LAST one
    if (addedMessages.length > 0) {
      const lastMessageNode = addedMessages[addedMessages.length - 1];
      const messageText = lastMessageNode.querySelector(
        ".copyable-text span",
      )?.textContent;

      if (messageText && !messageText.startsWith("skip")) {
        console.log("Detected final message to self:", messageText);
        chrome.runtime.sendMessage({
          action: "triggerLocalhost",
          message: messageText,
        });
      }
    }
  });

  observer.observe(chatPanel, { childList: true, subtree: true });
};
