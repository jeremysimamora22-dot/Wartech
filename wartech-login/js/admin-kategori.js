/* FR-01: CRUD kategori produk */
(function () {
  if (!WT.admin('kategori', 'Kategori Produk')) return;
  var $ = function (i) { return document.getElementById(i); }, m = new bootstrap.Modal($('m')), edit = null;
  function render() {
    var q = $('cari').value.trim().toLowerCase(), P = WT.produk();
    var rows = WT.kategori().filter(function (k) { return k.nama.toLowerCase().indexOf(q) > -1; });
    $('tb').innerHTML = rows.length ? rows.map(function (k, i) {
      var n = P.filter(function (p) { return p.kategoriId === k.id; }).length;
      return '<tr><td>' + (i + 1) + '</td><td class="fw-semibold">' + WT.esc(k.nama) + '</td><td>' + n + '</td><td class="text-end text-nowrap"><button class="btn btn-sm btn-ghost" data-e="' + k.id + '" aria-label="Edit"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-ghost text-danger" data-h="' + k.id + '" aria-label="Hapus"><i class="bi bi-trash"></i></button></td></tr>';
    }).join('') : '<tr><td colspan="4" class="text-center muted py-4">Belum ada kategori.</td></tr>';
  }
  function buka(id) {
    edit = id; var k = id ? WT.kategori().find(function (x) { return x.id === id; }) : null;
    $('mj').textContent = id ? 'Edit Kategori' : 'Tambah Kategori'; $('nm').value = k ? k.nama : ''; $('er').textContent = ''; m.show();
    setTimeout(function () { $('nm').focus(); }, 300);
  }
  $('tambah').onclick = function () { buka(null); };
  $('cari').addEventListener('input', render);
  $('fm').addEventListener('submit', function (e) {
    e.preventDefault(); var nama = $('nm').value.trim(), all = WT.kategori();
    if (!nama) { $('er').textContent = 'Nama kategori wajib diisi.'; return; }
    if (all.some(function (k) { return k.id !== edit && k.nama.toLowerCase() === nama.toLowerCase(); })) { $('er').textContent = 'Nama kategori sudah ada.'; return; }
    if (edit) all.find(function (k) { return k.id === edit; }).nama = nama; else all.push({ id: WT.uid('k'), nama: nama });
    WT.set(WT.K.kat, all); m.hide(); WT.toast('Kategori disimpan'); render();
  });
  $('tb').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.e) return buka(b.dataset.e);
    if (b.dataset.h) {
      var pakai = WT.produk().filter(function (p) { return p.kategoriId === b.dataset.h; }).length;
      if (pakai) return WT.toast('Kategori masih dipakai ' + pakai + ' produk. Pindahkan atau hapus produknya dulu.', 'err');
      if (!confirm('Hapus kategori ini?')) return;
      WT.set(WT.K.kat, WT.kategori().filter(function (k) { return k.id !== b.dataset.h; })); WT.toast('Kategori dihapus'); render();
    }
  });
  render();
})();
