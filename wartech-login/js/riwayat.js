(function () {
  WT.nav('lacak'); var u = WT.user(), mine = WT.get(WT.K.mine, []), box = document.getElementById('isi');
  document.getElementById('cari').addEventListener('submit', function (e) {
    e.preventDefault(); var n = document.getElementById('no').value.trim().toUpperCase(); if (n) location.href = 'pesanan.html?no=' + encodeURIComponent(n);
  });
  var list = WT.trx().filter(function (t) { return mine.indexOf(t.no) > -1 || (u && t.userId === u.id); });
  box.innerHTML = list.length ? list.map(function (t) {
    return '<a href="pesanan.html?no=' + encodeURIComponent(t.no) + '" class="wt-card p-3 mb-3 d-flex justify-content-between align-items-center text-decoration-none" style="color:var(--ink)"><div><b>' + WT.esc(t.no) + '</b><div class="small muted">' + WT.tgl(t.tanggal) + '</div></div><div class="text-end"><b>' + WT.rupiah(t.total) + '</b><div><span class="st st-' + t.status + '">' + WT.STATUS[t.status] + '</span></div></div></a>';
  }).join('') : '<div class="wt-card empty"><i class="bi bi-receipt"></i><h2 class="h5">Belum ada pesanan</h2><p class="muted">Pesananmu akan muncul di sini.</p><a href="menu.html" class="btn btn-wt px-4">Lihat Menu</a></div>';
})();
