const cart = {}; // { idCerveza: cantidad de botellas }
BEERS.forEach(b => cart[b.id] = 0);

const money = n => '$' + n.toLocaleString('es-CO');
const packUnit = b => Math.round(b.prices.four / PACK); // precio por botella dentro de un 4-pack

/* ---------- precios ----------
   Se juntan TODAS las botellas del carrito, sin importar el estilo.
   Por cada grupo completo de 4 se cobran 4 botellas a precio de 4-pack.
   El descuento se reparte primero a las botellas donde más se ahorra,
   así el cliente siempre paga lo mínimo posible. */
function priceCart(){
  const total = Object.values(cart).reduce((a, q) => a + q, 0);
  let slots = Math.floor(total / PACK) * PACK; // botellas con precio de 4-pack

  // más ahorro primero
  const order = BEERS
    .filter(b => cart[b.id] > 0)
    .sort((a, z) => (z.prices.unit - packUnit(z)) - (a.prices.unit - packUnit(a)));

  const rows = [];
  let sum = 0, full = 0, list = 0;
  for(const b of order){
    const q = cart[b.id];
    const disc = Math.min(q, slots); // botellas de este estilo que caen en el descuento
    slots -= disc;
    const rest = q - disc;
    sum  += disc * packUnit(b) + rest * b.prices.unit;
    full += q * b.prices.unit;
    list += q;
    rows.push({beer:b, qty:q, disc, rest});
  }
  rows.sort((a, z) => BEERS.indexOf(a.beer) - BEERS.indexOf(z.beer));
  return {rows, bottles:list, subtotal:sum, saved:full - sum, toNext:(PACK - list % PACK) % PACK};
}

function wave(color){
  return `<svg class="wave" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
    <path d="M250,-20 C330,60 170,120 250,190 C310,245 210,280 240,320 L400,320 L400,-20 Z" fill="${color}" opacity=".42"/>
    <path d="M300,-20 C380,70 220,130 300,200 C355,250 265,285 295,320 L400,320 L400,-20 Z" fill="${color}" opacity=".65"/>
  </svg>`;
}

/* ---------- medallas ---------- */
const MEDAL_COLORS = {
  gold:   ['#FBE08A', '#D9A21B', '#9A6B08'],
  bronze: ['#EBB78C', '#B8733F', '#7A4521']
};
function medalStar(b, size){
  const [c1, c2, c3] = MEDAL_COLORS[b.medal.type];
  const id = `medal-${b.id}-${size}`;
  return `<svg class="medal-star" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/>
    </linearGradient></defs>
    <polygon points="12,1.5 14.9,8.6 22.5,9.2 16.7,14.2 18.5,21.6 12,17.6 5.5,21.6 7.3,14.2 1.5,9.2 9.1,8.6"
      fill="url(#${id})" stroke="#111010" stroke-width="1.2" stroke-linejoin="round"/>
  </svg>`;
}

/* ---------- render beer cards ---------- */
document.getElementById('grid').innerHTML = BEERS.map(b => `
  <div class="card beer${b.soldOut ? ' sold-out' : ''}">
    <div class="beer-top" data-open="${b.id}">
      ${wave(b.color)}
      ${b.medal ? `<div class="medal" title="Medalla de ${b.medal.label.toLowerCase()} — ${b.medal.event}">${medalStar(b, 26)}<span>${b.medal.label}</span><span>${b.medal.event}</span></div>` : ''}
      <div class="badge">${b.tag}</div>
      <div class="script beer-name">${b.name}</div>
      <div class="beer-latin">${b.latin}</div>
      <div class="beer-style">${b.style}</div>
      <div class="specs">
        <div class="spec"><b>ABV</b><span>${b.abv}</span></div>
        <div class="spec"><b>IBU</b><span>${b.ibu}</span></div>
        <div class="spec"><b>EBC</b><span>${b.ebc}</span></div>
      </div>
      <div class="more">Ver ficha completa →</div>
    </div>
    <div class="beer-buy">
      <div class="opt">
        <div class="opt-l">
          <div class="n">Botella 330 ml</div>
          <div class="p">${money(b.prices.unit)} c/u · 4 por ${money(b.prices.four)}</div>
        </div>
        ${b.comingSoon || b.soldOut
          ? `<div class="soon-label">${b.tag}</div>`
          : `<div class="stepper">
          <button data-act="dec" data-b="${b.id}" aria-label="quitar">−</button>
          <div class="q" id="q-${b.id}">0</div>
          <button data-act="inc" data-b="${b.id}" aria-label="agregar">+</button>
        </div>`}
      </div>
      ${b.preOrder ? `<div class="preorder-note">En preventa — los pedidos con esta cerveza pueden demorar un poco más.</div>` : ''}
    </div>
  </div>
`).join('');

