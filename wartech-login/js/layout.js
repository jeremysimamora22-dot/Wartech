/* WarTech - tampilan bersama: navbar, footer, toast, kartu produk, kerangka admin */
(function () {
  var b = WT.base, root = document.documentElement;
  root.setAttribute('data-bs-theme', localStorage.getItem(WT.K.tema) || 'light');

  WT.deco = function (extra) {
    var d = document.createElement('div'); d.className = 'deco';
    var h = '<i class="b b1"></i><i class="b b2"></i><i class="b b3"></i>';
    for (var i = 0; i < 12; i++) h += '<i class="spark" style="left:' + (i * 37 + 11) % 100 + '%;top:' + (i * 53 + 7) % 100 + '%;width:' + (4 + i % 3 * 2) + 'px;height:' + (4 + i % 3 * 2) + 'px;animation-delay:' + i % 7 * 1.1 + 's"></i>';
    d.innerHTML = h; document.body.prepend(d);
  };
  WT.toggleTema = function () {
    var n = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-bs-theme', n); localStorage.setItem(WT.K.tema, n);
  };
  WT.temaBtn = '<button type="button" class="theme-toggle" data-tema aria-label="Ganti tema terang/gelap"><span class="knob"></span><i class="bi bi-sun-fill"></i><i class="bi bi-moon-stars-fill"></i></button>';
  document.addEventListener('click', function (e) { if (e.target.closest('[data-tema]')) WT.toggleTema(); });

  WT.toast = function (msg, tipe) {
    var w = document.getElementById('toasts');
    if (!w) { w = document.createElement('div'); w.id = 'toasts'; w.className = 'toast-container position-fixed bottom-0 end-0 p-3'; w.style.zIndex = 2000; document.body.appendChild(w); }
    var t = document.createElement('div');
    t.className = 'toast align-items-center border-0 text-bg-' + (tipe === 'err' ? 'danger' : 'primary');
    t.innerHTML = '<div class="d-flex"><div class="toast-body fw-semibold"></div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
    t.querySelector('.toast-body').textContent = msg; w.appendChild(t);
    var bt = new bootstrap.Toast(t, { delay: 3200 }); t.addEventListener('hidden.bs.toast', function () { t.remove(); }); bt.show();
  };
  WT.reveal = function () {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }); }, { threshold: .08 });
    document.querySelectorAll('.reveal:not(.show)').forEach(function (el) { io.observe(el); });
  };
  WT.badge = function () {
    var n = WT.cart().reduce(function (s, i) { return s + i.qty; }, 0), el = document.getElementById('cartCount');
    if (el) { el.textContent = n; el.style.display = n ? 'grid' : 'none'; }
  };

  /* ---- navbar pelanggan ---- */
  WT.nav = function (aktif) {
    var u = WT.user(), L = function (h, t, k) { return '<li class="nav-item"><a class="nav-link' + (aktif === k ? ' active' : '') + '" href="' + b + h + '">' + t + '</a></li>'; };
    var akun = u ? (u.role === 'admin' ? '<a class="btn btn-ghost btn-sm" href="' + b + 'admin/index.html">Admin</a>' : '') + '<button class="btn btn-ghost btn-sm" data-keluar>Keluar</button>'
      : '<a class="btn btn-wt btn-sm px-3" href="' + b + 'login.html">Masuk</a>';
    document.getElementById('nav').innerHTML =
      '<nav class="navbar navbar-expand-lg wt-nav sticky-top"><div class="container">' +
      '<a class="navbar-brand d-flex align-items-center gap-2" href="' + b + 'index.html"><img src="' + b + 'img/logo.svg" width="40" height="40" alt="WarTech"><span class="brand-name">WarTech</span></a>' +
      '<div class="d-flex align-items-center gap-2 order-lg-3 ms-auto ms-lg-3">' +
      '<a class="icon-btn" href="' + b + 'menu.html#cari" aria-label="Cari menu"><i class="bi bi-search"></i></a>' +
      '<a class="icon-btn position-relative" href="' + b + 'keranjang.html" aria-label="Keranjang"><i class="bi bi-cart3"></i><span class="badge-cart" id="cartCount">0</span></a>' +
      '<button class="navbar-toggler border-0" data-bs-toggle="collapse" data-bs-target="#menuNav" aria-label="Menu"><i class="bi bi-list fs-2"></i></button></div>' +
      '<div class="collapse navbar-collapse order-lg-2" id="menuNav"><ul class="navbar-nav mx-auto gap-lg-3">' +
      L('index.html', 'Beranda', 'home') + L('menu.html', 'Menu', 'menu') + L('index.html#cara', 'Cara Pemesanan', 'cara') + L('riwayat.html', 'Lacak Pesanan', 'lacak') +
      '</ul><div class="d-flex align-items-center gap-2 py-2 py-lg-0">' + WT.temaBtn + akun + '</div></div></div></nav>';
    document.getElementById('foot').innerHTML =
      '<footer class="wt-main border-top mt-4" style="border-color:var(--line)!important"><div class="container d-flex flex-wrap justify-content-between gap-3 small muted">' +
      '<span class="fw-bold" style="color:var(--ink)">WarTech</span><span>Aplikasi Penjualan Sederhana Warung/Kantin</span><span>&copy; ' + new Date().getFullYear() + ' WarTech</span></div></footer>';
    WT.deco(); WT.badge();
    var nv = document.querySelector('.wt-nav'); window.addEventListener('scroll', function () { nv.classList.toggle('scrolled', scrollY > 8); }, { passive: true });
  };
  document.addEventListener('click', function (e) { if (e.target.closest('[data-keluar]')) { WT.logout(); location.href = WT.base + 'index.html'; } });

  /* ---- kartu produk + modal detail (dipakai beranda & menu) ---- */
  WT.kartu = function (p) {
    var habis = p.stok <= 0;
    return '<div class="col-6 col-md-4 col-xl-3 reveal"><article class="pcard wt-card h-100 d-flex flex-column">' +
      '<button class="pimg" data-detail="' + p.id + '" aria-label="Detail ' + WT.esc(p.nama) + '"><img loading="lazy" src="' + WT.gambar(p) + '" alt="' + WT.esc(p.nama) + '">' +
      (p.unggulan && !habis ? '<span class="tag">Pilihan kantin</span>' : '') + (habis ? '<span class="sold">Habis</span>' : '') + '</button>' +
      '<div class="p-3 d-flex flex-column flex-grow-1"><div class="small muted">' + WT.esc(WT.namaKategori(p.kategoriId)) + '</div>' +
      '<h3 class="h6 mb-1">' + WT.esc(p.nama) + '</h3><p class="small muted line2 mb-2">' + WT.esc(p.deskripsi || '') + '</p>' +
      '<div class="mt-auto d-flex align-items-center justify-content-between gap-2"><span class="price">' + WT.rupiah(p.harga) + '</span>' +
      '<button class="btn btn-wt btn-sm" data-add="' + p.id + '"' + (habis ? ' disabled' : '') + '><i class="bi bi-plus-lg"></i> Tambah</button></div></div></article></div>';
  };
  WT.pasangProduk = function (area) {
    var m = document.getElementById('modalProduk');
    if (!m) {
      document.body.insertAdjacentHTML('beforeend', '<div class="modal fade" id="modalProduk" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content" style="border-radius:24px;overflow:hidden"><button class="btn-close position-absolute end-0 m-3 bg-white rounded-circle p-2" style="z-index:2" data-bs-dismiss="modal" aria-label="Tutup"></button><div id="mpIsi"></div></div></div></div>');
      m = document.getElementById('modalProduk');
    }
    var modal = new bootstrap.Modal(m);
    function buka(id) {
      var p = WT.produk().find(function (x) { return x.id === id; }); if (!p) return;
      var ada = (WT.cart().find(function (x) { return x.id === id; }) || {}).qty || 0, sisa = Math.max(p.stok - ada, 0);
      document.getElementById('mpIsi').innerHTML =
        '<img src="' + WT.gambar(p) + '" class="w-100" style="aspect-ratio:16/9;object-fit:cover" alt="' + WT.esc(p.nama) + '"><div class="p-4">' +
        '<h2 class="h4 mb-1">' + WT.esc(p.nama) + '</h2><div class="small muted mb-2">' + WT.esc(WT.namaKategori(p.kategoriId)) + ' &nbsp;|&nbsp; ' + (p.stok <= 0 ? 'Stok habis' : p.stok <= 5 ? 'Tersisa ' + p.stok : 'Tersedia') + '</div>' +
        '<p class="muted small">' + WT.esc(p.deskripsi || '') + '</p><p class="price fs-4 mb-3">' + WT.rupiah(p.harga) + ' <small class="muted fw-normal fs-6">/ porsi</small></p>' +
        '<label class="form-label small">Catatan khusus (opsional)</label><input id="mpCat" class="form-control mb-3" maxlength="120" placeholder="Contoh: tidak pedas, tanpa bawang">' +
        '<div class="d-flex justify-content-between align-items-center mb-3"><div class="qty"><button id="mpMin">-</button><b id="mpQ">1</b><button id="mpPlus">+</button></div><b class="fs-5" id="mpSub">' + WT.rupiah(p.harga) + '</b></div>' +
        '<button class="btn btn-wt w-100 py-2" id="mpAdd"' + (sisa < 1 ? ' disabled' : '') + '>Tambah ke Keranjang</button>' +
        (sisa < 1 ? '<p class="text-danger small text-center mt-2 mb-0">' + (p.stok <= 0 ? 'Stok habis.' : 'Jumlah di keranjang sudah mencapai stok.') + '</p>' : '') + '</div>';
      var q = 1, qe = document.getElementById('mpQ');
      function up() { qe.textContent = q; document.getElementById('mpSub').textContent = WT.rupiah(p.harga * q); document.getElementById('mpMin').disabled = q <= 1; document.getElementById('mpPlus').disabled = q >= sisa; }
      document.getElementById('mpMin').onclick = function () { q = Math.max(1, q - 1); up(); };
      document.getElementById('mpPlus').onclick = function () { q = Math.min(sisa, q + 1); up(); };
      document.getElementById('mpAdd').onclick = function () {
        try { WT.tambahKeranjang(p.id, q, document.getElementById('mpCat').value.trim()); WT.toast(p.nama + ' (' + q + ') masuk keranjang'); modal.hide(); } catch (er) { WT.toast(er.message, 'err'); }
      };
      up(); modal.show();
    }
    area.addEventListener('click', function (e) {
      var d = e.target.closest('[data-detail]'), a = e.target.closest('[data-add]');
      if (d) buka(d.dataset.detail);
      if (a) { try { WT.tambahKeranjang(a.dataset.add, 1); WT.toast('Masuk keranjang'); } catch (er) { WT.toast(er.message, 'err'); } }
    });
  };

  /* ---- kerangka admin: sidebar + topbar membungkus <main id="isi"> ---- */
  WT.admin = function (aktif, judul) {
    if (!WT.guard()) return false;
    var m = [['index.html', 'bi-speedometer2', 'Dashboard', 'dash'], ['kasir.html', 'bi-cash-coin', 'Kasir / Transaksi Baru', 'kasir'], ['transaksi.html', 'bi-receipt', 'Daftar Transaksi', 'trx'],
      ['produk.html', 'bi-box-seam', 'Produk & Stok', 'produk'], ['kategori.html', 'bi-tags', 'Kategori', 'kategori'], ['laporan.html', 'bi-bar-chart-line', 'Laporan Penjualan', 'laporan']];
    var links = m.map(function (x) { return '<a class="side-link' + (aktif === x[3] ? ' on' : '') + '" href="' + x[0] + '"><i class="bi ' + x[1] + '"></i>' + x[2] + '</a>'; }).join('') +
      '<hr><a class="side-link" href="../index.html"><i class="bi bi-box-arrow-up-right"></i>Lihat website</a><a class="side-link" href="#" data-keluar><i class="bi bi-box-arrow-left"></i>Keluar</a>';
    var isi = document.getElementById('isi'), s = document.createElement('div'); s.className = 'adm';
    s.innerHTML = '<aside class="side d-none d-lg-block"><a href="index.html" class="d-flex align-items-center gap-2 mb-3 p-0"><img src="../img/logo.svg" width="38" height="38" alt=""><span><b class="d-block" style="color:var(--ink)">WarTech</b><small>Admin</small></span></a>' + links + '</aside>' +
      '<div class="adm-main"><header class="adm-top"><button class="btn btn-ghost d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#sideM" aria-label="Menu"><i class="bi bi-list"></i></button><h1 class="h5 m-0">' + judul + '</h1>' +
      '<div class="ms-auto d-flex align-items-center gap-3"><span class="small muted d-none d-sm-inline">Halo, ' + WT.esc(WT.user().nama) + '</span>' + WT.temaBtn + '</div></header><div id="slot" class="p-3 p-lg-4"></div></div>' +
      '<div class="offcanvas offcanvas-start" id="sideM"><div class="offcanvas-header"><b>WarTech Admin</b><button class="btn-close" data-bs-dismiss="offcanvas"></button></div><div class="offcanvas-body side" style="width:auto;height:auto;position:static">' + links + '</div></div>';
    isi.parentNode.insertBefore(s, isi); s.querySelector('#slot').appendChild(isi); WT.deco(); return true;
  };
})();

