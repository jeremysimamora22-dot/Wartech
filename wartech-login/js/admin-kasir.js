/* FR-03 transaksi beberapa item, FR-04 stok berkurang saat disimpan, FR-06 validasi qty > 0 dan <= stok */
(function () {
  if (!WT.admin('kasir', 'Kasir / Transaksi Baru')) return;
  var $ = function (i) { return document.getElementById(i); }, K = [], last = null, ms = new bootstrap.Modal($('ms'));
  var prod = function (id) { return WT.produk().find(function (p) { return p.id === id; }); };
  var valid = function (i) { var p = prod(i.id); return Number.isInteger(+i.qty) && +i.qty > 0 && p && +i.qty <= p.stok; };
  function daftar() {
    var l = WT.cariProduk($('q').value, '', true);
    $('pil').innerHTML = l.length ? l.map(function (p) {
      return '<button type="button" class="wt-card p-2 d-flex gap-2 align-items-center text-start w-100 mb-2" style="color:var(--ink)" data-p="' + p.id + '"' + (p.stok <= 0 ? ' disabled' : '') + '><img class="thumb" src="' + WT.gambar(p) + '" alt=""><span class="flex-grow-1"><b class="d-block small">' + WT.esc(p.nama) + '</b><span class="small muted">' + WT.esc(p.kode) + ' &bull; stok ' + p.stok + '</span></span><b class="price small">' + WT.rupiah(p.harga) + '</b></button>';
    }).join('') : '<p class="muted small">Produk tidak ditemukan.</p>';
  }
  function total() { return K.reduce(function (s, i) { var p = prod(i.id); return s + (p ? p.harga * (+i.qty || 0) : 0); }, 0); }
  function hitung() { var t = total(), b = Number($('bayar').value) || 0; $('tot').textContent = WT.rupiah(t); $('kem').textContent = WT.rupiah(Math.max(b - t, 0)); }
  function tabel() {
    $('tb').innerHTML = K.length ? K.map(function (i) {
      var p = prod(i.id);
      return '<tr><td class="fw-semibold">' + WT.esc(p.nama) + '<div class="small muted">stok ' + p.stok + '</div></td><td>' + WT.rupiah(p.harga) + '</td><td><input type="number" class="form-control form-control-sm' + (valid(i) ? '' : ' is-invalid') + '" min="1" max="' + p.stok + '" value="' + i.qty + '" data-q="' + i.id + '"></td><td>' + WT.rupiah(p.harga * (+i.qty || 0)) + '</td><td><button class="btn btn-sm text-danger" data-x="' + i.id + '" aria-label="Hapus"><i class="bi bi-x-lg"></i></button></td></tr>';
    }).join('') : '<tr><td colspan="5" class="text-center muted py-4">Klik produk di sebelah kiri untuk menambah item.</td></tr>';
    hitung();
  }
  $('q').addEventListener('input', daftar); $('bayar').addEventListener('input', hitung);
  $('pil').addEventListener('click', function (e) {
    var b = e.target.closest('[data-p]'); if (!b) return; var p = prod(b.dataset.p), it = K.find(function (x) { return x.id === p.id; }); $('er').textContent = '';
    if (it) { if (+it.qty + 1 > p.stok) { $('er').textContent = 'Stok ' + p.nama + ' hanya ' + p.stok + '.'; return; } it.qty = +it.qty + 1; } else K.push({ id: p.id, qty: 1 });
    tabel();
  });
  $('tb').addEventListener('change', function (e) {
    var q = e.target.dataset.q; if (!q) return; var it = K.find(function (x) { return x.id === q; }); it.qty = e.target.value; $('er').textContent = '';
    if (!valid(it)) $('er').textContent = 'Jumlah harus lebih dari 0 dan tidak melebihi stok (' + prod(q).stok + ').';
    tabel();
  });
  $('tb').addEventListener('click', function (e) { var b = e.target.closest('[data-x]'); if (b) { K = K.filter(function (x) { return x.id !== b.dataset.x; }); tabel(); } });
  $('simpan').onclick = function () {
    $('er').textContent = '';
    try {
      if (!K.length) throw new Error('Tambahkan minimal satu item.');
      if (K.some(function (i) { return !valid(i); })) throw new Error('Perbaiki jumlah item (harus lebih dari 0 dan tidak melebihi stok).');
      var t = total(), b = Number($('bayar').value);
      if (!(b >= t)) throw new Error('Uang yang diterima kurang dari total.');
      last = WT.buatTransaksi({ nama: $('nama').value.trim() || 'Umum', sumber: 'kasir', status: 'selesai', bayar: b, items: K.map(function (i) { return { id: i.id, qty: +i.qty }; }) });
      $('strukIsi').innerHTML = WT.struk(last); ms.show();
      K = []; $('nama').value = ''; $('bayar').value = ''; daftar(); tabel();
    } catch (er) { $('er').textContent = er.message; }
  };
  $('cetak').onclick = function () { if (last) WT.cetak(last); };
  daftar(); tabel();
})();
