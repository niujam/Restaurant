/**
 * ═══════════════════════════════════════════════════════════════
 *  ANIJE RESORT — script.js
 *  SPA Router · Firebase · i18n · Reservations · Admin
 * ═══════════════════════════════════════════════════════════════
 */

import { initializeApp }           from "firebase/app";
import { getFirestore, collection, addDoc, getDocs,
  doc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, setDoc, getDoc,
  serverTimestamp }         from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword,
  signOut, onAuthStateChanged } from "firebase/auth";

/* ═══════════════════════════════════════════════════════════════
   🔥 FIREBASE CONFIG — Replace with your project values
   ═══════════════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey:            "AIzaSyDUJYOvxexy5ZjZKPvRBvG92k66gAPWZM0",
  authDomain:        "anije-resort.firebaseapp.com",
  projectId:         "anije-resort",
  storageBucket:     "anije-resort.firebasestorage.app",
  messagingSenderId: "1053049598844",
  appId:             "1:1053049598844:web:2db59cbb2d877270432af9"
};

const fbApp = initializeApp(firebaseConfig);
const db    = getFirestore(fbApp);
const auth  = getAuth(fbApp);

/* ── Global APP object ── */
const APP = window.APP = {};

/* ═══════════════════════════════════════════════════════════════
   TRANSLATIONS (bilingual SQ / EN)
   ═══════════════════════════════════════════════════════════════ */
const i18n = {
  sq: {
    logoTagline:     "RESORT · RESTORANT",
    navHome:         "Kryefaqja",
    navMenu:         "Menu",
    navBook:         "Rezervime",
    navContact:      "Kontakt",
    loading:         "Duke ngarkuar...",
    footerCopy:      "© 2025 Të gjitha të drejtat e rezervuara",

    /* Home */
    heroEyebrow:     "⚓ Eksperiencë Luksore Detare",
    heroSub:         "Restoranti i Detit",
    heroDesc:        "Shijojini artet e kuzhinës sonë të rafinuar, ku tradita shqiptare takohet me luksozitetin modern nën dritën e yjeve dhe tingujt e valëve.",
    heroCtaBook:     "⚓ Rezervo Tani",
    heroCtaMenu:     "Shiko Menunë",
    feat1Title:      "Kuzhina",      feat1Desc: "Gatime tradicionale të rafinuara",
    feat2Title:      "Ambienti",     feat2Desc: "Pamje panoramike deti",
    feat3Title:      "Shërbimi",     feat3Desc: "Kujdes premium çdo ditë",

    /* Menu */
    menuEyebrow:     "Kuzhina Jonë",
    menuTitle:       "Menuja e Zgjedhur",
    catAll:          "Të Gjitha",
    catStarters:     "Antipasta",
    catMain:         "Pjata Kryesore",
    catSea:          "Frutete Deti",
    catDessert:      "Ëmbëlsira",
    catDrinks:       "Pije",
    preorderLabel:   "Parapagim i parapëlqyer:",
    preorderNote:    "(Jo fatura finale)",
    preorderItems:   "artikuj",
    preorderGo:      "Shto në Rezervim →",
    addToOrder:      "+ Zgjedh",
    soldOutText:     "I Shitur",

    /* Reservation */
    rezEyebrow:      "Rezervoni Tavolinën Tuaj",
    rezTitle:        "Bëni Rezervimin",
    rezInfo:         "Pas rezervimit do të merrni një <strong>ID unik</strong> dhe <strong>PIN 6-shifror</strong> sigurie me të cilin mund ta modifikoni rezervimin tuaj.",
    rezPersonal:     "Të Dhënat Personale",
    rezDetails:      "Detajet e Rezervimit",
    labelEmri:       "Emri *",
    labelMbiemri:    "Mbiemri *",
    labelEmail:      "Email *",
    labelTel:        "Telefon / WhatsApp *",
    labelData:       "Data *",
    labelOra:        "Ora *",
    labelPersona:    "Numri i Personave *",
    labelMesazh:     "Mesazh (opsional)",
    selectOra:       "— Zgjidhni orarin —",
    selectPersona:   "— Zgjidhni numrin —",
    rezPreorderTitle:"🛒 Parapagimi Juaj i Parapëlqyer",
    rezEstimated:    "Estimuar:",
    rezDisclaimer:   "⚠️ Kjo nuk është fatura finale. Nëse porosisni ne restorant fatura ndryshon.",
    rezSubmit:       "⚓ Konfirmo Rezervimin",
    modTitle:        "Modifiko Rezervimin",
    modDesc:         "Futni ID-në dhe PIN-in 6-shifror tuaj.",
    modIdLabel:      "ID Rezervimit",
    modPinLabel:     "PIN Sigurisë (6 shifra)",
    modLookup:       "🔍 Gjej Rezervimin",
    contactAddr:     "Bulevardet e Detit, Shqipëri",
    contactHours:    "12:00 – 23:00, çdo ditë",

    /* Thank-you */
    tyTitle:         "Faleminderit!",
    tySub:           "Rezervimi juaj u regjistrua me sukses.",
    tySendWhatsapp:  "Dërgoni në WhatsApp",
    tyViewBooking:   "Shikoni Rezervimin",
    tyBackHome:      "← Kryefaqja",

    /* Admin */
    adminLoginTitle: "Paneli Administrativ",
    adminLoginSub:   "Aksesi i kufizuar — vetëm për pronarin.",
    adminPass:       "Fjalëkalimi",
    adminLoginBtn:   "Hyr në Panel",
    adminDashTitle:  "Control Center — Anije Resort",
    adminLogout:     "🚪 Dil",
    adminTabBookings:"📋 Rezervimet",
    adminTabCms:     "🍽️ Menuja (CMS)",
    adminBookingsTitle:"Rezervimet në kohë reale",
    filterAll:       "Të gjitha",
    filterPending:   "Pritje",
    filterLocked:    "Bllokuar",
    adminCmsTitle:   "Menaxhimi i Menusë",
    cmsAddBtn:       "+ Shto Artikull",
    cmsModalTitle:   "Shto Artikull të Ri",
    cmsNameLabel:    "Emri i Gjellës *",
    cmsPriceLabel:   "Çmimi (€) *",
    cmsDescLabel:    "Përshkrimi",
    cmsCatLabel:     "Kategoria",
    cmsEmojiLabel:   "Emoji / Ikona",
    cmsImgLabel:     "URL e Imazhit (opsional)",
    cancel:          "Anulo",
    cmsSave:         "💾 Ruaj",
    thId:            "ID", thName:"Emri", thDate:"Data", thTime:"Ora",
    thGuests:"Persona", thPhone:"Telefon", thPreorder:"Para-porosi",
    thPin:"PIN", thStatus:"Statusi", thActions:"Veprime",
    confirmLock:     "Konfirmo & Blloko",
    deleteBk:        "Fshi",
    editItem:        "Ndrysho",
    deleteItem:      "Fshi",
    toggleSoldOut:   "I Shitur",
    toggleAvailable: "Disponueshëm",

    /* Toasts */
    toastSaved:      "✅ Rezervimi u ruajt me sukses!",
    toastLocked:     "🔒 Rezervimi u bllokua.",
    toastDeleted:    "🗑️ U fshi.",
    toastFbErr:      "⚠️ Firebase: konfigurojeni .firebaseConfig me të dhënat tuaja.",
    toastLoginErr:   "❌ Email ose fjalëkalim i gabuar.",
    toastPinErr:     "❌ PIN i gabuar.",
    toastNotFound:   "❌ Rezervimi nuk u gjet.",
    toastValidation: "❌ Plotësoni të gjitha fushat e detyrueshme.",
    toastItemSaved:  "✅ Artikulli u ruajt.",
    toastItemDeleted:"🗑️ Artikulli u fshi.",
  },

  en: {
    logoTagline:     "RESORT · RESTAURANT",
    navHome:         "Home",
    navMenu:         "Menu",
    navBook:         "Reservations",
    navContact:      "Contact",
    loading:         "Loading...",
    footerCopy:      "© 2025 All rights reserved",

    heroEyebrow:     "⚓ Luxury Nautical Experience",
    heroSub:         "Restaurant of the Sea",
    heroDesc:        "Savour the artistry of our refined cuisine, where Albanian tradition meets modern luxury under starlight and the sound of waves.",
    heroCtaBook:     "⚓ Book Now",
    heroCtaMenu:     "View Menu",
    feat1Title:      "Cuisine",      feat1Desc: "Traditional refined dishes",
    feat2Title:      "Ambiance",     feat2Desc: "Panoramic sea views",
    feat3Title:      "Service",      feat3Desc: "Premium care every day",

    menuEyebrow:     "Our Cuisine",
    menuTitle:       "Curated Menu",
    catAll:          "All",
    catStarters:     "Starters",
    catMain:         "Main Courses",
    catSea:          "Seafood",
    catDessert:      "Desserts",
    catDrinks:       "Drinks",
    preorderLabel:   "Preliminary estimate:",
    preorderNote:    "(Not the final bill)",
    preorderItems:   "items",
    preorderGo:      "Add to Reservation →",
    addToOrder:      "+ Select",
    soldOutText:     "Sold Out",

    rezEyebrow:      "Reserve Your Table",
    rezTitle:        "Make a Reservation",
    rezInfo:         "After booking you will receive a <strong>unique ID</strong> and a <strong>6-digit PIN</strong> with which you can modify your reservation.",
    rezPersonal:     "Personal Details",
    rezDetails:      "Reservation Details",
    labelEmri:       "First Name *",
    labelMbiemri:    "Last Name *",
    labelEmail:      "Email *",
    labelTel:        "Phone / WhatsApp *",
    labelData:       "Date *",
    labelOra:        "Time *",
    labelPersona:    "Number of Guests *",
    labelMesazh:     "Message (optional)",
    selectOra:       "— Select a time —",
    selectPersona:   "— Select a number —",
    rezPreorderTitle:"🛒 Your Pre-Order",
    rezEstimated:    "Estimated:",
    rezDisclaimer:   "⚠️ This is not the final bill. Prices may vary.",
    rezSubmit:       "⚓ Confirm Reservation",
    modTitle:        "Modify Reservation",
    modDesc:         "Enter your booking ID and 6-digit PIN.",
    modIdLabel:      "Booking ID",
    modPinLabel:     "Security PIN (6 digits)",
    modLookup:       "🔍 Find Booking",
    contactAddr:     "Sea Boulevard, Albania",
    contactHours:    "12:00 – 23:00, every day",

    tyTitle:         "Thank You!",
    tySub:           "Your reservation was successfully registered.",
    tySendWhatsapp:  "Send via WhatsApp",
    tyViewBooking:   "View Reservation",
    tyBackHome:      "← Back Home",

    adminLoginTitle: "Admin Dashboard",
    adminLoginSub:   "Restricted access — owner only.",
    adminPass:       "Password",
    adminLoginBtn:   "Log In",
    adminDashTitle:  "Control Center — Anije Resort",
    adminLogout:     "🚪 Sign Out",
    adminTabBookings:"📋 Bookings",
    adminTabCms:     "🍽️ Menu (CMS)",
    adminBookingsTitle:"Live Bookings",
    filterAll:       "All",
    filterPending:   "Pending",
    filterLocked:    "Locked",
    adminCmsTitle:   "Menu Management",
    cmsAddBtn:       "+ Add Item",
    cmsModalTitle:   "Add New Menu Item",
    cmsNameLabel:    "Dish Name *",
    cmsPriceLabel:   "Price (€) *",
    cmsDescLabel:    "Description",
    cmsCatLabel:     "Category",
    cmsEmojiLabel:   "Emoji / Icon",
    cmsImgLabel:     "Image URL (optional)",
    cancel:          "Cancel",
    cmsSave:         "💾 Save",
    thId:"ID", thName:"Name", thDate:"Date", thTime:"Time",
    thGuests:"Guests", thPhone:"Phone", thPreorder:"Pre-order",
    thPin:"PIN", thStatus:"Status", thActions:"Actions",
    confirmLock:     "Confirm & Lock",
    deleteBk:        "Delete",
    editItem:        "Edit",
    deleteItem:      "Delete",
    toggleSoldOut:   "Sold Out",
    toggleAvailable: "Available",

    toastSaved:      "✅ Reservation saved successfully!",
    toastLocked:     "🔒 Booking locked.",
    toastDeleted:    "🗑️ Deleted.",
    toastFbErr:      "⚠️ Firebase: set up your .firebaseConfig with your project values.",
    toastLoginErr:   "❌ Incorrect email or password.",
    toastPinErr:     "❌ Incorrect PIN.",
    toastNotFound:   "❌ Booking not found.",
    toastValidation: "❌ Please fill in all required fields.",
    toastItemSaved:  "✅ Item saved.",
    toastItemDeleted:"🗑️ Item deleted.",
  }
};