/* ---------- WhatsApp links ----------
   El checkout es un <a> normal, no un botón con onclick + window.open:
   iOS Safari bloquea en silencio los popups abiertos async desde JS,
   pero deja pasar la navegación de un <a href> normal. */
function whatsappLink(message){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ---------- entrega ----------
   Domicilio o recoger — se usa tanto en el pedido normal como en el combo,
   así que queda en una sola función. */
function deliveryBlock(){
  const delivery = document.querySelector('input[name="delivery"]:checked')?.value || 'domicilio';
  return delivery === 'recoger'
    ? `Entrega: Recojo en Sector El Poblado\nNombre: `
    : `Entrega: Domicilio (el precio puede variar según la dirección)\nNombre: \nDirección de entrega: `;
}

document.querySelectorAll('input[name="delivery"]').forEach(r => r.onchange = render);

function orderMessage(){
  const {rows, subtotal, saved} = priceCart();
  const items = rows.map(r => `${r.qty} × ${r.beer.name}`).join('\n');
  const prices = rows.map(r => `${r.beer.name}: ${money(r.beer.prices.unit)} c/u · 4 por ${money(r.beer.prices.four)}`).join('\n');
  let msg = `Hola! Quiero hacer este pedido en La Quebrada:\n\n${items}\n\nPrecio:\n${prices}\n\nTotal: ${money(subtotal)}`;
  if(saved > 0) msg += `\nAhorro: ${money(saved)}`;
  msg += `\n\n${deliveryBlock()}`;
  return msg;
}

/* ---------- tabs ----------
   Cada pestaña queda enlazable con #about, #shop, #suggest, #feedback —
   se usa history.replaceState (no location.hash) para no heredar el salto
   automático del navegador al elemento con ese id. */
function activateTab(name, opts){
  const scroll = !opts || opts.scroll !== false;
  const tab = document.querySelector(`.tab[data-tab="${name}"]`);
  const panel = document.getElementById(name);
  if(!tab || !panel) return false;
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('on'));
  tab.classList.add('active');
  panel.classList.add('on');
  if(scroll) window.scrollTo({top:0, behavior:'smooth'});
  updatePill();
  return true;
}

document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
  activateTab(t.dataset.tab);
  history.replaceState(null, '', '#' + t.dataset.tab);
});

if(!activateTab(location.hash.slice(1), {scroll:false})){
  history.replaceState(null, '', location.pathname + location.search);
}

// cubre el caso de pegar/editar el link con la pestaña ya abierta en el navegador
// (el navegador no recarga el JS si solo cambia el hash de la misma página)
window.addEventListener('hashchange', () => activateTab(location.hash.slice(1)));

/* ---------- cart ---------- */
let toastTimer;
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 1900);
}

function render(){
  BEERS.forEach(b => {
    const q = document.getElementById(`q-${b.id}`);
    if(q) q.textContent = cart[b.id];
  });

  const {rows, bottles, subtotal, saved, toNext} = priceCart();
  const lines = rows.map(r => {
    const bits = [];
    if(r.disc) bits.push(`<div class="cart-line"><span>${r.disc} × ${r.beer.name} <i>· precio 4-pack</i></span><b>${money(r.disc * packUnit(r.beer))}</b></div>`);
    if(r.rest) bits.push(`<div class="cart-line"><span>${r.rest} × ${r.beer.name}</span><b>${money(r.rest * r.beer.prices.unit)}</b></div>`);
    return bits.join('');
  }).join('');

  let note = '';
  if(bottles === 0){
    note = '';
  } else if(toNext > 0){
    note = `<div class="cart-note">Agrega ${toNext} botella${toNext > 1 ? 's' : ''} más — mezcladas o no — y esas 4 se cobran a precio de 4-pack.</div>`;
  } else {
    note = `<div class="cart-note ok">Precio de 4-pack aplicado. Ahorras ${money(saved)}.</div>`;
  }
  if(saved > 0 && toNext > 0){
    note = `<div class="cart-note ok">Ahorras ${money(saved)}.</div>` + note;
  }

  document.getElementById('lines').innerHTML = bottles
    ? lines + note
    : '<div class="cart-empty">Todavía no has agregado nada.</div>';
  document.getElementById('total').textContent = money(subtotal);

  const checkout = document.getElementById('checkout');
  if(bottles === 0){
    checkout.classList.add('disabled');
    checkout.setAttribute('aria-disabled', 'true');
    checkout.removeAttribute('href');
  } else {
    checkout.classList.remove('disabled');
    checkout.removeAttribute('aria-disabled');
    checkout.href = whatsappLink(orderMessage());
  }

  document.getElementById('pill-count').textContent = bottles;
  document.getElementById('pill-total').textContent = money(subtotal);
  updatePill();
}

