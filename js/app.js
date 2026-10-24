(() => {
if (!document.getElementById('proGrid')) return; // other pages (e.g. signup.html) do not have the home sections
const {S, save, TRADES, $, esc, uid, toast, openModal, stars, rup, proCard, jobCard, moreTile} = JM;
const DRAFT = ['jTitle','jTradeSel','jLoc','jBudget','jDesc'];
const f = {trade:'', loc:'', sort:'rating'};
let jobTradeFilter = '';


/* selects */
const opts = (first) => (first ? `<option value="">${first}</option>` : '') + TRADES.map(t => `<option>${t}</option>`).join('');
$('jTradeSel').innerHTML = opts(); $('jobTrade').innerHTML = opts('All trades');

/* pros */
function renderPills() {
  $('filterPills').innerHTML = ['', ...TRADES].map(t => `<button type="button" class="pill ${f.trade === t ? 'active' : ''}" data-t="${t}">${t || 'All'}</button>`).join('');
}
function renderPros() {
  const loc = f.loc.trim().toLowerCase();
  let list = S.pros.filter(p => (!f.trade || p.trade === f.trade) && (!loc || p.location.toLowerCase().includes(loc)));
  list.sort((a, b) => f.sort === 'experience' ? b.exp - a.exp : f.sort === 'reviews' ? b.count - a.count : b.rating - a.rating);
  $('resultCount').textContent = list.length;
  $('proGrid').innerHTML = list.length
    ? list.slice(0, 8).map(proCard).join('') + moreTile('all-pros.html')
    : '<div class="empty">No pros match yet. Try another trade or a nearby town, or post a job and let workers come to you.</div>';
}

/* jobs */
function renderJobs() {
  const list = S.jobs.filter(j => !jobTradeFilter || j.trade === jobTradeFilter);
  $('jobCount').textContent = list.length;
  $('jobGrid').innerHTML = list.length
    ? list.slice(0, 3).map(jobCard).join('') + moreTile('all-jobs.html', 'wide')
    : '<div class="empty">No open jobs for this trade yet. Be the first to post one.</div>';
}

/* reviews */
function renderReviews() {
  $('reviewGrid').innerHTML = S.reviews.slice(0, 6).map(r => `<div class="review">${stars(r.stars)}<p>${esc(r.text)}</p><small>${esc(r.name)} · ${esc(r.trade)} job</small></div>`).join('');
}
const renderAll = () => { renderPills(); renderPros(); renderJobs(); renderReviews(); };
JM.setRerender(renderAll);

/* events (home page only; shared card actions live in data.js) */
document.addEventListener('click', e => {
  const t = e.target.closest('button,a'); if (!t) return;
  if (t.dataset.t !== undefined && t.classList.contains('pill')) { f.trade = t.dataset.t; $('searchTrade').value = f.trade; renderPills(); renderPros(); }
  if (t.dataset.match && $('browse')) {
    const j = S.jobs.find(x => x.id === t.dataset.match); f.trade = j.trade; f.loc = '';
    $('searchTrade').value = j.trade; $('searchLocation').value = ''; renderPills(); renderPros(); $('browse').scrollIntoView({behavior:'smooth'});
  }
});

$('searchForm').onsubmit = e => {
  e.preventDefault(); f.trade = $('searchTrade').value; f.loc = $('searchLocation').value;
  renderPills(); renderPros(); $('browse').scrollIntoView({behavior:'smooth'});
};
$('sortSelect').onchange = e => { f.sort = e.target.value; renderPros(); };
$('jobTrade').onchange = e => { jobTradeFilter = e.target.value; renderJobs(); };

$('jobForm').onsubmit = e => {
  e.preventDefault();
  const v = id => $(id).value.trim(), err = m => { $('jobErr').textContent = m; };
  const u = JM.me();
  if (!JM.has(u, 'client')) {          // must be registered as a client to post a job
    S.draft = Object.fromEntries(DRAFT.map(k => [k, $(k).value])); save();
    const url = JM.signupUrl(u ? {add:'client', next:'index.html#jobs'} : {role:'client', next:'index.html#jobs'});
    openModal(`<h3>Register as a Client</h3><p>${u ? 'Your account is not registered as a client yet.' : 'You need a client account to post a job.'} Your job details are saved and will be here when you come back.</p>
      <a class="btn btn-primary" href="${url}">Register as a Client</a>
      ${u ? '' : '<p class="meta" style="margin-top:14px">Already registered? <a href="login.html?next=index.html%23jobs" style="color:var(--steel);font-weight:700">Login</a></p>'}`);
    return;
  }
  if (!v('jTitle') || !v('jLoc') || !v('jDesc')) return err('Fill in the title, location and job details.');
  S.jobs.unshift({id:uid(), title:v('jTitle'), trade:$('jTradeSel').value, location:v('jLoc'), budget:+$('jBudget').value || 0, name:JM.fullName(u), contact:u.phone || u.email, desc:v('jDesc'), ownerId:u.id, apps:[], hired:null});
  S.draft = null; save(); e.target.reset(); err(''); jobTradeFilter = ''; $('jobTrade').value = ''; renderJobs(); toast('Job posted. Matching workers can now apply.');
};

$('joinBtn').onclick = e => {
  e.preventDefault();
  const u = JM.me();
  if (JM.has(u, 'worker')) { toast('You already have a worker profile.'); $('browse').scrollIntoView({behavior:'smooth'}); return; }
  location.href = JM.signupUrl(u ? {add:'worker', next:'index.html#browse'} : {role:'worker', next:'index.html#browse'});
};

/* reveal on scroll */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), {threshold:.1}) : null;
document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

// coming back from registering as a client: restore the job details they had typed
if (JM.has(JM.me(), 'client') && S.draft) { DRAFT.forEach(k => { if (S.draft[k]) $(k).value = S.draft[k]; }); S.draft = null; save(); toast('You are registered as a client. Your job is ready to post.'); }
renderAll();
})();