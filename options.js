// Saves options to chrome.storage
function save_options() {
  const contactName = document.getElementById("contactName").value;
  const port = document.getElementById("port").value;

  chrome.storage.local.set(
    {
      contactName: contactName,
      port: port,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 1000);
    },
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default values: 'You' for name, '3000' for port
  chrome.storage.local.get(
    {
      contactName: "You",
      port: "3000",
    },
    function (items) {
      document.getElementById("contactName").value = items.contactName;
      document.getElementById("port").value = items.port;
    },
  );
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
