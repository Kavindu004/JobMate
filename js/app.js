// Home page (index.html): pros, jobs, reviews, search and the "Post a job" form.
JM.ready.then(ok => {
  if (!ok || !document.getElementById('proGrid')) return;
  try { start(); } catch (e) { console.error('JobMate home page error:', e); JM.revealAll(); }
});

function start() {
const {S, api, reload, TRADES, $, esc, toast, openModal, stars, proCard, jobCard, moreTile} = JM;
const DRAFT_KEY = 'jobmate_job_draft';                       // unsent job text only (survives the trip to the sign-up page)
const DRAFT = ['jTitle', 'jTradeSel', 'jLoc', 'jBudget', 'jDesc'];
const el = id => $(id) || {};          // a missing element never stops the rest of the page
const f = {trade: '', loc: '', sort: 'rating'};
let jobTradeFilter = '';

/* selects */
const opts = first => (first ? `<option value="">${first}</option>` : '') + TRADES.map(t => `<option>${t}</option>`).join('');
el('jTradeSel').innerHTML = opts(); el('jobTrade').innerHTML = opts('All trades');

/* pros */
function renderPills() {
  el('filterPills').innerHTML = ['', ...TRADES].map(t => `<button type="button" class="pill ${f.trade === t ? 'active' : ''}" data-t="${t}">${t || 'All'}</button>`).join('');
}
function renderPros() {
  const loc = f.loc.trim().toLowerCase();
  const list = S.pros.filter(p => (!f.trade || p.trade === f.trade) && (!loc || p.location.toLowerCase().includes(loc)));
  list.sort((a, b) => f.sort === 'experience' ? b.exp - a.exp : f.sort === 'reviews' ? b.count - a.count : b.rating - a.rating);
  el('resultCount').textContent = list.length;
  el('proGrid').innerHTML = list.length
    ? list.slice(0, 8).map(proCard).join('') + moreTile('all-pros.html')
    : '<div class="empty">No pros match yet. Try another trade or a nearby town, or post a job and let workers come to you.</div>';
}

/* jobs */
function renderJobs() {
  const list = S.jobs.filter(j => !jobTradeFilter || j.trade === jobTradeFilter);
  el('jobCount').textContent = list.length;
  el('jobGrid').innerHTML = list.length
    ? list.slice(0, 3).map(jobCard).join('') + moreTile('all-jobs.html', 'wide')
    : '<div class="empty">No open jobs for this trade yet. Be the first to post one.</div>';
}

/* reviews */
function renderReviews() {
  el('reviewGrid').innerHTML = S.reviews.slice(0, 6).map(r => `<div class="review">${stars(r.stars)}<p>${esc(r.text)}</p><small>${esc(r.name)} \u00b7 ${esc(r.trade)} job</small></div>`).join('');
}
const safe = fn => { try { fn(); } catch (e) { console.error(e); } };
const renderAll = () => { [renderPills, renderPros, renderJobs, renderReviews].forEach(safe); };
JM.setRerender(renderAll);

/* events (shared card actions live in data.js) */
document.addEventListener('click', e => {
  const t = e.target.closest('button,a'); if (!t) return;
  if (t.dataset.t !== undefined && t.classList.contains('pill')) { f.trade = t.dataset.t; $('searchTrade').value = f.trade; renderPills(); renderPros(); }
  if (t.dataset.match && $('browse')) {
    const j = S.jobs.find(x => x.id === t.dataset.match); if (!j) return;
    f.trade = j.trade; f.loc = ''; $('searchTrade').value = j.trade; $('searchLocation').value = '';
    renderPills(); renderPros(); $('browse').scrollIntoView({behavior: 'smooth'});
  }
});
el('searchForm').onsubmit = e => {
  e.preventDefault(); f.trade = $('searchTrade').value; f.loc = $('searchLocation').value;
  renderPills(); renderPros(); $('browse').scrollIntoView({behavior: 'smooth'});
};
el('sortSelect').onchange = e => { f.sort = e.target.value; renderPros(); };
el('jobTrade').onchange = e => { jobTradeFilter = e.target.value; renderJobs(); };

/* post a job (clients only) */
el('jobForm').onsubmit = async e => {
  e.preventDefault();
  const v = id => $(id).value.trim(), err = m => { $('jobErr').textContent = m; };
  const u = JM.me();
  if (!JM.has(u, 'client')) {          // must be registered as a client to post a job
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(Object.fromEntries(DRAFT.map(k => [k, $(k).value])))); } catch {}
    const url = JM.signupUrl(u ? {add: 'client', next: 'index.html#jobs'} : {role: 'client', next: 'index.html#jobs'});
    openModal(`<h3>Register as a Client</h3><p>${u ? 'Your account is not registered as a client yet.' : 'You need a client account to post a job.'} Your job details are saved and will be here when you come back.</p>
      <a class="btn btn-primary" href="${url}">Register as a Client</a>
      ${u ? '' : '<p class="meta" style="margin-top:14px">Already registered? <a href="login.html?next=index.html%23jobs" style="color:var(--steel);font-weight:700">Login</a></p>'}`);
    return;
  }
  if (!v('jTitle') || !v('jLoc') || !v('jDesc')) return err('Fill in the title, location and job details.');
  const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true;
  try {
    await api('jobs.php', {title: v('jTitle'), trade: $('jTradeSel').value, location: v('jLoc'), budget: +$('jBudget').value || 0, description: v('jDesc')});
    try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
    await reload(); e.target.reset(); err(''); jobTradeFilter = ''; $('jobTrade').value = ''; renderAll(); toast('Job posted. Matching workers can now apply.');
  } catch (x) { err(x.message); }
  btn.disabled = false;
};

el('joinBtn').onclick = e => {
  e.preventDefault();
  const u = JM.me();
  if (JM.has(u, 'worker')) { toast('You already have a worker profile.'); $('browse').scrollIntoView({behavior: 'smooth'}); return; }
  location.href = JM.signupUrl(u ? {add: 'worker', next: 'index.html#browse'} : {role: 'worker', next: 'index.html#browse'});
};

// coming back from registering as a client: restore the job details they had typed
try {
  const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
  if (draft && JM.has(JM.me(), 'client')) { DRAFT.forEach(k => { if (draft[k]) $(k).value = draft[k]; }); sessionStorage.removeItem(DRAFT_KEY); toast('You are registered as a client. Your job is ready to post.'); }
} catch {}
renderAll();
}