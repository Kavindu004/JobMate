// My Profile, Edit Profile and Help & Support pages.
JM.ready.then(ok => { if (ok) start(); });

function start() {
const {S, api, TRADES, $, esc, toast, me, has, fullName, avatarHtml, signupUrl} = JM;
const page = document.body.dataset.page, root = $('root'), u = me();

const loginPrompt = () => { root.innerHTML = `<div class="acct-card"><h2>Please log in</h2><p>You need to be logged in to see this page.</p><a class="btn btn-primary" href="login.html?next=${page === 'edit' ? 'edit-profile.html' : 'profile.html'}">Login</a> <a class="btn btn-outline" href="signup.html">Sign Up</a></div>`; };
const row = (label, val, full) => `<div class="${full ? 'full' : ''}"><dt>${label}</dt><dd>${val ? esc(val) : '<span class="meta">Not added</span>'}</dd></div>`;

/* ---------------- MY PROFILE ---------------- */
function profile() {
  if (!u) return loginPrompt();
  const p = S.pros.find(x => x.id === u.proId);
  const posted = S.jobs.filter(j => j.ownerId === u.id), applied = S.jobs.filter(j => u.proId && j.apps.some(a => a.proId === u.proId));
  const member = new Date(u.created).toLocaleDateString('en-GB', {month: 'long', year: 'numeric'});
  root.innerHTML = `
    <div class="prof-card">
      <div class="prof-head">
        <div class="prof-avatar">${avatarHtml(u)}</div>
        <div class="grow"><h1>${esc(fullName(u))}</h1><div class="meta">${esc(u.email)}</div>
          <div style="margin-top:8px">${u.roles.map(r => `<span class="tag ${r === 'worker' ? 'amber' : ''}">${r === 'worker' ? 'Worker' : 'Client'}</span>`).join('')}</div></div>
        <a class="btn btn-primary" href="edit-profile.html">Edit Profile</a>
      </div>
      <dl class="prof-grid">
        ${row('First name', u.first)}${row('Last name', u.last)}${row('Email', u.email)}${row('Phone', u.phone)}${row('Location', u.location)}${row('Member since', member)}
      </dl>
    </div>
    ${has(u, 'worker') && p ? `<div class="acct-card"><h2>Worker profile</h2>
      <dl class="prof-grid">${row('Trade', p.trade)}${row('Experience', p.exp + ' years')}
        <div class="full"><dt>Skills</dt><dd>${p.skills.map(s => `<span class="tag">${esc(s)}</span>`).join('')}</dd></div>
        ${row('About', p.bio, true)}${row('Rating', p.count ? p.rating.toFixed(1) + ' / 5 (' + p.count + ' reviews)' : 'No reviews yet')}${row('Applications sent', String(applied.length))}</dl></div>` : ''}
    ${has(u, 'client') ? `<div class="acct-card"><h2>Client account</h2>
      <dl class="prof-grid">${row('Jobs posted', String(posted.length))}${row('Hired so far', String(posted.filter(j => j.hired).length))}</dl>
      <div class="form-actions"><a class="btn btn-outline" href="all-jobs.html">View all jobs</a></div></div>` : ''}
    ${!has(u, 'worker') || !has(u, 'client') ? `<div class="acct-card"><h2>${!has(u, 'worker') ? 'Want to find work too?' : 'Want to hire too?'}</h2>
      <p class="meta">Your account can do both. Add the other role in one step.</p>
      <a class="btn btn-primary" href="${signupUrl({add: !has(u, 'worker') ? 'worker' : 'client', next: 'profile.html'})}">Register as a ${!has(u, 'worker') ? 'Worker' : 'Client'}</a></div>` : ''}`;
  if (new URLSearchParams(location.search).get('saved')) toast('Profile updated');
}

/* ---------------- EDIT PROFILE ---------------- */
function edit() {
  if (!u) return loginPrompt();
  const p = S.pros.find(x => x.id === u.proId), worker = has(u, 'worker') && p;
  let photo = u.photo || '', newPhoto = null, removed = false;     // newPhoto = cropped picture waiting to be saved
  root.innerHTML = `<form class="acct-card" id="editForm" novalidate>
    <h2>Edit Profile</h2><p class="meta" style="margin:0 0 20px">Changes appear everywhere your profile is shown.</p>
    <div class="photo-row"><div class="prof-avatar" id="ePrev"></div>
      <div><label class="btn btn-outline" style="cursor:pointer">Change picture<input type="file" id="ePhoto" accept="image/*" hidden></label>
        <button type="button" class="btn btn-outline" id="eRemove" style="margin-left:8px">Remove</button>
        <div class="meta" style="margin-top:6px">JPG or PNG, cropped to a square.</div></div></div>
    <div class="form-grid">
      <div class="f"><label for="eFirst">First name</label><input id="eFirst" value="${esc(u.first)}"></div>
      <div class="f"><label for="eLast">Last name</label><input id="eLast" value="${esc(u.last)}"></div>
      <div class="f full"><label for="eEmail">Email</label><input id="eEmail" type="email" value="${esc(u.email)}"></div>
      <div class="f"><label for="ePhone">Phone</label><input id="ePhone" type="tel" value="${esc(u.phone)}"></div>
      <div class="f"><label for="eLoc">Location</label><input id="eLoc" value="${esc(u.location)}"></div>
      ${worker ? `<div class="f"><label for="eTrade">Trade</label><select id="eTrade">${TRADES.map(t => `<option ${t === p.trade ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="f"><label for="eExp">Years of experience</label><input id="eExp" type="number" min="0" max="60" value="${p.exp}"></div>
      <div class="f full"><label for="eSkills">Skills (comma separated)</label><input id="eSkills" value="${esc(p.skills.join(', '))}"></div>
      <div class="f full"><label for="eBio">About your work</label><textarea id="eBio">${esc(p.bio)}</textarea></div>` : ''}
    </div>
    <div class="err" id="eErr"></div>
    <div class="form-actions"><button class="btn btn-primary" type="submit" id="eSave">Save Changes</button><a class="btn btn-outline" href="profile.html">Cancel</a></div>
  </form>`;
  const prev = () => { $('ePrev').innerHTML = photo ? `<img src="${esc(photo)}" alt="">` : esc(((($('eFirst').value || u.first)[0] || '') + (($('eLast').value || u.last)[0] || '')).toUpperCase()); };
  prev(); $('eFirst').oninput = $('eLast').oninput = prev;
  $('eRemove').onclick = () => { photo = ''; newPhoto = null; removed = true; prev(); };
  $('ePhoto').onchange = ev => {
    const file = ev.target.files[0]; if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Please choose an image file.');
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = 192;
      const s = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 192, 192);
      newPhoto = photo = c.toDataURL('image/jpeg', .85); removed = false; prev(); URL.revokeObjectURL(img.src);
    };
    img.onerror = () => toast('That image could not be read.');
    img.src = URL.createObjectURL(file);
  };
  $('editForm').onsubmit = async ev => {
    ev.preventDefault();
    const v = id => $(id).value.trim(), err = m => { $('eErr').textContent = m; };
    if (!v('eFirst') || !v('eLast')) return err('Enter your first and last name.');
    if (!/^\S+@\S+\.\S+$/.test(v('eEmail'))) return err('Enter a valid email address.');
    const data = {first: v('eFirst'), last: v('eLast'), email: v('eEmail'), phone: v('ePhone'), location: v('eLoc')};
    if (worker) {
      const skills = v('eSkills').split(',').map(s => s.trim()).filter(Boolean), exp = parseInt($('eExp').value, 10);
      if (!data.location || !data.phone) return err('Workers need a location and a phone number.');
      if (!skills.length) return err('Add at least one skill.');
      if (isNaN(exp) || exp < 0) return err('Enter your years of experience (0 or more).');
      Object.assign(data, {trade: $('eTrade').value, exp, skills, bio: v('eBio')});
    }
    if (newPhoto) data.photoData = newPhoto; else if (removed) data.removePhoto = true;
    $('eSave').disabled = true; err('');
    try { await api('profile.php', data); location.href = 'profile.html?saved=1'; }
    catch (x) { err(x.message); $('eSave').disabled = false; }
  };
}

/* ---------------- HELP & SUPPORT ---------------- */
function help() {
  const faqs = [
    ['How do I find a worker?', 'Use "Find a pro" on the home page or the View more page. Search by trade, skill or location, open a profile and send a hire request.'],
    ['How do I apply for a job?', 'Register as a Worker, then press Apply on a job that matches your trade. Your profile is sent to the client automatically.'],
    ['How do I post a job?', 'Register as a Client, then fill in the Post a job form on the home page. Matching workers can apply and you choose who to hire.'],
    ['Can one account find work and hire?', 'Yes. Open My Profile and add the other role (Worker or Client) in one step. You keep the same login.'],
    ['Why can I only apply to some jobs?', 'You can only apply to jobs that match your registered trade, so clients see relevant applicants.'],
    ['How do I change my details or picture?', 'Open the profile circle in the top bar and choose Edit Profile.']
  ];
  root.innerHTML = `<div class="acct-card"><h2>Help &amp; Support</h2><p class="meta" style="margin:0 0 12px">Quick answers to common questions.</p>
    <div class="faq">${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div>
    <form class="acct-card" id="helpForm" novalidate><h2>Still need help?</h2><p class="meta" style="margin:0 0 16px">Send us a message and we will reply by email.</p>
      <div class="form-grid">
        <div class="f"><label for="hName">Your name</label><input id="hName" value="${u ? esc(fullName(u)) : ''}"></div>
        <div class="f"><label for="hEmail">Email</label><input id="hEmail" type="email" value="${u ? esc(u.email) : ''}"></div>
        <div class="f full"><label for="hMsg">How can we help?</label><textarea id="hMsg"></textarea></div></div>
      <div class="err" id="hErr"></div><div class="form-actions"><button class="btn btn-primary" type="submit">Send message</button></div></form>`;
  $('helpForm').onsubmit = async ev => {
    ev.preventDefault();
    const name = $('hName').value.trim(), email = $('hEmail').value.trim(), message = $('hMsg').value.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) { $('hErr').textContent = 'Enter your name, a valid email and your message.'; return; }
    try { await api('support.php', {name, email, message}); $('hMsg').value = ''; $('hErr').textContent = ''; toast('Message sent. We will reply by email.'); }
    catch (x) { $('hErr').textContent = x.message; }
  };
}
({profile, edit, help})[page]();
}