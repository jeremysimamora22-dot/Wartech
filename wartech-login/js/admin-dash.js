(function () {
  if (!WT.admin('dash', 'Dashboard')) return;
  var $ = function (i) { return document.getElementById(i); }, ch = null;
  function render() {
    var T = WT.trx(), P = WT.produk(), hari = WT.ymd(new Date());
    var sel = T.filter(function (t) { return t.status === 'selesai'; }), today = sel.filter(function (t) { return WT.ymd(t.tanggal) === hari; });
    var n = function (s) { return T.filter(function (t) { return s.indexOf(t.status) > -1; }).length; };
    var aktif = P.filter(function (p) { return p.aktif; }), low = aktif.filter(function (p) { return p.stok <= 5; }).length;
    var K = [['Omzet hari ini', WT.rupiah(today.reduce(function (s, t) { return s + t.total; }, 0)), 'bi-cash-stack', 'Transaksi berstatus Selesai'], ['Transaksi selesai hari ini', today.length, 'bi-receipt', ''],
      ['Pesanan menunggu', n(['menunggu']), 'bi-hourglass-split', 'Perlu diproses'], ['Diproses / siap diambil', n(['diproses', 'siap']), 'bi-fire', ''],
      ['Stok menipis', low, 'bi-exclamation-triangle', 'Stok 5 atau kurang'], ['Produk aktif', aktif.length, 'bi-box-seam', 'dari ' + P.length + ' produk']];
    $('stats').innerHTML = K.map(function (k) { return '<div class="col-6 col-xl-4"><div class="wt-card stat"><div class="d-flex justify-content-between"><span class="muted small">' + k[0] + '</span><i class="bi ' + k[2] + '" style="color:var(--brand)"></i></div><div class="n">' + k[1] + '</div><div class="small muted">' + k[3] + '</div></div></div>'; }).join('');
    $('baru').innerHTML = T.length ? T.slice(0, 6).map(function (t) { return '<a class="d-flex justify-content-between align-items-center py-2 text-decoration-none border-bottom" style="color:var(--ink);border-color:var(--line)!important" href="transaksi.html?no=' + t.no + '"><span><b class="small">' + t.no + '</b><br><span class="small muted">' + WT.esc(t.nama) + '</span></span><span class="text-end"><b class="small">' + WT.rupiah(t.total) + '</b><br><span class="st st-' + t.status + '">' + WT.STATUS[t.status] + '</span></span></a>'; }).join('') : '<p class="muted small">Belum ada transaksi.</p>';
    var lab = [], dat = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i); var k = WT.ymd(d);
      lab.push(WT.pad(d.getDate()) + '/' + WT.pad(d.getMonth() + 1));
      dat.push(sel.filter(function (t) { return WT.ymd(t.tanggal) === k; }).reduce(function (s, t) { return s + t.total; }, 0));
    }
    if (typeof Chart === 'undefined') return;
    if (ch) ch.destroy();
    ch = new Chart($('ch'), { type: 'bar', data: { labels: lab, datasets: [{ label: 'Omzet (Rp)', data: dat, backgroundColor: '#3B82F6', borderRadius: 8 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
  }
  render(); WT.pantau(render);
})();
