const JM = (() => {
const KEY = 'jobmate_data';
const RESET_ON_REFRESH = false;
const TRADES = ['Mason','Electrician','Plumber','Carpenter','Painter','Welder','Roofer','Landscaper'];
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
 
const seed = () => ({
  pros: [
    {id:'p1',name:'Nimal Perera',trade:'Mason',location:'Kandy',exp:15,rating:4.9,count:64,phone:'077 123 4567',email:'nimal@example.com',skills:['Brickwork','Plastering','Tiling'],bio:'Boundary walls, house extensions and tiling.'},
    {id:'p2',name:'Sajith Fernando',trade:'Electrician',location:'Colombo',exp:9,rating:4.8,count:112,phone:'071 555 0192',email:'sajith@example.com',skills:['Wiring','Fuse boards','Solar install'],bio:'Domestic and small commercial electrical work.'},
    {id:'p3',name:'Ruwan Silva',trade:'Plumber',location:'Galle',exp:12,rating:4.7,count:87,phone:'076 220 3344',email:'ruwan@example.com',skills:['Leak repair','Bathroom fitting','Water tanks'],bio:'Fast call-outs and full bathroom installs.'},
    {id:'p4',name:'Kasun Jayasuriya',trade:'Carpenter',location:'Kandy',exp:7,rating:4.6,count:41,phone:'070 889 1122',email:'kasun@example.com',skills:['Cupboards','Doors','Roof trusses'],bio:'Custom furniture and joinery.'},
    {id:'p5',name:'Dilani Wickramasinghe',trade:'Painter',location:'Matara',exp:6,rating:4.8,count:55,phone:'075 410 7788',email:'dilani@example.com',skills:['Interior','Exterior','Wall textures'],bio:'Clean, tidy finishes on time.'},
    {id:'p6',name:'Mahesh Kumara',trade:'Welder',location:'Colombo',exp:11,rating:4.5,count:33,phone:'072 301 9900',email:'mahesh@example.com',skills:['Gates','Steel frames','Grills'],bio:'Fabrication for homes and workshops.'},
    {id:'p7',name:'Chamara Bandara',trade:'Roofer',location:'Kurunegala',exp:14,rating:4.7,count:48,phone:'078 660 2211',email:'chamara@example.com',skills:['Tile roofing','Sheet roofing','Leak sealing'],bio:'New roofs and repairs.'},
    {id:'p8',name:'Tharindu Senanayake',trade:'Landscaper',location:'Kandy',exp:5,rating:4.6,count:29,phone:'074 998 1234',email:'tharindu@example.com',skills:['Lawns','Garden design','Irrigation'],bio:'Gardens that stay green.'}
  ],
  jobs: [
    {id:'j1',title:'Rewire a two-bedroom house',trade:'Electrician',location:'Colombo',budget:60000,name:'A. Rajapaksa',contact:'077 000 1111',desc:'Full rewiring and new fuse board. Two weeks.',apps:[],hired:null},
    {id:'j2',title:'Build a 20m boundary wall',trade:'Mason',location:'Kandy',budget:150000,name:'S. Dissanayake',contact:'sd@example.com',desc:'Brick wall with plaster finish. Materials on site.',apps:[],hired:null},
    {id:'j3',title:'Fix leaking kitchen pipes',trade:'Plumber',location:'Galle',budget:12000,name:'M. Ariyaratne',contact:'071 222 3333',desc:'Two leaks under the sink and one in the wall.',apps:[],hired:null}
  ],
  reviews: [
    {name:'Nadeeka P.',trade:'Mason',stars:5,text:'Turned up on time, finished the wall a day early and left the site spotless.'},
    {name:'Roshan K.',trade:'Electrician',stars:5,text:'Explained every step of the rewiring and the price matched the quote.'},
    {name:'Hasini W.',trade:'Painter',stars:4,text:'Great finish on the living room. Needed one small touch-up, fixed the next day.'}
  ],
  requests: []
});
 
let S = null;
const nav0 = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
if (RESET_ON_REFRESH && nav0 && nav0.type === 'reload') { try { sessionStorage.removeItem(KEY); } catch {} }
try { S = JSON.parse(sessionStorage.getItem(KEY)); } catch {}
if (!S) S = seed();
S.users = S.users || []; S.lang = S.lang || 'en'; S.me = S.me || null; S.support = S.support || [];
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
save();
 
/* modal + toast containers (created automatically so every page can use them) */
if (!$('modalBg')) document.body.insertAdjacentHTML('beforeend', '<div class="modal-bg" id="modalBg"><div class="modal" role="dialog" aria-modal="true"><button class="x" id="modalX" aria-label="Close">&times;</button><div id="modalBody"></div></div></div>');
if (!$('toast')) document.body.insertAdjacentHTML('beforeend', '<div class="toast" id="toast" role="status"></div>');
const toast = msg => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); };
const openModal = html => { $('modalBody').innerHTML = html; $('modalBg').classList.add('open'); };
const closeModal = () => $('modalBg').classList.remove('open');
const stars = r => '<span class="stars">' + '\u2605'.repeat(Math.round(r)) + '\u2606'.repeat(5 - Math.round(r)) + '</span>';
const rup = n => 'Rs. ' + Number(n).toLocaleString('en-LK');
 
