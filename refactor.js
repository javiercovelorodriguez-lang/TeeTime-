const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'index.html');
const rawHtml = fs.readFileSync(inputFile, 'utf-8');

// 1. EXTRACT CSS
const cssMatch = rawHtml.match(/<style>([\s\S]*?)<\/style>/i);
const cssContent = cssMatch ? cssMatch[1].trim() : '';

// 2. EXTRACT JS
const jsMatch = rawHtml.match(/<script>([\s\S]*?)<\/script>/i);
let jsContent = jsMatch ? jsMatch[1].trim() : '';

// Enhance JS handling for multi-page environment (elements might be null)
jsContent = `
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

function switchBooking(type, btn) {
  document.querySelectorAll('.services-tabs .svc-tab').forEach(t => {
    t.style.background = 'transparent';
    t.style.border = '1px solid rgba(255,255,255,0.3)';
  });
  btn.style.background = 'var(--gold)';
  btn.style.border = '1px solid var(--gold)';

  document.getElementById('widget-clases').style.display = 'none';
  document.getElementById('widget-campos').style.display = 'none';
  
  if (type === 'clases') {
    document.getElementById('widget-clases').style.display = 'grid';
  } else {
    document.getElementById('widget-campos').style.display = 'grid';
  }
}

// ─── MINI CALENDAR
let calYear = 2026, calMonth = 3; // April
const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function renderCal(contextId) {
  const titleEl = document.querySelector(\`#\${contextId} .calTitle\`);
  const gridEl = document.querySelector(\`#\${contextId} .calGrid\`);
  if (!titleEl || !gridEl) return;
  
  titleEl.textContent = monthNames[calMonth] + ' ' + calYear;
  const days = ['L','M','X','J','V','S','D'];
  const first = new Date(calYear, calMonth, 1).getDay();
  const total = new Date(calYear, calMonth+1, 0).getDate();
  const offset = (first === 0 ? 6 : first - 1);
  let html = days.map(d => \`<div class="cal-day-name">\${d}</div>\`).join('');
  for (let i = 0; i < offset; i++) html += \`<div class="cal-day empty">·</div>\`;
  for (let d = 1; d <= total; d++) {
    const isToday = d === 1 && calMonth === 3 && calYear === 2026;
    const avail = [2,3,5,8,9,10,12,15,16,17,19,22,23,24,26].includes(d);
    html += \`<div class="cal-day \${isToday?'today':''} \${avail?'available':''}" onclick="selectDay(this,\${d})">\${d}</div>\`;
  }
  gridEl.innerHTML = html;
}

function changeMonth(dir, contextId) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCal(contextId);
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

document.addEventListener('DOMContentLoaded', () => {
  renderCal('cal-mini-clases');
  renderCal('cal-mini-campos');
});

// ─── CONFIRM BOOKING
function confirmBooking() {
  const widget = document.getElementById('widget-clases');
  const name = widget.querySelector('input[type="text"]').value;
  const email = widget.querySelector('input[type="email"]').value;
  const selectedDay = widget.querySelector('.cal-day.selected');
  const selectedTime = widget.querySelector('.time-slot.selected');
  if (!name.trim() || !email.trim() || !selectedDay || !selectedTime) {
    alert('Por favor, rellena nombre, email, y selecciona fecha y hora.');
    return;
  }
  alert(\`✅ ¡Reserva de clase confirmada!\\n\\nNombre: \${name}\\nFecha: \${selectedDay.textContent} \${monthNames[calMonth]} \${calYear}\\nHora: \${selectedTime.textContent}\\n\\nRecibirás confirmación en \${email}\`);
}

function confirmCampo() {
  const widget = document.getElementById('widget-campos');
  const players = widget.querySelector('#campo-jugadores').value;
  const lic = widget.querySelector('input[type="text"]').value;
  const selectedDay = widget.querySelector('.cal-day.selected');
  const selectedTime = widget.querySelector('.time-slot.selected');
  const selectedOpt = widget.querySelector('.booking-left .booking-opt.selected .booking-opt-name');
  
  if (!selectedDay || !selectedTime) {
    alert('Por favor, selecciona importe fecha y hora de salida.');
    return;
  }
  
  const campoName = selectedOpt ? selectedOpt.textContent : 'Campo de golf';
  
  alert(\`⛳ ¡Reserva de Green Fee confirmada!\\n\\nCampo: \${campoName}\\nJugadores: \${players}\\nLicencia: \${lic || 'Pendiente'}\\nFecha: \${selectedDay.textContent} \${monthNames[calMonth]} \${calYear}\\nHora de Salida: \${selectedTime.textContent}\\n\\n¡Buen juego!\`);
}

// ─── CHATBOT
const chatResponses = {
  'cómo empezar en el golf': 'Para empezar en el golf te recomiendo: 1️⃣ Reservar 2-3 clases individuales con un profesor certificado. 2️⃣ No compres equipo caro al principio — un set básico de segunda mano está genial. 3️⃣ Practica la postura y el grip antes de intentar golpear fuerte. ¿Quieres que te ayude a reservar una clase?',
  'qué palos necesito': 'Para empezar solo necesitas: 🏌️ Un hierro 7 o 8, un wedge de pitching y un putter. Puedes encontrar sets de iniciación completos por 80-150€. Te recomiendo revisar nuestra sección de material en el blog. ¿Tienes algún presupuesto en mente?',
  'cómo reservo una clase': 'Reservar es muy sencillo 📅: 1) Ve a la sección "Reservar" en el menú. 2) Selecciona el tipo de servicio o campo. 3) Elige fecha y hora en el calendario. 4) Confirma tus datos. ¡En menos de 2 minutos!',
  'cuánto cuestan las clases': 'Los precios varían según el servicio: ⛳ Clase individual: desde 45€/h · 👥 Clase colectiva: desde 18€/h · 💻 Sesión online: desde 30€/h · 🏌️ Green fees: desde 75€. ¿Te interesa alguno en particular?',
  'default': '¡Buena pregunta! Puedo ayudarte con dudas sobre cómo empezar en el golf, qué material necesitas, cómo funcionan las reservas o encontrar el mejor campo para ti. ¿Qué te gustaría saber? ⛳'
};

function toggleChat() {
  const panel = document.getElementById('chatPanel');
  if(panel) panel.classList.toggle('open');
}

function sendSugg(btn) {
  const text = btn.textContent;
  document.getElementById('chatSugg').style.display = 'none';
  addMsg('user', text);
  setTimeout(() => {
    const key = Object.keys(chatResponses).find(k => text.toLowerCase().includes(k.toLowerCase().substring(0, 8)));
    addMsg('bot', chatResponses[key] || chatResponses['default']);
  }, 600);
}

function sendChat() {
  const input = document.getElementById('chatInput');
  if(!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  const sugg = document.getElementById('chatSugg');
  if(sugg) sugg.style.display = 'none';
  addMsg('user', text);
  setTimeout(() => {
    const lower = text.toLowerCase();
    const key = Object.keys(chatResponses).find(k => lower.includes(k.toLowerCase().replace('?','').substring(0, 8)));
    addMsg('bot', chatResponses[key] || chatResponses['default']);
  }, 700);
}

function addMsg(type, text) {
  const msgs = document.getElementById('chatMessages');
  if(!msgs) return;
  const div = document.createElement('div');
  div.className = \`msg \${type}\`;
  div.innerHTML = \`<div class="msg-bubble">\${text}</div>\`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
`;


