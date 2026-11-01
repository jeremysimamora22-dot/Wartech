/* Checkout: validasi form, konfirmasi, lalu buat transaksi (stok berkurang saat disimpan) */
(function () {
  WT.nav('menu'); var $ = function (i) { return document.getElementById(i); };
  var c = WT.cart(), prd = WT.produk();
  var L = c.map(function (i) { var p = prd.find(function (x) { return x.id === i.id; }); return { i: i, p: p, sub: p ? p.harga * i.qty : 0, ok: !!(p && p.aktif && p.stok >= i.qty) }; });
  var total = L.reduce(function (s, l) { return s + l.sub; }, 0);
  if (!L.length || !L.every(function (l) { return l.ok; })) {
    $('f').classList.add('d-none'); var k = $('kosongCo'); k.classList.remove('d-none');
    if (L.length) { k.querySelector('h2').textContent = 'Ada item yang perlu diperbaiki'; k.querySelector('a').textContent = 'Buka Keranjang'; k.querySelector('a').href = 'keranjang.html'; }
    return;
  }
  var u = WT.user(); if (u && u.role === 'pelanggan') $('nama').value = u.nama;
  $('ringkas').innerHTML = '<h2 class="h6 mb-3">Ringkasan</h2>' + L.map(function (l) {
    return '<div class="d-flex justify-content-between small mb-2"><span>' + l.i.qty + '&times; ' + WT.esc(l.p.nama) + '</span><b>' + WT.rupiah(l.sub) + '</b></div>';
  }).join('') + '<hr><div class="d-flex justify-content-between align-items-center"><span class="muted">Total</span><span class="fs-3 fw-bold">' + WT.rupiah(total) + '</span></div><button class="btn btn-wt w-100 py-2 mt-3">Buat Pesanan</button>';
  var modal = new bootstrap.Modal($('konfirm')), busy = false;
  var mQ = $('mQris');                                   // QRIS aktif hanya kalau file QR (WT.QRIS_IMG) ada
  if (WT.QRIS_IMG) { var pr = new Image(); pr.onload = function () { mQ.disabled = false; $('qrisNote').textContent = 'Scan QR setelah pesanan dibuat.'; }; pr.src = WT.gambar({ gambar: WT.QRIS_IMG }); }
  function metode() { return document.querySelector('input[name="metode"]:checked').value; }
  function buat() {
    if (busy) return; busy = true;
    var ya = $('ya'); ya.disabled = true; ya.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memproses...';
    try {
      var t = WT.buatTransaksi({ nama: $('nama').value.trim(), telp: $('telp').value.trim(), meja: $('meja').value.trim(), catatan: $('cat').value.trim(), sumber: 'online', status: 'menunggu', metode: metode(),
        items: c.map(function (i) { return { id: i.id, qty: i.qty, catatan: i.catatan }; }) });
      WT.ingatPesanan(t.no); WT.saveCart([]); location.href = 'pesanan.html?no=' + encodeURIComponent(t.no);
    } catch (er) { busy = false; modal.hide(); $('err').textContent = er.message + ' Periksa kembali keranjangmu.'; }
  }
  $('f').addEventListener('submit', function (e) {
    e.preventDefault(); $('err').textContent = '';
    var nama = $('nama').value.trim(), telp = $('telp').value.trim();
    $('eNama').textContent = nama.length < 2 ? 'Nama minimal 2 karakter.' : '';
    $('eTelp').textContent = telp && !/^[0-9+\-\s]{8,16}$/.test(telp) ? 'Nomor telepon tidak valid.' : '';
    if ($('eNama').textContent || $('eTelp').textContent) return;
    $('konfirmIsi').innerHTML = '<h2 class="h5">Konfirmasi pesanan</h2><p class="small muted">Atas nama ' + WT.esc(nama) + ' &bull; ' + (metode() === 'qris' ? 'QRIS' : 'Tunai di kasir') + '</p>' +
      L.map(function (l) { return '<div class="d-flex justify-content-between small mb-1"><span>' + l.i.qty + '&times; ' + WT.esc(l.p.nama) + '</span><span>' + WT.rupiah(l.sub) + '</span></div>'; }).join('') +
      '<hr><div class="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>' + WT.rupiah(total) + '</span></div>' +
      '<div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-ghost" data-bs-dismiss="modal">Kembali</button><button type="button" class="btn btn-wt px-4" id="ya">Ya, buat pesanan</button></div>';
    $('ya').onclick = buat; modal.show();
  });
})();