/* pill: solo visible en la tienda, con items, y si el carrito no está a la vista */
let cartVisible = false;
function updatePill(){
  const hasItems = Object.values(cart).some(q => q > 0);
  const onShop = document.getElementById('shop').classList.contains('on');
  document.getElementById('pill').classList.toggle('on', hasItems && onShop && !cartVisible);
}
new IntersectionObserver(([e]) => {
  cartVisible = e.isIntersecting;
  updatePill();
}, {threshold:.25}).observe(document.getElementById('cart'));

document.getElementById('pill').onclick = () =>
  document.getElementById('cart').scrollIntoView({behavior:'smooth', block:'center'});

document.addEventListener('click', e => {
  const step = e.target.closest('[data-act]');
  if(step){
    const {act, b} = step.dataset;
    if(act === 'inc'){ cart[b]++; }
    else if(cart[b] > 0){ cart[b]--; }
    render();
    return;
  }
  const open = e.target.closest('[data-open]');
  if(open){ openModal(open.dataset.open); }
});

document.getElementById('clear').onclick = () => {
  BEERS.forEach(b => cart[b.id] = 0);
  render(); toast('Carrito vacío');
};

/* ---------- suggest form ---------- */
const suggestForm = document.getElementById('suggest-form');
suggestForm.addEventListener('submit', async e => {
  e.preventDefault();
  if(!SHEET_ENDPOINT){ toast('Formulario no configurado todavía'); return; }

  const data = {
    estilo: document.getElementById('s-estilo').value.trim(),
    detalle: document.getElementById('s-detalle').value.trim(),
    nombre: document.getElementById('s-nombre').value.trim(),
    contacto: document.getElementById('s-contacto').value.trim()
  };

  const btn = document.getElementById('suggest-submit');
  btn.disabled = true; btn.textContent = 'Enviando...';
  try{
    await fetch(SHEET_ENDPOINT, {
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(data)
    });
    toast('¡Gracias por tu sugerencia!');
    suggestForm.reset();
  }catch(err){
    toast('No se pudo enviar, intenta de nuevo');
  }finally{
    btn.disabled = false; btn.textContent = 'Enviar sugerencia';
  }
});

/* ---------- feedback form ---------- */
document.getElementById('feedback-beers').innerHTML = BEERS.map(b => `
  <label class="pick">
    <input type="checkbox" class="fb-beer" value="${b.id}">
    <span>${b.name}</span>
  </label>
`).join('');

const escHtml = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderFeedbackRatings(){
  const checked = [...document.querySelectorAll('.fb-beer:checked')].map(c => c.value);

  // se preservan los valores ya escritos/marcados, porque togglear una cerveza
  // reconstruye todo el bloque de abajo
  const prevRatings = {};
  const prevComments = {};
  const prevRecompra = {};
  checked.forEach(id => {
    const picked = document.querySelector(`input[name="rate-${id}"]:checked`);
    if(picked) prevRatings[id] = picked.value;
    const c = document.querySelector(`.fb-comentario[data-beer="${id}"]`);
    if(c) prevComments[id] = c.value;
    const r = document.querySelector(`input[name="recompra-${id}"]:checked`);
    if(r) prevRecompra[id] = r.value;
  });

  document.getElementById('feedback-ratings').innerHTML = checked.map(id => {
    const b = BEERS.find(x => x.id === id);
    return `
      <div class="field">
        <span>¿Qué tanto te gustó ${b.name}?</span>
        <div class="rating-row">
          ${[1,2,3,4,5].map(n => `
            <label class="rate">
              <input type="radio" name="rate-${id}" value="${n}" ${prevRatings[id] === String(n) ? 'checked' : ''} required>
              <span>${n}</span>
            </label>
          `).join('')}
        </div>
        <textarea class="fb-comentario" data-beer="${id}" rows="2" placeholder="Cuéntanos qué te gustó o qué no te gustó de ${b.name} (opcional)">${escHtml(prevComments[id] || '')}</textarea>
        <span>¿La comprarías de nuevo?</span>
        <div class="radio-row">
          ${['Sí','Tal vez','No'].map(v => `
            <label><input type="radio" name="recompra-${id}" value="${v}" ${prevRecompra[id] === v ? 'checked' : ''} required> ${v}</label>
          `).join('')}
        </div>
      </div>`;
  }).join('');
}
document.getElementById('feedback-beers').addEventListener('change', renderFeedbackRatings);

