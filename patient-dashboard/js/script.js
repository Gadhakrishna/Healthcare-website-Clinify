// script.js (full)
(function () {
  // Elements
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburgerBtn');

  const bellBtn = document.getElementById('bellBtn');
  const notifBox = document.getElementById('notifBox');

  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  // --- Sidebar (mobile) helpers ---
  function setSidebarMode() {
    if (!sidebar) return;
    if (window.innerWidth <= 860) {
      sidebar.classList.add('offcanvas');
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    } else {
      sidebar.classList.remove('offcanvas');
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden', 'false');
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    sidebar.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    // close other panels
    closeNotif();
    closeProfile();
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    sidebar.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  // --- Notifications ---
  function toggleNotif() {
    if (!notifBox) return;
    const isVisible = notifBox.style.display === 'block';
    if (isVisible) closeNotif();
    else openNotif();
  }
  function openNotif() {
    if (!notifBox) return;
    notifBox.style.display = 'block';
    notifBox.setAttribute('aria-hidden', 'false');
    if (bellBtn) bellBtn.setAttribute('aria-expanded', 'true');
    // close others
    closeProfile();
  }
  function closeNotif() {
    if (!notifBox) return;
    notifBox.style.display = 'none';
    notifBox.setAttribute('aria-hidden', 'true');
    if (bellBtn) bellBtn.setAttribute('aria-expanded', 'false');
  }

  // --- Profile dropdown ---
  function toggleProfile() {
    if (!profileDropdown) return;
    const isVisible = profileDropdown.style.display === 'block';
    if (isVisible) closeProfile();
    else openProfile();
  }
  function openProfile() {
    if (!profileDropdown) return;
    profileDropdown.style.display = 'block';
    profileDropdown.setAttribute('aria-hidden', 'false');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'true');
    // close others
    closeNotif();
  }
  function closeProfile() {
    if (!profileDropdown) return;
    profileDropdown.style.display = 'none';
    profileDropdown.setAttribute('aria-hidden', 'true');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
  }

  // --- Event bindings ---

  // hamburger
  if (hamburger) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = sidebar.classList.contains('open');
      if (isOpen) closeSidebar();
      else openSidebar();
    });
    // keyboard
    hamburger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) closeSidebar();
        else openSidebar();
      }
    });
  }

  // overlay closes sidebar
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // notif toggle
  if (bellBtn) {
    bellBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleNotif();
    });
    bellBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleNotif();
      }
    });
  }

  // profile toggle
  if (profileBtn) {
    profileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleProfile();
    });
    profileBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleProfile();
      }
    });
  }

  // logout action (placeholder)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      // replace with real logout logic
      alert('Logging out...');
      // window.location.href = '/logout';
    });
  }

  // close dropdowns if clicked outside
  document.addEventListener('click', function (e) {
    const target = e.target;
    if (notifBox && !notifBox.contains(target) && bellBtn && !bellBtn.contains(target)) {
      closeNotif();
    }
    if (profileDropdown && !profileDropdown.contains(target) && profileBtn && !profileBtn.contains(target)) {
      closeProfile();
    }
  });

  // close on Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeNotif();
      closeProfile();
      closeSidebar();
    }
  });

  // close profile or notif when resizing to desktop/mobile to avoid stale states
  window.addEventListener('resize', function () {
    setSidebarMode();
    closeNotif();
    closeProfile();
  });

  // close sidebar links on mobile
  if (sidebar) {
    const links = sidebar.querySelectorAll('a');
    links.forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 860) closeSidebar();
      });
    });
  }

  // init
  setSidebarMode();
  closeNotif();
  closeProfile();
})();
