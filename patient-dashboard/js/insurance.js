/* insu.js — page logic for Insurance portal (client-only demo)
   - policies & claims stored in localStorage for demo persistence
   - upload doc (metadata only), premium calc, add member, quick renew simulation
*/

(function () {
  const POL_KEY = 'clinify_policies_v1';
  const CLAIM_KEY = 'clinify_claims_v1';
  const MEM_KEY = 'clinify_members_v1';

  // DOM
  const policiesList = document.getElementById('policiesList');
  const claimsList = document.getElementById('claimsList');
  const membersList = document.getElementById('membersList');
  const idCardContainer = document.getElementById('idCardContainer');
  const addPolicyBtn = document.getElementById('addPolicyBtn');
  const uploadFile = document.getElementById('docFile');
  const uploadPolicyDocBtn = document.getElementById('uploadPolicyDocBtn');
  const newClaimBtn = document.getElementById('newClaimBtn');
  const quickRenewBtn = document.getElementById('quickRenewBtn');
  const addNomineeBtn = document.getElementById('addNomineeBtn');
  const linkMemberBtn = document.getElementById('linkMemberBtn');
  const supportChatBtn = document.getElementById('supportChatBtn');

  const calcBtn = document.getElementById('calcPremiumBtn');
  const sumInsuredEl = document.getElementById('sumInsured');
  const ageEl = document.getElementById('calcAge');
  const termEl = document.getElementById('policyTerm');
  const premiumResult = document.getElementById('premiumResult');

  // sample data
  function samplePolicies() {
    return [
      {
        id: 'pol1',
        provider: 'HealthShield Plus',
        policyNo: 'HSP-198237',
        sumInsured: 1000000,
        start: '2024-05-01',
        end: '2025-05-01',
        status: 'active',
        docName: null
      },
      {
        id: 'pol2',
        provider: 'SafeCare Family',
        policyNo: 'SCF-55421',
        sumInsured: 500000,
        start: '2022-03-15',
        end: '2023-03-15',
        status: 'expired',
        docName: null
      }
    ];
  }

  function sampleClaims() {
    return [
      { id: 'c1', title: 'Hospitalisation - Appendix', date: '2024-11-10', amount: 45000, status: 'settled' },
      { id: 'c2', title: 'OPD Consultation', date: '2025-01-12', amount: 1200, status: 'processing' }
    ];
  }

  function sampleMembers() {
    return [
      { id: 'm1', name: 'Natalie Hughes', relation: 'Self' },
      { id: 'm2', name: 'Sara Hughes', relation: 'Sister' }
    ];
  }

  // storage helpers
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // render functions
  function renderPolicies() {
    const list = read(POL_KEY, samplePolicies());
    policiesList.innerHTML = '';
    list.forEach(p => {
      const el = document.createElement('div');
      el.className = 'item policy-card';
      el.innerHTML = `<div class="policy-left">
                        <div><strong>${escapeHtml(p.provider)}</strong></div>
                        <div class="policy-meta">Policy No: ${escapeHtml(p.policyNo)} • ₹${formatNumber(p.sumInsured)}</div>
                        <div class="policy-meta">Period: ${p.start} → ${p.end} • ${p.status}</div>
                      </div>
                      <div class="policy-actions">
                        <button class="btn ghost" data-id="${p.id}" data-action="view">View</button>
                        <button class="btn ghost" data-id="${p.id}" data-action="download">Download</button>
                        <button class="btn primary" data-id="${p.id}" data-action="renew">Renew</button>
                      </div>`;
      policiesList.appendChild(el);
    });
  }

  function renderClaims() {
    const list = read(CLAIM_KEY, sampleClaims());
    claimsList.innerHTML = '';
    list.forEach(c => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div><strong>${escapeHtml(c.title)}</strong><div class="small muted">${c.date} • ₹${formatNumber(c.amount)}</div></div>
                      <div class="small muted">${c.status}</div>`;
      claimsList.appendChild(el);
    });
  }

  function renderMembers() {
    const list = read(MEM_KEY, sampleMembers());
    membersList.innerHTML = '';
    list.forEach(m => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div>${escapeHtml(m.name)} <div class="small muted">${escapeHtml(m.relation)}</div></div>
                      <div><button class="btn ghost small" data-id="${m.id}" data-action="remove">Remove</button></div>`;
      membersList.appendChild(el);
    });
  }

  function renderIdCard() {
    const list = read(POL_KEY, samplePolicies());
    // show first active policy id card if exists
    const active = list.find(p => p.status === 'active');
    idCardContainer.innerHTML = '';
    if (!active) {
      idCardContainer.innerHTML = '<div class="small muted">No active policy</div>';
      return;
    }
    const card = document.createElement('div');
    card.className = 'id-preview';
    card.innerHTML = `<div style="font-weight:700">${escapeHtml(active.provider)}</div>
                      <div style="font-size:12px;margin-top:6px">${escapeHtml(active.policyNo)}</div>`;
    const btn = document.createElement('div');
    btn.innerHTML = `<button class="btn ghost" data-id="${active.id}" id="viewIdBtn">View</button>`;
    idCardContainer.appendChild(card);
    idCardContainer.appendChild(btn);

    document.getElementById('viewIdBtn')?.addEventListener('click', () => {
      alert(`Policy ID: ${active.policyNo}\nProvider: ${active.provider}\nPeriod: ${active.start} → ${active.end}`);
    });
  }

  // event handling
  addPolicyBtn.addEventListener('click', () => {
    const provider = prompt('Provider name (e.g. HealthShield Plus):');
    if (!provider) return;
    const policyNo = prompt('Policy number:');
    if (!policyNo) return;
    const sum = prompt('Sum insured (number):','1000000');
    const start = new Date().toISOString().slice(0,10);
    const end = new Date(new Date().setFullYear(new Date().getFullYear()+1)).toISOString().slice(0,10);
    const newPol = { id: 'pol_' + Math.random().toString(36).slice(2,9), provider, policyNo, sumInsured: Number(sum||100000), start, end, status: 'active', docName: null};
    const list = read(POL_KEY, samplePolicies());
    list.unshift(newPol);
    write(POL_KEY, list);
    renderPolicies();
    renderIdCard();
    alert('Policy added (demo).');
  });

  // upload file
  uploadFile.addEventListener('change', () => {
    const f = uploadFile.files[0];
    if (!f) return;
    const list = read(POL_KEY, samplePolicies());
    // attach to first active policy for demo
    const idx = list.findIndex(p => p.status === 'active');
    if (idx === -1) {
      alert('No active policy to attach document. Add a policy first.');
      uploadFile.value = '';
      return;
    }
    list[idx].docName = f.name;
    write(POL_KEY, list);
    uploadFile.value = '';
    renderPolicies();
    alert('Document metadata saved (demo).');
  });

  // claim submission
  newClaimBtn.addEventListener('click', () => {
    const title = prompt('Claim title (brief):');
    if (!title) return;
    const amount = prompt('Amount (numeric):','0');
    const list = read(CLAIM_KEY, sampleClaims());
    list.unshift({ id: 'c_' + Math.random().toString(36).slice(2,9), title, date: new Date().toISOString().slice(0,10), amount: Number(amount||0), status: 'processing' });
    write(CLAIM_KEY, list);
    renderClaims();
    alert('Claim submitted (demo).');
  });

  // quick renew
  quickRenewBtn.addEventListener('click', () => {
    const list = read(POL_KEY, samplePolicies());
    const act = list.find(p => p.status === 'active') || list[0];
    if (!act) { alert('No policy found to renew'); return; }
    // simulate renewal: extend end by 1 year
    act.end = new Date(new Date(act.end).setFullYear(new Date(act.end).getFullYear()+1)).toISOString().slice(0,10);
    write(POL_KEY, list);
    renderPolicies();
    alert(`Policy ${act.policyNo} renewed (demo).`);
  });

  // add nominee (modal simulation)
  addNomineeBtn.addEventListener('click', () => {
    const name = prompt('Nominee name:');
    if (!name) return;
    const relation = prompt('Relation:','Spouse');
    const members = read(MEM_KEY, sampleMembers());
    members.unshift({ id: 'm_' + Math.random().toString(36).slice(2,9), name, relation });
    write(MEM_KEY, members);
    renderMembers();
    alert('Nominee added (demo).');
  });

  // link family member
  linkMemberBtn.addEventListener('click', () => {
    const name = prompt('Member name to link:');
    if (!name) return;
    const relation = prompt('Relation:','Child');
    const members = read(MEM_KEY, sampleMembers());
    members.unshift({ id: 'm_' + Math.random().toString(36).slice(2,9), name, relation });
    write(MEM_KEY, members);
    renderMembers();
    alert('Family member linked (demo).');
  });

  // support chat placeholder
  supportChatBtn.addEventListener('click', () => {
    alert('Support chat: This is a demo placeholder. Implement real chat backend to enable messaging.');
  });

  // member remove (delegated)
  membersList.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if (action === 'remove') {
      let members = read(MEM_KEY, sampleMembers());
      members = members.filter(m => m.id !== id);
      write(MEM_KEY, members);
      renderMembers();
    }
  });

  // policy actions (delegated)
  policiesList.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    let list = read(POL_KEY, samplePolicies());
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return;
    const pol = list[idx];
    if (action === 'view') {
      alert(`Policy: ${pol.policyNo}\nProvider: ${pol.provider}\nSum Insured: ₹${formatNumber(pol.sumInsured)}\nPeriod: ${pol.start} → ${pol.end}\nStatus: ${pol.status}`);
    } else if (action === 'download') {
      // simulate download
      const blob = new Blob([`Policy ${pol.policyNo}\nProvider: ${pol.provider}\nSum: ${pol.sumInsured}`], {type:'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${pol.policyNo}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } else if (action === 'renew') {
      pol.end = new Date(new Date(pol.end).setFullYear(new Date(pol.end).getFullYear()+1)).toISOString().slice(0,10);
      write(POL_KEY, list);
      renderPolicies();
      alert('Policy renewed (demo).');
    }
  });

  // premium calculator
  calcBtn.addEventListener('click', () => {
    const sum = Number(sumInsuredEl.value || 1000000);
    const age = Number(ageEl.value || 30);
    const term = Number(termEl.value || 1);

    // simple demo algorithm (not real pricing)
    // baseRate = 0.6% of sum insured yearly, + age factor, - small discount for longer term
    let base = sum * 0.006;
    const ageFactor = (Math.max(0, age - 30) * 0.001) * sum; // increases with age
    const termDiscount = term >= 2 ? 0.05 : 0;
    let yearly = base + ageFactor;
    yearly = yearly * (1 - termDiscount);
    const monthly = Math.round((yearly / 12));
    premiumResult.textContent = `≈ ₹${formatNumber(Math.round(yearly))}/yr • ₹${formatNumber(monthly)}/mo`;
  });

  // init render
  renderPolicies();
  renderClaims();
  renderMembers();
  renderIdCard();

  // helpers
  function escapeHtml(s) { if (!s) return ''; return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }
  function formatNumber(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

})();
