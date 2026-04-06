// ─── NAV SCROLL
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if(nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── MOBILE MENU
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if(menu) menu.classList.toggle('open');
}

// ─── REVEAL ON SCROLL
const revealEls = document.querySelectorAll('.reveal');
if(revealEls.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
}

// ─── SERVICE FILTER
function filterSvc(cat, btn) {
  document.querySelectorAll('.svc-tab').forEach(t => t.classList.remove('active'));
  if(btn) btn.classList.add('active');
  document.querySelectorAll('.svc-card').forEach(c => {
    c.style.display = (cat === 'todos' || c.dataset.cat === cat) ? 'block' : 'none';
  });
}

// ─── BOOKING OPTIONS
function selectOpt(el) {
  const parent = el.closest('.booking-options');
  if(parent) {
    parent.querySelectorAll('.booking-opt').forEach(o => o.classList.remove('selected'));
  }
  el.classList.add('selected');
}

// ─── MINI CALENDAR
let calYear = 2026, calMonth = 3; // April
const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function renderCal(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const titleEl = container.querySelector('.calTitle');
  const gridEl = container.querySelector('.calGrid');
  if (!titleEl || !gridEl) return;
  
  titleEl.textContent = monthNames[calMonth] + ' ' + calYear;
  const days = ['L','M','X','J','V','S','D'];
  const first = new Date(calYear, calMonth, 1).getDay();
  const total = new Date(calYear, calMonth+1, 0).getDate();
  const offset = (first === 0 ? 6 : first - 1);
  let html = days.map(d => `<div class="cal-day-name">${d}</div>`).join('');
  for (let i = 0; i < offset; i++) html += `<div class="cal-day empty">·</div>`;
  for (let d = 1; d <= total; d++) {
    const isToday = d === 1 && calMonth === 3 && calYear === 2026;
    const avail = [2,3,5,8,9,10,12,15,16,17,19,22,23,24,26].includes(d);
    html += `<div class="cal-day ${isToday?'today':''} ${avail?'available':''}" onclick="selectDay(this,${d})">${d}</div>`;
  }
  gridEl.innerHTML = html;
}

function changeMonth(dir, containerId) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCal(containerId);
}

function selectDay(el, d) {
  const parent = el.closest('.cal-grid');
  if(parent) {
    parent.querySelectorAll('.cal-day').forEach(x => x.classList.remove('selected'));
  }
  el.classList.add('selected');
}

function selectTime(el) {
  const parent = el.closest('.time-slots');
  if(parent) {
    parent.querySelectorAll('.time-slot').forEach(x => x.classList.remove('selected'));
  }
  el.classList.add('selected');
}

// ─── INITIALIZATION ON LOAD
document.addEventListener('DOMContentLoaded', () => {
  renderCal('cal-mini-clases');
  renderCal('cal-mini-campos');
  
  // Prompt for Gemini AI Key if not set
  if(!localStorage.getItem('teetime_gemini_key') && document.getElementById('chatMessages')) {
      const msgs = document.getElementById('chatMessages');
      if(msgs) {
         const div = document.createElement('div');
         div.className = 'msg bot';
         div.innerHTML = '<div class="msg-bubble" style="background:#fdf4d8; border: 1px solid #f9d57b; border-radius:14px;">⚠️ <b>Integración IA Gemini conectada.</b><br>Para usar el bot, escribe o pega primero tu <b>API Key de Gemini</b> (empieza por "AIza...").</div>';
         msgs.appendChild(div);
      }
  }

  // Premium Unlock Verification
  const overlay = document.getElementById('premiumOverlay');
  if (overlay) {
    if(localStorage.getItem('teetime_premium') === 'true') {
        overlay.style.display = 'none';
    }
  }
});

// ─── STATS PREMIUM
function promptPremium() {
    alert('🔐 Redirigiendo a pasarela de pago segura...\n\n(Simulación completada. ¡Enhorabuena, ahora eres usuario PRO de TeeTime!)');
    localStorage.setItem('teetime_premium', 'true');
    const overlay = document.getElementById('premiumOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 500);
    }
}

function closePremium() {
    const overlay = document.getElementById('premiumOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 500);
    }
}

function saveStats() {
    alert('✅ Estadísticas guardadas y sincronizadas correctamente en TeeTime Cloud.');
    if(document.getElementById('inpGolpes')) document.getElementById('inpGolpes').value = '';
    if(document.getElementById('inpPutts')) document.getElementById('inpPutts').value = '';
    if(document.getElementById('inpCalles')) document.getElementById('inpCalles').value = '';
    if(document.getElementById('inpGIR')) document.getElementById('inpGIR').value = '';
}

// ─── FILTER CAMPOS
function filterCampos() {
  const select = document.getElementById('filtroComunidad');
  if(!select) return;
  const val = select.value;
  const opts = document.querySelectorAll('#camposList .booking-opt');
  opts.forEach(opt => {
    if (val === 'todas' || opt.dataset.comunidad === val) {
      opt.style.display = 'flex';
    } else {
      opt.style.display = 'none';
      opt.classList.remove('selected');
    }
  });
  
  // auto-select first visible
  const visible = Array.from(opts).find(o => o.style.display !== 'none');
  if(visible) {
      opts.forEach(o => o.classList.remove('selected'));
      visible.classList.add('selected');
  }
}

