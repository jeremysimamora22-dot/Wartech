(function () {
  WT.nav('home');
  document.getElementById('kats').innerHTML = WT.kategori().map(function (k) { return '<a class="chip" href="menu.html?kat=' + k.id + '">' + WT.esc(k.nama) + '</a>'; }).join('');
  var u = WT.cariProduk('', '', true).filter(function (p) { return p.unggulan; }).slice(0, 4), g = document.getElementById('unggul');
  g.innerHTML = u.length ? u.map(WT.kartu).join('') : '<div class="col-12 empty muted">Belum ada menu pilihan.</div>';
  WT.pasangProduk(g); WT.reveal();
  if (location.hash) setTimeout(function () { var e = document.querySelector(location.hash); if (e) e.scrollIntoView({ behavior: 'smooth' }); }, 150);
})();
