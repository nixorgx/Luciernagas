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
      try { await navigator.share(data); showFeedback('Gracias por compartir nuestra luz '); }
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


/* Modo de revisión: disponible únicamente con ?review=1 */
(() => {
  "use strict";
  if (new URLSearchParams(location.search).get("review") !== "1") return;
  const key = "luciernagas-review:" + location.pathname;
  const css = [
    "#lr-review{position:fixed;z-index:2147483001;right:18px;bottom:18px;width:min(365px,calc(100vw - 24px));max-height:82vh;overflow:auto;background:#fbf7ec;color:#183d36;padding:20px;border:1px solid #decda8;border-radius:22px;box-shadow:0 22px 65px #12382d44;font:14px/1.4 system-ui,sans-serif}",
    "#lr-review *{box-sizing:border-box}#lr-review h2{font:600 22px/1.2 Georgia,serif;margin:0 0 6px}#lr-review p{font-size:12px;color:#53665d;margin:0 0 12px}",
    "#lr-review textarea{display:block;width:100%;height:88px;resize:vertical;padding:11px;border:1px solid #c6d0be;border-radius:10px;font:inherit;background:#fffef9;color:#173d35}",
    "#lr-review .lr-row{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}#lr-review button{border:1px solid #1d5047;background:#1d5047;color:white;border-radius:100px;padding:9px 12px;cursor:pointer;font:600 12px system-ui}",
    "#lr-review button.lr-quiet{background:transparent;color:#1d5047}#lr-review .lr-meta{background:#e5eddf;border-radius:10px;padding:10px;font-size:12px;overflow-wrap:anywhere}",
    "#lr-review label{display:block;font-weight:700;margin:12px 0 5px}#lr-review ol{padding-left:20px;max-height:120px;overflow:auto}#lr-review li{font-size:12px;margin-bottom:8px;overflow-wrap:anywhere}",
    "#lr-review [role=status]{min-height:20px;font-size:12px;color:#316a4d}#lr-review button:focus-visible,#lr-review textarea:focus-visible{outline:3px solid #e7ad4a;outline-offset:3px}",
    "#lr-review .lr-header{display:flex;align-items:start;justify-content:space-between;gap:12px}#lr-review.lr-small{width:auto}#lr-review.lr-small .lr-content{display:none}",
    "#lr-review-outline{position:fixed;pointer-events:none;z-index:2147483000;display:none;outline:2px dashed #c58b2d;outline-offset:2px;background:#e7ad4a26;border-radius:5px}",
    "@media(max-width:600px){#lr-review{right:8px;bottom:8px;width:calc(100vw - 16px);padding:15px;max-height:72vh}}"
  ].join("\n");
  const stylesheet = document.createElement("style");
  stylesheet.textContent = css;
  document.head.appendChild(stylesheet);

  const panel = document.createElement("aside");
  panel.id = "lr-review";
  panel.setAttribute("aria-label", "Revisión visual del sitio");
  panel.innerHTML = [
    '<div class="lr-header"><h2>Revisar Luciérnagas </h2><button class="lr-quiet" type="button" id="lr-min">Ocultar</button></div>',
    '<div class="lr-content"><p>Selecciona un texto, imagen o sección de la página. Describe el cambio y guárdalo.</p>',
    '<div class="lr-meta" id="lr-target">Ningún elemento seleccionado.</div>',
    '<label for="lr-note">Cambio solicitado</label><textarea id="lr-note" placeholder="Ejemplo: cambia esta foto por una de un taller de lectura."></textarea>',
    '<div class="lr-row"><button id="lr-add" type="button">Guardar cambio</button><button id="lr-copy" class="lr-quiet" type="button">Copiar para ChatGPT</button></div>',
    '<label>Indicaciones guardadas: <span id="lr-count">0</span></label><ol id="lr-list"></ol>',
    '<div role="status" id="lr-status" aria-live="polite"></div>',
    '<div class="lr-row"><button id="lr-clear" class="lr-quiet" type="button">Borrar</button><button id="lr-exit" class="lr-quiet" type="button">Salir del modo</button></div>',
    '<p>Los cambios se guardan en este navegador. Usa “Copiar para ChatGPT” y pega el texto en nuestra conversación para que pueda aplicarlos.</p></div>'
  ].join("");
  document.body.appendChild(panel);
  const outline = document.createElement("div");
  outline.id = "lr-review-outline";
  document.body.appendChild(outline);
  const byId = id => document.getElementById(id);
  let selected = null;
  let notes = [];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(saved)) notes = saved.filter(x => x && typeof x.note === "string").slice(0,100);
  } catch (_) {}

  function targetFor(node) {
    if (!(node instanceof Element) || node.closest("#lr-review")) return null;
    return node.closest("h1,h2,h3,p,img,a,button,summary,article,section,header,footer") || node.closest("main,nav");
  }
  function describe(node) {
    const label = (node.getAttribute("alt") || node.innerText || node.textContent || "").replace(/\s+/g, " ").trim().slice(0,100);
    return node.tagName.toLowerCase() + " · " + (label || "Elemento visual");
  }
  function selector(node) {
    const parts = [];
    for (let n = node; n && n !== document.body && parts.length < 8; n = n.parentElement) {
      if (n.id) { parts.unshift("#" + CSS.escape(n.id)); break; }
      let s = n.tagName.toLowerCase();
      if (n.parentElement) {
        const siblings = [...n.parentElement.children].filter(x => x.tagName === n.tagName);
        if (siblings.length > 1) s += ":nth-of-type(" + (siblings.indexOf(n) + 1) + ")";
      }
      parts.unshift(s);
    }
    return parts.join(" > ");
  }
  function paint(node) {
    if (!node || !node.isConnected) { outline.style.display = "none"; return; }
    const r = node.getBoundingClientRect();
    if (!r.width || !r.height) { outline.style.display = "none"; return; }
    Object.assign(outline.style,{display:"block",left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"});
  }
  function status(text) { byId("lr-status").textContent = text; }
  function redraw() {
    byId("lr-count").textContent = notes.length;
    const list = byId("lr-list");
    list.replaceChildren();
    notes.forEach((entry,i) => {
      const li = document.createElement("li");
      const heading = document.createElement("strong");
      heading.textContent = (i+1)+". "+entry.element;
      li.append(heading,document.createElement("br"),document.createTextNode(entry.note));
      list.appendChild(li);
    });
  }
  function saveLocal() { try { localStorage.setItem(key,JSON.stringify(notes)); } catch (_) {} }

  document.addEventListener("pointermove", e => {
    if (!selected && !e.target.closest("#lr-review")) paint(targetFor(e.target));
  }, {passive:true});
  document.addEventListener("click", e => {
    if (e.target.closest("#lr-review")) return;
    const node = targetFor(e.target);
    if (!node) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    selected = node;
    paint(node);
    byId("lr-target").textContent = "Seleccionado: " + describe(node);
    status("Elemento seleccionado. Indica el cambio que deseas.");
    byId("lr-note").focus();
  }, true);
  window.addEventListener("scroll", () => { if (selected) paint(selected); }, {passive:true});
  window.addEventListener("resize", () => { if (selected) paint(selected); }, {passive:true});
  byId("lr-add").addEventListener("click", () => {
    const note = byId("lr-note").value.trim();
    if (!selected) return status("Selecciona un elemento de la página primero.");
    if (!note) return status("Escribe el cambio que quieres realizar.");
    notes.push({element:describe(selected),selector:selector(selected),note});
    saveLocal(); redraw();
    byId("lr-note").value = "";
    selected = null; outline.style.display = "none";
    byId("lr-target").textContent = "Selecciona otro elemento.";
    status("Cambio guardado.");
  });
  byId("lr-copy").addEventListener("click", async () => {
    if (!notes.length) return status("Guarda al menos un cambio primero.");
    const text = ["Cambios para Luciérnagas","Sitio: "+location.origin+location.pathname,""].concat(
      notes.flatMap((x,i) => [(i+1)+". Elemento: "+x.element,"   Selector: "+x.selector,"   Cambio solicitado: "+x.note,""])
    ).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      status("Copiado. Pega el texto en nuestra conversación de ChatGPT.");
    } catch (_) {
      byId("lr-note").value = text;
      byId("lr-note").focus(); byId("lr-note").select();
      status("Copia el texto seleccionado y pégalo en ChatGPT.");
    }
  });
  byId("lr-clear").addEventListener("click", () => {
    if (!notes.length || !confirm("¿Borrar todas las indicaciones guardadas?")) return;
    notes = []; saveLocal(); redraw(); status("Indicaciones borradas.");
  });
  byId("lr-exit").addEventListener("click", () => {
    const url = new URL(location.href);
    url.searchParams.delete("review");
    location.assign(url.href);
  });
  byId("lr-min").addEventListener("click", () => {
    const small = panel.classList.toggle("lr-small");
    byId("lr-min").textContent = small ? "Mostrar" : "Ocultar";
  });
  redraw();
})();


/* Renovación: barra compacta en scroll y enlace activo según sección visible. */
(() => {
  const onScroll = () => document.documentElement.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
  const links = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));
  if (!('IntersectionObserver' in window) || !links.length) return;
  const sections = links.map(link => ({link,element:document.querySelector(link.getAttribute('href'))})).filter(item => item.element);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.remove('is-active'));
      const current = sections.find(item=>item.element===entry.target);
      if (current) current.link.classList.add('is-active');
    });
  },{rootMargin:'-35% 0px -48% 0px',threshold:0});
  sections.forEach(item=>observer.observe(item.element));
})();
