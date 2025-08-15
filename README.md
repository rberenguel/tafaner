# Tafaner

A simple Chrome extension and Go server that captures messages you send to yourself on WhatsApp Web and appends them to a local text file.

> [!NOTE]
> My usecase is sending tasks to myself, with this they go to my Obsidian inbox automatically.

## Overview

This project provides a straightforward way to use WhatsApp as a quick note-to-self tool. It works in two parts:

1.  **A Chrome Extension**: This extension injects a script into WhatsApp Web. It monitors the chat DOM and, when it detects a message sent to your configured contact name (i.e., yourself), it sends the message content to a local server. When you leave Whatsapp Web it tries to make sure the chat with yourself is "focused" so it sees it properly.
2.  **A Go Server**: A lightweight, standalone HTTP server that listens for `POST` requests from the extension. Upon receiving a message, it appends the text to a specified file, creating a running log or note file.

The contact name and server port are configurable via the extension's options page.

If the message starts with the word _skip_ it will be ignored. Useful for long messages you did not intend to have as tasks.

_Caveat_: This can potentially generate a lot of duplicates in your destination file, because knowing what has been sent and what not is not something I want to worry about for now (it would be just a matter of checking the destination file, but I don't want to have to bother yet).

## Setup and Usage

### 1. Run the Go Server

Navigate to the project directory in your terminal and run the server. Use the `-port` and `-file` flags to configure its behavior.

```sh
# Run the server on port 3000 and append messages to ./notes.txt
go run server.go -port=3000 -file=./notes.txt
```

The server will start and log that it is listening for requests on the specified address.

---

### 2. Load the Chrome Extension

1.  Open Chrome and navigate to the extensions page: `chrome://extensions`.
2.  Enable **Developer mode** using the toggle in the top-right corner.
3.  Click the **Load unpacked** button.
4.  Select the project directory containing the `manifest.json` file.

The extension icon will now appear in your Chrome toolbar.

---

### 3. Configure the Extension

1.  **Right-click** the extension icon in the toolbar and select **"Options"**.
2.  Set the **Contact Name** to match the name displayed in WhatsApp Web for your own contact (this is often "You" by default).
3.  Set the **Localhost Port** to the same port your Go server is running on (e.g., `3000`).
4.  Click **Save**.

The system is now active. Any message you send to yourself in WhatsApp Web will be instantly appended to the file specified when you launched the Go server.
