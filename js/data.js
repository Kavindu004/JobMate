// Shared client code used by every page. It talks to the PHP API (api/*.php).
// Accounts, profiles, jobs and reviews live in MySQL: nothing about them is stored in the browser.
const JM = (() => {
const TRADES = ['Mason','Electrician','Plumber','Carpenter','Painter','Welder','Roofer','Landscaper'];
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// everything the pages draw comes from this object; it is refilled from the server by reload()
const S = {pros: [], jobs: [], reviews: [], me: null, lang: 'en'};

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

/* ---------- talking to the server ---------- */
async function api(path, data) {
  let r;
  try { r = await fetch('api/' + path, data ? {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)} : {}); }
  catch { throw new Error('Cannot reach the server. Open the site at http://localhost/jobmate/ with Apache and MySQL running in XAMPP.'); }
  let j = null, ok = true;
  try { j = await r.json(); } catch { ok = false; }
  if (!ok) throw new Error('The server did not send valid data. Check that Apache/PHP and MySQL are running and that you opened the site through http://localhost/jobmate/.');
  if (!r.ok) throw new Error((j && j.error) || 'Something went wrong. Please try again.');
  return j;
}
async function reload() {
  const [me, pros, jobs, reviews] = await Promise.all([api('me.php'), api('pros.php'), api('jobs.php'), api('reviews.php')]);
  S.me = me; S.pros = pros; S.jobs = jobs; S.reviews = reviews; S.lang = (me && me.lang) || 'en';
}
const banner = msg => {
  document.querySelectorAll('.server-error').forEach(e => e.remove());
  document.body.insertAdjacentHTML('afterbegin', `<div class="server-error">${esc(msg)}</div>`);
};

/* ---------- accounts ---------- */
const me = () => S.me;
const has = (u, r) => !!u && u.roles.includes(r);
const fullName = u => (u.first + ' ' + u.last).trim();
const initials = u => ((u.first || '')[0] || '').toUpperCase() + ((u.last || '')[0] || '').toUpperCase();
const avatarHtml = u => u.photo ? `<img src="${esc(u.photo)}" alt="">` : esc(initials(u));
const signupUrl = o => 'signup.html?' + new URLSearchParams(Object.fromEntries(Object.entries(o).filter(([, v]) => v))).toString();
const nextUrl = def => { const n = new URLSearchParams(location.search).get('next') || ''; return /^(index|all-pros|all-jobs|profile|edit-profile|help)\.html(#[a-z]+)?$/.test(n) ? n : def; };
const pageNext = () => { const f = location.pathname.split('/').pop() || 'index.html'; return f === 'index.html' ? 'index.html#jobs' : f; };
async function logout() { try { await api('logout.php', {}); } catch {} location.href = 'index.html'; }

/* ---------- navigation (Login / Sign Up  or  profile circle + menu) ---------- */
const LANGS = {en: 'English', si: 'සිංහල', ta: 'தமிழ்'};
const T = {
  en: {profile: 'My Profile', edit: 'Edit Profile', language: 'Language', help: 'Help & Support', logout: 'Logout', login: 'Login', signup: 'Sign Up'},
  si: {profile: 'මගේ පැතිකඩ', edit: 'පැතිකඩ සංස්කරණය', language: 'භාෂාව', help: 'උදව් සහ සහාය', logout: 'ඉවත් වන්න', login: 'ඇතුල් වන්න', signup: 'ලියාපදිංචි වන්න'},
  ta: {profile: 'என் சுயவிவரம்', edit: 'சுயவிவரத்தைத் திருத்து', language: 'மொழி', help: 'உதவி & ஆதரவு', logout: 'வெளியேறு', login: 'உள்நுழை', signup: 'பதிவு செய்'}
};
const closeDd = () => { const dd = $('userDd'); if (dd) { dd.hidden = true; $('avatarBtn').setAttribute('aria-expanded', 'false'); } };
function langModal() {
  const t = T[S.lang] || T.en;
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
      <button type="button" role="menuitem" id="ddLang"><span>${t.language}</span><span class="dd-val">${LANGS[S.lang] || LANGS.en}</span></button>
      <a role="menuitem" href="help.html">${t.help}</a>
      <div class="dd-sep"></div>
      <button type="button" role="menuitem" id="ddLogout">${t.logout}</button>
    </div></div>`;
  $('avatarBtn').onclick = () => { const dd = $('userDd'), open = dd.hidden; dd.hidden = !open; $('avatarBtn').setAttribute('aria-expanded', String(open)); };
  $('ddLang').onclick = langModal;
  $('ddLogout').onclick = logout;
}

/* ---------- pop-ups: view a pro, apply, applicants ---------- */
function proModal(id) {
  const p = S.pros.find(x => x.id === id); if (!p) return;
  const u = me(), revs = S.reviews.filter(r => r.proId === id), own = !!u && u.proId === p.id;
  const loginHref = 'login.html?next=' + encodeURIComponent(pageNext());
  openModal(`
    <h3>${esc(p.name)}</h3>
    <div class="meta">${esc(p.trade)} \u00b7 ${esc(p.location)} \u00b7 ${p.exp} yrs \u00b7 ${p.count ? p.rating.toFixed(1) + ' \u2605 (' + p.count + ')' : 'New'}</div>
    <p>${esc(p.bio)}</p>
    <div>${p.skills.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div>
    ${u ? `<p><strong>Phone:</strong> ${esc(p.phone || 'Not given')}<br><strong>Email:</strong> ${esc(p.email || 'Not given')}</p>` : `<p class="meta">Log in to see contact details.</p>`}
    ${!u ? `<hr><p>Please <a href="${loginHref}" style="color:var(--steel);font-weight:700">log in</a> or <a href="${signupUrl({next: pageNext()})}" style="color:var(--steel);font-weight:700">register</a> to send a hire request or leave a review.</p>` : own ? '' : `
    <hr><h3 style="font-size:24px">Send a hire request</h3>
    <form id="hireForm" novalidate>
      <div class="f"><label>What do you need done?</label><textarea name="m"></textarea></div>
      <div class="err" id="hireErr"></div>
      <button class="btn btn-primary" type="submit">Send request</button>
    </form>
    <hr><h3 style="font-size:24px">Worked with ${esc(p.name.split(' ')[0])}? Rate them</h3>
    <form id="rateForm" class="form-grid" novalidate>
      <div class="f"><label>Rating</label><select name="s"><option value="5">5 \u2013 Excellent</option><option value="4">4 \u2013 Good</option><option value="3">3 \u2013 Okay</option><option value="2">2 \u2013 Poor</option><option value="1">1 \u2013 Bad</option></select></div>
      <div class="f full"><label>Comment</label><textarea name="t"></textarea></div>
      <div class="full err" id="rateErr"></div>
      <div class="full"><button class="btn btn-outline" type="submit">Submit review</button></div>
    </form>`}
    ${revs.length ? '<hr>' + revs.map(r => `<p>${stars(r.stars)} <strong>${esc(r.name)}</strong><br>${esc(r.text)}</p>`).join('') : ''}`);
  if ($('hireForm')) $('hireForm').onsubmit = async e => {
    e.preventDefault();
    const m = new FormData(e.target).get('m').trim();
    if (!m) { $('hireErr').textContent = 'Describe what you need done.'; return; }
    try { await api('hire_request.php', {proId: id, message: m}); closeModal(); toast('Request sent to ' + p.name); }
    catch (x) { $('hireErr').textContent = x.message; }
  };
  if ($('rateForm')) $('rateForm').onsubmit = async e => {
    e.preventDefault();
    const d = new FormData(e.target), text = d.get('t').trim();
    if (!text) { $('rateErr').textContent = 'Add a short comment.'; return; }
    try { await api('review.php', {proId: id, stars: +d.get('s'), text}); await reload(); rerender(); closeModal(); toast('Review published'); }
    catch (x) { $('rateErr').textContent = x.message; }
  };
}

function applyModal(id) {
  const j = S.jobs.find(x => x.id === id); if (!j) return;
  const u = me(), next = pageNext();
  if (!has(u, 'worker')) {
    openModal(`<h3>Register as a Worker</h3><p>${u ? 'Your account is not registered as a worker yet. Add your trade, skills and experience to apply for jobs.' : 'Only registered workers can apply, so your trade and experience can be matched to the job.'}</p>
      <a class="btn btn-primary" href="${signupUrl(u ? {add: 'worker', next} : {role: 'worker', next})}">Register as a Worker</a>
      ${u ? '' : `<p class="meta" style="margin-top:14px">Already registered? <a href="login.html?next=${encodeURIComponent(next)}" style="color:var(--steel);font-weight:700">Login</a></p>`}`);
    return;
  }
  const w = S.pros.find(p => p.id === u.proId);
  openModal(`<h3>Apply: ${esc(j.title)}</h3>
    <p class="meta">This job needs a <strong>${esc(j.trade)}</strong> in ${esc(j.location)}.</p>
    <p class="meta">Applying as <strong>${esc(fullName(u))}</strong>${w ? ' \u2013 ' + esc(w.trade) + ', ' + w.exp + ' yrs' : ''}</p>
    <form id="applyForm" novalidate>
      <div class="f"><label>Message to the client</label><textarea name="m" placeholder="Why you are a good fit"></textarea></div>
      <div class="err" id="applyErr"></div>
      <button class="btn btn-primary" type="submit">Send application</button>
    </form>`);
  $('applyForm').onsubmit = async e => {
    e.preventDefault();
    if (w && w.trade !== j.trade) { $('applyErr').textContent = `This job needs a ${j.trade}, but your worker profile is a ${w.trade}. You can only apply to jobs that match your trade.`; return; }
    try { await api('apply.php', {jobId: id, message: new FormData(e.target).get('m').trim()}); await reload(); rerender(); closeModal(); toast('Application sent'); }
    catch (x) { $('applyErr').textContent = x.message; }
  };
}
function appsModal(id) {
  const j = S.jobs.find(x => x.id === id), u = me();
  if (!j || !u || j.ownerId !== u.id) return;
  openModal(`<h3>Applicants</h3><p class="meta">${esc(j.title)}</p>` + (j.apps.length ? j.apps.map(a => `
    <div class="app-row"><div><strong>${esc(a.name)}</strong> \u00b7 ${a.exp} yrs<br><span class="meta">${a.skills.map(esc).join(', ')}${a.msg ? '<br>\u201c' + esc(a.msg) + '\u201d' : ''}<br>${esc(a.phone || '')} ${esc(a.email || '')}</span></div>
      ${j.hired ? (j.hired.proId === a.proId ? '<span class="tag green">Hired</span>' : '') : `<button class="btn btn-primary" data-hire="${j.id}|${a.proId}" style="padding:8px 12px">Hire</button>`}</div>`).join('') : '<p>No applications yet. Matching workers will appear here.</p>'));
}

/* ---------- card templates ---------- */
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

/* ---------- shared actions: work on every page ---------- */
document.addEventListener('click', e => {
  if (!e.target.closest('#userMenu')) closeDd(); else if (e.target.closest('#userDd a, #userDd button')) closeDd();
  const t = e.target.closest('button,a'); if (!t) return;
  if (t.dataset.view) proModal(t.dataset.view);
  if (t.dataset.apply) applyModal(t.dataset.apply);
  if (t.dataset.apps) appsModal(t.dataset.apps);
  if (t.dataset.lang) {
    api('lang.php', {lang: t.dataset.lang}).then(() => { S.lang = t.dataset.lang; if (S.me) S.me.lang = S.lang; renderNav(); closeModal(); toast(LANGS[S.lang]); }).catch(x => toast(x.message));
  }
  if (t.dataset.hire) {
    const [jobId, proId] = t.dataset.hire.split('|');
    api('hire.php', {jobId, proId}).then(async () => { await reload(); rerender(); closeModal(); toast('Worker selected for this job'); }).catch(x => toast(x.message));
  }
  if (t.dataset.match && !$('browse')) { const j = S.jobs.find(x => x.id === t.dataset.match); if (j) location.href = 'all-pros.html?q=' + encodeURIComponent(j.trade); }
  if (t.id === 'menuToggle') $('navLinks').classList.toggle('open');
  else if (t.closest('#navLinks')) $('navLinks').classList.remove('open');
});
$('modalX').onclick = closeModal;
$('modalBg').onclick = e => { if (e.target === $('modalBg')) closeModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDd(); } });

/* fade-in on scroll. Content is never hidden if this fails: everything is shown when the server or a page script fails. */
const revealEls = [...document.querySelectorAll('.reveal')];
const revealAll = () => revealEls.forEach(el => el.classList.add('in'));
try {
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), {threshold: .05}) : null;
  document.documentElement.classList.add('js-reveal');
  revealEls.forEach(el => io ? io.observe(el) : el.classList.add('in'));
} catch { revealAll(); }

// pages wait for this before drawing: it resolves to true when the server answered, false when it did not
const ready = reload().then(() => { renderNav(); return true; }).catch(e => { banner(e.message); renderNav(); revealAll(); return false; });

return {S, api, reload, ready, TRADES, $, esc, toast, openModal, closeModal, stars, rup, proCard, jobCard, moreTile, setRerender, revealAll,
  me, has, fullName, initials, avatarHtml, signupUrl, nextUrl, pageNext, logout, renderNav, banner};
})();