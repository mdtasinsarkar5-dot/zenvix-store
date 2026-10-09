const SUPABASE_URL = "https://ubdpqxklbovuulftrpwa.supabase.co";
const SUPABASE_KEY = "sb_publishable_2HM5zs-nUMwdOpMbwijo8g_jfC-ihYO";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
const IMG={
power:"https://brlhc31l9m.tenbytecdn.com/assets/images/products/power-bank/product_12652_main.webp?w=900",
head:"https://down-th.img.susercontent.com/file/th-11134207-7r98y-lpew7auec3ged6",
mouse:"https://pacoecuador.vtexassets.com/arquivos/ids/431579-150-auto?aspect=true&height=auto&v=638890932153170000&width=150",
ear:"https://www.e-shop.gr/images/TEL/ART2/TEL.231240_5.jpg"
};
const seedProducts=[
{id:1,name:"Joyroom JR-PBF05 65W 30000mAh Power Bank",cat:"Power Bank",price:4650,old:5400,stock:41,rating:4.8,img:IMG.power,brand:"JOYROOM",badge:"14% OFF",desc:"30000mAh capacity with up to 65W USB-C power delivery. Demo catalog data based on a current Bangladesh product listing."},
{id:2,name:"Havit H655BT ANC Bluetooth Headphone",cat:"Headphones",price:3500,old:3850,stock:18,rating:4.9,img:IMG.head,brand:"Havit",badge:"HOT",desc:"Bluetooth 5.3, hybrid ANC, 700mAh battery and up to 76 hours playback according to the listed specifications."},
{id:3,name:"Havit HV-MS1027 USB Gaming Mouse",cat:"Gaming",price:530,old:580,stock:30,rating:4.7,img:IMG.mouse,brand:"Havit",badge:"BEST VALUE",desc:"Wired gaming mouse with adjustable DPI, ergonomic shape and breathing-light design."},
{id:4,name:"T-WOLF T18 RGB Mechanical Gaming Keyboard",cat:"Keyboard",price:1950,old:2145,stock:14,rating:4.7,img:"https://placehold.co/900x700/f4f5f7/17202a?text=T-WOLF+T18+RGB",brand:"T-WOLF",badge:"GAMING",desc:"87-key wired mechanical keyboard with blue switches and RGB lighting."},
{id:5,name:"AKAI BTE-J500BT Earbuds + Speaker",cat:"Headphones",price:2290,old:2590,stock:10,rating:4.5,img:IMG.ear,brand:"AKAI",badge:"2-IN-1",desc:"True wireless earbuds with a portable speaker-style charging case. Replace demo price with your supplier price before launch."},
{id:6,name:"Baseus-style 20W USB-C Charger",cat:"Chargers",price:990,old:1190,stock:22,rating:4.6,img:"https://placehold.co/900x700/f4f5f7/17202a?text=20W+USB-C+Charger",brand:"Sarkar Select",badge:"DEAL",desc:"Compact USB-C charging adapter. Use your exact model specifications before publishing."},
{id:7,name:"RGB Gaming Mouse Pad XL",cat:"Gaming",price:790,old:990,stock:20,rating:4.6,img:"https://placehold.co/900x700/f4f5f7/17202a?text=RGB+Gaming+Mouse+Pad",brand:"Sarkar Select",badge:"GAMING",desc:"Large desk mat for keyboard and mouse setups."},
{id:8,name:"20,000mAh Fast Power Bank",cat:"Power Bank",price:1790,old:2190,stock:25,rating:4.5,img:"https://placehold.co/900x700/f4f5f7/17202a?text=20%2C000mAh+Power+Bank",brand:"Sarkar Select",badge:"DEAL",desc:"Everyday high-capacity power bank. Replace demo specs with your actual inventory."}
];

