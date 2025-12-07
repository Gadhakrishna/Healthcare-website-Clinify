(function () {

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburgerBtn');

  const bellBtn = document.getElementById('bellBtn');
  const notifBox = document.getElementById('notifBox');

  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  /* ---------------- Sidebar ---------------- */
  function setSidebarMode() {
    if (window.innerWidth <= 768) {
      sidebar.classList.add("offcanvas");
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
    } else {
      sidebar.classList.remove("offcanvas");
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
    }
  }

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("visible");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
  }

  if (hamburger) {
    hamburger.addEventListener("click", openSidebar);
  }
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  /* ---------------- Notifications ---------------- */
  function toggleNotif() {
    const display = notifBox.style.display === "block";
    notifBox.style.display = display ? "none" : "block";
  }

  bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNotif();
  });

  /* ---------------- Profile Dropdown ---------------- */
  profileBtn.style.cursor = "pointer";

  function toggleProfile() {
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  }

  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleProfile();
  });

  /* Close menus when clicking outside */
  document.addEventListener("click", () => {
    notifBox.style.display = "none";
    profileDropdown.style.display = "none";
  });

  /* Resize Handler */
  window.addEventListener("resize", setSidebarMode);

  setSidebarMode();

})();
