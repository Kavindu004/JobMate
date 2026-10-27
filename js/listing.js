// Search + location filter for all-pros.html and all-jobs.html (filters on the same page, no reloads).
JM.ready.then(ok => { if (ok) start(); });

function start() {
const {S, $, esc, proCard, jobCard, setRerender} = JM;
const isPros = document.body.dataset.page === 'pros';
const params = new URLSearchParams(location.search);
$('q').value = params.get('q') || '';
$('loc').value = params.get('loc') || '';
const norm = s => String(s || '').toLowerCase();
const source = () => isPros ? S.pros : S.jobs;
const haystack = isPros ? p => [p.name, p.trade, p.location, p.bio, ...p.skills].join(' ') : j => [j.title, j.trade, j.location, j.desc, j.name].join(' ');

function render() {
  const words = norm($('q').value).split(/\s+/).filter(Boolean), loc = norm($('loc').value).trim();
  const list = source().filter(x => { const h = norm(haystack(x)); return words.every(w => h.includes(w)) && (!loc || norm(x.location).includes(loc)); });
  if (isPros) list.sort((a, b) => b.rating - a.rating);
  $('count').textContent = list.length;
  $('grid').innerHTML = list.length ? list.map(isPros ? proCard : jobCard).join('')
    : `<div class="empty">${isPros ? 'No pros' : 'No jobs'} match your search. Try different keywords or clear the location.</div>`;
}
$('locList').innerHTML = [...new Set(source().map(x => x.location))].sort().map(l => `<option value="${esc(l)}">`).join('');
$('q').addEventListener('input', render);
$('loc').addEventListener('input', render);
$('listForm').addEventListener('submit', e => e.preventDefault());
setRerender(render);
render();
}