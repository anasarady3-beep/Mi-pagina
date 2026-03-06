const PRODUCTS = [
  {id:1,name:'Clásica',desc:'Carne 180g, lechuga, tomate, queso cheddar, pan artesanal',price:5.5,image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=60'},
  {id:2,name:'BBQ Bacon',desc:'Tocino crujiente, salsa BBQ, cebolla caramelizada, queso',price:7.0,image:'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=60'},
  {id:3,name:'Veggie Deluxe',desc:'Hamburguesa de garbanzo, lechuga, aguacate, alioli',price:6.0,image:'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=60'},
  {id:4,name:'Doble Queso',desc:'Dos carnes, doble queso, pepinillos',price:8.5,image:'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=60'}
];

const cart = [];
const menuList = document.getElementById('menu-list');
const cartToggle = document.getElementById('cart-toggle');
const cartEl = document.getElementById('cart');
const cartCount = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartClose = document.getElementById('cart-close');
const checkoutBtn = document.getElementById('checkout');

function fmt(v){return '$'+v.toFixed(2)}

function renderMenu(){
  menuList.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const card = document.createElement('div');card.className='card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <div class="price">${fmt(p.price)}</div>
      <button data-id="${p.id}">Añadir</button>
    `;
    card.querySelector('button').addEventListener('click',()=>addToCart(p.id));
    menuList.appendChild(card);
  })
}

function addToCart(id){
  const prod = PRODUCTS.find(p=>p.id===id);
  const entry = cart.find(c=>c.id===id);
  if(entry) entry.qty++;
  else cart.push({id:prod.id,name:prod.name,price:prod.price,qty:1});
  updateCartUI();
}

function removeFromCart(id){
  const idx = cart.findIndex(c=>c.id===id);
  if(idx>-1) cart.splice(idx,1);
  updateCartUI();
}

function updateCartUI(){
  const total = cart.reduce((s,i)=>s + i.price*i.qty,0);
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartTotalEl.textContent = fmt(total);
  cartItemsEl.innerHTML = '';
  cart.forEach(item=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.name} x${item.qty}</span><span>${fmt(item.price*item.qty)} <button data-remove="${item.id}">✕</button></span>`;
    li.querySelector('button').addEventListener('click',()=>removeFromCart(item.id));
    cartItemsEl.appendChild(li);
  })
}

cartToggle.addEventListener('click',()=>{
  const shown = cartEl.getAttribute('aria-hidden') === 'false';
  cartEl.setAttribute('aria-hidden', shown ? 'true' : 'false');
});
cartClose.addEventListener('click',()=>cartEl.setAttribute('aria-hidden','true'));

checkoutBtn.addEventListener('click',()=>{
  const name = document.getElementById('customer-name').value || 'Cliente';
  if(cart.length===0){alert('Tu carrito está vacío. Añade productos antes de pagar.');return}
  const total = cart.reduce((s,i)=>s + i.price*i.qty,0);
  const summary = cart.map(i=>`${i.name} x${i.qty}`).join('\n');
  alert(`Pedido de ${name}\n\nItems:\n${summary}\n\nTotal: ${fmt(total)}\n\nGracias — recibirás la confirmación pronto.`);
  cart.splice(0,cart.length);
  updateCartUI();
  cartEl.setAttribute('aria-hidden','true');
});

document.getElementById('order-form').addEventListener('submit',e=>{
  e.preventDefault();
  if(cart.length===0){alert('Agrega al menos una hamburguesa al carrito antes de enviar el pedido.');return}
  checkoutBtn.click();
});

renderMenu();
updateCartUI();
