/* ==========================================================================
   NEXUS AI // SCRIPT LOGIC
   ========================================================================== */

// STATE MANAGEMENT
const state = {
  activePage: 'home',
  user: {
    isLoggedIn: true, // Auto-logged in for presentation as Havish
    name: 'Havish',
    email: 'havish@nexusai.io'
  },
  cart: [
    { id: 'p2', name: 'H100 Tensor Slice', price: 49, qty: 1 }
  ]
};

// ==========================================================================
// 1. PAGE NAVIGATION SYSTEM (5 FULL VIEWS)
// ==========================================================================
function switchPage(pageId) {
  state.activePage = pageId;

  // Update navbar button styles
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
  });

  // Switch visible page view
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.toggle('active', view.id === `page-${pageId}`);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Bind navigation button clicks
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-page');
    switchPage(target);
  });
});

// ==========================================================================
// 2. AUTHENTICATION & LOGIN AS HAVISH
// ==========================================================================
function renderUserUI() {
  const container = document.getElementById('user-display');
  const boardAuthor = document.getElementById('board-author-name');

  if (state.user.isLoggedIn) {
    container.innerHTML = `
      <div class="user-chip" id="user-chip-btn" title="Logged in as Havish">
        <div class="chip-avatar">H</div>
        <span class="chip-name">${state.user.name}</span>
      </div>
    `;
    if (boardAuthor) boardAuthor.textContent = `${state.user.name} (Presenter)`;
    
    // Clicking user chip opens logout/re-login options
    document.getElementById('user-chip-btn').addEventListener('click', openAuthModal);
  } else {
    container.innerHTML = `
      <button id="open-auth-btn" class="btn btn-outline">
        <i class="fa-solid fa-arrow-right-to-bracket"></i> Login
      </button>
    `;
    document.getElementById('open-auth-btn').addEventListener('click', openAuthModal);
    if (boardAuthor) boardAuthor.textContent = 'Guest User';
  }
}

function openAuthModal() {
  document.getElementById('auth-modal').classList.add('open');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
}

document.getElementById('close-auth-btn').addEventListener('click', closeAuthModal);

// Instant 1-Click Login handlers
function performHavishLogin() {
  state.user.isLoggedIn = true;
  state.user.name = 'Havish';
  state.user.email = 'havish@nexusai.io';
  renderUserUI();
  closeAuthModal();
}

document.getElementById('quick-login-banner-btn').addEventListener('click', performHavishLogin);
document.getElementById('quick-fill-btn').addEventListener('click', performHavishLogin);

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  performHavishLogin();
});

// ==========================================================================
// 3. SHOPPING CART SYSTEM
// ==========================================================================
function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const drawerCount = document.getElementById('drawer-cart-count');
  const itemsContainer = document.getElementById('drawer-items');
  const subtotalElem = document.getElementById('cart-subtotal');
  const totalElem = document.getElementById('cart-total');

  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  badge.textContent = totalItems;
  drawerCount.textContent = totalItems;
  subtotalElem.textContent = `$${totalPrice.toFixed(2)}`;
  totalElem.textContent = `$${totalPrice.toFixed(2)}`;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = '<div class="empty-cart-msg">Your compute allocation cart is empty.</div>';
    return;
  }

  itemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="item-info">
        <h4>${item.name}</h4> <span>$${item.price}/mo</span>
      </div>
      <div class="item-ctrls">
        <button class="qty-btn" onclick="modifyQty('${item.id}', -1)">-</button>
        <strong>${item.qty}</strong>
        <button class="qty-btn" onclick="modifyQty('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id, name, price) {
  const existing = state.cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id, name, price: Number(price), qty: 1 });
  }
  updateCartUI();
  openCartDrawer();
}

function modifyQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== id);
  }
  updateCartUI();
}

function openCartDrawer() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');
}

function closeCartDrawer() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

// Bind product "Add to Cart" buttons
document.querySelectorAll('.add-cart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    const price = btn.getAttribute('data-price');
    addToCart(id, name, price);
  });
});

