// Important: this structure might change at any time, of course.

let contactNameToMatch = "Max Mustermann"; // Default value

// Load the custom name from storage
chrome.storage.local.get({ contactName: "You" }, function (items) {
  contactNameToMatch = items.contactName;
  console.log(`Will look for contact name: "${contactNameToMatch}"`);
  initialSetup(); // Start observer only after settings are loaded
});

function simulateClick(element) {
  const eventOptions = { bubbles: true, cancelable: true, view: window };

  element.dispatchEvent(new MouseEvent("mousedown", eventOptions));
  element.dispatchEvent(new MouseEvent("mouseup", eventOptions));
  element.dispatchEvent(new MouseEvent("click", eventOptions));
}

// --- FUNCTION TO FOCUS THE CHAT ---
function autoFocusChat() {
  const chat = document.querySelector(`span[title="${contactNameToMatch}"]`);
  if (chat) {
    simulateClick(chat);
  } else {
    console.warn(
      "Could not find chat to self. Get a name that is easier to find!",
    );
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("Tab is no longer visible, running auto-focus.");
    autoFocusChat();
  }
});

function isChatWithSelf() {
  return Array.from(document.querySelectorAll("header"))
    .map((h) => h.innerText.startsWith(contactNameToMatch))
    .some((v) => v);
}

function attachChatObserver(chatPanel) {
  // Use a data attribute to prevent attaching multiple observers to the same element
  if (chatPanel.dataset.chatObserverAttached) {
    return;
  }
  console.log("Attaching chat observer to", chatPanel);
  chatPanel.dataset.chatObserverAttached = "true";

  const observer = new MutationObserver((mutationsList) => {
    if (!isChatWithSelf()) return;

    const addedMessages = [];
    for (const mutation of mutationsList) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1 && node.querySelector(".message-out")) {
          addedMessages.push(node);
        }
      }
    }

    if (addedMessages.length > 0) {
      const lastMessageNode = addedMessages[addedMessages.length - 1];
      const messageText = lastMessageNode.querySelector(
        ".copyable-text span",
      )?.textContent;
      if (messageText && !messageText.startsWith("skip")) {
        console.log("Detected final message to self:", messageText);
        chrome.runtime.sendMessage({
          action: "triggerLocalhost",
          message: "- [ ] " + messageText,
        });
      }
    }
  });

  observer.observe(chatPanel, { childList: true, subtree: true });
}

function initialSetup() {
  const mainPanel = document.querySelector("div#main");

  if (!mainPanel) {
    // If the panel isn't ready, retry in a second.
    setTimeout(initialSetup, 1000);
    return;
  }

  console.log("Chat panel found. Running initial setup.");

  // 1. Attach the primary observer for the first time.
  attachChatObserver(mainPanel);

  // 2. Run the autofocus on initial load.
  autoFocusChat();

  // 3. Start a periodic "health check" to ensure the observer stays alive.
  setInterval(() => {
    const currentPanel = document.querySelector("div#main");
    // If the panel exists but our marker is gone, it means WhatsApp replaced it.
    if (currentPanel && !currentPanel.dataset.chatObserverAttached) {
      console.log(
        "Chat panel seems to have been replaced. Re-attaching observer...",
      );
      attachChatObserver(currentPanel);
    }
  }, 5000); // Check every 5 seconds.
}