function money(n){return "৳"+Number(n).toLocaleString("en-BD")}
async function getProducts(){
  const { data, error } = await supabaseClient
    .from("products")
    .select(`
      *,
      product_images (
        url,
        sort_order
      )
    `)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if(error){
    console.error("Supabase products error:", error);
    return [];
  }

  const products = (data || []).map(p => ({
    ...p,
    id: String(p.id),
    cat: p.category || p.cat || "Other",
    category: p.category || p.cat || "Other",
    price: Number(p.price) || 0,
    old: Number(p.compare_at_price ?? p.old_price ?? p.price) || 0,
    stock: Number(p.stock ?? p.stock_quantity ?? p.quantity) || 0,
    images: (p.product_images || [])
      .slice()
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
      .map(image => image.url)
      .filter(Boolean),
    img: p.product_images?.slice()?.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))?.[0]?.url || p.image_url || p.img || "",
    badge: p.badge || "",
    rating: Number(p.rating) || 5,
    desc: p.description || p.desc || ""
  }));

  console.log("Supabase products:", products);
  return products;
}function saveProducts(p){localStorage.setItem("se_products",JSON.stringify(p))}
function getCart(){return JSON.parse(localStorage.getItem("se_cart")||"[]")}
function saveCart(c){localStorage.setItem("se_cart",JSON.stringify(c));updateCartCount()}
// Orders and delivery settings use Supabase so customers/admins share the same data.
function getLocalOrders(){try{return JSON.parse(localStorage.getItem("se_orders")||"[]")}catch{return []}}
async function getOrders(){
  const {data,error}=await supabaseClient.from("zenvix_orders").select("order_number,order_data,status,created_at").order("created_at",{ascending:false});
  if(error){console.error("Load orders failed:",error);return getLocalOrders();}
  return (data||[]).map(row=>({...row.order_data,id:row.order_number,status:row.status||row.order_data?.status||"Pending",date:row.order_data?.date||row.created_at}));
}
async function saveOrder(order){
  const {error}=await supabaseClient.from("zenvix_orders").insert({order_number:order.id,order_data:order,status:order.status||"Pending"});
  if(error){console.error("Save order failed:",error);throw error;}
}
async function saveOrderStatus(id,status){
  const {error}=await supabaseClient.from("zenvix_orders").update({status}).eq("order_number",id);
  if(error){console.error("Update order status failed:",error);throw error;}
}
function updateCartCount(){document.querySelectorAll("#cartCount").forEach(e=>e.textContent=getCart().reduce((s,x)=>s+x.qty,0))}
function addToCart(id,qty=1){
  id = String(id);
  qty = Math.max(1, Number(qty) || 1);
  let c=getCart(),x=c.find(i=>String(i.id)===id);
  x ? x.qty+=qty : c.push({id,qty});
  saveCart(c);
  showToast("Added to cart ✓");
}

function buyNow(id, qty=1){
  id = String(id);
  qty = Math.max(1, Number(qty) || 1);
  // Buy Now is a direct checkout for this product only; do not include other cart items.
  saveCart([{id, qty}]);
  location.href = "checkout.html";
}
function showToast(msg){let t=document.createElement("div");t.textContent=msg;t.style.cssText="position:fixed;right:20px;bottom:20px;background:#0d1b2a;color:#fff;padding:13px 17px;border-radius:10px;z-index:99;box-shadow:0 10px 30px #0003;font-weight:800;font-size:13px";document.body.appendChild(t);setTimeout(()=>t.remove(),1700)}
function card(p){
  const id = encodeURIComponent(String(p.id));
  const name = String(p.name || "Product").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const img = p.img || "https://placehold.co/900x700/f4f5f7/17202a?text=Product+Image";
  const brand = p.brand || "";
  const cat = p.cat || p.category || "Other";
  return `<article class="product-card">
    <a href="product.html?id=${id}"><div class="product-image"><span class="sale-badge">${p.badge || ""}</span><img src="${img}" alt="${name}" onerror="this.src='https://placehold.co/900x700/f4f5f7/17202a?text=Product+Image'"></div></a>
    <div class="product-body"><small>${brand} • ${cat}</small><h3><a class="product-title-link" href="product.html?id=${id}">${name}</a></h3>
    <div class="rating">★★★★★ <span>(${p.rating || 5})</span></div>
    <div><span class="price">${money(p.price)}</span>${p.old > p.price ? `<span class="old">${money(p.old)}</span>` : ""}</div>
    <div class="product-actions"><button class="buy-now" onclick="buyNow('${String(p.id).replace(/'/g, "\\'")}')">Buy Now</button><button class="add" onclick="addToCart('${String(p.id).replace(/'/g, "\\'")}')">Add to cart</button></div></div></article>`;
}
async function renderFeatured(){let p=(await getProducts()).slice(0,4);document.getElementById("featuredGrid").innerHTML=p.map(card).join("");updateCartCount()}
function homeSearch(){let q=document.getElementById("homeSearch").value.trim();location.href="products.html"+(q?"?q="+encodeURIComponent(q):"")}
async function initShop(){
  const params = new URLSearchParams(location.search);
  let active = params.get("cat") || "all";
  const initialQuery = params.get("q") || "";
  const search = document.getElementById("search");
  const grid = document.getElementById("productGrid");
  if (!search || !grid) return;
  search.value = initialQuery;

  grid.innerHTML = '<div class="empty">Loading products…</div>';
  const products = await getProducts();

  document.querySelectorAll(".filters button").forEach(button => {
    button.classList.toggle("active", button.dataset.cat === active);
    button.onclick = () => {
      active = button.dataset.cat || "all";
      document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      draw();
    };
  });

  const sortSelect = document.getElementById("sort");
  if (sortSelect) sortSelect.onchange = draw;
  search.oninput = draw;

  function draw(){
    const keyword = search.value.trim().toLowerCase();
    const list = products.filter(product => {
      const category = String(product.category || product.cat || "Other");
      const name = String(product.name || "").toLowerCase();
      const brand = String(product.brand || "").toLowerCase();

      const categoryMatch =
        active === "all" ||
        category.toLowerCase() === active.toLowerCase() ||
        (active === "Gaming" && ["gaming", "mouse", "keyboard", "mouse pad"].includes(category.toLowerCase())) ||
        (active === "Speakers" && ["speaker", "speakers", "earbuds", "headphones"].includes(category.toLowerCase())) ||
        (active === "Headphones" && ["headphone", "headphones"].includes(category.toLowerCase())) ||
        (active === "Keyboard" && ["keyboard", "mouse", "mouse pad", "gaming"].includes(category.toLowerCase())) ||
        (active === "Chargers" && ["charger", "chargers", "cable", "cables"].includes(category.toLowerCase()));

      const searchMatch = !keyword || name.includes(keyword) ||
        category.toLowerCase().includes(keyword) || brand.includes(keyword);

      return categoryMatch && searchMatch;
    });

    const sort = sortSelect?.value || "featured";
    if (sort === "low") list.sort((a,b) => a.price - b.price);
    if (sort === "high") list.sort((a,b) => b.price - a.price);

    grid.innerHTML = list.length
      ? list.map(card).join("")
      : '<div class="empty">No products found in this category.</div>';
  }

  draw();
  updateCartCount();
}