/* ---- helper admin: struk & pemantau pesanan baru (antar tab browser) ---- */
WT.struk = function (t) {
  var line = '------------------------------<br>';
  return '<div style="font-family:monospace;font-size:13px;width:300px;margin:auto"><div style="text-align:center"><b>WARTECH</b><br>Warung / Kantin<br>' + line + '</div>No : ' + t.no + '<br>Tgl: ' + WT.tgl(t.tanggal) + '<br>Nama: ' + WT.esc(t.nama) + '<br>' + line +
    t.items.map(function (i) { return WT.esc(i.nama) + '<br>&nbsp;&nbsp;' + i.qty + ' x ' + WT.rupiah(i.harga) + ' = ' + WT.rupiah(i.qty * i.harga); }).join('<br>') + '<br>' + line +
    '<b>TOTAL : ' + WT.rupiah(t.total) + '</b><br>' + (t.bayar ? 'Bayar : ' + WT.rupiah(t.bayar) + '<br>Kembali: ' + WT.rupiah(t.bayar - t.total) + '<br>' : '') + '<div style="text-align:center">' + line + 'Terima kasih</div></div>';
};
WT.cetak = function (t) {
  var w = window.open('', '_blank', 'width=380,height=600'); if (!w) { WT.toast('Pop-up diblokir browser.', 'err'); return; }
  w.document.write('<html><head><title>Struk ' + t.no + '</title></head><body>' + WT.struk(t) + '</body></html>'); w.document.close(); w.focus(); w.print();
};
WT.pantau = function (cb) {
  var n = WT.trx().length;
  addEventListener('storage', function (e) {
    if (e.key !== WT.K.trx && e.key !== WT.K.prd) return;
    var m = WT.trx().length; if (m > n) WT.toast('Pesanan baru masuk!'); n = m; cb();
  });
};
