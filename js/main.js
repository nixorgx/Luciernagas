(() => {
  'use strict';
  const $ = (selector, context = document) => context.querySelector(selector);
  const menu = $('.menu-toggle');
  const nav = $('#primary-nav');
  const setMenu = (open) => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open && window.innerWidth <= 850);
  };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 850) setMenu(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (event) => {
    if (menu?.getAttribute('aria-expanded') === 'true' && !nav?.contains(event.target) && !menu?.contains(event.target)) setMenu(false);
  });

  const revealElements = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { rootMargin: '0px 0px -45px 0px', threshold: 0.09 });
    revealElements.forEach((element) => observer.observe(element));
  } else revealElements.forEach((element) => element.classList.add('is-visible'));

  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  const projectUrl = window.location.protocol.startsWith('http') ? window.location.href.split('#')[0] : '';
  const shareText = 'Conoce Luciérnagas: Luz para su mañana. Una iniciativa social en Bolivia para acercar libros, materiales y educación gratuita a más niñas y niños.';
  const feedback = $('#join-feedback');
  const showFeedback = (message) => { if (feedback) feedback.textContent = message; };
  const copy = async (text) => {
    if (navigator.clipboard?.writeText && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    const input = document.createElement('textarea');
    input.value = text; input.style.position = 'fixed'; input.style.opacity = '0';
    document.body.appendChild(input); input.select();
    const ok = document.execCommand('copy'); input.remove(); return ok;
  };
  const share = async () => {
    const data = { title: 'Luciérnagas — Luz para su mañana', text: shareText };
    if (projectUrl) data.url = projectUrl;
    if (navigator.share) {
      try { await navigator.share(data); showFeedback('Gracias por compartir nuestra luz ✳'); }
      catch (error) { if (error.name !== 'AbortError') showFeedback('Puedes compartir este sitio copiando su dirección.'); }
    } else {
      try { const ok = await copy(`${shareText}${projectUrl ? `\n${projectUrl}` : ''}`); showFeedback(ok ? 'Mensaje copiado. ¡Gracias por compartirlo!' : 'No se pudo copiar. Prueba copiando la dirección de esta página.'); }
      catch { showFeedback('Copia la dirección de la página para compartirla.'); }
    }
  };
  $('#share-project')?.addEventListener('click', share);
  $('#footer-share')?.addEventListener('click', share);

  $('#prepare-message')?.addEventListener('click', () => {
    const chosen = $('input[name="interest"]:checked')?.value || 'colaborar con la iniciativa';
    const message = `¡Hola! Me interesa conocer más sobre Luciérnagas — Luz para su mañana. Me gustaría ${chosen}. ¿Cómo puedo sumarme cuando se habiliten los canales de participación?`;
    const textarea = $('#message-text');
    if (textarea) textarea.value = message;
    const panel = $('#prepared-message'); if (panel) panel.hidden = false;
    showFeedback('Preparamos tu mensaje. Puedes copiarlo y enviarlo cuando se anuncie el canal oficial de contacto.');
    $('#copy-message')?.focus({ preventScroll: true });
  });
  $('#copy-message')?.addEventListener('click', async () => {
    const text = $('#message-text')?.value;
    if (!text) return;
    try { const ok = await copy(text); showFeedback(ok ? 'Mensaje copiado al portapapeles.' : 'Selecciona el mensaje para copiarlo manualmente.'); }
    catch { showFeedback('Selecciona el mensaje para copiarlo manualmente.'); }
  });
})();
