/* Halaman login & daftar WarTech (akun disimpan di browser - versi demo) */
(function () {
  var $ = function (i) { return document.getElementById(i); }, reg = false, busy = false;
  WT.deco();
  function pesan(t) { var m = $('msg'); m.textContent = t || ''; m.classList.toggle('d-none', !t); }
  function mode(r) {
    reg = r;
    $('gNama').classList.toggle('d-none', !r); $('lupa').classList.toggle('d-none', r); $('demo').classList.toggle('d-none', r);
    $('judul').textContent = r ? 'Buat Akun WarTech' : 'Selamat Datang Kembali!';
    $('sub').textContent = r ? 'Daftar untuk menyimpan riwayat pesananmu.' : 'Login untuk melanjutkan ke akun kamu.';
    $('lUser').textContent = r ? 'Email' : 'Email / Username';
    $('user').placeholder = r ? 'Masukkan email' : 'Masukkan email atau username';
    $('tanya').textContent = r ? 'Sudah punya akun?' : 'Belum punya akun?';
    $('swap').textContent = r ? 'Login di sini' : 'Daftar di sini';
    tombol('idle'); pesan('');
  }
  function tombol(s) {
    var b = $('btn'), t = { idle: ['bi-arrow-right', reg ? 'Daftar' : 'Login'], loading: ['spinner', 'Memproses...'], ok: ['bi-check-lg', reg ? 'Akun dibuat' : 'Login berhasil'] }[s];
    b.disabled = s !== 'idle';
    b.innerHTML = (t[0] === 'spinner' ? '<span class="spinner-border spinner-border-sm me-2"></span>' : '<i class="bi ' + t[0] + ' me-2"></i>') + '<span>' + t[1] + '</span>';
  }
  if (location.search.indexOf('mode=daftar') > -1) mode(true);
  $('swap').onclick = function (e) { e.preventDefault(); mode(!reg); };
  $('lupaA').onclick = function (e) { e.preventDefault(); pesan('Reset password belum tersedia. Untuk sementara, hubungi admin kantin.'); };
  $('google').onclick = function () { pesan('Login Google belum tersedia pada versi ini. Gunakan email/username.'); };
  $('eye').onclick = function () {
    var p = $('pass'), h = p.type === 'password'; p.type = h ? 'text' : 'password';
    this.innerHTML = '<i class="bi bi-eye' + (h ? '' : '-slash') + '"></i>';
  };
  $('f').addEventListener('submit', function (e) {
    e.preventDefault(); if (busy) return; pesan('');
    var u = $('user').value.trim(), p = $('pass').value;
    if (!u || !p) return pesan('Isi email/username dan password.');
    if (reg && u.indexOf('@') < 1) return pesan('Email harus mengandung @.');
    if (reg && p.length < 6) return pesan('Password minimal 6 karakter.');
    busy = true; tombol('loading');
    setTimeout(function () {
      try {
        var usr = reg ? WT.daftar($('nama').value, u, p) : WT.login(u, p);
        tombol('ok');
        var next = new URLSearchParams(location.search).get('next') || '';
        setTimeout(function () { location.href = usr.role === 'admin' ? (/^admin\/[\w-]+\.html$/.test(next) ? next : 'admin/index.html') : 'index.html'; }, 700);
      } catch (er) { busy = false; tombol('idle'); pesan(er.message); }
    }, 500);
  });

  /* ---- efek hero: count-up, laptop menyesuaikan lebar + miring, parallax mouse ---- */
  document.querySelectorAll('[data-cnt]').forEach(function (el) {
    var to = +el.dataset.cnt, t0 = null;
    function f(t) { if (!t0) t0 = t; var k = Math.min((t - t0) / 1800, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('id-ID'); if (k < 1) requestAnimationFrame(f); }
    setTimeout(function () { requestAnimationFrame(f); }, 1000);
  });
  var lw = $('lw'), lp = $('lp'), tilt = $('tilt');
  tilt.style.height = '100%'; tilt.style.transition = 'transform .15s';
  function fit() { var s = Math.min(1, lw.clientWidth / 600); lp.style.transform = 'scale(' + s + ')'; lw.style.height = Math.round(368 * s) + 'px'; }
  fit(); addEventListener('resize', fit);
  lw.addEventListener('mousemove', function (e) {
    var r = lw.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    tilt.style.transform = 'rotateX(' + (-y * 12) + 'deg) rotateY(' + (x * 14) + 'deg)';
  });
  lw.addEventListener('mouseleave', function () { tilt.style.transform = ''; });
  var fcs = document.querySelectorAll('[data-px]'), b1 = document.querySelector('.b1');
  addEventListener('mousemove', function (e) {
    var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    fcs.forEach(function (el) { var d = +el.dataset.px; el.style.translate = (-x * d) + 'px ' + (-y * d) + 'px'; });
    if (b1) b1.style.translate = (-x * 14) + 'px ' + (-y * 10) + 'px';
  }, { passive: true });
})();
