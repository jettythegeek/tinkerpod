(() => {
  // Lightbox
  const lb = document.getElementById('lb');
  if (lb) {
    const img = document.getElementById('lbi'), t = document.getElementById('lbt'),
          h = document.getElementById('lbh'), d = document.getElementById('lbd');
    const close = () => { lb.hidden = true; img.removeAttribute('src'); document.body.style.overflow = ''; };
    document.addEventListener('click', e => {
      const a = e.target.closest('a[data-lightbox]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      img.className = ''; img.src = a.getAttribute('href'); img.alt = a.dataset.title || '';
      t.textContent = a.dataset.title || '';
      d.href = a.getAttribute('href');
      if (a.dataset.html) { h.href = a.dataset.html; h.hidden = false; } else { h.hidden = true; }
      lb.hidden = false; document.body.style.overflow = 'hidden';
    });
    img.addEventListener('click', () => img.classList.toggle('zoom'));
    document.getElementById('lbx').addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lbimg')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });
  }
  // Sound play buttons (one at a time)
  let cur = null, curBtn = null;
  const stop = () => { if (cur) { cur.pause(); cur.currentTime = 0; } if (curBtn) { curBtn.classList.remove('on'); curBtn.textContent = '▶'; } cur = curBtn = null; };
  document.addEventListener('click', e => {
    const b = e.target.closest('button.play');
    if (!b) return;
    if (curBtn === b) { stop(); return; }
    stop();
    document.querySelectorAll('audio').forEach(a => a.pause());
    cur = new Audio(b.dataset.src); curBtn = b;
    b.classList.add('on'); b.textContent = '■';
    cur.addEventListener('ended', stop);
    cur.play().catch(stop);
  });
  // Talk lines: restart the SVG animation when its audio starts
  document.querySelectorAll('audio[data-talk]').forEach(a => {
    a.addEventListener('play', () => {
      stop();
      document.querySelectorAll('audio').forEach(o => { if (o !== a) o.pause(); });
      const svg = a.closest('.card').querySelector('img.talksvg');
      if (svg) { const n = svg.cloneNode(); svg.replaceWith(n); }
    });
  });
})();
