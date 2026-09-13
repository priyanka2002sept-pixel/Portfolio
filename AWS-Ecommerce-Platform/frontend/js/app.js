// ── AWS Config — replace after deploying ─────────────────
const CONFIG = {
  API_URL:      "YOUR_API_GATEWAY_URL",
  USER_POOL_ID: "YOUR_COGNITO_USER_POOL_ID",
  CLIENT_ID:    "YOUR_COGNITO_CLIENT_ID",
  REGION:       "us-east-1"
};

// ── Sample data (works with no AWS account) ───────────────
const SAMPLE_PRODUCTS = [
  { productId:"1",  name:"AirPods Pro Max",      category:"Electronics", price:"379.99", oldPrice:"449.99", description:"Immersive sound with active noise cancellation and 30-hour battery life.", emoji:"&#x1F3A7;", rating:5, badge:"Best Seller", gradient:"135deg,#1a1a2e,#16213e" },
  { productId:"2",  name:"AWS Solutions Guide",  category:"Books",       price:"49.99",  oldPrice:null,     description:"Complete guide for the AWS Certified Solutions Architect exam.", emoji:"&#x2601;&#xFE0F;", rating:5, badge:"New",  gradient:"135deg,#0f3460,#533483" },
  { productId:"3",  name:"Air Max Ultra",         category:"Clothing",   price:"139.99", oldPrice:"179.99", description:"Ultra-lightweight running shoes with adaptive cushioning technology.", emoji:"&#x1F45F;", rating:4, badge:"Sale", gradient:"135deg,#e94560,#0f3460" },
  { productId:"4",  name:"Smart LED Panel",       category:"Home",       price:"79.00",  oldPrice:null,     description:"RGB smart light panel with app control and 16 million colour options.", emoji:"&#x1F4A1;", rating:4, badge:null,  gradient:"135deg,#533483,#e94560" },
  { productId:"5",  name:"Mechanical Keyboard",  category:"Electronics", price:"189.99", oldPrice:"219.99", description:"Tactile switches, per-key RGB, aluminium frame — built for developers.", emoji:"&#x2328;&#xFE0F;", rating:5, badge:"Hot",  gradient:"135deg,#16213e,#0f3460" },
  { productId:"6",  name:"Python Deep Dive",     category:"Books",       price:"39.99",  oldPrice:null,     description:"Master advanced Python — decorators, async, data structures and more.", emoji:"&#x1F40D;", rating:4, badge:null,  gradient:"135deg,#0d7377,#14a085" },
  { productId:"7",  name:"Premium Hoodie",       category:"Clothing",   price:"69.99",  oldPrice:"89.99",  description:"Oversized heavyweight hoodie in organic cotton with clean minimalist design.", emoji:"&#x1F9E5;", rating:4, badge:"Sale", gradient:"135deg,#232526,#414345" },
  { productId:"8",  name:"4K Webcam Pro",        category:"Electronics", price:"129.99", oldPrice:null,     description:"Crystal-clear 4K streaming webcam with built-in ring light and noise cancel.", emoji:"&#x1F4F9;", rating:5, badge:"New",  gradient:"135deg,#1a1a2e,#e94560" },
];

// ── State ─────────────────────────────────────────────────
let allProducts   = [...SAMPLE_PRODUCTS];
let filtered      = [...SAMPLE_PRODUCTS];
let cart          = JSON.parse(localStorage.getItem("cart") || "[]");
let wishlist      = JSON.parse(localStorage.getItem("wishlist") || "[]");
let currentUser   = null;
let accessToken   = null;
let currentCat    = "all";
let currentSearch = "";
let currentSort   = "default";

// ── Init ──────────────────────────────────────────────────
window.onload = () => {
  animateStats();
  renderProducts();
  updateCartBadge();
  fetchProducts();
  window.addEventListener("scroll", () => {
    document.getElementById("navbar").style.boxShadow =
      window.scrollY > 10 ? "0 4px 30px rgba(0,0,0,0.3)" : "none";
  });
};

// ── Animate hero counters ─────────────────────────────────
function animateStats() {
  document.querySelectorAll(".stat-num").forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    if (target === 0) { el.textContent = "0"; return; }
    let start = 0;
    const step = target / 40;
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = target >= 1000000
        ? (start / 1000000).toFixed(1) + "M"
        : Math.round(start);
      if (start >= target) clearInterval(id);
    }, 30);
  });
}

// ── Fetch from real API (falls back to sample) ────────────
async function fetchProducts() {
  try {
    const res = await fetch(CONFIG.API_URL + "/products");
    const data = await res.json();
    if (data.products && data.products.length) {
      allProducts = data.products;
      applyFilters();
    }
  } catch { /* offline — sample data already showing */ }
}