document.getElementById('cart-toggle-btn').addEventListener('click', openCartDrawer);
document.getElementById('close-cart-btn').addEventListener('click', closeCartDrawer);
document.getElementById('drawer-overlay').addEventListener('click', closeCartDrawer);

// Checkout
document.getElementById('checkout-btn').addEventListener('click', () => {
  if (state.cart.length === 0) {
    alert('Add compute instances before checking out!');
    return;
  }
  closeCartDrawer();
  document.getElementById('order-modal').classList.add('open');
  state.cart = [];
  updateCartUI();
});

function closeOrderModal() {
  document.getElementById('order-modal').classList.remove('open');
}

// ==========================================================================
// 4. MESSAGE BOARD (PROVES LOGIN & SHOWS HAVISH)
// ==========================================================================
let currentSelectedTag = '#Presentation';

function selectTag(elem) {
  document.querySelectorAll('.tag-pill').forEach(pill => pill.classList.remove('active'));
  elem.classList.add('active');
  currentSelectedTag = elem.textContent;
}

document.getElementById('board-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('board-input');
  const text = input.value.trim();
  if (!text) return;

  const feed = document.getElementById('board-feed');
  const newPost = document.createElement('article');
  newPost.className = 'board-post';
  newPost.innerHTML = `
    <div class="post-header">
      <div class="post-author-box">
        <div class="avatar-circle">H</div>
        <div>
          <div class="author-name">${state.user.name}</div>
          <div class="post-time">Just now • Live Presentation</div>
        </div>
      </div>
      <span class="post-tag">${currentSelectedTag}</span>
    </div>
    <p class="post-content">${text}</p>
    <div class="post-actions">
      <button class="upvote-btn" onclick="upvotePost(this)">
        <i class="fa-regular fa-thumbs-up"></i> <span>1</span> Upvotes
      </button>
    </div>
  `;

  feed.prepend(newPost);
  input.value = '';
});

function upvotePost(btn) {
  const span = btn.querySelector('span');
  let count = parseInt(span.textContent, 10);
  span.textContent = count + 1;
  btn.style.color = '#06b6d4';
}

// Code block copy helper
function copyCode(btn) {
  const pre = btn.nextElementSibling;
  navigator.clipboard.writeText(pre.innerText).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    setTimeout(() => btn.innerHTML = orig, 1800);
  });
}

// ==========================================================================
// 5. EXACT WORKING WEB3FORMS CONTACT INTEGRATION
// ==========================================================================
const form = document.getElementById('form');
const submitBtn = form.querySelector('button[type="submit"]');
const terminalOutput = document.getElementById('terminal-output');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  // YOUR EXACT ACCESS KEY PRESERVED:
  formData.append("access_key", "5d30a6e0-1022-43d5-a789-db0f9c83dccd");

  const originalText = submitBtn.innerHTML;

  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
  submitBtn.disabled = true;

  terminalOutput.textContent = `// [1/3] Serializing payload...\n// [2/3] Connecting to Web3Forms API gateway...\n// [3/3] Transmitting to destination Gmail...`;

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      terminalOutput.textContent = `// SUCCESS: Status 200 OK\n// Transaction: ${data.message || 'Dispatched'}\n// Check your Gmail inbox tab to see the incoming message!`;
      alert("Success! Your message has been sent directly to your Gmail inbox.");
      form.reset();
    } else {
      terminalOutput.textContent = `// ERROR: ${data.message}`;
      alert("Error: " + data.message);
    }

  } catch (error) {
    terminalOutput.textContent = `// NETWORK EXCEPTION: Failed to reach gateway. Check connection.`;
    alert("Something went wrong. Please try again.");
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// ==========================================================================
// 6. BACKGROUND PARTICLE CANVAS ANIMATION
// ==========================================================================
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 1
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }
  render();
})();

// Initial State Setup
renderUserUI();
updateCartUI();
