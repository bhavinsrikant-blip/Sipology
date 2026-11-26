
import { supabase, supabaseConfigured } from './supabaseClient.js';

const loginPanel = document.querySelector('#login-panel');
const dashboard = document.querySelector('#dashboard');
const loginForm = document.querySelector('#login-form');
const loginMsg = document.querySelector('#login-message');
const saveMsg = document.querySelector('#save-message');
const itemsList = document.querySelector('#items-list');
const itemForm = document.querySelector('#item-form');
const profileForm = document.querySelector('#profile-form');

const byId = id => document.getElementById(id);
let currentItems = [];
let authCheckInProgress = false;

function showDashboard(on) {
  loginPanel.hidden = on;
  dashboard.hidden = !on;
}

if (!supabaseConfigured || !supabase) {
  loginMsg.textContent =
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.';
  loginForm.querySelector('button').disabled = true;
}

// Verify authorization using the secure database function,
// rather than querying the protected admin table directly.
async function verifyAdmin(session) {
  if (authCheckInProgress) return;
  authCheckInProgress = true;

  try {
    if (!session) {
      showDashboard(false);
      return;
    }

    const { data, error } = await supabase.rpc('is_sipology_admin');

    if (error || data !== true) {
      await supabase.auth.signOut();
      showDashboard(false);
      loginMsg.textContent = 'This account is not authorized as an admin.';
      return;
    }

    showDashboard(true);
    await loadProfile();
    await loadItems();
  } catch (err) {
    showDashboard(false);
    loginMsg.textContent = err.message || 'Unable to verify admin access.';
  } finally {
    authCheckInProgress = false;
  }
}

if (supabase) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      loginMsg.textContent = error.message;
      return;
    }
    verifyAdmin(data.session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    verifyAdmin(session);
  });
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();

  if (!supabase) return;

  loginMsg.textContent = 'Signing in…';

  const { error } = await supabase.auth.signInWithPassword({
    email: byId('email').value.trim(),
    password: byId('password').value
  });

  if (error) {
    loginMsg.textContent = error.message;
  } else {
    loginMsg.textContent = '';
  }
});

byId('signout').addEventListener('click', async () => {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();

  if (error) {
    loginMsg.textContent = error.message;
  }
});

function clearForm() {
  itemForm.reset();
  byId('item-id').value = '';
  byId('item-active').checked = true;
  byId('form-title').textContent = 'Add a menu item';
  saveMsg.textContent = '';
}

byId('cancel-edit').addEventListener('click', clearForm);

async function loadItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order')
    .order('name');

  if (error) {
    itemsList.textContent = error.message;
    return;
  }

  currentItems = data || [];
  renderItems();
}

function renderItems() {
  itemsList.replaceChildren();

  for (const item of currentItems) {
    const row = document.createElement('article');
    row.className = 'item-row' + (item.available ? '' : ' muted');

    const content = document.createElement('div');

    const name = document.createElement('strong');
    name.textContent = item.name;

    const desc = document.createElement('p');
    desc.textContent = item.description || '';

    const meta = document.createElement('small');
    meta.textContent =
      `${item.category} · ₹${Number(item.price).toLocaleString('en-IN')} · ${item.available ? 'Available' : 'Hidden'}`;

    content.append(name, desc, meta);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => fillForm(item));

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'secondary';

    del.addEventListener('click', async () => {
      if (!confirm(`Delete ${item.name}?`)) return;

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id);

      if (error) {
        alert(error.message);
      } else {
        await loadItems();
      }
    });

    actions.append(edit, del);
    row.append(content, actions);
    itemsList.append(row);
  }
}

function fillForm(item) {
  byId('item-id').value = item.id;
  byId('item-name').value = item.name;

  // Translate stored category names to the HTML select values.
  const categoryMap = {
    'Coffee': 'coffee',
    'Non-Coffee': 'drinks',
    'Bakery': 'bakery',
    'Little Plates': 'plates'
  };

  byId('item-category').value = categoryMap[item.category] || 'coffee';
  byId('item-price').value = item.price;
  byId('item-tag').value = '';
  byId('item-description').value = item.description || '';
  byId('item-image').value = '';
  byId('item-active').checked = !!item.available;
  byId('form-title').textContent = 'Edit menu item';

  itemForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

itemForm.addEventListener('submit', async e => {
  e.preventDefault();

  if (!supabase) return;

  saveMsg.textContent = 'Saving…';

  const categoryMap = {
    'coffee': 'Coffee',
    'drinks': 'Non-Coffee',
    'bakery': 'Bakery',
    'plates': 'Little Plates'
  };

  const payload = {
    name: byId('item-name').value.trim(),
    category: categoryMap[byId('item-category').value],
    price: Number(byId('item-price').value),
    description: byId('item-description').value.trim(),
    available: byId('item-active').checked
  };

  if (
    !payload.name ||
    !Number.isFinite(payload.price) ||
    payload.price < 0
  ) {
    saveMsg.textContent = 'Please enter a valid name and price.';
    return;
  }

  const id = byId('item-id').value;

  const result = id
    ? await supabase.from('menu_items').update(payload).eq('id', id)
    : await supabase.from('menu_items').insert(payload);

  if (result.error) {
    saveMsg.textContent = result.error.message;
    return;
  }

  saveMsg.textContent = 'Saved.';
  clearForm();
  await loadItems();
});

// Cafe profile
async function loadProfile() {
  const { data, error } = await supabase
    .from('cafe_settings')
    .select('cafe_name,cafe_slug')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    byId('profile-message').textContent = error.message;
    return;
  }

  if (data) {
    byId('cafe-name').value = data.cafe_name || 'Sipology';
    byId('cafe-slug').value = data.cafe_slug || 'sipology';
  }
}

profileForm.addEventListener('submit', async e => {
  e.preventDefault();

  if (!supabase) return;

  const msg = byId('profile-message');
  msg.textContent = 'Saving…';

  const { error } = await supabase
    .from('cafe_settings')
    .update({
      cafe_name: byId('cafe-name').value.trim(),
      cafe_slug: byId('cafe-slug').value.trim()
    })
    .eq('id', 1);

  msg.textContent = error
    ? error.message
    : 'Profile saved. Refresh the public website to see the name change.';
});
