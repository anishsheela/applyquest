const $ = (id) => document.getElementById(id);

async function loadState() {
  const { token, email, apiBaseUrl } = await browser.storage.local.get(['token', 'email', 'apiBaseUrl']);

  if (token && email) {
    $('connectedEmail').textContent = `Connected as ${email}`;
    $('connectedView').classList.remove('hidden');
    $('loginView').classList.add('hidden');
    if (apiBaseUrl) $('apiBaseUrl').value = apiBaseUrl;
    if (email) $('email').value = email;
  } else {
    $('connectedView').classList.add('hidden');
    $('loginView').classList.remove('hidden');
  }
}

$('connectBtn').addEventListener('click', async () => {
  const apiBaseUrl = $('apiBaseUrl').value.trim().replace(/\/$/, '');
  const email = $('email').value.trim();
  const password = $('password').value;

  const errorEl = $('errorMsg');
  errorEl.classList.add('hidden');

  if (!apiBaseUrl || !email || !password) {
    errorEl.textContent = 'All fields are required.';
    errorEl.classList.remove('hidden');
    return;
  }

  const btn = $('connectBtn');
  btn.disabled = true;
  btn.textContent = 'Connecting…';

  const result = await browser.runtime.sendMessage({
    type: 'DO_LOGIN',
    payload: { apiBaseUrl, email, password },
  });

  btn.disabled = false;
  btn.textContent = 'Connect';

  if (result.success) {
    $('password').value = '';
    await loadState();
  } else {
    errorEl.textContent = result.error || 'Connection failed.';
    errorEl.classList.remove('hidden');
  }
});

$('disconnectBtn').addEventListener('click', async () => {
  await browser.runtime.sendMessage({ type: 'CLEAR_AUTH' });
  $('password').value = '';
  await loadState();
});

$('password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('connectBtn').click();
});

document.addEventListener('DOMContentLoaded', loadState);