/* ═══════════════════════════════════════════════════════════════
   APP STATE
   ═══════════════════════════════════════════════════════════════ */
const STATE = {
  lang:          "sq",
  currentRoute:  "home",
  menuItems:     [],
  preOrder:      {},
  currentBooking:null,
  adminUser:     null,
  bookingsUnsub: null,
  _avail:        { brendaZene: false, jashteZene: false, specialMsg: "" },
};

/* ═══════════════════════════════════════════════════════════════
   i18n ENGINE
   ═══════════════════════════════════════════════════════════════ */
function t(key) {
  return i18n[STATE.lang][key] ?? i18n.sq[key] ?? key;
}

function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (!val) return;
    // Allow HTML in translation values (for <strong> etc)
    el.innerHTML = val;
  });
}

function setLang(lang) {
  STATE.lang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  applyTranslations();
}

/* ═══════════════════════════════════════════════════════════════
   ROUTER — loads HTML partials dynamically
   ═══════════════════════════════════════════════════════════════ */
const ROUTE_MAP = {
  home:     "home.html",
  menu:     "menu.html",
  rezervim: "rezervim.html",
  kontakt:  "kontakt.html",
  admin:    "admin.html",
};

const pageCache = {};

async function loadPage(route) {
  if (!ROUTE_MAP[route]) route = "home";

  // Show loader
  const root = document.getElementById("app-root");
  if (!pageCache[route]) {
    root.innerHTML = `<div class="page-loader" id="page-loader"><div class="loader-ship"><svg viewBox="0 0 60 60" fill="none"><line x1="30" y1="6" x2="30" y2="46" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"/><path d="M30 8 L48 38 L30 38 Z" fill="#C9A84C" opacity="0.9"/><path d="M30 16 L14 36 L30 36 Z" fill="#C9A84C" opacity="0.55"/><path d="M12 46 Q30 56 48 46 L44 42 Q30 50 16 42 Z" fill="#C9A84C"/><path d="M8 52 Q20 48 30 52 Q40 56 52 52" stroke="#C9A84C" stroke-width="1.5" fill="none" opacity="0.4" stroke-linecap="round"/></svg></div><div class="loader-text">${t("loading")}</div></div>`;
  }

  try {
    if (!pageCache[route]) {
      const res  = await fetch(ROUTE_MAP[route]);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      pageCache[route] = await res.text();
    }

    root.innerHTML = pageCache[route];
    applyTranslations(root);
    attachRouteLinks(root);

    // Route-specific init
    switch (route) {
      case "menu":     initMenuPage(); break;
      case "rezervim": initRezervimPage(); break;
      case "admin":    initAdminPage(); break;
    }

    // Scroll top
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    root.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:16px;color:var(--text-muted)"><div style="font-size:2rem">⚓</div><div>Page not found: ${route}</div></div>`;
    console.error("Router error:", err);
  }
}

function navigate(route) {
  if (STATE.currentRoute === route && document.getElementById("page-" + route)) return;
  STATE.currentRoute = route;

  // Update hash
  history.pushState({ route }, "", "#" + route);

  // Update nav active state
  document.querySelectorAll(".nav-link").forEach(a => {
    a.classList.toggle("active", a.dataset.route === route);
  });

  loadPage(route);
}

function attachRouteLinks(root) {
  root.querySelectorAll("[data-route]").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      navigate(el.dataset.route);
    });
  });
}

/* Hash-based routing */
function handleHashRoute() {
  const hash = location.hash.replace("#", "") || "home";
  const route = ROUTE_MAP[hash] ? hash : "home";
  STATE.currentRoute = route;
  document.querySelectorAll(".nav-link").forEach(a => {
    a.classList.toggle("active", a.dataset.route === route);
  });
  loadPage(route);
}

window.addEventListener("popstate", handleHashRoute);

/* ═══════════════════════════════════════════════════════════════
   MENU PAGE
   ═══════════════════════════════════════════════════════════════ */

// Fallback data when Firebase isn't configured yet
const DEFAULT_MENU = [
  { id:"m1", name:"Bruschetta Detare",    price:8,   category:"antipasta",  emoji:"🐚", desc:"Bukë e tostuar me karkaleca dhe domate të freskëta", soldOut:false },
  { id:"m2", name:"Sallatë ",        price:6,   category:"antipasta",  emoji:"🥗", desc:"Domate, kastravec, djathë i bardhë dhe ullinje", soldOut:false },
  { id:"m3", name:"Tavë Kosi",            price:14,  category:"kryesore",   emoji:"🍚", desc:"Qengji tradicional i pjekur me kos dhe vezë të freskëta", soldOut:false },
  { id:"m4", name:"Fërgësë",        price:12,  category:"kryesore",   emoji:"🫕", desc:"Gjellë tradicionale me mish, spec dhe domate", soldOut:false },
  { id:"m5", name:"Peshk i Pjekur",       price:18,  category:"deti",       emoji:"🐟", desc:"Peshku i liqenit të Ohrit, specialitet i rajonit", soldOut:false },
  { id:"m6", name:"Kalamari Skuqur",      price:14,  category:"deti",       emoji:"🦑", desc:"Kallamar i freskët me salcë limoni dhe barishte", soldOut:false },
  { id:"m7", name:"Midhje në Verë të Bardhë", price:16, category:"deti",   emoji:"🥟", desc:"Midhje të freskëta me vin të bardhë dhe hudër", soldOut:true },
  { id:"m8", name:"Bakllavaja Shtëpie",   price:5,   category:"embelsira",  emoji:"🥮", desc:"Bakllavë tradicionale me mjaltë dhe arra cilësie", soldOut:false },
  { id:"m9", name:"Trilece",              price:5,   category:"embelsira",  emoji:"🍮", desc:"Ëmbëlsirë e njomë me krem dhe karamel", soldOut:false },
  { id:"m10",name:"Raki Shtëpie",         price:3,   category:"pije",       emoji:"🥃", desc:"Raki tradicionale e distiluar nga rrushi", soldOut:false },
  { id:"m11",name:"Verë e Kuqe",          price:8,   category:"pije",       emoji:"🍷", desc:"Vera vendore cilësore, viti 2022", soldOut:false },
  { id:"m12",name:"Limonatë Natyrale",    price:4,   category:"pije",       emoji:"🍹", desc:"Limon i freskët, nenexhik dhe mjaltë", soldOut:false },
];

