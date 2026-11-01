/* FR-05: cari transaksi berdasarkan tanggal / no transaksi. Admin juga memproses pesanan online di sini. */
(function () {
  if (!WT.admin('trx', 'Daftar Transaksi')) return;
  var $ = function (i) { return document.getElementById(i); }, md = new bootstrap.Modal($('md')), buka = null;
  var LB = { diproses: 'Proses', siap: 'Siap Diambil', selesai: 'Selesaikan (Lunas)' };
  var q0 = new URLSearchParams(location.search).get('no'); if (q0) $('fno').value = q0;
  function daftar() {
    var q = $('fno').value.trim().toLowerCase(), tg = $('ftgl').value, st = $('fst').value, sm = $('fsm').value;
    return WT.trx().filter(function (t) { return (!q || (t.no + ' ' + t.nama).toLowerCase().indexOf(q) > -1) && (!tg || WT.ymd(t.tanggal) === tg) && (!st || t.status === st) && (!sm || t.sumber === sm); });
  }
  function render() {
    var l = daftar(); $('jml').textContent = l.length + ' transaksi';
    $('tb').innerHTML = l.length ? l.map(function (t) {
      return '<tr><td class="fw-semibold">' + t.no + '</td><td>' + WT.tgl(t.tanggal) + '</td><td>' + WT.esc(t.nama) + '</td><td>' + (t.sumber === 'online' ? 'Online' : 'Kasir') + '</td><td>' + WT.rupiah(t.total) + '</td><td><span class="st st-' + t.status + '">' + WT.STATUS[t.status] + '</span>' + (t.metode === 'qris' && !t.lunas && t.status !== 'batal' ? '<div class="small muted">QRIS belum dibayar</div>' : '') + '</td><td class="text-end"><button class="btn btn-sm btn-ghost" data-d="' + t.no + '">Detail</button></td></tr>';
    }).join('') : '<tr><td colspan="7" class="text-center muted py-4">Transaksi tidak ditemukan.</td></tr>';
  }
  function detail(no) {
    var t = WT.trx().find(function (x) { return x.no === no; }); if (!t) return; buka = no; var next = WT.ALUR[t.status] || [];
    $('mdIsi').innerHTML = '<div class="d-flex justify-content-between align-items-start"><div><h2 class="h5 mb-0">' + t.no + '</h2><div class="small muted">' + WT.tgl(t.tanggal) + ' &bull; ' + WT.esc(t.nama) + ' &bull; ' + (t.sumber === 'online' ? 'Online' : 'Kasir') + '</div></div><span class="st st-' + t.status + '">' + WT.STATUS[t.status] + '</span></div>' +
      (t.meja ? '<div class="small mt-2">Meja/lokasi: ' + WT.esc(t.meja) + '</div>' : '') + (t.catatan ? '<div class="small">Catatan: ' + WT.esc(t.catatan) + '</div>' : '') + '<div class="mt-3">' +
      t.items.map(function (i) { return '<div class="d-flex justify-content-between small py-1"><span>' + i.qty + '&times; ' + WT.esc(i.nama) + ' <span class="muted">(' + WT.rupiah(i.harga) + ')</span></span><b>' + WT.rupiah(i.qty * i.harga) + '</b></div>'; }).join('') + '</div>' +
      '<div class="d-flex justify-content-between fw-bold fs-5 border-top pt-2 mt-2" style="border-color:var(--line)!important"><span>Total</span><span>' + WT.rupiah(t.total) + '</span></div><div class="small muted">Pembayaran: ' + (t.metode === 'qris' ? 'QRIS' : 'Tunai') + ' &bull; ' + (t.lunas ? 'Lunas' : 'Belum dibayar') + '</div>' +
      (t.alasan ? '<div class="alert alert-danger py-2 small mt-2 mb-0">Dibatalkan: ' + WT.esc(t.alasan) + '</div>' : '') +
      '<div class="d-flex flex-wrap gap-2 mt-3">' + (t.metode === 'qris' && !t.lunas && t.status !== 'batal' ? '<button class="btn btn-wt btn-sm" data-lunas="1">Tandai Lunas (QRIS)</button>' : '') + next.filter(function (s) { return s !== 'batal'; }).map(function (s) { return '<button class="btn btn-wt btn-sm" data-s="' + s + '">' + LB[s] + '</button>'; }).join('') +
      (next.indexOf('batal') > -1 ? '<button class="btn btn-ghost btn-sm text-danger" data-batal="1">Batalkan</button>' : '') + '<button class="btn btn-ghost btn-sm" data-cetak="1"><i class="bi bi-printer"></i> Struk</button></div><div id="alasanBox" class="mt-3"></div>';
    md.show();
  }
  $('tb').addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (b) detail(b.dataset.d); });
  $('mdIsi').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var t = WT.trx().find(function (x) { return x.no === buka; });
    try {
      if (b.dataset.lunas) { WT.tandaiLunas(buka); WT.toast('Pembayaran ditandai lunas'); detail(buka); render(); }
      else if (b.dataset.s) { WT.ubahStatus(buka, b.dataset.s); WT.toast('Status diperbarui'); detail(buka); render(); }
      else if (b.dataset.batal) { $('alasanBox').innerHTML = '<input id="alasan" class="form-control mb-2" maxlength="120" placeholder="Alasan pembatalan (wajib)"><button class="btn btn-wt btn-sm" data-ya="1">Konfirmasi pembatalan</button>'; $('alasan').focus(); }
      else if (b.dataset.ya) { WT.ubahStatus(buka, 'batal', $('alasan').value); WT.toast('Transaksi dibatalkan, stok dikembalikan'); detail(buka); render(); }
      else if (b.dataset.cetak && t) WT.cetak(t);
    } catch (er) { WT.toast(er.message, 'err'); }
  });
  ['fno', 'ftgl', 'fst', 'fsm'].forEach(function (i) { $(i).addEventListener(i === 'fno' ? 'input' : 'change', render); });
  render(); WT.pantau(render);
})();
