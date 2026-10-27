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
    'pu': { price: 1000000, type: 'app', label: 'APK POS UMKM — Kasir UMKM' }
  };

  function packageName(pkg, aud) {
    if (!pkg) return '';
    return pkg.type === 'app' ? pkg.label : pkg[aud];
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function rupiah(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n); }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    if (sumName) sumName.textContent = packageName(pkg, aud);
    if (sumJenis) {
      sumJenis.textContent = pkg.type === 'app'
        ? 'Aplikasi siap pakai · beli selamanya'
        : (aud === 'umkm' ? 'Untuk UMKM / usaha produk & jasa' : 'Untuk pemasaran properti');
    }
    if (sumPrice) sumPrice.textContent = new Intl.NumberFormat('id-ID').format(pkg.price);
    if (sumDp) sumDp.textContent = rupiah(pkg.price / 2);
    if (sumSisa) sumSisa.textContent = rupiah(pkg.price / 2);
    var incl = $('#sumInclText');
    if (incl) {
      incl.textContent = pkg.type === 'app'
        ? 'Sekali bayar — tanpa biaya bulanan atau tahunan'
        : 'Domain & hosting sudah termasuk';
    }
    var sisaLabel = $('.sum-row:not(.dp) span');
    if (sisaLabel) sisaLabel.textContent = pkg.type === 'app' ? 'Pelunasan sebelum serah terima' : 'Pelunasan sebelum peluncuran';
  }

  if (jenisSelect) {
    jenisSelect.addEventListener('change', function () {
      updatePackageOptions();
      setAudience(jenisSelect.value);
    });
  }
  if (paketSelect) {
    paketSelect.addEventListener('change', function () {
      updateSummary();
      if (summaryCard && !reduceMotion) {
        summaryCard.classList.remove('flash');
        void summaryCard.offsetWidth;
        summaryCard.classList.add('flash');
      }
    });
  }
  updatePackageOptions();
  updateSummary();

  /* ---------------- choose package ---------------- */
  $$('[data-pkg]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-pkg');
      if (paketSelect) {
        paketSelect.value = val;
        updateSummary();
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
    var pkg = PACKAGES[data.paket];
    var isApp = pkg.type === 'app';
    return {
      no: invoiceNumber(),
      date: formatDate(new Date()),
      name: data.nama,
      wa: data.wa,
      item: packageName(pkg, data.jenis),
      sub: isApp ? 'Aplikasi siap pakai — beli selamanya' : 'Jasa pembuatan website',
      term: isApp ? 'Sekali bayar · tanpa biaya bulanan/tahunan' : 'Domain & hosting termasuk',
      price: pkg.price,
      dp: pkg.price / 2,
      sisa: pkg.price / 2,
      sisaLabel: isApp ? 'Pelunasan sebelum serah terima' : 'Pelunasan sebelum peluncuran',
      isApp: isApp,
      note: data.catatan || ''
    };
  }

  function fillInvoice(inv) {
    if (!invScrim) return;
    $('#invNo').textContent = inv.no;
    $('#invDate').textContent = inv.date;
    $('#invTo').textContent = inv.name;
    $('#invWa').textContent = inv.wa;
    $('#invItem').textContent = inv.item;
    $('#invItemSub').textContent = inv.sub;
    $('#invTerm').textContent = inv.term;
    $('#invPrice').textContent = rupiah(inv.price);
    $('#invTotal').textContent = rupiah(inv.price);
    $('#invDp').textContent = rupiah(inv.dp);
    $('#invSisa').textContent = rupiah(inv.sisa);
    $('#invSisaLabel').textContent = inv.sisaLabel;
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

  function invoiceMessage(inv) {
    return 'Halo Suport System 👋\n\nSaya ingin memesan dan sudah membuat invoice di website.\n\n'
      + 'No. Invoice: ' + inv.no + '\n'
      + 'Tanggal: ' + inv.date + '\n'
      + 'Nama: ' + inv.name + '\n'
      + 'Nomor WhatsApp: ' + inv.wa + '\n'
      + 'Pesanan: ' + inv.item + '\n'
      + 'Harga: ' + rupiah(inv.price) + '\n'
      + 'DP 50%: ' + rupiah(inv.dp) + '\n'
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
      var catatan = $('#catatan').value.trim();
      var fieldNama = $('#fieldNama'), fieldWa = $('#fieldWa');
      var valid = true;

      fieldNama.classList.remove('bad');
      fieldWa.classList.remove('bad');

      if (nama.length < 2) { fieldNama.classList.add('bad'); valid = false; }
      if (!/^(\+?62|0)8\d{7,12}$/.test(wa)) { fieldWa.classList.add('bad'); valid = false; }

      if (!valid) {
        showToast('Mohon lengkapi nama dan nomor WhatsApp yang valid.');
        return;
      }

      var inv = buildInvoice({ nama: nama, wa: wa, jenis: jenis, paket: paket, catatan: catatan });
      if (window.__openInvoice) {
        window.__openInvoice(inv);
        showToast('Invoice ' + inv.no + ' dibuat — kirim ke WhatsApp atau cetak.');
      } else {
        window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(invoiceMessage(inv)), '_blank', 'noopener');
      }
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
