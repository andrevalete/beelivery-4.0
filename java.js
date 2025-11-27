/* java.js
  - Usa localStorage para carrinho e tema
  - Catálogo simples com busca/filtro
  - Alto contraste (acessibilidade) e modo escuro
  - Sincronização entre abas 
*/

/* keys */
const CART_KEY = 'beelivery_cart_v1';
const THEME_KEY = 'beelivery_theme_v1';

/* catálogo */
const PRODUCTS = [
  { id:'p1', name:'Cupcake Morango', price:9.90, cat:'cupcakes', img: "cupika cake.jpeg" },
  { id:'p2', name:'Bolo Chocolate', price:69.90, cat:'bolos', img: "bolos.jpeg" },
  { id:'p3', name:'Caixa Donuts (6)', price:34.90, cat:'doces', img: "dounouts.jpeg" },
  { id:'p4', name:'Torta Limão', price:39.90, cat:'doces', img: "lemoun peper.jpeg" },
  { id:'p5', name:'Brownie (un)', price:6.50, cat:'doces', img:'brownie.jpeg' },
];

function toast(msg, ms=1400){
  const el = document.getElementById('toast');
  if(!el){ console.log(msg); return; }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), ms);
}

/* localStorage  */
function readCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
function writeCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCounters(); }

/* theme  */
function applyTheme(){
  const t = localStorage.getItem(THEME_KEY) || 'light';
  if(t === 'dark') document.body.classList.add('dark'); else document.body.classList.remove('dark');
  // update buttons emoji
  document.querySelectorAll('#themeToggleTop,#themeToggleCat,#themeToggleCart').forEach(b=>{
    if(!b) return;
    b.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  });
}
function toggleTheme(){
  const cur = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, cur === 'dark' ? 'light' : 'dark');
  applyTheme();
  toast('Tema alterado');
}

/* alto contraste */
const btnContraste = document.getElementById('toggleContraste');
if(btnContraste){
  btnContraste.addEventListener('click', ()=> {
    document.body.classList.toggle('alto-contraste');
    toast(document.body.classList.contains('alto-contraste') ? 'Alto contraste ativado' : 'Alto contraste desativado');
  });
}

/* update cart conta */
function updateCounters(){
  const total = readCart().reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('#countTop,#countCat,#topCount,#catCount').forEach(el=>{ if(el) el.textContent = total; });
}

/* add to cart */
function addToCart(prod){
  const cart = readCart();
  const found = cart.find(i=>i.id===prod.id);
  if(found) found.qty++;
  else cart.push({...prod, qty:1});
  writeCart(cart);
  toast(`${prod.name} adicionado`);
}

/* mudar qty */
function changeQty(id, delta){
  const cart = readCart();
  const idx = cart.findIndex(i=>i.id===id);
  if(idx === -1) return;
  if(delta === 0){ cart.splice(idx,1); } else { cart[idx].qty += delta; if(cart[idx].qty < 1) cart.splice(idx,1); }
  writeCart(cart);
}

