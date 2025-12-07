// profile.js — page-specific logic for My Profile
// - Edit/save basic profile (localStorage)
// - Update age tag & blood tag
// - Change avatar preview (client-side only)
// - Save emergency contact
// - Toggle preferences (localStorage)

(function () {
  const STORAGE_KEY = 'clinify_profile_v1';

  // elements
  const nameInput      = document.getElementById('nameInput');
  const genderInput    = document.getElementById('genderInput');
  const dobInput       = document.getElementById('dobInput');
  const heightInput    = document.getElementById('heightInput');
  const weightInput    = document.getElementById('weightInput');
  const bloodInput     = document.getElementById('bloodInput');
  const allergyInput   = document.getElementById('allergyInput');

  const emailInput     = document.getElementById('emailInput');
  const phoneInput     = document.getElementById('phoneInput');
  const addressInput   = document.getElementById('addressInput');

  const emNameInput    = document.getElementById('emNameInput');
  const emRelationInput= document.getElementById('emRelationInput');
  const emPhoneInput   = document.getElementById('emPhoneInput');

  const editBtn        = document.getElementById('editProfileBtn');
  const saveEmergencyBtn = document.getElementById('saveEmergencyBtn');

  const avatarImg      = document.getElementById('profileAvatar');
  const avatarInput    = document.getElementById('avatarInput');
  const changeAvatarBtn= document.getElementById('changeAvatarBtn');

  const prefReminders  = document.getElementById('prefReminders');
  const prefShare      = document.getElementById('prefShare');
  const prefTips       = document.getElementById('prefTips');

  const ageTag         = document.getElementById('ageTag');
  const bloodTag       = document.getElementById('bloodTag');

  // default profile
  const DEFAULT_PROFILE = {
    name: 'Natalie Hughes',
    gender: 'Female',
    dob: '2001-01-01',
    height: 173,
    weight: 50,
    blood: 'O+',
    allergy: 'None',
    email: 'natalie.hughes.ny@gmail.com',
    phone: '+1 (646) 953-7814',
    address: '198 East 24th Street, Apt 3F, New York, NY 10010',
    emergency: {
      name: 'Sara Hughes',
      relation: 'Sister',
      phone: '+1 (332) 280-4471'
    },
    prefs: {
      reminders: true,
      share: true,
      tips: false
    },
    avatarDataUrl: null
  };

  function readProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PROFILE;
      return Object.assign({}, DEFAULT_PROFILE, JSON.parse(raw));
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  }

  function saveProfile(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  let profile = readProfile();

  // render into inputs
  function renderProfile() {
    nameInput.value      = profile.name;
    genderInput.value    = profile.gender;
    dobInput.value       = profile.dob;
    heightInput.value    = profile.height;
    weightInput.value    = profile.weight;
    bloodInput.value     = profile.blood;
    allergyInput.value   = profile.allergy;
    emailInput.value     = profile.email;
    phoneInput.value     = profile.phone;
    addressInput.value   = profile.address;

    emNameInput.value    = profile.emergency.name;
    emRelationInput.value= profile.emergency.relation;
    emPhoneInput.value   = profile.emergency.phone;

    prefReminders.checked = profile.prefs.reminders;
    prefShare.checked     = profile.prefs.share;
    prefTips.checked      = profile.prefs.tips;

    if (profile.avatarDataUrl) {
      avatarImg.src = profile.avatarDataUrl;
    }

    updateTagsFromProfile();
  }

  function updateTagsFromProfile() {
    // age from dob
    const age = calcAge(profile.dob);
    ageTag.textContent = `${age} yrs`;
    bloodTag.textContent = `Blood: ${profile.blood}`;
  }

  function calcAge(dobStr) {
    if (!dobStr) return '—';
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return '—';
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  // toggle edit mode
  let isEditing = false;
  editBtn.addEventListener('click', () => {
    isEditing = !isEditing;
    setEditing(isEditing);
    if (!isEditing) {
      // save current values
      profile.name     = nameInput.value.trim() || profile.name;
      profile.gender   = genderInput.value;
      profile.dob      = dobInput.value || profile.dob;
      profile.height   = Number(heightInput.value || profile.height);
      profile.weight   = Number(weightInput.value || profile.weight);
      profile.blood    = bloodInput.value.trim() || profile.blood;
      profile.allergy  = allergyInput.value.trim();

      profile.email    = emailInput.value.trim();
      profile.phone    = phoneInput.value.trim();
      profile.address  = addressInput.value.trim();

      saveProfile(profile);
      updateTagsFromProfile();
      alert('Profile saved (demo, local only).');
    }
  });

  function setEditing(on) {
    const disabled = !on;
    [nameInput, genderInput, dobInput, heightInput, weightInput, bloodInput, allergyInput,
     emailInput, phoneInput, addressInput].forEach(el => {
      el.disabled = disabled;
    });

    editBtn.textContent = on ? 'Save' : 'Edit';
  }

  // emergency contact save
  saveEmergencyBtn.addEventListener('click', () => {
    profile.emergency.name     = emNameInput.value.trim();
    profile.emergency.relation = emRelationInput.value.trim();
    profile.emergency.phone    = emPhoneInput.value.trim();
    saveProfile(profile);
    alert('Emergency contact saved (demo).');
  });

  // avatar change (preview only)
  changeAvatarBtn.addEventListener('click', () => {
    avatarInput.click();
  });

  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      avatarImg.src = dataUrl;
      profile.avatarDataUrl = dataUrl;
      saveProfile(profile);
    };
    reader.readAsDataURL(file);
  });

  // preferences toggles
  prefReminders.addEventListener('change', () => {
    profile.prefs.reminders = prefReminders.checked;
    saveProfile(profile);
  });
  prefShare.addEventListener('change', () => {
    profile.prefs.share = prefShare.checked;
    saveProfile(profile);
  });
  prefTips.addEventListener('change', () => {
    profile.prefs.tips = prefTips.checked;
    saveProfile(profile);
  });

  // init
  renderProfile();
  setEditing(false);

})();
