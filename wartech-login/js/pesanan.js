/* Lacak satu pesanan: timeline status, diperbarui otomatis tiap 3 detik */
(function () {
  WT.nav('lacak'); var box = document.getElementById('isi'), no = new URLSearchParams(location.search).get('no') || '', last = '';
  var ST = [['menunggu', 'bi-hourglass-split'], ['diproses', 'bi-fire'], ['siap', 'bi-bag-check'], ['selesai', 'bi-patch-check']];
  function render() {
    var t = WT.trx().find(function (x) { return x.no === no; }), snap = JSON.stringify(t || null);
    if (snap === last) return; last = snap;
    if (!t) { box.innerHTML = '<div class="wt-card empty"><i class="bi bi-search"></i><h2 class="h5">Pesanan tidak ditemukan</h2><p class="muted">Periksa nomor pesanan atau buat pesanan baru.</p><a href="menu.html" class="btn btn-wt px-4">Lihat Menu</a></div>'; return; }
    var idx = ST.findIndex(function (s) { return s[0] === t.status; }), batal = t.status === 'batal';
    box.innerHTML = '<div class="wt-card p-4 p-md-5"><div class="d-flex flex-wrap justify-content-between gap-2"><div><div class="small muted">Nomor pesanan</div><h1 class="h3 mb-0">' + WT.esc(t.no) + '</h1><div class="small muted">' + WT.tgl(t.tanggal) + ' &bull; a.n. ' + WT.esc(t.nama) + '</div></div><div><span class="st st-' + t.status + '">' + WT.STATUS[t.status] + '</span></div></div>' +
      (batal ? '<div class="alert alert-danger mt-4 mb-0"><b>Pesanan dibatalkan.</b><br>Alasan: ' + WT.esc(t.alasan) + '</div>'
        : '<div class="tl mt-4">' + ST.map(function (s, i) { return '<div class="s' + (i <= idx ? ' on' : '') + '"><i class="bi ' + s[1] + '"></i>' + WT.STATUS[s[0]] + '</div>'; }).join('') + '</div>') +
      (t.status === 'siap' ? '<div class="alert alert-success text-center fw-semibold mt-4 mb-0">Pesananmu siap diambil' + (t.meja ? ' (' + WT.esc(t.meja) + ')' : '') + '.</div>' : '') +
      '<div class="mt-4">' + t.items.map(function (i) { return '<div class="d-flex justify-content-between py-2 border-bottom" style="border-color:var(--line)!important"><span>' + i.qty + '&times; ' + WT.esc(i.nama) + (i.catatan ? '<div class="small muted">Catatan: ' + WT.esc(i.catatan) + '</div>' : '') + '</span><b>' + WT.rupiah(i.harga * i.qty) + '</b></div>'; }).join('') + '</div>' +
      '<div class="d-flex justify-content-between align-items-center mt-3"><div class="small muted">Pembayaran: ' + (t.metode === 'qris' ? 'QRIS' : 'Tunai di kasir') + '<br><span class="st ' + (t.lunas ? 'st-siap' : 'st-menunggu') + '">' + (t.lunas ? 'Lunas' : 'Belum dibayar') + '</span></div><div class="fs-3 fw-bold">' + WT.rupiah(t.total) + '</div></div>' +
      (t.metode === 'qris' && WT.QRIS_IMG && !t.lunas && !batal ? '<div class="text-center mt-4 p-3 rounded-4 border" style="border-color:var(--line)!important"><div class="fw-semibold mb-2">Bayar dengan QRIS</div><img data-qr="1" src="' + WT.gambar({ gambar: WT.QRIS_IMG }) + '" alt="QRIS pembayaran" style="width:100%;max-width:280px;border-radius:16px;background:#fff"><div class="mt-2">Nominal: <b>' + WT.rupiah(t.total) + '</b></div><div class="small muted">Scan dengan aplikasi bank atau e-wallet, masukkan nominal sesuai total, lalu tunjukkan bukti bayar ke kasir. Status berubah jadi Lunas setelah kasir mengonfirmasi.</div></div>' : '') +
      (t.catatan ? '<p class="small muted mt-2 mb-0">Catatan: ' + WT.esc(t.catatan) + '</p>' : '') + (batal || t.status === 'selesai' ? '' : '<p class="small muted mt-3 mb-0">Status diperbarui otomatis.</p>') + '</div>' +
      '<div class="d-flex flex-wrap gap-2 mt-3"><button class="btn btn-wt" data-ulang="1">Pesan lagi</button><a href="menu.html" class="btn btn-ghost">Kembali ke menu</a><a href="riwayat.html" class="btn btn-ghost">Pesanan lain</a></div>';
    var qi = box.querySelector('[data-qr]'); if (qi) qi.onerror = function () { qi.parentNode.innerHTML = '<div class="small muted">QR belum tersedia. Silakan bayar di kasir.</div>'; };
  }
  box.addEventListener('click', function (e) {
    if (!e.target.closest('[data-ulang]')) return;
    var t = WT.trx().find(function (x) { return x.no === no; }), skip = 0; if (!t) return;
    t.items.forEach(function (i) { try { WT.tambahKeranjang(i.id, i.qty, i.catatan); } catch (er) { skip++; } });   // cek ulang stok & harga terbaru
    WT.toast(skip ? skip + ' menu dilewati (stok/ketersediaan berubah).' : 'Menu dimasukkan ke keranjang', skip ? 'err' : 'ok');
    setTimeout(function () { location.href = 'keranjang.html'; }, 900);
  });
  render(); setInterval(render, 3000); addEventListener('storage', render);
})();
