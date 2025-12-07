// settings.js — page-specific logic for Settings
// Stores values in localStorage (demo only, no real backend)

(function () {
  const STORAGE_KEY = 'clinify_settings_v1';

  // Elements
  const accountForm     = document.getElementById('accountForm');
  const accName         = document.getElementById('accName');
  const accEmail        = document.getElementById('accEmail');
  const accPhone        = document.getElementById('accPhone');
  const accTimezone     = document.getElementById('accTimezone');
  const accountSaveMsg  = document.getElementById('accountSaveMsg');

  const passwordForm    = document.getElementById('passwordForm');
  const currentPassword = document.getElementById('currentPassword');
  const newPassword     = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  const passwordMsg     = document.getElementById('passwordMsg');

  const deleteAccountBtn= document.getElementById('deleteAccountBtn');

  const notifAppt       = document.getElementById('notifAppt');
  const notifLab        = document.getElementById('notifLab');
  const notifPromo      = document.getElementById('notifPromo');

  const privacyAnonymised = document.getElementById('privacyAnonymised');
  const privacyRecord     = document.getElementById('privacyRecord');
  const privacyRemember   = document.getElementById('privacyRemember');

  const langSelect      = document.getElementById('langSelect');
  const logoutAllBtn    = document.getElementById('logoutAllBtn');
  const sessionInfo     = document.getElementById('sessionInfo');

  // Default settings
  const DEFAULT_SETTINGS = {
    account: {
      name: 'Natalie Hughes',
      email: 'natalie.hughes.ny@gmail.com',
      phone: '+1 (646) 953-7814',
    },
    notifications: {
      appt: true,
      lab: true,
      promo: false
    },
    privacy: {
      anonymised: false,
      record: true,
      remember: false
    },
    language: 'en',
    lastLogoutAll: null
  };

  function readSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      // merge with defaults to avoid missing keys
      return {
        account: Object.assign({}, DEFAULT_SETTINGS.account, parsed.account || {}),
        notifications: Object.assign({}, DEFAULT_SETTINGS.notifications, parsed.notifications || {}),
        privacy: Object.assign({}, DEFAULT_SETTINGS.privacy, parsed.privacy || {}),
        language: parsed.language || DEFAULT_SETTINGS.language,
        lastLogoutAll: parsed.lastLogoutAll || null
      };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  let settings = readSettings();

  // Render values to UI
  function render() {
    // account
    accName.value     = settings.account.name;
    accEmail.value    = settings.account.email;
    accPhone.value    = settings.account.phone;
    accTimezone.value = settings.account.timezone;

    // notifications
    notifAppt.checked  = settings.notifications.appt;
    notifLab.checked   = settings.notifications.lab;
    notifPromo.checked = settings.notifications.promo;

    // privacy
    privacyAnonymised.checked = settings.privacy.anonymised;
    privacyRecord.checked     = settings.privacy.record;
    privacyRemember.checked   = settings.privacy.remember;

    // language
    langSelect.value = settings.language;

    // sessions
    if (settings.lastLogoutAll) {
      sessionInfo.textContent = `Last "logout all" at ${settings.lastLogoutAll}`;
    } else {
      sessionInfo.textContent = 'Logged in on this device.';
    }
  }

  // Account form submit
  accountForm.addEventListener('submit', function (e) {
    e.preventDefault();
    accountSaveMsg.textContent = '';

    if (!accName.value.trim() || !accEmail.value.trim()) {
      accountSaveMsg.textContent = 'Name and email are required.';
      return;
    }

    settings.account.name     = accName.value.trim();
    settings.account.email    = accEmail.value.trim();
    settings.account.phone    = accPhone.value.trim();
    settings.account.timezone = accTimezone.value;

    saveSettings(settings);
    accountSaveMsg.textContent = 'Saved.';
  });

  // Change password form (simple validation)
  passwordForm.addEventListener('submit', function (e) {
    e.preventDefault();
    passwordMsg.textContent = '';

    const curr = currentPassword.value;
    const nw   = newPassword.value;
    const conf = confirmPassword.value;

    if (!curr || !nw || !conf) {
      passwordMsg.textContent = 'All fields are required.';
      return;
    }

    if (nw.length < 8) {
      passwordMsg.textContent = 'New password must be at least 8 characters.';
      return;
    }

    if (nw !== conf) {
      passwordMsg.textContent = 'New passwords do not match.';
      return;
    }

    // Demo: no real backend, just show success
    passwordMsg.textContent = 'Password updated (demo only).';

    // Clear fields
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  });

  // Danger: delete account (demo)
  deleteAccountBtn.addEventListener('click', function () {
    const sure = confirm('Are you sure you want to delete your Clinify account?\nThis is a demo and will only clear local data.');
    if (!sure) return;

    // Clear relevant localStorage keys (demo)
    localStorage.removeItem(STORAGE_KEY);
    // You could also remove other demo keys like clinify_profile_v1, clinify_policies_v1 etc.:
    // localStorage.removeItem('clinify_profile_v1');

    settings = DEFAULT_SETTINGS;
    saveSettings(settings);
    render();
    alert('Local account data cleared (demo). For real deletion, backend is required.');
  });

  // Notification toggles
  notifAppt.addEventListener('change', () => {
    settings.notifications.appt = notifAppt.checked;
    saveSettings(settings);
  });
  notifLab.addEventListener('change', () => {
    settings.notifications.lab = notifLab.checked;
    saveSettings(settings);
  });
  notifPromo.addEventListener('change', () => {
    settings.notifications.promo = notifPromo.checked;
    saveSettings(settings);
  });

  // Privacy toggles
  privacyAnonymised.addEventListener('change', () => {
    settings.privacy.anonymised = privacyAnonymised.checked;
    saveSettings(settings);
  });
  privacyRecord.addEventListener('change', () => {
    settings.privacy.record = privacyRecord.checked;
    saveSettings(settings);
  });
  privacyRemember.addEventListener('change', () => {
    settings.privacy.remember = privacyRemember.checked;
    saveSettings(settings);
  });



  // Logout all devices (demo)
  logoutAllBtn.addEventListener('click', () => {
    const now = new Date();
    const ts = now.toLocaleString();
    settings.lastLogoutAll = ts;
    saveSettings(settings);
    render();
    alert('All sessions will be logged out (demo only, no real backend).');
  });

  // Init
  render();

})();