let rerender = () => {};
const setRerender = fn => { rerender = fn; };
 
/* ---------- accounts ---------- */
const me = () => S.users.find(u => u.id === S.me) || null;
const has = (u, r) => !!u && u.roles.includes(r);
const fullName = u => (u.first + ' ' + u.last).trim();
const initials = u => ((u.first || '')[0] || '').toUpperCase() + ((u.last || '')[0] || '').toUpperCase();
const avatarHtml = u => u.photo ? `<img src="${esc(u.photo)}" alt="">` : esc(initials(u));
const signupUrl = o => 'signup.html?' + new URLSearchParams(Object.fromEntries(Object.entries(o).filter(([, v]) => v))).toString();
const nextUrl = def => { const n = new URLSearchParams(location.search).get('next') || ''; return /^(index|all-pros|all-jobs|profile|edit-profile|help)\.html(#[a-z]+)?$/.test(n) ? n : def; };
const pageNext = () => { const f = location.pathname.split('/').pop() || 'index.html'; return f === 'index.html' ? 'index.html#jobs' : f; };
 
function createUser({first, last, email, password}) {
  email = email.toLowerCase();
  if (S.users.some(x => x.email === email)) throw new Error('An account with this email already exists. Try logging in.');
  const u = {id:uid(), first, last, email, password, phone:'', location:'', photo:'', roles:[], created:new Date().toISOString()};
  S.users.push(u); save(); return u;
}
function makeWorker(u, {trade, exp, skills, bio}) {
  const p = {id:uid(), userId:u.id, registered:true, name:fullName(u), trade, location:u.location, exp, rating:0, count:0, phone:u.phone, email:u.email, skills, bio:bio || 'New on JobMate.', photo:u.photo || ''};
  S.pros.unshift(p); u.proId = p.id; if (!u.roles.includes('worker')) u.roles.push('worker'); save(); return p;
}
function makeClient(u) { if (!u.roles.includes('client')) u.roles.push('client'); save(); }
function login(email, password) {
  const u = S.users.find(x => x.email === email.toLowerCase() && x.password === password);
  if (u) { S.me = u.id; save(); }
  return u || null;
}
function logout() { S.me = null; S.draft = null; save(); location.href = 'index.html'; }
// keep every place that shows this person up to date after a profile change
function syncUser(u) {
  const name = fullName(u), p = S.pros.find(x => x.id === u.proId);
  if (p) { p.name = name; p.phone = u.phone; p.email = u.email; p.location = u.location; p.photo = u.photo || ''; }
  S.jobs.forEach(j => {
    if (j.ownerId === u.id) { j.name = name; j.contact = u.phone || u.email; }
    j.apps.forEach(a => { if (a.proId === u.proId) a.name = name; });
    if (j.hired && j.hired.proId === u.proId) j.hired.name = name;
  });
  save();
}
 
/* ---------- navigation (Login / Sign Up  or  profile circle + menu) ---------- */
const LANGS = {en:'English', si:'සිංහල', ta:'தமிழ்'};
const T = {
  en:{profile:'My Profile', edit:'Edit Profile', language:'Language', help:'Help & Support', logout:'Logout', login:'Login', signup:'Sign Up'},
  si:{profile:'මගේ පැතිකඩ', edit:'පැතිකඩ සංස්කරණය', language:'භාෂාව', help:'උදව් සහ සහාය', logout:'ඉවත් වන්න', login:'ඇතුල් වන්න', signup:'ලියාපදිංචි වන්න'},
  ta:{profile:'என் சுயவிவரம்', edit:'சுயவிவரத்தைத் திருத்து', language:'மொழி', help:'உதவி & ஆதரவு', logout:'வெளியேறு', login:'உள்நுழை', signup:'பதிவு செய்'}
};
const closeDd = () => { const dd = $('userDd'); if (dd) { dd.hidden = true; $('avatarBtn').setAttribute('aria-expanded', 'false'); } };
function langModal() {
  const t = T[S.lang];
  openModal(`<h3>${t.language}</h3><div class="lang-list">${Object.entries(LANGS).map(([k, n]) => `<button type="button" class="lang-opt ${k === S.lang ? 'active' : ''}" data-lang="${k}">${n}${k === S.lang ? ' \u2713' : ''}</button>`).join('')}</div><p class="meta">The account menu and the Login / Sign Up buttons change language. The rest of the site is not translated yet.</p>`);
}
function renderNav() {
  const el = $('authNav'); if (!el) return;
  const t = T[S.lang] || T.en, u = me();
  if (!u) { el.innerHTML = `<a href="login.html" class="btn btn-outline">${t.login}</a><a href="signup.html" class="btn btn-primary">${t.signup}</a>`; return; }
  el.innerHTML = `<div class="user-menu" id="userMenu">
    <button type="button" class="avatar-btn" id="avatarBtn" aria-haspopup="true" aria-expanded="false" aria-label="Account menu">${avatarHtml(u)}</button>
    <div class="user-dd" id="userDd" role="menu" hidden>
      <div class="dd-head"><span class="dd-avatar">${avatarHtml(u)}</span><div class="dd-who"><strong>${esc(fullName(u))}</strong><small>${esc(u.email)}</small></div></div>
      <div class="dd-sep"></div>
      <a role="menuitem" href="profile.html">${t.profile}</a>
      <a role="menuitem" href="edit-profile.html">${t.edit}</a>
      <div class="dd-sep"></div>
      <button type="button" role="menuitem" id="ddLang"><span>${t.language}</span><span class="dd-val">${LANGS[S.lang]}</span></button>
      <a role="menuitem" href="help.html">${t.help}</a>
      <div class="dd-sep"></div>
      <button type="button" role="menuitem" id="ddLogout">${t.logout}</button>
    </div></div>`;
  $('avatarBtn').onclick = () => { const dd = $('userDd'), open = dd.hidden; dd.hidden = !open; $('avatarBtn').setAttribute('aria-expanded', String(open)); };
  $('ddLang').onclick = langModal;
  $('ddLogout').onclick = logout;
}
 
function proModal(id) {
  const p = S.pros.find(x => x.id === id); if (!p) return;
  const revs = S.reviews.filter(r => r.proId === id);
  const u = me(), nameVal = u ? esc(fullName(u)) : '', contactVal = u ? esc(u.phone || u.email) : '';
  openModal(`
    <h3>${esc(p.name)}</h3>
    <div class="meta">${esc(p.trade)} · ${esc(p.location)} · ${p.exp} yrs · ${p.count ? p.rating.toFixed(1) + ' ★ (' + p.count + ')' : 'New'}</div>
    <p>${esc(p.bio)}</p>
    <div>${p.skills.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div>
    <p><strong>Phone:</strong> ${esc(p.phone || 'Not given')}<br><strong>Email:</strong> ${esc(p.email || 'Not given')}</p>
    <hr><h3 style="font-size:24px">Send a hire request</h3>
    <form id="hireForm" class="form-grid" novalidate>
      <div class="f"><label>Your name</label><input name="n" value="${nameVal}"></div>
      <div class="f"><label>Phone or email</label><input name="c" value="${contactVal}"></div>
      <div class="f full"><label>What do you need done?</label><textarea name="m"></textarea></div>
      <div class="full err" id="hireErr"></div>
      <div class="full"><button class="btn btn-primary" type="submit">Send request</button></div>
    </form>
    <hr><h3 style="font-size:24px">Worked with ${esc(p.name.split(' ')[0])}? Rate them</h3>
    <form id="rateForm" class="form-grid" novalidate>
      <div class="f"><label>Your name</label><input name="n" value="${nameVal}"></div>
      <div class="f"><label>Rating</label><select name="s"><option value="5">5 – Excellent</option><option value="4">4 – Good</option><option value="3">3 – Okay</option><option value="2">2 – Poor</option><option value="1">1 – Bad</option></select></div>
      <div class="f full"><label>Comment</label><textarea name="t"></textarea></div>
      <div class="full err" id="rateErr"></div>
      <div class="full"><button class="btn btn-outline" type="submit">Submit review</button></div>
    </form>
    ${revs.length ? '<hr>' + revs.map(r => `<p>${stars(r.stars)} <strong>${esc(r.name)}</strong><br>${esc(r.text)}</p>`).join('') : ''}`);
  $('hireForm').onsubmit = e => {
    e.preventDefault(); const d = new FormData(e.target);
    if (!d.get('n').trim() || !d.get('c').trim() || !d.get('m').trim()) { $('hireErr').textContent = 'Fill in your name, contact details and the job description.'; return; }
    S.requests.push({id:uid(), proId:id, name:d.get('n').trim(), contact:d.get('c').trim(), msg:d.get('m').trim()});
    save(); closeModal(); toast('Request sent to ' + p.name);
  };
  $('rateForm').onsubmit = e => {
    e.preventDefault(); const d = new FormData(e.target); const s = +d.get('s');
    if (!d.get('n').trim() || !d.get('t').trim()) { $('rateErr').textContent = 'Add your name and a short comment.'; return; }
    S.reviews.unshift({proId:id, name:d.get('n').trim(), trade:p.trade, stars:s, text:d.get('t').trim()});
    p.rating = (p.rating * p.count + s) / (p.count + 1); p.count++;
    save(); rerender(); closeModal(); toast('Review published');
  };
}
 
function applyModal(id) {
  const j = S.jobs.find(x => x.id === id); if (!j) return;
  const u = me(), next = pageNext();
  if (!has(u, 'worker')) {
    openModal(`<h3>Register as a Worker</h3><p>${u ? 'Your account is not registered as a worker yet. Add your trade, skills and experience to apply for jobs.' : 'Only registered workers can apply, so your trade and experience can be matched to the job.'}</p>
      <a class="btn btn-primary" href="${signupUrl(u ? {add:'worker', next} : {role:'worker', next})}">Register as a Worker</a>
      ${u ? '' : `<p class="meta" style="margin-top:14px">Already registered? <a href="login.html?next=${encodeURIComponent(next)}" style="color:var(--steel);font-weight:700">Login</a></p>`}`);
    return;
  }
  const w = S.pros.find(p => p.id === u.proId);
  openModal(`<h3>Apply: ${esc(j.title)}</h3>
    <p class="meta">This job needs a <strong>${esc(j.trade)}</strong> in ${esc(j.location)}.</p>
    <p class="meta">Applying as <strong>${esc(w.name)}</strong> \u2013 ${esc(w.trade)}, ${w.exp} yrs</p>
    <form id="applyForm" novalidate>
      <div class="f"><label>Message to the client</label><textarea name="m" placeholder="Why you are a good fit"></textarea></div>
      <div class="err" id="applyErr"></div>
      <button class="btn btn-primary" type="submit">Send application</button>
    </form>`);
  $('applyForm').onsubmit = e => {
    e.preventDefault(); const d = new FormData(e.target);
    if (w.trade !== j.trade) { $('applyErr').textContent = `This job needs a ${j.trade}, but your worker profile is a ${w.trade}. You can only apply to jobs that match your trade.`; return; }
    if (j.apps.some(a => a.proId === w.id)) { $('applyErr').textContent = 'You have already applied to this job.'; return; }
    if (j.ownerId === u.id) { $('applyErr').textContent = 'You cannot apply to your own job.'; return; }
    j.apps.push({proId:w.id, name:w.name, exp:w.exp, skills:w.skills, msg:d.get('m').trim()});
    save(); rerender(); closeModal(); toast('Application sent');
  };
}
function appsModal(id) {
  const j = S.jobs.find(x => x.id === id); if (!j) return;
  openModal(`<h3>Applicants</h3><p class="meta">${esc(j.title)}</p>` + (j.apps.length ? j.apps.map(a => {
    const p = S.pros.find(x => x.id === a.proId) || {};
    return `<div class="app-row"><div><strong>${esc(a.name)}</strong> · ${a.exp} yrs<br><span class="meta">${a.skills.map(esc).join(', ')}${a.msg ? '<br>“' + esc(a.msg) + '”' : ''}<br>${esc(p.phone || '')} ${esc(p.email || '')}</span></div>
      ${j.hired ? (j.hired.proId === a.proId ? '<span class="tag green">Hired</span>' : '') : `<button class="btn btn-primary" data-hire="${j.id}|${a.proId}" style="padding:8px 12px">Hire</button>`}</div>`;
  }).join('') : '<p>No applications yet. Matching workers will appear here.</p>'));
}
 
/* card templates */
const proCard = p => `
    <article class="card">
      <div class="pro-top"><div class="avatar">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : esc(p.name[0])}</div>
        <div><h3>${esc(p.name)}</h3><div class="meta">${esc(p.trade)} \u00b7 ${esc(p.location)}</div></div></div>
      <div class="meta">${p.count ? stars(p.rating) + ' ' + p.rating.toFixed(1) + ' (' + p.count + ' reviews)' : '<span class="tag green">New</span>'} \u00b7 ${p.exp} yrs experience</div>
      <div>${p.skills.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div>
      <p>${esc(p.bio)}</p>
      <div class="actions"><button class="btn btn-primary" data-view="${p.id}">View &amp; hire</button></div>
    </article>`;
const jobCard = j => {
  const u = me(), mine = !!u && j.ownerId === u.id;
  const matches = S.pros.filter(p => p.trade === j.trade).length;
  return `<article class="card">
      <h3>${esc(j.title)}</h3>
      <div class="meta"><span class="tag amber">${esc(j.trade)}</span> ${esc(j.location)} \u00b7 ${rup(j.budget || 0)} \u00b7 posted by ${esc(j.name)}${mine ? ' <span class="tag green">Your job</span>' : ''}</div>
      <p>${esc(j.desc)}</p>
      <div class="meta">${j.hired ? '<span class="tag green">Hired: ' + esc(j.hired.name) + '</span>' : j.apps.length + ' applicant' + (j.apps.length === 1 ? '' : 's') + ' \u00b7 ' + matches + ' matching pro' + (matches === 1 ? '' : 's')}</div>
      <div class="actions">
        ${j.hired ? '' : `<button class="btn btn-primary" data-apply="${j.id}">Apply</button>`}
        ${mine ? `<button class="btn btn-outline" data-apps="${j.id}">Applicants (${j.apps.length})</button>` : ''}
        <button class="btn btn-outline" data-match="${j.id}">Find pros</button>
      </div></article>`;
};
const moreTile = (href, cls = '') => `<a class="more-tile ${cls}" href="${href}"><span class="more-arrow">&rsaquo;</span><span>View more</span></a>`;
 
/* shared actions: work on every page */
document.addEventListener('click', e => {
  if (!e.target.closest('#userMenu')) closeDd(); else if (e.target.closest('#userDd a, #userDd button')) closeDd();
  const t = e.target.closest('button,a'); if (!t) return;
  if (t.dataset.view) proModal(t.dataset.view);
  if (t.dataset.apply) applyModal(t.dataset.apply);
  if (t.dataset.apps) appsModal(t.dataset.apps);
  if (t.dataset.lang) { S.lang = t.dataset.lang; save(); renderNav(); closeModal(); toast(LANGS[S.lang]); }
  if (t.dataset.hire) {
    const [jid, pid] = t.dataset.hire.split('|'), j = S.jobs.find(x => x.id === jid), u = me();
    if (j && u && j.ownerId === u.id) { const a = j.apps.find(x => x.proId === pid); j.hired = {proId:pid, name:a.name}; save(); rerender(); closeModal(); toast(a.name + ' selected for this job'); }
  }
  if (t.dataset.match && !$('browse')) { const j = S.jobs.find(x => x.id === t.dataset.match); location.href = 'all-pros.html?q=' + encodeURIComponent(j.trade); }
  if (t.id === 'menuToggle') $('navLinks').classList.toggle('open');
  else if (t.closest('#navLinks')) $('navLinks').classList.remove('open');
});
$('modalX').onclick = closeModal;
$('modalBg').onclick = e => { if (e.target === $('modalBg')) closeModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDd(); } });
renderNav();
 
return {S, save, TRADES, $, esc, uid, toast, openModal, closeModal, stars, rup, proCard, jobCard, moreTile, setRerender,
  me, has, fullName, initials, avatarHtml, signupUrl, nextUrl, pageNext, createUser, makeWorker, makeClient, login, logout, syncUser, renderNav};
})();