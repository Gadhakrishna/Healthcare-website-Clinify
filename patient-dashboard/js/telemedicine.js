/* --------------------------------------------------
   TELEMEDICINE — PAGE SPECIFIC JS
   (Navbar, sidebar, dropdown logic is in /js/script.js)
--------------------------------------------------*/

// Start Video Call
const videoBtn = document.getElementById("joinVideoBtn");
if (videoBtn) {
  videoBtn.addEventListener("click", () => {
    alert("Connecting to your video consultation...");
  });
}

// Start Chat Button
const chatBtn = document.getElementById("chatBtn");
if (chatBtn) {
  chatBtn.addEventListener("click", () => {
    alert("Opening chat with doctor...");
  });
}
