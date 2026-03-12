const PRODUCTS = [
  {id:1,name:'Clásica',desc:'Carne 180g, lechuga, tomate, queso cheddar, pan artesanal',price:75,image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=60'},
  {id:2,name:'BBQ Bacon',desc:'Tocino crujiente, salsa BBQ, cebolla caramelizada, queso',price:95,image:'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=60'},
  {id:3,name:'Doble Carne',desc:'Dos carnes jugosas, queso cheddar derretido, bacon crujiente, sésamo',price:110,image:'doble-carne.jpg'},
  {id:4,name:'Doble Queso',desc:'Dos carnes, doble queso, pepinillos',price:120,image:'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=60'}
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

function fmt(v){return '$'+Math.round(v)}

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
  if(cart.length===0){alert('Tu carrito está vacío. Añade productos antes de pagar.');return}
  document.getElementById('payment-modal').setAttribute('aria-hidden', 'false');
});

document.getElementById('order-form').addEventListener('submit',e=>{
  e.preventDefault();
  const contactType = document.getElementById('contact-type').value;
  const name = document.getElementById('customer-name').value;
  
  if(!name.trim()){alert('Por favor, ingresa tu nombre.');return}
  alert(`¡Gracias por tu ${contactType === 'suggestion' ? 'sugerencia' : contactType === 'complaint' ? 'comentario' : 'pregunta'}!\n\nNos pondremos en contacto pronto.`);
  document.getElementById('order-form').reset();
});

// Modal de Pago
const paymentModal = document.getElementById('payment-modal');
const paymentClose = document.getElementById('payment-close');
const paymentForm = document.getElementById('payment-form');
const cardNumberInput = document.getElementById('card-number');
const cardholderInput = document.getElementById('cardholder');
const expiryInput = document.getElementById('expiry');
const cvvInput = document.getElementById('cvv');
const cardNumberDisplay = document.getElementById('card-number-display');
const cardholderDisplay = document.getElementById('cardholder-display');
const expiryDisplay = document.getElementById('expiry-display');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationClose = document.getElementById('confirmation-close');

// Formatear número de tarjeta con espacios
cardNumberInput.addEventListener('input', (e)=>{
  let value = e.target.value.replace(/\s/g, '');
  let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
  e.target.value = formattedValue;
  
  // Mostrar en tarjeta visual
  if(value.length === 0) {
    cardNumberDisplay.textContent = '#### #### #### ####';
  } else {
    let display = value.padEnd(16, '#').slice(0, 16).replace(/\d/g, '*').replace(/(\*{4})/g, '$1 ').trim();
    cardNumberDisplay.textContent = display;
  }
});

// Actualizar nombre en tarjeta
cardholderInput.addEventListener('input', (e)=>{
  cardholderDisplay.textContent = e.target.value.toUpperCase() || 'NOMBRE';
});

// Formatear fecha de expiración
expiryInput.addEventListener('input', (e)=>{
  let value = e.target.value.replace(/\D/g, '');
  if(value.length >= 2){
    value = value.slice(0,2) + '/' + value.slice(2, 4);
  }
  e.target.value = value;
  expiryDisplay.textContent = value || 'MM/YY';
});

// Permitir solo números en CVV
cvvInput.addEventListener('input', (e)=>{
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

// Cerrar modal de pago
paymentClose.addEventListener('click', ()=>{
  paymentModal.setAttribute('aria-hidden', 'true');
});

// Enviar formulario de pago
paymentForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  
  // Validar dirección
  const deliveryAddress = document.getElementById('delivery-address').value;
  const deliveryPhone = document.getElementById('delivery-phone').value;
  
  if(!deliveryAddress.trim()){
    alert('Por favor, ingresa tu dirección de entrega');
    return;
  }
  
  if(!deliveryPhone.trim()){
    alert('Por favor, ingresa tu teléfono de contacto');
    return;
  }
  
  const cardNumber = cardNumberInput.value.replace(/\s/g, '');
  const cardholder = cardholderInput.value;
  const expiry = expiryInput.value;
  const cvv = cvvInput.value;
  
  // Validar número de tarjeta (16 dígitos)
  if(cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)){
    alert('Por favor, ingresa un número de tarjeta válido (16 dígitos)');
    return;
  }
  
  // Validar otros campos
  if(!cardholder.trim()){
    alert('Por favor, ingresa el nombre del titular');
    return;
  }
  
  if(!/^\d{2}\/\d{2}$/.test(expiry)){
    alert('Por favor, ingresa una fecha de expiración válida (MM/YY)');
    return;
  }
  
  if(cvv.length !== 3){
    alert('Por favor, ingresa un CVV válido (3 dígitos)');
    return;
  }
  
  // Si todo es válido, mostrar confirmación
  paymentModal.setAttribute('aria-hidden', 'true');
  confirmationModal.setAttribute('aria-hidden', 'false');
  
  // Limpiar carrito
  cart.splice(0, cart.length);
  updateCartUI();
  cartEl.setAttribute('aria-hidden', 'true');
  
  // Limpiar formulario
  paymentForm.reset();
  cardNumberDisplay.textContent = '#### #### #### ####';
  cardholderDisplay.textContent = 'NOMBRE';
  expiryDisplay.textContent = 'MM/YY';
});

// Cerrar modal de confirmación
confirmationClose.addEventListener('click', ()=>{
  confirmationModal.setAttribute('aria-hidden', 'true');
});

renderMenu();
updateCartUI();