const feedbackForm = document.getElementById('feedback-form');
feedbackForm.addEventListener('submit', async e => {
  e.preventDefault();
  if(!FEEDBACK_SHEET_ENDPOINT){ toast('Formulario no configurado todavía'); return; }

  const checked = [...document.querySelectorAll('.fb-beer:checked')].map(c => c.value);
  if(checked.length === 0){ toast('Selecciona al menos una cerveza'); return; }

  const ratings = {};
  for(const id of checked){
    const picked = document.querySelector(`input[name="rate-${id}"]:checked`);
    if(!picked){ toast('Falta calificar ' + BEERS.find(b => b.id === id).name); return; }
    ratings[id] = picked.value;
  }

  const comments = {};
  for(const id of checked){
    comments[id] = document.querySelector(`.fb-comentario[data-beer="${id}"]`).value.trim();
  }

  const recompras = {};
  for(const id of checked){
    const picked = document.querySelector(`input[name="recompra-${id}"]:checked`);
    if(!picked){ toast('Falta decir si comprarías de nuevo ' + BEERS.find(b => b.id === id).name); return; }
    recompras[id] = picked.value;
  }

  const fuente = document.getElementById('f-fuente').value;

  const btn = document.getElementById('feedback-submit');
  btn.disabled = true; btn.textContent = 'Enviando...';
  try{
    await Promise.all(checked.map(id => fetch(FEEDBACK_SHEET_ENDPOINT, {
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({
        cerveza: BEERS.find(b => b.id === id).name,
        calificacion: ratings[id],
        comentario: comments[id],
        recompra: recompras[id],
        fuente
      })
    })));
    toast('¡Gracias por tu opinión!');
    feedbackForm.reset();
    document.getElementById('feedback-ratings').innerHTML = '';
  }catch(err){
    toast('No se pudo enviar, intenta de nuevo');
  }finally{
    btn.disabled = false; btn.textContent = 'Enviar opinión';
  }
});

/* ---------- modal ---------- */
function openModal(id){
  const b = BEERS.find(x => x.id === id);
  document.getElementById('modal').innerHTML = `
    <div class="modal-top">
      ${wave(b.color)}
      <button class="close" id="x">✕</button>
      <div class="badge">${b.tag}</div>
      <div class="script" style="font-size:52px;line-height:1;text-shadow:2px 3px 0 rgba(17,16,16,.14)">${b.name}</div>
      <div class="beer-latin">${b.latin}</div>
      <div class="beer-style" style="font-size:19px">${b.style}</div>
      ${b.medal ? `<div class="medal-line">${medalStar(b, 22)}<span>Medalla de ${b.medal.label.toLowerCase()} · ${b.medal.event}</span></div>` : ''}
      <div class="specs">
        <div class="spec"><b>ABV</b><span>${b.abv}</span></div>
        <div class="spec"><b>IBU</b><span>${b.ibu}</span></div>
        <div class="spec"><b>EBC</b><span>${b.ebc}</span></div>
      </div>
    </div>
    <div class="modal-body">
      <h4>Descripción</h4>
      <p>${b.description}</p>
      <h4>Ingredientes</h4>
      <ul>${b.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <h4>Marida bien con</h4>
      <div class="pairing">${b.pairing.map(p => `<span class="chip">${p}</span>`).join('')}</div>
      <h4>Precio</h4>
      <p>Botella 330 ml — <b>${money(b.prices.unit)}</b><br>
      Cualquier 4 botellas — <b>${money(b.prices.four)}</b> <span style="opacity:.7">(${money(packUnit(b))} c/u)</span></p>
      <p style="font-size:13px;opacity:.75;margin-top:6px">El 4-pack se arma solo en el carrito: puedes mezclar estilos.</p>
      ${b.preOrder ? `<div class="preorder-note">En preventa — los pedidos con esta cerveza pueden demorar un poco más.</div>` : ''}
      ${b.comingSoon || b.soldOut
        ? `<div class="soon-label" style="margin-top:6px">${b.tag}</div>`
        : `<button class="btn" id="addm">Agregar una botella</button>`}
    </div>`;
  document.getElementById('overlay').classList.add('on');
  document.getElementById('x').onclick = closeModal;
  const addm = document.getElementById('addm');
  if(addm) addm.onclick = () => {
    cart[b.id]++; render(); closeModal(); toast(b.name + ' agregada');
  };
}
function closeModal(){ document.getElementById('overlay').classList.remove('on'); }
document.getElementById('overlay').onclick = e => { if(e.target.id === 'overlay') closeModal(); };
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

render();