async function renderDetail(){
  const detail = document.getElementById("detail");
  if (!detail) return;
  const id = new URLSearchParams(location.search).get("id");
  detail.innerHTML = '<div class="empty">Loading product…</div>';
  const products = await getProducts();
  const product = products.find(item => String(item.id) === String(id)) || products[0];

  if (!product) {
    detail.innerHTML = '<div class="empty"><h2>Product not found</h2><a class="btn orange" href="products.html">Back to products</a></div>';
    updateCartCount();
    return;
  }

  const imageList = [...new Set([...(product.images || []), product.img].filter(Boolean))];
  if (!imageList.length) imageList.push("https://placehold.co/900x700/f4f5f7/17202a?text=Product+Image");
  const img = imageList[0];
  detail.innerHTML = `<div class="detail-card">
    <div class="detail-gallery">
      <button type="button" class="detail-image" id="mainProductImage" aria-label="Zoom product image">
        <img id="detailMainImg" src="${img}" alt="${product.name || "Product"}" onerror="this.src='https://placehold.co/900x700/f4f5f7/17202a?text=Product+Image'">
        <span class="zoom-hint">⌕ Tap to zoom</span>
      </button>
      ${imageList.length > 1 ? `<div class="product-thumbnails" id="productThumbnails" aria-label="More product images">${imageList.map((url, index) => `<button type="button" class="product-thumb ${index === 0 ? "active" : ""}" data-image-index="${index}" aria-label="View product image ${index + 1}"><img src="${url}" alt="${product.name || "Product"} view ${index + 1}" onerror="this.style.display='none'"></button>`).join("")}</div>` : `<p class="gallery-note">Tap the image to zoom</p>`}
    </div>
    <div class="detail-info"><small>${product.brand || ""} • ${product.cat || product.category || "Other"}</small>
    <h1>${product.name || "Product"}</h1><div class="rating">★★★★★ ${product.rating || 5}</div>
    <div class="price">${money(product.price)} ${product.old > product.price ? `<span class="old">${money(product.old)}</span>` : ""}</div>
    <p>${product.desc || product.description || "Quality tech accessories for everyday use."}</p>
    <p><b>Stock:</b> ${product.stock ?? "Available"} units • <b>Delivery:</b> Nationwide</p>
    <div class="qty"><b>Qty</b><input id="qty" type="number" min="1" max="${Math.max(1, product.stock || 99)}" value="1"></div>
    <button class="btn orange" id="detailBuyNow">Buy Now</button>
    <button class="btn ghost" id="detailAddToCart" style="margin-left:7px">Add to cart</button>
    <a class="btn ghost" style="background:#fff;color:#17202a;border:1px solid #e7eaf0;margin-left:7px" href="cart.html">Go to cart</a>
    <div class="cart-box" style="margin-top:25px"><b>Why buy from ZENVIX?</b><p style="margin-bottom:0">COD support • Product assistance • Simple checkout</p></div></div></div>
    <div class="image-zoom-modal" id="imageZoomModal" aria-hidden="true">
      <button type="button" class="zoom-close" id="zoomClose" aria-label="Close image">×</button>
      <button type="button" class="zoom-nav zoom-prev" id="zoomPrev" aria-label="Previous image">‹</button>
      <div class="zoom-stage" id="zoomStage"><img id="zoomImage" src="${img}" alt="${product.name || "Product"} enlarged"></div>
      <button type="button" class="zoom-nav zoom-next" id="zoomNext" aria-label="Next image">›</button>
      <div class="zoom-controls"><button type="button" id="zoomOut" aria-label="Zoom out">−</button><span id="zoomLevel">100%</span><button type="button" id="zoomIn" aria-label="Zoom in">+</button></div>
      <p class="zoom-caption">Use +/− to zoom • Swipe to change image</p>
    </div>`;
  const mainImg = document.getElementById("detailMainImg");
  const zoomModal = document.getElementById("imageZoomModal");
  const zoomImg = document.getElementById("zoomImage");
  let activeImageIndex = 0;
  let zoomScale = 1;
  const setProductImage = (index) => {
    activeImageIndex = (index + imageList.length) % imageList.length;
    mainImg.src = imageList[activeImageIndex];
    zoomImg.src = imageList[activeImageIndex];
    document.querySelectorAll(".product-thumb").forEach((button, i) => button.classList.toggle("active", i === activeImageIndex));
    zoomScale = 1;
    zoomImg.style.transform = "scale(1)";
    document.getElementById("zoomLevel").textContent = "100%";
  };
  document.querySelectorAll(".product-thumb").forEach(button => {
    button.addEventListener("click", () => setProductImage(Number(button.dataset.imageIndex)));
  });
  const closeZoom = () => {
    zoomModal.classList.remove("open");
    zoomModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("zoom-open");
  };
  document.getElementById("mainProductImage").addEventListener("click", () => {
    setProductImage(activeImageIndex);
    zoomModal.classList.add("open");
    zoomModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("zoom-open");
  });
  document.getElementById("zoomClose").addEventListener("click", closeZoom);
  zoomModal.addEventListener("click", event => { if (event.target === zoomModal) closeZoom(); });
  document.getElementById("zoomPrev").addEventListener("click", () => setProductImage(activeImageIndex - 1));
  document.getElementById("zoomNext").addEventListener("click", () => setProductImage(activeImageIndex + 1));
  const applyZoom = (delta) => {
    zoomScale = Math.max(1, Math.min(3, zoomScale + delta));
    zoomImg.style.transform = `scale(${zoomScale})`;
    document.getElementById("zoomLevel").textContent = `${Math.round(zoomScale * 100)}%`;
  };
  document.getElementById("zoomIn").addEventListener("click", () => applyZoom(0.25));
  document.getElementById("zoomOut").addEventListener("click", () => applyZoom(-0.25));
  let touchStartX = 0;
  const zoomStage = document.getElementById("zoomStage");
  zoomStage.addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].clientX; }, {passive:true});
  zoomStage.addEventListener("touchend", event => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 55) setProductImage(activeImageIndex + (deltaX < 0 ? 1 : -1));
  }, {passive:true});
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeZoom(); });
  document.getElementById("detailAddToCart").onclick = () => {
    const qty = Math.max(1, Number(document.getElementById("qty").value) || 1);
    addToCart(product.id, qty);
  };
  document.getElementById("detailBuyNow").onclick = () => {
    const qty = Math.max(1, Number(document.getElementById("qty").value) || 1);
    buyNow(product.id, qty);
  };
  updateCartCount();
}

