/* pres.js — prescriptions page logic
   - stores prescriptions in localStorage for demo
   - search, filter, upload (local), download (blob), refill request
*/

(function () {
  const ACTIVE_KEY = 'clinify_prescriptions_v1';

  // DOM
  const activeList = document.getElementById('activeList');
  const pastList = document.getElementById('pastList');
  const activeCountEl = document.getElementById('activeCount');
  const searchInput = document.getElementById('searchInput');
  const filterSelect = document.getElementById('filterSelect');
  const clearSearchBtn = document.getElementById('clearSearch');
  const uploadFile = document.getElementById('uploadFile');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadDoctor = document.getElementById('uploadDoctor');

  const filterActiveBtn = document.getElementById('filterActiveBtn');
  const filterExpiredBtn = document.getElementById('filterExpiredBtn');
  const filterAllBtn = document.getElementById('filterAllBtn');

  // sample demo data (only used when no saved data)
  const SAMPLE = [
    {
      id: genId(),
      title: 'Amoxicillin 500mg',
      doctor: 'Dr. Reed',
      date: '2025-07-10',
      notes: 'Take one capsule thrice daily for 7 days',
      status: 'active',
      fileName: null
    },
    {
      id: genId(),
      title: 'Loratadine 10mg',
      doctor: 'Dr. Patel',
      date: '2024-12-02',
      notes: 'Once daily for allergy',
      status: 'expired',
      fileName: null
    }
  ];

  // helpers
  function genId() {
    return 'p_' + Math.random().toString(36).slice(2,9);
  }

  function readStorage() {
    try {
      const raw = localStorage.getItem(ACTIVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeStorage(arr) {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(arr));
  }

  function initData() {
    let data = readStorage();
    if (!data) {
      data = SAMPLE.slice();
      writeStorage(data);
    }
    return data;
  }

  // render
  function renderAll() {
    const all = initData();
    const q = (searchInput.value || '').trim().toLowerCase();
    const filter = (filterSelect.value || 'all');

    const filtered = all.filter(p => {
      if (filter === 'active' && p.status !== 'active') return false;
      if (filter === 'expired' && p.status !== 'expired') return false;
      if (!q) return true;
      return (p.title + ' ' + p.doctor + ' ' + (p.notes || '')).toLowerCase().includes(q);
    });

    // clear
    activeList.innerHTML = '';
    pastList.innerHTML = '';

    const active = filtered.filter(p => p.status === 'active');
    const expired = filtered.filter(p => p.status === 'expired');

    active.forEach(p => {
      activeList.appendChild(makeCard(p));
    });
    expired.forEach(p => {
      pastList.appendChild(makeCard(p));
    });

    activeCountEl.textContent = `(${active.length})`;
  }

  function makeCard(p) {
    const wrap = document.createElement('div');
    wrap.className = 'pres-card';
    const left = document.createElement('div'); left.className = 'pres-left';
    const right = document.createElement('div'); right.className = 'pres-actions';

    const title = document.createElement('div');
    title.innerHTML = `<strong>${escapeHtml(p.title)}</strong>`;
    const meta = document.createElement('div');
    meta.className = 'pres-meta';
    meta.innerHTML = `${p.doctor ? escapeHtml(p.doctor) + ' • ' : ''}${p.date} • ${p.status}`;

    const notes = document.createElement('div');
    notes.className = 'small muted';
    notes.textContent = p.notes || '';

    left.appendChild(title);
    left.appendChild(meta);
    left.appendChild(notes);

    // actions: download, refill, mark expired/activate, details
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn ghost';
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => downloadPrescription(p));

    const refillBtn = document.createElement('button');
    refillBtn.className = 'btn primary';
    refillBtn.textContent = 'Refill';
    refillBtn.addEventListener('click', () => requestRefill(p));

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn ghost';
    toggleBtn.textContent = p.status === 'active' ? 'Mark Expired' : 'Mark Active';
    toggleBtn.addEventListener('click', () => toggleStatus(p));

    right.appendChild(downloadBtn);
    right.appendChild(refillBtn);
    right.appendChild(toggleBtn);

    // optional doctor info small
    const infoBtn = document.createElement('button');
    infoBtn.className = 'btn ghost';
    infoBtn.textContent = 'Doctor';
    infoBtn.addEventListener('click', () => {
      alert(`Doctor: ${p.doctor || 'Unknown'}\nNotes: ${p.notes || '—'}`);
    });
    right.appendChild(infoBtn);

    wrap.appendChild(left);
    wrap.appendChild(right);

    return wrap;
  }

  // actions
  function downloadPrescription(p) {
    // if original file uploaded and stored name exists, just simulate download
    const blobContent = `Prescription: ${p.title}\nDoctor: ${p.doctor}\nDate: ${p.date}\nNotes: ${p.notes}\nStatus: ${p.status}`;
    const blob = new Blob([blobContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = (p.fileName ? p.fileName : `${p.title.replace(/\s+/g,'_')}.txt`);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function requestRefill(p) {
    // mark as 'refill requested' (for demo, we just show an alert + push notification)
    alert(`Refill request sent for "${p.title}". Clinic will contact you.`);
    // show small temporary notif in notifBox
    const notifBox = document.getElementById('notifBox');
    if (notifBox) {
      // append item
      const item = document.createElement('div');
      item.className = 'notif-item';
      item.innerHTML = `<p>Refill requested: ${escapeHtml(p.title)}</p><span>Now</span>`;
      notifBox.appendChild(item);
    }
  }

  function toggleStatus(p) {
    const all = initData();
    const idx = all.findIndex(x => x.id === p.id);
    if (idx === -1) return;
    all[idx].status = all[idx].status === 'active' ? 'expired' : 'active';
    writeStorage(all);
    renderAll();
  }

  // upload handler
  uploadBtn.addEventListener('click', () => {
    const file = uploadFile.files[0];
    if (!file) {
      alert('Please choose a file to upload.');
      return;
    }
    const doctor = uploadDoctor.value || 'Unknown';
    const newItem = {
      id: genId(),
      title: file.name.split('.').slice(0,-1).join('.') || file.name,
      doctor: doctor,
      date: (new Date()).toISOString().slice(0,10),
      notes: 'Uploaded prescription',
      status: 'active',
      fileName: file.name
    };

    const all = initData();
    all.unshift(newItem);
    writeStorage(all);
    renderAll();

    // optional: store file in IndexedDB or server — for demo we do not persist the file binary
    alert('Uploaded (demo): ' + file.name);
    uploadFile.value = '';
    uploadDoctor.value = '';
  });

  // search & filters
  searchInput.addEventListener('input', debounce(renderAll, 250));
  filterSelect.addEventListener('change', renderAll);
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterSelect.value = 'all';
    renderAll();
  });

  filterActiveBtn.addEventListener('click', () => { filterSelect.value = 'active'; renderAll(); });
  filterExpiredBtn.addEventListener('click', () => { filterSelect.value = 'expired'; renderAll(); });
  filterAllBtn.addEventListener('click', () => { filterSelect.value = 'all'; renderAll(); });

  // utils
  function debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
    });
  }

  // initialize UI
  renderAll();

})();
