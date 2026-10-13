// Connects signup.html to the shared data (data.js). Worker sign-ups become pros; clients just continue to the jobs.
(() => {
const {S, save, $, uid} = JM;

$('signupForm').onsubmit = e => {
  e.preventDefault();
  const v = id => $(id).value.trim(), err = m => { $('signupErr').textContent = m; };
  const role = $('sRole').value, name = v('sName'), email = v('sEmail');
  if (!name) return err('Enter your full name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return err('Enter a valid email address.');
  if ($('sPass').value.length < 6) return err('Password must be at least 6 characters.');

  if (role === 'client') { location.href = 'index.html#jobs'; return; }   // no profile needed for clients

  const loc = v('sLoc'), exp = parseInt($('sExp').value, 10), phone = v('sPhone');
  const skills = v('sSkills').split(',').map(s => s.trim()).filter(Boolean);
  if (!loc || !skills.length) return err('Enter your location and at least one skill.');
  if (isNaN(exp) || exp < 0) return err('Enter your years of experience (0 or more).');
  if (!phone) return err('Add a phone number so clients can reach you.');

  S.pros.unshift({id:uid(), registered:true, name, trade:$('sTrade').value, location:loc, exp, rating:0, count:0, phone, email, skills, bio:v('sBio') || 'New on JobMate.'});
  save();
  location.href = 'index.html#browse';
};
})();