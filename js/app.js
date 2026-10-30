
/* ============================================================
   SUPORT SYSTEM — interactions
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  var WA_NUMBER = '6281392399300';
  var PACKAGES = {
    '1':  { price: 1000000, type: 'web', umkm: 'Paket 1 — Profil Bisnis', properti: 'Paket 1 — Daftar Properti Dasar' },
    '2':  { price: 1500000, type: 'web', umkm: 'Paket 2 — Katalog Lengkap', properti: 'Paket 2 — Daftar Properti Menengah' },
    '3':  { price: 2500000, type: 'web', umkm: 'Paket 3 — Toko Daring', properti: 'Paket 3 — Portal Properti Lengkap' },
    'ik': { price: 2500000, type: 'app', label: 'APK I-KOS — Pengelolaan Kos' },
    'rc': { price: 2500000, type: 'app', label: 'APK POS Rentcar — Rental Mobil' },
    'dg': { price: 4500000, type: 'app', label: 'APK POS Dokter Gigi' },
    'jr': { price: 1000000, type: 'app', label: 'APK Jimpitan Ronda — Kas & Ronda Warga' },
    'pu': { price: 1000000, type: 'app', label: 'APK POS UMKM — Kasir UMKM' },
    'wcust': { price: 0, type: 'custom', label: 'Website custom — sesuai kebutuhan' },
    'acust': { price: 0, type: 'custom', label: 'Aplikasi custom — online / offline' }
  };

  function packageName(pkg, aud) {
    if (!pkg) return '';
    return (pkg.type === 'app' || pkg.type === 'custom') ? pkg.label : pkg[aud];
  }

  function isCustomPackage(pkg) { return !!pkg && pkg.type === 'custom'; }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function rupiah(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n); }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     NOMOR URUT PEMESAN
     - Sumber utama: penghitung daring (lintas perangkat)
     - Cadangan: penghitung lokal di peramban (tetap berjalan saat luring)
     ============================================================ */
  var SEQ_BASE = 'https://abacus.jasoncameron.dev';
  var SEQ_NS = 'suport-system-solo';
  var SEQ_KEY = 'pesanan-web';
  var SEQ_LOCAL_KEY = 'ss_order_seq_v2';
  /* setiap penghitung disemai 1 kali saat pemasangan → nilai tampil = nilai - 1 */
  var SEQ_BASELINE = 1;

  var seqNextEl = $('#seqNext');
  var seqStatusEl = $('#seqStatus');

  function seqCount(raw) { return Math.max(0, (raw || 0) - SEQ_BASELINE); }
  function pad4(n) { return String(n).padStart(4, '0'); }
  function seqLabel(n) { return '#' + pad4(n); }

  var SEQ_LAST_ONLINE = 'ss_order_seq_online';

  function readLocalSeq() {
    var v = 0;
    try { v = parseInt(localStorage.getItem(SEQ_LOCAL_KEY) || '0', 10) || 0; } catch (e) { v = 0; }
    return v;
  }
  function writeLocalSeq(n) {
    try { localStorage.setItem(SEQ_LOCAL_KEY, String(n)); } catch (e) { /* silent */ }
  }
  function readLastOnline() {
    var v = 0;
    try { v = parseInt(localStorage.getItem(SEQ_LAST_ONLINE) || '0', 10) || 0; } catch (e) { v = 0; }
    return v;
  }
  function writeLastOnline(n) {
    try { localStorage.setItem(SEQ_LAST_ONLINE, String(n)); } catch (e) { /* silent */ }
  }

  function seqFetch(path, ms) {
    ms = ms || 2600;
    if (typeof fetch !== 'function') return Promise.reject(new Error('no fetch'));
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    return fetch(SEQ_BASE + path, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) {
        /* 404 = penghitung belum ada (artinya 0), bukan kegagalan */
        if (r.status === 404) return { value: 0 };
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (d) { clearTimeout(timer); return d; })
      .catch(function (err) { clearTimeout(timer); throw err; });
  }

  function setSeqStatus(kind, text) {
    if (!seqStatusEl) return;
    seqStatusEl.className = 'seq-' + kind;
    seqStatusEl.innerHTML = '<i class="dot"></i> ' + text;
  }

  /* tampilkan nomor berikutnya (belum menaikkan penghitung) */
  var seqRetry = 0;

  function refreshSeqPreview() {
    var local = Math.max(readLocalSeq(), readLastOnline());
    if (seqNextEl) seqNextEl.textContent = seqLabel(local + 1);
    seqFetch('/get/' + SEQ_NS + '/' + SEQ_KEY, 6000)
      .then(function (d) {
        seqRetry = 0;
        var online = seqCount((d && typeof d.value === 'number') ? d.value : 0);
        var base = Math.max(local, online);
        writeLastOnline(base);
        if (seqNextEl) seqNextEl.textContent = seqLabel(base + 1);
        setSeqStatus('ok', 'tersinkron online · pesanan ke-' + pad4(base + 1));
      })
      .catch(function () {
        setSeqStatus('local', seqRetry < 3
          ? 'menyambungkan ulang… (nomor sementara)'
          : 'mode luring · nomor dihitung di perangkat ini');
        if (seqRetry < 3) {
          seqRetry += 1;
          setTimeout(refreshSeqPreview, 3000 + seqRetry * 2000);
        }
      });
  }

  /* ambil nomor pesanan baru (menaikkan penghitung) */
  function takeSeq() {
    var local = Math.max(readLocalSeq(), readLastOnline());
    return seqFetch('/hit/' + SEQ_NS + '/' + SEQ_KEY, 7000)
      .then(function (d) {
        var raw = (d && typeof d.value === 'number') ? d.value : (local + 1 + SEQ_BASELINE);
        var n = Math.max(seqCount(raw), local + 1);   /* jangan pernah mundur */
        writeLocalSeq(n);
        setSeqStatus('ok', 'tersinkron online');
        writeLastOnline(n);
        if (seqNextEl) seqNextEl.textContent = seqLabel(n + 1);
        return n;
      })
      .catch(function () {
        /* coba sekali lagi sebelum memakai nomor lokal */
        return seqFetch('/hit/' + SEQ_NS + '/' + SEQ_KEY, 7000).then(function (d) {
          var raw2 = (d && typeof d.value === 'number') ? d.value : (local + 1 + SEQ_BASELINE);
          var n2 = Math.max(seqCount(raw2), local + 1);
          writeLocalSeq(n2);
          writeLastOnline(n2);
          setSeqStatus('ok', 'tersinkron online');
          if (seqNextEl) seqNextEl.textContent = seqLabel(n2 + 1);
          return n2;
        }).catch(function () {
        var n = local + 1;
        writeLocalSeq(n);
        setSeqStatus('local', 'mode luring · nomor dihitung di perangkat ini');
        if (seqNextEl) seqNextEl.textContent = seqLabel(n + 1);
        return n;
        });
      });
  }

  /* jumlah pesanan per produk (opsional, untuk lencana di kartu) */
  function productKey(id) { return 'produk-web-' + id; }

  function paintProductBadges(map) {
    Object.keys(map).forEach(function (id) {
      var n = map[id];
      if (!n) return;
      var btn = document.querySelector('[data-pkg="' + id + '"]');
      if (!btn) return;
      var card = btn.closest('.app-card, .card-price');
      if (!card) return;
      var host = card.querySelector('.app-top') || card.querySelector('.price-top') || card;
      var badge = card.querySelector('.sales-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'sales-badge';
        if (host === card) card.appendChild(badge); else host.appendChild(badge);
      }
      badge.innerHTML = '<i class="dot"></i> ' + n + ' pesanan';
      badge.hidden = false;
    });
  }

  function refreshProductBadges() {
    var ids = ['1', '2', '3', 'ik', 'rc', 'dg', 'jr', 'pu'];
    Promise.all(ids.map(function (id) {
      return seqFetch('/get/' + SEQ_NS + '/' + productKey(id), 2200)
        .then(function (d) { return [id, seqCount((d && d.value) || 0)]; })
        .catch(function () { return [id, 0]; });
    })).then(function (rows) {
      var map = {};
      rows.forEach(function (r) { if (r[1] > 0) map[r[0]] = r[1]; });
      paintProductBadges(map);
    });
  }

  function bumpProductCounters(items) {
    var seen = {};
    items.forEach(function (it) {
      if (seen[it.pkgId]) return;
      seen[it.pkgId] = 1;
      seqFetch('/hit/' + SEQ_NS + '/' + productKey(it.pkgId), 2200).catch(function () { /* silent */ });
    });
  }

  if (seqNextEl) refreshSeqPreview();
  if (document.querySelector('.app-card')) setTimeout(refreshProductBadges, 900);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && seqNextEl) refreshSeqPreview();
  });

  /* ---------------- toast ---------------- */
  var toast = $('#toast'), toastText = $('#toastText'), toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toastText.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3600);
  }

  /* ---------------- header + progress ---------------- */
  var header = $('#siteHeader');
  var progress = $('#scrollProgress');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 18);
    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- mobile menu ---------------- */
  var menuBtn = $('#menuBtn'), mobileMenu = $('#mobileMenu'), scrim = $('#menuScrim');
  var iconMenu = '<svg class="ic" aria-hidden="true"><use href="#i-menu"/></svg>';
  var iconClose = '<svg class="ic" aria-hidden="true"><use href="#i-close"/></svg>';

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuBtn.innerHTML = iconMenu;
    menuBtn.setAttribute('aria-label', 'Buka menu');
    document.body.style.overflow = '';
  }
  function openMenu() {
    mobileMenu.classList.add('is-open');
    scrim.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuBtn.innerHTML = iconClose;
    menuBtn.setAttribute('aria-label', 'Tutup menu');
    document.body.style.overflow = 'hidden';
  }
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    if (scrim) scrim.addEventListener('click', closeMenu);
    $$('#mobileMenu a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1024) closeMenu(); });
  }

  /* ---------------- active nav link ---------------- */
  var navLinks = $$('.nav a');
  var sections = ['manfaat', 'paket', 'aplikasi', 'proses', 'pembayaran', 'faq'];
  if ('IntersectionObserver' in window && navLinks.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- timeline bars ---------------- */
  var timeline = $('#timelineCard');
  if (timeline) {
    if ('IntersectionObserver' in window) {
      var tlObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { timeline.classList.add('is-in'); tlObserver.disconnect(); }
        });
      }, { threshold: 0.35 });
      tlObserver.observe(timeline);
    } else {
      timeline.classList.add('is-in');
    }
  }

  /* ---------------- hero preview tabs ---------------- */
  $$('[data-mock]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-mock');
      $$('[data-mock]').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      $$('[data-panel]').forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-panel') === key);
      });
      var url = $('#mockUrl');
      if (url && btn.getAttribute('data-url')) url.textContent = btn.getAttribute('data-url');
    });
  });

  /* ---------------- why tabs ---------------- */
  $$('[data-why]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-why');
      $$('[data-why]').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      $$('[data-whypanel]').forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-whypanel') === key);
      });
    });
  });

  /* ---------------- pricing: audience + summary ---------------- */
  var jenisSelect = $('#jenis');
  var paketSelect = $('#paketSelect');
  var sumName = $('#sumName');
  var sumJenis = $('#sumJenis');
  var sumPrice = $('#sumPrice');
  var sumDp = $('#sumDp');
  var sumSisa = $('#sumSisa');
  var summaryCard = $('#summaryCard');
  var sumCur = $('#sumCur');
  var sumPer = $('#sumPer');
  var sumTotalBox = $('#sumTotalBox');
  var hargaInput = $('#harga');
  var hargaEdit = $('#hargaEdit');
  var fieldHarga = $('#fieldHarga');
  var hargaHint = $('#hargaHint');
  var hargaNote = $('#hargaLabNote');
  var manualPrice = false;

  /* ---------- daftar pesanan (multi-layanan dalam satu invoice) ---------- */
  var orderItems = [];
  var olWrap = $('#orderListWrap');
  var olItemsEl = $('#olItems');
  var olCount = $('#olCount');
  var olClear = $('#olClear');
  var addItemBtn = $('#addItemBtn');
  var sumItemsEl = $('#sumItems');

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function itemSub(pkg, pkgId) {
    if (isCustomPackage(pkg)) {
      return pkgId === 'acust'
        ? 'Aplikasi custom — online / offline · lingkup sesuai kesepakatan'
        : 'Website custom — lingkup sesuai kesepakatan';
    }
    return pkg.type === 'app' ? 'Aplikasi siap pakai — beli selamanya' : 'Jasa pembuatan website';
  }

  function itemTerm(pkg) {
    if (isCustomPackage(pkg)) return 'Sekali bayar · harga sesuai lingkup';
    return pkg.type === 'app' ? 'Sekali bayar · tanpa biaya bulanan/tahunan' : 'Domain & hosting termasuk';
  }

  function makeItem(pkgId, jenis, price, manual) {
    var pkg = PACKAGES[pkgId];
    if (!pkg) return null;
    var isApp = pkg.type === 'app';
    var isCustom = isCustomPackage(pkg);
    return {
      pkgId: pkgId,
      name: packageName(pkg, jenis),
      sub: itemSub(pkg, pkgId),
      term: itemTerm(pkg),
      price: price,
      manual: !!manual,
      isApp: isApp,
      isWebsite: !isApp && !(isCustom && pkgId === 'acust'),
      kind: isApp ? 'Aplikasi' : (isCustom ? 'Custom' : 'Website')
    };
  }

  /* yang akan ditagihkan: daftar pesanan, atau pilihan saat ini bila daftar kosong */
  function invoiceItems() {
    if (orderItems.length) return orderItems.slice();
    var pkg = PACKAGES[paketSelect ? paketSelect.value : ''];
    if (!pkg) return [];
    var it = makeItem(paketSelect.value, jenisSelect ? jenisSelect.value : 'umkm', currentPrice(), manualPrice);
    return it ? [it] : [];
  }

  function renderOrderList() {
    if (!olWrap) return;
    var has = orderItems.length > 0;
    olWrap.hidden = !has;
    if (olCount) olCount.textContent = orderItems.length + ' layanan';
    if (olItemsEl) {
      olItemsEl.innerHTML = orderItems.map(function (it, i) {
        return '<li class="ol-item">'
          + '<span class="ol-badge">' + esc(it.kind) + '</span>'
          + '<span class="ol-info"><b>' + esc(it.name) + '</b>'
          + '<span>' + rupiah(it.price) + (it.manual ? ' · harga isian' : '') + '</span></span>'
          + '<button type="button" class="ol-del" data-del="' + i + '" aria-label="Hapus ' + esc(it.name) + '">'
          + '<svg class="ic" aria-hidden="true"><use href="#i-close"/></svg></button>'
          + '</li>';
      }).join('');
    }
  }

  function flashSummary() {
    if (summaryCard && !reduceMotion) {
      summaryCard.classList.remove('flash');
      void summaryCard.offsetWidth;
      summaryCard.classList.add('flash');
    }
  }

  function addCurrentItem() {
    var pkgId = paketSelect ? paketSelect.value : '';
    var pkg = PACKAGES[pkgId];
    var price = currentPrice();
    if (!pkg) return;
    if (!price) {
      if (fieldHarga) fieldHarga.classList.add('bad');
      showToast('Isi harga terlebih dahulu sebelum menambah ke daftar.');
      if (hargaInput) hargaInput.focus();
      return;
    }
    var dupe = orderItems.some(function (it) { return it.pkgId === pkgId && it.price === price; });
    if (dupe) {
      showToast('Layanan ini sudah ada di daftar pesanan.');
      return;
    }
    var item = makeItem(pkgId, jenisSelect ? jenisSelect.value : 'umkm', price, manualPrice);
    orderItems.push(item);
    renderOrderList();
    updateSummary();
    flashSummary();
    showToast(item.name.replace(' — ', ': ') + ' ditambahkan — ' + rupiah(price) + '.');
  }

  function removeItem(idx) {
    if (isNaN(idx)) return;
    orderItems.splice(idx, 1);
    renderOrderList();
    updateSummary();
    flashSummary();
  }

  function parsePrice(v) {
    var d = String(v == null ? '' : v).replace(/[^\d]/g, '');
    return d ? parseInt(d, 10) : 0;
  }
  function fmtNum(n) { return new Intl.NumberFormat('id-ID').format(n || 0); }
  function currentPrice() { return parsePrice(hargaInput ? hargaInput.value : 0); }

  function refreshPriceUI() {
    if (!hargaInput) return;
    if (hargaEdit) {
      hargaEdit.setAttribute('aria-pressed', manualPrice ? 'true' : 'false');
      hargaEdit.classList.toggle('is-on', manualPrice);
      var lbl = hargaEdit.querySelector('span');
      if (lbl) lbl.textContent = manualPrice ? 'Pakai harga paket' : 'Ubah sendiri';
    }
    hargaInput.readOnly = !manualPrice;
    hargaInput.classList.toggle('is-manual', manualPrice);
    if (hargaNote) hargaNote.textContent = manualPrice ? '— Anda isi sendiri' : '— otomatis dari paket';
  }

  function setManual(on) {
    manualPrice = !!on;
    refreshPriceUI();
  }

  var lastCustom = false;

  /* dipanggil setiap kali paket berubah: atur mode harga & nilainya */
  function applyPackage(pkg) {
    if (!hargaInput || !pkg) return;
    var custom = isCustomPackage(pkg);
    var cameFromCustom = lastCustom;
    lastCustom = custom;
    if (hargaEdit) hargaEdit.hidden = custom;

    if (custom) {
      setManual(true);
      hargaInput.value = '';
      hargaInput.placeholder = '3.500.000';
      if (hargaHint) hargaHint.textContent = 'Isi perkiraan harga sesuai lingkup pekerjaan — masih bisa didiskusikan lewat WhatsApp.';
    } else if (cameFromCustom) {
      /* dari paket custom kembali ke paket tetap → harga ikut paket lagi */
      setManual(false);
      hargaInput.value = fmtNum(pkg.price);
      hargaInput.placeholder = '0';
      if (hargaHint) hargaHint.textContent = 'Harga mengikuti paket yang dipilih. Klik “Ubah sendiri” bila ingin menyesuaikan.';
    } else if (manualPrice) {
      hargaInput.placeholder = '0';
      if (hargaHint) hargaHint.textContent = 'Harga isian Anda tetap dipakai. Klik “Pakai harga paket” untuk kembali ke ' + rupiah(pkg.price) + '.';
    } else {
      hargaInput.value = fmtNum(pkg.price);
      hargaInput.placeholder = '0';
      if (hargaHint) hargaHint.textContent = 'Harga mengikuti paket yang dipilih. Klik “Ubah sendiri” bila ingin menyesuaikan.';
    }
    if (hargaInput) hargaInput.readOnly = !manualPrice;
  }

  function onPackageChange() {
    var pkg = PACKAGES[paketSelect ? paketSelect.value : ''];
    applyPackage(pkg);
    updateSummary();
  }

  function updatePackageOptions() {
    if (!jenisSelect || !paketSelect) return;
    var aud = jenisSelect.value;
    $$('option', paketSelect).forEach(function (opt) {
      var pkg = PACKAGES[opt.value];
      if (pkg) opt.textContent = packageName(pkg, aud);
    });
  }

  function setAudience(aud) {
    $$('[data-aud]').forEach(function (b) {
      var on = b.getAttribute('data-aud') === aud;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $$('#paket [data-umkm]').forEach(function (el) {
      var val = el.getAttribute('data-' + aud);
      if (val) el.textContent = val;
    });
    if (jenisSelect) {
      jenisSelect.value = aud;
      updatePackageOptions();
    }
    updateSummary();
  }

  $$('[data-aud]').forEach(function (btn) {
    btn.addEventListener('click', function () { setAudience(btn.getAttribute('data-aud')); });
  });

  function updateSummary() {
    if (!jenisSelect || !paketSelect) return;
    var aud = jenisSelect.value;
    var pkg = PACKAGES[paketSelect.value];
    if (!pkg) return;

    var items = invoiceItems();
    var multi = orderItems.length > 1;
    var custom = isCustomPackage(pkg);
    var isApp = pkg.type === 'app';
    var price = items.reduce(function (sum, it) { return sum + (it.price || 0); }, 0);
    var dp = Math.round(price / 2);
    var anyManual = items.some(function (it) { return it.manual; });

    if (sumName) {
      sumName.textContent = multi
        ? orderItems.length + ' layanan dalam satu invoice'
        : (orderItems.length === 1 ? orderItems[0].name : packageName(pkg, aud));
    }
    if (sumJenis) {
      sumJenis.textContent = multi
        ? 'Website & aplikasi digabung — satu nomor invoice'
        : orderItems.length === 1
          ? (orderItems[0].isApp ? 'Aplikasi siap pakai · beli selamanya'
            : (orderItems[0].kind === 'Custom' ? 'Custom · lingkup sesuai kesepakatan' : 'Jasa pembuatan website'))
          : custom
            ? (paketSelect.value === 'acust' ? 'Aplikasi custom · online atau offline' : 'Website custom · lingkup bebas')
            : isApp
              ? 'Aplikasi siap pakai · beli selamanya'
              : (aud === 'umkm' ? 'Untuk UMKM / usaha produk & jasa' : 'Untuk pemasaran properti');
    }

    if (sumItemsEl) {
      sumItemsEl.hidden = !multi;
      sumItemsEl.innerHTML = multi ? orderItems.map(function (it) {
        return '<li><span>' + esc(it.name) + '</span><b>' + rupiah(it.price) + '</b></li>';
      }).join('') : '';
    }

    var quote = !price;
    if (sumTotalBox) sumTotalBox.classList.toggle('is-quote', quote);
    if (sumCur) sumCur.hidden = quote;
    if (sumPer) sumPer.textContent = quote ? '' : (anyManual ? '/ termasuk harga isian' : '/ sekali bayar');
    if (sumPrice) sumPrice.textContent = quote ? 'Sesuai lingkup' : fmtNum(price);

    if (sumDp) sumDp.textContent = quote ? 'Menunggu harga' : rupiah(dp);
    if (sumSisa) sumSisa.textContent = quote ? 'Menunggu harga' : rupiah(price - dp);

    var incl = $('#sumInclText');
    if (incl) {
      incl.textContent = (multi || custom || isApp)
        ? 'Sekali bayar — tanpa biaya bulanan atau tahunan'
        : 'Domain & hosting sudah termasuk';
    }
    var sisaLabel = $('.sum-row:not(.dp) span');
    if (sisaLabel) {
      var hasWeb = items.some(function (it) { return it.isWebsite; });
      var hasApp = items.some(function (it) { return !it.isWebsite; });
      sisaLabel.textContent = (hasWeb && hasApp)
        ? 'Peluncuran web & serah terima aplikasi'
        : hasApp ? 'Pelunasan sebelum serah terima' : 'Pelunasan sebelum peluncuran';
    }
    var noteEl = $('.sum-note span');
    if (noteEl) {
      noteEl.textContent = (anyManual || (custom && !orderItems.length))
        ? 'Harga ini Anda isi sendiri. Harga final dikonfirmasi bersama via WhatsApp sebelum pengerjaan dimulai.'
        : 'Ringkasan ini bersifat estimasi. Detail akhir dikonfirmasi bersama via WhatsApp.';
    }
  }

  if (addItemBtn) addItemBtn.addEventListener('click', addCurrentItem);
  if (olItemsEl) {
    olItemsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-del]');
      if (btn) removeItem(parseInt(btn.getAttribute('data-del'), 10));
    });
  }
  if (olClear) {
    olClear.addEventListener('click', function () {
      orderItems = [];
      renderOrderList();
      updateSummary();
      showToast('Daftar pesanan dikosongkan.');
    });
  }

  if (jenisSelect) {
    jenisSelect.addEventListener('change', function () {
      updatePackageOptions();
      setAudience(jenisSelect.value);
    });
  }
  if (paketSelect) {
    paketSelect.addEventListener('change', function () {
      onPackageChange();
      if (summaryCard && !reduceMotion) {
        summaryCard.classList.remove('flash');
        void summaryCard.offsetWidth;
        summaryCard.classList.add('flash');
      }
    });
  }

  /* input harga: hanya angka, otomatis diberi pemisah ribuan */
  if (hargaInput) {
    hargaInput.addEventListener('input', function () {
      var caretEnd = hargaInput.selectionStart === hargaInput.value.length;
      var n = parsePrice(hargaInput.value);
      hargaInput.value = n ? fmtNum(n) : '';
      if (caretEnd) {
        try { hargaInput.setSelectionRange(hargaInput.value.length, hargaInput.value.length); } catch (e) { /* silent */ }
      }
      if (fieldHarga) fieldHarga.classList.remove('bad');
      updateSummary();
    });
    hargaInput.addEventListener('focus', function () {
      if (!hargaInput.readOnly && hargaInput.value === '') hargaInput.placeholder = '3.500.000';
    });
  }

  if (hargaEdit) {
    hargaEdit.addEventListener('click', function () {
      var pkg = PACKAGES[paketSelect ? paketSelect.value : ''];
      if (manualPrice) {
        setManual(false);
        if (hargaInput) hargaInput.value = pkg && pkg.price ? fmtNum(pkg.price) : '';
        if (hargaHint) hargaHint.textContent = 'Harga mengikuti paket yang dipilih. Klik “Ubah sendiri” bila ingin menyesuaikan.';
      } else {
        setManual(true);
        if (hargaHint) hargaHint.textContent = 'Tulis nominal sesuai kesepakatan — sistem menambah pemisah ribuan otomatis.';
        if (hargaInput) {
          hargaInput.focus();
          try { hargaInput.setSelectionRange(hargaInput.value.length, hargaInput.value.length); } catch (e) { /* silent */ }
        }
      }
      updateSummary();
    });
  }

  updatePackageOptions();
  onPackageChange();

  /* ---------------- choose package ---------------- */
  $$('[data-pkg]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-pkg');
      if (paketSelect) {
        paketSelect.value = val;
        onPackageChange();
      }
      var target = document.getElementById('pesan');
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      var pkg = PACKAGES[val];
      var nm = pkg ? packageName(pkg, jenisSelect ? jenisSelect.value : 'umkm') : ('Paket ' + val);
      showToast(nm.replace(' — ', ': ') + ' dipilih — lengkapi data Anda.');
    });
  });

  /* ---------------- compare table ---------------- */
  var compareToggle = $('#compareToggle');
  var compareWrap = $('#compareWrap');
  if (compareToggle && compareWrap) {
    compareToggle.addEventListener('click', function () {
      var open = compareToggle.getAttribute('aria-expanded') === 'true';
      compareToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (open) {
        compareWrap.style.maxHeight = '0px';
      } else {
        compareWrap.style.maxHeight = compareWrap.scrollHeight + 'px';
        setTimeout(function () {
          if (compareToggle.getAttribute('aria-expanded') === 'true') compareWrap.style.maxHeight = 'none';
        }, 600);
      }
    });
    window.addEventListener('resize', function () {
      if (compareToggle.getAttribute('aria-expanded') === 'true') compareWrap.style.maxHeight = 'none';
    });
  }

  /* ---------------- payment tabs ---------------- */
  $$('[data-pay]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-pay');
      $$('[data-pay]').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      $$('[data-paypanel]').forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-paypanel') === key);
      });
    });
  });

  /* ---------------- copy to clipboard ---------------- */
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* silent */ }
    document.body.removeChild(ta);
  }
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = $('.copy-label', btn);
      function done() {
        btn.classList.add('done');
        if (label) label.textContent = 'Tersalin';
        showToast('Nomor disalin: ' + text);
        setTimeout(function () {
          btn.classList.remove('done');
          if (label) label.textContent = 'Salin';
        }, 2200);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
      } else {
        fallbackCopy(text); done();
      }
    });
  });

  /* ---------------- countdown to end of month ---------------- */
  var now = new Date();
  var deadline = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  var cdDays = $('#cdDays'), cdHours = $('#cdHours'), cdMins = $('#cdMins'), cdSecs = $('#cdSecs');
  var cdDeadline = $('#cdDeadline');
  if (cdDeadline) {
    cdDeadline.textContent = 'sampai ' + deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var diff = Math.max(0, deadline.getTime() - Date.now());
    if (cdDays) cdDays.textContent = pad(Math.floor(diff / 86400000));
    if (cdHours) cdHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    if (cdMins) cdMins.textContent = pad(Math.floor((diff % 3600000) / 60000));
    if (cdSecs) cdSecs.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  if (cdDays) { tick(); setInterval(tick, 1000); }

  /* ---------------- FAQ accordion ---------------- */
  $$('.faq-item').forEach(function (item) {
    var q = $('.faq-q', item);
    var a = $('.faq-a', item);
    if (!q || !a) return;
    if (item.classList.contains('open')) a.style.maxHeight = 'none';
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      $$('.faq-item').forEach(function (other) {
        other.classList.remove('open');
        var oq = $('.faq-q', other), oa = $('.faq-a', other);
        if (oq) oq.setAttribute('aria-expanded', 'false');
        if (oa) oa.style.maxHeight = '0px';
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------------- invoice system ---------------- */
  var INVOICE_KEY = 'ss_last_invoice';
  var invScrim = $('#invScrim');
  var lastFocus = null;

  function pad2(n) { return String(n).padStart(2, '0'); }

  function invoiceNumber() {
    var d = new Date();
    var date = '' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate());
    var counter = 1;
    try {
      var raw = localStorage.getItem('ss_invoice_counter');
      var today = localStorage.getItem('ss_invoice_day');
      counter = (raw && today === date) ? (parseInt(raw, 10) + 1) : 1;
      localStorage.setItem('ss_invoice_day', date);
      localStorage.setItem('ss_invoice_counter', String(counter));
    } catch (e) { counter = Math.floor(Math.random() * 900) + 100; }
    return 'INV/SS/' + date + '/' + String(counter).padStart(3, '0');
  }

  function formatDate(d) {
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function buildInvoice(data) {
    var items = (data.items && data.items.length) ? data.items : [];
    if (!items.length) {
      var pkg0 = PACKAGES[data.paket];
      var it0 = makeItem(data.paket, data.jenis, (data.harga && data.harga > 0) ? data.harga : (pkg0 ? pkg0.price : 0), data.manual);
      if (it0) items = [it0];
    }
    var price = items.reduce(function (sum, it) { return sum + (it.price || 0); }, 0);
    var dp = Math.round(price / 2);
    var hasWeb = items.some(function (it) { return it.isWebsite; });
    var hasApp = items.some(function (it) { return !it.isWebsite; });
    var single = items.length === 1 ? items[0] : null;
    var custom = items.length ? items.every(function (it) { return it.kind === 'Custom'; }) : false;

    return {
      no: invoiceNumber(),
      seq: data.seq || readLocalSeq(),
      seqLabel: seqLabel(data.seq || readLocalSeq()),
      date: formatDate(new Date()),
      name: data.nama,
      wa: data.wa,
      items: items,
      /* field ringkas agar kompatibel dengan invoice lama */
      item: single ? single.name : items.length + ' layanan',
      sub: single ? single.sub : 'Rincian per layanan di bawah',
      term: single ? single.term : 'Sekali bayar · tanpa biaya bulanan/tahunan',
      price: price,
      dp: dp,
      sisa: price - dp,
      sisaLabel: (hasWeb && hasApp)
        ? 'Peluncuran web & serah terima aplikasi'
        : (hasApp ? 'Pelunasan sebelum serah terima' : 'Pelunasan sebelum peluncuran'),
      isApp: !hasWeb,
      custom: custom,
      manual: items.some(function (it) { return it.manual; }),
      note: data.catatan || ''
    };
  }

  function fillInvoice(inv) {
    if (!invScrim) return;
    $('#invNo').textContent = inv.no;
    $('#invDate').textContent = inv.date;
    var seqEl = $('#invSeq');
    if (seqEl) {
      var lbl = inv.seqLabel || (inv.seq ? seqLabel(inv.seq) : '');
      seqEl.textContent = lbl || '—';
      seqEl.parentElement.hidden = !lbl;
    }
    var seqNote = $('#invSeqNote');
    if (seqNote) {
      seqNote.textContent = (inv.seq || inv.seqLabel)
        ? 'Nomor urut pemesan ' + (inv.seqLabel || seqLabel(inv.seq)) + ' — pesanan Anda tercatat di sistem.'
        : 'Nomor urut pemesan — diperbarui otomatis setiap ada pesanan baru.';
    }
    $('#invTo').textContent = inv.name;
    $('#invWa').textContent = inv.wa;

    /* baris item: pakai inv.items bila ada, kalau tidak dari data tunggal (invoice lama) */
    var rows = (inv.items && inv.items.length) ? inv.items : [{
      name: inv.item, sub: inv.sub, term: inv.term, price: inv.price
    }];
    var tbody = $('#invRows');
    if (tbody) {
      tbody.innerHTML = rows.map(function (r) {
        return '<tr>'
          + '<td><b>' + esc(r.name) + '</b><span>' + esc(r.sub || '') + '</span></td>'
          + '<td>' + esc(r.term || '') + '</td>'
          + '<td class="r">' + rupiah(r.price) + '</td>'
          + '</tr>';
      }).join('');
    }

    var price = inv.price || rows.reduce(function (sum, r) { return sum + (r.price || 0); }, 0);
    var dp = (typeof inv.dp === 'number') ? inv.dp : Math.round(price / 2);
    $('#invTotal').textContent = rupiah(price);
    $('#invDp').textContent = rupiah(dp);
    $('#invSisa').textContent = rupiah((typeof inv.sisa === 'number') ? inv.sisa : (price - dp));
    $('#invSisaLabel').textContent = inv.sisaLabel || 'Pelunasan sebelum peluncuran';

    /* judul kolom item menyesuaikan jumlah baris */
    var thItem = $('.inv-table thead th');
    if (thItem) thItem.textContent = rows.length > 1 ? 'Item (' + rows.length + ')' : 'Item';
  }

  function openInvoice(inv) {
    if (!invScrim) return;
    fillInvoice(inv);
    lastFocus = document.activeElement;
    invScrim.hidden = false;
    document.body.style.overflow = 'hidden';
    var modal = $('.inv-modal', invScrim);
    if (modal) modal.focus({ preventScroll: true });
    try { localStorage.setItem(INVOICE_KEY, JSON.stringify(inv)); } catch (e) { /* silent */ }
    var lastBtn = $('#lastInvoiceBtn');
    if (lastBtn) lastBtn.hidden = false;
  }

  function closeInvoice() {
    if (!invScrim) return;
    invScrim.hidden = true;
    document.body.style.overflow = '';
    var lastBtn = $('#lastInvoiceBtn');
    if (lastBtn) lastBtn.hidden = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function orderLines(inv) {
    var rows = (inv.items && inv.items.length) ? inv.items : [{ name: inv.item, price: inv.price }];
    if (rows.length === 1) {
      return 'Pesanan: ' + rows[0].name + '\n';
    }
    return 'Pesanan (' + rows.length + ' layanan dalam 1 invoice):\n'
      + rows.map(function (r, i) { return '  ' + (i + 1) + '. ' + r.name + ' — ' + rupiah(r.price); }).join('\n') + '\n';
  }

  function invoiceMessage(inv) {
    return 'Halo Suport System 👋\n\nSaya ingin memesan dan sudah membuat invoice di website.\n\n'
      + 'No. Invoice: ' + inv.no + '\n'
      + (inv.seqLabel || inv.seq ? 'No. Pesanan: ' + (inv.seqLabel || seqLabel(inv.seq)) + '\n' : '')
      + 'Tanggal: ' + inv.date + '\n'
      + 'Nama: ' + inv.name + '\n'
      + 'Nomor WhatsApp: ' + inv.wa + '\n'
      + orderLines(inv)
      + 'Total: ' + rupiah(inv.price) + (inv.manual ? ' (ada harga yang saya isi sendiri — mohon dikonfirmasi)' : '') + '\n'
      + 'DP 50%: ' + rupiah(inv.dp) + '\n'
      + 'Sisa pelunasan: ' + rupiah(inv.sisa) + '\n'
      + (inv.note ? 'Catatan: ' + inv.note + '\n' : '')
      + '\nSaya akan membayar DP melalui GoPay 0813-9239-9300 dan mengirim bukti transfer.\n'
      + 'Mohon dikonfirmasi. Terima kasih.';
  }

  if (invScrim) {
    var currentInvoice = null;
    var sendBtn = $('#invSend');
    var printBtn = $('#invPrint');
    var closeBtns = [$('#invClose'), $('#invClose2')];

    // remember the invoice currently displayed
    var origFill = fillInvoice;
    fillInvoice = function (inv) { currentInvoice = inv; origFill(inv); };

    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        if (!currentInvoice) return;
        window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(invoiceMessage(currentInvoice)), '_blank', 'noopener');
        showToast('WhatsApp dibuka — kirim invoice untuk konfirmasi.');
      });
    }
    if (printBtn) {
      printBtn.addEventListener('click', function () { window.print(); });
    }
    closeBtns.forEach(function (btn) {
      if (btn) btn.addEventListener('click', closeInvoice);
    });
    invScrim.addEventListener('click', function (e) {
      if (e.target === invScrim) closeInvoice();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !invScrim.hidden) closeInvoice();
    });

    // reopen last invoice
    var lastBtn2 = $('#lastInvoiceBtn');
    if (lastBtn2) {
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem(INVOICE_KEY) || 'null'); } catch (e) { saved = null; }
      lastBtn2.hidden = !(saved && saved.no);
      lastBtn2.addEventListener('click', function () {
        var data = saved;
        try { data = JSON.parse(localStorage.getItem(INVOICE_KEY) || 'null') || data; } catch (e) { /* keep */ }
        if (data && data.no) openInvoice(data);
        else showToast('Belum ada invoice. Buat lewat formulir di atas.');
      });
    }

    window.__openInvoice = openInvoice;
  }

  /* ---------------- order form ---------------- */
  var form = $('#orderForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nama = $('#nama').value.trim();
      var wa = $('#wa').value.trim().replace(/[^\d+]/g, '');
      var jenis = $('#jenis').value;
      var paket = $('#paketSelect').value;
      var harga = currentPrice();
      var catatan = $('#catatan').value.trim();
      var fieldNama = $('#fieldNama'), fieldWa = $('#fieldWa');
      var valid = true;

      fieldNama.classList.remove('bad');
      fieldWa.classList.remove('bad');
      if (fieldHarga) fieldHarga.classList.remove('bad');

      if (nama.length < 2) { fieldNama.classList.add('bad'); valid = false; }
      if (!/^(\+?62|0)8\d{7,12}$/.test(wa)) { fieldWa.classList.add('bad'); valid = false; }
      var needPrice = !orderItems.length;
      if (needPrice && !harga) { if (fieldHarga) fieldHarga.classList.add('bad'); valid = false; }

      if (!valid) {
        showToast((needPrice && !harga)
          ? 'Mohon isi harga paket/pesanan Anda terlebih dahulu.'
          : 'Mohon lengkapi nama dan nomor WhatsApp yang valid.');
        if (needPrice && !harga && hargaInput) hargaInput.focus();
        return;
      }

      var items = orderItems.length ? orderItems.slice() : (function () {
        var it = makeItem(paket, jenis, harga, manualPrice);
        return it ? [it] : [];
      })();
      var submitBtn = form.querySelector('button[type="submit"]');
      var btnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-clock"/></svg> Menyiapkan nomor pesanan…';
      }

      takeSeq().then(function (seq) {
        var inv = buildInvoice({ nama: nama, wa: wa, jenis: jenis, paket: paket, catatan: catatan, harga: harga, manual: manualPrice, items: items, seq: seq });
        bumpProductCounters(items);
        if (window.__openInvoice) {
          window.__openInvoice(inv);
          showToast('Pesanan ' + (inv.seqLabel || seqLabel(seq)) + ' · Invoice ' + inv.no + ' dibuat.');
        } else {
          window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(invoiceMessage(inv)), '_blank', 'noopener');
        }
      }).catch(function () {
        showToast('Gagal membuat nomor pesanan. Coba lagi.');
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = btnHtml; }
      });
    });

    ['#nama', '#wa'].forEach(function (sel) {
      var input = $(sel);
      if (input) {
        input.addEventListener('input', function () {
          var field = input.closest('.field');
          if (field) field.classList.remove('bad');
        });
      }
    });
  }

  /* ---------------- footer year ---------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();