// ─── CONFIRM BOOKING
function confirmBooking() {
  const widget = document.getElementById('cal-mini-clases') ? document.getElementById('cal-mini-clases').closest('.booking-widget') : null;
  if(!widget) return;
  const name = widget.querySelector('input[type="text"]').value;
  const email = widget.querySelector('input[type="email"]').value;
  const tecnicoSelect = widget.querySelector('#tecnicoSelect');
  const tecnico = tecnicoSelect ? tecnicoSelect.options[tecnicoSelect.selectedIndex].text : 'Cualquiera';
  
  const selectedDay = widget.querySelector('.cal-day.selected');
  const selectedTime = widget.querySelector('.time-slot.selected');
  const selectedOpt = widget.querySelector('.booking-left .booking-opt.selected .booking-opt-name');
  
  if (!name.trim() || !email.trim() || !selectedDay || !selectedTime) {
    alert('Por favor, rellena nombre, email, y selecciona fecha y hora.');
    return;
  }
  const svName = selectedOpt ? selectedOpt.textContent : 'Clase';
  alert(`✅ ¡Reserva confirmada!\n\nServicio: ${svName}\nTécnico: ${tecnico}\nNombre: ${name}\nFecha: ${selectedDay.textContent} ${monthNames[calMonth]} ${calYear}\nHora: ${selectedTime.textContent}\n\nRecibirás confirmación en ${email}`);
}

function confirmCampo() {
  const widget = document.getElementById('cal-mini-campos') ? document.getElementById('cal-mini-campos').closest('.booking-widget') : null;
  if(!widget) return;
  const players = widget.querySelector('#campo-jugadores').value;
  const lic = widget.querySelector('input[type="text"]').value;
  const selectedDay = widget.querySelector('.cal-day.selected');
  const selectedTime = widget.querySelector('.time-slot.selected');
  const selectedOpt = widget.querySelector('.booking-left .booking-opt.selected .booking-opt-name');
  
  if (!selectedDay || !selectedTime) {
    alert('Por favor, selecciona fecha y hora de salida en el calendario.');
    return;
  }
  
  const campoName = selectedOpt ? selectedOpt.textContent : 'Campo de Golf';
  
  alert(`⛳ ¡Reserva de Green Fee confirmada!\n\nCampo: ${campoName}\nJugadores: ${players}\nLicencia: ${lic || 'Pendiente'}\nFecha: ${selectedDay.textContent} ${monthNames[calMonth]} ${calYear}\nHora de Salida: ${selectedTime.textContent}\n\n¡Buen juego!`);
}

// ─── CHATBOT (GEMINI AI INTEGRATION)
let geminiApiKey = localStorage.getItem('teetime_gemini_key') || '';
let chatHistory = [
  { role: 'user', parts: [{ text: 'Eres un experto asistente virtual de la plataforma española de golf llamada TeeTime. Responde de forma muy amigable, directa y profesional. Usa algún emoji ocasionalmente. Tu objetivo es ayudar al usuario con su juego, material, o a buscar campos en España.' }]},
  { role: 'model', parts: [{ text: '¡Entendido! Estoy listo e ilusionado por ayudar a los jugadores.' }]}
];

function toggleChat() {
  const panel = document.getElementById('chatPanel');
  if(panel) panel.classList.toggle('open');
}

function sendSugg(btn) {
  const text = btn.textContent;
  document.getElementById('chatSugg').style.display = 'none';
  processUserMessage(text);
}

function sendChat() {
  const input = document.getElementById('chatInput');
  if(!input) return;
  const text = input.value.trim();
  if (!text) return;
  
  // Auth flow
  if (!geminiApiKey && text.startsWith('AIza')) {
    geminiApiKey = text;
    localStorage.setItem('teetime_gemini_key', geminiApiKey);
    input.value = '';
    addMsg('bot', '✅ <b>API Key configurada.</b> ¡Cerebro funcional!');
    return;
  } else if (!geminiApiKey && !text.startsWith('AIza')) {
    addMsg('user', text);
    input.value = '';
    setTimeout(() => {
        addMsg('bot', 'Por favor, <b>pega aquí tu API Key de Gemini</b> (comienza por "AIza..."):');
    }, 500);
    return;
  }

  processUserMessage(text);
}

async function processUserMessage(text) {
  const input = document.getElementById('chatInput');
  if(input) input.value = '';
  const sugg = document.getElementById('chatSugg');
  if(sugg) sugg.style.display = 'none';
  
  addMsg('user', text);
  chatHistory.push({ role: 'user', parts: [{ text: text }] });
  
  const msgs = document.getElementById('chatMessages');
  const typingId = 'typing-' + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.className = `msg bot typing`;
  typingDiv.id = typingId;
  typingDiv.innerHTML = `<div class="msg-bubble" style="opacity:0.7"><i>Escribiendo inteligente...</i></div>`;
  msgs.appendChild(typingDiv);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: chatHistory })
    });
    
    // Remove typing
    const tDiv = document.getElementById(typingId);
    if(tDiv) msgs.removeChild(tDiv);
    
    if(!response.ok) {
        throw new Error('API Reject');
    }
    
    const data = await response.json();
    if (data.candidates && data.candidates[0].content) {
      const botText = data.candidates[0].content.parts[0].text;
      addMsg('bot', botText);
      chatHistory.push({ role: 'model', parts: [{ text: botText }] });
    } else {
      addMsg('bot', 'Lo siento, no pude entender la petición.');
    }
  } catch (err) {
    const tDiv = document.getElementById(typingId);
    if(tDiv) msgs.removeChild(tDiv);
    
    addMsg('bot', '❌ <b>Error de red o API Key inválida.</b> Verifica tu clave o tu conexión y vuelve a iniciar.');
    geminiApiKey = '';
    localStorage.removeItem('teetime_gemini_key');
  }
}

function addMsg(type, text) {
  const msgs = document.getElementById('chatMessages');
  if(!msgs) return;
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  let parsedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  div.innerHTML = `<div class="msg-bubble">${parsedText}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