function getCartProducts(cart, products){
  return cart.map(item => {
    const product = products.find(p => String(p.id) === String(item.id));
    return product ? {...product, qty: Math.max(1, Number(item.qty) || 1)} : null;
  }).filter(Boolean);
}

const DELIVERY_SETTINGS_KEY = "zenvix_delivery_settings";
const DEFAULT_DELIVERY_SETTINGS = {
  courier: "Other",
  originDistrict: "Rajshahi",
  originArea: "",
  sameDistrict: 90,
  dhakaCity: 100,
  otherDistrict: 150,
  areaOverrides: ""
};
let deliverySettingsCache = null;
async function getDeliverySettings(){
  if(deliverySettingsCache) return {...DEFAULT_DELIVERY_SETTINGS,...deliverySettingsCache};
  const {data,error}=await supabaseClient.from("zenvix_delivery_settings").select("settings").eq("id",1).maybeSingle();
  if(error){console.error("Load delivery settings failed:",error);try{deliverySettingsCache=JSON.parse(localStorage.getItem(DELIVERY_SETTINGS_KEY)||"{}")}catch{deliverySettingsCache={}}}
  else deliverySettingsCache=data?.settings||{};
  return {...DEFAULT_DELIVERY_SETTINGS,...deliverySettingsCache};
}
async function saveDeliverySettings(settings){
  const {error}=await supabaseClient.from("zenvix_delivery_settings").upsert({id:1,settings,updated_at:new Date().toISOString()});
  if(error) throw error;
  deliverySettingsCache=settings;
  localStorage.setItem(DELIVERY_SETTINGS_KEY,JSON.stringify(settings));
}
function normalizePlace(value){
  return String(value || "").trim().toLocaleLowerCase().replace(/\\s+/g, " ");
}
function calculateDeliveryCharge(district, area, settings = {...DEFAULT_DELIVERY_SETTINGS,...(deliverySettingsCache||{})}){
  const destinationDistrict = normalizePlace(district);
  const destinationArea = normalizePlace(area);
  // Optional exact-area overrides: one rule per line, format District | Area | Charge.
  const rules = String(settings.areaOverrides || "").split(/\\r?\\n/).map(line => {
    const parts = line.split("|").map(part => part.trim());
    return parts.length >= 3 && parts[0] && parts[1] && Number.isFinite(Number(parts[2]))
      ? {district: normalizePlace(parts[0]), area: normalizePlace(parts[1]), charge: Math.max(0, Number(parts[2]))}
      : null;
  }).filter(Boolean);
  const override = rules.find(rule => rule.district === destinationDistrict && rule.area === destinationArea);
  if (override) return {charge: override.charge, rule: "Area-specific rate"};
  if (destinationDistrict === "dhaka" || destinationDistrict === "dhaka city") {
    return {charge: Math.max(0, Number(settings.dhakaCity) || 0), rule: "Dhaka city"};
  }
  if (destinationDistrict && destinationDistrict === normalizePlace(settings.originDistrict)) {
    return {charge: Math.max(0, Number(settings.sameDistrict) || 0), rule: "Same district / local"};
  }
  return {charge: Math.max(0, Number(settings.otherDistrict) || 0), rule: "Other district"};
}
function calculateCartTotals(cartProducts, district = "", area = ""){
  const subtotal = cartProducts.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal ? calculateDeliveryCharge(district, area).charge : 0;
  return {sub: subtotal, delivery, total: subtotal + delivery};
}

