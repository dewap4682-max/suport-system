/* =========================================================================
   PS Rent POS — PWA kasir rental PlayStation
   Vanilla JS · offline-first (localStorage) · tanpa build step
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- utils */
  const $ = (sel, root = document) => root.querySelector(sel);
  const pad = n => String(n).padStart(2, '0');
  const uid = p => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const rp = n => 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID');
  const num = v => { const n = Number(String(v).replace(/[^\d.-]/g, '')); return isFinite(n) ? n : 0; };
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function fmtDur(ms) {
    const t = Math.max(0, Math.floor(ms / 1000));
    return pad(Math.floor(t / 3600)) + ':' + pad(Math.floor((t % 3600) / 60)) + ':' + pad(t % 60);
  }
  function fmtHM(ts) {
    return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  }
  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function dayKey(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function fmtMin(m) {
    const h = Math.floor(m / 60), r = m % 60;
    return h ? (h + ' jam' + (r ? ' ' + r + ' mnt' : '')) : (r + ' mnt');
  }

  /* ---------------------------------------------------------------- icons */
  const ICONS = {
    gamepad: '<rect x="2.5" y="6.5" width="19" height="11" rx="4.5"/><path d="M7 12h3.6M8.8 10.2v3.6M16 11.6h.01M18.3 13.4h.01"/>',
    receipt: '<path d="M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z"/><path d="M9.5 8h5M9.5 12h5"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13.2v7.8"/>',
    gear: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.6"/><circle cx="8" cy="17" r="2.6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    play: '<path d="M7 4.5l12 7.5-12 7.5z"/>',
    stop: '<rect x="5.5" y="5.5" width="13" height="13" rx="2.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 17h12v4H6z"/>',
    download: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16"/>',
    upload: '<path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M4 20h16"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    edit: '<path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3h2.2l2.4 12h11l2.2-8H6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
    check: '<path d="M4.5 12.5l5 5 10-11"/>',
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
    install: '<rect x="4" y="2.5" width="16" height="19" rx="3"/><path d="M9 6.5h6M12 10v6M9.5 13.5 12 16l2.5-2.5"/>',
    chart: '<path d="M4 20V4M4 20h16"/><rect x="7.5" y="12" width="3" height="5" rx="1"/><rect x="13" y="8" width="3" height="9" rx="1"/><rect x="18.5" y="5" width="3" height="12" rx="1" transform="translate(-1.5 0)"/>',
    wa: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3A8.5 8.5 0 1 1 20.5 11.6z"/><path d="M8.8 8.4c.3 0 .6.1.8.5l.6 1.3c.1.3.1.5-.1.7l-.5.5c.5 1 1.3 1.8 2.3 2.3l.5-.5c.2-.2.4-.2.7-.1l1.3.6c.4.2.5.5.5.8 0 .9-.7 1.7-1.6 1.8-2.9.4-6-2.6-6.4-5.4-.1-.9.7-1.5 1.6-1.5z"/>',
    chevL: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
    chevR: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
    share: '<path d="M12 3v11M8.5 6.5 12 3l3.5 3.5"/><path d="M5 13v6.5h14V13"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.3-3.6 4-5.4 7.5-5.4s6.2 1.8 7.5 5.4"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 9.5h19M6 15h4"/>',
    doc: '<path d="M6 2.5h7l5 5v14H6z"/><path d="M13 2.5v5h5M9.2 13h5.6M9.2 16.6h3.8"/>',
    camera: '<path d="M4 8h3l1.4-2h7.2L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.2"/>',
    shield: '<path d="M12 2.8 4.8 5.6v6.1c0 4.3 2.9 7.6 7.2 9.5 4.3-1.9 7.2-5.2 7.2-9.5V5.6z"/><path d="M9 12.2l2.1 2.1L15.2 10"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
    moon: '<path d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.6 8.6 0 1 0 11 11z"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.6v2.2"/>',
    cloud: '<path d="M7 18h9.6a3.4 3.4 0 0 0 .4-6.8A5 5 0 0 0 7.3 9.5 4.3 4.3 0 0 0 7 18z"/>',
    logout: '<path d="M14 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H14"/><path d="M17 8.5 20.5 12 17 15.5M10.5 12h10"/>'
  };
  const icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------------------------------------------------------------- state */
  const LS_KEY = 'pspos.v1';
  const APP = { name: 'PS Rent POS', version: '3.0', dev: 'Bolangcorp' };

  const defaultState = () => ({
    v: 1,
    settings: {
      storeName: 'PlayStation Rent',
      tagline: 'Rental PS · Minibar · 24 Jam',
      address: '',
      phone: '',
      receiptFooter: 'Terima kasih sudah main! GG 🎮',
      logoReceipt: true,
      signReceipt: true,
      signName: '',
      reportPaper: 'A4',
      theme: 'cerah',
      logo: '',
      minMinutes: 15,
      roundMinutes: 15,
      defaultRate: 8000,
      paperWidth: '58',
      paperPad: 'auto',
      waNumber: '',
      ownerWa: '',
      methods: ['Tunai', 'QRIS', 'Transfer'],
      // akun & hak akses
      authEnabled: false,
      // sinkronisasi Google Drive
      driveAuto: false,
      driveClientId: '',
      driveFolder: 'PS Rent POS Backup',
      driveFile: 'pspos-backup.json',
      autoSyncMinutes: 30,
      lastSyncAt: 0,
      driveStatus: ''
    },
    stations: [
      { id: 'st_ps1', name: 'PS 1', type: 'PS4', rate: 8000, image: 'assets/units/ps4.jpg' },
      { id: 'st_ps2', name: 'PS 2', type: 'PS4', rate: 8000, image: 'assets/units/ps4.jpg' },
      { id: 'st_ps3', name: 'PS 3', type: 'PS5', rate: 12000, image: 'assets/units/ps5.jpg' },
      { id: 'st_ps4', name: 'PS 4', type: 'PS5', rate: 12000, image: 'assets/units/ps5.jpg' }
    ],
    products: [
      { id: 'pr_aqua', name: 'Air Mineral', price: 4000, stock: 24, category: 'Minuman', image: 'assets/products/air-mineral.jpg' },
      { id: 'pr_teh', name: 'Teh Botol', price: 5000, stock: 20, category: 'Minuman', image: 'assets/products/teh-botol.jpg' },
      { id: 'pr_kopi', name: 'Kopi Sachet', price: 4000, stock: 30, category: 'Minuman', image: 'assets/products/kopi-sachet.jpg' },
      { id: 'pr_mie', name: 'Mie Instan', price: 10000, stock: 18, category: 'Makanan', image: 'assets/products/mie-instan.jpg' },
      { id: 'pr_goreng', name: 'Gorengan', price: 1000, stock: 40, category: 'Makanan', image: 'assets/products/gorengan.jpg' },
      { id: 'pr_rokok', name: 'Rokok Ketengan', price: 3000, stock: 30, category: 'Lainnya', image: 'assets/products/rokok-ketengan.jpg' }
    ],
    sessions: [],
    transactions: [],
    customers: [],
    agreements: [],
    cashbook: {},
    users: [],
    logs: []
  });

  let state;
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      state = raw ? Object.assign(defaultState(), JSON.parse(raw)) : defaultState();
      state.settings = Object.assign(defaultState().settings, state.settings || {});
      state.stations = state.stations || []; state.products = state.products || [];
      state.sessions = state.sessions || []; state.transactions = state.transactions || [];
      state.cashbook = state.cashbook || {};
      state.customers = state.customers || [];
      state.agreements = state.agreements || [];
      state.users = state.users || [];
      state.logs = state.logs || [];
      if (state.settings.logoReceipt === undefined) state.settings.logoReceipt = true;
      if (state.settings.signReceipt === undefined) state.settings.signReceipt = true;
      if (state.settings.signName === undefined) state.settings.signName = '';
      if (!['A4', 'A5', 'A3'].includes(state.settings.reportPaper)) state.settings.reportPaper = 'A4';
      if (!['cerah', 'gelap'].includes(state.settings.theme)) state.settings.theme = 'cerah';
      if (state.settings.ownerWa === undefined) state.settings.ownerWa = '';
      // migrasi: unit lama belum punya foto → isi otomatis sesuai jenis konsol
      state.stations.forEach(st => {
        if (typeof st.image === 'undefined') st.image = defaultImageForType(st.type);
      });
      // produk lama: cocokkan gambar contoh berdasarkan nama
      state.products.forEach(pr => {
        if (typeof pr.image === 'undefined') pr.image = PRODUCT_IMAGE_BY_NAME[pr.name] || '';
      });
    } catch (e) { console.warn('reset data', e); state = defaultState(); }
  }
  function save() {
    try {
      // buang catatan kas yang benar-benar kosong (biar data tetap ringkas)
      if (state && state.cashbook) {
        Object.keys(state.cashbook).forEach(k => {
          const c = state.cashbook[k];
          if (!c) { delete state.cashbook[k]; return; }
          const empty = !c.modal && !c.counted && !String(c.note || '').trim() && !(c.expenses || []).length;
          if (empty) delete state.cashbook[k];
        });
      }
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    }
    catch (e) { toast('Gagal menyimpan data: ' + e.message, 'err'); }
  }

  const S = () => state.settings;
  const sessionByStation = id => state.sessions.find(s => s.stationId === id);
  const sessionById = id => state.sessions.find(s => s.id === id);
  const stationById = id => state.stations.find(s => s.id === id);
  const productById = id => state.products.find(p => p.id === id);

  /* -------------------------------------------------------------- billing */
  function billableMinutes(startMs, endMs, cfg) {
    const raw = Math.max(0, endMs - startMs) / 60000;
    // detik sisa di dalam blok tidak dihitung (grace s.d. batas pembulatan berikutnya)
    const elapsed = Math.floor(raw);
    let m = Math.max(cfg.minMinutes || 0, elapsed);
    const step = Math.max(1, cfg.roundMinutes || 1);
    return Math.ceil(m / step) * step;
  }
  const playCost = (rate, minutes) => Math.round((Number(rate) || 0) / 60 * minutes / 100) * 100;
  const itemsTotal = items => (items || []).reduce((a, it) => a + it.price * it.qty, 0);

  function sessionBill(s, at = Date.now()) {
    const minutes = billableMinutes(s.startedAt, at, S());
    const play = playCost(s.rate, minutes);
    const items = itemsTotal(s.items);
    return { minutes, play, items, sub: play + items };
  }

  /* --------------------------------------------------- foto unit (preset) */
  const UNIT_PRESETS = [
    { name: 'PS3', src: 'assets/units/ps3.jpg' },
    { name: 'PS4', src: 'assets/units/ps4.jpg' },
    { name: 'PS5', src: 'assets/units/ps5.jpg' }
  ];
  const TYPE_IMAGE = {
    'PS3': 'assets/units/ps3.jpg',
    'PS4': 'assets/units/ps4.jpg',
    'PS5': 'assets/units/ps5.jpg',
    'PS5 Pro': 'assets/units/ps5.jpg'
  };
  const defaultImageForType = t => TYPE_IMAGE[t] || '';

  /* contoh gambar produk (bawaan) */
  const PRODUCT_PRESETS = [
    { name: 'Air Mineral', src: 'assets/products/air-mineral.jpg' },
    { name: 'Teh Botol', src: 'assets/products/teh-botol.jpg' },
    { name: 'Kopi Sachet', src: 'assets/products/kopi-sachet.jpg' },
    { name: 'Mie Instan', src: 'assets/products/mie-instan.jpg' },
    { name: 'Gorengan', src: 'assets/products/gorengan.jpg' },
    { name: 'Rokok', src: 'assets/products/rokok-ketengan.jpg' }
  ];
  const PRODUCT_IMAGE_BY_NAME = PRODUCT_PRESETS.reduce((o, p) => (o[p.name] = p.src, o), {});

  /* ------------------------------------------------------------- UI state */
  const ui = { tab: 'meja', txFilter: 'today', modal: null, cart: {}, cartCash: '', cash: '', discount: '', _confirm: null, rep: { mode: 'harian', anchor: Date.now() }, pendingImage: '', pendingProductImage: '', editExpense: '', cartCust: '', cartPhone: '', custQuery: '', cardImg: '', cardId: '', agrEdit: '', agrPhoto: '', agrIdPhoto: '', agrCondPhoto: '', agrSign: '', agrDocId: '', agrImg: '', statOpen: '', userId: '', lockUser: '', pin: '', logFilter: 'semua' };

  /* ---------------------------------------------------------------- toast */
  function toast(msg, kind = '') {
    const wrap = $('#toast-wrap');
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = (kind === 'ok' ? icon('check') : '') + '<span>' + esc(msg) + '</span>';
    wrap.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(6px)'; el.style.transition = '.25s'; }, 2100);
    setTimeout(() => el.remove(), 2450);
  }

  /* ---------------------------------------------------------------- sheet */
  function openSheet({ title = '', sub = '', body = '', foot = '', kind = '' }) {
    ui.modal = kind;
    document.body.classList.add('modal-open');
    $('#modal-root').innerHTML = `
      <div class="modal-root">
        <div class="backdrop" data-action="close-sheet"></div>
        <div class="sheet" role="dialog" aria-modal="true">
          <div class="sheet-head">
            <div style="min-width:0">
              <div class="sheet-title">${title}</div>
              ${sub ? `<div class="sheet-sub">${sub}</div>` : ''}
            </div>
            <button class="icon-btn" style="margin-left:auto" data-action="close-sheet" aria-label="Tutup">${icon('x')}</button>
          </div>
          <div class="sheet-body">${body}</div>
          ${foot ? `<div class="sheet-foot">${foot}</div>` : ''}
        </div>
      </div>`;
  }
  function closeSheet() {
    ui.modal = null;
    if (ui.statOpen) { ui.statOpen = ''; setTimeout(() => { if (ui.tab === 'meja' && !ui.modal) render(); }, 0); }
    document.body.classList.remove('modal-open');
    $('#modal-root').innerHTML = '';
  }

  function confirmSheet(title, msg, okLabel, onOk) {
    ui._confirm = onOk;
    openSheet({
      kind: 'confirm', title,
      body: `<p class="small" style="line-height:1.6;color:#c3ccdf">${msg}</p>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-red" data-action="confirm-ok">${okLabel}</button>`
    });
  }

  /* --------------------------------------------------------------- topbar */
  const THEMES = [{ id: 'cerah', label: 'Cerah', icon: 'sun' }, { id: 'gelap', label: 'Gelap', icon: 'moon' }];
  function applyTheme() {
    const t = S().theme === 'gelap' ? 'gelap' : 'cerah';
    document.documentElement.dataset.theme = t === 'gelap' ? 'dark' : 'light';
    document.documentElement.style.colorScheme = t === 'gelap' ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'gelap' ? '#03080a' : '#f2f8f4');
  }
  function setTheme(t) {
    S().theme = t === 'gelap' ? 'gelap' : 'cerah';
    save(); applyTheme(); render();
    toast(S().theme === 'gelap' ? 'Tema gelap aktif' : 'Tema cerah aktif', 'ok');
  }

  function updateBrand() {
    const s = S();
    $('#topbar').innerHTML = `
      <div class="brand">
        ${brandLogoHTML()}
        <div class="brand-txt">
          <div class="brand-name">${esc(s.storeName)}</div>
          <div class="brand-sub">${esc(s.tagline || 'Kasir rental PlayStation')}</div>
        </div>
      </div>
      <div class="topbar-actions">
        ${S().authEnabled && me() ? `<button class="user-pill" data-action="open-account" title="Akun: ${esc(me().name)} · ${esc(ROLE_LABEL[me().role] || '')}">
          <span class="avatar av-${esc(me().role)}">${esc(initials(me().name))}</span></button>` : ''}
        <span class="clock-pill" id="clock-pill"></span>
        <button class="theme-btn" data-action="theme-toggle" aria-label="Ganti tema terang/gelap" title="Tema ${S().theme === 'gelap' ? 'gelap' : 'cerah'}">${icon(S().theme === 'gelap' ? 'sun' : 'moon')}</button>
      </div>`;
    updateClock();
  }
  function updateClock() {
    const el = $('#clock-pill');
    if (!el) return;
    const d = new Date();
    const hhmm = pad(d.getHours()) + ':' + pad(d.getMinutes());
    // kalau ada pil akun di header, jam dibuat ringkas supaya nama toko tetap terbaca
    el.textContent = document.querySelector('.user-pill')
      ? hhmm
      : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' · ' + hhmm;
  }

  /* ----------------------------------------------------------------- tabs */
  const TABS = [
    { id: 'meja', label: 'Meja', icon: 'gamepad' },
    { id: 'sewa', label: 'Sewa', icon: 'doc' },
    { id: 'transaksi', label: 'Transaksi', icon: 'receipt' },
    { id: 'laporan', label: 'Laporan', icon: 'chart' },
    { id: 'produk', label: 'Produk', icon: 'box' },
    { id: 'pelanggan', label: 'Pelanggan', icon: 'user' },
    { id: 'pengaturan', label: 'Setelan', icon: 'gear' }
  ];

  function renderTabbar() {
    const running = state.sessions.length;
    $('#tabbar').innerHTML = TABS.map(t => `
      <button class="tab ${ui.tab === t.id ? 'active' : ''}" data-action="tab" data-id="${t.id}">
        ${icon(t.icon)}<span>${t.label}</span>
        ${t.id === 'meja' && running ? `<span class="tab-badge">${running}</span>` : ''}
      </button>`).join('');
  }

  /* ----------------------------------------------------------------- VIEW */
  function renderFab() {
    const host = $('#fab-root');
    if (!host) return;
    // tampil di semua tab kecuali Setelan (biar form tidak ketutupan)
    host.innerHTML = ui.tab === 'pengaturan' ? '' : `
      <button class="fab-kantin" data-action="direct-sale" aria-label="Buka Kantin Kita">
        ${icon('cart')}<span class="fab-txt">Kantin Kita</span>
      </button>`;
  }

  function render() {
    if (licInfo().expired) {
      document.body.classList.add('is-locked');
      updateBrand();
      $('#tabbar').innerHTML = '';
      $('#fab-root').innerHTML = '';
      $('#view').innerHTML = viewLicenseLock();
      return;
    }
    if (isLocked()) {
      document.body.classList.add('is-locked');
      $('#topbar').innerHTML = '';
      $('#tabbar').innerHTML = '';
      $('#fab-root').innerHTML = '';
      $('#view').innerHTML = viewLock();
      return;
    }
    document.body.classList.remove('is-locked');
    updateBrand();
    renderTabbar();
    renderFab();
    const map = { meja: viewMeja, sewa: viewSewa, transaksi: viewTransaksi, laporan: viewLaporan, produk: viewProduk, pelanggan: viewPelanggan, pengaturan: viewPengaturan };
    $('#view').innerHTML = licBar() + (map[ui.tab] || viewMeja)();
  }

  /* ------------------------------- TAB 1: MEJA --------------------------- */
  function viewMeja() {
    const cfg = S();
    const today = dayKey(Date.now());
    const txToday = state.transactions.filter(t => dayKey(t.createdAt) === today);
    const revenue = txToday.reduce((a, t) => a + t.total, 0);
    const running = state.sessions;
    const potensi = running.reduce((a, s) => a + sessionBill(s).sub, 0);

    if (!state.stations.length) {
      return `<div class="empty" style="margin-top:24px"><span class="empty-emoji">🎮</span>
        Belum ada unit/meja. Tambahkan dulu di tab <b>Setelan → Unit &amp; Tarif</b>.</div>`;
    }

    return `
      <div class="stats">
        <button class="stat ${ui.statOpen === 'omset' ? 'open' : ''}" data-action="stat-open" data-id="omset" title="Ketuk untuk rincian omset">
          <div class="stat-label">Omset hari ini</div>
          <div class="stat-value accent">${rp(revenue)}</div>
          <div class="stat-hint">${txToday.length} transaksi ${icon('chevR')}</div>
        </button>
        <button class="stat ${ui.statOpen === 'aktif' ? 'open' : ''}" data-action="stat-open" data-id="aktif" title="Ketuk untuk rincian sesi aktif">
          <div class="stat-label">Sesi aktif</div>
          <div class="stat-value">${running.length} <span class="small muted">/ ${state.stations.length}</span></div>
          <div class="stat-hint">${running.length ? 'Rincian sesi' : 'Belum ada sesi'} ${icon('chevR')}</div>
        </button>
        <button class="stat ${ui.statOpen === 'berjalan' ? 'open' : ''}" data-action="stat-open" data-id="berjalan" title="Ketuk untuk rincian biaya berjalan">
          <div class="stat-label">Berjalan (estimasi)</div>
          <div class="stat-value">${rp(potensi)}</div>
          <div class="stat-hint">Hitung per unit ${icon('chevR')}</div>
        </button>
      </div>

      <div class="sec-head">
        <div>
          <div class="sec-title">Meja / Unit</div>
          <div class="sec-sub">Ketuk kartu untuk mulai / bayar</div>
        </div>
      </div>

      <div class="station-grid">
        ${state.stations.map(stationCard).join('')}
      </div>
      <div class="small muted" style="text-align:center;margin-top:16px">
        Tarif dibulatkan per ${cfg.roundMinutes} menit · minimum ${cfg.minMinutes} menit
      </div>

      <div class="sec-head">
        <div><div class="sec-title">Transaksi Terakhir</div><div class="sec-sub">5 transaksi terbaru</div></div>
        <div class="spacer"></div>
        <button class="btn btn-sm btn-ghost" data-action="tab" data-id="transaksi">Lihat semua</button>
      </div>
      ${(() => {
        const last = state.transactions.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
        return last.length ? `<div class="list">${last.map(txRow).join('')}</div>`
          : `<div class="empty"><span class="empty-emoji">🧾</span>Belum ada transaksi. Sesi yang selesai akan muncul di sini.</div>`;
      })()}`;
  }

  function stInfo(stationId) {
    const today = dayKey(Date.now());
    const rows = state.transactions.filter(t => t.stationId === stationId && dayKey(t.createdAt) === today);
    if (!rows.length) return 'Belum ada sesi hari ini';
    return rows.length + ' sesi hari ini · ' + rp(rows.reduce((a, t) => a + t.total, 0));
  }

  function stationCard(st) {
    const s = sessionByStation(st.id);
    const agr = !s ? state.agreements.find(x => x.stationId === st.id && !x.returnedAt) : null;
    if (!s) {
      return `
      <div class="station ${agr ? 'station-rented' : ''}" data-action="open-station" data-id="${st.id}">
        <div class="station-photo">
          ${st.image ? `<img src="${esc(st.image)}" alt="Foto ${esc(st.name)}" loading="lazy" onerror="this.remove()">` : `<span class="ph">${icon('gamepad')}</span>`}
          <span class="badge ${agr ? 'badge-agr' : ''}">${agr ? 'Disewa' : 'Kosong'}</span>
        </div>
        <div class="station-top">
          <div>
            <div class="station-name">${esc(st.name)}</div>
            <div class="station-rate">${esc(st.type || 'PS')} · ${rp(st.rate)}/jam</div>
          </div>
        </div>
        <div class="timer idle"${agr ? ' data-agr-left="' + agr.id + '"' : ''}>${agr
          ? (agrStatus(agr) === 'late' ? 'Terlambat ' + agrLateHours(agr) + ' jam' : 'Sisa ' + fmtDur(agrEnd(agr) - Date.now()))
          : 'Siap dipakai'}</div>
        ${(() => {
          if (!agr) return '';
          const late = agrStatus(agr) === 'late';
          return `<div class="station-agr ${late ? 'late' : ''}">${icon('doc')} ${esc(agr.code)} · ${esc(agr.name)} · ${late ? 'TERLAMBAT ' + agrLateHours(agr) + ' JAM' : 's.d. ' + fmtDate(agrEnd(agr)) + ' ' + fmtHM(agrEnd(agr))}</div>`;
        })()}
        <div class="station-meta">
          <span>${stInfo(st.id)}</span>
        </div>
        <div class="station-actions">
          ${agr
            ? `<button class="btn btn-primary" data-action="agr-view" data-id="${agr.id}">${icon('doc')} Perjanjian</button>`
            : `<button class="btn btn-primary" data-action="open-station" data-id="${st.id}">${icon('play')} Mulai Sesi</button>`}
        </div>
      </div>`;
    }
    const bill = sessionBill(s);
    return `
      <div class="station running" data-action="open-station" data-id="${st.id}">
        <div class="station-photo">
          ${st.image ? `<img src="${esc(st.image)}" alt="Foto ${esc(st.name)}" loading="lazy" onerror="this.remove()">` : `<span class="ph">${icon('gamepad')}</span>`}
          <span class="badge badge-green"><span class="dot"></span>Main</span>
        </div>
        <div class="station-top">
          <div>
            <div class="station-name">${esc(st.name)}</div>
            <div class="station-rate">${esc(st.type || 'PS')} · ${rp(s.rate)}/jam</div>
          </div>
        </div>
        <div class="timer" data-timer="${s.id}">${fmtDur(Date.now() - s.startedAt)}</div>
        <div class="station-meta">
          <span class="station-cost" data-cost="${s.id}">${rp(bill.play)}</span>
          <span>· mulai ${fmtHM(s.startedAt)}${s.customer ? ' · ' + esc(s.customer) : ''}</span>
          ${itemsTotal(s.items) ? `<span class="station-kiosk">${icon('cart')} Kantin ${rp(itemsTotal(s.items))} · ${s.items.reduce((a, i) => a + i.qty, 0)} item</span>` : ''}
        </div>
        <div class="station-actions">
          <button class="btn btn-ghost btn-sm" data-action="open-station" data-id="${st.id}">${icon('plus')} Item</button>
          <button class="btn btn-green btn-sm" data-action="open-station" data-id="${st.id}">${icon('stop')} Stop &amp; Bayar</button>
        </div>
      </div>`;
  }

  /* ------------------------- sheet: mulai / sesi ------------------------- */
  function openStation(stationId) {
    const st = stationById(stationId);
    if (!st) return;
    const s = sessionByStation(stationId);
    if (s) return openSessionSheet(s.id);

    openSheet({
      kind: 'start',
      title: 'Mulai Sesi · ' + esc(st.name),
      sub: `${esc(st.type || 'PS')} · tarif ${rp(st.rate)}/jam`,
      body: `
        ${st.image ? `<div class="sheet-photo"><img src="${esc(st.image)}" alt="Foto ${esc(st.name)}"></div>` : ''}
        <div class="field">
          <label class="lbl" for="start-customer">Nama pelanggan (opsional)</label>
          <input class="input" id="start-customer" placeholder="mis. Budi / Meja A" autocomplete="off">
        </div>
        <div class="field">
          <label class="lbl" for="start-phone">No. HP / WA pelanggan (opsional)</label>
          <input class="input input-num" id="start-phone" type="tel" inputmode="tel" placeholder="mis. 081234567890" autocomplete="off">
          <div class="hint">Kalau diisi, pelanggan otomatis masuk daftar Pelanggan dan nota bisa dikirim ke nomornya.</div>
        </div>
        <div class="field">
          <label class="lbl" for="start-rate">Tarif per jam</label>
          <input class="input input-num" id="start-rate" type="number" inputmode="numeric" min="0" step="500" value="${st.rate}">
          <div class="hint">Bisa diubah untuk sesi ini saja (mis. tarif malam / promo).</div>
        </div>
        <div class="field">
          <label class="lbl">Pilih cepat</label>
          <div class="chips">
            ${[st.rate, 7000, 8000, 10000, 12000, 15000].filter((v, i, a) => a.indexOf(v) === i).map(v =>
              `<button class="chip" data-action="set-rate" data-id="${v}">${rp(v)}/jam</button>`).join('')}
          </div>
        </div>
        <div class="bill">
          <div class="bill-line"><span class="k">Mulai</span><span class="v">${fmtHM(Date.now())}</span></div>
          <div class="bill-line"><span class="k">Pembulatan</span><span class="v">per ${S().roundMinutes} menit</span></div>
          <div class="bill-line"><span class="k">Minimum</span><span class="v">${S().minMinutes} menit</span></div>
        </div>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-primary wide" data-action="start-session" data-id="${st.id}">${icon('play')} Mulai Sekarang</button>`
    });
  }

  function openSessionSheet(sessionId) {
    const s = sessionById(sessionId);
    if (!s) return;
    const st = stationById(s.stationId) || { name: 'Unit', type: '' };
    const bill = sessionBill(s);
    const methods = S().methods;
    ui.cash = ''; ui.discount = '';

    openSheet({
      kind: 'session',
      title: esc(st.name) + ` <span class="badge badge-green"><span class="dot"></span>Main</span>`,
      sub: `Mulai ${fmtHM(s.startedAt)} · tarif ${rp(s.rate)}/jam${s.customer ? ' · ' + esc(s.customer) : ''}`,
      body: `
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:2px">
          <div class="timer" id="live-timer" style="font-size:34px">${fmtDur(Date.now() - s.startedAt)}</div>
          <div class="row-amount" id="live-play" style="font-size:16px">${rp(bill.play)}</div>
        </div>
        <div class="small muted" id="live-min" style="margin-bottom:14px">${fmtMin(bill.minutes)} ditagihkan</div>

        <div class="sec-head" style="margin:4px 0 10px">
          <div class="sec-title" style="font-size:13px">Kantin · Tambahan</div>
        </div>
        <div id="sess-items">${sessionItemsHTML(s)}</div>
        <div class="prod-strip" style="margin-top:10px">
          ${state.products.length ? state.products.map(p => `
            <button class="prod-mini ${p.stock <= 0 ? 'out' : ''}" data-action="sess-add" data-id="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>
              <span class="prod-mini-img">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : icon('box')}</span>
              <span class="prod-mini-name">${esc(p.name)}</span>
              <span class="prod-mini-price">${rp(p.price)}</span>
            </button>`).join('') : '<span class="small muted">Belum ada produk di Kantin Kita.</span>'}
        </div>

        <div class="sec-head" style="margin:18px 0 10px"><div class="sec-title" style="font-size:13px">Pembayaran</div></div>
        <div class="bill" id="pay-bill">${payBillHTML(s)}</div>

        <div class="field-row">
          <div class="field">
            <label class="lbl" for="disc-input">Diskon (Rp)</label>
            <input class="input input-num" id="disc-input" type="number" inputmode="numeric" min="0" step="500" value="0">
          </div>
          <div class="field">
            <label class="lbl" for="cash-input">Uang diterima</label>
            <input class="input input-num" id="cash-input" type="number" inputmode="numeric" min="0" step="1000" placeholder="0">
          </div>
        </div>
        <div class="chips" style="margin:-4px 0 12px">
          <button class="chip" data-action="cash-exact">Uang pas</button>
          <button class="chip" data-action="cash-add" data-id="10000">+10rb</button>
          <button class="chip" data-action="cash-add" data-id="20000">+20rb</button>
          <button class="chip" data-action="cash-add" data-id="50000">+50rb</button>
          <button class="chip" data-action="cash-add" data-id="100000">+100rb</button>
        </div>

        <div class="field">
          <label class="lbl">Metode bayar</label>
          <div class="chips" id="method-chips">
            ${methods.map((m, i) => `<button class="chip ${i === 0 ? 'active' : ''}" data-action="set-method" data-id="${i}">${esc(m)}</button>`).join('')}
          </div>
        </div>
        <div class="change-box" id="change-box"><span>Kembalian</span><span id="change-val">Rp 0</span></div>
        ${s.items.length ? `<div class="small muted" style="margin-top:12px">Stok kantin otomatis dikurangi saat transaksi disimpan.</div>` : ''}`,
      foot: `<button class="btn btn-ghost" data-action="cancel-session" data-id="${s.id}">${icon('x')} Batal</button>
             <button class="btn btn-green wide" data-action="pay-now" data-id="${s.id}">${icon('check')} Bayar &amp; Struk</button>`
    });
    recomputePay();
  }

  function sessionItemsHTML(s) {
    if (!s.items.length) return `<div class="small muted" style="padding:8px 0">Belum ada item kantin.</div>`;
    return s.items.map((it, i) => {
      const img = (productById(it.productId) || {}).image || '';
      return `
      <div class="item-line">
        <span class="item-thumb">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : icon('box')}</span>
        <div class="nm">${esc(it.name)}<small>${rp(it.price)} × ${it.qty}</small></div>
        <div class="amt">${rp(it.price * it.qty)}</div>
        <button class="icon-btn" data-action="sess-del" data-id="${i}" aria-label="Hapus">${icon('trash')}</button>
      </div>`; }).join('');
  }

  function payBillHTML(s) {
    const bill = sessionBill(s);
    const disc = clamp(num(ui.discount), 0, 1e9);
    const total = Math.max(0, bill.sub - disc);
    return `
      <div class="bill-line"><span class="k">Sewa (${fmtMin(bill.minutes)})</span><span class="v">${rp(bill.play)}</span></div>
      ${bill.items ? `<div class="bill-line"><span class="k">Kantin</span><span class="v">${rp(bill.items)}</span></div>` : ''}
      ${disc ? `<div class="bill-line"><span class="k">Diskon</span><span class="v">−${rp(disc)}</span></div>` : ''}
      <div class="bill-line total"><span class="k">Total</span><span class="v">${rp(total)}</span></div>`;
  }

  function recomputePay() {
    if (ui.modal !== 'session') return;
    const id = $('.sheet-foot [data-action="pay-now"]')?.dataset.id;
    const s = sessionById(id);
    if (!s) return;
    const bill = sessionBill(s);
    const disc = clamp(num(ui.discount), 0, 1e9);
    const total = Math.max(0, bill.sub - disc);
    const cash = num(ui.cash);

    const setTxt = (sel, v) => { const el = $(sel); if (el) el.textContent = v; };
    setTxt('#live-timer', fmtDur(Date.now() - s.startedAt));
    setTxt('#live-play', rp(bill.play));
    setTxt('#live-min', fmtMin(bill.minutes) + ' ditagihkan');
    const billEl = $('#pay-bill'); if (billEl) billEl.innerHTML = payBillHTML(s);

    const changeEl = $('#change-val'), boxEl = $('#change-box');
    if (changeEl) changeEl.textContent = rp(cash - total);
    if (boxEl) boxEl.classList.toggle('neg', cash > 0 && cash < total);
  }

  /* ------------------------------- TAB 2: TRANSAKSI ---------------------- */
  function filteredTx() {
    const now = Date.now();
    const today = dayKey(now);
    if (ui.txFilter === 'today') return state.transactions.filter(t => dayKey(t.createdAt) === today);
    if (ui.txFilter === '7d') return state.transactions.filter(t => now - t.createdAt < 7 * 864e5);
    return state.transactions.slice();
  }

  function viewTransaksi() {
    const list = filteredTx().slice().sort((a, b) => b.createdAt - a.createdAt);
    const total = list.reduce((a, t) => a + t.total, 0);
    const sewa = list.filter(t => t.type === 'sewa').reduce((a, t) => a + (t.play || 0), 0);
    const minibar = list.reduce((a, t) => a + (t.itemsTotal || 0), 0);
    const durasi = list.reduce((a, t) => a + (t.minutes || 0), 0);

    const groups = {};
    list.forEach(t => { (groups[dayKey(t.createdAt)] = groups[dayKey(t.createdAt)] || []).push(t); });

    return `
      <div class="stats">
        <div class="stat"><div class="stat-label">Total</div><div class="stat-value accent">${rp(total)}</div></div>
        <div class="stat"><div class="stat-label">Transaksi</div><div class="stat-value">${list.length}</div></div>
        <div class="stat"><div class="stat-label">Durasi main</div><div class="stat-value">${Math.floor(durasi / 60)}<span class="small muted"> jam ${durasi % 60}m</span></div></div>
      </div>

      <div class="sec-head">
        <div><div class="sec-title">Riwayat Transaksi</div>
        <div class="sec-sub">Sewa ${rp(sewa)} · Kantin ${rp(minibar)}</div></div>
        <div class="spacer"></div>
      </div>

      <div class="chips" style="margin-bottom:14px">
        ${[['today', 'Hari ini'], ['7d', '7 hari'], ['all', 'Semua']].map(([k, l]) =>
          `<button class="chip ${ui.txFilter === k ? 'active' : ''}" data-action="tx-filter" data-id="${k}">${l}</button>`).join('')}
      </div>

      ${list.length ? Object.keys(groups).map(day => `
        <div class="small muted" style="margin:16px 2px 8px;font-weight:700;letter-spacing:.4px">
          ${day === dayKey(Date.now()) ? 'HARI INI' : fmtDate(groups[day][0].createdAt).toUpperCase()}
          <span style="opacity:.6">· ${rp(groups[day].reduce((a, t) => a + t.total, 0))}</span>
        </div>
        <div class="list">
          ${groups[day].map(txRow).join('')}
        </div>`).join('')
        : `<div class="empty"><span class="empty-emoji">🧾</span>Belum ada transaksi pada periode ini.</div>`}`;
  }

  function txRow(t) {
    const title = t.type === 'sewa' ? (t.stationName || 'Sewa') : 'Jual langsung';
    return `
      <div class="row" data-action="tx-detail" data-id="${t.id}">
        <div class="row-main">
          <div class="row-title">${esc(title)}
            <span class="badge ${t.type === 'sewa' ? 'badge-violet' : 'badge-cyan'}">${t.type === 'sewa' ? 'Sewa' : 'Kantin'}</span>
          </div>
          <div class="row-sub">${t.code} · ${fmtHM(t.createdAt)}${t.minutes ? ' · ' + fmtMin(t.minutes) : ''} · ${esc(t.method || 'Tunai')}</div>
        </div>
        <div class="row-end">
          <div class="row-amount">${rp(t.total)}</div>
          <div class="row-sub">${(t.items || []).length} item</div>
        </div>
      </div>`;
  }

  /* ------------------------------- TAB 3: LAPORAN ------------------------ */
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function periodRange(mode, anchorTs) {
    const d = new Date(anchorTs);
    const y = d.getFullYear(), m = d.getMonth();
    if (mode === 'harian') {
      const start = new Date(y, m, d.getDate()).getTime();
      const end = new Date(y, m, d.getDate() + 1).getTime();
      return {
        start, end,
        label: new Date(start).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
        sub: 'Laporan harian · ' + fmtDate(start)
      };
    }
    if (mode === 'bulanan') {
      const start = new Date(y, m, 1).getTime();
      const end = new Date(y, m + 1, 1).getTime();
      return {
        start, end,
        label: new Date(start).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        sub: 'Laporan bulanan'
      };
    }
    const start = new Date(y, 0, 1).getTime();
    const end = new Date(y + 1, 0, 1).getTime();
    return { start, end, label: 'Tahun ' + y, sub: 'Laporan tahunan' };
  }

  function shiftPeriod(mode, anchorTs, dir) {
    const d = new Date(anchorTs);
    if (mode === 'harian') return new Date(d.getFullYear(), d.getMonth(), d.getDate() + dir, 12).getTime();
    if (mode === 'bulanan') return new Date(d.getFullYear(), d.getMonth() + dir, 15).getTime();
    return new Date(d.getFullYear() + dir, 6, 1).getTime();
  }

  const repTx = () => {
    const P = periodRange(ui.rep.mode, ui.rep.anchor);
    return state.transactions.filter(t => t.createdAt >= P.start && t.createdAt < P.end);
  };

  function repBuckets(mode, P, tx) {
    const out = [];
    if (mode === 'harian') {
      for (let h = 0; h < 24; h++) out.push({ label: pad(h) + ':00', short: pad(h), value: 0 });
      tx.forEach(t => { const i = new Date(t.createdAt).getHours(); if (out[i]) out[i].value += t.total; });
    } else if (mode === 'bulanan') {
      const days = Math.round((P.end - P.start) / 864e5);
      for (let d = 1; d <= days; d++) out.push({ label: String(d), short: String(d), value: 0 });
      tx.forEach(t => { const i = new Date(t.createdAt).getDate() - 1; if (out[i]) out[i].value += t.total; });
    } else {
      MONTHS_SHORT.forEach((m, i) => out.push({ label: m, short: m, value: 0 }));
      tx.forEach(t => { const i = new Date(t.createdAt).getMonth(); if (out[i]) out[i].value += t.total; });
    }
    return out;
  }

  function stationRank(tx) {
    const map = new Map();
    tx.filter(t => t.type === 'sewa').forEach(t => {
      const key = t.stationName || 'Unit';
      const o = map.get(key) || { name: key, sesi: 0, menit: 0, omset: 0 };
      o.sesi++; o.menit += t.minutes || 0; o.omset += t.total;
      map.set(key, o);
    });
    return [...map.values()].sort((a, b) => b.menit - a.menit || b.sesi - a.sesi);
  }

  function productRank(tx) {
    const map = new Map();
    tx.forEach(t => (t.items || []).forEach(it => {
      const o = map.get(it.name) || { name: it.name, qty: 0, omset: 0 };
      o.qty += it.qty; o.omset += it.price * it.qty;
      map.set(it.name, o);
    }));
    return [...map.values()].sort((a, b) => b.qty - a.qty || b.omset - a.omset);
  }

  function methodRank(tx) {
    const map = new Map();
    tx.forEach(t => {
      const k = t.method || 'Tunai';
      const o = map.get(k) || { name: k, n: 0, total: 0 };
      o.n++; o.total += t.total;
      map.set(k, o);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  /* ------------------------------ catatan kas ---------------------------- */
  const isCashMethod = m => /tunai|cash|kontan/i.test(String(m || ''));
  const cashKey = () => ui.rep.mode + ':' + periodRange(ui.rep.mode, ui.rep.anchor).start;

  function cashBook() {
    const key = cashKey();
    if (!state.cashbook[key]) {
      state.cashbook[key] = { modal: 0, counted: 0, note: '', expenses: [] };
    }
    const cb = state.cashbook[key];
    cb.expenses = cb.expenses || [];
    return cb;
  }

  // versi baca: jangan buat entri baru hanya karena halaman laporan dibuka
  function cashBookRead() {
    const cb = state.cashbook[cashKey()];
    if (!cb) return { modal: 0, counted: 0, note: '', expenses: [] };
    cb.expenses = cb.expenses || [];
    return cb;
  }

  function cashSummary(tx) {
    const cb = cashBookRead();
    const masuk = tx.filter(t => isCashMethod(t.method)).reduce((a, t) => a + t.total, 0);
    const keluar = cb.expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0);
    const modal = Number(cb.modal) || 0;
    const seharusnya = masuk + modal - keluar;
    const counted = Number(cb.counted) || 0;
    const selisih = counted ? counted - seharusnya : 0;
    return { masuk, keluar, modal, seharusnya, counted, selisih, cb };
  }

  function diffClass(c) {
    if (!c.counted) return '';
    if (c.selisih === 0) return ' ok';
    return c.selisih > 0 ? ' pos' : ' neg';
  }

  function cashBookHTML(tx) {
    const c = cashSummary(tx);
    return `
      <div class="bill" style="margin-bottom:12px">
        <div class="bill-line"><span class="k">Kas masuk (tunai)</span><span class="v" id="cb-masuk">${rp(c.masuk)}</span></div>
        <div class="bill-line"><span class="k">Modal awal</span><span class="v" id="cb-modalval">${rp(c.modal)}</span></div>
        <div class="bill-line"><span class="k">Pengeluaran</span><span class="v" id="cb-keluar">−${rp(c.keluar)}</span></div>
        <div class="bill-line total"><span class="k">Kas seharusnya</span><span class="v" id="cb-seharusnya">${rp(c.seharusnya)}</span></div>
      </div>

      <div class="field-row">
        <div class="field">
          <div class="lbl-row"><label class="lbl" for="cb-modal">Modal awal</label>
            <button class="mini-edit" data-action="cash-fix" data-id="modal" aria-label="Ubah modal awal" title="Ubah modal awal">${icon('edit')}</button></div>
          <input class="input input-num" id="cb-modal" type="number" inputmode="numeric" min="0" step="1000" value="${c.modal || ''}" placeholder="Rp 0"></div>
        <div class="field">
          <div class="lbl-row"><label class="lbl" for="cb-counted">Uang fisik</label>
            <button class="mini-edit" data-action="cash-fix" data-id="counted" aria-label="Ubah uang fisik dihitung" title="Ubah uang fisik dihitung">${icon('edit')}</button></div>
          <input class="input input-num" id="cb-counted" type="number" inputmode="numeric" min="0" step="1000" value="${c.counted || ''}" placeholder="Rp 0"></div>
      </div>
      <div class="change-box${diffClass(c)}" id="cb-diff-box"><span>Selisih kas</span><span id="cb-diff">${c.counted ? rp(c.selisih) : '—'}</span></div>

      <div class="sec-head" style="margin:16px 0 8px">
        <div><div class="sec-title" style="font-size:13px">Pengeluaran</div>
        <div class="sec-sub">Belanja, gaji, listrik, dsb.</div></div>
        <div class="spacer"></div>
        <button class="btn btn-sm btn-ghost" data-action="cb-add">${icon('plus')} Catat</button>
      </div>
      <div id="cb-expenses">${expensesHTML(c.cb)}</div>

      <div class="field" style="margin:14px 0 0">
        <label class="lbl">Catatan kas</label>
        <textarea class="input" id="cb-note" rows="3" placeholder="mis. setoran ke bank, kembalian habis, tip, dsb." style="resize:vertical;min-height:74px">${esc(c.cb.note || '')}</textarea>
      </div>`;
  }

  function expensesHTML(cb) {
    if (!cb.expenses.length) return `<div class="small muted" style="padding:6px 0">Belum ada pengeluaran dicatat.</div>`;
    return cb.expenses.map(e => `
      <div class="item-line">
        <div class="nm">${esc(e.label)}<small>${fmtHM(e.createdAt)}${e.editedAt ? ' · diubah ' + fmtHM(e.editedAt) : ''}</small></div>
        <div class="amt">−${rp(e.amount)}</div>
        <button class="icon-btn" data-action="cb-edit" data-id="${e.id}" aria-label="Ubah ${esc(e.label)}">${icon('edit')}</button>
        <button class="icon-btn" data-action="cb-del" data-id="${e.id}" aria-label="Hapus ${esc(e.label)}">${icon('trash')}</button>
      </div>`).join('');
  }

  function updateCashCard() {
    if (ui.tab !== 'laporan') return;
    const c = cashSummary(repTx());
    const set = (sel, v) => { const el = $(sel); if (el) el.textContent = v; };
    set('#cb-masuk', rp(c.masuk));
    set('#cb-modalval', rp(c.modal));
    set('#cb-keluar', '−' + rp(c.keluar));
    set('#cb-seharusnya', rp(c.seharusnya));
    set('#cb-diff', c.counted ? rp(c.selisih) : '—');
    const wrap = $('#cb-diff-box');
    if (wrap) {
      wrap.classList.remove('pos', 'neg', 'ok');
      const cls = diffClass(c).trim();
      if (cls) wrap.classList.add(cls);
    }
    const exp = $('#cb-expenses');
    if (exp) exp.innerHTML = expensesHTML(c.cb);
  }

  function viewLaporan() {
    const P = periodRange(ui.rep.mode, ui.rep.anchor);
    const tx = repTx();
    const omset = tx.reduce((a, t) => a + t.total, 0);
    const sewa = tx.reduce((a, t) => a + (t.play || 0), 0);
    const minibar = tx.reduce((a, t) => a + (t.itemsTotal || 0), 0);
    const diskon = tx.reduce((a, t) => a + (t.discount || 0), 0);
    const menit = tx.reduce((a, t) => a + (t.minutes || 0), 0);
    const sesi = tx.filter(t => t.type === 'sewa').length;
    const avg = tx.length ? Math.round(omset / tx.length) : 0;
    const canNext = P.end <= Date.now();

    const bs = repBuckets(ui.rep.mode, P, tx);
    const maxB = Math.max(0, ...bs.map(b => b.value));
    const beat = bs.reduce((best, b, i) => (b.value > (bs[best] ? bs[best].value : -1) ? i : best), 0);
    const axis = ui.rep.mode === 'harian'
      ? ['00', '06', '12', '18', '23']
      : (ui.rep.mode === 'bulanan'
        ? ['1', String(Math.round(bs.length / 2)), String(bs.length)]
        : ['Jan', 'Apr', 'Jul', 'Des']);

    const units = stationRank(tx);
    const maxUnitMenit = Math.max(1, ...units.map(u => u.menit));
    const prods = productRank(tx).slice(0, 6);
    const maxQty = Math.max(1, ...prods.map(p => p.qty));
    const methods = methodRank(tx);
    const maxMethod = Math.max(1, ...methods.map(m => m.total));

    return `
      <div class="sec-head" style="margin-top:8px">
        <div><div class="sec-title">Laporan</div><div class="sec-sub">Rekap harian, bulanan &amp; tahunan</div></div>
        <div class="spacer"></div>
      </div>

      <div class="chips export-row">
        <button class="chip" data-action="rep-share">${icon('wa')} Teks</button>
        <button class="chip" data-action="rep-image">${icon('share')} Gambar</button>
        <button class="chip" data-action="rep-print">${icon('print')} Cetak</button>
        <button class="chip chip-owner" data-action="rep-owner">${icon('wa')} Ke Owner</button>
      </div>

      <div class="seg">
        ${[['harian', 'Harian'], ['bulanan', 'Bulanan'], ['tahunan', 'Tahunan']].map(([k, l]) =>
          `<button class="${ui.rep.mode === k ? 'active' : ''}" data-action="rep-mode" data-id="${k}">${l}</button>`).join('')}
      </div>

      <div class="period-nav">
        <button data-action="rep-prev" aria-label="Periode sebelumnya">${icon('chevL')}</button>
        <div class="lab">${esc(P.label)}<small>${esc(P.sub)}</small></div>
        <button data-action="rep-next" aria-label="Periode berikutnya" ${canNext ? '' : 'disabled'}>${icon('chevR')}</button>
      </div>

      <div class="big-total">
        <div>
          <div class="lab">Omset periode</div>
          <div class="small muted" style="margin-top:4px">${tx.length} transaksi · rata-rata ${rp(avg)}</div>
        </div>
        <div class="amt">${rp(omset)}</div>
      </div>

      <div class="split" style="margin-bottom:9px">
        <div class="box"><div class="k">Sewa unit</div><div class="v">${rp(sewa)}</div><div class="s">${sesi} sesi selesai</div></div>
        <div class="box"><div class="k">Kantin</div><div class="v">${rp(minibar)}</div><div class="s">${productRank(tx).reduce((a, p) => a + p.qty, 0)} item terjual</div></div>
        <div class="box"><div class="k">Durasi main</div><div class="v">${Math.floor(menit / 60)}j ${menit % 60}m</div><div class="s">${sesi ? Math.round(menit / sesi) + ' mnt / sesi rata-rata' : '—'}</div></div>
        <div class="box"><div class="k">Diskon diberikan</div><div class="v">${rp(diskon)}</div><div class="s">${rp(omset + diskon)} sebelum diskon</div></div>
      </div>

      <div class="sec-head"><div><div class="sec-title">Grafik Omset</div>
        <div class="sec-sub">${maxB ? 'Tertinggi: ' + bs[beat].label + ' · ' + rp(maxB) : 'Belum ada pemasukan'}</div></div></div>
      <div class="card" style="padding:12px 12px 10px">
        <div class="chart">
          ${bs.map((b, i) => {
            const h = maxB ? Math.max(2, Math.round((b.value / maxB) * 100)) : 2;
            const cls = b.value <= 0 ? 'zero' : (i === beat ? 'best' : '');
            return `<div class="bar ${cls}" style="height:${h}%" title="${b.label}: ${rp(b.value)}"></div>`;
          }).join('')}
        </div>
        <div class="chart-axis">${axis.map(a => `<span>${a}</span>`).join('')}</div>
      </div>

      <div class="sec-head"><div><div class="sec-title">PS Paling Sering Dimainkan</div>
        <div class="sec-sub">Berdasarkan total jam main</div></div></div>
      ${units.length ? `<div class="card" style="padding:6px 14px">${units.map((u, i) => `
        <div class="rank">
          <div class="no ${i === 0 ? 'top' : ''}">${i + 1}</div>
          <div class="main">
            <div class="nm"><span>${esc(u.name)}</span><span class="val">${rp(u.omset)}</span></div>
            <div class="sub">${u.sesi}× main · ${fmtMin(u.menit)}</div>
            <div class="track"><i style="width:${Math.round((u.menit / maxUnitMenit) * 100)}%"></i></div>
          </div>
        </div>`).join('')}</div>`
        : `<div class="empty"><span class="empty-emoji">🎮</span>Belum ada sesi sewa pada periode ini.</div>`}

      <div class="sec-head"><div><div class="sec-title">Kantin · Produk Terlaris</div></div></div>
      ${prods.length ? `<div class="card" style="padding:6px 14px">${prods.map((pr, i) => `
        <div class="rank">
          <div class="no ${i === 0 ? 'top' : ''}">${i + 1}</div>
          <div class="main">
            <div class="nm"><span>${esc(pr.name)}</span><span class="val">${pr.qty}×</span></div>
            <div class="sub">${rp(pr.omset)}</div>
            <div class="track"><i style="width:${Math.round((pr.qty / maxQty) * 100)}%"></i></div>
          </div>
        </div>`).join('')}</div>`
        : `<div class="empty"><span class="empty-emoji">🥤</span>Belum ada penjualan di Kantin Kita.</div>`}

      <div class="sec-head"><div><div class="sec-title">Metode Pembayaran</div></div></div>
      ${methods.length ? `<div class="card" style="padding:6px 14px">${methods.map((m, i) => `
        <div class="rank">
          <div class="main">
            <div class="nm"><span>${esc(m.name)}</span><span class="val">${rp(m.total)}</span></div>
            <div class="sub">${m.n} transaksi</div>
            <div class="track"><i style="width:${Math.round((m.total / maxMethod) * 100)}%"></i></div>
          </div>
        </div>`).join('')}</div>`
        : `<div class="empty">Belum ada data.</div>`}

      <div class="sec-head"><div><div class="sec-title">Catatan Kas</div>
        <div class="sec-sub">Uang tunai, modal, pengeluaran &amp; selisih</div></div></div>
      <div class="card" style="padding:14px">
        ${cashBookHTML(tx)}
      </div>

      <div class="small muted" style="text-align:center;margin:18px 0 6px;line-height:1.7">
        Rekap dihitung dari transaksi yang sudah dibayar.<br>Catatan kas disimpan per periode (harian/bulanan/tahunan).
      </div>`;
  }

  function reportModel() {
    const P = periodRange(ui.rep.mode, ui.rep.anchor);
    const tx = repTx();
    const sum = k => tx.reduce((a, t) => a + (t[k] || 0), 0);
    const omset = sum('total');
    const sewa = sum('play');
    const minibar = sum('itemsTotal');
    const diskon = sum('discount');
    const menit = sum('minutes');
    const sesi = tx.filter(t => t.type === 'sewa').length;
    return {
      P, tx, omset, sewa, minibar, diskon, menit, sesi,
      avg: tx.length ? Math.round(omset / tx.length) : 0,
      units: stationRank(tx), prods: productRank(tx),
      methods: methodRank(tx), cash: cashSummary(tx)
    };
  }

  const durText = m => Math.floor(m / 60) + ' jam ' + (m % 60) + ' mnt';
  const durShort = m => Math.floor(m / 60) + 'j ' + pad(m % 60) + 'm';
  const periodeTitle = () => ({ harian: 'LAPORAN HARIAN', bulanan: 'LAPORAN BULANAN', tahunan: 'LAPORAN TAHUNAN' }[ui.rep.mode] || 'LAPORAN');

  // isi laporan sebagai baris teks (dipakai untuk gambar PNG & teks WA)
  function reportLines() {
    const m = reportModel();
    const cfg = S();
    const L = [];
    const push = (t2, opts) => L.push(Object.assign({ t: t2 == null ? '' : String(t2), c: false, b: false }, opts || {}));
    const sep = () => push('--------------------------------', { c: false, b: false });
    const kv = (k, v) => push(k.padEnd(15, ' ') + ': ' + v);
    push(cfg.storeName || 'PS RENT', { c: true, b: true });
    if (cfg.tagline) push(cfg.tagline, { c: true });
    if (cfg.address) push(cfg.address, { c: true });
    if (cfg.phone) push('Telp/WA: ' + cfg.phone, { c: true });
    sep();
    push(periodeTitle(), { c: true, b: true });
    push(m.P.sub + ': ' + m.P.label, { c: true });
    sep();
    push('Omset periode', { b: true });
    push(rp(m.omset), { b: true });
    kv('Transaksi', m.tx.length + '× (rata-rata ' + rp(m.avg) + ')');
    kv('Sewa unit', rp(m.sewa) + ' (' + m.sesi + ' sesi)');
    kv('Kantin Kita', rp(m.minibar));
    kv('Durasi main', durText(m.menit));
    kv('Diskon', rp(m.diskon));
    if (m.methods.length) {
      sep(); push('METODE BAYAR', { b: true });
      m.methods.forEach(x => kv(x.name, rp(x.total) + ' (' + x.n + '×)'));
    }
    if (m.units.length) {
      sep(); push('PS PALING SERING DIMAINKAN', { b: true });
      m.units.slice(0, 5).forEach((u, i) => push((i + 1) + '. ' + u.name + ' — ' + u.sesi + ' sesi · ' + fmtMin(u.menit) + ' · ' + rp(u.omset)));
    }
    if (m.prods.length) {
      sep(); push('PRODUK TERLARIS', { b: true });
      m.prods.slice(0, 5).forEach((p2, i) => push((i + 1) + '. ' + p2.name + ' — ' + p2.qty + '× · ' + rp(p2.omset)));
    }
    const c = m.cash;
    sep(); push('CATATAN KAS', { b: true });
    kv('Kas masuk (tunai)', rp(c.masuk));
    kv('Modal awal', rp(c.modal));
    kv('Pengeluaran', '−' + rp(c.keluar));
    push('Kas seharusnya : ' + rp(c.seharusnya), { b: true });
    if (c.counted) {
      kv('Uang dihitung', rp(c.counted));
      push('Selisih         : ' + rp(c.selisih), { b: true });
    }
    if (c.cb.note) push('Catatan: ' + c.cb.note);
    sep();
    const signName = (cfg.signName || '').trim() || cfg.storeName || 'PS RENT';
    push('Dibuat ' + fmtDate(Date.now()) + ' ' + fmtHM(Date.now()), { c: true });
    push('Hormat kami,', { c: true });
    push('');
    push('');
    push('....................', { c: true });
    push(signName, { c: true, b: true });
    return L;
  }

  /* ====================== laporan: gambar & cetak (rapi) ================= */
  const RPT = {
    W: 720, PAD: 30,
    ink: '#0f172a', soft: '#475569', muted: '#7c8a9a', line: '#e3e9ef',
    accent: '#0f9d58', accentDark: '#0b7a45',
    softGreen: '#f1fdf6', softGreenLine: '#c2eed6', panel: '#f8fafc'
  };

  function reportMeta() {
    const m = reportModel();
    const cfg = S();
    const signName = (cfg.signName || '').trim() || cfg.storeName || 'PS RENT';
    const itemsSold = m.prods.reduce((a, p2) => a + p2.qty, 0);
    return { m, cfg, signName, itemsSold, title: periodeTitle() };
  }

  // satu fungsi gambar untuk ukur tinggi & render (ctx = null → mode ukur)
  function paintReport(ctx) {
    const { m, cfg, signName, itemsSold, title } = reportMeta();
    const logo = ui._reportLogo || null;
    const W = RPT.W, PAD = RPT.PAD, CW = W - PAD * 2;
    let y = PAD;

    const setFont = (weight, size, mono) => {
      if (!ctx) return;
      const fam = mono ? 'ui-monospace, Menlo, Consolas, monospace' : 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.font = weight + ' ' + size + 'px ' + fam;
    };
    const measure = (str, o = {}) => {
      if (!ctx) return String(str).length * (o.size || 13) * (o.mono ? 0.6 : 0.5);
      setFont(o.weight || 400, o.size || 13, o.mono);
      return ctx.measureText(String(str)).width;
    };
    const text = (str, x, yy, o = {}) => {
      if (!ctx) return;
      setFont(o.weight || 400, o.size || 13, o.mono);
      ctx.fillStyle = o.color || RPT.ink;
      ctx.textAlign = o.align || 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(str), x, yy);
    };
    const rrect = (x, yy, w, h, r, fill, stroke) => {
      if (!ctx) return;
      const rr = Math.min(r, h / 2, w / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, yy);
      ctx.arcTo(x + w, yy, x + w, yy + h, rr);
      ctx.arcTo(x + w, yy + h, x, yy + h, rr);
      ctx.arcTo(x, yy + h, x, yy, rr);
      ctx.arcTo(x, yy, x + w, yy, rr);
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    };
    const line = (x1, x2, yy, color, lw, dash) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.setLineDash(dash || []);
      ctx.strokeStyle = color || RPT.line;
      ctx.lineWidth = lw || 1;
      ctx.moveTo(x1, yy); ctx.lineTo(x2, yy);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    const wrap = (str, maxW, o) => {
      const words = String(str).split(/\s+/);
      const out = []; let cur = '';
      words.forEach(w => {
        const t = cur ? cur + ' ' + w : w;
        if (measure(t, o) > maxW && cur) { out.push(cur); cur = w; } else cur = t;
      });
      if (cur) out.push(cur);
      return out;
    };

    /* ---------------- header ---------------- */
    let lw = 0, lh = 0;
    if (logo) {
      const k = Math.min(58 / (logo.width || 58), 58 / (logo.height || 58), 1);
      lw = Math.round((logo.width || 58) * k);
      lh = Math.round((logo.height || 58) * k);
    }
    if (logo && ctx) ctx.drawImage(logo, PAD, y + 2, lw, lh);
    const tx = PAD + (lw ? lw + 14 : 0);
    let ty = y + 21;
    text(cfg.storeName || 'PS RENT', tx, ty, { weight: 800, size: 22 });
    if (cfg.tagline) { ty += 19; text(cfg.tagline, tx, ty, { size: 12, color: RPT.soft }); }
    if (cfg.address) { ty += 16; text(cfg.address, tx, ty, { size: 11.5, color: RPT.muted }); }
    if (cfg.phone) { ty += 16; text('Telp/WA ' + cfg.phone, tx, ty, { size: 11.5, color: RPT.muted }); }

    const pillW = Math.max(118, measure(title, { weight: 700, size: 10.5 }) + 28);
    rrect(W - PAD - pillW, y + 1, pillW, 25, 12.5, RPT.softGreen, RPT.softGreenLine);
    text(title, W - PAD - pillW / 2, y + 18, { weight: 800, size: 10.5, color: RPT.accentDark, align: 'center' });
    text(m.P.sub, W - PAD, y + 46, { size: 11.5, color: RPT.muted, align: 'right' });
    text(m.P.label, W - PAD, y + 66, { weight: 800, size: 12.5, align: 'right' });

    y = Math.max(y + Math.max(lh, 78), ty + 10) + 14;
    line(PAD, W - PAD, y, RPT.accent, 2);

    /* ---------------- omset ---------------- */
    y += 18;
    const panelH = 78;
    rrect(PAD, y, CW, panelH, 16, RPT.softGreen, RPT.softGreenLine);
    text('OMSET PERIODE', PAD + 18, y + 25, { weight: 800, size: 10, color: RPT.accentDark });
    text(m.tx.length + ' transaksi · rata-rata ' + rp(m.avg), PAD + 18, y + 47, { size: 12, color: RPT.soft });
    text(rp(m.omset), W - PAD - 18, y + 52, { weight: 800, size: 25, mono: true, align: 'right' });
    y += panelH + 12;

    /* ---------------- grid statistik ---------------- */
    const cells = [
      ['Sewa unit', rp(m.sewa), m.sesi + ' sesi selesai'],
      ['Kantin Kita', rp(m.minibar), itemsSold + ' item terjual'],
      ['Durasi main', durShort(m.menit), m.sesi ? Math.round(m.menit / m.sesi) + ' mnt / sesi' : '—'],
      ['Diskon', rp(m.diskon), 'dari ' + rp(m.omset + m.diskon)]
    ];
    const gap = 11, cellW = (CW - gap) / 2, cellH = 54;
    cells.forEach((c, i) => {
      const cx = PAD + (i % 2) * (cellW + gap);
      const cy = y + Math.floor(i / 2) * (cellH + gap);
      rrect(cx, cy, cellW, cellH, 12, RPT.panel, RPT.line);
      text(c[0].toUpperCase(), cx + 12, cy + 19, { weight: 800, size: 9.5, color: RPT.muted });
      text(c[1], cx + 12, cy + 37, { weight: 800, size: 14.5, mono: true });
      text(c[2], cx + 12, cy + 49, { size: 9.5, color: RPT.muted });
    });
    y += cellH * 2 + gap;

    /* ---------------- helper bagian ---------------- */
    const sectionHead = (label) => {
      y += 30;
      if (ctx) {
        ctx.beginPath();
        ctx.arc(PAD + 4, y - 4, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = RPT.accent;
        ctx.fill();
      }
      text(label.toUpperCase(), PAD + 16, y, { weight: 800, size: 10.5, color: '#334155' });
      y += 8;
      line(PAD, W - PAD, y, RPT.line, 1);
      y += 8;
    };
    const row = (label, value, o = {}) => {
      y += 22;
      const lw2 = measure(label, { weight: o.bold ? 700 : 400, size: 12.5 });
      const vw = measure(value, { weight: 800, size: 13, mono: true });
      line(PAD + lw2 + 10, W - PAD - vw - 10, y - 3, '#d3dce6', 1, [1.5, 3.5]);
      text(label, PAD + 2, y, { weight: o.bold ? 700 : 400, size: 12.5, color: o.bold ? RPT.ink : RPT.soft });
      text(value, W - PAD - 2, y, { weight: 800, size: 13, mono: true, align: 'right', color: o.color || RPT.ink });
    };
    const listRow = (i, name, meta, value) => {
      y += 22;
      text((i + 1) + '.', PAD + 2, y, { size: 12, color: RPT.muted });
      const nx = PAD + 24;
      text(name, nx, y, { weight: 700, size: 12.5 });
      const vw = measure(value, { weight: 800, size: 12.5, mono: true });
      text(value, W - PAD - 2, y, { weight: 800, size: 12.5, mono: true, align: 'right' });
      const mw = meta ? measure(meta, { size: 11 }) : 0;
      if (meta) text(meta, W - PAD - vw - 14, y, { size: 11, color: RPT.muted, align: 'right' });
      line(nx + measure(name, { weight: 700, size: 12.5 }) + 10, W - PAD - vw - (meta ? mw + 22 : 12), y - 3, '#d3dce6', 1, [1.5, 3.5]);
    };

    if (m.methods.length) {
      sectionHead('Metode bayar');
      m.methods.forEach(x => row(x.name, rp(x.total) + ' · ' + x.n + '×'));
    }
    if (m.units.length) {
      sectionHead('PS paling sering dimainkan');
      m.units.slice(0, 4).forEach((u, i) => listRow(i, u.name, u.sesi + '× · ' + durShort(u.menit), rp(u.omset)));
    }
    if (m.prods.length) {
      sectionHead('Produk terlaris');
      m.prods.slice(0, 4).forEach((p2, i) => listRow(i, p2.name, p2.qty + '×', rp(p2.omset)));
    }

    /* ---------------- catatan kas ---------------- */
    sectionHead('Catatan kas');
    const c = m.cash;
    const inner = 14, rowH = 23;
    const kasRows = [
      ['Kas masuk (tunai)', rp(c.masuk)],
      ['Modal awal', rp(c.modal)],
      ['Pengeluaran', '−' + rp(c.keluar)]
    ];
    const noteLines = c.cb.note ? wrap(c.cb.note, CW - inner * 2, { size: 11 }) : [];
    const bandH = 34;
    const boxH = inner + kasRows.length * rowH + 8 + bandH + (c.counted ? rowH + 4 : 0) + (noteLines.length ? 8 + noteLines.length * 15 : 0) + inner;
    rrect(PAD, y, CW, boxH, 14, '#ffffff', RPT.line);
    let by = y + inner;
    kasRows.forEach(([k, v]) => {
      by += rowH;
      text(k, PAD + inner, by, { size: 12.5, color: RPT.soft });
      text(v, W - PAD - inner, by, { weight: 800, size: 13, mono: true, align: 'right' });
    });
    by += 8;
    rrect(PAD + 8, by, CW - 16, bandH - 6, 10, RPT.softGreen, RPT.softGreenLine);
    text('Kas seharusnya', PAD + inner, by + 21, { weight: 800, size: 12.5, color: RPT.accentDark });
    text(rp(c.seharusnya), W - PAD - inner, by + 22, { weight: 800, size: 15, mono: true, align: 'right', color: RPT.accentDark });
    by += bandH;
    if (c.counted) {
      const ok = c.selisih === 0;
      const col = ok ? RPT.accentDark : (c.selisih > 0 ? '#b45309' : '#b91c1c');
      by += rowH;
      text('Selisih kas', PAD + inner, by, { size: 12.5, color: RPT.soft });
      text(rp(c.selisih) + (ok ? ' · cocok' : (c.selisih > 0 ? ' · lebih' : ' · kurang')), W - PAD - inner, by, { weight: 800, size: 13, mono: true, align: 'right', color: col });
    }
    if (noteLines.length) {
      by += 18;
      noteLines.forEach((ln, i) => text(ln, PAD + inner, by + i * 15, { size: 11, color: RPT.muted }));
    }
    y += boxH;

    /* ---------------- footer + tanda tangan ---------------- */
    y += 16;
    line(PAD, W - PAD, y, RPT.line, 1);
    y += 18;
    text('Dicetak ' + fmtDate(Date.now()) + ' · ' + fmtHM(Date.now()), PAD + 2, y, { size: 10.5, color: RPT.muted });
    text('Hormat kami,', W - PAD - 2, y, { size: 11.5, color: RPT.soft, align: 'right' });
    line(W - PAD - 170, W - PAD - 2, y + 36, '#c4cfdb', 1, [2, 3]);
    text(signName, W - PAD - 2, y + 54, { weight: 800, size: 12, align: 'right' });
    y += 66;
    return y + PAD;
  }

  async function reportCanvas() {
    const cfg = S();
    ui._reportLogo = cfg.logo && cfg.logoReceipt !== false ? await loadImage(cfg.logo) : null;
    const h = Math.ceil(paintReport(null));
    const scale = 2;
    const cv = document.createElement('canvas');
    cv.width = RPT.W * scale;
    cv.height = Math.max(1, h * scale);
    const ctx = cv.getContext('2d');
    if (!ctx) return cv;
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, RPT.W, h);
    ctx.textBaseline = 'alphabetic';
    paintReport(ctx);
    return cv;
  }

  const canvasBlob = cv => new Promise(res => cv.toBlob(res, 'image/png'));

  async function openReportPreview(previewOnly) {
    const cv = await reportCanvas();
    ui.reportImg = cv.toDataURL('image/png');
    const m = reportModel();
    openSheet({
      kind: 'rep-img',
      title: 'Gambar Laporan',
      sub: m.P.sub + ' · ' + m.P.label,
      body: `
        <div class="rep-preview"><img src="${ui.reportImg}" alt="Gambar laporan"></div>
        <div class="hint">PNG siap kirim WhatsApp / simpan. Tampilan sama dengan versi cetak.</div>`,
      foot: `<button class="btn btn-ghost" data-action="rep-dl">${icon('download')} Unduh</button>
             <button class="btn btn-primary wide" data-action="rep-wa">${icon('wa')} Kirim WA</button>`
    });
    return cv;
  }

  function downloadReportImage() {
    if (!ui.reportImg) return;
    const a = document.createElement('a');
    a.href = ui.reportImg;
    a.download = 'laporan-' + dayKey(Date.now()) + '.png';
    a.click();
    toast('Gambar laporan diunduh', 'ok');
  }

  async function shareReportImage(toPhone) {
    const m = reportModel();
    const cv = await reportCanvas();
    const blob = await canvasBlob(cv);
    const name = 'laporan-' + dayKey(Date.now()) + '.png';
    const caption = 'Laporan ' + m.P.sub + ' ' + m.P.label + '\nOmset ' + rp(m.omset) + ' · ' + m.tx.length + ' transaksi';
    let file = null;
    try { file = new File([blob], name, { type: 'image/png' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Laporan ' + m.P.label, text: caption });
        return;
      } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    if (blob) downloadBlob(blob, name);
    openWa(caption + '\n\n(gambar laporan terlampir)', toPhone);
    toast(toPhone ? 'Gambar laporan diunduh — kirim ke ' + normPhone(toPhone) : 'Gambar laporan diunduh');
  }

  /* versi cetak: tata letak sama dengan gambar (kartu, garis, tabel) */
  function reportHTML() {
    const { m, cfg, signName, itemsSold, title } = reportMeta();
    const row = (k, v, cls) => `<div class="rpt-row ${cls || ''}"><span class="l">${k}</span><span class="d"></span><span class="v">${v}</span></div>`;
    const listRow = (i, name, meta, value) => `<div class="rpt-row rlist">
        <span class="i">${i + 1}.</span><span class="n">${esc(name)}</span><span class="m">${meta}</span><span class="v">${value}</span></div>`;
    const c = m.cash;
    const okSel = c.selisih === 0;
    return `
      <div class="rpt">
        <header class="rpt-head">
          <div class="rpt-brand">
            ${cfg.logo && cfg.logoReceipt !== false ? `<img class="rpt-logo" src="${esc(cfg.logo)}" alt="">` : ''}
            <div class="rpt-id">
              <h1>${esc(cfg.storeName || 'PS RENT')}</h1>
              ${cfg.tagline ? `<p>${esc(cfg.tagline)}</p>` : ''}
              ${cfg.address ? `<p>${esc(cfg.address)}</p>` : ''}
              ${cfg.phone ? `<p>Telp/WA ${esc(cfg.phone)}</p>` : ''}
            </div>
          </div>
          <div class="rpt-when">
            <span class="rpt-pill">${title}</span>
            <div class="rpt-sub">${esc(m.P.sub)}</div>
            <div class="rpt-date">${esc(m.P.label)}</div>
          </div>
        </header>
        <div class="rpt-rule"></div>

        <section class="rpt-omset">
          <div>
            <div class="k">OMSET PERIODE</div>
            <div class="s">${m.tx.length} transaksi · rata-rata ${rp(m.avg)}</div>
          </div>
          <div class="val">${rp(m.omset)}</div>
        </section>

        <div class="rpt-grid">
          <div class="cell"><div class="k">SEWA UNIT</div><div class="v">${rp(m.sewa)}</div><div class="s">${m.sesi} sesi selesai</div></div>
          <div class="cell"><div class="k">KANTIN KITA</div><div class="v">${rp(m.minibar)}</div><div class="s">${itemsSold} item terjual</div></div>
          <div class="cell"><div class="k">DURASI MAIN</div><div class="v">${durShort(m.menit)}</div><div class="s">${m.sesi ? Math.round(m.menit / m.sesi) + ' mnt / sesi' : '—'}</div></div>
          <div class="cell"><div class="k">DISKON</div><div class="v">${rp(m.diskon)}</div><div class="s">dari ${rp(m.omset + m.diskon)}</div></div>
        </div>

        ${m.methods.length ? `<section class="rpt-sec"><h2>Metode bayar</h2>
          ${m.methods.map(x => row(esc(x.name), rp(x.total) + ' · ' + x.n + '×')).join('')}</section>` : ''}

        ${m.units.length ? `<section class="rpt-sec"><h2>PS paling sering dimainkan</h2>
          ${m.units.slice(0, 4).map((u, i) => listRow(i, u.name, u.sesi + '× · ' + durShort(u.menit), rp(u.omset))).join('')}</section>` : ''}

        ${m.prods.length ? `<section class="rpt-sec"><h2>Produk terlaris</h2>
          ${m.prods.slice(0, 4).map((p2, i) => listRow(i, p2.name, p2.qty + '×', rp(p2.omset))).join('')}</section>` : ''}

        <section class="rpt-sec"><h2>Catatan kas</h2>
          <div class="rpt-kas">
            ${row('Kas masuk (tunai)', rp(c.masuk))}
            ${row('Modal awal', rp(c.modal))}
            ${row('Pengeluaran', '−' + rp(c.keluar))}
            <div class="rpt-band"><span>Kas seharusnya</span><b>${rp(c.seharusnya)}</b></div>
            ${c.counted ? `<div class="rpt-row"><span class="l">Selisih kas</span><span class="d"></span>
              <span class="v ${okSel ? 'ok' : (c.selisih > 0 ? 'warn' : 'bad')}">${rp(c.selisih)} · ${okSel ? 'cocok' : (c.selisih > 0 ? 'lebih' : 'kurang')}</span></div>` : ''}
            ${c.cb.note ? `<p class="rpt-note">${esc(c.cb.note)}</p>` : ''}
          </div>
        </section>

        <footer class="rpt-foot">
          <div class="rpt-print">
            <div>Dicetak ${fmtDate(Date.now())} · ${fmtHM(Date.now())}</div>
          </div>
          <div class="rpt-sign">
            <div>Hormat kami,</div>
            <div class="line"></div>
            <div class="name">${esc(signName)}</div>
          </div>
        </footer>
      </div>`;
  }

  const REPORT_PAPER = {
    A4: { mm: 10, zoom: 1 },
    A5: { mm: 8, zoom: 0.68 },
    A3: { mm: 12, zoom: 1.42 }
  };

  function printWithStyle(html, pageCss) {
    const prev = document.getElementById('print-page-style');
    if (prev) prev.remove();
    const area = $('#print-area');
    area.innerHTML = html;
    const st = document.createElement('style');
    st.id = 'print-page-style';
    st.textContent = pageCss;
    document.head.appendChild(st);
    const cleanup = () => {
      const el = document.getElementById('print-page-style');
      if (el) el.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    try { window.print(); } catch (e) {
      cleanup();
      toast('Browser memblokir cetak. Buka aplikasi di tab baru.', 'err');
    }
  }

  function printReport() {
    const paper = REPORT_PAPER[S().reportPaper] ? S().reportPaper : 'A4';
    const cfg = REPORT_PAPER[paper];
    printWithStyle(reportHTML(),
      '@page{size:' + paper + ' portrait;margin:' + cfg.mm + 'mm}' +
      '#print-area .rpt{max-width:none;zoom:' + cfg.zoom + ';margin:0}');
  }

  function reportSummaryText() {
    const P = periodRange(ui.rep.mode, ui.rep.anchor);
    const tx = repTx();
    const omset = tx.reduce((a, t) => a + t.total, 0);
    const sewa = tx.reduce((a, t) => a + (t.play || 0), 0);
    const minibar = tx.reduce((a, t) => a + (t.itemsTotal || 0), 0);
    const menit = tx.reduce((a, t) => a + (t.minutes || 0), 0);
    const units = stationRank(tx);
    const prods = productRank(tx).slice(0, 3);
    const L = [];
    L.push('*' + (S().storeName || 'PS RENT') + '*');
    L.push(P.sub + ': *' + P.label + '*');
    L.push('--------------------------------');
    L.push('Omset      : ' + rp(omset));
    L.push('Transaksi  : ' + tx.length);
    L.push('Sewa unit  : ' + rp(sewa));
    L.push('Kantin     : ' + rp(minibar));
    L.push('Durasi main: ' + Math.floor(menit / 60) + ' jam ' + (menit % 60) + ' mnt');
    if (units.length) {
      L.push('--------------------------------');
      L.push('*PS paling sering dimainkan*');
      units.slice(0, 3).forEach((u, i) => L.push((i + 1) + '. ' + u.name + ' — ' + fmtMin(u.menit) + ' (' + u.sesi + '×)'));
    }
    if (prods.length) {
      L.push('--------------------------------');
      L.push('*Produk terlaris*');
      prods.forEach((p, i) => L.push((i + 1) + '. ' + p.name + ' — ' + p.qty + '×'));
    }
    const c = cashSummary(tx);
    if (c.modal || c.keluar || c.counted || c.cb.note) {
      L.push('--------------------------------');
      L.push('*Catatan Kas*');
      L.push('Kas tunai   : ' + rp(c.masuk));
      if (c.modal) L.push('Modal awal  : ' + rp(c.modal));
      if (c.keluar) L.push('Pengeluaran : ' + rp(c.keluar));
      L.push('Seharusnya  : ' + rp(c.seharusnya));
      if (c.counted) L.push('Dihitung    : ' + rp(c.counted) + ' (selisih ' + rp(c.selisih) + ')');
      if (c.cb.note) L.push('Catatan     : ' + c.cb.note);
    }
    L.push('--------------------------------');
    L.push('Dikirim dari ' + APP.name);
    return L.join('\n');
  }

  /* ------------------------------ QR generator --------------------------- */
  const QRGen = (() => {
    const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
    (() => {
      let x = 1;
      for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
      for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
    })();
    const mul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];
    const polyMul = (a, b) => {
      const out = new Array(a.length + b.length - 1).fill(0);
      for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] ^= mul(a[i], b[j]);
      return out;
    };
    const genPoly = deg => { let g = [1]; for (let i = 0; i < deg; i++) g = polyMul(g, [1, EXP[i]]); return g; };
    const rsEC = (data, ecLen) => {
      const g = genPoly(ecLen);
      const buf = data.concat(new Array(ecLen).fill(0));
      for (let i = 0; i < data.length; i++) {
        const coef = buf[i];
        if (coef) for (let j = 0; j < g.length; j++) buf[i + j] ^= mul(g[j], coef);
      }
      return buf.slice(data.length);
    };
    // EC level M
    const VER = {
      1: [10, [[1, 16]]], 2: [16, [[1, 28]]], 3: [26, [[1, 44]]], 4: [18, [[2, 32]]],
      5: [24, [[2, 43]]], 6: [16, [[4, 27]]], 7: [18, [[4, 31]]],
      8: [22, [[2, 38], [2, 39]]], 9: [22, [[3, 36], [2, 37]]],
      10: [26, [[4, 43], [1, 44]]], 11: [30, [[1, 50], [4, 51]]], 12: [24, [[6, 36], [2, 37]]]
    };
    const ALIGN = {
      1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
      7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46],
      10: [6, 28, 50], 11: [6, 30, 54], 12: [6, 32, 58]
    };
    const MAXV = 11;
    const dataCodewords = v => VER[v][1].reduce((a, g) => a + g[0] * g[1], 0);

    const bch = (data, poly, bits) => {
      let d = data << (bits - 1);
      const top = 1 << (bits + (poly.toString(2).length - 1) - 1);
      while (d.toString(2).length >= poly.toString(2).length) {
        d ^= poly << (d.toString(2).length - poly.toString(2).length);
      }
      return (data << (bits - 1)) | d;
    };

    const maskFn = (mask, i, j) => {
      switch (mask) {
        case 0: return (i + j) % 2 === 0;
        case 1: return i % 2 === 0;
        case 2: return j % 3 === 0;
        case 3: return (i + j) % 3 === 0;
        case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
        case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
        default: return (((i + j) % 2) + ((i * j) % 3)) % 2 === 0;
      }
    };

    function encode(text, forceMask) {
      const bytes = Array.from(new TextEncoder().encode(String(text)));
      if (!bytes.length) bytes.push(32);
      let version = 0;
      for (let v = 1; v <= MAXV; v++) {
        const lenBits = v < 10 ? 8 : 16;
        if (4 + lenBits + bytes.length * 8 <= dataCodewords(v) * 8) { version = v; break; }
      }
      if (!version) throw new Error('Teks QR terlalu panjang (' + bytes.length + ' byte)');
      const cap = dataCodewords(version) * 8;
      const bits = [];
      const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
      push(0b0100, 4);
      push(bytes.length, version < 10 ? 8 : 16);
      bytes.forEach(b => push(b, 8));
      push(0, Math.min(4, cap - bits.length));
      while (bits.length % 8 !== 0) bits.push(0);
      const pads = [0xEC, 0x11];
      let pi = 0;
      while (bits.length < cap) { push(pads[pi++ % 2], 8); }
      const cw = [];
      for (let i = 0; i < bits.length; i += 8) {
        let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
        cw.push(b);
      }
      // blok + EC
      const [ecLen, groups] = VER[version];
      const blocks = [];
      let off = 0;
      groups.forEach(([n, d]) => { for (let i = 0; i < n; i++) { blocks.push(cw.slice(off, off + d)); off += d; } });
      const ecBlocks = blocks.map(b => rsEC(b, ecLen));
      const inter = [];
      const maxD = Math.max(...blocks.map(b => b.length));
      for (let i = 0; i < maxD; i++) blocks.forEach(b => { if (i < b.length) inter.push(b[i]); });
      for (let i = 0; i < ecLen; i++) ecBlocks.forEach(b => inter.push(b[i]));

      const size = 17 + 4 * version;
      const makeBase = () => {
        const m = [], fn = [];
        for (let i = 0; i < size; i++) { m.push(new Array(size).fill(null)); fn.push(new Array(size).fill(false)); }
        const setF = (r, c, v) => { if (r < 0 || c < 0 || r >= size || c >= size) return; m[r][c] = v; fn[r][c] = true; };
        const finder = (r0, c0) => {
          for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
            const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6;
            const dark = inside && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
            setF(r0 + r, c0 + c, dark);
          }
        };
        finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
        for (let i = 8; i < size - 8; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
        const al = ALIGN[version];
        al.forEach(r0 => al.forEach(c0 => {
          const nearFinder = (r0 <= 8 && c0 <= 8) || (r0 <= 8 && c0 >= size - 9) || (r0 >= size - 9 && c0 <= 8);
          if (nearFinder) return;
          for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) {
            setF(r0 + r, c0 + c, Math.max(Math.abs(r), Math.abs(c)) !== 1);
          }
        }));
        // reservasi area format (jangan menimpa timing pattern di baris/kolom 6)
        for (let i = 0; i < 9; i++) { if (i !== 6) { setF(8, i, false); setF(i, 8, false); } }
        for (let i = 0; i < 8; i++) { setF(8, size - 1 - i, false); setF(size - 1 - i, 8, false); }
        setF(size - 8, 8, true);
        // info versi (v>=7)
        if (version >= 7) {
          let d = version;
          let rem = version;
          for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
          const bitsV = (version << 12) | rem;
          for (let i = 0; i < 18; i++) {
            const mod = ((bitsV >>> i) & 1) === 1;
            setF(Math.floor(i / 3), i % 3 + size - 8 - 3, mod);
            setF(i % 3 + size - 8 - 3, Math.floor(i / 3), mod);
          }
        }
        return { m, fn };
      };

      const writeFormat = (m, mask) => {
        const data = (0b00 << 3) | mask; // level M
        let rem = data;
        for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
        const bitsF = ((data << 10) | rem) ^ 0x5412;
        const bit = i => ((bitsF >>> i) & 1) === 1;
        for (let i = 0; i < 15; i++) {
          const mod = bit(i);
          if (i < 6) m[i][8] = mod;
          else if (i < 8) m[i + 1][8] = mod;
          else m[size - 15 + i][8] = mod;
        }
        for (let i = 0; i < 15; i++) {
          const mod = bit(i);
          if (i < 8) m[8][size - i - 1] = mod;
          else if (i < 9) m[8][15 - i - 1 + 1] = mod;
          else m[8][15 - i - 1] = mod;
        }
        m[size - 8][8] = true;
      };

      const placeData = (m, mask) => {
        let inc = -1, row = size - 1, bitIndex = 7, byteIndex = 0;
        for (let col = size - 1; col > 0; col -= 2) {
          if (col === 6) col--;
          for (;;) {
            for (let c = 0; c < 2; c++) {
              if (m[row][col - c] === null) {
                let dark = false;
                if (byteIndex < inter.length) dark = ((inter[byteIndex] >>> bitIndex) & 1) === 1;
                if (maskFn(mask, row, col - c)) dark = !dark;
                m[row][col - c] = dark;
                bitIndex--;
                if (bitIndex === -1) { byteIndex++; bitIndex = 7; }
              }
            }
            row += inc;
            if (row < 0 || row >= size) { row -= inc; inc = -inc; break; }
          }
        }
      };

      const penalty = m => {
        let p = 0;
        const run = arr => {
          let score = 0, count = 1;
          for (let i = 1; i < arr.length; i++) {
            if (arr[i] === arr[i - 1]) count++;
            else { if (count >= 5) score += 3 + (count - 5); count = 1; }
          }
          if (count >= 5) score += 3 + (count - 5);
          return score;
        };
        for (let r = 0; r < size; r++) p += run(m[r]);
        for (let c = 0; c < size; c++) p += run(m.map(row => row[c]));
        for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) {
          const v = m[r][c];
          if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) p += 3;
        }
        let dark = 0;
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (m[r][c]) dark++;
        const ratio = Math.abs((dark * 100) / (size * size) - 50);
        p += Math.floor(ratio / 5) * 10;
        return p;
      };

      let best = null, bestScore = Infinity, bestMask = 0;
      const masks = (forceMask == null) ? [0,1,2,3,4,5,6,7] : [forceMask];
      for (const mask of masks) {
        const { m } = makeBase();
        placeData(m, mask);
        writeFormat(m, mask);
        const sc = penalty(m);
        if (sc < bestScore) { bestScore = sc; best = m; bestMask = mask; }
      }
      return { size, modules: best.map(r => r.map(v => !!v)), mask: bestMask, version };
    }

    function svg(text, px, opts = {}) {
      const { size, modules } = encode(text, opts.mask);
      const quiet = opts.quiet == null ? 4 : opts.quiet;
      const total = size + quiet * 2;
      const dim = px || 200;
      let d = '';
      modules.forEach((row, r) => row.forEach((v, c) => { if (v) d += `M${c + quiet} ${r + quiet}h1v1h-1z`; }));
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="QR"><rect width="${total}" height="${total}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
    }

    function drawTo(ctx, text, x, y, px) {
      const { size, modules } = encode(text);
      const quiet = 4;                                  // quiet zone standar 4 modul
      const total = size + quiet * 2;
      const cell = Math.max(1, Math.floor(px / total)); // ukuran modul bulat → tajam
      const dim = cell * total;
      const ox = Math.round(x + (px - dim) / 2);
      const oy = Math.round(y + (px - dim) / 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, px, px);
      ctx.fillStyle = '#000';
      modules.forEach((row, r) => row.forEach((v, c) => {
        if (!v) return;
        ctx.fillRect(ox + (c + quiet) * cell, oy + (r + quiet) * cell, cell, cell);
      }));
    }

    return { encode, svg, drawTo };
  })();

  /* ------------------------------- pelanggan ----------------------------- */
  const custById = id => state.customers.find(c => c.id === id) || null;
  const normPhone = p => String(p || '').replace(/\D/g, '').replace(/^62/, '0').replace(/^8/, '08');
  const waPhone = p => {
    const d = String(p || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.startsWith('62')) return d;
    if (d.startsWith('0')) return '62' + d.slice(1);
    if (d.startsWith('8')) return '62' + d;
    return d;
  };
  const custDisplayPhone = p => normPhone(p);

  function findCustomer(name, phone) {
    const ph = normPhone(phone);
    if (ph.length >= 6) {
      const byPhone = state.customers.find(c => normPhone(c.phone) === ph);
      if (byPhone) return byPhone;
    }
    const nm = String(name || '').trim().toLowerCase();
    if (nm) {
      const byName = state.customers.find(c => String(c.name || '').trim().toLowerCase() === nm);
      if (byName) return byName;
    }
    return null;
  }

  // daftarkan pelanggan otomatis (dipakai saat sesi/pembelian selesai)
  function upsertCustomer(name, phone) {
    const nm = String(name || '').trim();
    const ph = String(phone || '').trim();
    if (!nm && !ph) return null;
    let c = findCustomer(nm, ph);
    if (!c) {
      c = { id: uid('cus'), name: nm || ph, phone: ph, note: '', createdAt: Date.now() };
      state.customers.push(c);
    } else {
      if (nm && !c.name) c.name = nm;
      if (ph && !c.phone) c.phone = ph;
    }
    return c;
  }

  function custTx(c) {
    if (!c) return [];
    const ph = normPhone(c.phone);
    return state.transactions.filter(t => t.customerId === c.id ||
      (!t.customerId && c.name && String(t.customer || '').trim().toLowerCase() === String(c.name).trim().toLowerCase()) ||
      (ph && t.customerPhone && normPhone(t.customerPhone) === ph));
  }

  function custStats(c) {
    const tx = custTx(c);
    const spend = tx.reduce((a, t) => a + (t.total || 0), 0);
    const minutes = tx.reduce((a, t) => a + (t.minutes || 0), 0);
    const last = tx.reduce((a, t) => Math.max(a, t.createdAt || 0), 0);
    return { tx, count: tx.length, spend, minutes, last };
  }

  function lastReceiptOf(c) {
    const st = custStats(c);
    return st.tx.length ? st.tx.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0] : null;
  }

  // sambungkan transaksi lama (yang hanya menyimpan nama) ke daftar pelanggan
  function linkCustomers() {
    state.transactions.forEach(t => {
      const nm = String(t.customer || '').trim();
      const ph = String(t.customerPhone || '').trim();
      if (!nm && !ph) return;
      if (t.customerId && custById(t.customerId)) {
        const c = custById(t.customerId);
        if (!c.phone && ph) c.phone = ph;
        return;
      }
      const c = upsertCustomer(nm, ph);
      if (c) { t.customerId = c.id; t.customer = t.customer || c.name; }
    });
  }

  /* ------------------------------ pengeluaran kas ------------------------ */
  function openExpenseSheet(id) {
    const exp = id ? (cashBookRead().expenses.find(e => e.id === id) || null) : null;
    ui.editExpense = exp ? exp.id : '';
    openSheet({
      kind: 'expense',
      title: exp ? 'Ubah Pengeluaran' : 'Catat Pengeluaran',
      sub: exp ? 'Perbaiki nominal/keterangan yang salah' : periodRange(ui.rep.mode, ui.rep.anchor).label,
      body: `
        <div class="field"><label class="lbl">Keterangan</label>
          <input class="input" id="cb-label" placeholder="mis. beli minuman, bayar listrik, gaji" value="${exp ? esc(exp.label) : ''}"></div>
        <div class="field"><label class="lbl">Jumlah (Rp)</label>
          <input class="input input-num" id="cb-amount" type="number" inputmode="numeric" min="0" step="1000" placeholder="0" value="${exp ? exp.amount : ''}"></div>
        <div class="chips">
          ${[10000, 20000, 50000, 100000].map(v => `<button class="chip" data-action="cb-amt" data-id="${v}">${rp(v)}</button>`).join('')}
        </div>
        <div class="hint" style="margin-top:10px">Pengeluaran mengurangi kas seharusnya pada periode ini. Nominal bisa diubah kapan saja.</div>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-primary wide" data-action="cb-save">${icon('check')} ${exp ? 'Simpan Perubahan' : 'Simpan'}</button>`
    });
  }

  function saveExpense() {
    const label = ($('#cb-label').value || '').trim();
    const amount = clamp(num($('#cb-amount').value), 0, 1e12);
    if (!label) return toast('Keterangan wajib diisi', 'err');
    if (amount <= 0) return toast('Jumlah harus lebih dari 0', 'err');
    const cb = cashBook();
    const target = ui.editExpense ? cb.expenses.find(e => e.id === ui.editExpense) : null;
    if (target) {
      target.label = label;
      target.amount = amount;
      target.editedAt = Date.now();
      save(); ui.editExpense = ''; closeSheet(); render();
      return toast('Pengeluaran diperbarui jadi ' + rp(amount), 'ok');
    }
    cb.expenses.push({ id: uid('exp'), label, amount, createdAt: Date.now() });
    save(); ui.editExpense = ''; closeSheet(); render(); toast('Pengeluaran ' + rp(amount) + ' dicatat', 'ok');
  }

  // ubah modal awal / uang fisik langsung dari baris rekap (tanpa input manual)
  function adjustCash(field) {
    const cb = cashBook();
    const cur = field === 'modal' ? (Number(cb.modal) || 0) : (Number(cb.counted) || 0);
    const label = field === 'modal' ? 'Modal awal' : 'Uang fisik dihitung';
    openSheet({
      kind: 'expense',
      title: 'Ubah ' + label,
      sub: periodRange(ui.rep.mode, ui.rep.anchor).label,
      body: `
        <div class="field"><label class="lbl">${label} (Rp)</label>
          <input class="input input-num" id="cash-fix" type="number" inputmode="numeric" min="0" step="1000" placeholder="0" value="${cur || ''}"></div>
        <div class="chips">
          ${[50000, 100000, 200000, 500000].map(v => `<button class="chip" data-action="cash-fix-amt" data-id="${v}">${rp(v)}</button>`).join('')}
        </div>
        <div class="hint" style="margin-top:10px">Kosongkan lalu simpan bila ingin menghapus angka ini (dianggap 0).</div>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-primary wide" data-action="cash-fix-save" data-id="${field}">${icon('check')} Simpan</button>`
    });
  }

  function saveCashFix(field) {
    const val = clamp(num($('#cash-fix').value), 0, 1e15);
    const cb = cashBook();
    if (field === 'modal') cb.modal = val; else cb.counted = val;
    save(); closeSheet(); render();
    toast('Kas diperbarui', 'ok');
  }

  /* ------------------------------- TAB 3: PRODUK ------------------------- */
  function viewProduk() {
    const prods = state.products;
    const lowStock = prods.filter(p => p.stock <= 5).length;
    const nilaiStok = prods.reduce((a, p) => a + p.price * p.stock, 0);
    return `
      <div class="stats">
        <div class="stat"><div class="stat-label">Jenis produk</div><div class="stat-value">${prods.length}</div></div>
        <div class="stat"><div class="stat-label">Stok menipis</div><div class="stat-value">${lowStock}</div></div>
        <div class="stat"><div class="stat-label">Nilai stok</div><div class="stat-value accent">${rp(nilaiStok)}</div></div>
      </div>

      <div class="sec-head">
        <div><div class="sec-title"><span class="kantin-strong">Kantin Kita</span> · Produk</div><div class="sec-sub">Ketuk produk untuk edit, foto &amp; stok</div></div>
        <div class="spacer"></div>
        ${can('data') ? `<button class="btn btn-sm btn-ghost" data-action="new-product">${icon('plus')} Produk</button>` : ''}
      </div>

      ${prods.length ? `<div class="prod-grid">
        ${prods.map(p => `
          <button class="prod ${p.stock <= 5 ? 'prod-low' : ''}" ${can('data') ? `data-action="edit-product" data-id="${p.id}"` : 'disabled style="cursor:default"'}>
            <div class="prod-photo">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">` : `<span class="ph">${icon('box')}</span>`}</div>
            <div class="prod-name">${esc(p.name)}</div>
            <div class="prod-price">${rp(p.price)}</div>
            <div class="prod-stock">${p.stock > 0 ? 'Stok ' + p.stock : '⚠ Habis'}${p.category ? ' · ' + esc(p.category) : ''}</div>
          </button>`).join('')}
      </div>` : `<div class="empty"><span class="empty-emoji">📦</span>Belum ada produk. Tambahkan produk jualanmu.</div>`}

      <div class="sec-head"><div><div class="sec-title">Aksi Cepat</div></div></div>
      <div class="list">
        <div class="row kantin-row" data-action="direct-sale">
          <div class="row-main"><div class="row-title">${icon('cart')} <span class="kantin-strong">Kantin Kita</span> (tanpa sewa)</div>
          <div class="row-sub">Untuk pelanggan yang cuma beli minuman / makanan / rokok</div></div>
          <div class="row-end">${icon('plus')}</div>
        </div>
      </div>`;
  }

  /* ------------------------------ TAB 4: SETELAN ------------------------- */
  /* ---------------------------- kartu member (KTP) ----------------------- */
  const CARD = { W: 1016, H: 638 };   // 86 × 54 mm @300dpi

  function memberCode(c) {
    const list = state.customers.slice().sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    const idx = Math.max(0, list.findIndex(x => x.id === c.id));
    return 'M' + String(idx + 1).padStart(4, '0');
  }

  function qrPayload(c) {
    const cfg = S();
    const lines = [
      'KARTU MEMBER ' + (cfg.storeName || 'PS RENT').toUpperCase(),
      c.name || '-',
      'ID ' + memberCode(c),
      'HP ' + (c.phone ? custDisplayPhone(c.phone) : '-')
    ];
    if (cfg.address) lines.push(String(cfg.address).slice(0, 44));
    if (cfg.phone) lines.push('Telp ' + cfg.phone);
    return lines.join('\n');
  }

  async function memberCardCanvas(c) {
    const cfg = S();
    const W = CARD.W, H = CARD.H;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    if (!ctx) return cv;
    const logo = cfg.logo ? await loadImage(cfg.logo) : null;
    const st = custStats(c);
    const GREEN = '#0f9d58', GREEN_D = '#0a7a44', INK = '#0f172a', SOFT = '#5b6b7c';

    // latar putih + sudut membulat
    const round = (x, y, w, h, r) => {
      const rr = Math.min(r, h / 2, w / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    };
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    round(1, 1, W - 2, H - 2, 34);
    ctx.save();
    ctx.clip();
    const g = ctx.createLinearGradient(0, 0, W, 150);
    g.addColorStop(0, '#0b7a45');
    g.addColorStop(1, '#16c46f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 128);
    // lingkaran dekorasi
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(W - 60, -30, 150, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W - 200, 150, 90, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // logo + nama toko
    if (logo) {
      const s2 = Math.min(84 / (logo.width || 84), 84 / (logo.height || 84), 1);
      const lw = Math.round((logo.width || 84) * s2), lh = Math.round((logo.height || 84) * s2);
      ctx.fillStyle = '#ffffff';
      round(34, 22, 84, 84, 20); ctx.fill();
      ctx.save(); round(34, 22, 84, 84, 20); ctx.clip();
      ctx.drawImage(logo, 34 + (84 - lw) / 2, 22 + (84 - lh) / 2, lw, lh);
      ctx.restore();
    }
    const tx = logo ? 138 : 40;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '800 40px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.fillText(cfg.storeName || 'PS RENT', tx, 66);
    ctx.font = '600 21px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.globalAlpha = 0.9;
    ctx.fillText('Kartu Member Pelanggan', tx, 98);
    ctx.globalAlpha = 1;
    // pil KARTU MEMBER
    const pill = 'KARTU MEMBER';
    ctx.font = '800 17px ui-monospace, Menlo, Consolas, monospace';
    const pw = ctx.measureText(pill).width + 32;
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    round(W - 40 - pw, 48, pw, 34, 17); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(pill, W - 40 - pw + 16, 71);

    // isi kiri
    let y = 186;
    const label = (t, yy) => {
      ctx.fillStyle = '#8a97a6';
      ctx.font = '800 15px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.fillText(t, 40, yy);
    };
    label('NAMA PELANGGAN', y);
    y += 42;
    ctx.fillStyle = INK;
    ctx.font = '800 44px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    let name = String(c.name || 'Tanpa nama');
    while (ctx.measureText(name).width > 590 && name.length > 4) name = name.slice(0, -2);
    if (name !== c.name && String(c.name || '').length > 3) name = name.slice(0, -1) + '…';
    ctx.fillText(name, 40, y);
    y += 46;
    const rows = [
      ['NO. ANGGOTA', memberCode(c)],
      ['NO. HP', c.phone ? custDisplayPhone(c.phone) : '—'],
      ['BERGABUNG', fmtDate(c.createdAt || Date.now())],
      ['KUNJUNGAN', st.count ? st.count + '× · terakhir ' + fmtDate(st.last) : 'belum ada']
    ];
    rows.forEach(([k, v]) => {
      ctx.fillStyle = '#8a97a6';
      ctx.font = '700 16px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.fillText(k, 40, y);
      ctx.fillStyle = INK;
      const qrW = 300;
      let fs = 23, maxW = W - 200 - qrW - 80;
      ctx.font = '800 ' + fs + 'px ui-monospace, Menlo, Consolas, monospace';
      while (ctx.measureText(String(v)).width > maxW && fs > 15) {
        fs -= 1;
        ctx.font = '800 ' + fs + 'px ui-monospace, Menlo, Consolas, monospace';
      }
      ctx.fillText(String(v), 200, y + 1);
      y += 42;
    });
    // catatan singkat (tanpa nominal / durasi main)
    ctx.font = '700 19px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    const noteTxt = 'Tunjukkan kartu ini saat datang';
    const nw = ctx.measureText(noteTxt).width + 36;
    const noteY = y + 4;
    ctx.fillStyle = '#eef6f1';
    round(40, noteY, nw, 44, 14); ctx.fill();
    ctx.fillStyle = '#3f5a4c';
    ctx.fillText(noteTxt, 58, noteY + 29);

    // QR kanan
    const qrSize = 300;
    const qx = W - qrSize - 44, qy = 168;
    ctx.fillStyle = '#ffffff';
    round(qx - 14, qy - 14, qrSize + 28, qrSize + 28, 22); ctx.fill();
    ctx.strokeStyle = '#e3e9ef'; ctx.lineWidth = 2; ctx.stroke();
    QRGen.drawTo(ctx, qrPayload(c), qx, qy, qrSize);
    ctx.fillStyle = '#8a97a6';
    ctx.font = '600 15px ui-monospace, Menlo, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Scan data member', qx + qrSize / 2, qy + qrSize + 44);
    ctx.textAlign = 'left';

    // strip bawah: alamat + telpon
    ctx.fillStyle = '#f5f8fa';
    ctx.fillRect(0, H - 62, W, 62);
    ctx.fillStyle = SOFT;
    ctx.font = '600 17px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    const addr = cfg.address || '';
    ctx.fillText(addr.length > 62 ? addr.slice(0, 60) + '…' : addr, 40, H - 24);
    if (cfg.phone) {
      ctx.textAlign = 'right';
      ctx.fillStyle = GREEN_D;
      ctx.font = '800 18px ui-monospace, Menlo, Consolas, monospace';
      ctx.fillText('Telp/WA ' + cfg.phone, W - 40, H - 24);
      ctx.textAlign = 'left';
    }
    return cv;
  }

  function memberCardHTML(c) {
    const cfg = S();
    const st = custStats(c);
    return `
      <div class="mcard">
        <div class="mcard-top">
          ${cfg.logo ? `<img class="mcard-logo" src="${esc(cfg.logo)}" alt="">` : `<div class="mcard-logo ph">${icon('gamepad')}</div>`}
          <div class="mcard-store">
            <div class="mcard-name">${esc(cfg.storeName || 'PS RENT')}</div>
            <div class="mcard-tag">Kartu Member Pelanggan</div>
          </div>
          <div class="mcard-pill">KARTU MEMBER</div>
        </div>
        <div class="mcard-body">
          <div class="mcard-info">
            <div class="mc-lbl">NAMA PELANGGAN</div>
            <div class="mc-cust">${esc(c.name || 'Tanpa nama')}</div>
            <div class="mc-row"><span>NO. ANGGOTA</span><b>${memberCode(c)}</b></div>
            <div class="mc-row"><span>NO. HP</span><b>${c.phone ? esc(custDisplayPhone(c.phone)) : '—'}</b></div>
            <div class="mc-row"><span>BERGABUNG</span><b>${fmtDate(c.createdAt || Date.now())}</b></div>
            <div class="mc-row"><span>KUNJUNGAN</span><b>${st.count ? st.count + '× · ' + fmtDate(st.last) : '—'}</b></div>
            <div class="mc-note">Tunjukkan kartu ini saat datang</div>
          </div>
          <div class="mcard-qr">
            ${QRGen.svg(qrPayload(c), 150)}
            <div class="mc-qr-cap">Scan data member</div>
          </div>
        </div>
        <div class="mcard-foot">
          <span>${esc(cfg.address || '')}</span>
          <span>${cfg.phone ? 'Telp/WA ' + esc(cfg.phone) : ''}</span>
        </div>
      </div>`;
  }

  function openCardSheet(id) {
    const c = custById(id);
    if (!c) return;
    ui.cardImg = '';
    ui.cardId = c.id;
    openSheet({
      kind: 'card',
      title: 'Kartu Member',
      sub: c.name + ' · ' + memberCode(c) + ' · 86 × 54 mm (ukuran KTP)',
      body: `
        <div class="card-preview"><img src="${ui.cardImg}" alt="Kartu member ${esc(c.name)}"></div>
        <div class="hint">Kartu memuat logo toko, alamat, nomor telpon, dan QR berisi data pelanggan. Bisa disimpan sebagai gambar, dikirim ke pelanggan, atau dicetak seukuran KTP.</div>`,
      foot: `<button class="btn btn-ghost" data-action="card-dl">${icon('download')} Unduh</button>
             <button class="btn btn-ghost" data-action="card-print">${icon('print')} Cetak</button>
             <button class="btn btn-primary wide" data-action="card-wa">${icon('wa')} Kirim</button>`
    });
    memberCardCanvas(c).then(cv => {
      ui.cardImg = cv.toDataURL('image/png');
      const img = $('#modal-root .card-preview img');
      if (img && ui.cardId === c.id) img.src = ui.cardImg;
    }).catch(err => console.warn('kartu gagal dirender', err));
  }

  function downloadCardImage() {
    const c = custById(ui.cardId);
    if (!ui.cardImg) return;
    const a = document.createElement('a');
    a.href = ui.cardImg;
    a.download = 'kartu-' + (c ? String(c.name).replace(/[^\w]+/g, '-') : 'member') + '.png';
    a.click();
    toast('Kartu member diunduh', 'ok');
  }

  async function shareCard(id, toPhone) {
    const c = custById(id);
    if (!c) return;
    const cv = await memberCardCanvas(c);
    const blob = await canvasBlob(cv);
    const name = 'kartu-' + (String(c.name).replace(/[^\w]+/g, '-') || 'member') + '.png';
    const caption = 'Kartu member ' + (S().storeName || 'PS Rent') + '\n' + c.name + ' · ' + memberCode(c);
    let file = null;
    try { file = new File([blob], name, { type: 'image/png' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Kartu Member ' + c.name, text: caption });
        return;
      } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    if (blob) downloadBlob(blob, name);
    openWa(caption + '\n\n(gambar kartu terlampir)', toPhone || c.phone);
    toast('Gambar kartu diunduh — kirim ke ' + (c.name || 'pelanggan'));
  }

  function printCards(list) {
    const cards = list.map(c => memberCardHTML(c)).join('');
    printWithStyle(`<div class="mcards">${cards}</div>`,
      '@page{size:A4 portrait;margin:10mm}#print-area .mcards{display:grid;grid-template-columns:repeat(2,86mm);gap:6mm}');
  }

  function custListHTML() {
    const q = (ui.custQuery || '').trim().toLowerCase();
    const qd = q.replace(/\D/g, '');
    const list = state.customers
      .filter(c => !q || String(c.name || '').toLowerCase().includes(q) || (qd.length >= 2 && normPhone(c.phone).includes(qd)))
      .map(c => ({ c, st: custStats(c) }))
      .sort((a, b) => (b.st.last - a.st.last) || String(a.c.name).localeCompare(String(b.c.name)));
    if (!list.length) {
      return `<div class="empty">${q ? 'Tidak ada pelanggan cocok dengan "' + esc(q) + '".' : 'Belum ada pelanggan. Pelanggan otomatis terdaftar saat kamu mengisi nama/no. HP ketika mulai sesi atau setelah mengirim nota.'}</div>`;
    }
    return list.map(({ c, st }) => {
      const initial = (String(c.name || '?').trim()[0] || '?').toUpperCase();
      const lastTxt = st.last ? fmtDate(st.last) : '—';
      return `
        <div class="cust-row">
          <div class="cust-av">${esc(initial)}</div>
          <div class="cust-main">
            <div class="cust-name">${esc(c.name || 'Tanpa nama')}</div>
            ${c.phone ? `<div class="cust-sub">${esc(custDisplayPhone(c.phone))}</div>` : ''}
            <div class="cust-sub2">${st.count}× datang · ${lastTxt}${c.note ? ' · ' + esc(c.note) : ''}</div>
          </div>
          <div class="cust-actions">
            <button class="icon-btn" data-action="cust-card" data-id="${c.id}" aria-label="Kartu member ${esc(c.name)}">${icon('card')}</button>
            <button class="icon-btn" data-action="cust-wa" data-id="${c.id}" aria-label="Kirim nota terakhir ke ${esc(c.name)}">${icon('wa')}</button>
            ${can('data') ? `<button class="icon-btn" data-action="cust-edit" data-id="${c.id}" aria-label="Ubah pelanggan">${icon('edit')}</button>
            <button class="icon-btn" data-action="cust-del" data-id="${c.id}" aria-label="Hapus pelanggan">${icon('trash')}</button>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function viewPelanggan() {
    const total = state.customers.length;
    const withPhone = state.customers.filter(c => c.phone).length;
    const spend = state.customers.reduce((a, c) => a + custStats(c).spend, 0);
    return `
      <div class="sec-head" style="margin-top:8px">
        <div><div class="sec-title">Pelanggan</div>
          <div class="sec-sub">${total} terdaftar · ${withPhone} punya WA</div></div>
        <div class="spacer"></div>
        <button class="btn btn-sm btn-ghost" data-action="cust-cards-all" title="Cetak kartu semua pelanggan">${icon('card')} Kartu</button>
        ${can('data') ? `<button class="btn btn-sm btn-ghost" data-action="cust-add">${icon('plus')} Pelanggan</button>` : ''}
      </div>

      <div class="card" style="padding:14px;margin-bottom:12px">
        <div class="split" style="margin:0">
          <div class="box"><div class="k">Total pelanggan</div><div class="v">${total}</div><div class="s">otomatis dari transaksi</div></div>
          <div class="box"><div class="k">Belanja tercatat</div><div class="v">${rp(spend)}</div><div class="s">semua waktu</div></div>
        </div>
        <div class="field" style="margin:12px 0 0">
          <input class="input" id="cust-search" placeholder="Cari nama atau nomor HP…" value="${esc(ui.custQuery)}" autocomplete="off">
        </div>
        <div class="hint">Pelanggan terdaftar otomatis setiap kali nama/no. HP diisi saat mulai sesi, saat jual di Kantin, atau saat kirim nota ke pelanggan.</div>
      </div>

      <div id="cust-list">${custListHTML()}</div>`;
  }

  function openCustomerSheet(id) {
    const c = id ? custById(id) : null;
    const st = c ? custStats(c) : null;
    openSheet({
      kind: 'cust',
      title: c ? 'Ubah Pelanggan' : 'Pelanggan Baru',
      sub: c ? st.count + '× datang' : 'Catat manual (mis. pelanggan langganan)',
      body: `
        <div class="field"><label class="lbl">Nama pelanggan</label>
          <input class="input" id="c-name" placeholder="mis. Budi" value="${c ? esc(c.name) : ''}" autocomplete="off"></div>
        <div class="field"><label class="lbl">No. HP / WhatsApp</label>
          <input class="input input-num" id="c-phone" type="tel" inputmode="tel" placeholder="0812…" value="${c ? esc(c.phone || '') : ''}"></div>
        <div class="field"><label class="lbl">Catatan (opsional)</label>
          <input class="input" id="c-note" placeholder="mis. langganan Sabtu, suka PS 3" value="${c ? esc(c.note || '') : ''}"></div>
        ${c && st.last ? `<div class="hint">Terakhir datang ${fmtDate(st.last)} ${fmtHM(st.last)}</div>` : ''}
        ${c && st.tx.length ? `<button class="btn btn-sm btn-ghost wide" style="margin-top:10px" data-action="cust-wa" data-id="${c.id}">${icon('wa')} Kirim nota terakhir ke pelanggan</button>` : ''}`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-primary wide" data-action="cust-save" data-id="${c ? c.id : ''}">${icon('check')} Simpan</button>`
    });
  }

  function saveCustomer(id) {
    const name = ($('#c-name').value || '').trim();
    const phone = ($('#c-phone').value || '').trim();
    const note = ($('#c-note').value || '').trim();
    if (!name) return toast('Nama pelanggan wajib diisi', 'err');
    const dup = state.customers.find(c => c.id !== id && normPhone(c.phone) && normPhone(c.phone) === normPhone(phone));
    if (phone && dup) return toast('Nomor itu sudah dipakai ' + dup.name, 'err');
    if (id) {
      const c = custById(id);
      if (!c) return;
      Object.assign(c, { name, phone, note });
      // sinkronkan nama ke transaksi lama
      state.transactions.forEach(t => { if (t.customerId === id) t.customer = name; });
      save(); closeSheet(); render(); toast('Pelanggan diperbarui', 'ok');
    } else {
      const c = upsertCustomer(name, phone);
      if (c) c.note = note;
      save(); closeSheet(); render(); toast('Pelanggan ' + name + ' ditambahkan', 'ok');
    }
  }

  function deleteCustomer(id) {
    const c = custById(id);
    if (!c) return;
    confirmSheet('Hapus pelanggan?', c.name + ' akan dihapus dari daftar. Transaksi lamanya tetap tersimpan.', 'Hapus', () => {
      state.customers = state.customers.filter(x => x.id !== id);
      state.transactions.forEach(t => { if (t.customerId === id) t.customerId = ''; });
      save(); render(); toast('Pelanggan dihapus', 'ok');
    });
  }

  function sendReceiptToCustomer(id) {
    const c = custById(id);
    if (!c) return;
    const tx = lastReceiptOf(c);
    if (!tx) return toast('Belum ada nota untuk pelanggan ini', 'err');
    if (!c.phone) { closeSheet(); openCustomerSheet(id); return toast('Isi nomor HP pelanggan dulu', 'err'); }
    closeSheet();
    shareReceipt(tx, c.phone);
    toast('Nota ' + tx.code + ' dikirim ke ' + c.name, 'ok');
  }

  function viewPengaturan() {
    return isOwner() ? viewPengaturanOwner() : viewPengaturanPenjaga();
  }
  function viewPengaturanOwner() {
    const cfg = S();
    return `
      <div class="sec-head" style="margin-top:8px"><div><div class="sec-title">Tampilan</div>
        <div class="sec-sub">Pilih tema yang paling nyaman dipakai</div></div></div>
      <div class="card" style="padding:14px">
        <div class="seg">
          ${THEMES.map(t => `<button class="${cfg.theme === t.id ? 'active' : ''}" data-action="set-theme" data-id="${t.id}">${icon(t.icon)} ${t.label}</button>`).join('')}
        </div>
        <div class="hint">${cfg.theme === 'gelap'
          ? 'Tema <b>Gelap</b> aktif — tampilan neon khas malam.'
          : 'Tema <b>Cerah</b> aktif — latar putih-hijau muda, lebih nyaman untuk pemakaian lama dan tidak silau.'}</div>
      </div>

      <div class="sec-head"><div><div class="sec-title">Logo Toko</div>
        <div class="sec-sub">Ganti ikon PS di pojok kiri atas</div></div></div>
      <div class="card" style="padding:14px">
        <div class="logo-picker">
          <div class="logo-tile ${cfg.logo ? 'custom' : ''}" id="logo-preview">
            ${cfg.logo ? `<img src="${esc(cfg.logo)}" alt="Logo toko">` : icon('gamepad')}
          </div>
          <div style="flex:1;min-width:0">
            <div class="chips">
              <label class="chip chip-upload">${icon('upload')} Upload logo<input type="file" id="logo-file" accept="image/*" hidden></label>
              ${cfg.logo ? `<button class="chip" data-action="logo-clear">Pakai default</button>` : ''}
            </div>
            <div class="field-row" style="margin-top:9px">
              <input class="input" id="logo-url" placeholder="atau tempel URL logo…" style="padding:9px 11px;font-size:12.5px">
              <button class="btn btn-sm btn-ghost" style="flex:0 0 auto" data-action="logo-url">Pakai</button>
            </div>
          </div>
        </div>
        <div class="hint">Disarankan PNG kotak/transparan, maks 192 px. Logo tampil di header aplikasi (bukan ikon aplikasi saat di-install).</div>
      </div>

      <div class="sec-head"><div><div class="sec-title">Info Toko</div>
        <div class="sec-sub">Nama &amp; tagline di header + struk</div></div></div>
      <div class="card" style="padding:14px">
        <div class="field"><label class="lbl">Nama toko</label>
          <input class="input" data-set="settings.storeName" value="${esc(cfg.storeName)}"></div>
        <div class="field"><label class="lbl">Tagline</label>
          <input class="input" data-set="settings.tagline" value="${esc(cfg.tagline)}"></div>
        <div class="field-row">
          <div class="field"><label class="lbl">Alamat (opsional)</label>
            <input class="input" data-set="settings.address" value="${esc(cfg.address)}"></div>
          <div class="field"><label class="lbl">No. HP / WA</label>
            <input class="input" data-set="settings.phone" value="${esc(cfg.phone)}"></div>
        </div>
        <div class="field" style="margin-bottom:0"><label class="lbl">Footer struk</label>
          <input class="input" data-set="settings.receiptFooter" value="${esc(cfg.receiptFooter)}"></div>
      </div>

      <div class="sec-head"><div><div class="sec-title">Aturan Billing</div>
        <div class="sec-sub">Cara hitung biaya sewa</div></div></div>
      <div class="card" style="padding:14px">
        <div class="field-row">
          <div class="field"><label class="lbl">Minimum (menit)</label>
            <input class="input input-num" type="number" min="0" step="5" data-set="settings.minMinutes" value="${cfg.minMinutes}"></div>
          <div class="field"><label class="lbl">Pembulatan (menit)</label>
            <input class="input input-num" type="number" min="1" step="5" data-set="settings.roundMinutes" value="${cfg.roundMinutes}"></div>
        </div>
        <div class="field"><label class="lbl">Tarif default per jam</label>
          <input class="input input-num" type="number" min="0" step="500" data-set="settings.defaultRate" value="${cfg.defaultRate}">
          <div class="hint">Dipakai saat menambah unit baru.</div></div>
        <div class="bill" style="margin-bottom:0"><div class="bill-line"><span class="k">Contoh</span><span class="v" id="bill-example">${billingExample()}</span></div></div>
      </div>

      <div class="sec-head">
        <div><div class="sec-title">Unit &amp; Tarif</div><div class="sec-sub">${state.stations.length} unit terdaftar</div></div>
        <div class="spacer"></div>
        <button class="btn btn-sm btn-ghost" data-action="new-station">${icon('plus')} Unit</button>
      </div>
      <div class="list">
        ${state.stations.map(st => `
          <div class="row">
            ${st.image
              ? `<img class="row-thumb" src="${esc(st.image)}" alt="" loading="lazy">`
              : `<span class="row-thumb ph">${icon('gamepad')}</span>`}
            <div class="row-main">
              <div class="row-title">${esc(st.name)} <span class="badge">${esc(st.type || 'PS')}</span></div>
              <div class="row-sub">${rp(st.rate)} / jam ${sessionByStation(st.id) ? '· <span style="color:#7ff0c3">sedang dipakai</span>' : ''}</div>
            </div>
            <div class="row-actions">
              <button class="icon-btn" data-action="edit-station" data-id="${st.id}" aria-label="Edit">${icon('edit')}</button>
              <button class="icon-btn" data-action="del-station" data-id="${st.id}" aria-label="Hapus">${icon('trash')}</button>
            </div>
          </div>`).join('') || `<div class="empty">Belum ada unit.</div>`}
      </div>

      <div class="sec-head"><div><div class="sec-title">Printer &amp; Nota</div>
        <div class="sec-sub">Lebar kertas struk &amp; nomor WhatsApp</div></div></div>
      <div class="card" style="padding:14px">
        <label class="lbl">Lebar kertas printer</label>
        <div class="seg">
          <button class="${cfg.paperWidth === '58' ? 'active' : ''}" data-action="set-paper" data-id="58">58 mm</button>
          <button class="${cfg.paperWidth === '80' ? 'active' : ''}" data-action="set-paper" data-id="80">80 mm</button>
        </div>
        <div class="hint">58 mm = printer thermal kecil (default). 80 mm = printer kasir lebar.</div>
        <label class="lbl" style="margin-top:14px">Spasi tepi nota (atas = bawah = kiri = kanan)</label>
        <div class="seg">
          ${[['auto', 'Otomatis'], ['3', '3 mm'], ['4', '4 mm'], ['5', '5 mm'], ['6', '6 mm']]
            .map(([v, l]) => `<button class="${String(cfg.paperPad || 'auto') === v ? 'active' : ''}" data-action="set-pad" data-id="${v}">${l}</button>`).join('')}
        </div>
        <div class="hint">Otomatis = aman untuk printer thermal Epson: <b>5 mm</b> di kertas 58 mm (area cetak 48 mm) dan <b>4 mm</b> di kertas 80 mm (area cetak 72 mm). Keempat sisi selalu sama, jadi teks tidak mepet &amp; tidak terpotong.</div>
        <div class="field" style="margin:14px 0 0"><label class="lbl">Nomor WhatsApp toko (opsional)</label>
          <input class="input input-num" data-set="settings.waNumber" value="${esc(cfg.waNumber)}" placeholder="6281234567890"></div>
        <div class="hint">Dipakai saat mengirim nota lewat WhatsApp. Format 62… tanpa + atau spasi.</div>
        <div class="field" style="margin:14px 0 0"><label class="lbl">Nomor WhatsApp owner (laporan)</label>
          <input class="input input-num" data-set="settings.ownerWa" value="${esc(cfg.ownerWa || '')}" placeholder="6281234567890">
          <div class="hint">Tombol <b>Kirim ke Owner</b> di tab Laporan mengirim gambar laporan kas ke nomor ini. Kosong = pakai nomor toko.</div></div>

        <label class="lbl" style="margin-top:16px">Ukuran kertas laporan</label>
        <div class="seg">
          ${['A4', 'A5', 'A3'].map(k => `<button class="${(cfg.reportPaper || 'A4') === k ? 'active' : ''}" data-action="set-rep-paper" data-id="${k}">${k}</button>`).join('')}
        </div>
        <div class="hint">Dipakai saat mencetak laporan (tombol Cetak di tab Laporan). Margin otomatis: A4 10 mm · A5 8 mm · A3 12 mm.</div>

        <div class="switch-row" style="margin-top:6px">
          <div><div class="txt">Logo di struk</div><div class="sub">${cfg.logo ? 'Pakai logo toko yang aktif · logo berlatar terang paling jelas di kertas thermal' : 'Belum ada logo — lambang bawaan dipakai otomatis'}</div></div>
          <button class="chip ${cfg.logoReceipt !== false ? 'active' : ''}" data-action="toggle-logo-receipt">${cfg.logoReceipt !== false ? 'Aktif' : 'Mati'}</button>
        </div>
        <div class="switch-row">
          <div><div class="txt">Tanda tangan di struk</div><div class="sub">Garis tanda tangan + nama usaha di bawah nota</div></div>
          <button class="chip ${cfg.signReceipt !== false ? 'active' : ''}" data-action="toggle-sign">${cfg.signReceipt !== false ? 'Aktif' : 'Mati'}</button>
        </div>
        <div class="field" style="margin:12px 0 0"><label class="lbl">Nama penanda tangan</label>
          <input class="input" data-set="settings.signName" value="${esc(cfg.signName || '')}" placeholder="${esc(cfg.storeName || 'Nama usaha')}">
          <div class="hint">Kosongkan = otomatis pakai nama toko (${esc(cfg.storeName || 'Nama usaha')}).</div></div>
      </div>

      <div class="sec-head"><div><div class="sec-title">Metode Pembayaran</div></div></div>
      <div class="list">
        ${cfg.methods.map((m, i) => `
          <div class="row">
            <div class="row-main"><div class="row-title">${esc(m)}</div></div>
            <div class="row-actions"><button class="icon-btn" data-action="del-method" data-id="${i}">${icon('trash')}</button></div>
          </div>`).join('')}
        <div class="row">
          <input class="input" id="new-method" placeholder="Tambah metode (mis. GoPay)" style="flex:1">
          <button class="btn btn-sm btn-ghost" data-action="add-method">Tambah</button>
        </div>
      </div>

      <div class="sec-head"><div><div class="sec-title">Aplikasi &amp; Data</div></div></div>
      <div class="card" style="padding:6px 14px">
        <div class="switch-row">
          <div><div class="txt">Install ke layar utama</div><div class="sub">Jalan offline, tanpa buka browser</div></div>
          <button class="btn btn-sm btn-primary" data-action="install">${icon('install')} Install</button>
        </div>
        <div class="switch-row">
          <div><div class="txt">Backup data</div><div class="sub">Unduh file JSON semua transaksi &amp; pengaturan</div></div>
          <button class="btn btn-sm btn-ghost" data-action="backup">${icon('download')}</button>
        </div>
        <div class="switch-row">
          <div><div class="txt">Restore data</div><div class="sub">Pulihkan dari file backup</div></div>
          <label class="btn btn-sm btn-ghost" style="margin:0">${icon('upload')}
            <input type="file" id="restore-file" accept="application/json" hidden>
          </label>
        </div>
        <div class="switch-row">
          <div><div class="txt">Hapus semua data</div><div class="sub">Reset ke data contoh. Tidak bisa dibatalkan.</div></div>
          <button class="btn btn-sm btn-red" data-action="reset-all">${icon('trash')}</button>
        </div>
      </div>

      ${cardLicense()}

      ${cardAccounts()}

      ${cardDrive()}

      ${cardDemo()}

      ${cardAudit()}

      <div class="sec-head"><div><div class="sec-title">Tentang Aplikasi</div>
        <div class="sec-sub">Versi &amp; data aplikasi</div></div></div>
      <div class="card" style="padding:14px">
        <div class="about-box">
          <div class="about-logo">${cfg.logo ? `<img src="${esc(cfg.logo)}" alt="">` : icon('gamepad')}</div>
          <div style="min-width:0">
            <div class="about-name">${APP.name}</div>
            <div class="about-ver">versi ${APP.version}</div>
          </div>
        </div>
        <div class="switch-row" style="border-top:0;padding-top:0">
          <div><div class="txt">Data aplikasi</div><div class="sub">Tersimpan lokal di perangkat ini · ${state.stations.length} unit · ${state.transactions.length} transaksi</div></div>
        </div>
        <div class="about-credit-text">Dikembangkan oleh ${APP.dev}</div>
      </div>

      <div class="app-foot small muted" style="text-align:center;margin:18px 0 6px;line-height:1.7">
        Dikembangkan oleh ${APP.dev} · ${APP.name} v${APP.version}<br>
        data tersimpan lokal di perangkat ini · ${state.sessions.length} sesi aktif
      </div>`;
  }

  /* ============================ perjanjian sewa ========================== */
  const AGR = {
    W: 720, PAD: 32,
    ink: '#0f172a', soft: '#3f4d5c', muted: '#7c8a9a', line: '#e3e9ef',
    accent: '#0f9d58', accentDark: '#0b7a45', softGreen: '#f1fdf6', softGreenLine: '#c2eed6',
    amber: '#b45309', amberSoft: '#fff8ed', panel: '#f8fafc'
  };
  const AGR_ID_TYPES = ['KTP', 'SIM', 'Paspor', 'KTA / Karmas', 'Lainnya'];
  const AGR_COND = [
    { key: 'console', label: 'Konsol + dus' },
    { key: 'power', label: 'Kabel power' },
    { key: 'hdmi', label: 'Kabel HDMI' },
    { key: 'adapter', label: 'Adaptor' },
    { key: 'stick', label: '2 stik / controller' },
    { key: 'game', label: 'Kaset / game' }
  ];
  const AGR_PKGS = [
    { key: '12j', label: '12 jam', hours: 12 },
    { key: '24j', label: '24 jam', hours: 24 },
    { key: 'harian', label: 'Harian', hours: 24 }
  ];

  const agrById = id => state.agreements.find(a => a.id === id) || null;
  const stationDayRate = st => Math.max(0, Math.round((st && (st.dayRate || (st.rate || 0) * 8)) / 500) * 500);

  function agrCode() {
    const d = new Date();
    const key = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
    const n = state.agreements.filter(a => String(a.code || '').includes('-PJ' + key)).length + 1;
    return 'PJ' + key + '-' + pad(n);
  }
  function agrHours(a) {
    if (a.pkg === 'harian') return Math.max(1, a.days || 1) * 24;
    return a.pkg === '12j' ? 12 : 24;
  }
  const agrEnd = a => a.endAt || (a.startAt || Date.now()) + agrHours(a) * 3600e3;
  function agrStatus(a) {
    if (a.returnedAt) return 'done';
    return Date.now() >= agrEnd(a) ? 'late' : 'active';
  }
  function agrLateHours(a) {
    const end = agrEnd(a);
    const at = a.returnedAt || Date.now();
    return at > end ? Math.ceil((at - end) / 3600e3) : 0;
  }
  const agrFine = a => agrLateHours(a) * (a.finePerHour || 0);
  function agrPkgLabel(a) {
    if (a.pkg === 'harian') return 'Harian · ' + Math.max(1, a.days || 1) + ' hari (' + agrHours(a) + ' jam)';
    return a.pkg === '12j' ? 'Paket 12 jam' : 'Paket 24 jam';
  }
  const agrStatusLabel = s => s === 'done' ? 'Selesai' : s === 'late' ? 'Terlambat' : 'Aktif';

  function agrSuggestTotal(pkg, days, dayRate) {
    const hrs = pkg === 'harian' ? Math.max(1, days || 1) * 24 : (pkg === '12j' ? 12 : 24);
    return Math.max(0, Math.round((dayRate * hrs) / 24 / 500) * 500);
  }

  function agrRules(a) {
    const cfg = S();
    const end = agrEnd(a);
    return [
      'Unit hanya boleh dipakai untuk bermain PlayStation di tempat yang disepakati. Penyewa dilarang menjual, menggadaikan, menyewakan ulang, atau memindahtangankan unit yang disewa kepada pihak lain.',
      'Penyewa dilarang menggelapkan unit, baik dengan sengaja maupun tidak sengaja. Unit wajib dikembalikan lengkap sesuai daftar kondisi unit yang tertulis di atas.',
      'Penyewa wajib mengembalikan unit paling lambat ' + fmtDate(end) + ' pukul ' + fmtHM(end) + ' (' + agrPkgLabel(a) + '). Keterlambatan dikenakan denda ' + rp(a.finePerHour || 0) + ' per jam, sesuai harga sewa 1 hari, dan berlanjut untuk hari-hari berikutnya.',
      'Selama masa sewa, unit menjadi tanggung jawab penyewa sepenuhnya — termasuk risiko kehilangan, kerusakan, maupun penyalahgunaan oleh pihak lain.',
      'Dokumen identitas penyewa (' + (a.idType || 'KTP') + ' ' + (a.idNumber || '-') + ') diserahkan sebagai jaminan dan disimpan oleh ' + (cfg.storeName || 'pihak rental') + ' sampai unit kembali dalam keadaan lengkap.',
      'Dengan menandatangani perjanjian ini, penyewa menyatakan telah membaca, memahami, dan menyetujui seluruh pernyataan dan ketentuan yang tertulis di atas.',
      'Apabila penyewa mempersulit pengembalian unit, ' + (cfg.storeName || 'pihak rental') + ' akan menempuh jalur hukum untuk meminta pertanggungjawaban penyewa sesuai ketentuan yang berlaku.'
    ];
  }

  /* ------------------------------ tampilan tab --------------------------- */
  function viewSewa() {
    const list = state.agreements.slice().sort((a, b) => (b.startAt || 0) - (a.startAt || 0));
    const active = list.filter(a => agrStatus(a) === 'active').length;
    const late = list.filter(a => agrStatus(a) === 'late').length;
    const value = list.filter(a => !a.returnedAt).reduce((s, a) => s + (a.total || 0), 0);

    if (!state.stations.length) {
      return `<div class="empty" style="margin-top:24px"><span class="empty-emoji">🎮</span>
        Belum ada unit. Tambahkan dulu di tab <b>Setelan → Unit &amp; Tarif</b>.</div>`;
    }
    return `
      <div class="sec-head" style="margin-top:8px">
        <div><div class="sec-title">Perjanjian Sewa</div>
          <div class="sec-sub">Kartu penyewaan 12 jam · 24 jam · harian</div></div>
        <div class="spacer"></div>
        <button class="btn btn-sm btn-primary" data-action="agr-new">${icon('plus')} Perjanjian</button>
      </div>

      <div class="stats">
        <div class="stat"><div class="stat-label">Sedang disewa</div><div class="stat-value accent">${active}</div></div>
        <div class="stat"><div class="stat-label">Terlambat</div><div class="stat-value ${late ? 'red' : ''}">${late}</div></div>
        <div class="stat"><div class="stat-label">Nilai berjalan</div><div class="stat-value">${rp(value)}</div></div>
      </div>

      ${list.length ? `<div class="agr-list">${list.map(agrCard).join('')}</div>` : `
        <div class="empty" style="margin-top:6px"><span class="empty-emoji">📄</span>
          Belum ada perjanjian. Ketuk <b>+ Perjanjian</b> untuk membuat kartu penyewaan:<br>
          data penyewa + foto + KTP/SIM/Paspor, kondisi unit, tanda tangan, dan aturan sewa siap cetak.</div>`}

      <div class="card" style="padding:14px;margin-top:14px">
        <div class="small" style="line-height:1.7;color:var(--muted)">
          Setiap perjanjian memakai harga sewa <b>1 hari</b> per unit sebagai dasar denda keterlambatan.
          Ubah harga harian di <b>Setelan → Unit &amp; Tarif</b>.
        </div>
      </div>`;
  }

  function agrInfoText(a) {
    if (a.returnedAt) {
      return 'Kembali ' + fmtDate(a.returnedAt) + ' ' + fmtHM(a.returnedAt) + (agrLateHours(a) ? ' · denda ' + rp(agrFine(a)) : '');
    }
    const end = agrEnd(a);
    const sisa = end - Date.now();
    return sisa > 0
      ? 'Sisa ' + fmtDur(sisa) + ' · batas ' + fmtDate(end) + ' ' + fmtHM(end)
      : 'Lewat ' + agrLateHours(a) + ' jam · denda ' + rp(agrFine(a));
  }

  function agrCard(a) {
    const stt = agrStatus(a);
    const end = agrEnd(a);
    const sisa = end - Date.now();
    const chip = `<span class="agr-chip ${stt}">${agrStatusLabel(stt)}</span>`;
    const info = agrInfoText(a);
    return `
      <div class="agr-card ${stt}">
        <div class="agr-card-head">
          <div style="min-width:0">
            <div class="agr-code">${esc(a.code)} ${chip}</div>
            <div class="agr-name">${esc(a.name || 'Tanpa nama')}</div>
            <div class="agr-meta">${esc(a.stationName || '-')} · ${esc(agrPkgLabel(a))} · ${rp(a.total || 0)}</div>
            <div class="agr-meta ${stt === 'late' ? 'red' : ''}" data-agr-info="${a.id}">${info}</div>
          </div>
          <div class="agr-thumb">${a.photo ? `<img src="${esc(a.photo)}" alt="Foto ${esc(a.name)}">` : icon('user')}</div>
        </div>
        <div class="agr-card-actions">
          <button class="btn btn-sm btn-ghost" data-action="agr-view" data-id="${a.id}">${icon('doc')} Dokumen</button>
          <button class="btn btn-sm btn-ghost" data-action="agr-edit" data-id="${a.id}" aria-label="Ubah">${icon('edit')}</button>
          ${!a.returnedAt ? `<button class="btn btn-sm btn-ghost" data-action="agr-return" data-id="${a.id}">${icon('check')} Kembali</button>` : ''}
          <button class="btn btn-sm btn-ghost" data-action="agr-del" data-id="${a.id}" aria-label="Hapus">${icon('trash')}</button>
        </div>
      </div>`;
  }

  /* -------------------------------- form --------------------------------- */
  function openAgreementForm(id) {
    const a = id ? agrById(id) : null;
    const st0 = stationById(a ? a.stationId : (state.stations[0] || {}).id) || state.stations[0] || {};
    ui.agrEdit = id || '';
    ui.agrPhoto = a ? (a.photo || '') : '';
    ui.agrIdPhoto = a ? (a.idPhoto || '') : '';
    ui.agrCondPhoto = a ? (a.condPhoto || '') : '';
    ui.agrSign = a ? (a.signature || '') : '';
    const pkg = a ? a.pkg : '24j';
    const days = a ? (a.days || 1) : 1;
    const dayRate = a ? (a.dayRate || stationDayRate(st0)) : stationDayRate(st0);
    const cond = a ? (a.cond || {}) : AGR_COND.reduce((o, c) => (o[c.key] = true, o), {});
    const iso = ts => {
      const d = new Date(ts);
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    };

    openSheet({
      kind: 'agr',
      title: a ? 'Ubah Perjanjian' : 'Perjanjian Sewa Baru',
      sub: a ? esc(a.code) + ' · ' + esc(a.name) : 'Kartu penyewaan + surat perjanjian siap cetak',
      body: `
        <div class="field-row">
          <div class="field"><label class="lbl">Unit PS</label>
            <select class="input" id="agr-station">
              ${state.stations.map(s => `<option value="${s.id}" ${s.id === st0.id ? 'selected' : ''}>${esc(s.name)} · ${esc(s.type || 'PS')}</option>`).join('')}
            </select></div>
          <div class="field"><label class="lbl">Paket sewa</label>
            <select class="input" id="agr-pkg">
              ${AGR_PKGS.map(p => `<option value="${p.key}" ${p.key === pkg ? 'selected' : ''}>${p.label}</option>`).join('')}
            </select></div>
        </div>

        <div class="field-row">
          <div class="field" id="agr-days-wrap" style="${pkg === 'harian' ? '' : 'display:none'}">
            <label class="lbl">Jumlah hari</label>
            <input class="input input-num" id="agr-days" type="number" inputmode="numeric" min="1" step="1" value="${days}">
          </div>
          <div class="field"><label class="lbl">Mulai sewa</label>
            <input class="input" id="agr-start" type="datetime-local" value="${iso(a ? a.startAt : Date.now())}"></div>
        </div>

        <div class="field-row">
          <div class="field"><label class="lbl">Harga sewa 1 hari</label>
            <input class="input input-num" id="agr-dayrate" type="number" inputmode="numeric" min="0" step="1000" value="${dayRate}"></div>
          <div class="field"><label class="lbl">Total biaya sewa</label>
            <input class="input input-num" id="agr-total" type="number" inputmode="numeric" min="0" step="1000" value="${a ? a.total : agrSuggestTotal(pkg, days, dayRate)}"></div>
        </div>

        <div class="field">
          <label class="lbl">Denda keterlambatan per jam</label>
          <input class="input input-num" id="agr-fine" type="number" inputmode="numeric" min="0" step="1000" value="${a ? a.finePerHour : dayRate}">
          <div class="hint" id="agr-calc-hint">Batas kembali otomatis dihitung dari paket yang dipilih.</div>
        </div>

        <div class="agr-sec-label">Data penyewa</div>
        <div class="field-row">
          <div class="field"><label class="lbl">Nama penyewa</label>
            <input class="input" id="agr-name" value="${a ? esc(a.name) : ''}" placeholder="nama sesuai identitas"></div>
          <div class="field"><label class="lbl">Nomor WhatsApp</label>
            <input class="input" id="agr-phone" inputmode="tel" value="${a ? esc(a.phone || '') : ''}" placeholder="08xxxxxxxxxx"></div>
        </div>

        <div class="field-row">
          <div class="field"><label class="lbl">Jenis identitas</label>
            <select class="input" id="agr-idtype">
              ${AGR_ID_TYPES.map(t => `<option ${((a ? a.idType : 'KTP') === t) ? 'selected' : ''}>${t}</option>`).join('')}
            </select></div>
          <div class="field"><label class="lbl">Nomor identitas</label>
            <input class="input" id="agr-idnum" value="${a ? esc(a.idNumber || '') : ''}" placeholder="mis. 3372xxxxxxxxxxxx"></div>
        </div>

        <div class="field"><label class="lbl">Alamat penyewa</label>
          <input class="input" id="agr-address" value="${a ? esc(a.address || '') : ''}" placeholder="alamat sesuai identitas"></div>

        <div class="field">
          <label class="lbl">Foto penyewa</label>
          <div class="agr-photos">
            <div class="agr-photo" id="agr-photo-preview">${agrPhotoHTML(ui.agrPhoto, 'Foto penyewa')}</div>
            <div class="agr-photo" id="agr-idphoto-preview">${agrPhotoHTML(ui.agrIdPhoto, 'Foto KTP/SIM')}</div>
          </div>
          <div class="chips" style="margin-top:8px">
            <label class="chip chip-upload">${icon('camera')} Ambil foto penyewa<input type="file" id="agr-photo-file" accept="image/*" capture="environment" hidden></label>
            <label class="chip chip-upload">${icon('camera')} Foto identitas<input type="file" id="agr-idphoto-file" accept="image/*" capture="environment" hidden></label>
          </div>
          <div class="hint">Foto diambil langsung dari kamera HP atau pilih dari galeri — otomatis diperkecil.</div>
        </div>

        <div class="agr-sec-label">Kondisi unit saat diserahkan</div>
        <div class="agr-cond-grid">
          ${AGR_COND.map(c => `
            <label class="agr-cond"><input type="checkbox" id="agr-cond-${c.key}" ${cond[c.key] !== false ? 'checked' : ''}> ${c.label}</label>`).join('')}
        </div>
        <div class="field" style="margin-top:10px">
          <label class="lbl">Catatan kondisi</label>
          <input class="input" id="agr-condnote" value="${a ? esc(a.condNote || '') : ''}" placeholder="mis. bodi lecet halus, stik kiri agak renggang">
        </div>
        <div class="field">
          <label class="lbl">Foto unit saat keluar</label>
          <div class="agr-photos">
            <div class="agr-photo wide" id="agr-condphoto-preview">${agrPhotoHTML(ui.agrCondPhoto, 'Foto unit + kelengkapan', true)}</div>
          </div>
          <div class="chips" style="margin-top:8px">
            <label class="chip chip-upload">${icon('camera')} Foto kondisi unit<input type="file" id="agr-condphoto-file" accept="image/*" capture="environment" hidden></label>
          </div>
        </div>

        <div class="agr-sec-label">Tanda tangan penyewa</div>
        <div class="sign-wrap">
          <canvas id="agr-sign-pad" class="sign-pad" width="640" height="200"></canvas>
          <button class="btn btn-sm btn-ghost sign-clear" data-action="agr-sign-clear">${icon('x')} Hapus</button>
        </div>
        <div class="hint">Tanda tangan langsung di kotak (jari / mouse). Tersimpan otomatis di dokumen.</div>
        <label class="agr-cond" style="margin-top:10px">
          <input type="checkbox" id="agr-agree" ${a ? 'checked' : ''}> Penyewa sudah membaca &amp; menyetujui seluruh ketentuan
        </label>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-primary wide" data-action="agr-save" data-id="${id || ''}">${icon(a ? 'check' : 'doc')} ${a ? 'Simpan' : 'Buat Kartu'}</button>`
    });
    initSignPad(ui.agrSign);
    refreshAgrCalc();
  }

  function agrPhotoHTML(src, label, wide) {
    if (!src) return `<div class="agr-photo-empty ${wide ? 'wide' : ''}">${icon('camera')}<span>${label}</span></div>`;
    return `<img src="${esc(src)}" alt="${esc(label)}">`;
  }

  function refreshAgrPhotos() {
    const set = (sel, src, label, wide) => {
      const el = $(sel);
      if (el) el.innerHTML = agrPhotoHTML(src, label, wide);
    };
    set('#agr-photo-preview', ui.agrPhoto, 'Foto penyewa');
    set('#agr-idphoto-preview', ui.agrIdPhoto, 'Foto KTP/SIM');
    set('#agr-condphoto-preview', ui.agrCondPhoto, 'Foto unit + kelengkapan', true);
  }

  function refreshAgrCalc() {
    const hint = $('#agr-calc-hint');
    if (!hint) return;
    const station = stationById($('#agr-station') ? $('#agr-station').value : '') || state.stations[0] || { rate: 0 };
    const pkg = $('#agr-pkg') ? $('#agr-pkg').value : '24j';
    const days = Math.max(1, num($('#agr-days') ? $('#agr-days').value : 1) || 1);
    const dayRate = num($('#agr-dayrate') ? $('#agr-dayrate').value : 0) || stationDayRate(station);
    const start = $('#agr-start') && $('#agr-start').value ? new Date($('#agr-start').value).getTime() : Date.now();
    const hours = pkg === 'harian' ? days * 24 : (pkg === '12j' ? 12 : 24);
    const end = start + hours * 3600e3;
    const wrap = $('#agr-days-wrap');
    if (wrap) wrap.style.display = pkg === 'harian' ? '' : 'none';
    hint.innerHTML = 'Batas kembali: <b>' + fmtDate(end) + ' ' + fmtHM(end) + '</b> · durasi <b>' + hours + ' jam</b> · harga harian ' + rp(dayRate) + '.';
    return { hours, end, dayRate, pkg, days };
  }

  function agrAutoTotal() {
    const c = refreshAgrCalc();
    if (!c) return;
    const totalEl = $('#agr-total'), fineEl = $('#agr-fine');
    if (totalEl) totalEl.value = agrSuggestTotal(c.pkg, c.days, c.dayRate);
    if (fineEl) fineEl.value = c.dayRate;
  }

  function initSignPad(initial) {
    const cv = $('#agr-sign-pad');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    let drawing = false, last = null;
    const pos = ev => {
      const r = cv.getBoundingClientRect();
      return { x: (ev.clientX - r.left) * (cv.width / r.width), y: (ev.clientY - r.top) * (cv.height / r.height) };
    };
    const start = ev => {
      drawing = true; last = pos(ev);
      try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
      ev.preventDefault();
    };
    const move = ev => {
      if (!drawing || !last) return;
      const p = pos(ev);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
      ev.preventDefault();
    };
    const end = () => {
      if (!drawing) return;
      drawing = false; last = null;
      ui.agrSign = cv.toDataURL('image/png');
      const agree = $('#agr-agree');
      if (agree) agree.checked = true;
    };
    cv.addEventListener('pointerdown', start);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointerleave', end);
    cv.addEventListener('pointercancel', end);

    if (initial) {
      const img = new Image();
      img.onload = () => { if (ctx.drawImage) ctx.drawImage(img, 0, 0, cv.width, cv.height); };
      img.src = initial;
    }
  }

  function saveAgreement(id) {
    const name = ($('#agr-name').value || '').trim();
    const phone = ($('#agr-phone').value || '').trim();
    const idnum = ($('#agr-idnum').value || '').trim();
    if (!name) return toast('Nama penyewa wajib diisi', 'err');
    if (normPhone(phone).length < 8) return toast('Nomor WhatsApp penyewa belum lengkap', 'err');
    if (!idnum) return toast('Nomor ' + ($('#agr-idtype').value || 'identitas') + ' wajib diisi', 'err');
    if (!$('#agr-agree').checked) return toast('Centang persetujuan ketentuan dulu', 'err');
    const total = clamp(num($('#agr-total').value), 0, 1e9);
    const fine = clamp(num($('#agr-fine').value), 0, 1e9);
    const startAt = $('#agr-start').value ? new Date($('#agr-start').value).getTime() : Date.now();
    const pkg = $('#agr-pkg').value;
    const days = Math.max(1, Math.round(num($('#agr-days').value) || 1));
    const hours = pkg === 'harian' ? days * 24 : (pkg === '12j' ? 12 : 24);
    const station = stationById($('#agr-station').value) || state.stations[0] || {};
    const cond = {};
    AGR_COND.forEach(c => { const el = $('#agr-cond-' + c.key); cond[c.key] = el ? el.checked : true; });

    const data = {
      name, phone: normPhone(phone), idType: $('#agr-idtype').value, idNumber: idnum,
      address: ($('#agr-address').value || '').trim(),
      stationId: station.id, stationName: station.name || '-',
      pkg, days, hours, startAt, endAt: startAt + hours * 3600e3,
      dayRate: clamp(num($('#agr-dayrate').value), 0, 1e9), total, finePerHour: fine,
      photo: ui.agrPhoto || '', idPhoto: ui.agrIdPhoto || '', condPhoto: ui.agrCondPhoto || '',
      cond, condNote: ($('#agr-condnote').value || '').trim(),
      signature: ui.agrSign || '', signName: name
    };
    if (id) {
      Object.assign(agrById(id), data);
    } else {
      const code = agrCode();
      state.agreements.push(Object.assign({ id: uid('agr'), code, createdAt: Date.now(), returnedAt: 0, lateFine: 0 }, data));
    }
    // daftarkan penyewa ke tab Pelanggan
    let cust = findCustomer(name, phone);
    if (!cust) cust = upsertCustomer(name, phone);
    if (cust) { data.customerId = cust.id; if (cust.id) agrById(id || '') && 0; }
    const saved = id ? agrById(id) : state.agreements[state.agreements.length - 1];
    if (saved && cust) saved.customerId = cust.id;
    save(); closeSheet(); ui.tab = 'sewa'; render();
    log('data', (id ? 'Perbarui perjanjian ' : 'Buat perjanjian ') + (saved ? saved.code : '') + ' · ' + name
      + ' · ' + station.name + ' · ' + rp(total));
    toast(id ? 'Perjanjian diperbarui' : 'Kartu penyewaan dibuat', 'ok');
    if (saved) openAgreementPreview(saved.id);
  }

  function returnAgreement(id) {
    const a = agrById(id);
    if (!a) return;
    const lateH = agrLateHours(a);
    const fine = lateH * (a.finePerHour || 0);
    confirmSheet('Unit sudah kembali?',
      `<b>${esc(a.name)}</b> · ${esc(a.stationName || '')}<br>
       Batas kembali ${fmtDate(agrEnd(a))} ${fmtHM(agrEnd(a))}.<br>
       ${lateH ? `Terlambat <b>${lateH} jam</b> → denda <b>${rp(fine)}</b> (${rp(a.finePerHour || 0)}/jam).` : 'Tepat waktu — tanpa denda. 🎉'}`,
      lateH ? 'Ya, kembali + denda' : 'Ya, unit kembali',
      () => {
        a.returnedAt = Date.now();
        a.lateHours = lateH;
        a.lateFine = fine;
        if (fine > 0) {
          state.transactions.push({
            id: uid('tx'), code: nextInvoiceCode(), type: 'sewa',
            stationId: a.stationId, stationName: a.stationName,
            customer: a.name, customerPhone: a.phone, customerId: a.customerId || '',
            startedAt: agrEnd(a), endedAt: Date.now(), minutes: 0, rate: 0, play: 0,
            items: [{ name: 'Denda telat ' + lateH + ' jam (' + a.code + ')', price: fine, qty: 1 }],
            itemsTotal: fine, discount: 0, total: fine, method: 'Tunai',
            cash: fine, change: 0, createdAt: Date.now(), note: 'Denda keterlambatan sewa ' + a.code
          });
        }
        save(); closeSheet(); render();
        log('data', 'Unit kembali: ' + a.code + ' · ' + a.name + (lateH ? ' · telat ' + lateH + ' jam · denda ' + rp(fine) : ' · tepat waktu'));
        queueAutoSync();
        toast(lateH ? 'Unit kembali · denda ' + rp(fine) : 'Unit kembali tepat waktu', 'ok');
      });
  }

  /* ------------------------------ dokumen -------------------------------- */
  function agreementHTML(a) {
    const cfg = S();
    const stt = agrStatus(a);
    const rows = [
      ['Nama penyewa', a.name || '-'],
      ['No. WhatsApp', a.phone ? custDisplayPhone(a.phone) : '-'],
      ['Identitas', (a.idType || 'KTP') + ' · ' + (a.idNumber || '-')],
      ['Alamat', a.address || '-']
    ];
    const sewa = [
      ['Unit PS', (a.stationName || '-')],
      ['Paket sewa', agrPkgLabel(a)],
      ['Mulai sewa', fmtDate(a.startAt) + ' · ' + fmtHM(a.startAt)],
      ['Batas kembali', fmtDate(agrEnd(a)) + ' · ' + fmtHM(agrEnd(a))],
      ['Harga sewa 1 hari', rp(a.dayRate || 0)],
      ['Total biaya sewa', rp(a.total || 0)],
      ['Denda keterlambatan', rp(a.finePerHour || 0) + ' / jam']
    ];
    const cond = AGR_COND.map(c => `<span class="agr-cond-item ${a.cond && a.cond[c.key] === false ? 'no' : 'yes'}">${a.cond && a.cond[c.key] === false ? '✗' : '✓'} ${esc(c.label)}</span>`).join('');
    return `
      <div class="agr">
        <div class="agr-head">
          <div class="agr-brand">
            ${cfg.logo ? `<img class="agr-logo" src="${esc(cfg.logo)}" alt="">` : `<div class="agr-logo ph">PS</div>`}
            <div>
              <div class="agr-store">${esc(cfg.storeName || 'PS Rent')}</div>
              <div class="agr-tag">${esc(cfg.tagline || 'Rental PlayStation')}</div>
              <div class="agr-addr">${esc(cfg.address || '')}${cfg.phone ? ' · Telp/WA ' + esc(cfg.phone) : ''}</div>
            </div>
          </div>
          <div class="agr-doc">
            <div class="agr-pill">SURAT PERJANJIAN SEWA</div>
            <div class="agr-code-big">${esc(a.code || '')}</div>
            <div class="agr-date">${fmtDate(a.createdAt || Date.now())}</div>
          </div>
        </div>
        <div class="agr-hr"></div>

        <div class="agr-title">KARTU PENYEWAAN &amp; PERJANJIAN SEWA UNIT PLAYSTATION</div>
        <div class="agr-intro">Perjanjian ini dibuat antara <b>${esc(cfg.storeName || 'pihak rental')}</b> (pihak rental) dan <b>${esc(a.name || '-')}</b> (penyewa) untuk penggunaan unit PlayStation dengan ketentuan berikut.</div>

        <div class="agr-sec">
          <div class="agr-sec-h"><span class="dot"></span>A · Data penyewa</div>
          <div class="agr-cols">
            <div class="agr-tbl">
              ${rows.map(([k, v]) => `<div class="agr-row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}
            </div>
            <div class="agr-fotos">
              <figure class="agr-fig">${a.photo ? `<img src="${esc(a.photo)}" alt="Foto penyewa">` : `<div class="agr-fig-ph">${icon('user')}</div>`}<figcaption>Foto penyewa</figcaption></figure>
              <figure class="agr-fig">${a.idPhoto ? `<img src="${esc(a.idPhoto)}" alt="Foto identitas">` : `<div class="agr-fig-ph">${icon('card')}</div>`}<figcaption>${esc(a.idType || 'KTP')}</figcaption></figure>
            </div>
          </div>
        </div>

        <div class="agr-sec">
          <div class="agr-sec-h"><span class="dot"></span>B · Unit &amp; durasi sewa</div>
          <div class="agr-tbl two">
            ${sewa.map(([k, v]) => `<div class="agr-row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}
          </div>
        </div>

        <div class="agr-sec">
          <div class="agr-sec-h"><span class="dot"></span>C · Kondisi unit saat diserahkan</div>
          <div class="agr-cond-print">${cond}</div>
          ${a.condNote ? `<div class="agr-note">Catatan: ${esc(a.condNote)}</div>` : ''}
          <div class="agr-cols">
            <div class="agr-tbl">
              <div class="agr-row"><span>Status saat keluar</span><b>${stt === 'done' ? 'Sudah kembali ' + fmtDate(a.returnedAt) : stt === 'late' ? 'Terlambat' : 'Sedang disewa'}</b></div>
              <div class="agr-row"><span>Petugas serah terima</span><b>${esc(cfg.signName || cfg.storeName || '-')}</b></div>
            </div>
            <div class="agr-fotos">
              <figure class="agr-fig wide">${a.condPhoto ? `<img src="${esc(a.condPhoto)}" alt="Foto kondisi unit">` : `<div class="agr-fig-ph">${icon('gamepad')}</div>`}<figcaption>Foto unit + kelengkapan</figcaption></figure>
            </div>
          </div>
        </div>

        <div class="agr-sec">
          <div class="agr-sec-h"><span class="dot"></span>D · Peraturan &amp; ketentuan penyewa</div>
          <ol class="agr-rules">${agrRules(a).map(r => `<li>${esc(r)}</li>`).join('')}</ol>
          <div class="agr-agree-box">
            Dengan menandatangani perjanjian ini, penyewa menyatakan <b>menyetujui seluruh pernyataan dan ketentuan di atas</b>,
            termasuk denda keterlambatan, tanggung jawab penuh atas unit, serta proses hukum bila unit tidak dikembalikan.
          </div>
        </div>

        <div class="agr-sign">
          <div class="agr-sign-col">
            <div class="agr-sign-cap">Penyewa</div>
            <div class="agr-sign-img">${a.signature ? `<img src="${esc(a.signature)}" alt="Tanda tangan penyewa">` : ''}</div>
            <div class="agr-sign-line"></div>
            <div class="agr-sign-name">${esc(a.name || '-')}</div>
            <div class="agr-sign-sub">${a.phone ? esc(custDisplayPhone(a.phone)) : ''}</div>
          </div>
          <div class="agr-sign-col">
            <div class="agr-sign-cap">Pihak rental</div>
            <div class="agr-sign-img"></div>
            <div class="agr-sign-line"></div>
            <div class="agr-sign-name">${esc(cfg.signName || cfg.storeName || '-')}</div>
            <div class="agr-sign-sub">Petugas / pemilik</div>
          </div>
        </div>

        <div class="agr-foot">
          <span>Dicetak ${fmtDate(Date.now())} ${fmtHM(Date.now())} · ${esc(a.code || '')}</span>
          <span>${esc(cfg.phone ? 'Telp/WA ' + cfg.phone : '')}</span>
        </div>
      </div>`;
  }

  function paintAgreement(ctx, a) {
    const cfg = S();
    const W = AGR.W, PAD = AGR.PAD, CW = W - PAD * 2;
    const img = ui._agrImgs || {};
    const setFont = (weight, size, mono) => {
      if (!ctx) return;
      const fam = mono ? 'ui-monospace, Menlo, Consolas, monospace' : 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.font = weight + ' ' + size + 'px ' + fam;
    };
    const measure = (str, o = {}) => {
      if (!ctx) return String(str).length * (o.size || 12) * (o.mono ? 0.6 : 0.52);
      setFont(o.weight || 400, o.size || 12, o.mono);
      return ctx.measureText(String(str)).width;
    };
    const text = (str, x, yy, o = {}) => {
      if (!ctx) return;
      setFont(o.weight || 400, o.size || 12, o.mono);
      ctx.fillStyle = o.color || AGR.ink;
      ctx.textAlign = o.align || 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(str), x, yy);
    };
    const wrap = (str, maxW, o) => {
      const words = String(str).split(/\s+/);
      const out = []; let cur = '';
      words.forEach(w => {
        const t = cur ? cur + ' ' + w : w;
        if (measure(t, o) > maxW && cur) { out.push(cur); cur = w; } else cur = t;
      });
      if (cur) out.push(cur);
      return out;
    };
    const rrect = (x, yy, w, h, r, fill, stroke) => {
      if (!ctx) return;
      const rr = Math.min(r, h / 2, w / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, yy);
      ctx.arcTo(x + w, yy, x + w, yy + h, rr);
      ctx.arcTo(x + w, yy + h, x, yy + h, rr);
      ctx.arcTo(x, yy + h, x, yy, rr);
      ctx.arcTo(x, yy, x + w, yy, rr);
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    };
    const line = (x1, x2, yy, color, lw) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.strokeStyle = color || AGR.line;
      ctx.lineWidth = lw || 1;
      ctx.moveTo(x1, yy); ctx.lineTo(x2, yy);
      ctx.stroke();
    };

    let y = PAD;

    /* header */
    const logo = img.logo || null;
    let lw = 0;
    if (logo) {
      const s2 = Math.min(46 / (logo.width || 46), 46 / (logo.height || 46), 1);
      lw = Math.round((logo.width || 46) * s2);
      const lh = Math.round((logo.height || 46) * s2);
      if (ctx) { rrect(PAD, y, 46, 46, 10, '#f2f7f4'); if (ctx.drawImage) ctx.drawImage(logo, PAD + (46 - lw) / 2, y + (46 - lh) / 2, lw, lh); }
      lw = 46;
    }
    const tx = PAD + lw + (lw ? 12 : 0);
    text(cfg.storeName || 'PS Rent', tx, y + 15, { weight: 800, size: 19 });
    text(cfg.tagline || 'Rental PlayStation', tx, y + 31, { size: 11, color: AGR.soft });
    const addrLine = [cfg.address || '', cfg.phone ? 'Telp/WA ' + cfg.phone : ''].filter(Boolean).join(' · ');
    text(addrLine, tx, y + 45, { size: 10, color: AGR.muted });
    // pil dokumen kanan
    const pill = 'SURAT PERJANJIAN SEWA';
    const pw = measure(pill, { weight: 800, size: 9.5, mono: true }) + 22;
    rrect(W - PAD - pw, y, pw, 22, 11, AGR.softGreen, AGR.softGreenLine);
    text(pill, W - PAD - pw + 11, y + 14.6, { weight: 800, size: 9.5, mono: true, color: AGR.accentDark });
    text(a.code || '', W - PAD, y + 44, { weight: 800, size: 12, mono: true, align: 'right' });
    text(fmtDate(a.createdAt || Date.now()), W - PAD, y + 58, { size: 10, color: AGR.muted, align: 'right' });
    y += 62;
    line(PAD, W - PAD, y, AGR.accent, 2);
    y += 22;

    /* judul */
    text('KARTU PENYEWAAN & PERJANJIAN SEWA UNIT PLAYSTATION', PAD, y, { weight: 800, size: 14.5 });
    y += 16;
    const intro = 'Perjanjian ini dibuat antara ' + (cfg.storeName || 'pihak rental') + ' (pihak rental) dan ' + (a.name || '-') +
      ' (penyewa) untuk penggunaan unit PlayStation dengan ketentuan berikut.';
    wrap(intro, CW, { size: 10.5, color: AGR.soft }).forEach(l => { text(l, PAD, y, { size: 10.5, color: AGR.soft }); y += 13.5; });
    y += 6;

    const drawFig = (image, x, yy, w, h, cap) => {
      rrect(x, yy, w, h, 7, '#f5f8fa', '#e3e9ef');
      if (image && ctx && ctx.drawImage) {
        const sc = Math.max(w / (image.width || w), h / (image.height || h));
        try {
          ctx.save();
          rrect(x, yy, w, h, 7);
          ctx.clip();
          const iw = (image.width || w) * sc, ih = (image.height || h) * sc;
          ctx.drawImage(image, x + (w - iw) / 2, yy + (h - ih) / 2, iw, ih);
          ctx.restore();
        } catch (e) { console.warn('gambar', e); }
      }
      text(cap, x + w / 2, yy + h + 10, { size: 8, color: AGR.muted, align: 'center' });
    };

    const secTitle = (label) => {
      if (ctx) {
        ctx.beginPath(); ctx.arc(PAD + 3, y - 3.5, 2.6, 0, Math.PI * 2); ctx.fillStyle = AGR.accent; ctx.fill();
      }
      text(label, PAD + 12, y, { weight: 800, size: 10.5, mono: true, color: AGR.accentDark });
      y += 6;
      line(PAD, W - PAD, y, AGR.line, 1);
      y += 13;
    };
    const rowsBlock = (rows, x, width, labelW, o = {}) => {
      rows.forEach(([k, v]) => {
        text(k, x, y, { size: 9.5, color: AGR.muted, weight: 700 });
        const lines = wrap(v, width - labelW, { size: o.size || 11.5, weight: 700 });
        lines.forEach((l, i) => text(l, x + labelW, y + i * 13, { size: o.size || 11.5, weight: 700 }));
        y += Math.max(15, lines.length * 13 + 3);
      });
    };

    /* A — data penyewa (foto penyewa + foto identitas di kanan) */
    secTitle('A · DATA PENYEWA');
    const figW = 92, figH = 94, figGap = 10;
    const figsW = figW * 2 + figGap;
    const secTop = y;
    const colW = W - PAD - figsW - 18 - PAD;
    const aRows = [
      ['Nama penyewa', a.name || '-'],
      ['No. WhatsApp', a.phone ? custDisplayPhone(a.phone) : '-'],
      ['Identitas', (a.idType || 'KTP') + ' · ' + (a.idNumber || '-')],
      ['Alamat', a.address || '-']
    ];
    const labelW = Math.ceil(Math.max(...aRows.map(([k]) => measure(k, { weight: 700, size: 9.5 })))) + 10;
    aRows.forEach(([k, v]) => {
      text(k, PAD, y, { size: 9.5, color: AGR.muted, weight: 700 });
      const lines = wrap(v, colW - labelW, { size: 11, weight: 700 });
      lines.forEach((l, i) => text(l, PAD + labelW, y + i * 13, { size: 11, weight: 700 }));
      y += Math.max(15, lines.length * 13 + 3);
    });
    drawFig(img.photo, W - PAD - figsW, secTop, figW, figH, 'Foto penyewa');
    drawFig(img.idPhoto, W - PAD - figW, secTop, figW, figH, 'Foto ' + (a.idType || 'identitas'));
    y = Math.max(y, secTop + figH + 16) + 2;

    /* B — unit & durasi */
    secTitle('B · UNIT & DURASI SEWA');
    const half = (CW - 16) / 2;
    const yStart = y;
    const bLabel = Math.ceil(Math.max(
      measure('Batas kembali', { weight: 700, size: 9.5 }),
      measure('Harga 1 hari', { weight: 700, size: 9.5 })
    )) + 10;
    rowsBlock([
      ['Unit PS', a.stationName || '-'],
      ['Paket sewa', agrPkgLabel(a)],
      ['Mulai sewa', fmtDate(a.startAt) + ' · ' + fmtHM(a.startAt)],
      ['Batas kembali', fmtDate(agrEnd(a)) + ' · ' + fmtHM(agrEnd(a))]
    ], PAD, half, bLabel);
    const yLeft = y;
    y = yStart;
    rowsBlock([
      ['Harga 1 hari', rp(a.dayRate || 0)],
      ['Total sewa', rp(a.total || 0)],
      ['Denda / jam', rp(a.finePerHour || 0)],
      ['Status', agrStatusLabel(agrStatus(a))]
    ], PAD + half + 16, half, bLabel);
    y = Math.max(yLeft, y) + 3;

    /* C — kondisi unit */
    secTitle('C · KONDISI UNIT SAAT DISERAHKAN');
    const condFigW = 140, condFigH = 64;
    const chipArea = CW - condFigW - 18;
    const chipW = chipArea / 3;
    AGR_COND.forEach((c, i) => {
      const ok = !(a.cond && a.cond[c.key] === false);
      const col = i % 3, rowi = Math.floor(i / 3);
      const x = PAD + col * chipW, yy = y + rowi * 16;
      text((ok ? '✓ ' : '✗ ') + c.label, x, yy + 9, { size: 9.5, weight: 600, color: ok ? AGR.soft : AGR.amber });
    });
    let cy = y + 40;
    if (a.condNote) {
      wrap('Catatan: ' + a.condNote, chipArea, { size: 9.5, color: AGR.soft }).forEach(l => { text(l, PAD, cy, { size: 9.5, color: AGR.soft }); cy += 12; });
    }
    drawFig(img.condPhoto, W - PAD - condFigW, y - 6, condFigW, condFigH, 'Foto unit + kelengkapan');
    y = Math.max(cy + 4, y - 6 + condFigH + 16) + 4;

    /* D — peraturan */
    secTitle('D · PERATURAN & KETENTUAN PENYEWA');
    agrRules(a).forEach((r, i) => {
      const lines = wrap(r, CW - 18, { size: 10, color: AGR.soft });
      text((i + 1) + '.', PAD, y, { size: 10, weight: 800, color: AGR.ink });
      lines.forEach((l, j) => text(l, PAD + 16, y + j * 12.5, { size: 10, color: AGR.soft }));
      y += lines.length * 12.5 + 4;
    });
    y += 2;
    const agreeTxt = 'Dengan menandatangani perjanjian ini, penyewa menyatakan menyetujui seluruh pernyataan dan ketentuan di atas, termasuk denda keterlambatan, tanggung jawab penuh atas unit, serta proses hukum bila unit tidak dikembalikan.';
    const agreeLines = wrap(agreeTxt, CW - 24, { size: 10, weight: 700 });
    rrect(PAD, y, CW, agreeLines.length * 12.5 + 18, 8, AGR.softGreen, AGR.softGreenLine);
    agreeLines.forEach((l, i) => text(l, PAD + 12, y + 17 + i * 12.5, { size: 10, weight: 700, color: '#0b3b26' }));
    y += agreeLines.length * 12.5 + 26;

    /* tanda tangan */
    const signW = (CW - 40) / 2;
    const signTop = y + 10;
    const signCol = (x, cap, image, name, sub) => {
      text(cap, x, signTop, { size: 10, weight: 700, color: AGR.muted });
      if (image && ctx && ctx.drawImage) {
        const sc = Math.min((signW - 30) / (image.width || 1), 42 / (image.height || 1), 1);
        const iw = (image.width || 100) * sc, ih = (image.height || 40) * sc;
        ctx.drawImage(image, x + (signW - iw) / 2, signTop + 6 + (42 - ih) / 2, iw, ih);
      }
      line(x, x + signW, signTop + 54, '#94a3b8', 1);
      text(name, x + signW / 2, signTop + 68, { size: 11, weight: 800, align: 'center' });
      if (sub) text(sub, x + signW / 2, signTop + 80, { size: 9, color: AGR.muted, align: 'center' });
    };
    signCol(PAD, 'Penyewa', img.sign, a.name || '-', a.phone ? custDisplayPhone(a.phone) : '');
    signCol(PAD + signW + 40, 'Pihak rental', null, cfg.signName || cfg.storeName || '-', 'Petugas / pemilik');
    y = signTop + 96;

    /* footer */
    line(PAD, W - PAD, y, AGR.line, 1);
    y += 12;
    text('Dicetak ' + fmtDate(Date.now()) + ' ' + fmtHM(Date.now()) + ' · ' + (a.code || ''), PAD, y, { size: 9, color: AGR.muted });
    text(cfg.phone ? 'Telp/WA ' + cfg.phone : '', W - PAD, y, { size: 9, color: AGR.muted, align: 'right' });
    return y + PAD;
  }

  async function agreementCanvas(a) {
    const cfg = S();
    ui._agrImgs = {
      logo: cfg.logo ? await loadImage(cfg.logo) : null,
      photo: a.photo ? await loadImage(a.photo) : null,
      idPhoto: a.idPhoto ? await loadImage(a.idPhoto) : null,
      condPhoto: a.condPhoto ? await loadImage(a.condPhoto) : null,
      sign: a.signature ? await loadImage(a.signature) : null
    };
    const h = Math.ceil(paintAgreement(null, a));
    const scale = 2;
    const cv = document.createElement('canvas');
    cv.width = AGR.W * scale;
    cv.height = Math.max(1, h * scale);
    const ctx = cv.getContext('2d');
    if (!ctx) return cv;
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, AGR.W, h);
    ctx.textBaseline = 'alphabetic';
    paintAgreement(ctx, a);
    return cv;
  }

  const agrFileName = a => 'perjanjian-' + String(a.code || 'sewa').replace(/[^\w]+/g, '-') + '-' + String(a.name || '').replace(/[^\w]+/g, '-') + '.png';

  function openAgreementPreview(id) {
    const a = agrById(id);
    if (!a) return;
    ui.agrDocId = id;
    ui.agrImg = '';
    openSheet({
      kind: 'agrdoc',
      title: 'Surat Perjanjian Sewa',
      sub: a.code + ' · ' + a.name + ' · ' + agrPkgLabel(a),
      body: `
        <div class="agr-preview"><img src="" alt="Dokumen perjanjian"></div>
        <div class="hint">Dokumen memuat data penyewa + foto, identitas (KTP/SIM/Paspor/KTA), kondisi unit saat keluar, peraturan, dan tanda tangan penyewa. Bisa diunduh, dicetak, atau dikirim ke WhatsApp penyewa.</div>`,
      foot: `<button class="btn btn-ghost" data-action="agr-dl">${icon('download')} Unduh</button>
             <button class="btn btn-ghost" data-action="agr-print">${icon('print')} Cetak</button>
             <button class="btn btn-primary wide" data-action="agr-wa">${icon('wa')} Kirim</button>`
    });
    agreementCanvas(a).then(cv => {
      ui.agrImg = cv.toDataURL('image/png');
      const im = $('#modal-root .agr-preview img');
      if (im && ui.agrDocId === id) im.src = ui.agrImg;
    }).catch(err => console.warn('dokumen gagal dirender', err));
  }

  function printAgreement(id) {
    const a = agrById(id);
    if (!a) return;
    const paper = REPORT_PAPER[S().reportPaper] ? S().reportPaper : 'A4';
    const cfg = REPORT_PAPER[paper];
    printWithStyle(agreementHTML(a),
      '@page{size:' + paper + ' portrait;margin:' + cfg.mm + 'mm}' +
      '#print-area .agr{max-width:none;zoom:' + cfg.zoom + ';margin:0}');
  }

  async function shareAgreement(id, phone) {
    const a = agrById(id);
    if (!a) return;
    const cv = await agreementCanvas(a);
    const blob = await canvasBlob(cv);
    const name = agrFileName(a);
    const caption = 'Surat perjanjian sewa ' + (S().storeName || 'PS Rent') + '\n' +
      a.code + ' · ' + a.name + '\n' + (a.stationName || '') + ' · ' + agrPkgLabel(a) +
      '\nBatas kembali: ' + fmtDate(agrEnd(a)) + ' ' + fmtHM(agrEnd(a)) +
      '\nTotal ' + rp(a.total || 0) + ' · denda ' + rp(a.finePerHour || 0) + '/jam';
    let file = null;
    try { file = new File([blob], name, { type: 'image/png' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Perjanjian Sewa ' + a.code, text: caption });
        return;
      } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    if (blob) downloadBlob(blob, name);
    openWa(caption + '\n\n(gambar perjanjian terlampir)', phone || a.phone);
    toast('Dokumen diunduh — kirim ke ' + (a.name || 'penyewa'));
  }

  /* ---------------------------- rincian kartu statistik ------------------- */
  function omsetToday() {
    const today = dayKey(Date.now());
    const tx = state.transactions
      .filter(t => dayKey(t.createdAt) === today)
      .slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const sum = f => tx.reduce((a, t) => a + (f(t) || 0), 0);
    const denda = tx.reduce((a, t) => a + (t.items || [])
      .filter(i => /^Denda/i.test(String(i.name || '')))
      .reduce((x, i) => x + (i.price || 0) * (i.qty || 0), 0), 0);
    const itemsTotal = sum(t => t.itemsTotal);
    const methods = {};
    tx.forEach(t => {
      const k = t.method || 'Tunai';
      methods[k] = methods[k] || { count: 0, total: 0 };
      methods[k].count++;
      methods[k].total += (t.total || 0);
    });
    return {
      tx,
      count: tx.length,
      total: sum(t => t.total),
      play: sum(t => t.play),
      itemsTotal,
      denda,
      kantin: Math.max(0, itemsTotal - denda),
      diskon: sum(t => t.discount),
      minutes: sum(t => t.minutes),
      qty: tx.reduce((a, t) => a + (t.items || []).reduce((x, i) => x + (i.qty || 0), 0), 0),
      sewaCount: tx.filter(t => (t.play || 0) > 0).length,
      kantinCount: tx.filter(t => t.type !== 'sewa').length,
      methods: Object.keys(methods).map(k => ({ name: k, ...methods[k] })).sort((a, b) => b.total - a.total)
    };
  }

  const statLine = (k, v, cls = '') => `<div class="bill-line ${cls}"><span class="k">${k}</span><span class="v">${v}</span></div>`;

  function openStatSheet(kind) {
    ui.statOpen = kind;
    render();
    if (kind === 'omset') return statOmsetSheet();
    if (kind === 'aktif') return statAktifSheet();
    return statBerjalanSheet();
  }

  function statOmsetSheet() {
    const o = omsetToday();
    const now = Date.now();
    openSheet({
      kind: 'stat',
      title: 'Rincian Omset Hari Ini',
      sub: fmtDate(now) + ' · ' + o.count + ' transaksi',
      body: `
        <div class="big-total">
          <div>
            <div class="lab">Omset hari ini</div>
            <div class="small muted" style="margin-top:2px">${o.sewaCount} transaksi sewa · ${o.qty} item kantin terjual</div>
          </div>
          <div class="amt">${rp(o.total)}</div>
        </div>

        <div class="sec-lbl">Sumber pemasukan</div>
        <div class="bill">
          ${statLine('Sewa unit', rp(o.play))}
          ${statLine('Kantin Kita', rp(o.kantin))}
          ${o.denda ? statLine('Denda keterlambatan', rp(o.denda)) : ''}
          ${o.diskon ? statLine('Diskon diberikan', '−' + rp(o.diskon)) : ''}
          ${statLine('Rata-rata / transaksi', rp(Math.round(o.total / Math.max(1, o.count))))}
          ${statLine('Durasi main', o.minutes ? fmtMin(o.minutes) : '—')}
          ${statLine('Item kantin terjual', o.qty + ' item')}
        </div>

        <div class="sec-lbl">Metode bayar</div>
        <div class="bill">
          ${o.methods.length
            ? o.methods.map(m => statLine(esc(m.name) + ' <span class="muted">· ' + m.count + '×</span>', rp(m.total))).join('')
            : '<div class="small muted">Belum ada transaksi hari ini.</div>'}
        </div>

        <div class="sec-lbl">Transaksi hari ini</div>
        ${o.tx.length ? `<div class="list">${o.tx.map(t => `
          <div class="row" data-action="tx-detail" data-id="${t.id}" role="button" tabindex="0">
            <div class="row-main">
              <div class="row-title">${esc(t.code)} <span class="muted small">${t.type === 'sewa' ? '· ' + esc(t.stationName || 'Sewa') : '· Kantin'}</span></div>
              <div class="row-sub">${fmtHM(t.createdAt)} · ${esc(t.method || 'Tunai')}${t.customer ? ' · ' + esc(t.customer) : ''}</div>
            </div>
            <div class="row-end"><div class="row-amount">${rp(t.total)}</div></div>
          </div>`).join('')}</div>`
          : '<div class="empty" style="padding:22px"><span class="empty-emoji">🧾</span>Belum ada transaksi hari ini.</div>'}`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Tutup</button>
             <button class="btn btn-primary wide" data-action="go-report">${icon('chart')} Buka Laporan</button>`
    });
  }

  function statAktifSheet() {
    const sessions = state.sessions.slice().sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0));
    const totalBill = sessions.reduce((a, s) => a + sessionBill(s).sub, 0);
    const itemsQty = sessions.reduce((a, s) => a + (s.items || []).reduce((x, i) => x + (i.qty || 0), 0), 0);
    openSheet({
      kind: 'stat',
      title: 'Rincian Sesi Aktif',
      sub: sessions.length + ' unit sedang dipakai · ' + (state.stations.length - sessions.length) + ' kosong',
      body: `
        <div class="stats" style="margin-bottom:12px">
          <div class="stat"><div class="stat-label">Sesi aktif</div><div class="stat-value accent">${sessions.length}</div></div>
          <div class="stat"><div class="stat-label">Unit kosong</div><div class="stat-value">${state.stations.length - sessions.length}</div></div>
          <div class="stat"><div class="stat-label">Biaya berjalan</div><div class="stat-value" style="font-size:14px">${rp(totalBill)}</div></div>
        </div>
        ${sessions.length ? `<div class="list">${sessions.map(s => {
          const st = stationById(s.stationId) || {};
          const bill = sessionBill(s);
          return `<div class="row">
            <div class="row-main">
              <div class="row-title">${esc(st.name || '-')} <span class="badge badge-green"><span class="dot"></span>Main</span></div>
              <div class="row-sub">${s.customer ? esc(s.customer) + ' · ' : ''}mulai ${fmtHM(s.startedAt)} · <span data-timer="${s.id}">${fmtDur(Date.now() - s.startedAt)}</span></div>
              <div class="row-sub">${rp(s.rate)}/jam${(s.items || []).length ? ' · ' + (s.items || []).length + ' item kantin' : ''}</div>
            </div>
            <div class="row-end"><div class="row-amount" data-cost="${s.id}">${rp(bill.play)}</div></div>
            <div class="row-actions"><button class="icon-btn" data-action="open-station" data-id="${s.stationId}" aria-label="Buka ${esc(st.name || '')}">${icon('play')}</button></div>
          </div>`;
        }).join('')}</div>` : '<div class="empty" style="padding:26px"><span class="empty-emoji">🎮</span>Semua unit kosong. Ketuk unit di tab Meja untuk mulai sesi.</div>'}
        <div class="hint" style="margin-top:12px">Biaya berjalan = tarif × waktu main (dibulatkan tiap ${S().roundMinutes} menit, minimum ${S().minMinutes} menit)${itemsQty ? ' + ' + itemsQty + ' item kantin di dalam sesi' : ''}.</div>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Tutup</button>
             <button class="btn btn-primary wide" data-action="go-meja">${icon('gamepad')} Ke Tab Meja</button>`
    });
  }

  function statBerjalanSheet() {
    const cfg = S();
    const sessions = state.sessions.slice().sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0));
    const total = sessions.reduce((a, s) => a + sessionBill(s).sub, 0);
    openSheet({
      kind: 'stat',
      title: 'Rincian Biaya Berjalan',
      sub: 'Estimasi tagihan sesi yang belum dibayar',
      body: `
        <div class="big-total">
          <div><div class="lab">Estimasi berjalan</div>
            <div class="small muted" style="margin-top:2px">${sessions.length} sesi aktif</div></div>
          <div class="amt">${rp(total)}</div>
        </div>
        ${sessions.length ? `<div class="bill">
          ${sessions.map(s => {
            const st = stationById(s.stationId) || {};
            const mins = billableMinutes(s.startedAt, Date.now(), cfg);
            const bill = sessionBill(s);
            return statLine(
              esc(st.name || '-') + ' <span class="muted">· ' + fmtDur(Date.now() - s.startedAt) + ' · ' + mins + ' mnt tertagih</span>',
              rp(bill.play)) + (bill.items ? statLine('<span class="muted" style="padding-left:10px">└ kantin di sesi</span>', rp(bill.items)) : '');
          }).join('')}
          <div class="bill-line total"><span class="k">Total estimasi</span><span class="v">${rp(total)}</span></div>
        </div>` : '<div class="empty" style="padding:26px"><span class="empty-emoji">⏱️</span>Belum ada sesi berjalan.</div>'}
        <div class="hint" style="margin-top:12px">Tarif dihitung per ${cfg.roundMinutes} menit dengan minimum ${cfg.minMinutes} menit. Nilai ini belum masuk omset — baru tercatat setelah pembayaran.</div>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Tutup</button>
             <button class="btn btn-primary wide" data-action="go-meja">${icon('gamepad')} Ke Tab Meja</button>`
    });
  }

  /* ==================== AKUN, HAK AKSES & LOG AKTIVITAS ================== */
  const ROLE_LABEL = { pemilik: 'Pemilik', penjaga: 'Penjaga' };
  const ROLE_INFO = {
    pemilik: 'Akses penuh: kasir, ubah unit & produk, setelan, keuangan, akun, dan log.',
    penjaga: 'Kasir: mulai sesi, jual kantin, terima bayar, lihat laporan & riwayatnya sendiri. Tidak bisa mengubah data/setelan.'
  };
  const PENJAGA_PERMS = ['sale', 'session', 'canteen', 'report', 'log', 'theme'];
  const PENJAGA_BLOCKED = new Set([
    'new-station', 'edit-station', 'save-station', 'del-station', 'st-img-preset', 'st-img-url', 'st-img-clear',
    'new-product', 'edit-product', 'save-product', 'del-product', 'pr-img-preset', 'pr-img-url', 'pr-img-clear', 'restock',
    'del-tx', 'del-method', 'add-method', 'agr-del',
    'logo-clear', 'logo-url', 'toggle-logo-receipt', 'toggle-sign', 'set-paper',
    'cust-add', 'cust-edit', 'cust-save', 'cust-del',
    'cb-add', 'cb-edit', 'cb-save', 'cb-del', 'cb-amt', 'cash-fix', 'cash-fix-amt', 'cash-fix-save',
    'reset-all', 'restore', 'demo-seed', 'demo-clear', 'wipe-data', 'log-clear',
    'user-new', 'user-edit', 'user-save', 'user-del', 'user-seed', 'auth-toggle',
    'drive-connect', 'drive-sync', 'drive-off'
  ]);
  const ACTION_LABEL = {
    'new-station': 'tambah unit', 'edit-station': 'ubah unit', 'save-station': 'simpan unit', 'del-station': 'hapus unit',
    'new-product': 'tambah produk', 'edit-product': 'ubah produk', 'save-product': 'simpan produk', 'del-product': 'hapus produk',
    'del-tx': 'hapus transaksi', 'agr-del': 'hapus perjanjian', 'reset-all': 'reset data', 'restore': 'restore data',
    'demo-seed': 'isi data contoh', 'demo-clear': 'hapus data contoh', 'wipe-data': 'kosongkan data',
    'user-new': 'tambah akun', 'user-edit': 'ubah akun', 'user-del': 'hapus akun', 'auth-toggle': 'mode akun',
    'drive-connect': 'sambungkan Drive', 'drive-sync': 'sinkron Drive', 'log-clear': 'hapus log',
    'cb-add': 'catat kas', 'cash-fix': 'koreksi kas'
  };
  const activeUsers = () => (state.users || []).filter(u => u.active !== false);
  const userById = id => (state.users || []).find(u => u.id === id);
  function me() {
    if (!S().authEnabled) return { id: '', name: 'Pemilik', role: 'pemilik', implicit: true };
    return activeUsers().find(u => u.id === ui.userId) || null;
  }
  const isLocked = () => !!S().authEnabled && !me();
  function isOwner() { const u = me(); return !!u && u.role === 'pemilik'; }
  function can(perm) {
    const u = me();
    if (!u) return false;
    return u.role === 'pemilik' ? true : PENJAGA_PERMS.includes(perm);
  }
  function needPerm(perm, msg) {
    if (can(perm)) return true;
    toast(msg || 'Hanya pemilik yang bisa melakukan ini', 'err');
    return false;
  }
  const initials = name => String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  function log(action, detail = '') {
    const u = me();
    if (!Array.isArray(state.logs)) state.logs = [];
    state.logs.unshift({
      id: uid('log'), at: Date.now(),
      userId: u ? u.id : '', userName: u ? u.name : 'Sistem', role: u ? u.role : '-',
      action, detail
    });
    if (state.logs.length > 400) state.logs.length = 400;
    save();
  }

  const LOG_KINDS = [
    { id: 'semua', label: 'Semua' },
    { id: 'sesi', label: 'Sesi' },
    { id: 'transaksi', label: 'Transaksi' },
    { id: 'data', label: 'Data' },
    { id: 'akun', label: 'Akun' },
    { id: 'sinkron', label: 'Sinkron' }
  ];
  const LOG_ICON = { sesi: 'gamepad', transaksi: 'receipt', data: 'box', akun: 'user', sinkron: 'cloud', setelan: 'gear', lisensi: 'shield' };
  function logTime(at) {
    const d = new Date(at);
    const today = dayKey(Date.now()) === dayKey(at);
    const yest = dayKey(Date.now() - 86400e3) === dayKey(at);
    const day = today ? 'Hari ini' : yest ? 'Kemarin' : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    return day + ' · ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function logRowHTML(l) {
    return `<div class="log-row">
      <div class="log-ic log-${esc(l.action)}">${icon(LOG_ICON[l.action] || 'doc')}</div>
      <div class="log-main">
        <div class="log-txt">${esc(l.detail || l.action)}</div>
        <div class="log-sub">${logTime(l.at)} · ${esc(l.userName)} <span class="log-role">${esc(ROLE_LABEL[l.role] || l.role || '-')}</span></div>
      </div>
    </div>`;
  }
  function filteredLogs() {
    const u = me();
    let rows = (state.logs || []).slice();
    if (u && u.role === 'penjaga') rows = rows.filter(l => l.userId === u.id);
    if (ui.logFilter && ui.logFilter !== 'semua') rows = rows.filter(l => l.action === ui.logFilter);
    return rows;
  }
  function openLogSheet(filter) {
    ui.logFilter = filter || ui.logFilter || 'semua';
    const rows = filteredLogs();
    const shown = rows.slice(0, 150);
    openSheet({
      kind: 'log',
      title: 'Riwayat Aktivitas',
      sub: rows.length + ' entri · ' + (me() ? (ROLE_LABEL[me().role] || '') : ''),
      body: `
        <div class="chips" style="margin-bottom:12px">
          ${LOG_KINDS.map(k => `<button class="chip ${ui.logFilter === k.id ? 'active' : ''}" data-action="log-filter" data-id="${k.id}">${k.label}</button>`).join('')}
        </div>
        ${shown.length
          ? `<div class="log-list">${shown.map(logRowHTML).join('')}</div>`
          : `<div class="empty" style="padding:26px"><span class="empty-emoji">🗂️</span>Belum ada aktivitas tercatat.</div>`}
        ${rows.length > shown.length ? `<div class="hint" style="margin-top:10px">Menampilkan ${shown.length} dari ${rows.length} entri terbaru.</div>` : ''}`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Tutup</button>
             ${isOwner() ? `<button class="btn btn-red" data-action="log-clear">${icon('trash')} Hapus log</button>` : ''}`
    });
  }

  /* ------------------------------------------------------------- layar kunci */
  function viewLock() {
    const list = activeUsers();
    const sel = list.find(u => u.id === ui.lockUser) || null;
    if (!list.length) {
      return `<div class="lock-wrap">
        <div class="lock-hero">
          <div class="lock-logo">${S().logo ? `<img src="${esc(S().logo)}" alt="">` : icon('gamepad')}</div>
          <div class="lock-name">${esc(S().storeName)}</div>
          <div class="lock-sub">Mode akun aktif, tapi belum ada akun terdaftar.</div>
        </div>
        <div class="empty" style="margin:0 18px"><span class="empty-emoji">👥</span>Buka Setelan → Akun &amp; Hak Akses untuk membuat akun, atau matikan mode akun.</div>
      </div>`;
    }
    return `<div class="lock-wrap">
      <div class="lock-hero">
        <div class="lock-logo">${S().logo ? `<img src="${esc(S().logo)}" alt="">` : icon('gamepad')}</div>
        <div class="lock-name">${esc(S().storeName)}</div>
        <div class="lock-sub">Pilih akun, lalu masukkan PIN</div>
      </div>
      <div class="lock-users">
        ${list.map(u => `<button class="lock-user ${sel && sel.id === u.id ? 'active' : ''}" data-action="lock-pick" data-id="${u.id}">
          <span class="avatar avatar-lg av-${esc(u.role)}">${esc(initials(u.name))}</span>
          <span class="lock-user-txt"><b>${esc(u.name)}</b><small>${u.role === 'pemilik' ? 'Akses penuh · bisa edit data' : 'Kasir · transaksi & laporan'}</small></span>
          ${sel && sel.id === u.id ? icon('check') : ''}
        </button>`).join('')}
      </div>
      ${sel ? `<div class="pin-box">
        <div class="pin-dots">${Array.from({ length: Math.max(4, String(sel.pin).length) }, (_, i) =>
          `<span class="pin-dot ${i < ui.pin.length ? 'on' : ''}"></span>`).join('')}</div>
        <div class="pin-pad">
          ${['1','2','3','4','5','6','7','8','9'].map(d => `<button class="pin-key" data-action="pin-key" data-id="${d}">${d}</button>`).join('')}
          <button class="pin-key pin-fn" data-action="pin-clear">C</button>
          <button class="pin-key" data-action="pin-key" data-id="0">0</button>
          <button class="pin-key pin-fn" data-action="pin-back">${icon('chevL')}</button>
        </div>
        <button class="btn btn-primary wide" style="margin-top:4px" data-action="pin-submit">${icon('lock')} Masuk</button>
      </div>` : `<div class="hint" style="text-align:center;margin:4px 24px 20px">Ketuk nama akun untuk memasukkan PIN.</div>`}
      <div class="lock-foot small muted">Dikembangkan oleh ${APP.dev} · ${APP.name} v${APP.version}</div>
    </div>`;
  }
  function lockPick(id) {
    ui.lockUser = id; ui.pin = ''; render();
    const el = $('#view');
    if (el) el.scrollTop = 0;
  }
  function pinKey(d) {
    const u = userById(ui.lockUser);
    if (!u) return;
    if (String(ui.pin).length >= 6) return;
    ui.pin = String(ui.pin) + String(d);
    render();
    if (String(ui.pin).length >= String(u.pin).length) pinSubmit();
  }
  function pinSubmit() {
    const u = userById(ui.lockUser);
    if (!u) return;
    if (String(ui.pin) !== String(u.pin)) {
      ui.pin = '';
      render();
      return toast('PIN salah, coba lagi', 'err');
    }
    ui.userId = u.id; ui.pin = ''; ui.lockUser = '';
    try { sessionStorage.setItem('pspos.user', u.id); } catch (e) {}
    ui.tab = 'meja';
    log('akun', 'Masuk sebagai ' + u.name + ' (' + (ROLE_LABEL[u.role] || u.role) + ')');
    render(); tick();
    toast('Selamat bekerja, ' + u.name.split(' ')[0] + '!', 'ok');
  }
  function logout() {
    const u = me();
    if (u) log('akun', 'Keluar: ' + u.name);
    ui.userId = '';
    try { sessionStorage.removeItem('pspos.user'); } catch (e) {}
    closeSheet(); render();
  }
  function openAccountSheet() {
    const u = me();
    if (!u) return;
    openSheet({
      kind: 'account',
      title: 'Akun Aktif',
      sub: esc(u.name) + ' · ' + (ROLE_LABEL[u.role] || u.role),
      body: `
        <div class="acct-card">
          <span class="avatar avatar-lg av-${esc(u.role)}">${esc(initials(u.name))}</span>
          <div style="min-width:0">
            <div class="acct-name">${esc(u.name)}</div>
            <div class="small muted">${esc(ROLE_INFO[u.role] || '')}</div>
          </div>
        </div>
        ${S().authEnabled ? `<div class="switch-row" style="margin-top:14px">
          <div><div class="txt">Ganti pengguna</div><div class="sub">Kembali ke layar PIN (penjaga ↔ pemilik)</div></div>
          <button class="btn btn-sm btn-ghost" data-action="logout">${icon('logout')} Keluar</button>
        </div>` : `<div class="hint" style="margin-top:12px">Mode akun sedang <b>mati</b> — aplikasi dipakai tanpa PIN. Aktifkan di <b>Setelan → Akun &amp; Hak Akses</b>.</div>`}`,
      foot: `<button class="btn btn-ghost wide" data-action="close-sheet">Tutup</button>`
    });
  }

  /* ------------------------------------------------------------ kelola akun */
  function openUserEditor(id) {
    if (!needPerm('akun', 'Hanya pemilik yang bisa mengelola akun')) return;
    const u = id ? userById(id) : null;
    openSheet({
      kind: 'user',
      title: u ? 'Edit Akun' : 'Akun Baru',
      sub: u ? esc(u.name) : 'Buat akun penjaga atau pemilik',
      body: `
        <div class="field"><label class="lbl">Nama pengguna</label>
          <input class="input" id="u-name" value="${esc(u ? u.name : '')}" placeholder="mis. Andi / Kasir 1"></div>
        <div class="field"><label class="lbl">Peran</label>
          <select class="input" id="u-role">
            <option value="penjaga" ${u && u.role === 'penjaga' ? 'selected' : ''}>Penjaga (kasir)</option>
            <option value="pemilik" ${u && u.role === 'pemilik' ? 'selected' : ''}>Pemilik (akses penuh)</option>
          </select>
          <div class="hint" id="u-role-hint">${esc(ROLE_INFO[u && u.role === 'pemilik' ? 'pemilik' : 'penjaga'])}</div></div>
        <div class="field"><label class="lbl">PIN (4–6 angka)</label>
          <input class="input input-num" id="u-pin" inputmode="numeric" maxlength="6" value="${esc(u ? u.pin : '')}" placeholder="mis. 1234"></div>
        <div class="hint">PIN dipakai untuk masuk ke aplikasi. Beri tahu hanya kepada pengguna yang bersangkutan.</div>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-primary wide" data-action="user-save" data-id="${u ? u.id : ''}">Simpan</button>`
    });
  }
  function saveUser(id) {
    if (!needPerm('akun')) return;
    const name = ($('#u-name').value || '').trim();
    const role = $('#u-role').value === 'pemilik' ? 'pemilik' : 'penjaga';
    const pin = String($('#u-pin').value || '').replace(/\D/g, '');
    if (!name) return toast('Nama pengguna wajib diisi', 'err');
    if (pin.length < 4 || pin.length > 6) return toast('PIN harus 4–6 angka', 'err');
    const dup = activeUsers().find(u => u.pin === pin && u.id !== id);
    if (dup) return toast('PIN sudah dipakai ' + dup.name, 'err');
    if (id) {
      const u = userById(id);
      Object.assign(u, { name, role, pin });
      log('akun', 'Ubah akun ' + name + ' (' + (ROLE_LABEL[role]) + ')');
    } else {
      if (!Array.isArray(state.users)) state.users = [];
      state.users.push({ id: uid('usr'), name, role, pin, active: true, createdAt: Date.now() });
      log('akun', 'Tambah akun ' + name + ' (' + ROLE_LABEL[role] + ')');
    }
    save(); closeSheet(); render(); toast('Akun disimpan', 'ok');
  }
  function delUser(id) {
    if (!needPerm('akun')) return;
    const u = userById(id);
    if (!u) return;
    const owners = activeUsers().filter(x => x.role === 'pemilik');
    if (u.role === 'pemilik' && owners.length <= 1) return toast('Minimal harus ada satu pemilik', 'err');
    confirmSheet('Hapus akun ' + esc(u.name) + '?', 'Akun ini tidak akan bisa masuk lagi. Riwayat lognya tetap tersimpan.', 'Hapus akun', () => {
      state.users = (state.users || []).filter(x => x.id !== id);
      save(); log('akun', 'Hapus akun ' + u.name); closeSheet(); render(); toast('Akun dihapus', 'ok');
    });
  }
  function seedUsers() {
    if (!needPerm('akun')) return;
    state.users = [
      { id: 'usr_owner', name: 'Pemilik Toko', role: 'pemilik', pin: '1234', active: true, createdAt: Date.now() },
      { id: 'usr_kasir', name: 'Penjaga Kasir', role: 'penjaga', pin: '5678', active: true, createdAt: Date.now() }
    ];
    save(); log('akun', 'Membuat akun bawaan: Pemilik Toko (PIN 1234) & Penjaga Kasir (PIN 5678)');
    render(); toast('Akun bawaan dibuat', 'ok');
  }
  function toggleAuth() {
    if (!needPerm('akun', 'Hanya pemilik yang bisa mengubah mode akun')) return;
    if (!S().authEnabled && !activeUsers().length) {
      seedUsers();
    }
    S().authEnabled = !S().authEnabled;
    save(); log('akun', S().authEnabled ? 'Mode akun (PIN) diaktifkan' : 'Mode akun (PIN) dimatikan');
    if (S().authEnabled) { ui.userId = ''; try { sessionStorage.removeItem('pspos.user'); } catch (e) {} }
    render(); toast(S().authEnabled ? 'Mode akun aktif — masuk dengan PIN' : 'Mode akun mati — tanpa PIN', 'ok');
  }

  /* ================================ DATA CONTOH =========================== */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function demoInventory() {
    const rnd = mulberry32(20261110);
    const types = [
      { type: 'PS4', rate: 8000, image: 'assets/units/ps4.jpg' },
      { type: 'PS5', rate: 12000, image: 'assets/units/ps5.jpg' },
      { type: 'PS5 Pro', rate: 15000, image: 'assets/units/ps5.jpg' }
    ];
    const stations = [];
    for (let i = 1; i <= 10; i++) {
      const t = types[(i - 1) % 3];
      stations.push({ id: 'st_demo' + i, name: 'PS ' + i, type: t.type, rate: t.rate, image: t.image, demo: true });
    }
    const products = [
      { id: 'pr_demo1', name: 'Air Mineral', price: 4000, stock: 36, category: 'Minuman', image: 'assets/products/air-mineral.jpg' },
      { id: 'pr_demo2', name: 'Teh Botol', price: 5000, stock: 24, category: 'Minuman', image: 'assets/products/teh-botol.jpg' },
      { id: 'pr_demo3', name: 'Kopi Sachet', price: 4000, stock: 40, category: 'Minuman', image: 'assets/products/kopi-sachet.jpg' },
      { id: 'pr_demo4', name: 'Mie Instan', price: 10000, stock: 20, category: 'Makanan', image: 'assets/products/mie-instan.jpg' },
      { id: 'pr_demo5', name: 'Gorengan', price: 1000, stock: 60, category: 'Makanan', image: 'assets/products/gorengan.jpg' },
      { id: 'pr_demo6', name: 'Rokok Ketengan', price: 3000, stock: 48, category: 'Lainnya', image: 'assets/products/rokok-ketengan.jpg' }
    ].map(p => Object.assign(p, { demo: true }));
    const people = [
      ['Budi Santoso', '081234567890'], ['Sinta Dewi', '081298765432'], ['Rizky Pratama', '085712345678'],
      ['Nur Aisyah', '087711223344'], ['Dimas Saputra', '082133445566'], ['Wulan Sari', '089655443322']
    ];
    const customers = people.map((p, i) => ({
      id: 'cus_demo' + (i + 1), name: p[0], phone: p[1], createdAt: Date.now() - (30 - i) * 86400e3, demo: true
    }));
    return { rnd, stations, products, customers };
  }
  function demoSeed() {
    if (!needPerm('data', 'Hanya pemilik yang bisa mengisi data contoh')) return;
    confirmSheet('Isi data contoh?',
      'Data contoh berisi 10 unit PS dengan sesi berjalan, riwayat 14 hari (sewa PS + penjualan Kantin Kita), produk, dan pelanggan. Data yang ada sekarang akan diganti — unduh backup dulu bila perlu.',
      'Ya, isi data contoh', () => {
        const { rnd, stations, products, customers } = demoInventory();
        const now = Date.now();
        const dayStart = off => { const d = new Date(); d.setDate(d.getDate() - off); d.setHours(0, 0, 0, 0); return d.getTime(); };
        const pick = arr => arr[Math.floor(rnd() * arr.length)];
        const r2 = n => Math.round(n / 100) * 100;

        // 10 sesi berjalan
        const sessions = stations.map((st, i) => {
          const minsAgo = 18 + i * 14 + Math.floor(rnd() * 25);
          const items = [];
          if (i % 3 === 0) { const p = products[1]; items.push({ productId: p.id, name: p.name, price: p.price, qty: 1 + (i % 2) }); }
          if (i % 4 === 1) { const p = products[4]; items.push({ productId: p.id, name: p.name, price: p.price, qty: 3 }); }
          const c = customers[i % customers.length];
          return { id: 'ses_demo' + i, stationId: st.id, startedAt: now - minsAgo * 60000, rate: st.rate, customer: c.name, phone: c.phone, items, demo: true };
        });

        // riwayat 14 hari
        const txs = [];
        const codeFor = (ts, seq) => {
          const d = new Date(ts);
          return 'INV' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(seq);
        };
        for (let d = 13; d >= 0; d--) {
          const base = dayStart(d);
          let seq = 0;
          const rentals = d === 0 ? 2 : 5 + Math.floor(rnd() * 4);
          const kiosks = d === 0 ? 2 : 2 + Math.floor(rnd() * 4);
          for (let k = 0; k < rentals; k++) {
            const st = pick(stations);
            const minutes = pick([60, 90, 120, 150, 180, 240]);
            let startedAt = base + (10 + Math.floor(rnd() * 11)) * 3600e3 + Math.floor(rnd() * 55) * 60000;
            if (d === 0) startedAt = Math.min(startedAt, now - 30 * 60000 - minutes * 60000);
            if (d === 0 && startedAt <= base) continue;
            const play = r2(st.rate / 60 * minutes);
            const items = [];
            if (rnd() > 0.45) { const p = pick(products); items.push({ name: p.name, price: p.price, qty: 1 + Math.floor(rnd() * 2) }); }
            const itemsTotal = items.reduce((a, i) => a + i.price * i.qty, 0);
            const total = play + itemsTotal;
            const c = pick(customers);
            const method = pick(['Tunai', 'Tunai', 'QRIS', 'Transfer']);
            const endedAt = startedAt + minutes * 60000;
            seq += 1;
            txs.push({
              id: 'trx_demo_r' + d + '_' + k, code: codeFor(startedAt, seq), type: 'sewa',
              stationId: st.id, stationName: st.name, customer: c.name, customerId: c.id, customerPhone: c.phone,
              startedAt, endedAt, minutes, rate: st.rate, play, items, itemsTotal, discount: 0, total,
              method, cash: total, change: 0, createdAt: endedAt, demo: true
            });
          }
          for (let k = 0; k < kiosks; k++) {
            let createdAt = base + (9 + Math.floor(rnd() * 13)) * 3600e3 + Math.floor(rnd() * 55) * 60000;
            if (d === 0) createdAt = Math.min(createdAt, now - 8 * 60000);
            if (d === 0 && createdAt <= base) continue;
            const items = [];
            const n = 1 + Math.floor(rnd() * 3);
            for (let x = 0; x < n; x++) { const p = pick(products); const ex = items.find(i => i.name === p.name); if (ex) ex.qty += 1; else items.push({ name: p.name, price: p.price, qty: 1 }); }
            const total = items.reduce((a, i) => a + i.price * i.qty, 0);
            const c = pick(customers);
            seq += 1;
            txs.push({
              id: 'trx_demo_k' + d + '_' + k, code: codeFor(createdAt, seq), type: 'jual',
              stationId: '', stationName: '', customer: rnd() > 0.6 ? c.name : '', customerId: rnd() > 0.6 ? c.id : '',
              customerPhone: '', startedAt: createdAt, endedAt: createdAt, minutes: 0, rate: 0, play: 0,
              items, itemsTotal: total, discount: 0, total, method: pick(['Tunai', 'Tunai', 'QRIS']),
              cash: total, change: 0, createdAt, demo: true
            });
          }
        }
        txs.sort((a, b) => a.createdAt - b.createdAt);

        state.stations = stations;
        state.products = products;
        state.customers = customers;
        state.sessions = sessions;
        state.transactions = txs;
        state.agreements = [];
        state.cashbook = {};
        save();
        log('data', 'Isi data contoh: ' + stations.length + ' unit PS, ' + sessions.length + ' sesi berjalan, ' + txs.length + ' transaksi 14 hari');
        closeSheet(); ui.tab = 'meja'; render(); tick();
        try { window.scrollTo({ top: 0 }); } catch (e) {}
        toast('Data contoh siap: 10 PS + riwayat 14 hari', 'ok');
      });
  }
  function demoStats() {
    const d = o => !!(o && o.demo);
    return {
      stations: state.stations.filter(d).length,
      sessions: state.sessions.filter(d).length,
      transactions: state.transactions.filter(d).length,
      products: state.products.filter(d).length,
      customers: state.customers.filter(d).length
    };
  }
  const hasDemo = () => { const c = demoStats(); return c.stations + c.sessions + c.transactions + c.products + c.customers > 0; };
  function demoClear() {
    if (!needPerm('data', 'Hanya pemilik yang bisa menghapus data contoh')) return;
    const c = demoStats();
    if (!hasDemo()) return toast('Tidak ada data contoh untuk dihapus', '');
    confirmSheet('Hapus data contoh?',
      'Menghapus ' + c.stations + ' unit, ' + c.sessions + ' sesi berjalan, ' + c.transactions + ' transaksi, ' + c.products + ' produk, dan ' + c.customers + ' pelanggan yang berasal dari data contoh. Data yang kamu buat sendiri tetap aman.',
      'Hapus data contoh', () => {
        const keptStations = state.stations.filter(s => !s.demo);
        const keptIds = keptStations.map(s => s.id);
        state.stations = keptStations;
        state.sessions = state.sessions.filter(s => !s.demo && keptIds.includes(s.stationId));
        state.transactions = state.transactions.filter(t => !t.demo);
        state.products = state.products.filter(p => !p.demo);
        state.customers = state.customers.filter(x => !x.demo);
        state.agreements = state.agreements.filter(a => !a.demo);
        save();
        log('data', 'Hapus data contoh (' + c.transactions + ' transaksi, ' + c.stations + ' unit)');
        closeSheet(); render(); toast('Data contoh dihapus', 'ok');
      });
  }
  function wipeAll() {
    if (!needPerm('data', 'Hanya pemilik yang bisa mengosongkan data')) return;
    confirmSheet('Kosongkan semua data?',
      'Semua unit, produk, transaksi, sesi, pelanggan, dan perjanjian akan dihapus sehingga aplikasi kosong dan siap dipakai dari nol. Setelan, akun, dan log tetap disimpan.',
      'Ya, kosongkan', () => {
        state.stations = []; state.products = []; state.sessions = [];
        state.transactions = []; state.customers = []; state.agreements = []; state.cashbook = {};
        save();
        log('data', 'Semua data operasional dikosongkan');
        closeSheet(); ui.tab = 'meja'; render(); tick();
        toast('Semua data dikosongkan', 'ok');
      });
  }

  /* ========================= SINKRONISASI GOOGLE DRIVE ==================== */
  const DRIVE = {
    token: '', exp: 0, busy: false, timer: 0, queued: 0, lastErr: '',
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    connected: () => !!DRIVE.token && Date.now() < DRIVE.exp,
    payload() {
      return JSON.stringify({
        app: APP.name, appVersion: APP.version, savedAt: Date.now(),
        store: S().storeName, state
      }, null, 2);
    },
    async loadGis() {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) return true;
      if (DRIVE._gisPromise) return DRIVE._gisPromise;
      DRIVE._gisPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true; s.defer = true;
        s.onload = () => resolve(true);
        s.onerror = () => { DRIVE._gisPromise = null; reject(new Error('Script Google tidak bisa dimuat (butuh internet)')); };
        document.head.appendChild(s);
      });
      return DRIVE._gisPromise;
    },
    async connect(silent) {
      const cid = String(S().driveClientId || '').trim();
      if (!cid) {
        if (!silent) { toast('Isi Google OAuth Client ID dulu', 'err'); openDriveHelp(); }
        return false;
      }
      try { await DRIVE.loadGis(); }
      catch (e) { DRIVE.lastErr = e.message; if (!silent) toast(e.message, 'err'); return false; }
      return new Promise(resolve => {
        try {
          const tc = window.google.accounts.oauth2.initTokenClient({
            client_id: cid,
            scope: DRIVE.scope,
            callback: t => {
              if (t && t.access_token) {
                DRIVE.token = t.access_token;
                DRIVE.exp = Date.now() + ((Number(t.expires_in) || 3600) * 1000) - 60000;
                DRIVE.lastErr = '';
                resolve(true);
              } else {
                DRIVE.lastErr = (t && (t.error_description || t.error)) || 'Izin ditolak';
                if (!silent) toast('Gagal menyambung: ' + DRIVE.lastErr, 'err');
                resolve(false);
              }
            },
            error_callback: err => {
              DRIVE.lastErr = (err && err.message) || 'Gagal memuat izin Google';
              if (!silent) toast('Gagal: ' + DRIVE.lastErr, 'err');
              resolve(false);
            }
          });
          tc.requestAccessToken({ prompt: silent ? '' : 'consent' });
        } catch (e) { DRIVE.lastErr = e.message; resolve(false); }
      });
    },
    async apiFetch(url, opt = {}) {
      const res = await fetch(url, Object.assign({}, opt, {
        headers: Object.assign({ Authorization: 'Bearer ' + DRIVE.token }, opt.headers || {})
      }));
      if (res.status === 401) { DRIVE.token = ''; DRIVE.exp = 0; throw new Error('Izin kedaluwarsa — sambungkan ulang'); }
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error('Drive ' + res.status + (body ? ' · ' + body.slice(0, 90) : ''));
      }
      return res.json().catch(() => ({}));
    },
    async upload(manual) {
      if (DRIVE.busy) { if (manual) toast('Sinkron sedang berjalan…', ''); return false; }
      if (!String(S().driveClientId || '').trim()) {
        if (manual) { toast('Isi Google OAuth Client ID dulu', 'err'); openDriveHelp(); }
        return false;
      }
      DRIVE.busy = true;
      const prevStatus = S().driveStatus || '';
      try {
        if (!DRIVE.connected()) {
          const okc = await DRIVE.connect(manual ? false : true);
          if (!okc) throw new Error(DRIVE.lastErr || 'Belum tersambung ke Google Drive');
        }
        const name = String(S().driveFile || 'pspos-backup.json').trim() || 'pspos-backup.json';
        const body = DRIVE.payload();
        const q = encodeURIComponent("name='" + name.replace(/'/g, "\\'") + "' and trashed=false");
        const list = await DRIVE.apiFetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=1&fields=files(id,name,modifiedTime)&q=' + q);
        const found = (list.files || [])[0];
        if (found) {
          await DRIVE.apiFetch('https://www.googleapis.com/upload/drive/v3/files/' + encodeURIComponent(found.id) + '?uploadType=media', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body
          });
        } else {
          const boundary = 'pspos' + Date.now();
          const meta = JSON.stringify({ name, parents: ['appDataFolder'], mimeType: 'application/json' });
          const multipart = '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta +
            '\r\n--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + body +
            '\r\n--' + boundary + '--';
          await DRIVE.apiFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {
            method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=' + boundary }, body: multipart
          });
        }
        S().lastSyncAt = Date.now();
        S().driveStatus = 'ok';
        save();
        log('sinkron', 'Backup ' + (found ? 'diperbarui' : 'dibuat') + ' di Google Drive (' + Math.round(body.length / 1024) + ' KB)');
        if (manual) toast('Tersinkron ke Google Drive', 'ok');
        if (ui.tab === 'pengaturan' && !ui.modal) render();
        return true;
      } catch (e) {
        DRIVE.lastErr = e.message || 'Gagal';
        S().driveStatus = 'err';
        save();
        log('sinkron', 'Gagal sinkron: ' + DRIVE.lastErr);
        if (manual) toast('Gagal sinkron: ' + DRIVE.lastErr, 'err');
        if (ui.tab === 'pengaturan' && !ui.modal) render();
        return false;
      } finally {
        DRIVE.busy = false;
        if (prevStatus === '' && !DRIVE.lastErr) { /* status awal */ }
      }
    },
    disconnect() {
      DRIVE.token = ''; DRIVE.exp = 0; DRIVE.lastErr = '';
      S().driveStatus = '';
      save(); render(); toast('Google Drive diputuskan', 'ok');
    }
  };
  function startAutoSync() {
    clearInterval(DRIVE.timer);
    const mins = Math.max(5, Number(S().autoSyncMinutes) || 30);
    DRIVE.timer = setInterval(() => {
      if (!S().driveAuto || !S().driveClientId) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      DRIVE.upload(false);
    }, mins * 60000);
  }
  function queueAutoSync() {
    if (!S().driveAuto || !S().driveClientId) return;
    clearTimeout(DRIVE.queued);
    DRIVE.queued = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      DRIVE.upload(false);
    }, 20000);
  }
  function driveStatusChip() {
    if (!String(S().driveClientId || '').trim()) return { cls: 'off', txt: 'Belum disiapkan · isi Client ID' };
    if (S().driveStatus === 'err' && DRIVE.lastErr) return { cls: 'err', txt: 'Gagal · ' + DRIVE.lastErr };
    if (!DRIVE.connected()) return { cls: 'idle', txt: 'Siap disambungkan' };
    return { cls: 'ok', txt: 'Tersambung ke Google Drive' };
  }
  function openDriveHelp() {
    openSheet({
      kind: 'drive-help',
      title: 'Cara menyambungkan Google Drive',
      sub: 'Sekali saja, butuh akun Google',
      body: `
        <div class="hint" style="margin-top:0">Aplikasi ini berjalan offline dan tidak menyimpan data di server mana pun. Sinkronisasi memakai <b>Google Drive milikmu sendiri</b>, jadi kamu butuh <b>OAuth Client ID</b> gratis dari Google Cloud.</div>
        <ol class="step-list">
          <li>Buka <b>console.cloud.google.com</b> → buat project (mis. <i>PS Rent POS</i>).</li>
          <li>Menu <b>APIs &amp; Services → Library</b> → aktifkan <b>Google Drive API</b>.</li>
          <li>Menu <b>OAuth consent screen</b> → pilih <i>External</i> → isi nama aplikasi &amp; email, simpan (mode testing cukup).</li>
          <li><b>Credentials → Create credentials → OAuth client ID → Web application</b>.</li>
          <li>Di <b>Authorized JavaScript origins</b> isi alamat aplikasi ini (mis. <b>http://localhost:8080</b> atau domain hostingmu).</li>
          <li>Salin <b>Client ID</b> (bentuknya <i>…apps.googleusercontent.com</i>) lalu tempel di kolom Client ID di Setelan.</li>
          <li>Ketuk <b>Sambungkan</b> → izinkan akses → ketuk <b>Sinkronkan sekarang</b>.</li>
        </ol>
        <div class="hint">File backup disimpan di folder tersembunyi <b>appDataFolder</b> milik aplikasi, jadi tidak mengotori Drive-mu. Nama file bisa diubah di kolom <b>Nama file backup</b>, mis. <i>pspos-backup.json</i>.
        <br><br>Catatan: karena hanya memakai Client ID (tanpa server), aplikasi meminta izin ulang setelah token kedaluwarsa (±1 jam) — cukup ketuk <b>Sambungkan</b> lagi.</div>
        <div class="hint">Tanpa internet tetap aman: semua data tersimpan di perangkat ini. Sinkronisasi hanya menyalin cadangannya ke Drive saat online.</div>`,
      foot: `<button class="btn btn-primary wide" data-action="close-sheet">Mengerti</button>`
    });
  }

  /* ----------------------------- kartu Setelan ---------------------------- */
  function cardAccounts() {
    const u = me();
    const users = activeUsers();
    const tick = c => `<span class="perm-yes">${c ? '✓' : '–'}</span>`;
    return `
      <div class="sec-head"><div><div class="sec-title">Akun &amp; Hak Akses</div>
        <div class="sec-sub">Pemilik bisa edit data · penjaga hanya kasir</div></div></div>
      <div class="card" style="padding:14px">
        <div class="switch-row" style="border-top:0;padding-top:0">
          <div><div class="txt">Mode akun (login PIN)</div>
            <div class="sub">${S().authEnabled ? 'Aktif — aplikasi meminta PIN saat dibuka' : 'Mati — siapa pun yang memegang perangkat bisa membuka'}</div></div>
          <button class="chip ${S().authEnabled ? 'active' : ''}" data-action="auth-toggle">${S().authEnabled ? 'Aktif' : 'Mati'}</button>
        </div>
        ${users.length ? `<div class="user-list">${users.map(x => `
          <div class="user-row">
            <span class="avatar av-${esc(x.role)}">${esc(initials(x.name))}</span>
            <div class="user-main">
              <div class="user-name">${esc(x.name)} ${u && x.id === u.id ? '<span class="badge-me">kamu</span>' : ''}</div>
              <div class="user-sub"><span class="role-chip role-${x.role}">${esc(ROLE_LABEL[x.role] || x.role)}</span> PIN ${'•'.repeat(String(x.pin || '').length)}</div>
            </div>
            <div class="row-actions">
              <button class="icon-btn" data-action="user-edit" data-id="${x.id}" aria-label="Edit akun">${icon('edit')}</button>
              <button class="icon-btn" data-action="user-del" data-id="${x.id}" aria-label="Hapus akun">${icon('trash')}</button>
            </div>
          </div>`).join('')}</div>`
          : `<div class="hint">Belum ada akun. Ketuk <b>Akun baru</b> atau <b>Pakai akun bawaan</b> (Pemilik PIN 1234 · Penjaga PIN 5678).</div>`}
        <div class="chips" style="margin-top:12px">
          <button class="chip chip-upload" data-action="user-new">${icon('plus')} Akun baru</button>
          ${users.length ? '' : `<button class="chip" data-action="user-seed">Pakai akun bawaan</button>`}
          ${S().authEnabled ? `<button class="chip" data-action="logout">${icon('logout')} Keluar</button>` : ''}
        </div>
        <div class="perm-grid">
          <div class="perm-h">Hak akses</div><div class="perm-h">Pemilik</div><div class="perm-h">Penjaga</div>
          <div>Kasir: sesi, kantin, bayar</div>${tick(1)}${tick(1)}
          <div>Lihat laporan &amp; transaksi</div>${tick(1)}${tick(1)}
          <div>Riwayat aktivitas</div><div class="perm-yes">semua</div><div class="perm-no">miliknya</div>
          <div>Ubah unit, produk &amp; tarif</div>${tick(1)}${tick(0)}
          <div>Setelan, backup &amp; Drive</div>${tick(1)}${tick(0)}
          <div>Data contoh &amp; hapus data</div>${tick(1)}${tick(0)}
          <div>Kelola akun pengguna</div>${tick(1)}${tick(0)}
        </div>
      </div>`;
  }

  function cardAudit() {
    const rows = filteredLogs().slice(0, 6);
    return `
      <div class="sec-head"><div><div class="sec-title">Riwayat Aktivitas</div>
        <div class="sec-sub">Log pemakaian POS ${isOwner() ? '· semua pengguna' : '· milikmu'}</div></div>
        <div class="spacer"></div>
        <button class="btn btn-sm btn-ghost" data-action="log-open">Lihat semua</button></div>
      <div class="card" style="padding:6px 14px">
        ${rows.length ? rows.map(logRowHTML).join('')
          : `<div class="hint" style="padding:10px 0">Belum ada aktivitas. Setiap sesi, transaksi, dan perubahan data akan tercatat di sini.</div>`}
      </div>`;
  }

  function cardDrive() {
    const st = driveStatusChip();
    const last = S().lastSyncAt ? fmtDate(S().lastSyncAt) + ' ' + fmtHM(S().lastSyncAt) : 'belum pernah';
    return `
      <div class="sec-head"><div><div class="sec-title">Sinkronisasi Google Drive</div>
        <div class="sec-sub">Backup otomatis ke Drive milikmu</div></div></div>
      <div class="card" style="padding:14px">
        <div class="sync-status sync-${st.cls}">
          <span class="sync-dot"></span>
          <div style="min-width:0">
            <div class="sync-txt">${esc(st.txt)}</div>
            <div class="sync-sub">Sinkron terakhir: ${last}</div>
          </div>
        </div>
        <div class="switch-row">
          <div><div class="txt">Sinkron otomatis</div>
            <div class="sub">Kirim backup tiap ${Number(S().autoSyncMinutes) || 30} menit &amp; setelah transaksi</div></div>
          <button class="chip ${S().driveAuto ? 'active' : ''}" data-action="drive-auto">${S().driveAuto ? 'Aktif' : 'Mati'}</button>
        </div>
        <div class="field"><label class="lbl">Google OAuth Client ID</label>
          <input class="input" data-set="settings.driveClientId" value="${esc(S().driveClientId || '')}" placeholder="…apps.googleusercontent.com">
          <div class="hint">Belum punya? <button class="link-btn" data-action="drive-help">Lihat cara membuat (5 menit)</button>.</div></div>
        <div class="field-row">
          <div class="field"><label class="lbl">Nama file backup</label>
            <input class="input" data-set="settings.driveFile" value="${esc(S().driveFile || 'pspos-backup.json')}"></div>
          <div class="field"><label class="lbl">Jeda sinkron (menit)</label>
            <input class="input input-num" type="number" min="5" step="5" data-set="settings.autoSyncMinutes" value="${Number(S().autoSyncMinutes) || 30}"></div>
        </div>
        <div class="chips" style="margin-top:4px">
          <button class="chip chip-upload" data-action="drive-connect">${icon('cloud')} ${DRIVE.connected() ? 'Sambung ulang' : 'Sambungkan'}</button>
          <button class="chip" data-action="drive-sync">${icon('upload')} Sinkronkan sekarang</button>
          ${DRIVE.connected() ? `<button class="chip" data-action="drive-off">${icon('x')} Putuskan</button>` : ''}
        </div>
        <div class="hint">File disimpan di folder tersembunyi <b>appDataFolder</b> aplikasi ini, tidak mengotori Drive. Data tetap tersimpan di perangkat walau offline.</div>
        <div class="switch-row">
          <div><div class="txt">Backup manual (unduh file)</div><div class="sub">File JSON berisi semua data &amp; pengaturan</div></div>
          <button class="btn btn-sm btn-ghost" data-action="backup">${icon('download')} Unduh</button>
        </div>
        <div class="switch-row">
          <div><div class="txt">Restore dari file</div><div class="sub">Pulihkan data dari file backup</div></div>
          <label class="btn btn-sm btn-ghost" style="margin:0">${icon('upload')}
            <input type="file" id="restore-file" accept="application/json" hidden>
          </label>
        </div>
      </div>`;
  }

  function cardDemo() {
    const c = demoStats();
    return `
      <div class="sec-head"><div><div class="sec-title">Data Contoh &amp; Reset</div>
        <div class="sec-sub">Coba aplikasi dengan 10 PS + laporan 14 hari</div></div></div>
      <div class="card" style="padding:14px">
        <div class="demo-stats">
          <div><b>${c.stations}</b><span>unit contoh</span></div>
          <div><b>${c.sessions}</b><span>sesi berjalan</span></div>
          <div><b>${c.transactions}</b><span>transaksi</span></div>
          <div><b>${c.products}</b><span>produk</span></div>
        </div>
        <div class="chips" style="margin-top:12px">
          <button class="chip chip-upload" data-action="demo-seed">${icon('bolt')} Isi data contoh</button>
          ${hasDemo() ? `<button class="chip chip-danger" data-action="demo-clear">${icon('trash')} Hapus data contoh</button>` : ''}
        </div>
        <div class="hint">Data contoh berisi <b>10 unit PS yang sedang dipakai main</b>, riwayat <b>14 hari</b> sewa PS + penjualan Kantin Kita, produk, dan pelanggan. Semua item contoh ditandai sehingga bisa dihapus sekali ketuk tanpa mengganggu data asli.</div>
        <div class="switch-row" style="margin-top:6px">
          <div><div class="txt">Kosongkan semua data</div><div class="sub">Mulai dari nol — setelan, akun &amp; log tetap disimpan</div></div>
          <button class="btn btn-sm btn-red" data-action="wipe-data">${icon('trash')}</button>
        </div>
      </div>`;
  }

  function viewPengaturanPenjaga() {
    const cfg = S();
    const u = me();
    const rows = filteredLogs().slice(0, 6);
    return `
      <div class="sec-head" style="margin-top:8px"><div><div class="sec-title">Akun Penjaga</div>
        <div class="sec-sub">Mode kasir — pengaturan &amp; data dikunci</div></div></div>
      <div class="card" style="padding:14px">
        <div class="acct-card">
          <span class="avatar avatar-lg av-${esc(u ? u.role : 'penjaga')}">${esc(initials(u ? u.name : 'P'))}</span>
          <div style="min-width:0">
            <div class="acct-name">${esc(u ? u.name : 'Penjaga')}</div>
            <div class="small muted">${esc(ROLE_INFO.penjaga)}</div>
          </div>
        </div>
        <div class="chips" style="margin-top:12px">
          <button class="chip" data-action="open-account">${icon('shield')} Hak akses</button>
          <button class="chip" data-action="logout">${icon('logout')} Keluar</button>
        </div>
        <div class="hint">Butuh ubah tarif, produk, atau backup? Minta <b>pemilik</b> membuka aplikasi dengan PIN pemilik.</div>
      </div>

      <div class="sec-head"><div><div class="sec-title">Tampilan</div>
        <div class="sec-sub">Pilih tema yang paling nyaman dipakai</div></div></div>
      <div class="card" style="padding:14px">
        <div class="seg">
          ${THEMES.map(t => `<button class="${cfg.theme === t.id ? 'active' : ''}" data-action="set-theme" data-id="${t.id}">${icon(t.icon)} ${t.label}</button>`).join('')}
        </div>
        <div class="hint">${cfg.theme === 'gelap' ? 'Tema <b>Gelap</b> aktif.' : 'Tema <b>Cerah</b> aktif — nyaman dipakai lama dan tidak silau.'}</div>
      </div>

      <div class="sec-head"><div><div class="sec-title">Riwayat Aktivitas</div>
        <div class="sec-sub">Aktivitasmu di POS ini</div></div>
        <div class="spacer"></div>
        <button class="btn btn-sm btn-ghost" data-action="log-open">Lihat semua</button></div>
      <div class="card" style="padding:6px 14px">
        ${rows.length ? rows.map(logRowHTML).join('')
          : `<div class="hint" style="padding:10px 0">Belum ada aktivitas tercatat.</div>`}
      </div>

      <div class="app-foot small muted" style="text-align:center;margin:18px 0 6px;line-height:1.7">
        Dikembangkan oleh ${APP.dev} · ${APP.name} v${APP.version}<br>
        data tersimpan lokal di perangkat ini · ${state.sessions.length} sesi aktif
      </div>`;
  }

  /* ================================ ACTIONS ============================== */
  function startSession(stationId) {
    const st = stationById(stationId);
    if (!st) return;
    if (sessionByStation(stationId)) return toast('Unit ini sedang dipakai', 'err');
    const rate = clamp(num($('#start-rate').value) || st.rate, 0, 1e7);
    const customer = ($('#start-customer').value || '').trim();
    const phone = ($('#start-phone').value || '').trim();
    state.sessions.push({ id: uid('ses'), stationId, startedAt: Date.now(), rate, customer, phone, items: [] });
    save();
    log('sesi', 'Mulai sesi ' + st.name + (customer ? ' · ' + customer : '') + ' · ' + rp(rate) + '/jam');
    closeSheet(); render(); tick();
    toast('Sesi dimulai di ' + st.name, 'ok');
  }

  function addSessionItem(sessionId, productId, qty = 1) {
    const s = sessionById(sessionId), p = productById(productId);
    if (!s || !p) return;
    const have = (s.items.find(i => i.productId === productId)?.qty || 0);
    if (have + qty > p.stock) return toast('Stok ' + p.name + ' tinggal ' + p.stock, 'err');
    const existing = s.items.find(i => i.productId === productId);
    if (existing) existing.qty += qty;
    else s.items.push({ productId, name: p.name, price: p.price, qty });
    save();
    const holder = $('#sess-items');
    if (holder) holder.innerHTML = sessionItemsHTML(s);
    recomputePay(); renderTabbar();
  }

  function removeSessionItem(sessionId, idx) {
    const s = sessionById(sessionId);
    if (!s) return;
    s.items.splice(idx, 1); save();
    const holder = $('#sess-items');
    if (holder) holder.innerHTML = sessionItemsHTML(s);
    recomputePay();
  }

  function currentMethodIdx() {
    const active = $('#method-chips .chip.active');
    return active ? Number(active.dataset.id) : 0;
  }

  function finalizeSession(sessionId) {
    const s = sessionById(sessionId);
    if (!s) return;
    const st = stationById(s.stationId) || { name: 'Unit' };
    const bill = sessionBill(s);
    const disc = clamp(num(ui.discount), 0, bill.sub);
    const total = Math.max(0, bill.sub - disc);
    const cash = num(ui.cash);

    // validasi stok
    for (const it of s.items) {
      const p = productById(it.productId);
      if (p && it.qty > p.stock) return toast('Stok ' + p.name + ' tidak cukup', 'err');
    }
    if (cash && cash < total) return toast('Uang diterima kurang dari total', 'err');

    const cust = upsertCustomer(s.customer, s.phone);

    const tx = {
      id: uid('trx'),
      code: nextInvoiceCode(),
      type: 'sewa',
      stationId: s.stationId,
      stationName: st.name,
      customer: s.customer,
      customerId: cust ? cust.id : '',
      customerPhone: cust ? cust.phone : '',
      startedAt: s.startedAt,
      endedAt: Date.now(),
      minutes: bill.minutes,
      rate: s.rate,
      play: bill.play,
      items: s.items.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
      itemsTotal: bill.items,
      discount: disc,
      total,
      method: S().methods[currentMethodIdx()] || 'Tunai',
      cash: cash || total,
      change: Math.max(0, (cash || total) - total),
      createdAt: Date.now()
    };

    // kurangi stok
    s.items.forEach(it => { const p = productById(it.productId); if (p) p.stock = Math.max(0, p.stock - it.qty); });

    state.transactions.push(tx);
    state.sessions = state.sessions.filter(x => x.id !== sessionId);
    save();
    log('transaksi', 'Bayar ' + tx.code + ' · ' + st.name + ' · ' + rp(total) + ' · ' + tx.method
      + (disc ? ' · diskon ' + rp(disc) : ''));
    queueAutoSync();
    closeSheet(); render();
    printReceipt(tx);
    toast('Pembayaran ' + rp(total) + ' tersimpan', 'ok');
  }

  function nextInvoiceCode() {
    const d = new Date();
    const base = 'INV' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
    const n = state.transactions.filter(t => t.code && t.code.startsWith(base)).length + 1;
    return base + '-' + pad(n);
  }

  /* ------------------------------- direct sale --------------------------- */
  function openDirectSale() {
    ui.cart = {}; ui.cartCash = ''; ui.cartCust = ''; ui.cartPhone = '';
    openSheet({
      kind: 'direct',
      title: '<span class="kantin-strong">Kantin Kita</span>',
      sub: 'Jual minuman & makanan tanpa sewa unit',
      body: `
        <div class="sec-head" style="margin:0 0 10px"><div class="sec-title" style="font-size:13px">Pilih produk</div></div>
        <div class="prod-grid" style="margin-bottom:14px">
          ${state.products.map(p => `
            <button class="prod ${p.stock <= 5 ? 'prod-low' : ''}" data-action="cart-add" data-id="${p.id}" ${p.stock <= 0 ? 'disabled style="opacity:.4"' : ''}>
              <div class="prod-photo">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">` : `<span class="ph">${icon('box')}</span>`}</div>
              <div class="prod-name">${esc(p.name)}</div>
              <div class="prod-price">${rp(p.price)}</div>
              <div class="prod-stock">${p.stock > 0 ? 'Stok ' + p.stock : 'Habis'}</div>
            </button>`).join('')}
        </div>
        <div id="cart-wrap">${cartHTML()}</div>
        <div class="field-row" style="margin-top:12px">
          <div class="field"><label class="lbl">Nama pelanggan (ops.)</label>
            <input class="input" id="cart-cust" placeholder="mis. Budi" autocomplete="off" value="${esc(ui.cartCust)}"></div>
          <div class="field"><label class="lbl">No. HP (ops.)</label>
            <input class="input input-num" id="cart-phone" type="tel" inputmode="tel" placeholder="0812…" autocomplete="off" value="${esc(ui.cartPhone)}"></div>
        </div>
        <div class="field" style="margin-top:12px">
          <label class="lbl">Uang diterima</label>
          <input class="input input-num" id="cart-cash" type="number" inputmode="numeric" min="0" step="1000" placeholder="0" value="${ui.cartCash}">
        </div>
        <div class="change-box" id="cart-change-box"><span>Kembalian</span><span id="cart-change">Rp 0</span></div>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-primary wide" data-action="cart-pay">${icon('check')} Bayar &amp; Struk</button>`
    });
    refreshCart();
  }

  function cartLines() {
    return Object.keys(ui.cart).filter(k => ui.cart[k] > 0).map(id => {
      const p = productById(id);
      return p ? { p, qty: ui.cart[id] } : null;
    }).filter(Boolean);
  }
  const cartTotal = () => cartLines().reduce((a, l) => a + l.p.price * l.qty, 0);

  function cartHTML() {
    const lines = cartLines();
    if (!lines.length) return `<div class="small muted" style="padding:10px 0">Belum ada produk dipilih.</div>`;
    return lines.map(l => `
      <div class="item-line">
        <span class="item-thumb">${l.p.image ? `<img src="${esc(l.p.image)}" alt="" loading="lazy">` : icon('box')}</span>
        <div class="nm">${esc(l.p.name)}<small>${rp(l.p.price)}</small></div>
        <div class="qty-step">
          <button data-action="cart-dec" data-id="${l.p.id}">−</button>
          <span>${l.qty}</span>
          <button data-action="cart-inc" data-id="${l.p.id}">+</button>
        </div>
        <div class="amt">${rp(l.p.price * l.qty)}</div>
      </div>`).join('') + `
      <div class="bill-line total" style="margin-top:8px"><span class="k">Total</span><span class="v">${rp(cartTotal())}</span></div>`;
  }

  function refreshCart() {
    const w = $('#cart-wrap'); if (w) w.innerHTML = cartHTML();
    const total = cartTotal();
    const cash = num(ui.cartCash);
    const ch = $('#cart-change');
    if (ch) ch.textContent = rp(cash - total);
    const box = $('#cart-change-box');
    if (box) box.classList.toggle('neg', cash > 0 && cash < total);
  }

  function payDirectSale() {
    const lines = cartLines();
    if (!lines.length) return toast('Pilih produk dulu', 'err');
    for (const l of lines) if (l.qty > l.p.stock) return toast('Stok ' + l.p.name + ' tidak cukup', 'err');
    const total = cartTotal();
    const cash = num(ui.cartCash) || total;
    if (cash < total) return toast('Uang diterima kurang', 'err');

    const cust = upsertCustomer(ui.cartCust, ui.cartPhone);
    const tx = {
      id: uid('trx'), code: nextInvoiceCode(), type: 'minibar',
      customer: cust ? cust.name : '', customerId: cust ? cust.id : '', customerPhone: cust ? cust.phone : '',
      stationName: '', startedAt: Date.now(), endedAt: Date.now(),
      minutes: 0, rate: 0, play: 0,
      items: lines.map(l => ({ name: l.p.name, price: l.p.price, qty: l.qty })),
      itemsTotal: total, discount: 0, total,
      method: 'Tunai', cash, change: cash - total, createdAt: Date.now()
    };
    lines.forEach(l => { l.p.stock = Math.max(0, l.p.stock - l.qty); });
    state.transactions.push(tx); save();
    log('transaksi', 'Kantin ' + tx.code + ' · ' + rp(total) + ' · ' + lines.length + ' jenis item');
    queueAutoSync();
    closeSheet(); render();
    printReceipt(tx);
    toast('Penjualan ' + rp(total) + ' tersimpan', 'ok');
  }

  /* ------------------------------- product editor ------------------------ */
  function openProductEditor(id) {
    const p = id ? productById(id) : null;
    ui.pendingProductImage = p ? (p.image || '') : '';
    openSheet({
      kind: 'product',
      title: p ? 'Edit Produk' : 'Produk Baru',
      sub: p ? esc(p.name) : 'Tambah produk Kantin Kita',
      body: `
        <div class="field"><label class="lbl">Nama produk</label>
          <input class="input" id="p-name" value="${esc(p ? p.name : '')}" placeholder="mis. Es Teh Manis"></div>
        <div class="field-row">
          <div class="field"><label class="lbl">Harga jual</label>
            <input class="input input-num" id="p-price" type="number" inputmode="numeric" min="0" step="500" value="${p ? p.price : 0}"></div>
          <div class="field"><label class="lbl">Stok</label>
            <input class="input input-num" id="p-stock" type="number" inputmode="numeric" min="0" step="1" value="${p ? p.stock : 0}"></div>
        </div>
        <div class="field"><label class="lbl">Kategori</label>
          <input class="input" id="p-cat" value="${esc(p ? p.category : '')}" placeholder="Minuman / Makanan / Lainnya"></div>
        <div class="field" style="margin-bottom:0">
          <label class="lbl">Foto produk</label>
          <div class="unit-photo" id="pr-image-preview">${productPhotoHTML()}</div>
          <div class="chips" style="margin-top:10px">
            ${PRODUCT_PRESETS.map(pp => `<button class="chip" data-action="pr-img-preset" data-id="${pp.src}">${pp.name}</button>`).join('')}
            <label class="chip chip-upload">${icon('upload')} Upload foto<input type="file" id="pr-image-file" accept="image/*" hidden></label>
          </div>
          <div class="field-row" style="margin-top:10px">
            <input class="input" id="pr-image-url" placeholder="atau tempel URL gambar…">
            <button class="btn btn-ghost" style="flex:0 0 auto" data-action="pr-img-url">Pakai</button>
          </div>
          <div class="hint">Contoh gambar sudah tersedia (Air Mineral, Teh Botol, Kopi, Mie, Gorengan, Rokok). Ganti dengan foto produkmu sendiri kapan saja.</div>
        </div>
        ${p ? `<button class="btn btn-ghost btn-block" style="margin-top:12px" data-action="restock" data-id="${p.id}">${icon('plus')} Tambah stok +10</button>` : ''}`,
      foot: `${p ? `<button class="btn btn-red" data-action="del-product" data-id="${p.id}">${icon('trash')}</button>` : ''}
             <button class="btn btn-primary wide" data-action="save-product" data-id="${p ? p.id : ''}">Simpan</button>`
    });
  }

  function saveProduct(id) {
    const name = ($('#p-name').value || '').trim();
    if (!name) return toast('Nama produk wajib diisi', 'err');
    const data = {
      name,
      price: clamp(num($('#p-price').value), 0, 1e8),
      stock: clamp(num($('#p-stock').value), 0, 1e6),
      category: ($('#p-cat').value || '').trim(),
      image: ui.pendingProductImage || ''
    };
    if (id) { const p = productById(id); Object.assign(p, data); }
    else state.products.push(Object.assign({ id: uid('pr') }, data));
    save();
    log('data', (id ? 'Ubah produk ' : 'Tambah produk ') + name + ' · ' + rp(data.price) + ' · stok ' + data.stock);
    closeSheet(); render(); toast('Produk disimpan', 'ok');
  }

  /* ------------------------------- station editor ------------------------ */
  function openStationEditor(id) {
    const st = id ? stationById(id) : null;
    const types = ['PS3', 'PS4', 'PS5', 'PS5 Pro', 'Xbox', 'PC', 'VR', 'Lainnya'];
    ui.pendingImage = st ? (st.image || '') : '';
    openSheet({
      kind: 'station',
      title: st ? 'Edit Unit' : 'Unit Baru',
      sub: st ? esc(st.name) : 'Tambah meja / konsol + fotonya',
      body: `
        <div class="field"><label class="lbl">Nama unit</label>
          <input class="input" id="s-name" value="${esc(st ? st.name : '')}" placeholder="mis. PS 5 / VIP 1"></div>
        <div class="field-row">
          <div class="field"><label class="lbl">Jenis</label>
            <select class="input" id="s-type">
              ${types.map(t => `<option ${st && st.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select></div>
          <div class="field"><label class="lbl">Tarif per jam</label>
            <input class="input input-num" id="s-rate" type="number" inputmode="numeric" min="0" step="500" value="${st ? st.rate : S().defaultRate}"></div>
        </div>
        <div class="field">
          <label class="lbl">Harga sewa 1 hari (24 jam)</label>
          <input class="input input-num" id="s-dayrate" type="number" inputmode="numeric" min="0" step="1000" value="${st ? stationDayRate(st) : Math.round((S().defaultRate * 8) / 1000) * 1000}">
          <div class="hint">Dipakai sebagai dasar paket 12 jam / 24 jam / harian dan denda keterlambatan per jam.</div>
        </div>
        <div class="field" style="margin-bottom:0">
          <label class="lbl">Foto unit</label>
          <div class="unit-photo" id="st-image-preview">${unitPhotoHTML()}</div>
          <div class="chips" style="margin-top:10px">
            ${UNIT_PRESETS.map(p => `<button class="chip" data-action="st-img-preset" data-id="${p.src}">${p.name}</button>`).join('')}
            <label class="chip chip-upload">${icon('upload')} Upload foto<input type="file" id="st-image-file" accept="image/*" hidden></label>
          </div>
          <div class="field-row" style="margin-top:10px">
            <input class="input" id="st-image-url" placeholder="atau tempel URL gambar…">
            <button class="btn btn-ghost" style="flex:0 0 auto" data-action="st-img-url">Pakai</button>
          </div>
          <div class="hint">Foto konsol yang benar-benar dipakai di tempatmu. Upload dari galeri, tempel URL, atau pakai preset — ukuran otomatis diperkecil.</div>
        </div>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-primary wide" data-action="save-station" data-id="${st ? st.id : ''}">Simpan</button>`
    });
  }

  function saveStation(id) {
    const name = ($('#s-name').value || '').trim();
    if (!name) return toast('Nama unit wajib diisi', 'err');
    const data = {
      name,
      type: $('#s-type').value,
      rate: clamp(num($('#s-rate').value), 0, 1e7),
      dayRate: clamp(num($('#s-dayrate').value), 0, 1e8),
      image: ui.pendingImage || ''
    };
    if (id) Object.assign(stationById(id), data);
    else state.stations.push(Object.assign({ id: uid('st') }, data));
    save();
    log('data', (id ? 'Ubah unit ' : 'Tambah unit ') + name + ' · ' + data.type + ' · ' + rp(data.rate) + '/jam');
    closeSheet(); render(); toast('Unit disimpan', 'ok');
  }

  /* ------------------------------- transactions -------------------------- */
  function openTxDetail(id) {
    const t = state.transactions.find(x => x.id === id);
    if (!t) return;
    openSheet({
      kind: 'tx',
      title: t.code,
      sub: `${t.type === 'sewa' ? 'Sewa ' + esc(t.stationName) : 'Jual langsung'} · ${fmtDate(t.createdAt)} ${fmtHM(t.createdAt)}`,
      body: `${receiptHTML(t, true)}
        ${(() => {
          const c = t.customerId ? custById(t.customerId) : findCustomer(t.customer, t.customerPhone);
          if (!c) return '';
          return `<div class="cust-pill">${icon('user')} <b>${esc(c.name)}</b>${c.phone ? ' · ' + esc(custDisplayPhone(c.phone)) : ' · belum ada no. HP'} · ${custStats(c).count}× datang</div>`;
        })()}
        <div class="small muted" style="margin-top:12px;line-height:1.7">
          Metode: <b>${esc(t.method)}</b> · Bayar ${rp(t.cash)} · Kembali ${rp(t.change)}${t.discount ? ' · Diskon ' + rp(t.discount) : ''}
        </div>`,
      foot: `${can('data') ? `<button class="btn btn-red" data-action="del-tx" data-id="${t.id}">${icon('trash')}</button>` : ''}
             <button class="btn btn-ghost" data-action="wa-share" data-id="${t.id}">${icon('wa')} Kirim</button>
             <button class="btn btn-primary wide" data-action="reprint" data-id="${t.id}">${icon('print')} Cetak</button>`
    });
  }

  function deleteTx(id) {
    confirmSheet('Hapus transaksi?', 'Transaksi akan dihapus permanen. Stok tidak dikembalikan otomatis.', 'Hapus', () => {
      const del = state.transactions.find(t => t.id === id);
      state.transactions = state.transactions.filter(t => t.id !== id);
      save();
      log('transaksi', 'Hapus transaksi ' + ((del && del.code) || '') + (del ? ' · ' + rp(del.total) : ''));
      closeSheet(); render(); toast('Transaksi dihapus', 'ok');
    });
  }

  /* ------------------------------- struk & print ------------------------- */
  // Logo nota: pakai gambar toko kalau ada. Kalau belum, pakai lambang bawaan
  // (ubin hijau + ikon gamepad) supaya kepala nota tidak pernah kosong.
  // tanggal ringkas (dd/MM/yy) untuk nota 58 mm supaya kode + jam tetap satu baris
  function receiptDateShort(ts) {
    const d = new Date(ts || Date.now());
    const p2 = n => String(n).padStart(2, '0');
    return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(-2) + ' ' + fmtHM(ts);
  }

  function receiptLogoHTML(cfg) {
    if (cfg.logo) return `<img class="rlogo-img" src="${esc(cfg.logo)}" alt="Logo ${esc(cfg.storeName || 'toko')}">`;
    return `<div class="rlogo-ph">${icon('gamepad')}</div>`;
  }

  function receiptHTML(t, preview) {
    const cfg = S();
    const lines = (t.items || []).map(it =>
      `<div class="ln"><span>${esc(it.name)} ${it.qty}×${it.price.toLocaleString('id-ID')}</span><span>${(it.price * it.qty).toLocaleString('id-ID')}</span></div>`
    ).join('');
    const signName = (cfg.signName || '').trim() || cfg.storeName || 'PS RENT';
    return `
      <div class="receipt" ${preview ? 'style="margin-bottom:2px"' : ''}>
        ${cfg.logoReceipt !== false ? `<div class="c rlogo">${receiptLogoHTML(cfg)}</div>` : ''}
        <div class="c store">${esc(cfg.storeName || 'PS RENT')}</div>
        ${cfg.tagline ? `<div class="c sub">${esc(cfg.tagline)}</div>` : ''}
        ${cfg.address ? `<div class="c sub">${esc(cfg.address)}</div>` : ''}
        ${cfg.phone ? `<div class="c sub">${esc(cfg.phone)}</div>` : ''}
        <hr>
        <div class="ln"><span>${esc(t.code)}</span><span>${receiptPaper().wIn < 50 ? receiptDateShort(t.createdAt) : fmtDate(t.createdAt) + ' ' + fmtHM(t.createdAt)}</span></div>
        ${t.type === 'sewa' ? `
          <div class="ln"><span>Unit</span><span>${esc(t.stationName || '-')}</span></div>
          ${t.customer ? `<div class="ln"><span>Nama</span><span>${esc(t.customer)}</span></div>` : ''}
          <div class="ln"><span>Main</span><span>${fmtHM(t.startedAt)}–${fmtHM(t.endedAt)} (${fmtMin(t.minutes)})</span></div>
          <div class="ln"><span>Sewa ${rp(t.rate)}/jam</span><span>${(t.play || 0).toLocaleString('id-ID')}</span></div>
        ` : `<div class="ln"><span>Jenis</span><span>Jual langsung</span></div>`}
        ${lines ? '<hr>' + lines : ''}
        <hr>
        ${t.discount ? `<div class="ln"><span>Diskon</span><span>-${t.discount.toLocaleString('id-ID')}</span></div>` : ''}
        <div class="ln b"><span>TOTAL</span><span>${rp(t.total)}</span></div>
        <div class="ln"><span>Bayar (${esc(t.method)})</span><span>${(t.cash || 0).toLocaleString('id-ID')}</span></div>
        <div class="ln"><span>Kembali</span><span>${(t.change || 0).toLocaleString('id-ID')}</span></div>
        <hr>
        <div class="foot">${esc(cfg.receiptFooter || 'Terima kasih 🙏')}</div>
        ${cfg.signReceipt !== false ? `
          <div class="sign">
            <div class="sign-lbl">Hormat kami,</div>
            <div class="sign-space"></div>
            <div class="sign-line"></div>
            <div class="sign-name">${esc(signName)}</div>
          </div>` : ''}
      </div>`;
  }

  function receiptLines(t) {
    const cfg = S();
    const out = [];
    const push = (text, center) => out.push({ t: text == null ? '' : String(text), c: !!center });
    push((cfg.storeName || 'PS RENT').toUpperCase(), true);
    if (cfg.tagline) push(cfg.tagline, true);
    if (cfg.address) push(cfg.address, true);
    if (cfg.phone) push('Telp/WA: ' + cfg.phone, true);
    push('--------------------------------');
    push(t.code + '  ' + fmtDate(t.createdAt) + ' ' + fmtHM(t.createdAt));
    if (t.type === 'sewa') {
      push('Unit   : ' + (t.stationName || '-'));
      if (t.customer) push('Nama   : ' + t.customer);
      push('Main   : ' + fmtHM(t.startedAt) + '-' + fmtHM(t.endedAt) + ' (' + fmtMin(t.minutes) + ')');
      push('Sewa   : ' + rp(t.play));
    } else {
      push('Jenis  : Kantin Kita');
    }
    (t.items || []).forEach(it => push(it.name + ' ' + it.qty + 'x' + it.price + ' = ' + it.price * it.qty));
    if (t.discount) push('Diskon : -' + rp(t.discount));
    push('TOTAL  : ' + rp(t.total));
    push('Bayar  : ' + rp(t.cash) + ' (' + t.method + ')');
    push('Kembali: ' + rp(t.change));
    push('--------------------------------');
    push(cfg.receiptFooter || '', true);
    if (cfg.signReceipt !== false) {
      const signName = (cfg.signName || '').trim() || cfg.storeName || 'PS RENT';
      push('');
      push('Hormat kami,', true);
      push('');
      push('');
      push('....................', true);
      push(signName, true);
    }
    return out;
  }

  function receiptText(t) {
    return receiptLines(t).map(l => l.t).join('\n');
  }

  function billingExample() {
    const cfg = S();
    const rate = cfg.defaultRate || 0;
    const sampleMin = 80; // 1 jam 20 menit
    const billed = billableMinutes(0, sampleMin * 60000, cfg);
    return `main ${fmtMin(sampleMin)} → ${fmtMin(billed)} (${rp(playCost(rate, billed))})`;
  }

  /* --------------------------------- logo -------------------------------- */
  const logoSrc = () => S().logo || '';
  function brandLogoHTML() {
    const src = logoSrc();
    return src
      ? `<div class="brand-logo has-logo"><img src="${esc(src)}" alt="Logo ${esc(S().storeName)}"></div>`
      : `<div class="brand-logo">${icon('gamepad')}</div>`;
  }
  /* logo upload: pertahankan transparansi (PNG), maks 192 px */
  function fileToLogo(file, max = 192) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('File bukan gambar'));
        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(cv.toDataURL('image/png'));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ------------------------------- foto unit ----------------------------- */
  function unitPhotoHTML() {
    const src = ui.pendingImage || '';
    return src
      ? `<img src="${esc(src)}" alt="Foto unit">
         <button class="icon-btn unit-photo-x" data-action="st-img-clear" aria-label="Hapus foto">${icon('x')}</button>`
      : `<div class="ph">${icon('gamepad')}<span>Belum ada foto</span></div>`;
  }
  function productPhotoHTML() {
    const src = ui.pendingProductImage || '';
    return src
      ? `<img src="${esc(src)}" alt="Foto produk">
         <button class="icon-btn unit-photo-x" data-action="pr-img-clear" aria-label="Hapus foto">${icon('x')}</button>`
      : `<div class="ph">${icon('box')}<span>Belum ada foto</span></div>`;
  }
  function refreshProductPhoto() {
    const box = $('#pr-image-preview');
    if (box) box.innerHTML = productPhotoHTML();
  }
  function refreshUnitPhoto() {
    const box = $('#st-image-preview');
    if (box) box.innerHTML = unitPhotoHTML();
  }
  /* perkecil gambar upload → JPEG data URL (hemat localStorage) */
  function fileToUnitImage(file, maxW = 720, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('File bukan gambar'));
        img.onload = () => {
          const scale = Math.min(1, maxW / img.width);
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          const ctx = cv.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(cv.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ------------------------------- printer & nota ------------------------ */
  // Ukuran kertas struk: lebar, spasi tepi seragam (atas = bawah = kiri = kanan), ukuran font.
  // Area cetak printer thermal Epson: kertas 58 mm → 48 mm, kertas 80 mm → 72 mm.
  // Jadi spasi tepi aman: (58-48)/2 = 5 mm dan (80-72)/2 = 4 mm — isi nota tidak terpotong.
  function receiptPaper() {
    const wide = S().paperWidth === '80';
    const mm = wide ? 80 : 58;
    const auto = wide ? 4 : 5;
    const raw = String(S().paperPad == null ? 'auto' : S().paperPad);
    const n = raw === 'auto' ? auto : Number(raw);
    const pad = Math.min(Math.max(isFinite(n) && n > 0 ? n : auto, 1), 10);
    return { mm: mm, pad: pad, font: wide ? 12 : 10, wIn: mm - 2 * pad, auto: raw === 'auto' };
  }
  function paperCss(w, pad, font) {
    return '@page{size:' + w + 'mm 150mm;margin:' + pad + 'mm}'
      + ' #print-area .receipt{max-width:' + w + 'mm;font-size:' + font + 'px}';
  }
  function applyPaper() {
    const p = receiptPaper();
    document.documentElement.style.setProperty('--paper', p.mm + 'mm');
    let el = document.getElementById('paper-style');
    if (!el) { el = document.createElement('style'); el.id = 'paper-style'; document.head.appendChild(el); }
    el.textContent = paperCss(p.mm, p.pad, p.font);
  }

  // pastikan logo benar-benar termuat sebelum dialog cetak dibuka;
  // kalau gagal dimuat (mis. URL mati / offline), ganti dengan lambang bawaan
  function settleReceiptImages(root) {
    const MARK = `<div class="rlogo-ph">${icon('gamepad')}</div>`;
    const imgs = Array.from(root.querySelectorAll('.rlogo img'));
    return Promise.all(imgs.map(img => new Promise(resolve => {
      let done = false;
      const swap = () => { if (done) return; done = true; img.insertAdjacentHTML('afterend', MARK); img.remove(); resolve(); };
      if (img.complete && img.naturalWidth > 0) { done = true; return resolve(); }
      const timer = setTimeout(swap, 700);
      img.addEventListener('load', () => { if (done) return; done = true; clearTimeout(timer); resolve(); });
      img.addEventListener('error', () => { clearTimeout(timer); swap(); });
    })));
  }

  // cetak struk: tinggi halaman diukur dari isi supaya spasi atas-bawah sama dengan kiri-kanan
  async function printReceipt(t) {
    const p = receiptPaper();
    const area = $('#print-area');
    const prev = document.getElementById('print-page-style');
    if (prev) prev.remove();
    area.innerHTML = receiptHTML(t, false);
    await settleReceiptImages(area);

    // 1) ukur tinggi nota pada lebar cetak sebenarnya
    const rec = area.querySelector('.receipt');
    area.style.cssText = 'display:block;position:fixed;left:-10000px;top:0;visibility:hidden;'
      + 'width:' + p.wIn + 'mm;padding:0;margin:0';
    if (rec) {
      rec.style.width = '100%'; rec.style.maxWidth = 'none'; rec.style.margin = '0'; rec.style.padding = '0';
      rec.style.fontSize = p.font + 'px';
    }
    // tinggi diukur sampai tinta baris terakhir (bukan kotak nota) supaya sisa
    // leading baris terakhir tidak menambah spasi bawah — atas/bawah = kiri/kanan
    let hPx = 600;
    if (rec) {
      const box = rec.getBoundingClientRect();
      let ink = box.height;
      try {
        const rng = document.createRange();
        rng.selectNodeContents(rec);
        const rects = Array.from(rng.getClientRects());
        if (rects.length) {
          const bot = Math.max.apply(null, rects.map(r => r.bottom)) - box.top;
          if (bot > 10) ink = Math.min(ink, bot);
        }
      } catch (e) { /* fallback: tinggi kotak */ }
      hPx = ink;
    }
    // -0,6 mm: kompensasi leading baris terakhir supaya sisa kertas di bawah
    // praktis sama dengan spasi tepi yang lain
    const hMm = Math.max(25, Math.ceil((hPx * 25.4) / 96 - 0.6));
    area.style.cssText = '';

    // 2) halaman pas: tinggi = isi + margin atas & bawah, margin sama semua sisi
    const st = document.createElement('style');
    st.id = 'print-page-style';
    st.textContent = '@page{size:' + p.mm + 'mm ' + (hMm + 2 * p.pad) + 'mm;margin:' + p.pad + 'mm}'
      + ' #print-area{display:block!important;padding:0;margin:0}'
      + ' #print-area .receipt{width:100%;max-width:none;margin:0;padding:0;border-radius:0;box-shadow:none;'
      + 'font-size:' + p.font + 'px;-webkit-print-color-adjust:exact;print-color-adjust:exact;'
      // jaga-jaga: nota tidak boleh meluber jadi halaman kedua gara-gara sisa leading
      + 'max-height:' + hMm + 'mm;overflow:hidden}';
    document.head.appendChild(st);

    const cleanup = () => {
      const el = document.getElementById('print-page-style');
      if (el) el.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    try {
      window.print();
    } catch (e) {
      cleanup();
      toast('Browser memblokir cetak. Buka aplikasi di tab baru.', 'err');
    }
  }

  function downloadBlob(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  const waDigits = () => String(S().waNumber || '').replace(/\D/g, '').replace(/^0/, '62');

  function openWa(text, toPhone) {
    const num = toPhone ? waPhone(toPhone) : waDigits();
    const url = (num ? 'https://wa.me/' + num : 'https://api.whatsapp.com/send')
      + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  async function shareText(text, title) {
    if (navigator.share) {
      try { await navigator.share({ title: title || 'PS Rent POS', text }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    openWa(text);
    toast('Membuka WhatsApp…');
  }

  /* Gambar nota (PNG) dibuat dari teks struk, tanpa library eksternal */
  function loadImage(src) {
    return new Promise(resolve => {
      if (!src) return resolve(null);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
      setTimeout(() => resolve(null), 2500);
    });
  }

  // lambang bawaan (ubin hijau + ikon gamepad) digambar langsung, tanpa menunggu gambar
  function drawBrandMark(ctx, x, y, size) {
    if (!ctx) return;
    const has = fn => typeof ctx[fn] === 'function';
    const u = size / 24, r = size * 0.22;
    const cx = x + size / 2, cy = y + size / 2;
    try {
      if (has('save')) ctx.save();
      ctx.fillStyle = '#0f9d58';
      if (has('beginPath') && has('roundRect') && has('fill')) {
        ctx.beginPath(); ctx.roundRect(x, y, size, size, r); ctx.fill();
      } else if (has('fillRect')) {
        ctx.fillRect(x, y, size, size);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, u * 1.7);
      try { ctx.lineCap = 'round'; } catch (e) { /* abaikan */ }
      // tombol arah (silang) di kiri
      if (has('beginPath') && has('moveTo') && has('lineTo') && has('stroke')) {
        ctx.beginPath();
        ctx.moveTo(cx - u * 5.6, cy); ctx.lineTo(cx - u * 1.4, cy);
        ctx.moveTo(cx - u * 3.5, cy - u * 2.1); ctx.lineTo(cx - u * 3.5, cy + u * 2.1);
        ctx.stroke();
      }
      // dua tombol bulat di kanan
      if (has('beginPath') && has('arc') && has('stroke')) {
        ctx.beginPath(); ctx.arc(cx + u * 2.1, cy - u * 1.1, u * 0.85, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + u * 4.6, cy + u * 1.1, u * 0.85, 0, Math.PI * 2); ctx.stroke();
      }
      if (has('restore')) ctx.restore();
    } catch (e) { /* kanvas tanpa API lengkap: lambang dilewati, nota tetap tercetak */ }
  }

  async function receiptCanvas(t) {
    const cfg = S();
    const lines = receiptLines(t);
    const W = 384, PAD = 18, LH = 21, FS = 14;
    const showLogo = cfg.logoReceipt !== false;
    const logo = cfg.logo && showLogo ? await loadImage(cfg.logo) : null;
    const useMark = showLogo && !logo;   // belum ada logo / gagal dimuat → lambang bawaan
    let LOGO_H = 0, LOGO_W = 0;
    if (logo) {
      const maxW = 108, maxH = 64;
      const k = Math.min(maxW / (logo.width || 1), maxH / (logo.height || 1), 1);
      LOGO_W = Math.max(1, Math.round((logo.width || maxW) * k));
      LOGO_H = Math.max(1, Math.round((logo.height || maxH) * k));
    } else if (useMark) {
      LOGO_W = LOGO_H = 56;
    }
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = PAD * 2 + (LOGO_H ? LOGO_H + 10 : 0) + lines.length * LH;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#111827';
    ctx.textBaseline = 'top';
    let y = PAD;
    if (logo) {
      ctx.drawImage(logo, Math.round((W - LOGO_W) / 2), y, LOGO_W, LOGO_H);
      y += LOGO_H + 10;
    } else if (useMark) {
      drawBrandMark(ctx, Math.round((W - LOGO_W) / 2), y, LOGO_W);
      y += LOGO_H + 10;
    }
    lines.forEach((ln, i) => {
      const head = i === 0;
      const bold = head || /^TOTAL/.test(ln.t);
      ctx.font = (bold ? '800 ' : '600 ') + (head ? FS + 2 : FS) + 'px ui-monospace, Menlo, Consolas, monospace';
      ctx.textAlign = ln.c ? 'center' : 'left';
      ctx.fillText(ln.t, ln.c ? W / 2 : PAD, y + i * LH);
    });
    ctx.textAlign = 'left';
    // garis tepi halus
    ctx.strokeStyle = '#d1d5db';
    ctx.strokeRect(0.5, 0.5, cv.width - 1, cv.height - 1);
    return cv;
  }

  async function shareReceipt(t, toPhone) {
    const text = receiptText(t);
    const cv = await receiptCanvas(t);
    const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
    const name = (t.code || 'nota') + '.png';
    let file = null;
    try { file = new File([blob], name, { type: 'image/png' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Nota ' + t.code, text });
        if (toPhone) t.lastSentTo = normPhone(toPhone);
        return;
      } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    if (blob) downloadBlob(blob, name);
    openWa(text, toPhone);
    if (toPhone) { t.lastSentTo = normPhone(toPhone); save(); }
    toast(toPhone ? 'Gambar nota diunduh — kirim ke ' + normPhone(toPhone) : 'Gambar nota diunduh — lampirkan di WhatsApp');
  }

  /* pilih tujuan kirim nota: toko, pelanggan, atau nomor lain (sekaligus mendaftarkan pelanggan) */
  function openSendSheet(txId) {
    const t = state.transactions.find(x => x.id === txId);
    if (!t) return;
    const cust = t.customerId ? custById(t.customerId) : findCustomer(t.customer, t.customerPhone);
    const targets = [];
    if (cust && cust.phone) targets.push({ phone: cust.phone, label: 'Pelanggan · ' + cust.name, sub: custDisplayPhone(cust.phone) });
    if (S().waNumber) targets.push({ phone: S().waNumber, label: 'Nomor toko', sub: custDisplayPhone(S().waNumber) });
    if (t.lastSentTo) targets.push({ phone: t.lastSentTo, label: 'Terakhir dikirim', sub: t.lastSentTo });

    openSheet({
      kind: 'send',
      title: 'Kirim Nota',
      sub: 'Gambar nota (PNG) siap dikirim lewat WhatsApp',
      body: `
        ${targets.length ? `<div class="chips" style="margin-bottom:12px">
          ${targets.map(x => `<button class="chip" data-action="send-fill" data-id="${esc(x.phone)}">${icon('wa')} ${esc(x.label)} · ${esc(x.sub)}</button>`).join('')}
        </div>` : ''}
        <div class="field"><label class="lbl">Nomor WhatsApp tujuan</label>
          <input class="input input-num" id="send-phone" type="tel" inputmode="tel" placeholder="0812… / 62812…" value="${esc(cust && cust.phone ? cust.phone : '')}"></div>
        <div class="field"><label class="lbl">Nama pelanggan (opsional)</label>
          <input class="input" id="send-name" placeholder="mis. Budi" value="${esc(cust ? cust.name : (t.customer || ''))}">
          <div class="hint">Nomor + nama yang diisi otomatis masuk daftar <b>Pelanggan</b>.</div></div>
        <div class="bill">
          <div class="bill-line"><span class="k">Nota</span><span class="v">${esc(t.code)}</span></div>
          <div class="bill-line"><span class="k">Total</span><span class="v">${rp(t.total)}</span></div>
        </div>`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Batal</button>
             <button class="btn btn-primary wide" data-action="send-go" data-id="${t.id}">${icon('wa')} Kirim Gambar</button>`
    });
  }

  function sendReceiptTo(txId) {
    const t = state.transactions.find(x => x.id === txId);
    if (!t) return;
    const phone = ($('#send-phone').value || '').trim();
    const name = ($('#send-name').value || '').trim();
    if (!phone) return toast('Isi nomor WhatsApp tujuan', 'err');
    const cust = upsertCustomer(name || t.customer || '', phone);
    if (cust) {
      t.customerId = cust.id;
      t.customer = t.customer || cust.name;
      t.customerPhone = cust.phone;
    }
    save(); closeSheet(); render();
    toast(cust ? 'Nota dikirim & pelanggan ' + cust.name + ' terdaftar' : 'Nota dikirim', 'ok');
    shareReceipt(t, phone);
  }

  /* ------------------------------- pengaturan ---------------------------- */
  function addMethod() {
    const v = ($('#new-method').value || '').trim();
    if (!v) return;
    if (S().methods.includes(v)) return toast('Metode sudah ada', 'err');
    S().methods.push(v); save(); render(); toast('Metode ditambah', 'ok');
  }

  function backup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'psrentpos-backup-' + dayKey(Date.now()) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    log('data', 'Unduh backup manual (' + Math.round(JSON.stringify(state).length / 1024) + ' KB)');
    toast('Backup diunduh', 'ok');
  }

  function restore(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !data.settings) throw new Error('Format tidak dikenal');
        localStorage.setItem(LS_KEY, JSON.stringify(data));
        load(); linkCustomers(); render();
        log('data', 'Restore data dari file backup');
        toast('Data berhasil dipulihkan', 'ok');
      } catch (e) { toast('Gagal restore: ' + e.message, 'err'); }
    };
    reader.readAsText(file);
  }

  /* ------------------------------- install PWA --------------------------- */
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });
  async function installApp() {
    if (!installPrompt) {
      return toast('Gunakan menu browser → "Tambahkan ke layar utama"', '');
    }
    installPrompt.prompt();
    const res = await installPrompt.userChoice;
    installPrompt = null;
    toast(res.outcome === 'accepted' ? 'Aplikasi di-install 🎉' : 'Install dibatalkan', res.outcome === 'accepted' ? 'ok' : '');
  }

  /* ------------------------------- events -------------------------------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action, id = el.dataset.id;

    // masa demo habis: kunci semua aksi kecuali layar aktivasi
    if (licInfo().expired && !/^lic-/.test(a)) {
      render();
      return toast('Masa demo berakhir — aktivasi permanen lewat Bolangcorp', 'err');
    }

    if (PENJAGA_BLOCKED.has(a) && !can('editData')) {
      return toast('Hanya pemilik yang bisa: ' + (ACTION_LABEL[a] || 'aksi ini'), 'err');
    }

    switch (a) {
      case 'tab': ui.tab = id; ui.statOpen = ''; closeSheet(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'stat-open': openStatSheet(id); break;
      case 'theme-toggle': setTheme(S().theme === 'gelap' ? 'cerah' : 'gelap'); break;
      case 'set-theme': setTheme(id); break;
      case 'go-report': closeSheet(); ui.tab = 'laporan'; ui.statOpen = ''; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'go-meja': closeSheet(); ui.tab = 'meja'; ui.statOpen = ''; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'close-sheet': closeSheet(); break;
      case 'confirm-ok': { const fn = ui._confirm; ui._confirm = null; fn && fn(); break; }

      /* meja */
      case 'open-station': e.stopPropagation(); openStation(id); break;
      case 'set-rate': {
        const inp = $('#start-rate'); if (inp) inp.value = id;
        break;
      }
      case 'start-session': startSession(id); break;
      case 'sess-add': {
        const sid = $('.sheet-foot [data-action="pay-now"]')?.dataset.id;
        const pid = id || ($('#add-prod') ? $('#add-prod').value : '');
        if (!pid) return toast('Pilih produk dulu', 'err');
        addSessionItem(sid, pid, 1);
        break;
      }
      case 'sess-del': {
        const sid = $('.sheet-foot [data-action="pay-now"]')?.dataset.id;
        removeSessionItem(sid, Number(id));
        break;
      }
      case 'cash-exact': {
        const s = sessionById($('.sheet-foot [data-action="pay-now"]')?.dataset.id);
        if (!s) break;
        const bill = sessionBill(s);
        const total = Math.max(0, bill.sub - clamp(num(ui.discount), 0, bill.sub));
        ui.cash = String(total);
        const inp = $('#cash-input'); if (inp) inp.value = total;
        recomputePay();
        break;
      }
      case 'cash-add': {
        ui.cash = String(num(ui.cash) + num(id));
        const inp = $('#cash-input'); if (inp) inp.value = ui.cash;
        recomputePay();
        break;
      }
      case 'set-method': {
        document.querySelectorAll('#method-chips .chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        break;
      }
      case 'pay-now': finalizeSession(id); break;
      case 'cancel-session': {
        confirmSheet('Batalkan sesi?', 'Sesi yang dibatalkan tidak masuk transaksi dan tidak menghasilkan tagihan.', 'Ya, batalkan', () => {
          const cs = sessionById(id);
          state.sessions = state.sessions.filter(s => s.id !== id);
          save();
          log('sesi', 'Batalkan sesi ' + ((stationById(cs && cs.stationId) || {}).name || ''));
          closeSheet(); render(); toast('Sesi dibatalkan');
        });
        break;
      }

      /* laporan */
      case 'rep-mode': ui.rep.mode = id; render(); break;
      case 'rep-prev': ui.rep.anchor = shiftPeriod(ui.rep.mode, ui.rep.anchor, -1); render(); break;
      case 'rep-next': {
        const P = periodRange(ui.rep.mode, ui.rep.anchor);
        if (P.end > Date.now()) break;
        ui.rep.anchor = shiftPeriod(ui.rep.mode, ui.rep.anchor, 1); render(); break;
      }
      case 'rep-share': shareText(reportSummaryText(), 'Laporan ' + (S().storeName || 'PS Rent')); break;
      case 'rep-image': openReportPreview(); break;
      case 'rep-dl': downloadReportImage(); break;
      case 'rep-wa': closeSheet(); shareReportImage(); break;
      case 'rep-print': printReport(); break;
      case 'set-rep-paper': S().reportPaper = ['A4', 'A5', 'A3'].includes(id) ? id : 'A4'; save(); render(); break;
      case 'rep-owner': {
        const owner = (S().ownerWa || '').trim();
        if (!owner) { ui.tab = 'pengaturan'; render(); toast('Isi nomor WhatsApp owner di Setelan dulu', 'err'); break; }
        shareReportImage(owner); break;
      }
      case 'cb-add': openExpenseSheet(); break;
      case 'cb-edit': openExpenseSheet(id); break;
      case 'cash-fix': adjustCash(id); break;
      case 'cash-fix-amt': { const i = $('#cash-fix'); if (i) i.value = num(i.value) + num(id); break; }
      case 'cash-fix-save': saveCashFix(id); break;
      /* pelanggan */
      case 'cust-add': openCustomerSheet(); break;
      case 'cust-edit': openCustomerSheet(id); break;
      case 'cust-save': saveCustomer(id); break;
      case 'cust-del': deleteCustomer(id); break;
      case 'cust-wa': sendReceiptToCustomer(id); break;
      case 'cust-card': openCardSheet(id); break;
      case 'agr-new': openAgreementForm(); break;
      case 'agr-edit': openAgreementForm(id); break;
      case 'agr-save': saveAgreement(id || ui.agrEdit); break;
      case 'agr-view': openAgreementPreview(id); break;
      case 'agr-print': { const a = agrById(id || ui.agrDocId); if (a) { closeSheet(); printAgreement(a.id); toast('Menyiapkan cetak perjanjian', 'ok'); } break; }
      case 'agr-dl': {
        const a = agrById(id || ui.agrDocId);
        if (!a) break;
        if (ui.agrImg) {
          const link = document.createElement('a');
          link.href = ui.agrImg; link.download = agrFileName(a); link.click();
          toast('Dokumen diunduh', 'ok');
        } else {
          shareAgreement(a.id).catch(() => toast('Gagal membuat gambar', 'err'));
        }
        break;
      }
      case 'agr-wa': { const a = agrById(id || ui.agrDocId); if (a) { closeSheet(); shareAgreement(a.id); } break; }
      case 'agr-return': returnAgreement(id); break;
      case 'agr-del': {
        const a = agrById(id);
        if (!a) break;
        confirmSheet('Hapus perjanjian?', 'Dokumen <b>' + esc(a.code) + '</b> atas nama <b>' + esc(a.name) + '</b> akan dihapus. Transaksi lain tidak terpengaruh.', 'Ya, hapus', () => {
          state.agreements = state.agreements.filter(x => x.id !== id);
          save();
          log('data', 'Hapus perjanjian ' + a.code + ' · ' + a.name);
          closeSheet(); render(); toast('Perjanjian dihapus');
        });
        break;
      }
      case 'agr-sign-clear': {
        const cv = $('#agr-sign-pad');
        if (cv) {
          const c2 = cv.getContext('2d');
          if (c2) { c2.fillStyle = '#ffffff'; c2.fillRect(0, 0, cv.width, cv.height); }
        }
        ui.agrSign = '';
        break;
      }
      case 'cust-cards-all': {
        if (!state.customers.length) { toast('Belum ada pelanggan', 'err'); break; }
        closeSheet();
        printCards(state.customers.slice().sort((a, b) => String(a.name).localeCompare(String(b.name))));
        toast('Mencetak ' + state.customers.length + ' kartu member', 'ok');
        break;
      }
      case 'card-dl': downloadCardImage(); break;
      case 'card-print': { const c = custById(ui.cardId); if (c) { closeSheet(); printCards([c]); } break; }
      case 'card-wa': { const c = custById(ui.cardId); if (c) { closeSheet(); shareCard(c.id); } break; }
      case 'toggle-logo-receipt': S().logoReceipt = S().logoReceipt === false; save(); render(); break;
      case 'toggle-sign': S().signReceipt = S().signReceipt === false; save(); render(); break;
      case 'cb-amt': { const i = $('#cb-amount'); if (i) i.value = num(i.value) + num(id); break; }
      case 'cb-save': saveExpense(); break;
      case 'cb-del': {
        const cb = cashBook();
        cb.expenses = cb.expenses.filter(e => e.id !== id);
        save(); updateCashCard(); render(); toast('Pengeluaran dihapus', 'ok');
        break;
      }
      case 'set-paper': {
        S().paperWidth = (id === '80' ? '80' : '58'); save(); applyPaper(); render();
        toast('Printer disetel ' + S().paperWidth + ' mm', 'ok'); break;
      }
      case 'set-pad': {
        S().paperPad = (id === 'auto' ? 'auto' : String(Number(id) || 'auto')); save(); applyPaper(); render();
        toast('Spasi tepi nota ' + (S().paperPad === 'auto' ? 'otomatis' : S().paperPad + ' mm'), 'ok'); break;
      }
      /* lisensi */
      case 'lic-open': openActivation(); break;
      case 'lic-copy': copyLicId(); break;
      case 'lic-wa': window.open(licWaLink(), '_blank'); break;
      case 'lic-activate': {
        const r = licTryActivate($('#lic-code') ? $('#lic-code').value : '');
        if (r.ok) { closeSheet(); render(); toast('Aktivasi berhasil — permanen', 'ok'); }
        else toast(r.msg, 'err');
        break;
      }
      case 'wa-share': openSendSheet(id); break;
      case 'send-fill': { const i = $('#send-phone'); if (i) i.value = id; break; }
      case 'send-go': sendReceiptTo(id); break;

      /* transaksi */
      case 'tx-filter': ui.txFilter = id; render(); break;
      case 'tx-detail': openTxDetail(id); break;
      case 'reprint': { const t = state.transactions.find(x => x.id === id); if (t) printReceipt(t); break; }
      case 'del-tx': deleteTx(id); break;

      /* produk */
      case 'direct-sale': openDirectSale(); break;
      case 'new-product': openProductEditor(null); break;
      case 'edit-product': openProductEditor(id); break;
      case 'save-product': saveProduct(id || null); break;
      case 'restock': {
        const p = productById(id);
        if (p) { p.stock += 10; save(); const i = $('#p-stock'); if (i) i.value = p.stock; toast('Stok ' + p.name + ' → ' + p.stock, 'ok'); render(); }
        break;
      }
      case 'del-product': {
        confirmSheet('Hapus produk?', 'Produk akan dihapus dari daftar Kantin Kita.', 'Hapus', () => {
          state.products = state.products.filter(p => p.id !== id);
          save(); closeSheet(); render(); toast('Produk dihapus', 'ok');
        });
        break;
      }
      case 'cart-add': {
        const p = productById(id);
        if (!p) break;
        const cur = ui.cart[id] || 0;
        if (cur + 1 > p.stock) { toast('Stok ' + p.name + ' tinggal ' + p.stock, 'err'); break; }
        ui.cart[id] = cur + 1; refreshCart();
        break;
      }
      case 'cart-inc': { const p = productById(id); if (p && (ui.cart[id] || 0) + 1 <= p.stock) { ui.cart[id] = (ui.cart[id] || 0) + 1; refreshCart(); } else toast('Stok tidak cukup', 'err'); break; }
      case 'cart-dec': { ui.cart[id] = Math.max(0, (ui.cart[id] || 0) - 1); refreshCart(); break; }
      case 'cart-pay': payDirectSale(); break;

      /* setelan */
      case 'logo-clear': {
        S().logo = ''; save(); updateBrand(); render();
        toast('Logo kembali ke default', 'ok'); break;
      }
      case 'logo-url': {
        const v = ($('#logo-url').value || '').trim();
        if (!v) return toast('Tempel URL logo dulu', 'err');
        S().logo = v; save(); updateBrand(); render(); toast('Logo dipakai', 'ok');
        break;
      }
      case 'pr-img-preset': ui.pendingProductImage = id; refreshProductPhoto(); break;
      case 'pr-img-url': {
        const v = ($('#pr-image-url').value || '').trim();
        if (!v) return toast('Tempel URL gambar dulu', 'err');
        ui.pendingProductImage = v; refreshProductPhoto(); toast('Foto produk dipakai', 'ok');
        break;
      }
      case 'pr-img-clear': ui.pendingProductImage = ''; refreshProductPhoto(); break;
      case 'st-img-preset': ui.pendingImage = id; refreshUnitPhoto(); break;
      case 'st-img-url': {
        const v = ($('#st-image-url').value || '').trim();
        if (!v) return toast('Tempel URL gambar dulu', 'err');
        ui.pendingImage = v; refreshUnitPhoto(); toast('Foto dipakai', 'ok');
        break;
      }
      case 'st-img-clear': ui.pendingImage = ''; refreshUnitPhoto(); break;
      case 'new-station': openStationEditor(null); break;
      case 'edit-station': openStationEditor(id); break;
      case 'save-station': saveStation(id || null); break;
      case 'del-station': {
        if (sessionByStation(id)) return toast('Unit sedang dipakai, stop dulu sesinya', 'err');
        confirmSheet('Hapus unit?', 'Unit akan dihapus dari daftar meja.', 'Hapus', () => {
          const nm = (stationById(id) || {}).name || '';
          state.stations = state.stations.filter(s => s.id !== id);
          save();
          log('data', 'Hapus unit ' + nm);
          closeSheet(); render(); toast('Unit dihapus', 'ok');
        });
        break;
      }
      case 'add-method': addMethod(); break;
      case 'del-method': {
        const m = S().methods;
        if (m.length <= 1) return toast('Minimal satu metode', 'err');
        m.splice(Number(id), 1); save(); render(); break;
      }
      case 'install': installApp(); break;
      case 'backup': backup(); break;
      /* akun */
      case 'lock-pick': lockPick(id); break;
      case 'pin-key': pinKey(id); break;
      case 'pin-back': ui.pin = String(ui.pin).slice(0, -1); render(); break;
      case 'pin-clear': ui.pin = ''; render(); break;
      case 'pin-submit': pinSubmit(); break;
      case 'logout': logout(); break;
      case 'open-account': openAccountSheet(); break;
      case 'auth-toggle': toggleAuth(); break;
      case 'user-new': openUserEditor(null); break;
      case 'user-edit': openUserEditor(id); break;
      case 'user-save': saveUser(id || null); break;
      case 'user-del': delUser(id); break;
      case 'user-seed': seedUsers(); break;
      /* log */
      case 'log-open': openLogSheet('semua'); break;
      case 'log-filter': openLogSheet(id); break;
      case 'log-clear': {
        if (!needPerm('data', 'Hanya pemilik yang bisa menghapus log')) break;
        confirmSheet('Hapus semua log?', 'Riwayat aktivitas akan dikosongkan. Data transaksi tetap aman.', 'Hapus log', () => {
          state.logs = []; save(); log('data', 'Log aktivitas dibersihkan'); closeSheet(); render(); toast('Log dibersihkan', 'ok');
        });
        break;
      }
      /* data contoh */
      case 'demo-seed': demoSeed(); break;
      case 'demo-clear': demoClear(); break;
      case 'wipe-data': wipeAll(); break;
      /* google drive */
      case 'drive-help': openDriveHelp(); break;
      case 'drive-connect': DRIVE.connect(false).then(ok => {
        if (ok) { log('sinkron', 'Google Drive disambungkan'); toast('Google Drive tersambung', 'ok'); render(); }
      }); break;
      case 'drive-sync': DRIVE.upload(true); break;
      case 'drive-off': DRIVE.disconnect(); break;
      case 'drive-auto': {
        if (!can('settings')) { toast('Hanya pemilik yang bisa mengubah sinkronisasi', 'err'); break; }
        S().driveAuto = !S().driveAuto; save(); startAutoSync(); render();
        toast(S().driveAuto ? 'Sinkron otomatis aktif' : 'Sinkron otomatis mati', 'ok');
        break;
      }
      case 'reset-all': {
        confirmSheet('Hapus semua data?', 'Semua transaksi, sesi aktif, produk, dan pengaturan akan dihapus dan diganti data contoh.', 'Ya, hapus semua', () => {
          state = defaultState(); save(); closeSheet(); render(); log('data', 'Reset ke data bawaan'); toast('Data direset', 'ok');
        });
        break;
      }
    }
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'cash-input') { ui.cash = t.value; recomputePay(); return; }
    if (t.id === 'disc-input') { ui.discount = t.value; recomputePay(); return; }
    if (t.id === 'cart-cash') { ui.cartCash = t.value; refreshCart(); return; }
    if (t.id === 'cust-search') {
      ui.custQuery = t.value;
      const holder = $('#cust-list');
      if (holder) holder.innerHTML = custListHTML();
      return;
    }
    if (['agr-station', 'agr-pkg', 'agr-days', 'agr-dayrate', 'agr-start'].includes(t.id)) { agrAutoTotal(); return; }
    if (t.id === 'cart-cust') { ui.cartCust = t.value; return; }
    if (t.id === 'cart-phone') { ui.cartPhone = t.value; return; }
    if (t.id === 'cb-modal' || t.id === 'cb-counted' || t.id === 'cb-note') {
      if (!can('cash')) { t.value = ''; return toast('Catatan kas hanya bisa diisi pemilik', 'err'); }
      const cb = cashBook();
      if (t.id === 'cb-modal') cb.modal = clamp(num(t.value), 0, 1e12);
      if (t.id === 'cb-counted') cb.counted = clamp(num(t.value), 0, 1e12);
      if (t.id === 'cb-note') cb.note = t.value;
      save();
      updateCashCard();
      return;
    }

    const setEl = t.closest('[data-set]');
    if (setEl) {
      if (!can('settings')) return;
      const path = setEl.dataset.set.split('.');
      const obj = path.slice(0, -1).reduce((o, k) => o[k], state);
      const key = path[path.length - 1];
      obj[key] = setEl.type === 'number' ? num(setEl.value) : setEl.value;
      save();
      if (key === 'minMinutes' || key === 'roundMinutes' || key === 'defaultRate') {
        const ex = $('#bill-example');
        if (ex) ex.textContent = billingExample();
      }
      if (key === 'storeName' || key === 'tagline') {
        const nm = $('.brand-name'), sb = $('.brand-sub');
        if (nm) nm.textContent = S().storeName;
        if (sb) sb.textContent = S().tagline;
      }
    }
  });

  document.addEventListener('change', e => {
    if (e.target.id === 'restore-file' && e.target.files && e.target.files[0]) restore(e.target.files[0]);
    if (e.target.id === 'logo-file' && e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 8 * 1024 * 1024) { toast('Gambar maksimal 8 MB', 'err'); return; }
      fileToLogo(f)
        .then(url => { S().logo = url; save(); updateBrand(); render(); toast('Logo toko diganti', 'ok'); })
        .catch(err => toast('Gagal memuat logo: ' + err.message, 'err'));
    }
    if (e.target.id === 'pr-image-file' && e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 8 * 1024 * 1024) { toast('Gambar maksimal 8 MB', 'err'); return; }
      fileToUnitImage(f)
        .then(url => { ui.pendingProductImage = url; refreshProductPhoto(); toast('Foto produk siap', 'ok'); })
        .catch(err => toast('Gagal memuat gambar: ' + err.message, 'err'));
    }
    if (['agr-photo-file', 'agr-idphoto-file', 'agr-condphoto-file'].includes(e.target.id)
        && e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 12 * 1024 * 1024) { toast('Gambar maksimal 12 MB', 'err'); return; }
      const maxW = e.target.id === 'agr-photo-file' ? 640 : 900;
      fileToUnitImage(f, maxW, 0.82)
        .then(url => {
          if (e.target.id === 'agr-photo-file') ui.agrPhoto = url;
          if (e.target.id === 'agr-idphoto-file') ui.agrIdPhoto = url;
          if (e.target.id === 'agr-condphoto-file') ui.agrCondPhoto = url;
          refreshAgrPhotos();
          toast(e.target.id === 'agr-photo-file' ? 'Foto penyewa siap' : 'Foto siap dipakai', 'ok');
        })
        .catch(err => toast('Gagal memuat gambar: ' + err.message, 'err'));
    }
    if (e.target.id === 'st-image-file' && e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 8 * 1024 * 1024) { toast('Gambar maksimal 8 MB', 'err'); return; }
      fileToUnitImage(f)
        .then(url => { ui.pendingImage = url; refreshUnitPhoto(); toast('Foto siap dipakai', 'ok'); })
        .catch(err => toast('Gagal memuat gambar: ' + err.message, 'err'));
    }
    if (e.target.id === 's-type') {
      const preset = defaultImageForType(e.target.value);
      if (preset && !ui.pendingImage) { ui.pendingImage = preset; refreshUnitPhoto(); }
    }
    if (e.target.closest('[data-set]') && e.target.type === 'number') {
      const p = e.target.dataset.set.split('.');
      const obj = p.slice(0, -1).reduce((o, k) => o[k], state);
      obj[p[p.length - 1]] = clamp(num(e.target.value), 0, 1e7);
      e.target.value = obj[p[p.length - 1]];
      save();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ui.modal) closeSheet();
    if (e.key === 'Enter' && e.target.id === 'new-method') addMethod();
  });

  /* ------------------------------------------------------------------ tick */
  function tick() {
    updateClock();
    document.querySelectorAll('[data-timer]').forEach(el => {
      const s = sessionById(el.dataset.timer);
      if (s) el.textContent = fmtDur(Date.now() - s.startedAt);
    });
    document.querySelectorAll('[data-cost]').forEach(el => {
      const s = sessionById(el.dataset.cost);
      if (s) el.textContent = rp(playCost(s.rate, billableMinutes(s.startedAt, Date.now(), S())));
    });
    document.querySelectorAll('[data-agr-left]').forEach(el => {
      const a = agrById(el.dataset.agrLeft);
      if (!a || a.returnedAt) return;
      el.textContent = agrStatus(a) === 'late'
        ? 'Terlambat ' + agrLateHours(a) + ' jam'
        : 'Sisa ' + fmtDur(agrEnd(a) - Date.now());
    });
    document.querySelectorAll('[data-agr-info]').forEach(el => {
      const a = agrById(el.dataset.agrInfo);
      if (a) el.textContent = agrInfoText(a);
    });
    if (ui.modal === 'session') recomputePay();
  }

  /* ------------------------------------------------- lisensi & masa demo */
  // Demo berjalan 30 hari sejak aplikasi pertama dibuka. Setelah itu aplikasi
  // hanya bisa dipakai setelah diaktivasi permanen oleh Bolangcorp.
  // Kode aktivasi diturunkan dari ID perangkat (lihat keygen.html — alat milik
  // pengembang). Kunci induk dipakai untuk perangkat pengembang sendiri.
  const LS_LIC = 'pspos.license';
  const LIC = {
    days: 30,
    secret: 'BOLANGCORP-PSRENT-2026-9F3A',
    master: 'BLCBOLANGCORPMASTER',
    wa: '6281392399300',
    waLabel: 'WhatsApp',
    b32: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  };

  function licRead() {
    try { return JSON.parse(localStorage.getItem(LS_LIC) || 'null') || null; } catch (e) { return null; }
  }
  function licWrite(o) {
    try { localStorage.setItem(LS_LIC, JSON.stringify(o)); } catch (e) {}
  }
  function licNewId() {
    const A = LIC.b32;
    const pick = n => {
      let out = '';
      for (let i = 0; i < n; i++) out += A[Math.floor(Math.random() * A.length)];
      return out;
    };
    return 'PSR-' + pick(4) + '-' + pick(4);
  }
  // kode aktivasi: 12 karakter base32 turunan (secret + ID perangkat)
  function licCodeFor(id) {
    const A = LIC.b32;
    const src = LIC.secret + '|' + String(id || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    let h = 0x811c9dc5;
    for (let i = 0; i < src.length; i++) {
      h ^= src.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    let out = '';
    for (let k = 0; k < 3; k++) {
      h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0;
      h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
      h ^= h >>> 16; h = h >>> 0;
      let x = h;
      for (let i = 0; i < 4; i++) { out += A[x & 31]; x = x >>> 5; }
    }
    return 'BLC-' + out.slice(0, 4) + '-' + out.slice(4, 8) + '-' + out.slice(8, 12);
  }
  // status lisensi perangkat ini
  function licInfo() {
    const now = Date.now();
    let o = licRead();
    let dirty = false;
    if (!o || !o.id) { o = { id: licNewId(), start: now, lastSeen: now, activatedAt: 0, code: '' }; dirty = true; }
    if (!o.start) { o.start = now; dirty = true; }
    if (!o.lastSeen || now > o.lastSeen) { o.lastSeen = now; dirty = true; }
    if (dirty) licWrite(o);
    // kalau jam perangkat dimundurkan, pakai waktu terakhir yang pernah terlihat
    const eff = Math.max(now, o.lastSeen || now);
    const endAt = o.start + LIC.days * 86400e3;
    const activated = !!o.activatedAt;
    const msLeft = endAt - eff;
    return {
      id: o.id, start: o.start, endAt, activated,
      activatedAt: o.activatedAt || 0,
      daysLeft: Math.max(0, Math.ceil(Math.max(0, msLeft) / 86400e3)),
      expired: !activated && msLeft <= 0,
      demo: !activated
    };
  }
  function licTryActivate(raw) {
    const info = licInfo();
    const norm = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!norm) return { ok: false, msg: 'Kode aktivasi masih kosong' };
    const want = licCodeFor(info.id).replace(/-/g, '');
    if (norm !== want && norm !== LIC.master) {
      return { ok: false, msg: 'Kode tidak cocok dengan perangkat ini. Periksa lagi atau hubungi Bolangcorp.' };
    }
    const o = licRead() || {};
    o.id = o.id || info.id;
    o.activatedAt = Date.now();
    o.code = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
    licWrite(o);
    try { log('lisensi', 'Aktivasi permanen · ' + info.id); } catch (e) {}
    return { ok: true };
  }
  function licWaLink() {
    const info = licInfo();
    const txt = 'Halo Bolangcorp, saya mau aktivasi permanen ' + APP.name + '.\n'
      + 'ID perangkat: ' + info.id + '\n'
      + 'Nama toko: ' + (S().storeName || '-');
    return 'https://wa.me/' + LIC.wa + '?text=' + encodeURIComponent(txt);
  }
  function licChipHTML(info) {
    if (info.activated) return '<span class="lic-badge ok">Aktif permanen</span>';
    if (info.expired) return '<span class="lic-badge bad">Demo berakhir</span>';
    return `<span class="lic-badge ${info.daysLeft <= 7 ? 'warn' : ''}">Demo · ${info.daysLeft} hari lagi</span>`;
  }
  // bilah tipis di atas isi aplikasi selama masa demo
  function licBar() {
    const info = licInfo();
    if (info.activated || info.expired) return '';
    return `<div class="lic-bar ${info.daysLeft <= 7 ? 'late' : ''}">
      ${icon('shield')}
      <span class="lic-bar-txt"><b>Mode demo</b> · sisa <b>${info.daysLeft} hari</b></span>
      <button class="lic-bar-btn" data-action="lic-open">Aktivasi</button>
    </div>`;
  }
  // layar penuh saat demo habis
  function viewLicenseLock() {
    const info = licInfo();
    return `<div class="lock-wrap lic-lock">
      <div class="lock-hero">
        <div class="lock-logo">${S().logo ? `<img src="${esc(S().logo)}" alt="">` : icon('gamepad')}</div>
        <div class="lock-name">${esc(S().storeName || APP.name)}</div>
        <div class="lock-sub">Masa demo ${LIC.days} hari sudah berakhir</div>
      </div>
      <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
        ${licChipHTML(info)}
        <div class="hint" style="margin:0">Data toko, transaksi, dan pelanggan tetap tersimpan di perangkat ini. Untuk memakai aplikasi lagi <b>tanpa batas waktu</b>, lakukan aktivasi permanen.</div>
        <div class="lic-id"><span>ID perangkat</span><b>${esc(info.id)}</b></div>
        <button class="btn btn-primary" data-action="lic-open">${icon('shield')} Aktivasi permanen</button>
        <button class="btn btn-ghost" data-action="lic-wa">${icon('wa')} Hubungi Bolangcorp</button>
        <div class="lic-contact"><b>WhatsApp</b> · kode aktivasi dikirim lewat WhatsApp</div>
      </div>
      <div class="hint" style="text-align:center;margin:0">${APP.name} v${APP.version} · dikembangkan oleh ${APP.dev}</div>
    </div>`;
  }
  function openActivation() {
    const info = licInfo();
    openSheet({
      kind: 'lisensi',
      title: 'Aktivasi permanen',
      sub: info.activated ? 'Perangkat ini sudah aktif permanen' : 'Demo sisa ' + info.daysLeft + ' hari',
      body: `
        <div class="lic-id"><span>ID perangkat</span><b id="lic-device">${esc(info.id)}</b></div>
        <div class="hint" style="margin:8px 0 14px">Kirim ID perangkat di atas ke <b>Bolangcorp</b> lewat <b>WhatsApp</b> untuk mendapatkan kode aktivasi permanen. Kode hanya berlaku untuk perangkat ini.</div>
        <div class="chips" style="margin-bottom:14px">
          <button class="chip" data-action="lic-copy">${icon('doc')} Salin ID perangkat</button>
          <button class="chip" data-action="lic-wa">${icon('wa')} Chat Bolangcorp</button>
        </div>
        <div class="field" style="margin:0">
          <label class="lbl">Kode aktivasi</label>
          <input class="input" id="lic-code" placeholder="BLC-XXXX-XXXX-XXXX" autocomplete="off" spellcheck="false">
          <div class="hint">Format <b>BLC-XXXX-XXXX-XXXX</b> (huruf &amp; angka, tanpa spasi).</div>
        </div>
        ${info.activated ? `<div class="lic-badge ok" style="margin-top:12px">Aktivasi dilakukan ${fmtDate(info.activatedAt)} ${fmtHM(info.activatedAt)}</div>` : ''}`,
      foot: `<button class="btn btn-ghost" data-action="close-sheet">Tutup</button>
             <button class="btn btn-primary" data-action="lic-activate">${icon('shield')} Aktifkan</button>`
    });
    setTimeout(() => { const i = $('#lic-code'); if (i) i.focus(); }, 120);
  }
  function copyLicId() {
    const id = licInfo().id;
    const done = () => toast('ID perangkat disalin: ' + id, 'ok');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(done).catch(() => toast('ID: ' + id, 'ok'));
        return;
      }
    } catch (e) {}
    toast('ID perangkat: ' + id, 'ok');
  }
  // kartu di Setelan
  function cardLicense() {
    const info = licInfo();
    return `
      <div class="sec-head"><div><div class="sec-title">Lisensi &amp; Aktivasi</div>
        <div class="sec-sub">${info.activated ? 'Aktif permanen — tanpa batas waktu' : 'Mode demo ' + LIC.days + ' hari'}</div></div></div>
      <div class="card" style="padding:14px">
        <div class="lic-row">${licChipHTML(info)}
          <span class="lic-id-inline">${esc(info.id)}</span></div>
        <div class="hint" style="margin:8px 0 12px">${info.activated
          ? 'Terima kasih! Aplikasi ini sudah aktif permanen di perangkat ini.'
          : info.expired
            ? 'Masa demo sudah berakhir. Aktivasi diperlukan untuk memakai aplikasi lagi.'
            : `Demo berakhir <b>${fmtDate(info.endAt)}</b>. Setelah itu aplikasi perlu diaktivasi permanen.`}</div>
        <div class="chips">
          <button class="chip chip-upload" data-action="lic-open">${icon('shield')} ${info.activated ? 'Lihat lisensi' : 'Aktivasi permanen'}</button>
          <button class="chip" data-action="lic-copy">${icon('doc')} Salin ID</button>
          <button class="chip" data-action="lic-wa">${icon('wa')} WA Chat WhatsApp</button>
        </div>
        <div class="hint" style="margin-top:10px">Aktivasi permanen dibantu langsung oleh <b>Bolangcorp</b> — <b>WhatsApp</b>. Data toko tidak dihapus saat demo berakhir.</div>
      </div>`;
  }

  /* ------------------------------------------------------------------ init */
  load();
  try { ui.userId = sessionStorage.getItem('pspos.user') || ''; } catch (e) {}
  linkCustomers();
  applyPaper();
  applyTheme();
  render();
  tick();
  setInterval(tick, 1000);
  startAutoSync();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW gagal:', err));
    });
  }

  // expose untuk debug
  window.PSRentPOS = {
    get state() { return state; },
    app: APP,
    settings: () => S(),
    render,
    _internal: { DRIVE, demoSeed, demoStats, demoClear, wipeAll, can, me, activeUsers, seedUsers, log, openLogSheet, omsetToday,
      applyPaper, printReceipt, receiptPaper, licInfo, licCodeFor, licTryActivate, LIC, reportModel, reportLines, receiptLines, custStats, findCustomer, upsertCustomer, reportCanvas, cashSummary, linkCustomers, qr: QRGen, memberCode, qrPayload, memberCardCanvas, memberCardHTML, printCards, agrById, agrEnd, agrStatus, agrLateHours, agrFine, agrRules, agreementHTML, agreementCanvas, paintAgreement, stationDayRate, agrSuggestTotal }
  };
})();
