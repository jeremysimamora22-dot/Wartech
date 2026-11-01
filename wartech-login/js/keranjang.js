(function () {
  WT.nav('menu'); var box = document.getElementById('isi');
  function render() {
    var prd = WT.produk(), c = WT.cart();
    var L = c.map(function (i) { var p = prd.find(function (x) { return x.id === i.id; }); return { i: i, p: p, ok: !!(p && p.aktif && p.stok >= i.qty), sub: p ? p.harga * i.qty : 0 }; });
    var total = L.reduce(function (s, l) { return s + l.sub; }, 0), valid = L.length > 0 && L.every(function (l) { return l.ok; });
    WT.badge();
    if (!L.length) { box.innerHTML = '<div class="wt-card empty"><i class="bi bi-cart-x"></i><h2 class="h5">Keranjangmu masih kosong</h2><p class="muted">Yuk pilih menu favoritmu dulu.</p><a href="menu.html" class="btn btn-wt px-4">Lihat Menu</a></div>'; return; }
    box.innerHTML = '<div class="row g-4"><div class="col-lg-8"><div class="text-end mb-2"><button class="btn btn-link text-danger p-0 small" data-clear="1">Kosongkan keranjang</button></div>' +
      L.map(function (l) {
        var p = l.p, err = !p ? 'Menu ini sudah tidak tersedia. Hapus dari keranjang.' : !l.ok ? (p.stok <= 0 ? 'Stok habis.' : 'Stok tersisa ' + p.stok + '. Kurangi jumlahnya.') : '';
        return '<div class="wt-card p-3 mb-3 d-flex gap-3"><img class="rounded-4" style="width:84px;height:84px;object-fit:cover" src="' + WT.gambar(p) + '" alt="">' +
          '<div class="flex-grow-1" style="min-width:0"><div class="fw-bold">' + WT.esc(p ? p.nama : 'Menu tidak tersedia') + '</div>' + (p ? '<div class="small muted">' + WT.rupiah(p.harga) + '</div>' : '') +
          (l.i.catatan ? '<div class="small muted">Catatan: ' + WT.esc(l.i.catatan) + '</div>' : '') + (err ? '<div class="small text-danger">' + err + '</div>' : '') +
          '<div class="qty mt-2"><button data-min="' + l.i.id + '"' + (l.i.qty <= 1 ? ' disabled' : '') + '>-</button><b>' + l.i.qty + '</b><button data-plus="' + l.i.id + '"' + (!p || l.i.qty >= p.stok ? ' disabled' : '') + '>+</button></div></div>' +
          '<div class="d-flex flex-column justify-content-between align-items-end"><button class="btn btn-sm text-secondary p-0" data-del="' + l.i.id + '" aria-label="Hapus"><i class="bi bi-trash fs-5"></i></button><b>' + WT.rupiah(l.sub) + '</b></div></div>';
      }).join('') + '</div><div class="col-lg-4"><aside class="wt-card p-4"><div class="muted">Total sementara</div><div class="fs-2 fw-bold mb-3">' + WT.rupiah(total) + '</div>' +
      (valid ? '<a href="checkout.html" class="btn btn-wt w-100 py-2 mb-2">Lanjut ke Checkout</a>' : '<div class="alert alert-danger small">Perbaiki item bermasalah sebelum checkout.</div>') +
      '<a href="menu.html" class="btn btn-ghost w-100">Lanjut Belanja</a></aside></div></div>';
  }
  box.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return; var c = WT.cart();
    var it = function (id) { return c.find(function (x) { return x.id === id; }); };
    if (t.dataset.plus) { var a = it(t.dataset.plus), p = WT.produk().find(function (x) { return x.id === a.id; }); if (p && a.qty < p.stok) a.qty++; }
    else if (t.dataset.min) { var m = it(t.dataset.min); if (m && m.qty > 1) m.qty--; }
    else if (t.dataset.del) c = c.filter(function (x) { return x.id !== t.dataset.del; });
    else if (t.dataset.clear) { if (!confirm('Kosongkan semua menu di keranjang?')) return; c = []; }
    else return;
    WT.saveCart(c); render();
  });
  render();
})();
