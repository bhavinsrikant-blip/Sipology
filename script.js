const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

function setNavigation(open) {
  if (!toggle || !nav) return;
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

toggle?.addEventListener('click', () => {
  setNavigation(toggle.getAttribute('aria-expanded') !== 'true');
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setNavigation(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    setNavigation(false);
    toggle?.focus();
  }
});

const tabs = [...document.querySelectorAll('.menu-tab')];
const cards = [...document.querySelectorAll('.menu-card')];
const menuGrid = document.querySelector('#menu-grid');

function activateTab(tab, moveFocus = false) {
  if (!tab) return;
  const filter = tab.dataset.filter;
  tabs.forEach(item => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  if (menuGrid) menuGrid.setAttribute('aria-labelledby', tab.id);
  cards.forEach(card => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('hide', !show);
    card.setAttribute('aria-hidden', String(!show));
  });
  if (moveFocus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    activateTab(tabs[nextIndex], true);
  });
});