async function renderCart(){
  const el = document.getElementById("cart");
  if (!el) return;
  const cart = getCart();
  if (!cart.length) {
    el.innerHTML = '<div class="empty"><h2>Your shopping cart is empty</h2><p>Find something useful for your setup.</p><a class="btn orange" href="products.html">Continue shopping</a></div>';
    updateCartCount();
    return;
  }
  el.innerHTML = '<div class="empty">Loading your cart…</div>';
  const products = await getProducts();
  const items = getCartProducts(cart, products);
  if (!items.length) {
    el.innerHTML = '<div class="empty"><h2>Your cart is empty</h2><p>The saved products may no longer be available.</p><a class="btn orange" href="products.html">Continue shopping</a></div>';
    localStorage.removeItem("se_cart");
    updateCartCount();
    return;
  }
  const totals = calculateCartTotals(items);
  el.innerHTML = `<div class="cart-layout"><div class="cart-box">${items.map(item => `<div class="cart-row">
    <a class="thumb cart-product-link" href="product.html?id=${encodeURIComponent(String(item.id))}" aria-label="View ${item.name} details"><img src="${item.img || "https://placehold.co/200x150?text=Image"}" alt="${item.name || "Product"}" onerror="this.src='https://placehold.co/200x150?text=Image'"></a>
    <div><h3><a class="product-title-link" href="product.html?id=${encodeURIComponent(String(item.id))}">${item.name}</a></h3><small>${money(item.price)} each</small></div>
    <div class="qty-controls"><button onclick="changeQty('${String(item.id).replace(/'/g, "\\'")}',-1)">−</button><b>${item.qty}</b><button onclick="changeQty('${String(item.id).replace(/'/g, "\\'")}',1)">+</button></div>
    <b class="row-total">${money(item.price * item.qty)}</b></div>`).join("")}</div>
    <aside class="summary"><h2>Order summary</h2><div class="line"><span>Subtotal</span><b>${money(totals.sub)}</b></div>
    <div class="line"><span>Delivery</span><b>${money(totals.delivery)}</b></div><div class="line total"><span>Total</span><b>${money(totals.total)}</b></div>
    <a class="btn orange full" href="checkout.html">Proceed to checkout</a></aside></div>`;
  updateCartCount();
}

function changeQty(id, delta){
  id = String(id);
  let cart = getCart();
  const item = cart.find(x => String(x.id) === id);
  if (item) {
    item.qty = (Number(item.qty) || 1) + delta;
    if (item.qty <= 0) cart = cart.filter(x => String(x.id) !== id);
  }
  saveCart(cart);
  renderCart();
}

