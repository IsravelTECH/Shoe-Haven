/**
 * Shoe Haven (HAVEN-X) - Core Application Logic & Reactive Store
 */

// Initialize Global State
const HavenStore = {
  cart: JSON.parse(localStorage.getItem('cartItems')) || [],
  wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],

  saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(this.cart));
    this.updateBadges();
    this.renderCartDrawer();
    window.dispatchEvent(new CustomEvent('haven:cartUpdated'));
  },

  saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    this.updateBadges();
    window.dispatchEvent(new CustomEvent('haven:wishlistUpdated'));
  },

  updateBadges() {
    const totalCartCount = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const wishlistCount = this.wishlist.length;

    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = totalCartCount;
      el.style.display = totalCartCount > 0 ? 'flex' : 'none';
    });

    document.querySelectorAll('.wishlist-badge-count').forEach(el => {
      el.textContent = wishlistCount;
      el.style.display = wishlistCount > 0 ? 'flex' : 'none';
    });
  },

  addToCart(product, quantity = 1, size = null, color = null) {
    const existingIndex = this.cart.findIndex(item => 
      item.id === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id || `item-${Date.now()}`,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image || 'images/Logo.webp',
        quantity: quantity,
        size: size || (product.sizes ? product.sizes[0] : 9),
        color: color || (product.colors ? product.colors[0] : '#00F0FF')
      });
    }

    this.saveCart();
    HavenUI.showToast(`✨ ${product.name} added to bag!`);
    HavenUI.openCartDrawer();
  },

  removeFromCart(index) {
    const item = this.cart[index];
    this.cart.splice(index, 1);
    this.saveCart();
    if (item) HavenUI.showToast(`Removed ${item.name} from bag`);
  },

  updateCartQty(index, qty) {
    if (qty <= 0) {
      this.removeFromCart(index);
    } else {
      this.cart[index].quantity = qty;
      this.saveCart();
    }
  },

  toggleWishlist(product) {
    const index = this.wishlist.findIndex(item => item.name === product.name);
    let added = false;

    if (index > -1) {
      this.wishlist.splice(index, 1);
      HavenUI.showToast(`Removed from wishlist`);
    } else {
      this.wishlist.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image
      });
      HavenUI.showToast(`💖 Added to wishlist!`);
      added = true;
    }

    this.saveWishlist();
    return added;
  },

  isInWishlist(productName) {
    return this.wishlist.some(item => item.name === productName);
  },

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  renderCartDrawer() {
    const drawerContainer = document.getElementById('drawer-cart-items');
    const drawerSubtotal = document.getElementById('drawer-subtotal');
    const drawerShipping = document.getElementById('drawer-shipping');
    const drawerTotal = document.getElementById('drawer-total');

    if (!drawerContainer) return;

    if (this.cart.length === 0) {
      drawerContainer.innerHTML = `
        <div class="cart-empty-view">
          <i class="bi bi-bag-x cart-empty-icon"></i>
          <h4 style="color: #fff; margin-bottom: 0.5rem;">Your bag is empty</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Explore our 3D futuristic kicks and elevate your walk.</p>
          <a href="product.html" class="btn-neon" style="display:inline-flex;">Discover Drops</a>
        </div>
      `;
      if (drawerSubtotal) drawerSubtotal.textContent = '$0.00';
      if (drawerShipping) drawerShipping.textContent = '$0.00';
      if (drawerTotal) drawerTotal.textContent = '$0.00';
      return;
    }

    let subtotal = this.getCartTotal();
    let shipping = subtotal > 150 ? 0 : 15.00;
    let total = subtotal + shipping;

    drawerContainer.innerHTML = this.cart.map((item, index) => `
      <div class="cart-item-card">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="d-flex align-items-center justify-content-between">
            <div class="cart-qty-control">
              <button class="btn-qty" onclick="HavenStore.updateCartQty(${index}, ${item.quantity - 1})">-</button>
              <span class="cart-qty-num">${item.quantity}</span>
              <button class="btn-qty" onclick="HavenStore.updateCartQty(${index}, ${item.quantity + 1})">+</button>
            </div>
            <button class="btn-remove-item" onclick="HavenStore.removeFromCart(${index})" title="Remove item">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (drawerSubtotal) drawerSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (drawerShipping) drawerShipping.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (drawerTotal) drawerTotal.textContent = `$${total.toFixed(2)}`;
  }
};

// UI & Interaction Manager
const HavenUI = {
  init() {
    this.injectCartDrawer();
    this.injectToastContainer();
    this.injectQuickViewModal();
    this.setupParallaxHover();
    HavenStore.updateBadges();
    HavenStore.renderCartDrawer();
  },

  injectCartDrawer() {
    if (document.getElementById('haven-cart-drawer')) return;

    const drawerHTML = `
      <div class="cart-drawer-overlay" id="cart-drawer-overlay" onclick="HavenUI.closeCartDrawer()"></div>
      <aside class="cart-drawer" id="haven-cart-drawer">
        <div class="cart-drawer-head">
          <div class="cart-drawer-title">
            <i class="bi bi-bag-check" style="color:var(--accent-cyan);"></i> Your Bag
          </div>
          <button class="btn-close-drawer" onclick="HavenUI.closeCartDrawer()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="cart-drawer-body" id="drawer-cart-items"></div>
        <div class="cart-drawer-foot">
          <div class="cart-summary-line">
            <span>Subtotal</span>
            <span id="drawer-subtotal">$0.00</span>
          </div>
          <div class="cart-summary-line">
            <span>Shipping</span>
            <span id="drawer-shipping">$15.00</span>
          </div>
          <div class="cart-total-line">
            <span>Total</span>
            <span id="drawer-total" style="color:var(--accent-cyan);">$0.00</span>
          </div>
          <div class="d-flex gap-2">
            <a href="cart.html" class="btn-glass flex-fill justify-content-center">View Cart</a>
            <a href="checkout.html" class="btn-neon flex-fill justify-content-center">Checkout</a>
          </div>
        </div>
      </aside>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);
  },

  openCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('haven-cart-drawer');
    if (overlay && drawer) {
      overlay.classList.add('active');
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('haven-cart-drawer');
    if (overlay && drawer) {
      overlay.classList.remove('active');
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  injectToastContainer() {
    if (document.getElementById('haven-toasts')) return;
    const container = document.createElement('div');
    container.id = 'haven-toasts';
    container.className = 'haven-toast-container';
    document.body.appendChild(container);
  },

  showToast(message) {
    const container = document.getElementById('haven-toasts');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'haven-toast';
    toast.innerHTML = `<i class="bi bi-check-circle-fill text-info"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  },

  injectQuickViewModal() {
    if (document.getElementById('quick-view-modal')) return;

    const modalHTML = `
      <div class="modal-backdrop-custom" id="quick-view-modal" onclick="if(event.target === this) HavenUI.closeQuickView()">
        <div class="modal-content-glass">
          <button class="modal-close-btn" onclick="HavenUI.closeQuickView()"><i class="bi bi-x-lg"></i></button>
          <div class="modal-media-col">
            <img src="" id="qv-img" class="img-fluid" style="filter: drop-shadow(0 20px 30px rgba(0,0,0,0.7)); max-height: 280px;" alt="Product">
          </div>
          <div class="modal-info-col">
            <div>
              <span class="badge-tag" id="qv-badge">PREMIUM</span>
              <h2 id="qv-title" style="margin-top: 0.75rem; color: #fff; font-size: 1.6rem;">Shoe Title</h2>
              <div class="d-flex align-items-center gap-2 my-2">
                <span class="shoe-rating" id="qv-rating"><i class="bi bi-star-fill"></i> 4.9</span>
                <span style="color:var(--text-muted); font-size:0.8rem;">(120+ Verified Reviews)</span>
              </div>
              <div class="shoe-price" id="qv-price" style="margin: 1rem 0; font-size: 1.8rem; color: var(--accent-cyan);">$0.00</div>
              <p id="qv-desc" style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">Description text.</p>
            </div>
            <div>
              <div class="mb-3">
                <label style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Select Size (US)</label>
                <div class="d-flex gap-2 mt-1" id="qv-sizes">
                  <span class="filter-pill active">8</span>
                  <span class="filter-pill">9</span>
                  <span class="filter-pill">10</span>
                  <span class="filter-pill">11</span>
                </div>
              </div>
              <button class="btn-neon w-100 justify-content-center" id="qv-add-btn">
                <i class="bi bi-bag-plus"></i> Add to Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  openQuickView(productId) {
    const product = window.SHOE_CATALOG ? window.SHOE_CATALOG.find(p => p.id === productId) : null;
    if (!product) return;

    document.getElementById('qv-img').src = product.image;
    document.getElementById('qv-title').textContent = product.name;
    document.getElementById('qv-badge').textContent = product.badge || 'EXCLUSIVE';
    document.getElementById('qv-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('qv-desc').textContent = product.description || 'Precision crafted with shock-absorbing foam and aerodynamic chassis.';
    document.getElementById('qv-rating').innerHTML = `<i class="bi bi-star-fill"></i> ${product.rating}`;

    const addBtn = document.getElementById('qv-add-btn');
    addBtn.onclick = () => {
      HavenStore.addToCart(product);
      HavenUI.closeQuickView();
    };

    document.getElementById('quick-view-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  setupParallaxHover() {
    document.addEventListener('mousemove', (e) => {
      const cards = document.querySelectorAll('.shoe-card:hover');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });
    });

    document.addEventListener('mouseleave', () => {
      const cards = document.querySelectorAll('.shoe-card');
      cards.forEach(card => {
        card.style.transform = '';
      });
    });
  }
};

// Global Bootstrapping
document.addEventListener('DOMContentLoaded', () => {
  HavenUI.init();
});
