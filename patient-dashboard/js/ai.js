/* ai.js — page-specific behavior for AI Symptom Checker */

/*
  Safe, simple client-side logic:
  - Simulated "AI" matching with keyword heuristics
  - Loading animation for 900ms
  - Store recent checks in sessionStorage (client-only)
  - RESULTS ARE INFORMATIVE ONLY (not a diagnosis)
*/

(function () {
  const form = document.getElementById('aiForm');
  const resultsSection = document.getElementById('aiResults');
  const resultsContent = document.getElementById('resultsContent');
  const clearBtn = document.getElementById('clearAI');
  const recentChecksContainer = document.getElementById('recentChecks');

  // simple keyword -> suggestions map (kept generic & safe)
  const KB = [
    { keys: ['fever','temperature','hot'], label: 'Fever or infection', suggestions: ['Possible causes include viral or bacterial infection. Monitor temperature and stay hydrated.'] },
    { keys: ['cough','sore throat','throat'], label: 'Respiratory irritation', suggestions: ['Could be viral upper respiratory infection or allergies. Warm fluids and rest may help.'] },
    { keys: ['headache','migraine','head'], label: 'Headache', suggestions: ['Common causes: tension, dehydration, viral infection. Rest, hydration, OTC pain relief if appropriate.'] },
    { keys: ['stomach','abdominal','nausea','vomit'], label: 'Gastrointestinal symptoms', suggestions: ['May be from a viral gastroenteritis, food-related issue, or other causes. Stay hydrated and avoid heavy foods.'] },
    { keys: ['chest','pressure','breath','breathing'], label: 'Chest / breathing symptom', suggestions: ['Chest pain or difficulty breathing can be serious. Seek medical attention urgently if severe or sudden.'] },
    { keys: ['rash','itch','skin'], label: 'Skin issue', suggestions: ['Could be allergic reaction, dermatitis, or infection. Keep area clean; seek care if spreading or severe.'] },
    { keys: ['joint','knee','pain in joint','swelling'], label: 'Musculoskeletal', suggestions: ['May be overuse, injury, or inflammation. Rest and evaluate; seek care if severe swelling or inability to move.'] }
  ];

  function safeMatch(symptomsText) {
    const s = symptomsText.toLowerCase();
    const found = [];
    KB.forEach(entry => {
      for (const k of entry.keys) {
        if (s.includes(k)) {
          found.push(entry);
          break;
        }
      }
    });
    return found;
  }

  function renderResults(symptoms, bodyPart, duration, severity, matches) {
    resultsContent.innerHTML = ''; // clear
    const header = document.createElement('div');
    header.className = 'small muted';
    header.textContent = `You reported: "${symptoms}" • Area: ${bodyPart} • Duration: ${duration} • Severity: ${severity}/10`;
    resultsContent.appendChild(header);

    // If no matches, show general suggestions
    if (matches.length === 0) {
      const block = document.createElement('div');
      block.className = 'result-block';
      block.innerHTML = `<h4>General suggestions</h4>
        <div>Could not identify a close match from keywords. Consider monitoring symptoms, staying hydrated and resting. If symptoms worsen or you are concerned, contact a healthcare professional.</div>`;
      resultsContent.appendChild(block);
    } else {
      matches.forEach(m => {
        const block = document.createElement('div');
        block.className = 'result-block';
        block.innerHTML = `<h4>Possible: ${m.label}</h4>
          <div>${m.suggestions[0]}</div>`;
        resultsContent.appendChild(block);
      });
    }

    // Add next-steps block with safety guidance
    const steps = document.createElement('div');
    steps.className = 'result-block';
    steps.innerHTML = `<h4>Recommended next steps</h4>
      <ul>
        <li>If symptoms are <strong>mild</strong> (low severity) — monitor, rest, hydrate, consider OTC remedies as appropriate.</li>
        <li>If symptoms are <strong>moderate to severe</strong> (severity ≥ 7) or include any of: chest pain, severe shortness of breath, fainting, severe bleeding — seek immediate medical care.</li>
        <li>Consider booking a teleconsult or in-person appointment if symptoms persist > 3 days or worsen.</li>
      </ul>`;
    resultsContent.appendChild(steps);

    // show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function saveRecent(symptoms) {
    try {
      const key = 'clinify_recent_checks_v1';
      const raw = sessionStorage.getItem(key);
      let arr = raw ? JSON.parse(raw) : [];
      arr.unshift({ t: new Date().toISOString(), q: symptoms });
      if (arr.length > 6) arr = arr.slice(0,6);
      sessionStorage.setItem(key, JSON.stringify(arr));
      renderRecent();
    } catch (e) {
      // sessionStorage may be unavailable — ignore
    }
  }

  function renderRecent() {
    const key = 'clinify_recent_checks_v1';
    const raw = sessionStorage.getItem(key);
    let arr = raw ? JSON.parse(raw) : [];
    recentChecksContainer.innerHTML = '';
    if (!arr || arr.length === 0) {
      recentChecksContainer.innerHTML = '<div class="item"><div>No recent checks</div></div>';
      return;
    }
    arr.forEach(item => {
      const d = new Date(item.t);
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div>${item.q}</div><div class="small muted">${d.toLocaleString()}</div>`;
      recentChecksContainer.appendChild(el);
    });
  }

  // Loading simulation + run match
  function runAnalysis(symptoms, bodyPart, duration, severity) {
    resultsSection.style.display = 'block';
    resultsContent.innerHTML = '<div class="result-block"><div>Analyzing symptoms…</div></div>';
    // simulate slight delay
    setTimeout(() => {
      const matches = safeMatch(symptoms);
      renderResults(symptoms, bodyPart, duration, severity, matches);
      saveRecent(symptoms);
    }, 900);
  }

  // form submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const symptoms = (document.getElementById('symptoms').value || '').trim();
    const bodyPart = document.getElementById('bodyPart').value;
    const duration = document.getElementById('duration').value;
    const severity = document.getElementById('severity').value;

    if (!symptoms) {
      alert('Please describe your symptoms (e.g. "headache, fever").');
      document.getElementById('symptoms').focus();
      return;
    }

    runAnalysis(symptoms, bodyPart, duration, severity);
  });

  clearBtn.addEventListener('click', function () {
    form.reset();
    resultsSection.style.display = 'none';
    resultsContent.innerHTML = '';
  });

  // initialize recent
  renderRecent();

})();