async function initMenuPage() {
  // Load from Firebase or fallback
  try {
    const snap = await getDocs(collection(db, "menu"));
    if (!snap.empty) {
      STATE.menuItems = [];
      snap.forEach(d => STATE.menuItems.push({ ...d.data(), docId: d.id }));
    } else {
      STATE.menuItems = DEFAULT_MENU;
    }
  } catch (err) {
    STATE.menuItems = DEFAULT_MENU;
    console.warn("Firebase menu fetch failed, using defaults:", err.message);
  }

  renderMenuGrid("all");
  updatePreorderBar();

  // Category filter tabs
  const filtersEl = document.getElementById("menu-filters");
  if (filtersEl) {
    filtersEl.addEventListener("click", e => {
      const btn = e.target.closest(".cat-tab");
      if (!btn) return;
      filtersEl.querySelectorAll(".cat-tab").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      renderMenuGrid(btn.dataset.cat);
    });
  }
}

function renderMenuGrid(cat) {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;

  const items = cat === "all" ? STATE.menuItems : STATE.menuItems.filter(i => i.category === cat);

  if (!items.length) {
    grid.innerHTML = `<div class="menu-loading" style="grid-column:1/-1"><span style="color:var(--text-muted);font-style:italic">— ${cat === "all" ? t("loading") : "No items in this category"} —</span></div>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const itemKey = item.docId || item.id; // unified key for both Firebase and default items
    const qty   = STATE.preOrder[itemKey] || 0;
    const price = parseFloat(item.price) || 0;

    const imgHtml = item.imageUrl
      ? `<img class="menu-card-img" src="${item.imageUrl}" alt="${item.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="menu-card-img-placeholder" style="display:none">${item.emoji || "🍽️"}</div>`
      : `<div class="menu-card-img-placeholder">${item.emoji || "🍽️"}</div>`;

    return `
      <article class="menu-card${item.soldOut ? " sold-out" : ""}" role="listitem">
        ${item.soldOut ? `<div class="sold-out-badge">${t("soldOutText")}</div>` : ""}
        ${imgHtml}
        <div class="menu-card-body">
          <h3 class="menu-card-name">${item.name}</h3>
          <p class="menu-card-desc">${item.desc || ""}</p>
          <div class="menu-card-footer">
            <span class="menu-card-price">${price}€</span>
            ${!item.soldOut ? `
              <div class="preorder-qty" data-item-id="${itemKey}">
                <button class="preorder-qty-btn" data-action="dec" aria-label="Remove one" ${qty === 0 ? "disabled" : ""}>−</button>
                <span class="preorder-qty-num">${qty}</span>
                <button class="preorder-qty-btn" data-action="inc" aria-label="Add one">+</button>
              </div>
            ` : ""}
          </div>
        </div>
      </article>
    `;
  }).join("");

  // Attach qty handlers
  grid.querySelectorAll(".preorder-qty").forEach(wrap => {
    wrap.querySelectorAll(".preorder-qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const itemId = wrap.dataset.itemId;
        const action = btn.dataset.action;
        const cur    = STATE.preOrder[itemId] || 0;
        if (action === "inc") STATE.preOrder[itemId] = cur + 1;
        if (action === "dec") STATE.preOrder[itemId] = Math.max(0, cur - 1);
        if (!STATE.preOrder[itemId]) delete STATE.preOrder[itemId];
        renderMenuGrid(document.querySelector(".cat-tab.active")?.dataset.cat || "all");
        updatePreorderBar();
        updateRezFormPreorder();
      });
    });
  });
}

function calcPreorderTotal() {
  let total = 0;
  let count = 0;
  for (const [key, qty] of Object.entries(STATE.preOrder)) {
    const item = STATE.menuItems.find(m => (m.docId || m.id) === key);
    if (item) { total += (parseFloat(item.price) || 0) * qty; count += qty; }
  }
  return { total, count };
}

function updatePreorderBar() {
  const bar   = document.getElementById("preorder-bar");
  const totEl = document.getElementById("preorder-total");
  const cntEl = document.getElementById("preorder-count");
  if (!bar) return;
  const { total, count } = calcPreorderTotal();
  if (count > 0) {
    bar.hidden = false;
    if (totEl) totEl.textContent = total + "€";
    if (cntEl) cntEl.textContent = count;
  } else {
    bar.hidden = true;
  }
}

/* ═══════════════════════════════════════════════════════════════
   RESERVATION PAGE
   ═══════════════════════════════════════════════════════════════ */
function initRezervimPage() {
  // Set min date = today
  const dataInput = document.getElementById("f-data");
  if (dataInput) dataInput.min = new Date().toISOString().split("T")[0];

  // Init clock picker
  initClockPicker();

  // Show pre-order summary if any
  updateRezFormPreorder();

  // Load availability notice for clients
  loadAvailNotice();

  // Form submit
  const form = document.getElementById("rez-form");
  if (form) form.addEventListener("submit", e => { e.preventDefault(); submitReservation(); });

  // Table join toggle
  const tableJoin = document.getElementById("f-table-join");
  if (tableJoin) {
    tableJoin.addEventListener("change", function() {
      const note  = document.getElementById("table-join-note");
      const label = document.getElementById("table-join-label");
      if (this.checked) {
        if (note)  note.style.display  = "block";
        if (label) label.textContent   = "Po";
      } else {
        if (note)  note.style.display  = "none";
        if (label) label.textContent   = "Jo";
      }
    });
  }
}

/* ── HANDLE 6+ GUESTS ── */
APP.handlePersonaChange = function(val) {
  const group = document.getElementById("custom-guests-group");
  const input = document.getElementById("f-persona-custom");
  if (!group) return;
  if (val === "6+") {
    group.style.display = "block";
    if (input) { input.required = true; input.focus(); }
  } else {
    group.style.display = "none";
    if (input) { input.required = false; input.value = ""; }
  }
};

/* ── CLOCK PICKER ── */
/* ═══════════════════════════════════════════════════════════════
   RADIAL CLOCK PICKER
   ═══════════════════════════════════════════════════════════════ */
const RCLOCK_HOURS   = [12,13,14,15,16,17,18,19,20,21,22,23];
const RCLOCK_MINUTES = [0, 15, 30, 45];
const RSTATE = { mode:"hour", selectedHour:null, selectedMin:null, blockedHours:[] };

function initClockPicker() {
  if (STATE._avail && STATE._avail.blockedHours) {
    RSTATE.blockedHours = STATE._avail.blockedHours || [];
  }
}

APP.openRadialClock = function() {
  const overlay = document.getElementById("rclock-overlay");
  if (!overlay) return;
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
  APP.rclockSetMode("hour");
};

APP.closeRadialClock = function(e) {
  if (e && e.target && e.target.id !== "rclock-overlay") return;
  const overlay = document.getElementById("rclock-overlay");
  if (overlay) overlay.style.display = "none";
  document.body.style.overflow = "";
};

APP.rclockSetMode = function(mode) {
  RSTATE.mode = mode;
  document.getElementById("rclock-btn-hour")?.classList.toggle("active", mode === "hour");
  document.getElementById("rclock-btn-min")?.classList.toggle("active", mode === "min");
  document.getElementById("rclock-disp-hour")?.classList.toggle("rclock-active-seg", mode === "hour");
  document.getElementById("rclock-disp-min")?.classList.toggle("rclock-active-seg", mode === "min");
  buildRadialFace(mode);
  updateHandFromState();
};

