// Login / Register / "add a role" page.
(() => {
const {S, save, $, toast, me, has, createUser, makeWorker, makeClient, login, nextUrl} = JM;
const v = id => $(id).value.trim();
const params = new URLSearchParams(location.search);
const cur = me();
const add = ['worker', 'client'].includes(params.get('add')) ? params.get('add') : null;
 
// logged-in users only come here to add a missing role
if (cur && (!add || has(cur, add))) { location.replace(nextUrl('index.html')); return; }
 
function showTab(tab) {
  const login = tab === 'login';
  $('loginForm').hidden = !login; $('signupForm').hidden = login;
  $('tabLogin').classList.toggle('active', login); $('tabRegister').classList.toggle('active', !login);
  $('tabLogin').setAttribute('aria-selected', login); $('tabRegister').setAttribute('aria-selected', !login);
}
$('tabLogin').onclick = () => showTab('login');
$('tabRegister').onclick = () => showTab('register');
 
function setRole(role) {
  $('sRole').value = role;
  document.querySelectorAll('.au-roles button').forEach(x => x.classList.toggle('active', x.dataset.role === role));
  document.querySelectorAll('.worker-field').forEach(el => { el.hidden = role !== 'worker'; });
  document.querySelectorAll('.client-field').forEach(el => { el.hidden = role !== 'client'; });
}
document.querySelectorAll('.au-roles button').forEach(b => b.onclick = () => setRole(b.dataset.role));
 
document.querySelectorAll('.au-eye').forEach(b => b.onclick = () => {
  const input = b.previousElementSibling, show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  b.firstElementChild.className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});
 
/* initial state */
const startRole = add || (['worker', 'client'].includes(params.get('role')) ? params.get('role') : 'worker');
setRole(startRole);
showTab(params.get('tab') === 'login' ? 'login' : 'register');
if (cur) {            // add-a-role mode: account details already exist
  $('tabs').hidden = true; $('orArea').hidden = true;
  document.querySelectorAll('.acct-field').forEach(el => { el.hidden = true; });
  $('regTitle').textContent = add === 'worker' ? 'Register as a Worker' : 'Register as a Client';
  $('regSub').textContent = add === 'worker' ? 'Add your trade, skills and experience to apply for jobs. You keep the same account.' : 'Add your contact details so you can post jobs. You keep the same account.';
  $('regBtn').textContent = add === 'worker' ? 'Register as a Worker' : 'Register as a Client';
  $('sLoc').value = $('cLoc').value = cur.location || ''; $('sPhone').value = $('cPhone').value = cur.phone || '';
}
 
$('signupForm').onsubmit = e => {
  e.preventDefault();
  const err = m => { $('signupErr').textContent = m; };
  const role = $('sRole').value;
  const first = v('sFirst'), last = v('sLast'), email = v('sEmail');
  if (!cur) {
    if (!first) return err('Enter your first name.');
    if (!last) return err('Enter your last name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return err('Enter a valid email address.');
    if ($('sPass').value.length < 6) return err('Password must be at least 6 characters.');
  }
  let worker = null;
  if (role === 'worker') {
    const trade = $('sTrade').value, loc = v('sLoc'), exp = parseInt($('sExp').value, 10), phone = v('sPhone');
    const skills = v('sSkills').split(',').map(s => s.trim()).filter(Boolean);
    if (!trade) return err('Select your trade.');
    if (!loc || !skills.length) return err('Enter your location and at least one skill.');
    if (isNaN(exp) || exp < 0) return err('Enter your years of experience (0 or more).');
    if (!phone) return err('Add a phone number so clients can reach you.');
    worker = {trade, exp, skills, bio:v('sBio'), loc, phone};
  }
  let u = cur;
  if (!u) { try { u = createUser({first, last, email, password:$('sPass').value}); } catch (x) { return err(x.message); } }
  if (worker) { u.phone = worker.phone; u.location = worker.loc; makeWorker(u, worker); }
  else { u.phone = v('cPhone') || u.phone; u.location = v('cLoc') || u.location; makeClient(u); }
  S.me = u.id; save();
  location.href = nextUrl(role === 'worker' ? 'profile.html' : 'index.html#jobs');
};
 
$('loginForm').onsubmit = e => {
  e.preventDefault();
  const err = m => { $('loginErr').textContent = m; };
  if (!/^\S+@\S+\.\S+$/.test(v('lEmail'))) return err('Enter a valid email address.');
  if (!$('lPass').value) return err('Enter your password.');
  if (!login(v('lEmail'), $('lPass').value)) return err('Incorrect email or password.');
  location.href = nextUrl('index.html');
};
$('forgotLink').onclick = e => { e.preventDefault(); toast('Password reset will be available once the backend is connected.'); };
document.querySelector('.au-social').onclick = e => { if (e.target.closest('button')) toast('Social sign-in is coming soon.'); };
})();