

const BACKEND_URL = "https://ai-farmer-advisor-1.onrender.com";

//  Tab Switching
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.getElementById('panel-advice').style.display = tab === 'advice' ? 'block' : 'none';
  document.getElementById('panel-yield').style.display  = tab === 'yield'  ? 'block' : 'none';

  // Re-trigger animation
  const panel = document.getElementById('panel-' + tab);
  panel.style.animation = 'none';
  panel.offsetHeight; // reflow
  panel.style.animation = '';
}

// Show/hide result states
function showState(prefix, state) {
  ['idle', 'loading', 'content'].forEach(s => {
    const el = document.getElementById(prefix + '-' + s);
    if (el) el.style.display = s === state ? (s === 'content' ? 'flex' : 'block') : 'none';
  });
}

// Copy Advice 
function copyAdvice() {
  const text = document.getElementById('advice_result').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    const original = btn.textContent;
    btn.textContent = ' Copied!';
    btn.style.borderColor = 'var(--sage)';
    btn.style.color = 'var(--sage)';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2000);
  });
}

// Generate AI Advice
async function generateAdvice() {
  const name     = document.getElementById("name")?.value?.trim();
  const crop     = document.getElementById("crop")?.value?.trim();
  const soil     = document.getElementById("soil")?.value?.trim();
  const weather  = document.getElementById("weather")?.value?.trim();
  const language = document.getElementById("language")?.value;

  if (!crop || !soil || !weather) {
    shakeCard('advice');
    return;
  }

  const btn = document.getElementById("adviceBtn");
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Generating…';
  showState('advice', 'loading');

  if (name) localStorage.setItem("farmerName", name);

  try {
    const response = await fetch(`${BACKEND_URL}/advice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop, soil, weather, language })
    });

    const data = await response.json();
    localStorage.setItem("advice", data.advice);

    // Populate result
    document.getElementById('result-crop-name').textContent = crop + ' · ' + soil;
    document.getElementById('advice_result').innerText = data.advice;
    showState('advice', 'content');

  } catch (err) {
    console.error(err);
    showState('advice', 'idle');
    showToast('Could not connect to AI service. Please try again.');
  }

  btn.disabled = false;
  btn.querySelector('.btn-text').textContent = 'Get AI Advice';
}

// ── Predict Yield ──
async function predictYield() {
  const area        = document.getElementById("area")?.value;
  const crop        = document.getElementById("crop_prediction")?.value;
  const year        = document.getElementById("year")?.value;
  const rainfall    = document.getElementById("rainfall")?.value;
  const pesticide   = document.getElementById("pesticide")?.value;
  const temperature = document.getElementById("temperature")?.value;

  if (!year || !rainfall || !pesticide || !temperature) {
    shakeCard('yield');
    return;
  }

  const btn = document.getElementById("predictBtn");
  btn.disabled = true;
  btn.querySelector('.btn-text').textContent = 'Predicting…';
  showState('yield', 'loading');

  try {
    const response = await fetch(`${BACKEND_URL}/predict-yield`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        area,
        crop,
        Year: parseInt(year),
        rainfall: parseFloat(rainfall),
        pesticide: parseFloat(pesticide),
        temperature: parseFloat(temperature)
      })
    });

    const data = await response.json();

    if (data.predicted_yield !== undefined) {
      const yieldVal = data.predicted_yield;
      document.getElementById('result-yield-crop').textContent = crop + ' · ' + area;
      document.getElementById('yield_number').textContent = yieldVal.toLocaleString('en-IN', { maximumFractionDigits: 1 });
      document.getElementById('yield_result').textContent =
        `Predicted for ${year} with ${rainfall}mm rainfall and ${temperature}°C avg temperature.`;

      showState('yield', 'content');

      // Animate bar (cap at 50,000 hg/ha for scale)
      setTimeout(() => {
        const pct = Math.min((yieldVal / 50000) * 100, 100);
        document.getElementById('yield-bar').style.width = pct + '%';
      }, 100);

    } else {
      showState('yield', 'idle');
      showToast(' Prediction failed: ' + (data.error || 'Unknown error'));
    }

  } catch (err) {
    console.error(err);
    showState('yield', 'idle');
    showToast(' Could not connect to prediction service.');
  }

  btn.disabled = false;
  btn.querySelector('.btn-text').textContent = 'Predict Yield';
}

// ── Shake animation for empty fields ──
function shakeCard(prefix) {
  const card = document.querySelector(`#panel-${prefix} .form-card`);
  card.style.animation = 'shake 0.4s ease';
  setTimeout(() => card.style.animation = '', 400);

  // Add shake keyframes if not already present
  if (!document.querySelector('#shake-style')) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.textContent = `
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%      { transform: translateX(-8px); }
        40%      { transform: translateX(8px); }
        60%      { transform: translateX(-6px); }
        80%      { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);
  }
}

// ── Toast Notification ──
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: rgba(14,31,20,0.95); border: 1px solid rgba(255,255,255,0.15);
      color: #f5f0e8; padding: 14px 24px; border-radius: 12px; font-size: 14px;
      backdrop-filter: blur(12px); z-index: 999; opacity: 0;
      transition: all 0.3s ease; white-space: nowrap; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      font-family: 'DM Sans', sans-serif;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3500);
}