// 3. EXTRACT COMPONENTS FROM HTML
function getTag(html, tag, id) {
  const regex = new RegExp(\`<\${tag}[^>]*id="\${id}"[^>]*>([\\s\\S]*?)<\/\${tag}>\`, 'i');
  return html.match(regex);
}

function getSectionByClass(html, className) {
  const regex = new RegExp(\`<section[^>]*class="\${className}"[^>]*>([\\s\\S]*?)<\/section>\`, 'i');
  const m = html.match(regex);
  return m ? m[0] : '';
}

// Base head
const baseHead = \`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TeeTime — Marketplace de Golf</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>\`;

const baseFooterScripts = \`
<script src="script.js"></script>
</body>
</html>\`;

// Extract global sections
const navRaw = rawHtml.match(/<nav id="navbar">[\s\S]*?<\/nav>/i)[0];

const navFixedHtml = navRaw
  .replace(/href="#servicios"/g, 'href="servicios.html"')
  .replace(/href="#profesionales"/g, 'href="profesionales.html"')
  .replace(/href="#reservas"/g, 'href="reservas.html"')
  .replace(/href="#contenido"/g, 'href="contenido.html"')
  .replace(/<a href="#" class="nav-logo">/g, '<a href="index.html" class="nav-logo">');

const mobileMenuRaw = rawHtml.match(/<div class="mobile-menu" id="mobileMenu">[\s\S]*?<\/div>/i)[0];
const mobileMenuHtml = mobileMenuRaw
  .replace(/href="#servicios"/g, 'href="servicios.html"')
  .replace(/href="#profesionales"/g, 'href="profesionales.html"')
  .replace(/href="#reservas"/g, 'href="reservas.html"')
  .replace(/href="#contenido"/g, 'href="contenido.html"');

const footerHtml = rawHtml.match(/<footer>[\s\S]*?<\/footer>/i)[0];
const ctaStripHtml = rawHtml.match(/<div class="cta-strip">[\s\S]*?<\/div>\s*<!-- FOOTER -->/i)[0].replace('<!-- FOOTER -->', '').replace("getElementById('reservas').scrollIntoView({behavior:'smooth'})", "window.location.href='reservas.html'");
const chatBtnHtml = rawHtml.match(/<button class="chat-btn"[\s\S]*?<\/button>/i)[0];
const chatPanelHtml = rawHtml.match(/<div class="chat-panel" id="chatPanel">[\s\S]*?<\/div>/i)[0];

const sharedUI = \\n\\n<!-- CTA STRIP -->\\n\${ctaStripHtml}\\n\\n<!-- FOOTER -->\\n\${footerHtml}\\n\\n<!-- CHATBOT -->\\n\${chatBtnHtml}\\n\${chatPanelHtml}\\n;
const navUI = \`<!-- NAV -->\\n\${navFixedHtml}\\n\\n<!-- MOBILE MENU -->\\n\${mobileMenuHtml}\\n\`;

// EXTRACT SECTIONS
const heroHtml = getSectionByClass(rawHtml, 'hero').replace(/href="#reservas"/g, 'href="reservas.html"').replace(/href="#servicios"/g, 'href="servicios.html"');
const howHtml = getSectionByClass(rawHtml, 'how-section');
const servicesHtml = getSectionByClass(rawHtml, 'services-section').replace(/document.getElementById\('reservas'\).scrollIntoView\(\{behavior:'smooth'\}\)/g, "window.location.href='reservas.html'");
const prosHtml = getSectionByClass(rawHtml, 'pros-section').replace("alert('Próximamente: Directorio completo de profesionales.')", "window.location.href='profesionales.html'");
const contentHtml = getSectionByClass(rawHtml, 'content-section');
const testiHtml = getSectionByClass(rawHtml, 'testi-section');

// BUILD NEW BOOKING SECTION
const newBookingSection = \`
<section class="booking-section" id="reservas" style="padding-top: 120px; min-height: 100vh;">
  <div class="container">
    <div class="reveal" style="text-align: center; margin-bottom: 2rem;">
      <div class="section-tag" style="color:var(--gold-light);">Reservas</div>
      <h2 class="section-title" style="color:white;">Reserva tu experiencia</h2>
      <p class="section-desc" style="color:rgba(255,255,255,0.65); margin: 0 auto;">Elige entre clases con profesionales o reserva tu green fee en el campo.</p>
      
      <div class="services-tabs" style="margin-top: 2.5rem; justify-content: center; background:transparent; border:none;">
        <button class="svc-tab active" onclick="switchBooking('clases', this)" style="background:var(--gold); color:white; border:1px solid var(--gold); padding: .75rem 1.5rem; font-size:.9rem;">Clases y Servicios</button>
        <button class="svc-tab" onclick="switchBooking('campos', this)" style="background:transparent; color:white; border:1px solid rgba(255,255,255,0.3); padding: .75rem 1.5rem; font-size:.9rem;">Green Fees (Campos)</button>
      </div>
    </div>

    <!-- WIDGET CLASES -->
    <div class="booking-widget reveal" id="widget-clases">
      <div class="booking-left">
        <h3>¿Qué necesitas?</h3>
        <p>Selecciona el tipo de servicio que mejor se adapta a tu nivel y objetivos actuales.</p>
        <div class="booking-options">
          <div class="booking-opt selected" onclick="selectOpt(this)">
            <div class="booking-opt-icon">⛳</div><div><div class="booking-opt-name">Clase individual</div><div class="booking-opt-price">Desde 45 €/h</div></div>
          </div>
          <div class="booking-opt" onclick="selectOpt(this)">
            <div class="booking-opt-icon">👥</div><div><div class="booking-opt-name">Clase colectiva</div><div class="booking-opt-price">Desde 18 €/h</div></div>
          </div>
          <div class="booking-opt" onclick="selectOpt(this)">
            <div class="booking-opt-icon">💻</div><div><div class="booking-opt-name">Sesión online</div><div class="booking-opt-price">Desde 30 €/h</div></div>
          </div>
          <div class="booking-opt" onclick="selectOpt(this)">
            <div class="booking-opt-icon">🏋️</div><div><div class="booking-opt-name">Entrenador físico</div><div class="booking-opt-price">Desde 40 €/h</div></div>
          </div>
        </div>
      </div>
      <div class="booking-right">
        <h3>Selecciona fecha y hora</h3>
        <div class="form-row">
          <div class="form-field"><label class="form-label">Tu nombre</label><input class="form-input" type="text" placeholder="Nombre completo"></div>
          <div class="form-field"><label class="form-label">Email</label><input class="form-input" type="email" placeholder="tu@email.com"></div>
        </div>
        <div class="cal-mini" id="cal-mini-clases">
          <div class="cal-header">
            <button class="cal-nav" onclick="changeMonth(-1, 'cal-mini-clases')">‹</button>
            <span class="calTitle">Abril 2026</span>
            <button class="cal-nav" onclick="changeMonth(1, 'cal-mini-clases')">›</button>
          </div>
          <div class="cal-grid calGrid"></div>
        </div>
        <div class="time-slots">
          <div class="time-slot" onclick="selectTime(this)">09:00</div>
          <div class="time-slot" onclick="selectTime(this)">10:00</div>
          <div class="time-slot busy">11:00</div>
          <div class="time-slot" onclick="selectTime(this)">12:00</div>
          <div class="time-slot" onclick="selectTime(this)">16:00</div>
          <div class="time-slot busy">17:00</div>
          <div class="time-slot" onclick="selectTime(this)">18:00</div>
          <div class="time-slot" onclick="selectTime(this)">19:00</div>
        </div>
        <button class="btn-confirm" onclick="confirmBooking()">Confirmar reserva →</button>
      </div>
    </div>

    <!-- WIDGET CAMPOS -->
    <div class="booking-widget" id="widget-campos" style="display:none;">
      <div class="booking-left">
        <h3>Selecciona el Campo</h3>
        <p>Disfruta de condiciones exclusivas en los mejores campos al reservar desde TeeTime.</p>
        <div class="booking-options">
          <div class="booking-opt selected" onclick="selectOpt(this)">
            <div class="booking-opt-icon">⛳</div><div><div class="booking-opt-name">R.C. Puerta de Hierro</div><div class="booking-opt-price">Madrid · Desde 90 € / pax</div></div>
          </div>
          <div class="booking-opt" onclick="selectOpt(this)">
            <div class="booking-opt-icon">🏌️</div><div><div class="booking-opt-name">La Finca Golf Resort</div><div class="booking-opt-price">Alicante · Desde 75 € / pax</div></div>
          </div>
          <div class="booking-opt" onclick="selectOpt(this)">
            <div class="booking-opt-icon">🌊</div><div><div class="booking-opt-name">Golf Santander</div><div class="booking-opt-price">Madrid · Desde 110 € / pax</div></div>
          </div>
          <div class="booking-opt" onclick="selectOpt(this)">
            <div class="booking-opt-icon">🌲</div><div><div class="booking-opt-name">PGA Catalunya</div><div class="booking-opt-price">Girona · Desde 125 € / pax</div></div>
          </div>
        </div>
      </div>
      <div class="booking-right">
        <h3>Detalles de la partida</h3>
        <div class="form-row">
          <div class="form-field">
            <label class="form-label">Jugadores</label>
            <select class="form-input" id="campo-jugadores" style="appearance:auto;">
              <option value="1">1 Jugador</option>
              <option value="2" selected>2 Jugadores</option>
              <option value="3">3 Jugadores</option>
              <option value="4">4 Jugadores</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Licencia RFEG</label>
            <input class="form-input" type="text" placeholder="Ej: CM00-1234">
          </div>
        </div>
        <div class="cal-mini" id="cal-mini-campos">
          <div class="cal-header">
            <button class="cal-nav" onclick="changeMonth(-1, 'cal-mini-campos')">‹</button>
            <span class="calTitle">Abril 2026</span>
            <button class="cal-nav" onclick="changeMonth(1, 'cal-mini-campos')">›</button>
          </div>
          <div class="cal-grid calGrid"></div>
        </div>
        <div class="time-slots">
          <div class="time-slot" onclick="selectTime(this)">08:30</div>
          <div class="time-slot" onclick="selectTime(this)">08:40</div>
          <div class="time-slot busy">08:50</div>
          <div class="time-slot" onclick="selectTime(this)">09:00</div>
          <div class="time-slot" onclick="selectTime(this)">09:10</div>
          <div class="time-slot busy">09:20</div>
          <div class="time-slot" onclick="selectTime(this)">09:30</div>
          <div class="time-slot" onclick="selectTime(this)">09:40</div>
        </div>
        <button class="btn-confirm" onclick="confirmCampo()">Confirmar partida →</button>
      </div>
    </div>
  </div>
</section>
\`;

// WRITE FILES
fs.writeFileSync(path.join(__dirname, 'style.css'), cssContent);
fs.writeFileSync(path.join(__dirname, 'script.js'), jsContent);

// Add top padding adjustments for non-index pages
const pageStyle = \`<style>body{padding-top:72px;} section{padding: 5rem 4vw;}</style>\`;

// index.html
const indexOutput = \`\${baseHead}
\${navUI}
\${heroHtml}
\${howHtml}
\${testiHtml}
\${sharedUI}
\${baseFooterScripts}\`;
fs.writeFileSync(path.join(__dirname, 'index.html'), indexOutput);

// servicios.html
const serviciosOutput = \`\${baseHead}
\${pageStyle}
\${navUI}
\${servicesHtml}
\${sharedUI}
\${baseFooterScripts}\`;
fs.writeFileSync(path.join(__dirname, 'servicios.html'), serviciosOutput);

// profesionales.html
const prosOutput = \`\${baseHead}
\${pageStyle}
\${navUI}
\${prosHtml}
<br><br>
\${sharedUI}
\${baseFooterScripts}\`;
fs.writeFileSync(path.join(__dirname, 'profesionales.html'), prosOutput);

// reservas.html
const reservasOutput = \`\${baseHead}
\${navUI}
\${newBookingSection}
\${sharedUI}
\${baseFooterScripts}\`;
fs.writeFileSync(path.join(__dirname, 'reservas.html'), reservasOutput);

// contenido.html
const contentOutput = \`\${baseHead}
\${pageStyle}
\${navUI}
\${contentHtml}
\${sharedUI}
\${baseFooterScripts}\`;
fs.writeFileSync(path.join(__dirname, 'contenido.html'), contentOutput);

console.log('Refactorización multi-página completada exitosamente.');
