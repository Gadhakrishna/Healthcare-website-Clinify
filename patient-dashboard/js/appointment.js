// appointment.js — page-specific JS (sidebar, dropdowns, data + interactions)

(function () {
  // DOM
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburgerBtn');

  const bellBtn = document.getElementById('bellBtn');
  const notifBox = document.getElementById('notifBox');

  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  const bookForm = document.getElementById('bookForm');
  const clearBtn = document.getElementById('clearBtn');

  // sample appointment data (client-side demo)
  let appointments = [
    {
      id: 'a1',
      datetime: '2025-04-12 10:30',
      label: 'Apr 12 • 10:30 AM',
      doctor: 'Dr. Tello',
      specialty: 'Psycologist',
      mode: 'In-person',
      status: 'upcoming'
    },
    {
      id: 'a2',
      datetime: '2025-04-20 16:00',
      label: 'Apr 20 • 4:00 PM',
      doctor: 'Dr. Reed',
      specialty: 'General',
      mode: 'Teleconsult',
      status: 'upcoming'
    }
  ];

  let past = [
    { id: 'p1', label: 'Mar 28 — Video Call', note:'Completed' },
    { id: 'p2', label: 'Mar 12 — Screening', note:'Normal' },
    { id: 'p3', label: 'Feb 02 — Checkup', note:'Reports Ready' }
  ];

  // --- RENDERING helpers ---
  function renderLists() {
    const upEl = document.getElementById('upcomingList');
    const pastEl = document.getElementById('pastList');
    const upcomingCount = document.getElementById('upcomingCount');
    const completedCount = document.getElementById('completedCount');
    const cancelledCount = document.getElementById('cancelledCount');

    // upcoming
    upEl.innerHTML = '';
    appointments.forEach(ap => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div>
          <div style="font-weight:700">${ap.label}</div>
          <div class="small muted">${ap.doctor} • ${ap.specialty} • ${ap.mode}</div>
        </div>
        <div style="text-align:right">
          <button class="btn ghost btn-reschedule" data-id="${ap.id}">Reschedule</button>
          <button class="btn primary btn-cancel" data-id="${ap.id}" style="margin-top:6px">Cancel</button>
          ${ap.mode.toLowerCase().includes('tele') ? '<button class="btn primary btn-join" data-id="'+ap.id+'" style="margin-top:6px">Join</button>' : ''}
        </div>
      `;
      upEl.appendChild(item);
    });

    // past
    pastEl.innerHTML = '';
    past.forEach(pp => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `<div>${pp.label}</div><div class="small muted">${pp.note || ''}</div>`;
      pastEl.appendChild(item);
    });

    // counts
    upcomingCount.textContent = appointments.length;
    completedCount.textContent = past.length;
    // cancelledCount is demo static for now
    cancelledCount.textContent = 1;
  }

  // --- SIDEBAR OFFCANVAS handling ---
  function setSidebarMode() {
    if (!sidebar) return;
    if (window.innerWidth <= 860) {
      sidebar.classList.add('offcanvas');
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      if (hamburger) hamburger.setAttribute('aria-expanded','false');
    } else {
      sidebar.classList.remove('offcanvas');
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      if (hamburger) hamburger.setAttribute('aria-expanded','false');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }
  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    if (hamburger) hamburger.setAttribute('aria-expanded','true');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    closeNotif();
    closeProfile();
  }
  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    if (hamburger) hamburger.setAttribute('aria-expanded','false');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  // --- Notifications ---
  function openNotif() {
    if (!notifBox) return;
    notifBox.style.display = 'block';
    notifBox.setAttribute('aria-hidden','false');
    if (bellBtn) bellBtn.setAttribute('aria-expanded','true');
    closeProfile();
  }
  function closeNotif() {
    if (!notifBox) return;
    notifBox.style.display = 'none';
    notifBox.setAttribute('aria-hidden','true');
    if (bellBtn) bellBtn.setAttribute('aria-expanded','false');
  }
  function toggleNotif() {
    if (!notifBox) return;
    const isVisible = notifBox.style.display === 'block';
    if (isVisible) closeNotif(); else openNotif();
  }

  // --- Profile dropdown ---
  function openProfile() {
    if (!profileDropdown) return;
    profileDropdown.style.display = 'block';
    profileDropdown.setAttribute('aria-hidden','false');
    if (profileBtn) profileBtn.setAttribute('aria-expanded','true');
    closeNotif();
  }
  function closeProfile() {
    if (!profileDropdown) return;
    profileDropdown.style.display = 'none';
    profileDropdown.setAttribute('aria-hidden','true');
    if (profileBtn) profileBtn.setAttribute('aria-expanded','false');
  }
  function toggleProfile() {
    if (!profileDropdown) return;
    const isVisible = profileDropdown.style.display === 'block';
    if (isVisible) closeProfile(); else openProfile();
  }

  // --- Appointment actions (UI-only) ---
  function reschedulePrompt(id) {
    const ap = appointments.find(x => x.id === id);
    if (!ap) return;
    const newVal = prompt('Enter new date & time (e.g. 2025-04-15 10:00):', ap.datetime);
    if (newVal) {
      ap.datetime = newVal;
      ap.label = newVal.replace(' ', ' • ');
      alert('Reschedule request sent for ' + newVal);
      renderLists();
    }
  }
  function cancelConfirm(id) {
    const ap = appointments.find(x => x.id === id);
    if (!ap) return;
    if (confirm('Cancel appointment on ' + ap.label + ' ?')) {
      // remove from appointments and add to past as cancelled note (demo)
      appointments = appointments.filter(x => x.id !== id);
      past.unshift({ id: 'p' + Date.now(), label: ap.label + ' — Cancelled', note: 'Cancelled' });
      alert('Appointment cancelled.');
      renderLists();
    }
  }
  function joinTele(id) {
    const ap = appointments.find(x => x.id === id);
    if (!ap) return alert('No tele appointment found.');
    alert('Opening teleconsult for ' + ap.label + ' ... (demo)');
  }

  // --- Booking form handlers ---
  function submitBooking(e) {
    e && e.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const doctorEl = document.getElementById('doctor');
    const visitTypeEl = document.getElementById('visitType');

    if (!date || !time) {
      alert('Please choose date and time.');
      return;
    }

    const newId = 'a' + Date.now();
    const label = new Date(date + 'T' + time).toLocaleString('en-US', { month: 'short', day: 'numeric' }) + ' • ' + formatTime(time);
    const newAp = {
      id: newId,
      datetime: date + ' ' + time,
      label: label,
      doctor: doctorEl.options[doctorEl.selectedIndex].text,
      specialty: doctorEl.options[doctorEl.selectedIndex].text.split(' — ').pop() || '',
      mode: visitTypeEl.value === 'tele' ? 'Teleconsult' : 'In-person',
      status: 'upcoming'
    };
    appointments.push(newAp);
    alert('Booking request submitted for ' + label);
    bookForm.reset();
    renderLists();
    // scroll to upcoming
    document.getElementById('upcomingPanel').scrollIntoView({ behavior:'smooth' });
  }
  function clearBooking() {
    if (bookForm) bookForm.reset();
  }

  // UTIL: format time HH:MM -> h:mm AM/PM
  function formatTime(t) {
    const [hh, mm] = t.split(':');
    let h = parseInt(hh,10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = (h % 12) || 12;
    return h + ':' + mm + ' ' + ampm;
  }

  // --- Events binding ---
  if (hamburger) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
    });
    hamburger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hamburger.click(); }
    });
  }
  if (overlay) overlay.addEventListener('click', function () { closeSidebar(); });

  if (bellBtn) {
    bellBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleNotif(); });
    bellBtn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleNotif(); }});
  }
  if (profileBtn) {
    profileBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleProfile(); });
    profileBtn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleProfile(); }});
  }

  // close when clicking outside
  document.addEventListener('click', function (e) {
    const t = e.target;
    if (notifBox && !notifBox.contains(t) && bellBtn && !bellBtn.contains(t)) closeNotif();
    if (profileDropdown && !profileDropdown.contains(t) && profileBtn && !profileBtn.contains(t)) closeProfile();
  });

  // ESC closes
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeNotif(); closeProfile(); closeSidebar(); }
  });

  // form handlers
  if (bookForm) bookForm.addEventListener('submit', submitBooking);
  if (clearBtn) clearBtn.addEventListener('click', clearBooking);

  // dynamic delegated handlers for appointment buttons
  document.addEventListener('click', function (e) {
    const target = e.target;
    if (target.matches('.btn-reschedule')) {
      const id = target.getAttribute('data-id'); reschedulePrompt(id);
    } else if (target.matches('.btn-cancel')) {
      const id = target.getAttribute('data-id'); cancelConfirm(id);
    } else if (target.matches('.btn-join')) {
      const id = target.getAttribute('data-id'); joinTele(id);
    }
  });

  // attach handler to resize
  window.addEventListener('resize', function () { setSidebarMode(); closeNotif(); closeProfile(); });

  // init
  setSidebarMode();
  renderLists();
  closeNotif();
  closeProfile();

})();
