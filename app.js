(() => {
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
let S;
// Data lives in memory only, so a page refresh resets it to seed().
// Later, replace save() with a call to your backend (fetch/POST) to store data in a database.
S = seed();
const save = () => {};

const f = {trade:'', loc:'', sort:'rating'};
let jobTradeFilter = '';

const toast = msg => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); };
const openModal = html => { $('modalBody').innerHTML = html; $('modalBg').classList.add('open'); };
const closeModal = () => $('modalBg').classList.remove('open');
const stars = r => '<span class="stars">' + '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)) + '</span>';
const rup = n => 'Rs. ' + Number(n).toLocaleString('en-LK');

/* selects */
const opts = (first) => (first ? `<option value="">${first}</option>` : '') + TRADES.map(t => `<option>${t}</option>`).join('');
$('rTrade').innerHTML = opts(); $('jTradeSel').innerHTML = opts(); $('jobTrade').innerHTML = opts('All trades');

/* pros */
function renderPills() {
  $('filterPills').innerHTML = ['', ...TRADES].map(t => `<button type="button" class="pill ${f.trade === t ? 'active' : ''}" data-t="${t}">${t || 'All'}</button>`).join('');
}
function renderPros() {
  const loc = f.loc.trim().toLowerCase();
  let list = S.pros.filter(p => (!f.trade || p.trade === f.trade) && (!loc || p.location.toLowerCase().includes(loc)));
  list.sort((a, b) => f.sort === 'experience' ? b.exp - a.exp : f.sort === 'reviews' ? b.count - a.count : b.rating - a.rating);
  $('resultCount').textContent = list.length;
  $('proGrid').innerHTML = list.length ? list.map(p => `
    <article class="card">
      <div class="pro-top"><div class="avatar">${esc(p.name[0])}</div>
        <div><h3>${esc(p.name)}</h3><div class="meta">${esc(p.trade)} · ${esc(p.location)}</div></div></div>
      <div class="meta">${p.count ? stars(p.rating) + ' ' + p.rating.toFixed(1) + ' (' + p.count + ' reviews)' : '<span class="tag green">New</span>'} · ${p.exp} yrs experience</div>
      <div>${p.skills.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div>
      <p>${esc(p.bio)}</p>
      <div class="actions"><button class="btn btn-primary" data-view="${p.id}">View &amp; hire</button></div>
    </article>`).join('') : '<div class="empty">No pros match yet. Try another trade or a nearby town, or post a job and let workers come to you.</div>';
}
function proModal(id) {
  const p = S.pros.find(x => x.id === id); if (!p) return;
  const revs = S.reviews.filter(r => r.proId === id);
  openModal(`
    <h3>${esc(p.name)}</h3>
    <div class="meta">${esc(p.trade)} · ${esc(p.location)} · ${p.exp} yrs · ${p.count ? p.rating.toFixed(1) + ' ★ (' + p.count + ')' : 'New'}</div>
    <p>${esc(p.bio)}</p>
    <div>${p.skills.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</div>
    <p><strong>Phone:</strong> ${esc(p.phone || 'Not given')}<br><strong>Email:</strong> ${esc(p.email || 'Not given')}</p>
    <hr><h3 style="font-size:24px">Send a hire request</h3>
    <form id="hireForm" class="form-grid" novalidate>
      <div class="f"><label>Your name</label><input name="n"></div>
      <div class="f"><label>Phone or email</label><input name="c"></div>
      <div class="f full"><label>What do you need done?</label><textarea name="m"></textarea></div>
      <div class="full err" id="hireErr"></div>
      <div class="full"><button class="btn btn-primary" type="submit">Send request</button></div>
    </form>
    <hr><h3 style="font-size:24px">Worked with ${esc(p.name.split(' ')[0])}? Rate them</h3>
    <form id="rateForm" class="form-grid" novalidate>
      <div class="f"><label>Your name</label><input name="n"></div>
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
    save(); renderAll(); closeModal(); toast('Review published');
  };
}

/* jobs */
function renderJobs() {
  const list = S.jobs.filter(j => !jobTradeFilter || j.trade === jobTradeFilter);
  $('jobCount').textContent = list.length;
  $('jobGrid').innerHTML = list.length ? list.map(j => {
    const matches = S.pros.filter(p => p.trade === j.trade).length;
    return `<article class="card">
      <h3>${esc(j.title)}</h3>
      <div class="meta"><span class="tag amber">${esc(j.trade)}</span> ${esc(j.location)} · ${rup(j.budget || 0)} · posted by ${esc(j.name)}</div>
      <p>${esc(j.desc)}</p>
      <div class="meta">${j.hired ? '<span class="tag green">Hired: ' + esc(j.hired.name) + '</span>' : j.apps.length + ' applicant' + (j.apps.length === 1 ? '' : 's') + ' · ' + matches + ' matching pro' + (matches === 1 ? '' : 's')}</div>
      <div class="actions">
        ${j.hired ? '' : `<button class="btn btn-primary" data-apply="${j.id}">Apply</button>`}
        <button class="btn btn-outline" data-apps="${j.id}">Applicants (${j.apps.length})</button>
        <button class="btn btn-outline" data-match="${j.id}">Find pros</button>
        <button class="btn btn-outline" data-del="${j.id}" style="color:#b3261e;border-color:#b3261e">Delete</button>
      </div></article>`;
  }).join('') : '<div class="empty">No open jobs for this trade yet. Be the first to post one.</div>';
}
function applyModal(id) {
  const j = S.jobs.find(x => x.id === id); if (!j) return;
  const workers = S.pros.filter(p => p.registered);
  if (!workers.length) { openModal(`<h3>Create a profile first</h3><p>Only registered workers can apply, so we can check your trade and experience against the job.</p><a class="btn btn-primary" href="#join" onclick="document.getElementById('modalBg').classList.remove('open')">Register as a worker</a>`); return; }
  openModal(`<h3>Apply: ${esc(j.title)}</h3>
    <p class="meta">This job needs a <strong>${esc(j.trade)}</strong> in ${esc(j.location)}.</p>
    <form id="applyForm" novalidate>
      <div class="f"><label>Apply as</label><select name="w">${workers.map(w => `<option value="${w.id}">${esc(w.name)} – ${esc(w.trade)}, ${w.exp} yrs</option>`).join('')}</select></div>
      <div class="f" style="margin-top:12px"><label>Message to the client</label><textarea name="m" placeholder="Why you are a good fit"></textarea></div>
      <div class="err" id="applyErr"></div>
      <button class="btn btn-primary" type="submit">Send application</button>
    </form>`);
  $('applyForm').onsubmit = e => {
    e.preventDefault(); const d = new FormData(e.target); const w = S.pros.find(p => p.id === d.get('w'));
    if (w.trade !== j.trade) { $('applyErr').textContent = `This job needs a ${j.trade}, but ${w.name} is registered as a ${w.trade}. Register another profile that matches.`; return; }
    if (j.apps.some(a => a.proId === w.id)) { $('applyErr').textContent = 'This profile has already applied.'; return; }
    j.apps.push({proId:w.id, name:w.name, exp:w.exp, skills:w.skills, msg:d.get('m').trim()});
    save(); renderJobs(); closeModal(); toast('Application sent');
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

/* reviews */
function renderReviews() {
  $('reviewGrid').innerHTML = S.reviews.slice(0, 6).map(r => `<div class="review">${stars(r.stars)}<p>${esc(r.text)}</p><small>${esc(r.name)} · ${esc(r.trade)} job</small></div>`).join('');
}
const renderAll = () => { renderPills(); renderPros(); renderJobs(); renderReviews(); };

/* events */
document.addEventListener('click', e => {
  const t = e.target.closest('button,a'); if (!t) return;
  if (t.dataset.t !== undefined && t.classList.contains('pill')) { f.trade = t.dataset.t; $('searchTrade').value = f.trade; renderPills(); renderPros(); }
  if (t.dataset.view) proModal(t.dataset.view);
  if (t.dataset.apply) applyModal(t.dataset.apply);
  if (t.dataset.apps) appsModal(t.dataset.apps);
  if (t.dataset.del) {
    const j = S.jobs.find(x => x.id === t.dataset.del);
    if (j && confirm('Delete the job "' + j.title + '"? This cannot be undone.')) { S.jobs = S.jobs.filter(x => x.id !== j.id); save(); renderJobs(); toast('Job deleted'); }
  }
  if (t.dataset.match) { const j = S.jobs.find(x => x.id === t.dataset.match); f.trade = j.trade; f.loc = ''; $('searchTrade').value = j.trade; $('searchLocation').value = ''; renderPills(); renderPros(); $('browse').scrollIntoView({behavior:'smooth'}); }
  if (t.dataset.hire) {
    const [jid, pid] = t.dataset.hire.split('|'); const j = S.jobs.find(x => x.id === jid); const a = j.apps.find(x => x.proId === pid);
    j.hired = {proId:pid, name:a.name}; save(); renderJobs(); closeModal(); toast(a.name + ' selected for this job');
  }
  if (t.id === 'menuToggle' || t.closest('#menuToggle')) $('navLinks').classList.toggle('open');
  else if (t.closest('#navLinks')) $('navLinks').classList.remove('open');
});
$('modalX').onclick = closeModal;
$('modalBg').onclick = e => { if (e.target === $('modalBg')) closeModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

$('searchForm').onsubmit = e => {
  e.preventDefault(); f.trade = $('searchTrade').value; f.loc = $('searchLocation').value;
  renderPills(); renderPros(); $('browse').scrollIntoView({behavior:'smooth'});
};
$('sortSelect').onchange = e => { f.sort = e.target.value; renderPros(); };
$('jobTrade').onchange = e => { jobTradeFilter = e.target.value; renderJobs(); };

$('joinForm').onsubmit = e => {
  e.preventDefault();
  const v = id => $(id).value.trim();
  const name = v('rName'), loc = v('rLoc'), exp = parseInt($('rExp').value, 10), phone = v('rPhone'), email = v('rEmail');
  const skills = v('rSkills').split(',').map(s => s.trim()).filter(Boolean);
  const err = m => { $('joinErr').textContent = m; };
  if (!name || !loc || !skills.length) return err('Enter your name, location and at least one skill.');
  if (isNaN(exp) || exp < 0) return err('Enter your years of experience (0 or more).');
  if (!phone && !email) return err('Add a phone number or email so clients can reach you.');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return err('That email address looks incomplete.');
  S.pros.unshift({id:uid(), registered:true, name, trade:$('rTrade').value, location:loc, exp, rating:0, count:0, phone, email, skills, bio:v('rBio') || 'New on JobMate.'});
  save(); e.target.reset(); err(''); f.trade = ''; f.loc = ''; f.sort = 'rating'; $('searchTrade').value = ''; $('searchLocation').value = '';
  renderAll(); toast('Profile created. You can now apply to matching jobs.'); $('browse').scrollIntoView({behavior:'smooth'});
};

$('jobForm').onsubmit = e => {
  e.preventDefault();
  const v = id => $(id).value.trim(); const err = m => { $('jobErr').textContent = m; };
  if (!v('jTitle') || !v('jLoc') || !v('jName') || !v('jContact') || !v('jDesc')) return err('Fill in the title, location, your name, contact details and job details.');
  S.jobs.unshift({id:uid(), title:v('jTitle'), trade:$('jTradeSel').value, location:v('jLoc'), budget:+$('jBudget').value || 0, name:v('jName'), contact:v('jContact'), desc:v('jDesc'), apps:[], hired:null});
  save(); e.target.reset(); err(''); jobTradeFilter = ''; $('jobTrade').value = ''; renderJobs(); toast('Job posted. Matching workers can now apply.');
};

/* reveal on scroll */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), {threshold:.1}) : null;
document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

renderAll();
})();