async function renderCheckout(){
  const el = document.getElementById("checkout");
  if (!el) return;
  const cart = getCart();
  if (!cart.length) {
    el.innerHTML = '<div class="empty"><h2>Cart is empty</h2><a class="btn orange" href="products.html">Shop now</a></div>';
    return;
  }
  el.innerHTML = '<div class="empty">Loading checkout…</div>';
  const products = await getProducts();
  const items = getCartProducts(cart, products);
  if (!items.length) {
    el.innerHTML = '<div class="empty"><h2>Cart is empty</h2><a class="btn orange" href="products.html">Shop now</a></div>';
    return;
  }
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const settings = await getDeliverySettings();
  el.innerHTML = `<div class="checkout-layout"><form class="checkout-box" id="orderForm"><h2>Delivery information</h2>
    <div class="form-grid"><div class="field"><label>Full name</label><input required name="name" placeholder="Your name"></div>
    <div class="field"><label>Phone</label><input required name="phone" placeholder="01XXXXXXXXX"></div>
    <div class="field"><label>District</label><input required name="district" placeholder="Rajshahi" autocomplete="address-level1"></div>
    <div class="field"><label>Area / Thana</label><input required name="area" placeholder="Area / thana" autocomplete="address-level2"></div>
    <div class="field full-field"><label>Full address</label><textarea required name="address" placeholder="House, road, area"></textarea></div>
    <div class="field"><label>Payment</label><select name="payment"><option>Cash on Delivery</option><option>bKash (manual)</option><option>Nagad (manual)</option><option>Rocket (manual)</option></select></div>
    <div class="field"><label>Order note</label><input name="note" placeholder="Optional"></div></div>
    <button class="btn orange full" type="submit" id="placeOrderButton">Place order</button></form>
    <aside class="summary"><h2>Review order</h2>${items.map(item => `<div class="line"><span>${item.name} × ${item.qty}</span><b>${money(item.price * item.qty)}</b></div>`).join("")}
    <div class="line"><span>Product total</span><b id="checkoutSubtotal">${money(subtotal)}</b></div>
    <div class="line"><span>Courier</span><b>${String(settings.courier || "Other")}</b></div>
    <div class="line"><span>Delivery charge <small id="deliveryRuleLabel">(select district)</small></span><b id="checkoutDelivery">${money(0)}</b></div>
    <div class="line total"><span>Grand total</span><b id="checkoutTotal">${money(subtotal)}</b></div>
    <p class="muted" style="font-size:12px">Delivery charge is calculated automatically from the district and area you enter.</p></aside></div>`;

  const formEl = document.getElementById("orderForm");
  const updateTotals = () => {
    const district = formEl.elements.district.value;
    const area = formEl.elements.area.value;
    const deliveryInfo = calculateDeliveryCharge(district, area, settings);
    const delivery = subtotal ? deliveryInfo.charge : 0;
    document.getElementById("checkoutDelivery").textContent = money(delivery);
    document.getElementById("checkoutTotal").textContent = money(subtotal + delivery);
    document.getElementById("deliveryRuleLabel").textContent = district.trim() ? `(${deliveryInfo.rule})` : "(select district)";
    document.getElementById("placeOrderButton").textContent = `Place order • ${money(subtotal + delivery)}`;
    return {delivery, deliveryRule: deliveryInfo.rule, total: subtotal + delivery};
  };
  formEl.elements.district.addEventListener("input", updateTotals);
  formEl.elements.area.addEventListener("input", updateTotals);
  updateTotals();

  formEl.onsubmit = async event => {
    event.preventDefault();
    const submitButton=document.getElementById("placeOrderButton");
    submitButton.disabled=true; submitButton.textContent="Saving order…";
    const form = new FormData(event.target);
    const district = String(form.get("district") || "").trim();
    const area = String(form.get("area") || "").trim();
    const totals = updateTotals();
    const order = {
      id: "ZV" + Date.now().toString().slice(-8),
      date: new Date().toLocaleString(),
      customer: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      district,
      area,
      address: String(form.get("address") || "").trim(),
      payment: form.get("payment"),
      note: form.get("note"),
      courier: settings.courier || "Other",
      items: items.map(item => ({id: item.id, qty: item.qty, name: item.name, price: item.price})),
      subtotal,
      deliveryCharge: totals.delivery,
      deliveryRule: totals.deliveryRule,
      total: totals.total,
      status: "Pending"
    };
    try { await saveOrder(order); }
    catch(error){ submitButton.disabled=false; updateTotals(); showToast("Order save failed. Please try again later."); return; }
    localStorage.removeItem("se_cart");
    el.innerHTML = `<div class="success"><div class="check">✓</div><h2>Order placed successfully!</h2><p>Order ID: <b>${order.id}</b></p><p>Product total: <b>${money(order.subtotal)}</b></p><p>Delivery charge: <b>${money(order.deliveryCharge)}</b> (${order.deliveryRule})</p><p>Grand total: <b>${money(order.total)}</b></p><p>We will contact you at <b>${order.phone}</b> to confirm the order.</p><a class="btn orange" href="index.html">Back to store</a></div>`;
    updateCartCount();
  };
}