/* render produtos  */
function renderProducts(q='', cat='all'){
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  const ql = (q||'').toLowerCase();
  const list = PRODUCTS.filter(p=>{
    if(cat !== 'all' && p.cat !== cat) return false;
    if(ql && !p.name.toLowerCase().includes(ql)) return false;
    return true;
  });
  if(list.length === 0) { grid.innerHTML = '<p style="color:var(--muted)">Nenhum produto encontrado.</p>'; return; }
  list.forEach(p=>{
    const el = document.createElement('article');
    el.className = 'card-product';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="price">R$ ${p.price.toFixed(2)}</div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:10px">
        <button class="btn" data-add="${p.id}">Adicionar</button>
        <button class="btn-ico" data-view="${p.id}">Ver</button>
      </div>
    `;
    grid.appendChild(el);
  });
}

/* render cart page */
function renderCartPage(){
  const container = document.getElementById('cartContainer');
  if(!container) return;
  const cart = readCart();
  container.innerHTML = '';
  if(cart.length === 0){ container.innerHTML = '<p>Seu carrinho está vazio.</p>'; updateCounters(); return; }
  let total = 0;
  cart.forEach(item=>{
    total += item.qty * item.price;
    const row = document.createElement('div');
    row.className = 'card';
    row.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${item.img}" alt="${item.name}" style="width:84px;height:84px;object-fit:cover;border-radius:8px">
        <div style="flex:1">
          <h4 style="margin:0">${item.name}</h4>
          <div style="margin-top:8px">
            <button data-dec="${item.id}" class="btn">−</button>
            <span style="margin:0 8px">${item.qty}</span>
            <button data-inc="${item.id}" class="btn">+</button>
            <button data-rem="${item.id}" class="btn" style="margin-left:12px">Remover</button>
          </div>
        </div>
        <div><strong>R$ ${(item.price * item.qty).toFixed(2)}</strong></div>
      </div>
    `;
    container.appendChild(row);
  });
  const summary = document.createElement('div');
  summary.className = 'card';
  summary.innerHTML = `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
  container.appendChild(summary);
  updateCounters();
}

/* clear cart */
function clearCart(){ writeCart([]); toast('Carrinho limpo'); }

function openWhatsAppLink(){
  window.open("https://wa.link/nazqhe", "_blank");
}


/* iniciar DOM */
document.addEventListener('DOMContentLoaded', ()=> {
  applyTheme();
  updateCounters();

  // theme toggles
  document.querySelectorAll('#themeToggleTop,#themeToggleCat,#themeToggleCart').forEach(b=>{
    if(!b) return;
    b.addEventListener('click', toggleTheme);
  });

  // open catalog from index
  const openCatalogButtons = document.querySelectorAll('#abrirCatalogoTop,#btnPedirTop,#abrirCatalogoTop');
  openCatalogButtons.forEach(b=> { if(!b) return; b.addEventListener('click', ()=> window.open('catalogo.html','_blank')); });

  // catalog page setup
  if(document.getElementById('productsGrid')){
    renderProducts();
    const search = document.getElementById('searchInput');
    const filter = document.getElementById('filterCat');
    if(search) search.addEventListener('input', ()=> renderProducts(search.value, filter ? filter.value : 'all'));
    if(filter) filter.addEventListener('change', ()=> renderProducts(search ? search.value : '', filter.value));

    document.getElementById('productsGrid').addEventListener('click', (ev) => {
      const add = ev.target.closest('[data-add]');
      const view = ev.target.closest('[data-view]');
      if(add){ const id = add.getAttribute('data-add'); const p = PRODUCTS.find(x=>x.id===id); if(p) addToCart(p); }
      if(view){ const id = view.getAttribute('data-view'); const p = PRODUCTS.find(x=>x.id===id); if(p) toast(p.name + ' — R$ ' + p.price.toFixed(2)); }
    });

    const openCartBtn = document.getElementById('openCartBtn');
    if(openCartBtn) openCartBtn.addEventListener('click', ()=> window.open('carrinho.html','_blank'));
  }

  // cart page setup
  if(document.getElementById('cartContainer')){
    renderCartPage();
    document.getElementById('cartContainer').addEventListener('click', (ev)=> {
      const inc = ev.target.closest('[data-inc]');
      const dec = ev.target.closest('[data-dec]');
      const rem = ev.target.closest('[data-rem]');
      if(inc) changeQty(inc.getAttribute('data-inc'), +1);
      if(dec) changeQty(dec.getAttribute('data-dec'), -1);
      if(rem) changeQty(rem.getAttribute('data-rem'), 0);
      renderCartPage();
    });
    const clearBtn = document.getElementById('clearCartBtn');
    if(clearBtn) clearBtn.addEventListener('click', ()=> { if(confirm('Limpar carrinho?')) { clearCart(); renderCartPage(); }});
    const checkout = document.getElementById('checkoutBtn');
if(checkout) checkout.addEventListener('click', ()=> { 
    openWhatsAppLink(); // abre o link do wa.link
    writeCart([]);      // limpa o carrinho
    renderCartPage(); 
    toast('Redirecionando para o WhatsApp...');
});
  }

  // contatar para ajuda
  const form = document.getElementById('formContato');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const nome = document.getElementById('nomeContato').value.trim();
      const email = document.getElementById('emailContato').value.trim();
      const msg = document.getElementById('msgContato').value.trim();
      if(!nome || !email || !msg){ toast('Preencha todos os campos'); return; }
      toast('Mensagem enviada — obrigado!');
      form.reset();
    });
  }

  // clicar na logo → voltar para home
document.querySelectorAll('.logo').forEach(logo => {
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
});

  /* clicar no carrinho e abrir ele */
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      window.location.href = 'carrinho.html';
    });
  });

});

/* armazenar sync entre abas */
window.addEventListener('storage', (e)=> {
  if(e.key === CART_KEY){
    updateCounters();
    if(document.getElementById('productsGrid')){
      const s = document.getElementById('searchInput');
      const f = document.getElementById('filterCat');
      renderProducts(s ? s.value : '', f ? f.value : 'all');
    }
    if(document.getElementById('cartContainer')) renderCartPage();
  }
  
});