function buildRadialFace(mode) {
  const g = document.getElementById("rclock-numbers");
  if (!g) return;
  const cx = 140, cy = 140, r = 112;
  const items = mode === "hour" ? RCLOCK_HOURS : RCLOCK_MINUTES;
  const total = mode === "hour" ? 12 : 4;
  g.innerHTML = "";
  items.forEach((val, i) => {
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    const label = mode === "hour" ? String(val) : (val === 0 ? "00" : String(val));
    const isBlocked = mode === "hour" && RSTATE.blockedHours.some(bh => parseInt(bh) === val);
    const isSelected = mode === "hour" ? RSTATE.selectedHour === val : RSTATE.selectedMin === val;
    if (isSelected) {
      const sel = document.createElementNS("http://www.w3.org/2000/svg","circle");
      sel.setAttribute("cx",x); sel.setAttribute("cy",y); sel.setAttribute("r","20");
      sel.setAttribute("fill","rgba(201,168,76,0.25)");
      sel.setAttribute("stroke","#C9A84C"); sel.setAttribute("stroke-width","1.5");
      g.appendChild(sel);
    }
    const txt = document.createElementNS("http://www.w3.org/2000/svg","text");
    txt.setAttribute("x",x); txt.setAttribute("y",y);
    txt.setAttribute("text-anchor","middle"); txt.setAttribute("dominant-baseline","central");
    txt.setAttribute("font-size","13"); txt.setAttribute("font-family","Lato, sans-serif");
    txt.setAttribute("font-weight","300"); txt.setAttribute("pointer-events","none");
    txt.setAttribute("fill", isBlocked ? "rgba(201,168,76,0.2)" : isSelected ? "#F0D080" : "rgba(201,168,76,0.75)");
    txt.textContent = label;
    g.appendChild(txt);
    if (isBlocked) {
      const ln = document.createElementNS("http://www.w3.org/2000/svg","line");
      ln.setAttribute("x1",x-8); ln.setAttribute("y1",y); ln.setAttribute("x2",x+8); ln.setAttribute("y2",y);
      ln.setAttribute("stroke","rgba(200,50,50,0.55)"); ln.setAttribute("stroke-width","1.5");
      ln.setAttribute("pointer-events","none"); g.appendChild(ln);
    }
    const hit = document.createElementNS("http://www.w3.org/2000/svg","circle");
    hit.setAttribute("cx",x); hit.setAttribute("cy",y); hit.setAttribute("r","22");
    hit.setAttribute("fill","transparent");
    hit.style.cursor = isBlocked ? "not-allowed" : "pointer";
    if (!isBlocked) hit.addEventListener("click", () => rclockSelect(val));
    g.appendChild(hit);
  });
}

function rclockSelect(val) {
  if (RSTATE.mode === "hour") {
    RSTATE.selectedHour = val;
    const el = document.getElementById("rclock-disp-hour");
    if (el) el.textContent = String(val).padStart(2,"0");
    const hint = document.getElementById("rclock-hint");
    if (hint) hint.textContent = "Tani zgjidhni minutat";
    updateHandPosition(val, "hour");
    setTimeout(() => APP.rclockSetMode("min"), 320);
  } else {
    RSTATE.selectedMin = val;
    const el = document.getElementById("rclock-disp-min");
    if (el) el.textContent = String(val).padStart(2,"0");
    const hint = document.getElementById("rclock-hint");
    if (hint) hint.textContent = "✔ Ora u zgjodh — klikoni Konfirmo";
    updateHandPosition(val, "min");
    buildRadialFace("min");
    const btn = document.getElementById("rclock-confirm-btn");
    if (btn && RSTATE.selectedHour !== null) btn.disabled = false;
  }
}

function updateHandPosition(val, mode) {
  const hand = document.getElementById("rclock-hand");
  const tip  = document.getElementById("rclock-hand-tip");
  if (!hand || !tip) return;
  const items = mode === "hour" ? RCLOCK_HOURS : RCLOCK_MINUTES;
  const idx   = items.indexOf(val);
  const angle = (idx / items.length) * 360 - 90;
  hand.style.transform = "rotate(" + (angle + 90) + "deg)";
  tip.style.transform  = "rotate(" + (angle + 90) + "deg)";
}

function updateHandFromState() {
  if (RSTATE.mode === "hour" && RSTATE.selectedHour !== null) {
    updateHandPosition(RSTATE.selectedHour, "hour");
  } else if (RSTATE.mode === "min" && RSTATE.selectedMin !== null) {
    updateHandPosition(RSTATE.selectedMin, "min");
  } else {
    const hand = document.getElementById("rclock-hand");
    const tip  = document.getElementById("rclock-hand-tip");
    if (hand) hand.style.transform = "rotate(0deg)";
    if (tip)  tip.style.transform  = "rotate(0deg)";
  }
}

APP.confirmRadialClock = function() {
  if (RSTATE.selectedHour === null || RSTATE.selectedMin === null) return;
  const timeStr = String(RSTATE.selectedHour).padStart(2,"0") + ":" + String(RSTATE.selectedMin).padStart(2,"0");
  const inp = document.getElementById("f-ora");
  if (inp) inp.value = timeStr;
  const txt = document.getElementById("rclock-trigger-text");
  if (txt) txt.textContent = timeStr;
  const trg = document.getElementById("rclock-trigger");
  if (trg) trg.classList.add("has-value");
  const overlay = document.getElementById("rclock-overlay");
  if (overlay) overlay.style.display = "none";
  document.body.style.overflow = "";
};

APP.toggleClockPicker = function() { APP.openRadialClock(); };

function applyBlockedHoursToClockPicker(blockedHours) {
  RSTATE.blockedHours = blockedHours || [];
}

/* ── LOAD AVAILABILITY NOTICE ── */
async function loadAvailNotice() {
  try {
    const snap = await getDoc(doc(db, "settings", "availability"));
    if (!snap.exists()) return;
    const data = snap.data();
    renderAvailNotice(data);
  } catch(e) {
    // silently ignore if no data
  }
}

function renderAvailNotice(data) {
  const wrapper = document.getElementById("avail-notice-client");
  const inner   = document.getElementById("avail-notice-client-inner");

  // Apply blocked hours to clock picker
  if (data.blockedHours) {
    STATE._avail.blockedHours = data.blockedHours;
    applyBlockedHoursToClockPicker(data.blockedHours);
  }

  if (!wrapper || !inner) return;

  const brendaZene  = data.brendaZene  === true;
  const jashteZene  = data.jashteZene  === true;
  const specialMsg  = data.specialMsg  || "";

  if (!brendaZene && !jashteZene && !specialMsg) { wrapper.style.display = "none"; return; }

  let html = `<div class="avail-notice-client-rows">`;
  html += `<div class="avail-row">
    <span class="avail-dot ${brendaZene ? 'avail-dot-red' : 'avail-dot-green'}"></span>
    <span>🏠 Tavolina brenda: <strong>${brendaZene ? 'Të zëna' : 'Të lira'}</strong></span>
  </div>`;
  html += `<div class="avail-row">
    <span class="avail-dot ${jashteZene ? 'avail-dot-red' : 'avail-dot-green'}"></span>
    <span>🌅 Tavolina jashtë: <strong>${jashteZene ? 'Të zëna' : 'Të lira'}</strong></span>
  </div>`;
  if (specialMsg) {
    html += `<div class="avail-row avail-row-msg">📢 ${specialMsg}</div>`;
  }
  html += `</div>`;

  inner.innerHTML = html;
  wrapper.style.display = "block";
}

function updateRezFormPreorder() {
  const wrap = document.getElementById("rez-preorder-summary");
  const listEl = document.getElementById("rez-preorder-items");
  const totEl  = document.getElementById("rez-preorder-total-val");
  if (!wrap || !listEl || !totEl) return;

  const { total, count } = calcPreorderTotal();
  if (count === 0) { wrap.hidden = true; return; }

  wrap.hidden = false;
  listEl.innerHTML = Object.entries(STATE.preOrder).map(([key, qty]) => {
    const item = STATE.menuItems.find(m => (m.docId || m.id) === key);
    if (!item) return "";
    const lineTotal = (parseFloat(item.price) || 0) * qty;
    return `<div class="preorder-summary-item"><span>${item.emoji || ""} ${item.name} ×${qty}</span><span>${lineTotal}€</span></div>`;
  }).join("");
  totEl.textContent = total + "€";
}

/* Navigate from menu to reservation (pre-order go btn) */
APP.goToReservation = () => navigate("rezervim");

