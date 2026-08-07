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
    <path d="M250,-20 C330,60 170,120 250,190 C310,245 210,280 240,320 L400,320 L400,-20 Z" fill="${color}" opacity=".28"/>
    <path d="M300,-20 C380,70 220,130 300,200 C355,250 265,285 295,320 L400,320 L400,-20 Z" fill="${color}" opacity=".45"/>
  </svg>`;
}

/* ---------- render beer cards ---------- */
document.getElementById('grid').innerHTML = BEERS.map(b => `
  <div class="card beer">
    <div class="beer-top" data-open="${b.id}">
      ${wave(b.color)}
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
        ${b.comingSoon
          ? `<div class="soon-label">Próximamente</div>`
          : `<div class="stepper">
          <button data-act="dec" data-b="${b.id}" aria-label="quitar">−</button>
          <div class="q" id="q-${b.id}">0</div>
          <button data-act="inc" data-b="${b.id}" aria-label="agregar">+</button>
        </div>`}
      </div>
    </div>
  </div>
`).join('') + `
  <div class="card beer rotating">
    <div class="beer-top" style="cursor:default">
      ${wave('#7FA6F0')}
      <div class="badge">Rotativa</div>
      <div class="script beer-name">Lo que viene</div>
      <div class="beer-latin">Edición de temporada</div>
      <div class="beer-style">Salen estilos nuevos cada semana</div>
      <p class="rot-copy">Probamos cosas distintas todas las semanas. Escríbenos para saber qué hay cocinando.</p>
    </div>
    <div class="beer-buy">
      <a class="btn" id="notify" target="_blank" rel="noopener noreferrer">Avísenme del próximo lanzamiento</a>
    </div>
  </div>`;

/* ---------- WhatsApp links ----------
   El checkout es un <a> normal, no un botón con onclick + window.open:
   iOS Safari bloquea en silencio los popups abiertos async desde JS,
   pero deja pasar la navegación de un <a href> normal. */
function whatsappLink(message){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function orderMessage(){
  const {rows, subtotal, saved} = priceCart();
  const items = rows.map(r => `${r.qty} × ${r.beer.name}`).join('\n');
  const prices = rows.map(r => `${r.beer.name}: ${money(r.beer.prices.unit)} c/u · 4 por ${money(r.beer.prices.four)}`).join('\n');
  let msg = `Hola! Quiero hacer este pedido en La Quebrada:\n\n${items}\n\nPrecio:\n${prices}\n\nTotal: ${money(subtotal)}`;
  if(saved > 0) msg += `\nAhorro: ${money(saved)}`;
  msg += `\n\nNombre: \nDirección de entrega: `;
  return msg;
}

document.getElementById('notify').href =
  whatsappLink('Hola! Quiero que me avisen del próximo lanzamiento de La Quebrada.');

/* ---------- tabs ---------- */
document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('on'));
  t.classList.add('active');
  document.getElementById(t.dataset.tab).classList.add('on');
  window.scrollTo({top:0, behavior:'smooth'});
  updatePill();
});

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
      <div class="specs">
        <div class="spec"><b>ABV</b><span>${b.abv}</span></div>
        <div class="spec"><b>IBU</b><span>${b.ibu}</span></div>
        <div class="spec"><b>EBC</b><span>${b.ebc}</span></div>
      </div>
    </div>
    <div class="modal-body">
      <h4>En la copa</h4>
      <p>${b.short}</p>
      <h4>La cerveza</h4>
      <p>${b.long}</p>
      <h4>Ingredientes</h4>
      <ul>${b.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <h4>Marida bien con</h4>
      <div class="pairing">${b.pairing.map(p => `<span class="chip">${p}</span>`).join('')}</div>
      <h4>Precio</h4>
      <p>Botella 330 ml — <b>${money(b.prices.unit)}</b><br>
      Cualquier 4 botellas — <b>${money(b.prices.four)}</b> <span style="opacity:.7">(${money(packUnit(b))} c/u)</span></p>
      <p style="font-size:13px;opacity:.75;margin-top:6px">El 4-pack se arma solo en el carrito: puedes mezclar estilos.</p>
      ${b.comingSoon
        ? `<div class="soon-label" style="margin-top:6px">Próximamente</div>`
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
