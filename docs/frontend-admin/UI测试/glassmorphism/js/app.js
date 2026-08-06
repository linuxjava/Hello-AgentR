function initIcons() {
  if (window.lucide) lucide.createIcons();
}

function initNavGroups() {
  document.querySelectorAll('[data-nav-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.nav-group');
      if (group) group.classList.toggle('collapsed');
    });
  });
}

function initModal() {
  const overlay = document.getElementById('create-kb-modal');
  if (!overlay) return;

  const openers = document.querySelectorAll('[data-open-create-kb]');
  const closers = overlay.querySelectorAll('[data-close-modal]');

  openers.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      initIcons();
    });
  });

  closers.forEach((el) => {
    el.addEventListener('click', () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  overlay.querySelectorAll('.type-card').forEach((card) => {
    card.addEventListener('click', () => {
      overlay.querySelectorAll('.type-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      initIcons();
    });
  });
}

function initFilters() {
  document.querySelectorAll('.filter-bar .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const bar = chip.closest('.filter-bar');
      bar.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initNavGroups();
  initModal();
  initFilters();
  const params = new URLSearchParams(window.location.search);
  if (params.get('create') === '1') {
    const overlay = document.getElementById('create-kb-modal');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      initIcons();
    }
  }
});
