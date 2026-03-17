// --- DATOS DE PRODUCTOS ---
const PRODUCTS = [
  {id:1,name:'Clásica',desc:'Carne 180g, lechuga, tomate, queso cheddar, pan artesanal',price:75,image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=60'},
  {id:2,name:'BBQ Bacon',desc:'Tocino crujiente, salsa BBQ, cebolla caramelizada, queso',price:95,image:'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=60'},
  {id:3,name:'Doble Carne',desc:'Dos carnes jugosas, queso cheddar derretido, bacon crujiente, sésamo',price:110,image:'doble-carne.jpg'},
  {id:4,name:'Doble Queso',desc:'Dos carnes, doble queso, pepinillos',price:120,image:'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=60'}
];

const BEVERAGES = [
  {id:101,name:'Agua Natural',desc:'Agua purificada, fresca y refrescante',price:15,image:'https://images.unsplash.com/photo-1610591437281-430bca83f3f2?auto=format&fit=crop&w=800&q=60'},
  {id:102,name:'Agua de Sabor',desc:'Agua natural con sabor a frutas frescas',price:20,image:'https://images.unsplash.com/photo-1553530666-ba2a8e36cd12?auto=format&fit=crop&w=800&q=60'},
  {id:103,name:'Refresco',desc:'Refrescos variados: Cola, Naranja, Limón, Uva',price:25,image:'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=60'},
  {id:104,name:'Limonada Casera',desc:'Limonada fresca hecha con limones naturales',price:30,image:'https://images.unsplash.com/photo-1563763981-3d2e0f2734ac?auto=format&fit=crop&w=800&q=60'}
];

const DESSERTS = [
  {id:201,name:'Brownie',desc:'Brownie de chocolate oscuro',price:40,image:'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=60'},
  {id:202,name:'Helado',desc:'Helado artesanal en variedad de sabores',price:35,image:'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=60'},
  {id:203,name:'Cheesecake',desc:'Cheesecake cremoso con base de galleta',price:50,image:'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=60'},
  {id:204,name:'Flan',desc:'Flan casero con caramelo dorado',price:30,image:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=60'}
];

// --- VARIABLES DE ESTADO Y DOM ---
let cart = [];
const menuList = document.getElementById('menu-list');
const beveragesList = document.getElementById('beverages-list');
const dessertsList = document.getElementById('desserts-list');
const cartEl = document.getElementById('cart');
const cartCount = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');
const paymentModal = document.getElementById('payment-modal');
const paymentForm = document.getElementById('payment-form');

// --- FUNCIONES CORE ---
function fmt(v){return '$'+Math.round(v)}

function renderList(list, container) {
  if(!container) return;
  container.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <div class="price">${fmt(p.price)}</div>
      <button onclick="addToCart(${p.id})">Añadir</button>
    `;
    container.appendChild(card);
  });
}

window.addToCart = function(id) {
  const prod = PRODUCTS.find(p=>p.id===id) || BEVERAGES.find(p=>p.id===id) || DESSERTS.find(p=>p.id===id);
  const entry = cart.find(c=>c.id===id);
  if(entry) entry.qty++;
  else cart.push({id:prod.id,name:prod.name,price:prod.price,qty:1});
  updateCartUI();
}

function updateCartUI() {
  if(!cartCount || !cartTotalEl) return;
  const total = cart.reduce((s,i)=>s + i.price*i.qty,0);
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartTotalEl.textContent = fmt(total);
  cartItemsEl.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `${item.name} x${item.qty} - ${fmt(item.price*item.qty)}`;
    cartItemsEl.appendChild(li);
  });
}

// --- LÓGICA DE MEMORIA (LocalStorage) ---
function saveUserData() {
    const userData = {
        address: document.getElementById('delivery-address').value,
        phone: document.getElementById('delivery-phone').value,
        name: document.getElementById('customer-name')?.value || '',
        cardholder: document.getElementById('cardholder').value
    };
    localStorage.setItem('fastFood_userData', JSON.stringify(userData));
}

function loadUserData() {
    const saved = localStorage.getItem('fastFood_userData');
    if(saved) {
        const data = JSON.parse(saved);
        if(document.getElementById('delivery-address')) document.getElementById('delivery-address').value = data.address;
        if(document.getElementById('delivery-phone')) document.getElementById('delivery-phone').value = data.phone;
        if(document.getElementById('cardholder')) document.getElementById('cardholder').value = data.cardholder;
    }
}

// --- EVENTOS ---
document.getElementById('cart-toggle')?.addEventListener('click', () => {
    cartEl.setAttribute('aria-hidden', cartEl.getAttribute('aria-hidden') === 'true' ? 'false' : 'true');
});

checkoutBtn?.addEventListener('click', () => {
    if(cart.length === 0) return alert("Carrito vacío");
    loadUserData(); // Cargar datos antes de mostrar el modal
    paymentModal.setAttribute('aria-hidden', 'false');
});

paymentForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveUserData(); // Guardar para la próxima vez
    alert("¡Pedido realizado con éxito!");
    paymentModal.setAttribute('aria-hidden', 'true');
    cart = [];
    updateCartUI();
});

document.getElementById('payment-close')?.addEventListener('click', () => {
    paymentModal.setAttribute('aria-hidden', 'true');
});

// --- INICIO ---
renderList(PRODUCTS, menuList);
renderList(BEVERAGES, beveragesList);
renderList(DESSERTS, dessertsList);
updateCartUI();