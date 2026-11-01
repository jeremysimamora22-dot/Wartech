/* FR-02: CRUD produk (kode, nama, kategori, harga, stok) + FR-05: cari kode/nama/kategori */
(function () {
  if (!WT.admin('produk', 'Produk & Stok')) return;
  var $ = function (i) { return document.getElementById(i); }, m = new bootstrap.Modal($('m')), edit = null, gbrData = '';
  function opsi(sel, pilih, semua) {
    $(sel).innerHTML = (semua ? '<option value="">Semua kategori</option>' : '') + WT.kategori().map(function (k) { return '<option value="' + k.id + '"' + (k.id === pilih ? ' selected' : '') + '>' + WT.esc(k.nama) + '</option>'; }).join('');
  }
  opsi('fk', '', true);
  function render() {
    var l = WT.cariProduk($('q').value, $('fk').value, false);
    if ($('low').checked) l = l.filter(function (p) { return p.stok <= 5; });
    $('jml').textContent = l.length + ' produk';
    $('tb').innerHTML = l.length ? l.map(function (p) {
      var cls = p.stok <= 0 ? 'text-bg-danger' : p.stok <= 5 ? 'text-bg-warning' : 'text-bg-success';
      return '<tr><td><img class="thumb" src="' + WT.gambar(p) + '" alt=""></td><td>' + WT.esc(p.kode) + '</td><td class="fw-semibold">' + WT.esc(p.nama) + (p.aktif ? '' : ' <span class="badge text-bg-secondary">nonaktif</span>') + '</td><td>' + WT.esc(WT.namaKategori(p.kategoriId)) + '</td><td>' + WT.rupiah(p.harga) + '</td><td><span class="badge ' + cls + '">' + p.stok + '</span></td>' +
        '<td class="text-end text-nowrap"><button class="btn btn-sm btn-ghost" data-e="' + p.id + '" aria-label="Edit"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-ghost text-danger" data-h="' + p.id + '" aria-label="Hapus"><i class="bi bi-trash"></i></button></td></tr>';
    }).join('') : '<tr><td colspan="7" class="text-center muted py-4">Produk tidak ditemukan.</td></tr>';
  }
  function pv() { $('pv').src = gbrData || WT.gambar({ gambar: $('gbr').value.trim() }); }
  function buka(id) {
    edit = id; var p = id ? WT.produk().find(function (x) { return x.id === id; }) : null, dataUrl = p && /^data:/.test(p.gambar || '');
    $('mj').textContent = id ? 'Edit Produk' : 'Tambah Produk'; $('er').textContent = ''; $('file').value = ''; opsi('kat', p ? p.kategoriId : '');
    $('kode').value = p ? p.kode : ''; $('nama').value = p ? p.nama : ''; $('harga').value = p ? p.harga : ''; $('stok').value = p ? p.stok : '';
    $('desk').value = p ? p.deskripsi || '' : ''; gbrData = dataUrl ? p.gambar : ''; $('gbr').value = p && !dataUrl ? p.gambar || '' : '';
    $('aktif').checked = p ? p.aktif : true; $('unggul').checked = p ? !!p.unggulan : false; pv(); m.show();
  }
  $('tambah').onclick = function () { buka(null); };
  ['q', 'fk', 'low'].forEach(function (i) { $(i).addEventListener(i === 'q' ? 'input' : 'change', render); });
  $('gbr').addEventListener('input', function () { gbrData = ''; pv(); });
  $('file').addEventListener('change', function () {
    var f = this.files[0]; if (!f) return;
    if (f.size > 400 * 1024) { $('er').textContent = 'Ukuran gambar maksimal 400 KB (penyimpanan browser terbatas).'; this.value = ''; return; }
    var r = new FileReader(); r.onload = function () { gbrData = r.result; $('gbr').value = ''; pv(); }; r.readAsDataURL(f);
  });
  $('fm').addEventListener('submit', function (e) {
    e.preventDefault(); $('er').textContent = '';
    var kode = $('kode').value.trim(), nama = $('nama').value.trim(), harga = $('harga').value, stok = $('stok').value;
    try {
      if (!WT.kategori().length) throw new Error('Tambahkan kategori dulu di menu Kategori.');
      if (!kode) throw new Error('Kode produk wajib diisi.');
      if (!nama) throw new Error('Nama produk wajib diisi.');
      if (harga === '' || !Number.isInteger(+harga) || +harga < 0) throw new Error('Harga harus bilangan bulat 0 atau lebih.');
      if (stok === '' || !Number.isInteger(+stok) || +stok < 0) throw new Error('Stok harus bilangan bulat 0 atau lebih.');
      var all = WT.produk();
      if (all.some(function (p) { return p.id !== edit && p.kode.toLowerCase() === kode.toLowerCase(); })) throw new Error('Kode sudah dipakai produk lain.');
      var d = { kode: kode, nama: nama, kategoriId: $('kat').value, harga: +harga, stok: +stok, deskripsi: $('desk').value.trim(), gambar: gbrData || $('gbr').value.trim(), aktif: $('aktif').checked, unggulan: $('unggul').checked };
      if (edit) Object.assign(all.find(function (p) { return p.id === edit; }), d); else { d.id = WT.uid('p'); all.push(d); }
      WT.set(WT.K.prd, all); m.hide(); WT.toast('Produk disimpan'); render();
    } catch (x) { $('er').textContent = x.name === 'QuotaExceededError' ? 'Penyimpanan browser penuh. Pakai gambar yang lebih kecil.' : x.message; }
  });
  $('tb').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.e) return buka(b.dataset.e);
    if (b.dataset.h) {
      var id = b.dataset.h, dipakai = WT.trx().some(function (t) { return t.items.some(function (i) { return i.id === id; }); }), all = WT.produk();
      if (dipakai) {                                           // riwayat transaksi tidak boleh rusak
        if (!confirm('Produk ini sudah pernah dipakai di transaksi, jadi tidak dihapus tetapi dinonaktifkan. Lanjutkan?')) return;
        all.find(function (p) { return p.id === id; }).aktif = false; WT.set(WT.K.prd, all); WT.toast('Produk dinonaktifkan');
      } else { if (!confirm('Hapus produk ini?')) return; WT.set(WT.K.prd, all.filter(function (p) { return p.id !== id; })); WT.toast('Produk dihapus'); }
      render();
    }
  });
  render();
})();
