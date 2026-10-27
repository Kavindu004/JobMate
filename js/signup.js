// Login / Register / "add a role" page. Everything is sent to the PHP API.
JM.ready.then(ok => { if (ok) start(); });

function start() {
const {api, $, toast, me, has, nextUrl} = JM;
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
setRole(add || (['worker', 'client'].includes(params.get('role')) ? params.get('role') : 'worker'));
showTab(params.get('tab') === 'login' ? 'login' : 'register');
if (cur) {            // add-a-role mode: account details already exist
  $('tabs').hidden = true; $('orArea').hidden = true;
  document.querySelectorAll('.acct-field').forEach(el => { el.hidden = true; });
  $('regTitle').textContent = add === 'worker' ? 'Register as a Worker' : 'Register as a Client';
  $('regSub').textContent = add === 'worker' ? 'Add your trade, skills and experience to apply for jobs. You keep the same account.' : 'Add your contact details so you can post jobs. You keep the same account.';
  $('regBtn').textContent = add === 'worker' ? 'Register as a Worker' : 'Register as a Client';
  $('sLoc').value = $('cLoc').value = cur.location || ''; $('sPhone').value = $('cPhone').value = cur.phone || '';
}

$('signupForm').onsubmit = async e => {
  e.preventDefault();
  const err = m => { $('signupErr').textContent = m; };
  const role = $('sRole').value;
  const first = v('sFirst'), last = v('sLast'), email = v('sEmail'), password = $('sPass').value;
  if (!cur) {
    if (!first) return err('Enter your first name.');
    if (!last) return err('Enter your last name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return err('Enter a valid email address.');
    if (password.length < 6) return err('Password must be at least 6 characters.');
  }
  const data = {role};
  if (role === 'worker') {
    const trade = $('sTrade').value, location = v('sLoc'), exp = parseInt($('sExp').value, 10), phone = v('sPhone');
    const skills = v('sSkills').split(',').map(s => s.trim()).filter(Boolean);
    if (!trade) return err('Select your trade.');
    if (!location || !skills.length) return err('Enter your location and at least one skill.');
    if (isNaN(exp) || exp < 0) return err('Enter your years of experience (0 or more).');
    if (!phone) return err('Add a phone number so clients can reach you.');
    Object.assign(data, {trade, location, exp, phone, skills, bio: v('sBio')});
  } else {
    Object.assign(data, {phone: v('cPhone'), location: v('cLoc')});
  }
  const btn = $('regBtn'); btn.disabled = true; err('');
  try {
    if (cur) await api('add_role.php', data);
    else await api('register.php', {...data, first, last, email, password});
    location.href = nextUrl(role === 'worker' ? 'profile.html' : 'index.html#jobs');
  } catch (x) { err(x.message); btn.disabled = false; }
};

$('loginForm').onsubmit = async e => {
  e.preventDefault();
  const err = m => { $('loginErr').textContent = m; };
  if (!/^\S+@\S+\.\S+$/.test(v('lEmail'))) return err('Enter a valid email address.');
  if (!$('lPass').value) return err('Enter your password.');
  const btn = e.target.querySelector('button[type=submit]'); btn.disabled = true; err('');
  try { await api('login.php', {email: v('lEmail'), password: $('lPass').value}); location.href = nextUrl('index.html'); }
  catch (x) { err(x.message); btn.disabled = false; }
};
$('forgotLink').onclick = e => { e.preventDefault(); toast('Password reset will be available once email sending is set up.'); };
document.querySelector('.au-social').onclick = e => { if (e.target.closest('button')) toast('Social sign-in is coming soon.'); };
}