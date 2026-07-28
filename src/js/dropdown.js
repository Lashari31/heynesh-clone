// Replacement for Webflow's dropdown component, which drives the FAQ accordion.
// The original only toggles `w--open` on the toggle and the list; every visual
// change (grid-template-rows 0fr -> 1fr, the "+" bar rotating 90deg) is CSS.
const dropdowns = [...document.querySelectorAll('.w-dropdown')];

const close = (dd) => {
  dd.querySelector('.w-dropdown-toggle')?.classList.remove('w--open');
  dd.querySelector('.w-dropdown-list')?.classList.remove('w--open');
  dd.querySelector('.w-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
};

const open = (dd) => {
  dd.querySelector('.w-dropdown-toggle')?.classList.add('w--open');
  dd.querySelector('.w-dropdown-list')?.classList.add('w--open');
  dd.querySelector('.w-dropdown-toggle')?.setAttribute('aria-expanded', 'true');
};

for (const dd of dropdowns) {
  const toggle = dd.querySelector('.w-dropdown-toggle');
  if (!toggle) continue;

  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');
  toggle.setAttribute('aria-expanded', 'false');

  const onActivate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = toggle.classList.contains('w--open');
    // Webflow behaves as one-at-a-time: opening another closes the previous.
    dropdowns.forEach(close);
    if (!isOpen) open(dd);
  };

  toggle.addEventListener('click', onActivate);
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') onActivate(e);
  });
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.w-dropdown')) dropdowns.forEach(close);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') dropdowns.forEach(close);
});
