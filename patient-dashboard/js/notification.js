// notification.js — full notifications center logic (list, filters, read/unread, badge)
// Uses localStorage to persist state (demo-only).

(function () {
  const STORAGE_KEY = 'clinify_notifications_v1';

  // Elements
  const tabsContainer   = document.getElementById('notifTabs');
  const listContainer   = document.getElementById('notifList');
  const markAllReadBtn  = document.getElementById('markAllReadBtn');
  const clearAllBtn     = document.getElementById('clearAllBtn');
  const summaryEl       = document.getElementById('notifSummary');
  const badgeEl         = document.getElementById('notifCount');

  // Default seed notifications
  const DEFAULT_NOTIFS = [
    {
      id: 1,
      type: 'appointment',
      title: 'Appointment confirmed',
      message: 'Your appointment with Dr. Tello on Apr 20, 10:30 AM is confirmed.',
      time: '10 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'report',
      title: 'New lab report available',
      message: 'Your blood test report is now ready for download.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'prescription',
      title: 'Prescription updated',
      message: 'Dr. Reed updated your medication dosage.',
      time: 'Yesterday',
      read: true
    },
    {
      id: 4,
      type: 'system',
      title: 'New login detected',
      message: 'We noticed a login from a new Chrome browser on Windows.',
      time: '2 days ago',
      read: false
    },
    {
      id: 5,
      type: 'appointment',
      title: 'Teleconsult reminder',
      message: 'Your telemedicine call starts in 30 minutes.',
      time: '3 days ago',
      read: true
    },
    {
      id: 6,
      type: 'report',
      title: 'Imaging results added',
      message: 'Your chest X-ray report was added to Medical Records.',
      time: 'Last week',
      read: true
    }
  ];

  // helpers
  function loadNotifications() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_NOTIFS.slice();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return DEFAULT_NOTIFS.slice();
      return parsed;
    } catch (e) {
      return DEFAULT_NOTIFS.slice();
    }
  }

  function saveNotifications(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  let notifications = loadNotifications();
  let currentFilter = 'all';

  // --- Rendering ---
  function render() {
    // Filter
    const items = notifications.filter(n => {
      if (currentFilter === 'all') return true;
      return n.type === currentFilter;
    });

    // Clear list
    listContainer.innerHTML = '';

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'small muted';
      empty.style.padding = '6px 2px';
      empty.textContent = 'No notifications in this category.';
      listContainer.appendChild(empty);
    } else {
      items.forEach(n => {
        const row = document.createElement('div');
        row.className = `notif-row ${n.read ? 'read' : 'unread'} type-${n.type}`;
        row.dataset.id = n.id;

        // colored strip
        const strip = document.createElement('div');
        strip.className = 'notif-strip';

        // icon bubble
        const iconWrap = document.createElement('div');
        iconWrap.className = 'notif-icon-wrap';

        const iconSpan = document.createElement('span');
        iconSpan.textContent = iconForType(n.type);
        iconWrap.appendChild(iconSpan);

        // middle content
        const content = document.createElement('div');
        content.className = 'notif-content';

        const titleRow = document.createElement('div');
        titleRow.className = 'notif-title-row';

        const title = document.createElement('div');
        title.className = 'notif-title';
        title.textContent = n.title;

        const rightMeta = document.createElement('div');
        rightMeta.style.display = 'flex';
        rightMeta.style.alignItems = 'center';

        const time = document.createElement('div');
        time.className = 'notif-time';
        time.textContent = n.time;

        rightMeta.appendChild(time);

        if (!n.read) {
          const dot = document.createElement('div');
          dot.className = 'unread-dot';
          rightMeta.appendChild(dot);
        }

        titleRow.appendChild(title);
        titleRow.appendChild(rightMeta);

        const msg = document.createElement('div');
        msg.className = 'notif-message';
        msg.textContent = n.message;

        content.appendChild(titleRow);
        content.appendChild(msg);

        row.appendChild(strip);
        row.appendChild(iconWrap);
        row.appendChild(content);

        // click to toggle read/unread
        row.addEventListener('click', () => toggleRead(n.id));

        listContainer.appendChild(row);
      });
    }

    // Update summary + badge
    updateSummaryAndBadge();
  }

  function iconForType(type) {
    switch (type) {
      case 'appointment':   return '🩺';
      case 'report':        return '📄';
      case 'prescription':  return '💊';
      case 'system':        return '⚠';
      default:              return 'ℹ';
    }
  }

  function updateSummaryAndBadge() {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;

    summaryEl.textContent = `You have ${unread} unread of ${total} total notifications.`;

    if (badgeEl) {
      badgeEl.textContent = unread > 0 ? String(unread) : '';
    }
  }

  // --- Actions ---
  function setFilter(filter) {
    currentFilter = filter;
    // update tab active class
    const tabs = tabsContainer.querySelectorAll('.tab');
    tabs.forEach(btn => {
      const f = btn.getAttribute('data-filter');
      btn.classList.toggle('active', f === currentFilter);
    });
    render();
  }

  function toggleRead(id) {
    notifications = notifications.map(n => {
      if (n.id === id) {
        return Object.assign({}, n, { read: !n.read });
      }
      return n;
    });
    saveNotifications(notifications);
    render();
  }

  function markAllRead() {
    notifications = notifications.map(n => Object.assign({}, n, { read: true }));
    saveNotifications(notifications);
    render();
  }

  function clearAll() {
    if (!notifications.length) return;
    const ok = confirm('Clear all notifications? (Demo: this only clears local data)');
    if (!ok) return;
    notifications = [];
    saveNotifications(notifications);
    render();
  }

  // --- Event bindings ---

  // filter tabs
  tabsContainer.addEventListener('click', function (e) {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    const f = btn.getAttribute('data-filter') || 'all';
    setFilter(f);
  });

  // buttons
  markAllReadBtn.addEventListener('click', markAllRead);
  clearAllBtn.addEventListener('click', clearAll);

  // --- Init ---
  render();
  setFilter('all'); // ensures active styling

})();
