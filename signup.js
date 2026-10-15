// Login / Register page. Worker sign-ups become pros; clients continue to the jobs.
(() => {
const {S, save, $, uid, toast} = JM;
const v = id => $(id).value.trim();

/* tabs */
function showTab(tab) {
  const login = tab === 'login';
  $('loginForm').hidden = !login; $('signupForm').hidden = login;
  $('tabLogin').classList.toggle('active', login); $('tabRegister').classList.toggle('active', !login);
  $('tabLogin').setAttribute('aria-selected', login); $('tabRegister').setAttribute('aria-selected', !login);
}
$('tabLogin').onclick = () => showTab('login');
$('tabRegister').onclick = () => showTab('register');
showTab(new URLSearchParams(location.search).get('tab') === 'login' || location.hash === '#login' ? 'login' : 'register');

/* worker / client toggle */
document.querySelectorAll('.au-roles button').forEach(b => b.onclick = () => {
  const role = b.dataset.role; $('sRole').value = role;
  document.querySelectorAll('.au-roles button').forEach(x => x.classList.toggle('active', x === b));
  document.querySelectorAll('.worker-field').forEach(el => { el.hidden = role !== 'worker'; });
});

/* show / hide password */
document.querySelectorAll('.au-eye').forEach(b => b.onclick = () => {
  const input = b.previousElementSibling, show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  b.firstElementChild.className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

/* register */
$('signupForm').onsubmit = e => {
  e.preventDefault();
  const err = m => { $('signupErr').textContent = m; };
  const role = $('sRole').value, name = v('sName'), email = v('sEmail');
  if (!name) return err('Enter your full name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return err('Enter a valid email address.');
  if ($('sPass').value.length < 6) return err('Password must be at least 6 characters.');
  if (role === 'client') { location.href = 'index.html#jobs'; return; }

  const trade = $('sTrade').value, loc = v('sLoc'), exp = parseInt($('sExp').value, 10), phone = v('sPhone');
  const skills = v('sSkills').split(',').map(s => s.trim()).filter(Boolean);
  if (!trade) return err('Select your trade.');
  if (!loc || !skills.length) return err('Enter your location and at least one skill.');
  if (isNaN(exp) || exp < 0) return err('Enter your years of experience (0 or more).');
  if (!phone) return err('Add a phone number so clients can reach you.');
  S.pros.unshift({id:uid(), registered:true, name, trade, location:loc, exp, rating:0, count:0, phone, email, skills, bio:v('sBio') || 'New on JobMate.'});
  save();
  location.href = 'index.html#browse';
};

/* login (UI only until the backend exists) */
$('loginForm').onsubmit = e => {
  e.preventDefault();
  const err = m => { $('loginErr').textContent = m; };
  if (!/^\S+@\S+\.\S+$/.test(v('lEmail'))) return err('Enter a valid email address.');
  if (!$('lPass').value) return err('Enter your password.');
  err(''); toast('Login will work once the backend is connected.');
};
$('forgotLink').onclick = e => { e.preventDefault(); toast('Password reset will be available once the backend is connected.'); };
document.querySelector('.au-social').onclick = e => { if (e.target.closest('button')) toast('Social sign-in is coming soon.'); };
})();