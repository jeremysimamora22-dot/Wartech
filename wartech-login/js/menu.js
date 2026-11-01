/* Menu: cari (kode/nama/kategori), filter kategori, urutkan, tampilkan bertahap */
(function () {
  WT.nav('menu');
  var $ = function (i) { return document.getElementById(i); }, P = new URLSearchParams(location.search);
  var st = { q: P.get('q') || '', kat: P.get('kat') || '', urut: P.get('urut') || 'nama', lim: 12 };
  var urut = {
    nama: function (a, b) { return a.nama.localeCompare(b.nama); }, murah: function (a, b) { return a.harga - b.harga; },
    mahal: function (a, b) { return b.harga - a.harga; }, pilihan: function (a, b) { return Number(b.unggulan) - Number(a.unggulan); }
  };
  $('q').value = st.q; $('urut').value = urut[st.urut] ? st.urut : 'nama';
  if (location.hash === '#cari') $('q').focus();
  function kats() {
    $('kats').innerHTML = ['<button class="chip' + (st.kat ? '' : ' on') + '" data-k="">Semua</button>'].concat(WT.kategori().map(function (k) {
      return '<button class="chip' + (st.kat === k.id ? ' on' : '') + '" data-k="' + k.id + '">' + WT.esc(k.nama) + '</button>';
    })).join('');
  }
  function tampil() {
    var list = WT.cariProduk(st.q, st.kat, true).sort(urut[st.urut] || urut.nama);
    $('jumlah').textContent = list.length + ' menu ditemukan';
    $('grid').innerHTML = list.slice(0, st.lim).map(WT.kartu).join('');
    $('kosong').classList.toggle('d-none', list.length > 0); $('more').classList.toggle('d-none', list.length <= st.lim);
    try { history.replaceState(null, '', '?' + new URLSearchParams({ q: st.q, kat: st.kat, urut: st.urut })); } catch (e) { /* file:// */ }
    WT.reveal();
  }
  $('q').addEventListener('input', function () { st.q = this.value; st.lim = 12; tampil(); });
  $('urut').addEventListener('change', function () { st.urut = this.value; tampil(); });
  $('kats').addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (!b) return; st.kat = b.dataset.k; st.lim = 12; kats(); tampil(); });
  $('more').onclick = function () { st.lim += 12; tampil(); };
  $('reset').onclick = function () { st.q = ''; st.kat = ''; $('q').value = ''; kats(); tampil(); };
  WT.pasangProduk($('grid')); kats(); tampil();
})();
