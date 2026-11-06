/* WarTech - data & aturan bisnis. Semua data disimpan di localStorage browser (tanpa server). */
var WT = (function () {
  var K = { kat: 'wt_kategori', prd: 'wt_produk', trx: 'wt_transaksi', usr: 'wt_users', ses: 'wt_session', cart: 'wt_cart', mine: 'wt_mine', tema: 'wt_tema' };
  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? d : v; } catch (e) { return d; } }
  function set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function pad(n) { return String(n).padStart(2, '0'); }

  /* ---- data awal (hanya saat pertama kali dibuka) ---- */
  if (!localStorage.getItem(K.kat)) {
    set(K.kat, [{ id: 'k1', nama: 'Makanan Berat' }, { id: 'k2', nama: 'Mi' }, { id: 'k3', nama: 'Camilan' }, { id: 'k4', nama: 'Minuman' }]);
    var P = function (id, kode, nama, kat, harga, stok, gbr, desk, unggul) {
      return { id: id, kode: kode, nama: nama, kategoriId: kat, harga: harga, stok: stok, gambar: 'img/' + gbr + '.jfif', deskripsi: desk, aktif: true, unggulan: !!unggul };
    };
    set(K.prd, [
      P('p1', 'MB-001', 'Nasi Goreng', 'k1', 15000, 20, 'nasi-goreng', 'Nasi goreng dengan telur dan acar.', 1),
      P('p2', 'MB-002', 'Ayam Geprek', 'k1', 17000, 15, 'ayam-geprek', 'Ayam krispi dengan sambal geprek.', 0),
      P('p3', 'MB-003', 'Soto Ayam', 'k1', 16000, 12, 'soto-ayam', 'Soto ayam kuah kuning hangat.', 0),
      P('p4', 'MB-004', 'Bakso', 'k1', 15000, 15, 'bakso', 'Bakso sapi dengan kuah gurih.', 1),
      P('p5', 'MI-001', 'Mie Goreng', 'k2', 14000, 20, 'mie-goreng', 'Mie goreng bumbu spesial.', 0),
      P('p6', 'MI-002', 'Mie Ayam', 'k2', 13000, 15, 'mie-ayam', 'Mie ayam dengan topping ayam kecap.', 0),
      P('p7', 'CM-001', 'Pisang Goreng', 'k3', 8000, 25, 'pisang-goreng', 'Pisang goreng renyah.', 0),
      P('p8', 'CM-002', 'Roti Bakar', 'k3', 10000, 15, 'roti-bakar', 'Roti bakar cokelat keju.', 0),
      P('p9', 'MN-001', 'Es Teh', 'k4', 5000, 40, 'es-teh', 'Teh manis dingin.', 1),
      P('p10', 'MN-002', 'Kopi Susu', 'k4', 10000, 30, 'kopi-susu', 'Kopi susu dingin.', 1),
      P('p11', 'MN-003', 'Jus Jeruk', 'k4', 8000, 20, 'jus-jeruk', 'Jus jeruk segar.', 0),
      P('p12', 'MN-004', 'Air Mineral', 'k4', 4000, 50, 'air-mineral', 'Air mineral botol.', 0)
    ]);
  }
  if (!localStorage.getItem(K.usr)) set(K.usr, [{ id: 'u1', nama: 'Admin WarTech', email: 'admin@wartech.com', username: 'admin', password: 'admin123', role: 'admin' }]);
  if (localStorage.getItem(K.trx) === null) set(K.trx, []);

  var api = {
    K: K, get: get, set: set, pad: pad,
    base: document.body.getAttribute('data-base') || '',
    STATUS: { menunggu: 'Menunggu', diproses: 'Diproses', siap: 'Siap Diambil', selesai: 'Selesai', batal: 'Dibatalkan' },
    rupiah: function (n) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); },
    tgl: function (iso) { return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }); },
    ymd: function (d) { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); },
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    uid: function (p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); },
    kategori: function () { return get(K.kat, []); },
    produk: function () { return get(K.prd, []); },
    trx: function () { return get(K.trx, []); },
    namaKategori: function (id) { var k = api.kategori().find(function (x) { return x.id === id; }); return k ? k.nama : '-'; },
    gambar: function (p) { var g = p && p.gambar; if (!g) return api.base + 'img/placeholder.svg'; return /^(data:|https?:)/.test(g) ? g : api.base + g; },

    /* ---- FR-05: pencarian produk berdasarkan kode / nama / kategori ---- */
    cariProduk: function (q, katId, hanyaAktif) {
      q = String(q || '').trim().toLowerCase();
      return api.produk().filter(function (p) {
        if (hanyaAktif && !p.aktif) return false;
        if (katId && p.kategoriId !== katId) return false;
        return !q || (p.kode + ' ' + p.nama + ' ' + api.namaKategori(p.kategoriId)).toLowerCase().indexOf(q) > -1;
      });
    },

    /* ---- keranjang pelanggan ---- */
    cart: function () { return get(K.cart, []); },
    saveCart: function (c) { set(K.cart, c); if (api.badge) api.badge(); },
    tambahKeranjang: function (id, qty, catatan) {
      var p = api.produk().find(function (x) { return x.id === id; });
      qty = Number(qty);
      if (!p || !p.aktif) throw new Error('Menu tidak tersedia.');
      if (!Number.isInteger(qty) || qty <= 0) throw new Error('Jumlah harus lebih dari 0.');      // FR-06
      var c = api.cart(), it = c.find(function (x) { return x.id === id; }), ada = it ? it.qty : 0;
      if (ada + qty > p.stok) throw new Error('Stok ' + p.nama + ' hanya tersisa ' + p.stok + '.');  // FR-06
      if (it) { it.qty += qty; if (catatan) it.catatan = catatan; } else c.push({ id: id, qty: qty, catatan: catatan || '' });
      api.saveCart(c);
    },

    /* ---- FR-03 / FR-04 / FR-06: buat transaksi, validasi qty, kurangi stok ---- */
    noTrx: function () {
      var d = new Date(), pre = 'TRX-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-';
      var n = api.trx().filter(function (t) { return t.no.indexOf(pre) === 0; }).length + 1;
      return pre + String(n).padStart(3, '0');
    },
    buatTransaksi: function (o) {
      if (!o.items || !o.items.length) throw new Error('Pilih minimal satu item.');
      var prd = api.produk(), gabung = {}, items = [], total = 0;
      o.items.forEach(function (it) { var g = gabung[it.id] || (gabung[it.id] = { qty: 0, catatan: it.catatan || '' }); g.qty += Number(it.qty); });
      Object.keys(gabung).forEach(function (id) {
        var p = prd.find(function (x) { return x.id === id; }), q = gabung[id].qty;
        if (!p || !p.aktif) throw new Error('Ada menu yang sudah tidak tersedia.');
        if (!Number.isInteger(q) || q <= 0) throw new Error('Jumlah ' + p.nama + ' harus lebih dari 0.');          // FR-06
        if (q > p.stok) throw new Error('Stok ' + p.nama + ' tidak cukup (tersisa ' + p.stok + ').');              // FR-06
        items.push({ id: p.id, kode: p.kode, nama: p.nama, harga: p.harga, qty: q, catatan: gabung[id].catatan });  // snapshot harga
        total += p.harga * q;
      });
      items.forEach(function (it) { prd.find(function (x) { return x.id === it.id; }).stok -= it.qty; });         // FR-04
      set(K.prd, prd);
      var u = api.user(), selesai = o.status === 'selesai';
      var t = { no: api.noTrx(), tanggal: new Date().toISOString(), nama: o.nama || 'Umum', telp: o.telp || '', meja: o.meja || '', catatan: o.catatan || '',
        sumber: o.sumber || 'kasir', metode: 'qris' ? 'qris' : 'tunai', status: o.status || 'selesai', lunas: selesai, total: total, items: items, stokKembali: false, userId: u ? u.id : null, alasan: '', bayar: Number(o.bayar) || 0 };
      var all = api.trx(); all.unshift(t); set(K.trx, all);
      return t;
    },
    ALUR: { menunggu: ['diproses', 'batal'], diproses: ['siap', 'batal'], siap: ['selesai', 'batal'] },
    ubahStatus: function (no, status, alasan) {
      var all = api.trx(), t = all.find(function (x) { return x.no === no; });
      if (!t) throw new Error('Transaksi tidak ditemukan.');
      if ((api.ALUR[t.status] || []).indexOf(status) < 0) throw new Error('Perubahan status tidak valid.');
      if (status === 'batal') {
        if (!String(alasan || '').trim()) throw new Error('Alasan pembatalan wajib diisi.');
        if (!t.stokKembali) {                                   // stok dikembalikan satu kali saja
          var prd = api.produk();
          t.items.forEach(function (it) { var p = prd.find(function (x) { return x.id === it.id; }); if (p) p.stok += it.qty; });
          set(K.prd, prd); t.stokKembali = true;
        }
        t.alasan = String(alasan).trim();
      }
      if (status === 'selesai') t.lunas = true;
      t.status = status; set(K.trx, all);
      return t;
    },
      QRIS_IMG: 'img/qris.png',
  tandaiLunas: function (no) {
    var all = api.trx(), t = all.find(function (x) { return x.no === no; });
    if (!t) throw new Error('Transaksi tidak ditemukan.');
    if (t.status === 'batal') throw new Error('Transaksi sudah dibatalkan.');
    t.lunas = true; set(K.trx, all); return t;
  },
  ingatPesanan: function (no) { var m = get(K.mine, []); m.unshift(no); set(K.mine, m.slice(0, 30)); },

    /* ---- akun (demo, tersimpan di browser) ---- */
    user: function () { var id = get(K.ses, null); return id ? (get(K.usr, []).find(function (u) { return u.id === id; }) || null) : null; },
    login: function (idf, pw) {
      idf = String(idf).trim().toLowerCase();
      var u = get(K.usr, []).find(function (x) { return (x.email.toLowerCase() === idf || (x.username || '').toLowerCase() === idf) && x.password === pw; });
      if (!u) throw new Error('Email/username atau password salah.');
      set(K.ses, u.id); return u;
    },
    daftar: function (nama, email, pw) {
      var all = get(K.usr, []); email = String(email).trim().toLowerCase();
      if (String(nama).trim().length < 2) throw new Error('Nama minimal 2 karakter.');
      if (email.indexOf('@') < 1) throw new Error('Email harus mengandung @.');
      if (String(pw).length < 6) throw new Error('Password minimal 6 karakter.');
      if (all.some(function (u) { return u.email.toLowerCase() === email; })) throw new Error('Email sudah terdaftar.');
      var u = { id: api.uid('u'), nama: String(nama).trim(), email: email, username: email, password: pw, role: 'pelanggan' };
      all.push(u); set(K.usr, all); set(K.ses, u.id); return u;
    },
    logout: function () { localStorage.removeItem(K.ses); },
    guard: function () {
      var u = api.user();
      if (!u || u.role !== 'admin') { location.replace(api.base + 'login.html?next=admin/' + location.pathname.split('/').pop()); return false; }
      return true;
    }
  };
  return api;
})();