// ── Filter / Sort pipeline ────────────────────────────────
function setCategory(cat, btn) {
  currentCat = cat;
  document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  applyFilters();
}
function filterSearch(q) {
  currentSearch = q.toLowerCase();
  const clear = document.getElementById("search-clear");
  if (clear) clear.classList.toggle("visible", q.length > 0);
  applyFilters();
}
function clearSearch() {
  document.getElementById("search-input").value = "";
  filterSearch("");
}
function sortProducts(val) { currentSort = val; applyFilters(); }
function applyFilters() {
  let list = [...allProducts];
  if (currentCat !== "all") list = list.filter(p => p.category === currentCat);
  if (currentSearch) list = list.filter(p =>
    p.name.toLowerCase().includes(currentSearch) ||
    p.description.toLowerCase().includes(currentSearch) ||
    p.category.toLowerCase().includes(currentSearch)
  );
  switch (currentSort) {
    case "price-asc":  list.sort((a,b) => parseFloat(a.price) - parseFloat(b.price)); break;
    case "price-desc": list.sort((a,b) => parseFloat(b.price) - parseFloat(a.price)); break;
    case "name":       list.sort((a,b) => a.name.localeCompare(b.name)); break;
  }
  filtered = list;
  renderProducts();
}

// ── Render product cards ──────────────────────────────────
function renderProducts() {
  const grid  = document.getElementById("products-grid");
  const empty = document.getElementById("empty-state");
  if (!filtered.length) {
    grid.innerHTML = "";
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";
  // Skeleton shimmer for realism
  grid.innerHTML = Array(Math.min(filtered.length, 8)).fill(0).map(() =>
    '<div class="skeleton"><div class="skeleton-img"></div><div class="skeleton-body">' +
    '<div class="skeleton-line w70"></div><div class="skeleton-line w90"></div><div class="skeleton-line w50"></div></div></div>'
  ).join("");
  setTimeout(() => {
    grid.innerHTML = filtered.map(prod => {
      const stars = Array(5).fill(0).map((_,i) =>
        '<span class="star' + (i < (prod.rating||4) ? '' : ' empty') + '">&#x2605;</span>'
      ).join("");
      const liked = wishlist.includes(prod.productId);
      return (
        '<div class="product-card" id="card-' + prod.productId + '">' +
          '<div class="product-card-img" style="background:linear-gradient(' + (prod.gradient||"135deg,#1a1a2e,#16213e") + ')">' +
            prod.emoji +
            (prod.badge ? '<span class="product-badge">' + prod.badge + '</span>' : '') +
            '<button class="product-wishlist' + (liked ? ' liked' : '') + '" onclick="toggleWishlist(\'' + prod.productId + '\',this)">' +
              (liked ? '&#x2764;&#xFE0F;' : '&#x1F90D;') +
            '</button>' +
          '</div>' +
          '<div class="product-body">' +
            '<div class="product-cat">' + prod.category + '</div>' +
            '<div class="product-name">' + prod.name + '</div>' +
            '<div class="product-desc">' + prod.description + '</div>' +
            '<div class="product-stars">' + stars + '</div>' +
            '<div class="product-footer">' +
              '<div class="product-price">&#xA3;' + parseFloat(prod.price).toFixed(2) +
                (prod.oldPrice ? '<span class="old-price">&#xA3;' + parseFloat(prod.oldPrice).toFixed(2) + '</span>' : '') +
              '</div>' +
              '<button class="btn-add" id="btn-' + prod.productId + '" onclick="addToCart(' + JSON.stringify(prod).replace(/"/g,"&quot;") + ',this)">+ Cart</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }, 350);
}

// ── Cart ──────────────────────────────────────────────────
function addToCart(product, btn) {
  const existing = cart.find(i => i.productId === product.productId);
  if (existing) existing.qty++; else cart.push({...product, qty:1});
  saveCart(); updateCartBadge(); renderCartDrawer();
  if (btn) {
    btn.textContent = "&#x2713; Added";
    btn.classList.add("added");
    setTimeout(() => { btn.textContent = "+ Cart"; btn.classList.remove("added"); }, 1500);
  }
  toast("&#x1F6D2; " + product.name + " added to cart", "success");
}
function removeFromCart(id) { cart = cart.filter(i => i.productId !== id); saveCart(); updateCartBadge(); renderCartDrawer(); }
function changeQty(id, delta) {
  const item = cart.find(i => i.productId === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) cart = cart.filter(i => i.productId !== id);
  saveCart(); updateCartBadge(); renderCartDrawer();
}
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }
function updateCartBadge() {
  const total = cart.reduce((s,i) => s + i.qty, 0);
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  badge.textContent = total;
  badge.classList.add("bump");
  setTimeout(() => badge.classList.remove("bump"), 300);
}
function openCart()  { document.getElementById("cart-overlay").classList.add("open"); document.getElementById("cart-drawer").classList.add("open"); renderCartDrawer(); }
function closeCart() { document.getElementById("cart-overlay").classList.remove("open"); document.getElementById("cart-drawer").classList.remove("open"); }
function renderCartDrawer() {
  const body   = document.getElementById("cart-items");
  const footer = document.getElementById("cart-footer");
  if (!body) return;
  if (!cart.length) {
    body.innerHTML = '<div class="cart-empty"><p>&#x1F6D2;</p><p>Your cart is empty</p></div>';
    if (footer) footer.style.display = "none";
    return;
  }
  if (footer) footer.style.display = "block";
  body.innerHTML = cart.map(item =>
    '<div class="cart-item-row">' +
      '<div class="cart-item-emoji" style="background:linear-gradient(' + (item.gradient||"135deg,#1a1a2e,#16213e") + ')">' + item.emoji + '</div>' +
      '<div class="cart-item-info"><div class="cart-item-name">' + item.name + '</div><div class="cart-item-price">&#xA3;' + parseFloat(item.price).toFixed(2) + ' each</div></div>' +
      '<div class="cart-item-controls">' +
        '<button class="qty-btn" onclick="changeQty(\'' + item.productId + '\',-1)">&#x2212;</button>' +
        '<span class="qty-num">' + item.qty + '</span>' +
        '<button class="qty-btn" onclick="changeQty(\'' + item.productId + '\',1)">+</button>' +
        '<button class="cart-item-remove" onclick="removeFromCart(\'' + item.productId + '\')">&#x1F5D1;</button>' +
      '</div>' +
    '</div>'
  ).join("");
  const total = cart.reduce((s,i) => s + parseFloat(i.price)*i.qty, 0);
  const sub = document.getElementById("cart-subtotal");
  const tot = document.getElementById("cart-total");
  if (sub) sub.textContent = String.fromCharCode(163) + total.toFixed(2);
  if (tot) tot.textContent = String.fromCharCode(163) + total.toFixed(2);
}

// ── Checkout ──────────────────────────────────────────────
async function placeOrder() {
  if (!accessToken) { showLogin(); toast("Please sign in to checkout", "info"); return; }
  if (!cart.length)  { toast("Your cart is empty", "info"); return; }
  const btn = document.querySelector(".btn-checkout");
  if (btn) { btn.textContent = "Processing..."; btn.disabled = true; }
  try {
    const res = await fetch(CONFIG.API_URL + "/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": accessToken },
      body: JSON.stringify({ items: cart, shippingAddress: { line1: "123 Demo St", city: "London" } })
    });
    const data = await res.json();
    if (res.ok) { cart=[]; saveCart(); updateCartBadge(); renderCartDrawer(); closeCart(); toast("Order placed! ID: " + data.order.orderId, "success"); }
    else { toast("Order failed: " + data.error, "error"); }
  } catch {
    const orderId = "ORD-" + Math.random().toString(36).substr(2,8).toUpperCase();
    cart=[]; saveCart(); updateCartBadge(); renderCartDrawer(); closeCart();
    toast("&#x2705; Demo order placed! ID: " + orderId, "success");
  } finally {
    if (btn) { btn.textContent = "Checkout \u2192"; btn.disabled = false; }
  }
}

// ── Wishlist ──────────────────────────────────────────────
function toggleWishlist(productId, btn) {
  const idx = wishlist.indexOf(productId);
  if (idx === -1) { wishlist.push(productId); btn.innerHTML = "&#x2764;&#xFE0F;"; btn.classList.add("liked"); toast("Added to wishlist", "info"); }
  else            { wishlist.splice(idx,1);   btn.innerHTML = "&#x1F90D;";       btn.classList.remove("liked"); }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// ── Auth ──────────────────────────────────────────────────
function showLogin()       { document.getElementById("login-overlay").classList.add("open"); document.getElementById("login-modal").classList.add("open"); }
function closeLoginModal() { document.getElementById("login-overlay").classList.remove("open"); document.getElementById("login-modal").classList.remove("open"); }
function switchTab(tab) {
  ["login","register"].forEach(t => {
    document.getElementById("tab-"+t).classList.toggle("active", t===tab);
    document.getElementById("pane-"+t).classList.toggle("active", t===tab);
  });
  document.getElementById("auth-message").textContent = "";
}
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === "password" ? "text" : "password";
  btn.textContent = inp.type === "password" ? "&#x1F441;" : "&#x1F648;";
}
function setAuthMsg(msg, type) {
  const el = document.getElementById("auth-message");
  if (el) { el.textContent = msg; el.className = "auth-msg " + (type||""); }
}
async function login() {
  const email = document.getElementById("login-email").value;
  const pw    = document.getElementById("login-password").value;
  if (!email || !pw) { setAuthMsg("Email and password required", "error"); return; }
  setAuthMsg("Signing in...", "");
  try {
    const res = await fetch("https://cognito-idp." + CONFIG.REGION + ".amazonaws.com/", {
      method:"POST",
      headers:{"Content-Type":"application/x-amz-json-1.1","X-Amz-Target":"AWSCognitoIdentityProviderService.InitiateAuth"},
      body: JSON.stringify({AuthFlow:"USER_PASSWORD_AUTH",ClientId:CONFIG.CLIENT_ID,AuthParameters:{USERNAME:email,PASSWORD:pw}})
    });
    const data = await res.json();
    if (res.ok) { accessToken = data.AuthenticationResult.IdToken; currentUser = email; setLoggedIn(email); closeLoginModal(); toast("Welcome back, " + email.split("@")[0] + "!", "success"); }
    else { setAuthMsg(data.message || "Login failed", "error"); }
  } catch { setAuthMsg("Could not reach auth service", "error"); }
}
async function register() {
  const email = document.getElementById("reg-email").value;
  const pw    = document.getElementById("reg-password").value;
  if (!email || !pw)  { setAuthMsg("Email and password required", "error"); return; }
  if (pw.length < 8)  { setAuthMsg("Password must be at least 8 characters", "error"); return; }
  setAuthMsg("Creating account...", "");
  try {
    const res = await fetch("https://cognito-idp." + CONFIG.REGION + ".amazonaws.com/", {
      method:"POST",
      headers:{"Content-Type":"application/x-amz-json-1.1","X-Amz-Target":"AWSCognitoIdentityProviderService.SignUp"},
      body: JSON.stringify({ClientId:CONFIG.CLIENT_ID,Username:email,Password:pw})
    });
    const data = await res.json();
    if (res.ok) setAuthMsg("Account created! Check your email to verify.", "success");
    else        setAuthMsg(data.message || "Registration failed", "error");
  } catch { setAuthMsg("Registration error", "error"); }
}
function setLoggedIn(email) {
  const area = document.getElementById("nav-user-area");
  if (!area) return;
  area.innerHTML =
    '<div class="nav-avatar">' + email[0].toUpperCase() + '</div>' +
    '<span class="nav-username">' + email.split("@")[0] + '</span>' +
    '<button class="btn-signout" onclick="logout()">Sign out</button>';
}
function logout() {
  currentUser = null; accessToken = null;
  const area = document.getElementById("nav-user-area");
  if (area) area.innerHTML = '<button class="btn-nav btn-login" onclick="showLogin()">Sign In</button>';
  toast("Signed out", "info");
}

// ── Architecture modal ────────────────────────────────────
function showArchModal()  { document.getElementById("arch-overlay").classList.add("open"); document.getElementById("arch-modal").classList.add("open"); }
function closeArchModal() { document.getElementById("arch-overlay").classList.remove("open"); document.getElementById("arch-modal").classList.remove("open"); }

// ── Dark / Light theme ────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const next = html.dataset.theme === "dark" ? "light" : "dark";
  html.dataset.theme = next;
  localStorage.setItem("theme", next);
  const btn = document.querySelector(".theme-toggle");
  if (btn) btn.textContent = next === "dark" ? "&#x1F31A;" : "&#x2600;&#xFE0F;";
}
(function(){ const s = localStorage.getItem("theme"); if(s){ document.documentElement.dataset.theme=s; } })();

// ── Toast notifications ───────────────────────────────────
function toast(msg, type) {
  const c = document.getElementById("toast-container");
  if (!c) return;
  const t = document.createElement("div");
  t.className = "toast " + (type||"info");
  t.innerHTML = msg;
  c.appendChild(t);
  setTimeout(() => { t.classList.add("fadeOut"); setTimeout(() => t.remove(), 300); }, 3000);
}

// ── Smooth scroll to products ─────────────────────────────
function scrollToProducts() { document.getElementById("shop").scrollIntoView({behavior:"smooth"}); }
