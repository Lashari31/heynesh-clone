// Port of the original's in-page anchor handler.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, null, ' ');
  });
});