async function initAdmin(){
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(!session){
    document.querySelector(".admin-page").innerHTML=`<section class="summary" style="max-width:520px;margin:40px auto;padding:28px"><h1>Admin sign in</h1><p>Sign in with an admin account created in Supabase Authentication.</p><form id="adminLoginForm" class="admin-form"><input name="email" type="email" placeholder="Admin email" required><input name="password" type="password" placeholder="Password" required><button class="btn orange" type="submit">Sign in</button><p id="adminLoginError" role="alert"></p></form></section>`;
    document.getElementById("adminLoginForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const {error}=await supabaseClient.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});if(error){document.getElementById("adminLoginError").textContent="Sign in failed. Check credentials and try again.";return;}location.reload();};
    return;
  }
  const {data:adminRow,error:adminError}=await supabaseClient.from("zenvix_admin_users").select("user_id").eq("user_id",session.user.id).maybeSingle();
  if(adminError||!adminRow){await supabaseClient.auth.signOut();document.querySelector(".admin-page").innerHTML='<div class="empty"><h2>Admin access not enabled</h2><p>This account is not in the zenvix_admin_users table. Ask the project owner to grant admin access.</p></div>';return;}
  const header=document.querySelector(".admin-top");
  if(header){const logout=document.createElement("button");logout.className="btn light-btn";logout.textContent="Sign out";logout.onclick=async()=>{await supabaseClient.auth.signOut();location.reload()};header.appendChild(logout);}
  await renderAdmin();
  document.querySelectorAll(".admin-tabs button").forEach(button => {
    button.onclick = () => {
      document.querySelectorAll(".admin-tabs button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelectorAll(".admin-tab").forEach(tab => tab.classList.add("hidden"));
      document.getElementById("tab-" + button.dataset.tab)?.classList.remove("hidden");
    };
  });
}
async function renderAdmin(){
  let p = await getProducts();
  let o = await getOrders();

  let revenue = o
    .filter(x => x.status !== "Cancelled")
    .reduce((s, x) => s + x.total, 0);

  document.getElementById("dashboardCards").innerHTML = `
    <div class="dash-card">
      <span>Products</span>
      <b>${p.length}</b>
    </div>

    <div class="dash-card">
      <span>Orders</span>
      <b>${o.length}</b>
    </div>

    <div class="dash-card">
      <span>Pending</span>
      <b>${o.filter(x => x.status === "Pending").length}</b>
    </div>

    <div class="dash-card">
      <span>Order value</span>
      <b>${money(revenue)}</b>
    </div>
  `;

  document.getElementById("tab-overview").innerHTML = `
    <h2>Quick overview</h2>
    <p style="color:#667085">
      Products are loaded from Supabase.
    </p>

    <div class="trust">
      <div class="trust-item">
        <b>Products</b>
        <span>${p.length} catalog items</span>
      </div>

      <div class="trust-item">
        <b>Orders</b>
        <span>${o.length} saved orders</span>
      </div>
    </div>
  `;

  document.getElementById("tab-products").innerHTML = `
    <h2>Product management</h2>

    <form class="admin-form" id="productForm">

      <input
        name="name"
        class="wide"
        placeholder="Product name"
        required
      >

      <input
        name="brand"
        placeholder="Brand"
        required
      >

      <select name="cat">
        <option>Power Bank</option>
        <option>Headphones</option>
        <option>Gaming</option>
        <option>Keyboard</option>
        <option>Speakers</option>
        <option>Chargers</option>
      </select>

      <input
        name="price"
        type="number"
        placeholder="Price"
        required
      >

      <input
        name="old"
        type="number"
        placeholder="Regular price"
      >

      <input
        name="stock"
        type="number"
        placeholder="Stock"
        required
      >

      <input
        name="img"
        class="wide"
        placeholder="Image URL"
      >

      <button>Add product</button>

    </form>

    <div style="overflow:auto">

      <table class="admin-table">

        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          ${
            p.length
              ? p.map(x => `
                <tr>
                  <td>${x.name}</td>
                  <td>${x.cat}</td>
                  <td>${money(x.price)}</td>
                  <td>${x.stock}</td>

                  <td>
                    <button
                      class="mini danger"
                      onclick="deleteProduct('${x.id}')">
                      Delete
                    </button>
                  </td>

                </tr>
              `).join("")
              : `
                <tr>
                  <td colspan="5">No products found.</td>
                </tr>
              `
          }

        </tbody>

      </table>

    </div>
  `;

  document.getElementById("productForm").onsubmit = async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const name = String(form.get("name") || "").trim();
    const brand = String(form.get("brand") || "").trim();
    const category = String(form.get("cat") || "").trim();
    const price = Number(form.get("price"));
    const compareAtPrice = Number(form.get("old")) || price;
    const stock = Number(form.get("stock")) || 0;
    const imageUrl = String(form.get("img") || "").trim();

    if (!name || !brand || !Number.isFinite(price) || price <= 0) {
      showToast("Please enter a valid name, brand and price.");
      return;
    }

    const button = event.submitter || event.target.querySelector('button[type="submit"],button');
    if (button) { button.disabled = true; button.textContent = "Saving…"; }

    const { data: inserted, error } = await supabaseClient
      .from("products")
      .insert([{
        name,
        brand,
        category,
        price,
        compare_at_price: compareAtPrice,
        stock,
        description: "Product added from the ZENVIX admin panel.",
        active: true
      }])
      .select("id")
      .single();

    if (error) {
      console.error("Product insert error:", error);
      showToast("Could not save product. Check Supabase table permissions/schema.");
      if (button) { button.disabled = false; button.textContent = "Add product"; }
      return;
    }

    if (imageUrl && inserted?.id) {
      const { error: imageError } = await supabaseClient
        .from("product_images")
        .insert([{ product_id: inserted.id, url: imageUrl, sort_order: 0 }]);
      if (imageError) {
        console.error("Product image insert error:", imageError);
        showToast("Product saved, but its image could not be saved.");
      }
    }

    showToast("Product added ✓");
    await renderAdmin();
  };

  document.getElementById("tab-orders").innerHTML = `
    <h2>Order management</h2>

    <div style="overflow:auto">

      <table class="admin-table">

        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Total</th>
            <th>Status</th>
            <th>Change</th>
          </tr>
        </thead>

        <tbody>

          ${
            o.length
              ? o.map(x => `
                <tr>

                  <td>
                    <b>${x.id}</b><br>
                    <small>${x.date}</small>
                  </td>

                  <td>
                    ${x.customer}<br>
                    ${x.district}
                  </td>

                  <td>${x.phone}</td>

                  <td><b>${money(x.total)}</b><br><small>Items: ${money(x.subtotal ?? x.total)} · Delivery: ${money(x.deliveryCharge ?? 0)}</small></td>

                  <td>
                    <span class="status ${x.status.toLowerCase()}">
                      ${x.status}
                    </span>
                  </td>

                  <td>
                    <select
                      onchange="setOrderStatus('${x.id}',this.value)"
                    >

                      <option ${x.status === "Pending" ? "selected" : ""}>
                        Pending
                      </option>

                      <option ${x.status === "Confirmed" ? "selected" : ""}>
                        Confirmed
                      </option>

                      <option ${x.status === "Shipped" ? "selected" : ""}>
                        Shipped
                      </option>

                      <option ${x.status === "Delivered" ? "selected" : ""}>
                        Delivered
                      </option>

                      <option ${x.status === "Cancelled" ? "selected" : ""}>
                        Cancelled
                      </option>

                    </select>
                  </td>

                </tr>
              `).join("")
              : `
                <tr>
                  <td colspan="6">No orders yet.</td>
                </tr>
              `
          }

        </tbody>

      </table>

    </div>
  `;

  const deliverySettings = await getDeliverySettings();
  document.getElementById("tab-delivery").innerHTML = `
    <h2>Delivery settings</h2>
    <p style="color:#667085">Set the courier label and delivery rates here. Checkout uses these rates automatically based on the customer's district and optional exact-area rules. Settings are shared through Supabase for all customers.</p>
    <form class="admin-form" id="deliverySettingsForm">
      <label>Courier / delivery provider</label>
      <input name="courier" value="${String(deliverySettings.courier || "Other").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}" placeholder="Other">
      <label>Store / origin district</label>
      <input name="originDistrict" value="${String(deliverySettings.originDistrict || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}" placeholder="Rajshahi" required>
      <label>Store / origin area (optional)</label>
      <input name="originArea" value="${String(deliverySettings.originArea || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}" placeholder="Your area">
      <label>Same district / local (৳)</label>
      <input name="sameDistrict" type="number" min="0" step="1" value="${Number(deliverySettings.sameDistrict) || 0}" required>
      <label>Dhaka city (৳)</label>
      <input name="dhakaCity" type="number" min="0" step="1" value="${Number(deliverySettings.dhakaCity) || 0}" required>
      <label>Other districts (৳)</label>
      <input name="otherDistrict" type="number" min="0" step="1" value="${Number(deliverySettings.otherDistrict) || 0}" required>
      <div class="field full-field"><label>Optional area-specific rates (one per line: District | Area | Charge)</label>
      <textarea name="areaOverrides" rows="5" placeholder="Rajshahi | Boalia | 80&#10;Dhaka | Uttara | 70">${String(deliverySettings.areaOverrides || "").replace(/&/g,"&amp;").replace(/</g,"&lt;")}</textarea>
      <small>Example: Rajshahi | Boalia | 80. Exact district + area match takes priority over general rates.</small></div>
      <button class="btn orange" type="submit">Save delivery settings</button>
    </form>
    <p><b>How it calculates:</b> exact area rule → Dhaka city rate → same-district/local rate → other-district rate.</p>
  `;
  document.getElementById("deliverySettingsForm").onsubmit = event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const next = {
      courier: String(form.get("courier") || "Other").trim() || "Other",
      originDistrict: String(form.get("originDistrict") || "").trim(),
      originArea: String(form.get("originArea") || "").trim(),
      sameDistrict: Math.max(0, Number(form.get("sameDistrict")) || 0),
      dhakaCity: Math.max(0, Number(form.get("dhakaCity")) || 0),
      otherDistrict: Math.max(0, Number(form.get("otherDistrict")) || 0),
      areaOverrides: String(form.get("areaOverrides") || "").trim()
    };
    saveDeliverySettings(next).then(()=>showToast("Delivery settings saved ✓")).catch(error=>{console.error(error);showToast("Could not save settings. Check Supabase SQL/RLS.")});
  };
}async function deleteProduct(id){
  if (!confirm("Delete this product?")) return;
  const { error } = await supabaseClient.from("products").delete().eq("id", id);
  if (error) {
    console.error("Delete product error:", error);
    showToast("Could not delete product. Check Supabase permissions.");
    return;
  }
  showToast("Product deleted ✓");
  await renderAdmin();
}
async function setOrderStatus(id,status){try{await saveOrderStatus(id,status);await renderAdmin();showToast("Order status updated ✓")}catch(error){showToast("Could not update order status. Check permissions.")}}
console.log("Supabase loaded:", !!supabaseClient);
console.log("Supabase URL:", SUPABASE_URL);
console.log("ZENVIX Supabase connection ready");
getProducts();