/* ── SUBMIT RESERVATION ── */
async function submitReservation() {
  // Collect values
  const fields = {
    emri:    document.getElementById("f-emri"),
    mbiemri: document.getElementById("f-mbiemri"),
    tel:     document.getElementById("f-tel"),
    data:    document.getElementById("f-data"),
    ora:     document.getElementById("f-ora"),
    persona: document.getElementById("f-persona"),
    vendi:   document.getElementById("f-vendi"),
    mesazh:  document.getElementById("f-mesazh"),
  };

  // Handle 6+ guests
  let guestsValue = fields.persona?.value || "";
  if (guestsValue === "6+") {
    const custom = document.getElementById("f-persona-custom");
    if (!custom || !custom.value) {
      showToast("❌ Specifikoni numrin e personave.", "error");
      return;
    }
    guestsValue = custom.value + " persona";
  }

  // Table join
  const tableJoin = document.getElementById("f-table-join")?.checked ? true : false;

  // Validate
  let valid = true;
  const required = ["emri","mbiemri","tel","data","ora","persona","vendi"];
  required.forEach(k => {
    const el = fields[k];
    if (!el) return;
    const empty = !el.value.trim();
    el.classList.toggle("error", empty);
    if (empty) valid = false;
  });
  if (!valid) { showToast(t("toastValidation"), "error"); return; }

  // Disable submit
  const submitBtn  = document.getElementById("rez-submit-btn");
  const btnText    = submitBtn?.querySelector(".btn-text");
  const btnSpinner = submitBtn?.querySelector(".btn-spinner");
  if (submitBtn)  submitBtn.disabled = true;
  if (btnText)    btnText.hidden = true;
  if (btnSpinner) btnSpinner.hidden = false;

  const uid = generateUID();
  const pin = generatePIN();

  // Build pre-order snapshot
  const preOrderSnap = Object.entries(STATE.preOrder).map(([key, qty]) => {
    const item = STATE.menuItems.find(m => (m.docId || m.id) === key);
    return item ? { id: key, name: item.name, price: item.price, qty } : null;
  }).filter(Boolean);
  const { total } = calcPreorderTotal();

  const booking = {
    uid, pin,
    emri:      fields.emri.value.trim(),
    mbiemri:   fields.mbiemri.value.trim(),
    tel:       fields.tel.value.trim(),
    data:      fields.data.value,
    ora:       fields.ora.value,
    persona:   guestsValue,
    vendi:     fields.vendi?.value || "",
    tableJoin: tableJoin,
    mesazh:    fields.mesazh?.value.trim() || "",
    preOrder:  preOrderSnap,
    preTotal:  total,
    locked:    false,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "bookings"), booking);
  } catch (err) {
    console.warn("Firebase save failed (check config):", err.message);
    showToast(t("toastFbErr"), "warn", 6000);
  }

  STATE.currentBooking = { ...booking };
  STATE.preOrder = {}; // reset

  // Re-enable
  if (submitBtn)  submitBtn.disabled = false;
  if (btnText)    btnText.hidden = false;
  if (btnSpinner) btnSpinner.hidden = true;

  // Reset form
  document.getElementById("rez-form")?.reset();
  if (document.getElementById("f-data"))
    document.getElementById("f-data").min = new Date().toISOString().split("T")[0];
  // Reset clock display
  RSTATE.selectedHour = null; RSTATE.selectedMin = null; RSTATE.mode = "hour";
  const txt = document.getElementById("rclock-trigger-text");
  if (txt) txt.textContent = "— Zgjidhni orën —";
  const trg = document.getElementById("rclock-trigger");
  if (trg) trg.classList.remove("has-value");
  const cb = document.getElementById("rclock-confirm-btn");
  if (cb) cb.disabled = true;
  // Reset 6+ guests box
  const customGroup = document.getElementById("custom-guests-group");
  if (customGroup) customGroup.style.display = "none";

  showThankyouOverlay(STATE.currentBooking);
}

/* ── LOOKUP / MODIFY ── */
APP.lookupBooking = async function () {
  const idEl  = document.getElementById("mod-id");
  const pinEl = document.getElementById("mod-pin");
  const resultEl = document.getElementById("mod-result");
  if (!idEl || !pinEl || !resultEl) return;

  const uid = idEl.value.trim().toUpperCase();
  const pin = pinEl.value.trim();
  if (!uid || !pin) { showToast(t("toastValidation"), "error"); return; }

  const btn = document.getElementById("mod-lookup-btn");
  if (btn) btn.disabled = true;

  try {
    const snap = await getDocs(collection(db, "bookings"));
    let found  = null;
    snap.forEach(d => {
      const data = d.data();
      if (data.uid === uid) found = { ...data, docId: d.id };
    });

    if (!found) { showToast(t("toastNotFound"), "error"); if (btn) btn.disabled = false; return; }
    if (found.pin !== pin) { showToast(t("toastPinErr"), "error"); if (btn) btn.disabled = false; return; }

    renderModifyPanel(found, resultEl);
  } catch (err) {
    showToast(t("toastFbErr"), "warn", 6000);
    console.warn(err);
  }
  if (btn) btn.disabled = false;
};

