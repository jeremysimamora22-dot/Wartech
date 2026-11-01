/* FR-07: rekap penjualan harian/bulanan + produk terjual (hanya transaksi berstatus Selesai) */
(function () {
  if (!WT.admin('laporan', 'Laporan Penjualan')) return;
  var $ = function (i) { return document.getElementById(i); }, ch = null, now = new Date();
  var BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  $('dari').value = WT.ymd(new Date(now.getFullYear(), now.getMonth(), 1)); $('sampai').value = WT.ymd(now); $('tahun').value = now.getFullYear();
  function render() {
    var bulanan = $('jenis').value === 'bulanan', T = WT.trx().filter(function (t) { return t.status === 'selesai'; }), rows = {}, list;
    ['gDari', 'gSampai'].forEach(function (g) { $(g).classList.toggle('d-none', bulanan); }); $('gTahun').classList.toggle('d-none', !bulanan);
    if (bulanan) {
      var y = +$('tahun').value || now.getFullYear();
      list = T.filter(function (t) { return new Date(t.tanggal).getFullYear() === y; });
      for (var m = 0; m < 12; m++) rows[y + '-' + WT.pad(m + 1)] = { l: BLN[m] + ' ' + y, trx: 0, item: 0, omzet: 0 };
    } else {
      var d = $('dari').value, s = $('sampai').value;
      list = T.filter(function (t) { var k = WT.ymd(t.tanggal); return (!d || k >= d) && (!s || k <= s); });
    }
    var prod = {};
    list.forEach(function (t) {
      var k = bulanan ? WT.ymd(t.tanggal).slice(0, 7) : WT.ymd(t.tanggal), p = k.split('-');
      var r = rows[k] || (rows[k] = { l: p[2] + '/' + p[1] + '/' + p[0], trx: 0, item: 0, omzet: 0 });
      r.trx++; r.omzet += t.total;
      t.items.forEach(function (i) { r.item += i.qty; var x = prod[i.id] || (prod[i.id] = { kode: i.kode, nama: i.nama, qty: 0, omzet: 0 }); x.qty += i.qty; x.omzet += i.qty * i.harga; });
    });
    var keys = Object.keys(rows).sort(), R = keys.map(function (k) { return rows[k]; });
    var tot = R.reduce(function (a, r) { return { trx: a.trx + r.trx, item: a.item + r.item, omzet: a.omzet + r.omzet }; }, { trx: 0, item: 0, omzet: 0 });
    $('ring').innerHTML = [['Jumlah transaksi', tot.trx], ['Item terjual', tot.item], ['Total omzet', WT.rupiah(tot.omzet)]].map(function (x) { return '<div class="col-sm-4"><div class="wt-card stat"><div class="muted small">' + x[0] + '</div><div class="n">' + x[1] + '</div></div></div>'; }).join('');
    $('jr').textContent = bulanan ? 'Rekap bulanan' : 'Rekap harian';
    $('th').innerHTML = '<tr><th>' + (bulanan ? 'Bulan' : 'Tanggal') + '</th><th class="text-end">Transaksi</th><th class="text-end">Item terjual</th><th class="text-end">Omzet</th></tr>';
    $('tb').innerHTML = R.length ? R.map(function (r) { return '<tr><td>' + r.l + '</td><td class="text-end">' + r.trx + '</td><td class="text-end">' + r.item + '</td><td class="text-end">' + WT.rupiah(r.omzet) + '</td></tr>'; }).join('') : '<tr><td colspan="4" class="text-center muted py-4">Belum ada data penjualan pada periode ini.</td></tr>';
    var P = Object.keys(prod).map(function (k) { return prod[k]; }).sort(function (a, b) { return b.qty - a.qty; });
    $('tp').innerHTML = P.length ? P.map(function (p) { return '<tr><td>' + WT.esc(p.kode) + '</td><td>' + WT.esc(p.nama) + '</td><td class="text-end">' + p.qty + '</td><td class="text-end">' + WT.rupiah(p.omzet) + '</td></tr>'; }).join('') : '<tr><td colspan="4" class="text-center muted py-4">Belum ada produk terjual.</td></tr>';
    if (typeof Chart === 'undefined') return;
    if (ch) ch.destroy();
    ch = new Chart($('ch'), { type: 'bar', data: { labels: R.map(function (r) { return r.l; }), datasets: [{ label: 'Omzet (Rp)', data: R.map(function (r) { return r.omzet; }), backgroundColor: '#3B82F6', borderRadius: 8 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
  }
  ['jenis', 'dari', 'sampai', 'tahun'].forEach(function (i) { $(i).addEventListener('change', render); });
  $('cetak').onclick = function () { window.print(); };
  render(); WT.pantau(render);
})();