function renderModifyPanel(b, container) {
  const isLocked = b.locked;
  const statusBadge = isLocked
    ? `<span class="status-badge status-locked">🔒 ${t("filterLocked")}</span>`
    : `<span class="status-badge status-pending">⏳ ${t("filterPending")}</span>`;

  let editForm = "";
  if (!isLocked) {
    editForm = `
      <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border)">
        <div class="form-group">
          <label class="form-label">${t("labelData")}</label>
          <input type="date" id="mod-new-date" class="form-control" value="${b.data}" min="${new Date().toISOString().split("T")[0]}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t("labelOra")}</label>
          <select id="mod-new-time" class="form-control">
            ${["12:00","12:30","13:00","13:30","14:00","19:00","19:30","20:00","20:30","21:00","21:30","22:00"]
              .map(t2 => `<option ${t2 === b.ora ? "selected" : ""}>${t2}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${t("labelPersona")}</label>
          <select id="mod-new-guests" class="form-control">
            ${["1","2","3","4","5","6+"].map(n => `<option ${n === b.persona ? "selected" : ""}>${n}</option>`).join("")}
          </select>
        </div>
        <button class="btn btn-primary btn-full" onclick="APP.saveModification('${b.docId}')">💾 ${t("cmsSave")}</button>
      </div>
    `;
  }

  container.hidden = false;
  container.innerHTML = `
    <div style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
      <strong style="color:var(--gold);font-family:var(--font-display);font-size:0.9rem">${b.uid}</strong>
      ${statusBadge}
    </div>
    <div class="booking-detail-row"><span class="booking-detail-key">${t("thName")}</span><span class="booking-detail-val">${b.emri} ${b.mbiemri}</span></div>
    <div class="booking-detail-row"><span class="booking-detail-key">${t("thDate")}</span><span class="booking-detail-val">${formatDate(b.data)}</span></div>
    <div class="booking-detail-row"><span class="booking-detail-key">${t("thTime")}</span><span class="booking-detail-val">${b.ora}</span></div>
    <div class="booking-detail-row"><span class="booking-detail-key">${t("thGuests")}</span><span class="booking-detail-val">${b.persona}</span></div>
    ${b.preTotal > 0 ? `<div class="booking-detail-row"><span class="booking-detail-key">${t("thPreorder")}</span><span class="booking-detail-val highlight">${b.preTotal}€</span></div>` : ""}
    ${editForm}
  `;
}

APP.saveModification = async function (docId) {
  const newDate   = document.getElementById("mod-new-date")?.value;
  const newTime   = document.getElementById("mod-new-time")?.value;
  const newGuests = document.getElementById("mod-new-guests")?.value;
  if (!newDate || !newTime) { showToast(t("toastValidation"), "error"); return; }

  try {
    await updateDoc(doc(db, "bookings", docId), { data: newDate, ora: newTime, persona: newGuests });
    showToast("✅ " + (STATE.lang === "sq" ? "Rezervimi u modifikua!" : "Booking updated!"), "success");
  } catch (err) {
    showToast(t("toastFbErr"), "warn", 6000);
    console.warn(err);
  }
};

/* ═══════════════════════════════════════════════════════════════
   THANK-YOU OVERLAY
   ═══════════════════════════════════════════════════════════════ */
function showThankyouOverlay(b) {
  const overlay = document.getElementById("thankyou-overlay");
  const card    = document.getElementById("ty-card");
  const waBtn   = document.getElementById("ty-whatsapp");
  if (!overlay) return;

  // Build booking card
  if (card) {
    const preRow = b.preTotal > 0
      ? `<div class="booking-detail-row"><span class="booking-detail-key">${t("thPreorder")}</span><span class="booking-detail-val highlight">${b.preTotal}€</span></div>`
      : "";
    card.innerHTML = `
      <div class="booking-detail-row"><span class="booking-detail-key">${t("thId")}</span><span class="booking-detail-val highlight">${b.uid}</span></div>
      <div class="booking-detail-row"><span class="booking-detail-key">${t("thName")}</span><span class="booking-detail-val">${b.emri} ${b.mbiemri}</span></div>
      <div class="booking-detail-row"><span class="booking-detail-key">${t("thDate")}</span><span class="booking-detail-val">${formatDate(b.data)}</span></div>
      <div class="booking-detail-row"><span class="booking-detail-key">${t("thTime")}</span><span class="booking-detail-val">${b.ora}</span></div>
      <div class="booking-detail-row"><span class="booking-detail-key">${t("thGuests")}</span><span class="booking-detail-val">${b.persona}</span></div>
      ${preRow}
      <div class="booking-detail-row"><span class="booking-detail-key">🔢 PIN</span><span class="booking-detail-val highlight" style="font-size:1.3rem;letter-spacing:0.2em">${b.pin}</span></div>
    `;
  }

  // WhatsApp link
  const domain = location.origin + location.pathname;
  const link   = `${domain}?res=${b.uid}`;
  const preMsg = b.preTotal > 0 ? `\n🛒 Para-porosi: ${b.preTotal}€ (jo fatura finale)` : "";
  const msg = encodeURIComponent(
`⚓ *Rezervimi Juaj te Anije Resort*

👤 Emri: ${b.emri} ${b.mbiemri}
📅 Data: ${formatDate(b.data)}
⏰ Ora: ${b.ora}
👥 Persona: ${b.persona}${preMsg}

🔢 Kodi i Sigurisë (PIN): *${b.pin}*

🔗 Për ta parë ose modifikuar rezervimin tuaj:
${link}

Faleminderit! 🌊 Anije Resort`
  );

  if (waBtn) {
    const phone = b.tel.replace(/\D/g, "");
    waBtn.href = `https://wa.me/${phone}?text=${msg}`;
  }

  // Apply i18n to overlay
  applyTranslations(overlay);

  // Spawn particles
  spawnTyParticles();
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

APP.closeThankyou = function () {
  const overlay = document.getElementById("thankyou-overlay");
  if (overlay) overlay.hidden = true;
  document.body.style.overflow = "";
  navigate("home");
};

APP.viewMyBooking = function () {
  const overlay = document.getElementById("thankyou-overlay");
  if (overlay) overlay.hidden = true;
  document.body.style.overflow = "";
  navigate("rezervim");
  // Pre-fill modify form
  setTimeout(() => {
    const b = STATE.currentBooking;
    if (!b) return;
    const idEl  = document.getElementById("mod-id");
    const pinEl = document.getElementById("mod-pin");
    if (idEl)  idEl.value  = b.uid;
    if (pinEl) pinEl.value = b.pin;
  }, 400);
};

function spawnTyParticles() {
  const container = document.getElementById("ty-particles");
  if (!container) return;
  container.innerHTML = "";
  const colours = ["var(--gold)", "var(--amber)", "var(--gold-light)"];
  for (let i = 0; i < 35; i++) {
    const p = document.createElement("div");
    p.className = "ty-particle";
    const size  = 2 + Math.random() * 5;
    const ex    = (Math.random() - 0.5) * 200;
    const d     = 2 + Math.random() * 3;
    const del   = Math.random() * 5;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: 0;
      width: ${size}px; height: ${size}px;
      background: ${colours[Math.floor(Math.random() * colours.length)]};
      --ex: ${ex}px; --d: ${d}s; --del: ${del}s;
    `;
    container.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PAGE
   ═══════════════════════════════════════════════════════════════ */
function initAdminPage() {
  // Check if already logged in
  onAuthStateChanged(auth, user => {
    if (user) {
      STATE.adminUser = user;
      showAdminDashboard(user);
    }
  });

  // Enter key on password field
  document.getElementById("adm-pass")?.addEventListener("keydown", e => {
    if (e.key === "Enter") APP.adminLogin();
  });

  // Admin tab switching
  document.querySelectorAll("[data-adm-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-adm-tab]").forEach(b => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      const panelIds = { bookings: "adm-panel-bookings", cms: "adm-panel-cms", settings: "adm-panel-settings" };
      document.querySelectorAll(".admin-tab-panel").forEach(p => {
        const active = p.id === panelIds[btn.dataset.admTab];
        p.classList.toggle("active", active);
        p.hidden = !active;
        if (active) p.style.display = "block";
        else p.style.display = "none";
      });
      // Load availability settings when settings tab opened
      if (btn.dataset.admTab === "settings") {
        setTimeout(() => {
          APP._loadAvailSettings();
          APP._renderBlockedHoursGrid();
        }, 100);
      }
    });
  });
}

APP.adminLogin = async function () {
  const email = document.getElementById("adm-email")?.value;
  const pass  = document.getElementById("adm-pass")?.value;
  const errEl = document.getElementById("adm-login-err");

  if (errEl) errEl.hidden = true;
  const btn = document.getElementById("adm-login-btn");
  if (btn) btn.disabled = true;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    STATE.adminUser = cred.user;
    showAdminDashboard(cred.user);
  } catch (err) {
    if (errEl) { errEl.textContent = t("toastLoginErr"); errEl.hidden = false; }
    console.warn("Auth error:", err.code);
  }
  if (btn) btn.disabled = false;
};

APP.adminLogout = async function () {
  await signOut(auth).catch(() => {});
  STATE.adminUser = null;
  if (STATE.bookingsUnsub) { STATE.bookingsUnsub(); STATE.bookingsUnsub = null; }
  delete pageCache.admin; // Force re-render
  navigate("home");
};

function showAdminDashboard(user) {
  const loginWall  = document.getElementById("admin-login-wall");
  const dashboard  = document.getElementById("admin-dashboard");
  const emailLabel = document.getElementById("adm-user-email");
  if (!loginWall || !dashboard) return;

  loginWall.style.display  = "none";
  dashboard.hidden = false;
  if (emailLabel) emailLabel.textContent = user.email;

  loadAdminBookings();
  loadAdminMenu();
}

/* ── BOOKINGS (real-time) ── */
function loadAdminBookings() {
  if (STATE.bookingsUnsub) STATE.bookingsUnsub();
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  STATE.bookingsUnsub = onSnapshot(q, snap => {
    const bookings = [];
    snap.forEach(d => bookings.push({ ...d.data(), docId: d.id }));
    renderAdminBookings(bookings);
  }, err => {
    console.warn("Snapshot error:", err.code, err.message);
    // Fallback: try without orderBy (index might be missing)
    getDocs(collection(db, "bookings")).then(snap => {
      const bookings = [];
      snap.forEach(d => bookings.push({ ...d.data(), docId: d.id }));
      bookings.sort((a, b) => {
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return tb - ta;
      });
      renderAdminBookings(bookings);
    }).catch(e => {
      console.error("Fallback also failed:", e);
      showToast(t("toastFbErr"), "warn", 6000);
    });
  });

  // Booking filter tabs
  document.querySelectorAll("[data-adm-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-adm-filter]").forEach(b => b.classList.toggle("active", b === btn));
      const filter = btn.dataset.admFilter;
      if (STATE._lastBookings) renderAdminBookings(STATE._lastBookings, filter);
    });
  });
}
function renderAdminBookings(bookings, filter = "all") {
  STATE._lastBookings = bookings;
  const tbody = document.getElementById("adm-bookings-body");
  if (!tbody) return;

  let list = bookings;
  if (filter === "pending") list = bookings.filter(b => !b.locked);
  if (filter === "locked")  list = bookings.filter(b => b.locked);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted)">— ${STATE.lang === "sq" ? "Asnjë rezervim" : "No bookings"} —</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(b => {
    const preStr   = b.preTotal > 0 ? `${b.preTotal}€` : "—";
    const statusBadge = b.locked
      ? `<span class="status-badge status-locked">🔒 ${t("filterLocked")}</span>`
      : `<span class="status-badge status-pending">⏳ ${t("filterPending")}</span>`;

    return `
      <tr>
        <td><span style="font-family:var(--font-display);color:var(--gold);font-size:0.78rem">${b.uid}</span></td>
        <td>${b.emri} ${b.mbiemri}</td>
        <td>${formatDate(b.data)}</td>
        <td>${b.ora}</td>
        <td>${b.persona}</td>
        <td><a href="tel:${b.tel}" style="color:var(--cream-dim)">${b.tel}</a></td>
        <td>${preStr}</td>
        <td><span style="font-family:monospace;color:var(--amber);letter-spacing:.12em">${b.pin}</span></td>
        <td>${statusBadge}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm" style="background:#25D366; color:white; border:none;" 
                    onclick="APP.sendWhatsApp('${b.tel}', '${b.emri}', '${b.uid}', '${b.pin}')">
              WA
            </button>
            ${!b.locked ? `<button class="btn btn-sm btn-success" onclick="APP.lockBooking('${b.docId}')">${t("confirmLock")}</button>` : ""}
            <button class="btn btn-sm btn-danger" onclick="APP.deleteBooking('${b.docId}')">${t("deleteBk")}</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}




APP.lockBooking = async function (docId) {
  try {
    await updateDoc(doc(db, "bookings", docId), { locked: true });
    showToast(t("toastLocked"), "success");
  } catch (err) { showToast(t("toastFbErr"), "warn"); console.warn(err); }
};

APP.deleteBooking = async function (docId) {
  if (!confirm(STATE.lang === "sq" ? "Fshi rezervimin?" : "Delete this booking?")) return;
  try {
    await deleteDoc(doc(db, "bookings", docId));
    showToast(t("toastDeleted"), "success");
  } catch (err) { showToast(t("toastFbErr"), "warn"); console.warn(err); }
};

/* ── CMS (Menu management) ── */
async function loadAdminMenu() {
  try {
    const snap = await getDocs(collection(db, "menu"));
    if (!snap.empty) {
      STATE.menuItems = [];
      snap.forEach(d => STATE.menuItems.push({ ...d.data(), docId: d.id }));
    } else {
      STATE.menuItems = DEFAULT_MENU;
    }
  } catch (err) {
    STATE.menuItems = DEFAULT_MENU;
  }
  renderCmsGrid();
}

function renderCmsGrid() {
  const grid = document.getElementById("adm-cms-grid");
  if (!grid) return;

  if (!STATE.menuItems.length) {
    grid.innerHTML = `<div class="cms-loading"><span style="color:var(--text-muted)">${STATE.lang === "sq" ? "Asnjë artikull" : "No items"}</span></div>`;
    return;
  }

  grid.innerHTML = STATE.menuItems.map((item, idx) => `
    <div class="cms-card">
      <div class="cms-card-emoji">${item.emoji || "🍽️"}</div>
      <div class="cms-card-name">${item.name}</div>
      <div class="cms-card-meta">
        <span class="cms-card-price">${item.price}€</span>
        <span>${item.category}</span>
        ${item.soldOut ? `<span style="color:#ff9090">● ${t("soldOutText")}</span>` : ""}
      </div>
      ${item.desc ? `<div style="font-size:0.76rem;color:var(--text-muted);line-height:1.5">${item.desc}</div>` : ""}
      <div class="cms-card-actions">
        <button class="btn btn-sm btn-ghost" onclick="APP.editCmsItem(${idx})">${t("editItem")}</button>
        <button class="btn btn-sm ${item.soldOut ? "btn-success" : "btn-warn"}" onclick="APP.toggleSoldOut(${idx})">
          ${item.soldOut ? t("toggleAvailable") : t("toggleSoldOut")}
        </button>
        <button class="btn btn-sm btn-danger" onclick="APP.deleteCmsItem('${item.docId || item.id}', ${idx})">${t("deleteItem")}</button>
      </div>
    </div>
  `).join("");
}

APP.showAddItemModal = function () {
  const modal = document.getElementById("cms-modal");
  if (!modal) return;
  document.getElementById("cms-modal-title").textContent = t("cmsModalTitle");
  document.getElementById("cms-id").value    = "";
  document.getElementById("cms-title").value = "";
  document.getElementById("cms-price").value = "";
  document.getElementById("cms-desc").value  = "";
  document.getElementById("cms-emoji").value = "";
  document.getElementById("cms-img").value   = "";
  // Reset image upload preview
  const placeholder = document.getElementById("cms-upload-placeholder");
  const preview     = document.getElementById("cms-upload-preview");
  const removeWrap  = document.getElementById("cms-remove-photo-wrap");
  if (placeholder) placeholder.style.display = "";
  if (preview)     preview.style.display     = "none";
  if (removeWrap)  removeWrap.style.display  = "none";
  modal.style.display = "flex";
};

// Alias for backward compatibility
APP.openCmsModal = APP.showAddItemModal;

APP.editCmsItem = function (idx) {
  const item = STATE.menuItems[idx];
  if (!item) return;
  const modal = document.getElementById("cms-modal");
  if (!modal) return;
  document.getElementById("cms-modal-title").textContent = t("editItem");
  document.getElementById("cms-id").value    = item.docId || item.id || "";
  document.getElementById("cms-title").value = item.name;
  document.getElementById("cms-price").value = item.price;
  document.getElementById("cms-desc").value  = item.desc || "";
  document.getElementById("cms-cat").value   = item.category;
  document.getElementById("cms-emoji").value = item.emoji || "";
  document.getElementById("cms-img").value   = item.imageUrl || "";
  // Show image preview if exists
  if (item.imageUrl) {
    const placeholder = document.getElementById("cms-upload-placeholder");
    const preview     = document.getElementById("cms-upload-preview");
    const previewImg  = document.getElementById("cms-preview-img");
    const removeWrap  = document.getElementById("cms-remove-photo-wrap");
    if (placeholder) placeholder.style.display = "none";
    if (preview)     preview.style.display     = "flex";
    if (previewImg)  previewImg.src            = item.imageUrl;
    if (removeWrap)  removeWrap.style.display  = "block";
  }
  modal.style.display = "flex";
};

APP.closeCmsModal = function () {
  const modal = document.getElementById("cms-modal");
  if (modal) modal.style.display = "none";
};

APP.saveCmsItem = async function () {
  const editId = document.getElementById("cms-id").value;
  const name   = document.getElementById("cms-title").value.trim();
  const price  = parseFloat(document.getElementById("cms-price").value) || 0;
  const desc   = document.getElementById("cms-desc").value.trim();
  const cat    = document.getElementById("cms-cat").value;
  const emoji  = document.getElementById("cms-emoji").value.trim(); // optional
  const img    = document.getElementById("cms-img").value.trim();

  if (!name || !price) { showToast(t("toastValidation"), "error"); return; }

  const data = { name, price, desc, category: cat, emoji: emoji || "", imageUrl: img, updatedAt: Date.now() };

  try {
    if (editId) {
      // Update existing
      const docRef = doc(db, "menu", editId);
      await updateDoc(docRef, data);
      const idx = STATE.menuItems.findIndex(m => (m.docId || m.id) === editId);
      if (idx > -1) STATE.menuItems[idx] = { ...STATE.menuItems[idx], ...data };
    } else {
      // Add new
      const newData = { ...data, soldOut: false };
      const docRef = await addDoc(collection(db, "menu"), newData);
      STATE.menuItems.push({ ...newData, docId: docRef.id, id: docRef.id });
    }
    showToast(t("toastItemSaved"), "success");
    APP.closeCmsModal();
    renderCmsGrid();
    delete pageCache.menu; // Invalidate menu cache
  } catch (err) {
    showToast(t("toastFbErr"), "warn", 6000);
    console.warn(err);
  }
};

// Alias: admin.html modal save button calls APP.saveItem()
APP.saveItem = APP.saveCmsItem;

APP.toggleSoldOut = async function (idx) {
  const item = STATE.menuItems[idx];
  if (!item) return;
  item.soldOut = !item.soldOut;
  renderCmsGrid();
  delete pageCache.menu;

  if (item.docId) {
    try { await updateDoc(doc(db, "menu", item.docId), { soldOut: item.soldOut }); }
    catch (err) { console.warn(err); }
  }
};

APP.deleteCmsItem = async function (docId, idx) {
  const lang = STATE.lang;
  if (!confirm(lang === "sq" ? "Fshi artikullin nga menuja?" : "Delete this menu item?")) return;
  try {
    // Only skip Firestore delete for fallback default items (id: "m1".."m12")
    const isDefaultItem = /^m\d+$/.test(String(docId));
    if (!isDefaultItem && docId) {
      await deleteDoc(doc(db, "menu", docId));
    }
    STATE.menuItems.splice(idx, 1);
    renderCmsGrid();
    delete pageCache.menu;
    showToast(t("toastItemDeleted"), "success");
  } catch (err) {
    showToast(t("toastFbErr"), "warn");
    console.warn(err);
  }
};

/* ═══════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════ */
function showToast(msg, type = "default", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast${type !== "default" ? " toast-" + type : ""}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function generateUID() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "ANJ-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function generatePIN() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T12:00:00");
    const locales = { sq: "sq-AL", en: "en-GB" };
    return d.toLocaleDateString(locales[STATE.lang] || "sq-AL", { day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

/* ═══════════════════════════════════════════════════════════════
   GLOBAL EVENT DELEGATION (nav links, route buttons)
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener("click", e => {
  // Route links in static nav
  const routeEl = e.target.closest("[data-route]");
  if (routeEl && !routeEl.closest("#app-root")) {
    e.preventDefault();
    navigate(routeEl.dataset.route);
  }
});

/* Language switcher */
document.getElementById("lang-switcher")?.addEventListener("click", e => {
  const btn = e.target.closest(".lang-btn");
  if (!btn) return;
  setLang(btn.dataset.lang);
  // Re-apply to current loaded page
  applyTranslations(document.getElementById("app-root"));
});

/* Hamburger */
document.getElementById("hamburger")?.addEventListener("click", () => {
  const nav     = document.getElementById("nav-links");
  const burger  = document.getElementById("hamburger");
  const isOpen  = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(isOpen));
});

/* Close mobile nav on link click */
document.getElementById("nav-links")?.addEventListener("click", () => {
  document.getElementById("nav-links").classList.remove("open");
  document.getElementById("hamburger")?.setAttribute("aria-expanded", "false");
});

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */
function boot() {
  document.querySelectorAll(".lang-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.lang === STATE.lang)
  );
  handleHashRoute();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}


/* ═══════════════════════════════════════════════════════════════
   SECRET ADMIN TRIGGER (Easter Egg)
   ═══════════════════════════════════════════════════════════════ */
let secretClicks = 0;
let secretTimer;

const logoTrigger = document.getElementById('secret-admin-trigger');

if (logoTrigger) {
  logoTrigger.addEventListener('click', () => {
    secretClicks++;
    clearTimeout(secretTimer);

    if (secretClicks === 5) {
      secretClicks = 0;
      window.location.hash = "admin";
      // Nëse jemi te index.html, kjo do të aktivizojë router-in
      if (typeof navigate === "function") navigate('admin');
    }

    secretTimer = setTimeout(() => {
      secretClicks = 0;
    }, 200); // 1 sekondë afat për 5 klikime
  });
}

/* ═══════════════════════════════════════════════════════════════
   LOGJIKA E ADMIN LOGIN (E lëvizur këtu për aksesueshmëri)
   ═══════════════════════════════════════════════════════════════ */
async function handleAdminLogin() {
  const email = document.getElementById('adm-email')?.value;
  const pass  = document.getElementById('adm-pass')?.value;
  const errEl = document.getElementById('adm-login-err');

  if (!email || !pass) {
    if (errEl) { errEl.textContent = "Plotësoni të gjitha fushat!"; errEl.hidden = false; }
    return;
  }

  try {
    // Përdorim 'auth' që është inicializuar në fillim të script.js
    await signInWithEmailAndPassword(auth, email, pass);
    
    // Nëse suksesshëm, fshehim murin e login-it
    const loginWall = document.getElementById('admin-login-wall');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginWall) loginWall.style.display = 'none';
    if (dashboard) dashboard.hidden = false;
    
    console.log("Admin u kyç me sukses!");
  } catch (error) {
    console.error("Gabim gjatë login:", error);
    if (errEl) {
      errEl.textContent = "Email ose fjalëkalim i gabuar!";
      errEl.hidden = false;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   ENSURE window.APP is accessible globally (module scope fix)
   All methods are already assigned to APP above; this ensures
   the bridge is set and adds any missing helpers.
   ═══════════════════════════════════════════════════════════════ */

// Ensure goToReservation is on APP (may have been set earlier as window.APP.goToReservation)
APP.goToReservation = APP.goToReservation || (() => navigate("rezervim"));


/* ═══════════════════════════════════════════════════════════════
   WHATSAPP INTEGRATION
   ═══════════════════════════════════════════════════════════════ */
APP.sendWhatsApp = function(tel, emri, resId, pin) {
  const cleanTel = String(tel).replace(/\D/g, "");
  const msg = `Përshëndetje *${emri}*! ⚓\n\nRezervimi juaj u konfirmua.\n🆔 ID: *${resId}*\n🔑 PIN: *${pin}*\n\nJu mirëpresim te Anije Resort!`;
  window.open(`https://wa.me/${cleanTel}?text=${encodeURIComponent(msg)}`, '_blank');
};

/* ═══════════════════════════════════════════════════════════════
   DISPONUESHMËRIA E TAVOLINAVE (Admin Settings)
   ═══════════════════════════════════════════════════════════════ */


APP.updateAvailability = async function() {
  const brendaChecked = document.getElementById("toggle-brenda")?.checked;
  const jashteChecked = document.getElementById("toggle-jashte")?.checked;

  STATE._avail.brendaZene = brendaChecked;
  STATE._avail.jashteZene = jashteChecked;

  // Update labels
  const lbr = document.getElementById("label-brenda");
  const lja = document.getElementById("label-jashte");
  if (lbr) lbr.textContent = brendaChecked ? "Të zëna" : "Të lira";
  if (lja) lja.textContent = jashteChecked ? "Të zëna" : "Të lira";

  // Update preview
  APP._updateAvailPreview();

  // Save to Firebase
  try {
    await setDoc(doc(db, "settings", "availability"), STATE._avail, { merge: true });
    showToast("✅ U ruajt disponueshmëria.", "success", 2000);
  } catch(e) {
    showToast("⚠️ Gabim gjatë ruajtjes.", "warn");
    console.warn(e);
  }
};

APP.saveSpecialHours = async function() {
  const msg = document.getElementById("special-hours-msg")?.value.trim() || "";
  STATE._avail.specialMsg = msg;

  APP._updateAvailPreview();

  try {
    await setDoc(doc(db, "settings", "availability"), STATE._avail, { merge: true });
    showToast("📢 Lajmërimi u publikua!", "success");
  } catch(e) {
    showToast("⚠️ Gabim gjatë ruajtjes.", "warn");
    console.warn(e);
  }

  // Show/hide active bar
  const bar     = document.getElementById("avail-active-bar");
  const barText = document.getElementById("avail-bar-text");
  if (bar && barText && msg) {
    barText.textContent = msg;
    bar.style.display = "flex";
  }
};

APP.clearAnnouncement = async function() {
  STATE._avail.specialMsg = "";
  const msgEl = document.getElementById("special-hours-msg");
  if (msgEl) msgEl.value = "";
  const bar = document.getElementById("avail-active-bar");
  if (bar) bar.style.display = "none";
  APP._updateAvailPreview();

  try {
    await setDoc(doc(db, "settings", "availability"), STATE._avail, { merge: true });
    showToast("🗑️ Lajmërimi u hoq.", "success", 2000);
  } catch(e) { console.warn(e); }
};

APP._updateAvailPreview = function() {
  const preview = document.getElementById("preview-notice");
  if (!preview) return;
  const { brendaZene, jashteZene, specialMsg } = STATE._avail;
  let html = `
    <div class="avail-notice-row">
      <span class="avail-dot ${brendaZene ? 'avail-dot-red' : 'avail-dot-green'}"></span>
      <span>🏠 Tavolina brenda: <strong>${brendaZene ? 'Të zëna' : 'Të lira'}</strong></span>
    </div>
    <div class="avail-notice-row">
      <span class="avail-dot ${jashteZene ? 'avail-dot-red' : 'avail-dot-green'}"></span>
      <span>🌅 Tavolina jashtë: <strong>${jashteZene ? 'Të zëna' : 'Të lira'}</strong></span>
    </div>
  `;
  if (specialMsg) html += `<div class="avail-notice-row avail-row-msg">📢 ${specialMsg}</div>`;
  preview.innerHTML = html;
};

// Load availability state when admin settings tab opens
APP._loadAvailSettings = async function() {
  try {
    const snap = await getDoc(doc(db, "settings", "availability"));
    if (snap.exists()) {
      const data = snap.data();
      STATE._avail = { ...STATE._avail, ...data };

      const toggleBr = document.getElementById("toggle-brenda");
      const toggleJa = document.getElementById("toggle-jashte");
      const labelBr  = document.getElementById("label-brenda");
      const labelJa  = document.getElementById("label-jashte");
      const msgEl    = document.getElementById("special-hours-msg");
      const bar      = document.getElementById("avail-active-bar");
      const barText  = document.getElementById("avail-bar-text");

      if (toggleBr) toggleBr.checked = !!data.brendaZene;
      if (toggleJa) toggleJa.checked = !!data.jashteZene;
      if (labelBr)  labelBr.textContent = data.brendaZene ? "Të zëna" : "Të lira";
      if (labelJa)  labelJa.textContent = data.jashteZene ? "Të zëna" : "Të lira";
      if (msgEl)    msgEl.value = data.specialMsg || "";
      if (bar && barText && data.specialMsg) {
        barText.textContent = data.specialMsg;
        bar.style.display = "flex";
      }
    }
    APP._updateAvailPreview();
    APP._renderBlockedHoursGrid();
  } catch(e) { console.warn("Could not load availability:", e); }
};

/* ── BLOCKED HOURS GRID ── */
const ALL_HOURS = [12,13,14,15,16,17,18,19,20,21,22,23];

APP._renderBlockedHoursGrid = function() {
  const grid = document.getElementById("blocked-hours-grid");
  if (!grid) return;
  const blocked = STATE._avail.blockedHours || [];
  grid.innerHTML = ALL_HOURS.map(h => {
    const isBlocked = blocked.includes(h);
    return `<button
      class="bh-btn${isBlocked ? " blocked" : ""}"
      data-hour="${h}"
      onclick="APP._toggleBlockedHour(${h})"
    >${String(h).padStart(2,"0")}:00</button>`;
  }).join("");
  // Also sync to clock picker
  applyBlockedHoursToClockPicker(blocked);
};

APP._toggleBlockedHour = function(h) {
  const blocked = STATE._avail.blockedHours || [];
  const idx = blocked.indexOf(h);
  if (idx > -1) blocked.splice(idx, 1);
  else blocked.push(h);
  STATE._avail.blockedHours = blocked;
  APP._renderBlockedHoursGrid();
};

APP.saveBlockedHours = async function() {
  try {
    await setDoc(doc(db, "settings", "availability"), { blockedHours: STATE._avail.blockedHours || [] }, { merge: true });
    showToast("💾 Oraret e bllokuara u ruajtën!", "success");
    applyBlockedHoursToClockPicker(STATE._avail.blockedHours || []);
  } catch(e) {
    showToast("⚠️ Gabim gjatë ruajtjes.", "warn");
    console.warn(e);
  }
};

APP.clearAllBlockedHours = function() {
  STATE._avail.blockedHours = [];
  APP._renderBlockedHoursGrid();
};

APP.handleImageUpload = function(input) {
  const file = input?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById("cms-upload-preview");
    const img  = document.getElementById("cms-preview-img");
    const ph   = document.getElementById("cms-upload-placeholder");
    const wrap = document.getElementById("cms-remove-photo-wrap");
    document.getElementById("cms-img").value = e.target.result;
    if (img)  img.src = e.target.result;
    if (prev) prev.style.display = "flex";
    if (ph)   ph.style.display   = "none";
    if (wrap) wrap.style.display = "block";
  };
  reader.readAsDataURL(file);
};

APP.clearImageUpload = function() {
  document.getElementById("cms-img").value = "";
  document.getElementById("cms-preview-img").src = "";
  const prev = document.getElementById("cms-upload-preview");
  const ph   = document.getElementById("cms-upload-placeholder");
  const wrap = document.getElementById("cms-remove-photo-wrap");
  if (prev) prev.style.display = "none";
  if (ph)   ph.style.display   = "flex";
  if (wrap) wrap.style.display = "none";
};
