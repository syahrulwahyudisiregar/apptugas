var MODE = window.MODE || 'portal';
var PFX = MODE === 'portal' ? '' : MODE + '_';                       // penyimpanan sesi dipisah per halaman
var HALAMAN_MASUK = MODE === 'guru' ? 'guruLogin' : 'login';

/* TEMPEL ISI bank-heksadesimal.js DI SINI */
/**
 * BANK SOAL: HEKSADESIMAL
 *
 * Modul bank soal yang berdiri sendiri. Bisa dipakai di index.html (browser)
 * dan di Code.gs (Apps Script) dengan menempel isi file ini apa adanya.
 *
 * Isi: 10 soal per murid
 *   Soal 1-5  : desimal ke heksadesimal (mudah sampai sulit)
 *   Soal 6-10 : heksadesimal ke desimal (mudah sampai sulit)
 *
 * Cara menggabungkan dengan materi lain:
 *   1. Buat file bank lain dengan pola yang sama (daftarkan ke BANK_SOAL.namaModul).
 *   2. Panggil BANK_SOAL.gabung(idMurid, ['heksadesimal', 'materiLain']).
 *      Hasilnya satu daftar soal yang nomornya sudah berurutan.
 *
 * Soal diacak dari id murid (nama + kelas), jadi selalu sama untuk murid yang sama.
 * Kunci jawaban dan langkah pengerjaan dihitung otomatis oleh kode.
 */
(function (g) {
  var B = g.BANK_SOAL = g.BANK_SOAL || {};

  // ---------- Pengacak (dipakai bersama oleh semua modul) ----------
  if (!B._rng) {
    B._rng = {
      xmur3: function (str) {
        var h = 1779033703 ^ str.length;
        for (var i = 0; i < str.length; i++) {
          h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
          h = h << 13 | h >>> 19;
        }
        return function () {
          h = Math.imul(h ^ h >>> 16, 2246822507);
          h = Math.imul(h ^ h >>> 13, 3266489909);
          return (h ^= h >>> 16) >>> 0;
        };
      },
      mulberry32: function (a) {
        return function () {
          a |= 0; a = a + 0x6D2B79F5 | 0;
          var t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
    };
  }

  // ---------- Menggabungkan beberapa modul menjadi satu daftar soal ----------
  if (!B.gabung) {
    B.gabung = function (id, daftarModul) {
      var out = [];
      daftarModul.forEach(function (nama) {
        if (!B[nama] || typeof B[nama].buat !== 'function') throw new Error('Modul soal tidak ditemukan: ' + nama);
        B[nama].buat(id).forEach(function (s) { out.push(s); });
      });
      out.forEach(function (s, i) { s.nomor = i + 1; });
      return out;
    };
  }

  // ---------- Isi modul Heksadesimal ----------
  var HEX = '0123456789ABCDEF';
  function toHex(n) { return n.toString(16).toUpperCase(); }
  function rentang(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }

  // Kumpulan angka (nilai desimal) yang boleh muncul untuk tiap nomor soal.
  var POLA = [];
  POLA.push({ jenis: 'des2hex', tingkat: 'Mudah',        pool: rentang(50, 99) });
  POLA.push({ jenis: 'des2hex', tingkat: 'Mudah-sedang', pool: rentang(100, 149) });
  POLA.push({ jenis: 'des2hex', tingkat: 'Sedang',       pool: rentang(150, 189) });
  POLA.push({ jenis: 'des2hex', tingkat: 'Sulit',        pool: rentang(190, 222) });
  POLA.push({ jenis: 'des2hex', tingkat: 'Sulit',        pool: rentang(223, 255) });

  // Hex tanpa huruf: 10 sampai 99 (digit pertama 1-9, digit kedua 0-9)
  var poolTanpaHuruf = [];
  for (var d1 = 1; d1 <= 9; d1++) for (var d2 = 0; d2 <= 9; d2++) poolTanpaHuruf.push(d1 * 16 + d2);
  // Hex dengan satu huruf: 1A sampai 9F (digit pertama 1-9, digit kedua A-F)
  var poolSatuHuruf = [];
  for (var e1 = 1; e1 <= 9; e1++) for (var e2 = 10; e2 <= 15; e2++) poolSatuHuruf.push(e1 * 16 + e2);

  POLA.push({ jenis: 'hex2des', tingkat: 'Mudah',        pool: poolTanpaHuruf });
  POLA.push({ jenis: 'hex2des', tingkat: 'Mudah-sedang', pool: poolSatuHuruf });
  POLA.push({ jenis: 'hex2des', tingkat: 'Sedang',       pool: rentang(0xA0, 0xBF) });
  POLA.push({ jenis: 'hex2des', tingkat: 'Sulit',        pool: rentang(0xC0, 0xDF) });
  POLA.push({ jenis: 'hex2des', tingkat: 'Sulit',        pool: rentang(0xE0, 0xFF) });

  function langkahDes2Hex(n) {
    var steps = [], d = [], x = n;
    while (x > 0) {
      var q = Math.floor(x / 16), s = x % 16, h = toHex(s);
      steps.push(x + ' ÷ 16 = ' + q + ' sisa ' + s + (s > 9 ? ' (' + h + ')' : ''));
      d.push(h); x = q;
    }
    steps.push('Baca sisa dari bawah ke atas: ' + d.reverse().join(''));
    return steps;
  }

  function langkahHex2Des(hex) {
    var steps = [], bagian = [], total = 0, i;
    var nilai = [];
    for (i = 0; i < hex.length; i++) nilai.push(HEX.indexOf(hex.charAt(i)));
    var ket = [];
    for (i = 0; i < hex.length; i++) {
      if (nilai[i] > 9) ket.push(hex.charAt(i) + ' = ' + nilai[i]);
    }
    if (ket.length) steps.push('Ubah huruf ke angka: ' + ket.join(', '));
    for (i = 0; i < hex.length; i++) {
      var pangkat = hex.length - 1 - i;
      var bobot = Math.pow(16, pangkat);
      bagian.push(nilai[i] + ' × ' + bobot);
      total += nilai[i] * bobot;
    }
    steps.push(bagian.join(' + ') + ' = ' + total);
    return steps;
  }

  function buatSatu(pola, angka, no) {
    var hex = toHex(angka);
    if (pola.jenis === 'des2hex') {
      return {
        modul: 'heksadesimal', no: no, jenis: 'des2hex', tingkat: pola.tingkat,
        angka: angka, tampil: String(angka),
        teks: 'Ubah bilangan desimal ' + angka + ' menjadi bilangan heksadesimal.',
        kunci: hex,
        input: { izin: 'hex', maks: 8 },
        langkah: langkahDes2Hex(angka)
      };
    }
    return {
      modul: 'heksadesimal', no: no, jenis: 'hex2des', tingkat: pola.tingkat,
      angka: angka, tampil: hex,
      teks: 'Ubah bilangan heksadesimal ' + hex + ' menjadi bilangan desimal.',
      kunci: String(angka),
      input: { izin: 'des', maks: 4 },
      langkah: langkahHex2Des(hex)
    };
  }

  B.heksadesimal = {
    id: 'heksadesimal',
    judul: 'Heksadesimal',
    jumlah: POLA.length,
    skorPerSoal: 10,

    /** Membuat 10 soal untuk satu murid. id = nama dalam huruf kecil + '|' + kelas. */
    buat: function (id) {
      var r = B._rng.mulberry32(B._rng.xmur3('heksadesimal|' + id)());
      return POLA.map(function (p, i) {
        var angka = p.pool[Math.floor(r() * p.pool.length)];
        return buatSatu(p, angka, i + 1);
      });
    },

    /** Memeriksa jawaban murid. Hasil: true atau false. */
    periksa: function (soal, jawaban) {
      var a = String(jawaban == null ? '' : jawaban).trim();
      if (a === '') return false;
      if (soal.jenis === 'des2hex') return /^[0-9A-Fa-f]+$/.test(a) && parseInt(a, 16) === soal.angka;
      return /^[0-9]+$/.test(a) && parseInt(a, 10) === soal.angka;
    },

    /** Membersihkan ketikan murid sesuai jenis soal (hex: 0-9 dan A-F, desimal: 0-9). */
    bersihkanJawaban: function (soal, teks) {
      var t = String(teks == null ? '' : teks);
      var re = soal.input.izin === 'hex' ? /[^0-9A-Fa-f]/g : /[^0-9]/g;
      return t.replace(re, '').toUpperCase().slice(0, soal.input.maks);
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);



/* TEMPEL ISI bank-biner.js DI SINI */
/**
 * BANK SOAL: BINER
 *
 * Modul bank soal yang berdiri sendiri, polanya sama dengan bank-heksadesimal.js.
 * Bisa dipakai di index.html (browser) dan di Code.gs (Apps Script) dengan
 * menempel isi file ini apa adanya.
 *
 * Isi: 10 soal per murid
 *   Soal 1-5  : desimal ke biner (mudah sampai sulit)
 *   Soal 6-10 : biner ke desimal (mudah sampai sulit)
 *
 * Batas angka 255 (11111111 dalam biner).
 *
 * Cara menggabungkan dengan materi lain (misalnya heksadesimal):
 *   BANK_SOAL.gabung(idMurid, ['heksadesimal', 'biner'])
 *   Hasilnya satu daftar soal yang nomornya sudah berurutan (field "nomor").
 *
 * Soal diacak dari id murid (nama + kelas), jadi selalu sama untuk murid yang sama.
 * Kunci jawaban dan langkah pengerjaan dihitung otomatis oleh kode.
 */
(function (g) {
  var B = g.BANK_SOAL = g.BANK_SOAL || {};

  // ---------- Pengacak (dipakai bersama oleh semua modul) ----------
  if (!B._rng) {
    B._rng = {
      xmur3: function (str) {
        var h = 1779033703 ^ str.length;
        for (var i = 0; i < str.length; i++) {
          h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
          h = h << 13 | h >>> 19;
        }
        return function () {
          h = Math.imul(h ^ h >>> 16, 2246822507);
          h = Math.imul(h ^ h >>> 13, 3266489909);
          return (h ^= h >>> 16) >>> 0;
        };
      },
      mulberry32: function (a) {
        return function () {
          a |= 0; a = a + 0x6D2B79F5 | 0;
          var t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
    };
  }

  // ---------- Menggabungkan beberapa modul menjadi satu daftar soal ----------
  if (!B.gabung) {
    B.gabung = function (id, daftarModul) {
      var out = [];
      daftarModul.forEach(function (nama) {
        if (!B[nama] || typeof B[nama].buat !== 'function') throw new Error('Modul soal tidak ditemukan: ' + nama);
        B[nama].buat(id).forEach(function (s) { out.push(s); });
      });
      out.forEach(function (s, i) { s.nomor = i + 1; });
      return out;
    };
  }

  // ---------- Isi modul Biner ----------
  function toBin(n) { return n.toString(2); }
  function rentang(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }

  // Kumpulan angka (nilai desimal) yang boleh muncul untuk tiap nomor soal.
  var POLA = [];
  POLA.push({ jenis: 'des2bin', tingkat: 'Mudah',        pool: rentang(10, 39) });    // sampai 6 digit biner
  POLA.push({ jenis: 'des2bin', tingkat: 'Mudah-sedang', pool: rentang(40, 79) });
  POLA.push({ jenis: 'des2bin', tingkat: 'Sedang',       pool: rentang(80, 139) });
  POLA.push({ jenis: 'des2bin', tingkat: 'Sulit',        pool: rentang(140, 199) });
  POLA.push({ jenis: 'des2bin', tingkat: 'Sulit',        pool: rentang(200, 255) });

  POLA.push({ jenis: 'bin2des', tingkat: 'Mudah',        pool: rentang(5, 31) });      // 3-5 digit biner
  POLA.push({ jenis: 'bin2des', tingkat: 'Mudah-sedang', pool: rentang(32, 63) });     // 6 digit
  POLA.push({ jenis: 'bin2des', tingkat: 'Sedang',       pool: rentang(64, 127) });    // 7 digit
  POLA.push({ jenis: 'bin2des', tingkat: 'Sulit',        pool: rentang(128, 191) });   // 8 digit
  POLA.push({ jenis: 'bin2des', tingkat: 'Sulit',        pool: rentang(192, 255) });   // 8 digit

  function langkahDes2Bin(n) {
    var steps = [], d = [], x = n;
    while (x > 0) {
      var q = Math.floor(x / 2), s = x % 2;
      steps.push(x + ' ÷ 2 = ' + q + ' sisa ' + s);
      d.push(s); x = q;
    }
    steps.push('Baca sisa dari bawah ke atas: ' + d.reverse().join(''));
    return steps;
  }

  function langkahBin2Des(bin) {
    var steps = [], bagian = [], yang = [], total = 0, i;
    for (i = 0; i < bin.length; i++) {
      var bit = bin.charAt(i) === '1' ? 1 : 0;
      var bobot = Math.pow(2, bin.length - 1 - i);
      bagian.push(bit + ' × ' + bobot);
      if (bit) { yang.push(bobot); total += bobot; }
    }
    steps.push(bagian.join(' + '));
    steps.push('Jumlahkan bobot yang bernilai 1: ' + yang.join(' + ') + ' = ' + total);
    return steps;
  }

  function buatSatu(pola, angka, no) {
    var bin = toBin(angka);
    if (pola.jenis === 'des2bin') {
      return {
        modul: 'biner', no: no, jenis: 'des2bin', tingkat: pola.tingkat,
        angka: angka, tampil: String(angka),
        teks: 'Ubah bilangan desimal ' + angka + ' menjadi bilangan biner.',
        kunci: bin,
        input: { izin: 'bin', maks: 8 },
        langkah: langkahDes2Bin(angka)
      };
    }
    return {
      modul: 'biner', no: no, jenis: 'bin2des', tingkat: pola.tingkat,
      angka: angka, tampil: bin,
      teks: 'Ubah bilangan biner ' + bin + ' menjadi bilangan desimal.',
      kunci: String(angka),
      input: { izin: 'des', maks: 3 },
      langkah: langkahBin2Des(bin)
    };
  }

  B.biner = {
    id: 'biner',
    judul: 'Biner',
    jumlah: POLA.length,
    skorPerSoal: 10,

    /** Membuat 10 soal untuk satu murid. id = nama dalam huruf kecil + '|' + kelas. */
    buat: function (id) {
      var r = B._rng.mulberry32(B._rng.xmur3('biner|' + id)());
      return POLA.map(function (p, i) {
        var angka = p.pool[Math.floor(r() * p.pool.length)];
        return buatSatu(p, angka, i + 1);
      });
    },

    /** Memeriksa jawaban murid. Hasil: true atau false. Nol di depan diterima. */
    periksa: function (soal, jawaban) {
      var a = String(jawaban == null ? '' : jawaban).trim();
      if (a === '') return false;
      if (soal.jenis === 'des2bin') return /^[01]+$/.test(a) && parseInt(a, 2) === soal.angka;
      return /^[0-9]+$/.test(a) && parseInt(a, 10) === soal.angka;
    },

    /** Membersihkan ketikan murid sesuai jenis soal (biner: 0 dan 1, desimal: 0-9). */
    bersihkanJawaban: function (soal, teks) {
      var t = String(teks == null ? '' : teks);
      var re = soal.input.izin === 'bin' ? /[^01]/g : /[^0-9]/g;
      return t.replace(re, '').slice(0, soal.input.maks);
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);



/* TEMPEL ISI bank-huruf-biner.js DI SINI */
/**
 * BANK SOAL: HURUF DAN BINER
 *
 * Modul bank soal yang berdiri sendiri, polanya sama dengan bank-heksadesimal.js
 * dan bank-biner.js. Bisa dipakai di index.html (browser) dan di Code.gs
 * (Apps Script) dengan menempel isi file ini apa adanya.
 *
 * Isi: 10 soal per murid
 *   Soal 1-5  : kata ke biner  (tiap huruf satu kotak jawaban, isinya biner)
 *   Soal 6-10 : biner ke kata  (tiap biner satu baris, tiap huruf satu kotak jawaban)
 *
 * Kode huruf memakai tabel ASCII: A-Z = 65-90 dan a-z = 97-122.
 * Semua huruf besar dan kecil tepat 7 digit biner, tanpa nol di depan.
 * Huruf besar dan kecil dibedakan (A = 1000001, a = 1100001).
 *
 * Tingkat soal (nomor kata ke biner / nomor biner ke kata):
 *   1 / 6   kata 3 huruf, huruf kecil semua                 Mudah
 *   2 / 7   kata 3 huruf, awal kapital atau kapital semua   Mudah-sedang
 *   3 / 8   kata 4 huruf, huruf kecil semua                 Sedang
 *   4 / 9   kata 4 huruf, awal kapital atau kapital semua   Sulit
 *   5 / 10  kata 5 huruf, kecil / awal kapital / kapital    Sulit
 *
 * Jawaban murid per soal berupa daftar (array) dengan satu isi per kotak.
 *
 * Cara menggabungkan dengan materi lain:
 *   BANK_SOAL.gabung(idMurid, ['heksadesimal', 'biner', 'hurufbiner'])
 *
 * Soal diacak dari id murid (nama + kelas), jadi selalu sama untuk murid yang sama.
 * Kunci jawaban dan langkah pengerjaan dihitung otomatis oleh kode.
 */
(function (g) {
  var B = g.BANK_SOAL = g.BANK_SOAL || {};

  // ---------- Pengacak (dipakai bersama oleh semua modul) ----------
  if (!B._rng) {
    B._rng = {
      xmur3: function (str) {
        var h = 1779033703 ^ str.length;
        for (var i = 0; i < str.length; i++) {
          h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
          h = h << 13 | h >>> 19;
        }
        return function () {
          h = Math.imul(h ^ h >>> 16, 2246822507);
          h = Math.imul(h ^ h >>> 13, 3266489909);
          return (h ^= h >>> 16) >>> 0;
        };
      },
      mulberry32: function (a) {
        return function () {
          a |= 0; a = a + 0x6D2B79F5 | 0;
          var t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
    };
  }

  // ---------- Menggabungkan beberapa modul menjadi satu daftar soal ----------
  if (!B.gabung) {
    B.gabung = function (id, daftarModul) {
      var out = [];
      daftarModul.forEach(function (nama) {
        if (!B[nama] || typeof B[nama].buat !== 'function') throw new Error('Modul soal tidak ditemukan: ' + nama);
        B[nama].buat(id).forEach(function (s) { out.push(s); });
      });
      out.forEach(function (s, i) { s.nomor = i + 1; });
      return out;
    };
  }

  // ---------- Daftar kata bermakna (huruf a-z saja, tanpa tanda baca) ----------
  var KATA3 = ('aku api air ada apa ayo bus cat dan dia dua ibu ini itu jam jas kue kau mau mas nol pak pas sop tas tak tau tua ' +
    'ubi gol gas gua ban bak bau beo dus hak hal jus kas kol lap lem map pot pos rak tim tip uap').split(' ');

  var KATA4 = ('buku kuda laut roti tahu sapi kopi bola baju kaki mata hati nasi meja pena anak ayam ayah adik batu bumi cuci desa emas gula ' +
    'hari kayu kali kota kamu kami kita lari lagu nama obat ojek pagi roda sama sore susu tali tamu uang ular usia yang atap awan baik bank buah cara').split(' ');

  var KATA5 = ('rumah dapur garam hutan kunci makan mobil nanti pasar pintu pulau tidur waktu warna kursi bunga bapak bukit murid kelas tugas pagar papan ' +
    'belum bulan benar besar cepat dalam dekat hijau hitam kecil malam minum motor orang pergi putih sakit salah senin tanah tahun ujian yakin gelas jeruk kebun lapar ' +
    'lemon roket sawah tikus udara').split(' ');

  function bentuk(kata, f) {
    if (f === 'kapital') return kata.toUpperCase();
    if (f === 'awal') return kata.charAt(0).toUpperCase() + kata.slice(1);
    return kata;
  }
  function buatPool(daftar, bentukBentuk) {
    var p = [];
    daftar.forEach(function (w) { bentukBentuk.forEach(function (f) { p.push(bentuk(w, f)); }); });
    return p;
  }

  var P3_KECIL = buatPool(KATA3, ['kecil']);
  var P3_BESAR = buatPool(KATA3, ['awal', 'kapital']);
  var P4_KECIL = buatPool(KATA4, ['kecil']);
  var P4_BESAR = buatPool(KATA4, ['awal', 'kapital']);
  var P5_CAMPUR = buatPool(KATA5, ['kecil', 'awal', 'kapital']);

  var POLA = [
    { jenis: 'kata2bin', tingkat: 'Mudah',        pool: P3_KECIL },
    { jenis: 'kata2bin', tingkat: 'Mudah-sedang', pool: P3_BESAR },
    { jenis: 'kata2bin', tingkat: 'Sedang',       pool: P4_KECIL },
    { jenis: 'kata2bin', tingkat: 'Sulit',        pool: P4_BESAR },
    { jenis: 'kata2bin', tingkat: 'Sulit',        pool: P5_CAMPUR },
    { jenis: 'bin2kata', tingkat: 'Mudah',        pool: P3_KECIL },
    { jenis: 'bin2kata', tingkat: 'Mudah-sedang', pool: P3_BESAR },
    { jenis: 'bin2kata', tingkat: 'Sedang',       pool: P4_KECIL },
    { jenis: 'bin2kata', tingkat: 'Sulit',        pool: P4_BESAR },
    { jenis: 'bin2kata', tingkat: 'Sulit',        pool: P5_CAMPUR }
  ];

  function kodeBin(ch) { return ch.charCodeAt(0).toString(2); }

  // Menguraikan biner menjadi penjumlahan bobot, contoh 1001001 -> "64 + 8 + 1 = 73"
  function uraiBobot(bin) {
    var bagian = [], total = 0;
    for (var i = 0; i < bin.length; i++) {
      if (bin.charAt(i) === '1') {
        var bobot = Math.pow(2, bin.length - 1 - i);
        bagian.push(bobot); total += bobot;
      }
    }
    return bagian.join(' + ') + ' = ' + total;
  }

  function buatSatu(pola, kata, no) {
    var huruf = kata.split('').map(function (c) {
      return { char: c, kode: c.charCodeAt(0), biner: kodeBin(c) };
    });

    if (pola.jenis === 'kata2bin') {
      return {
        modul: 'hurufbiner', no: no, jenis: 'kata2bin', tingkat: pola.tingkat,
        kata: kata, tampil: kata,
        teks: 'Ubah kata ' + kata + ' menjadi bilangan biner. Tulis satu huruf di satu kotak.',
        kotak: huruf.map(function (h) { return { label: h.char, kunci: h.biner }; }),
        kunci: huruf.map(function (h) { return h.biner; }),
        input: { izin: 'bin', maks: 8 },
        langkah: huruf.map(function (h) {
          return h.char + ': kode huruf ' + h.kode + ', ' + uraiBobot(h.biner) + ', jadi biner ' + h.biner;
        })
      };
    }

    return {
      modul: 'hurufbiner', no: no, jenis: 'bin2kata', tingkat: pola.tingkat,
      kata: kata,
      tampil: huruf.map(function (h) { return h.biner; }),
      teks: 'Ubah bilangan biner berikut menjadi kata. Tulis satu huruf di satu kotak.',
      baris: huruf.map(function (h) { return { biner: h.biner, kunci: h.char }; }),
      kunci: huruf.map(function (h) { return h.char; }),
      input: { izin: 'huruf', maks: 1 },
      langkah: huruf.map(function (h) {
        return h.biner + ' = ' + uraiBobot(h.biner) + ', kode ' + h.kode + ' adalah huruf ' + h.char;
      })
    };
  }

  // Tabel pembantu kode huruf untuk murid
  function buatTabel() {
    var t = [], c;
    for (c = 65; c <= 90; c++) t.push({ huruf: String.fromCharCode(c), kode: c, biner: c.toString(2) });
    for (c = 97; c <= 122; c++) t.push({ huruf: String.fromCharCode(c), kode: c, biner: c.toString(2) });
    return t;
  }

  // Mengubah jawaban murid menjadi daftar per kotak
  function keDaftar(soal, jawaban) {
    if (Array.isArray(jawaban)) return jawaban.map(function (x) { return String(x == null ? '' : x).trim(); });
    var s = String(jawaban == null ? '' : jawaban).trim();
    if (s === '') return [];
    if (soal.jenis === 'bin2kata') return /\s/.test(s) ? s.split(/[\s,]+/) : s.split('');
    return s.split(/[\s,]+/);
  }

  B.hurufbiner = {
    id: 'hurufbiner',
    judul: 'Huruf dan Biner',
    jumlah: POLA.length,
    skorPerSoal: 10,
    tabel: buatTabel(),

    /** Membuat 10 soal untuk satu murid. id = nama dalam huruf kecil + '|' + kelas. */
    buat: function (id) {
      var r = B._rng.mulberry32(B._rng.xmur3('hurufbiner|' + id)());
      var dipakai = {};
      return POLA.map(function (p, i) {
        var kata = '', coba = 0;
        do {
          kata = p.pool[Math.floor(r() * p.pool.length)];
          coba++;
        } while (dipakai[kata.toLowerCase()] && coba < 50);
        dipakai[kata.toLowerCase()] = true;
        return buatSatu(p, kata, i + 1);
      });
    },

    /** Hasil per kotak: daftar true atau false. Kotak yang kosong dihitung salah. */
    periksaKotak: function (soal, jawaban) {
      var a = keDaftar(soal, jawaban);
      return soal.kunci.map(function (kunci, k) {
        var v = a[k] == null ? '' : String(a[k]);
        if (v === '') return false;
        if (soal.jenis === 'kata2bin') return /^[01]+$/.test(v) && parseInt(v, 2) === parseInt(kunci, 2);
        return v === kunci;
      });
    },

    /** Memeriksa jawaban murid. Benar bila semua kotak benar. */
    periksa: function (soal, jawaban) {
      return this.periksaKotak(soal, jawaban).every(function (x) { return x; });
    },

    /** Membersihkan ketikan murid untuk satu kotak. Biner: 0 dan 1. Huruf: satu huruf a-z (terakhir yang diketik). */
    bersihkanJawaban: function (soal, teks) {
      var t = String(teks == null ? '' : teks);
      if (soal.input.izin === 'bin') return t.replace(/[^01]/g, '').slice(0, soal.input.maks);
      return t.replace(/[^A-Za-z]/g, '').slice(-1);
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);



/* TEMPEL ISI bank-huruf-biner.js DI SINI */
/**
 * BANK SOAL: HURUF DAN BINER
 *
 * Modul bank soal yang berdiri sendiri, polanya sama dengan bank-heksadesimal.js
 * dan bank-biner.js. Bisa dipakai di index.html (browser) dan di Code.gs
 * (Apps Script) dengan menempel isi file ini apa adanya.
 *
 * Isi: 10 soal per murid
 *   Soal 1-5  : kata ke biner  (tiap huruf satu kotak jawaban, isinya biner)
 *   Soal 6-10 : biner ke kata  (tiap biner satu baris, tiap huruf satu kotak jawaban)
 *
 * Kode huruf memakai tabel ASCII: A-Z = 65-90 dan a-z = 97-122.
 * Semua huruf besar dan kecil tepat 7 digit biner, tanpa nol di depan.
 * Huruf besar dan kecil dibedakan (A = 1000001, a = 1100001).
 *
 * Tingkat soal (nomor kata ke biner / nomor biner ke kata):
 *   1 / 6   kata 3 huruf, huruf kecil semua                 Mudah
 *   2 / 7   kata 3 huruf, awal kapital atau kapital semua   Mudah-sedang
 *   3 / 8   kata 4 huruf, huruf kecil semua                 Sedang
 *   4 / 9   kata 4 huruf, awal kapital atau kapital semua   Sulit
 *   5 / 10  kata 5 huruf, kecil / awal kapital / kapital    Sulit
 *
 * Jawaban murid per soal berupa daftar (array) dengan satu isi per kotak.
 *
 * Cara menggabungkan dengan materi lain:
 *   BANK_SOAL.gabung(idMurid, ['heksadesimal', 'biner', 'hurufbiner'])
 *
 * Soal diacak dari id murid (nama + kelas), jadi selalu sama untuk murid yang sama.
 * Kunci jawaban dan langkah pengerjaan dihitung otomatis oleh kode.
 */
(function (g) {
  var B = g.BANK_SOAL = g.BANK_SOAL || {};

  // ---------- Pengacak (dipakai bersama oleh semua modul) ----------
  if (!B._rng) {
    B._rng = {
      xmur3: function (str) {
        var h = 1779033703 ^ str.length;
        for (var i = 0; i < str.length; i++) {
          h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
          h = h << 13 | h >>> 19;
        }
        return function () {
          h = Math.imul(h ^ h >>> 16, 2246822507);
          h = Math.imul(h ^ h >>> 13, 3266489909);
          return (h ^= h >>> 16) >>> 0;
        };
      },
      mulberry32: function (a) {
        return function () {
          a |= 0; a = a + 0x6D2B79F5 | 0;
          var t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
    };
  }

  // ---------- Menggabungkan beberapa modul menjadi satu daftar soal ----------
  if (!B.gabung) {
    B.gabung = function (id, daftarModul) {
      var out = [];
      daftarModul.forEach(function (nama) {
        if (!B[nama] || typeof B[nama].buat !== 'function') throw new Error('Modul soal tidak ditemukan: ' + nama);
        B[nama].buat(id).forEach(function (s) { out.push(s); });
      });
      out.forEach(function (s, i) { s.nomor = i + 1; });
      return out;
    };
  }

  // ---------- Daftar kata bermakna (huruf a-z saja, tanpa tanda baca) ----------
  var KATA3 = ('aku api air ada apa ayo bus cat dan dia dua ibu ini itu jam jas kue kau mau mas nol pak pas sop tas tak tau tua ' +
    'ubi gol gas gua ban bak bau beo dus hak hal jus kas kol lap lem map pot pos rak tim tip uap').split(' ');

  var KATA4 = ('buku kuda laut roti tahu sapi kopi bola baju kaki mata hati nasi meja pena anak ayam ayah adik batu bumi cuci desa emas gula ' +
    'hari kayu kali kota kamu kami kita lari lagu nama obat ojek pagi roda sama sore susu tali tamu uang ular usia yang atap awan baik bank buah cara').split(' ');

  var KATA5 = ('rumah dapur garam hutan kunci makan mobil nanti pasar pintu pulau tidur waktu warna kursi bunga bapak bukit murid kelas tugas pagar papan ' +
    'belum bulan benar besar cepat dalam dekat hijau hitam kecil malam minum motor orang pergi putih sakit salah senin tanah tahun ujian yakin gelas jeruk kebun lapar ' +
    'lemon roket sawah tikus udara').split(' ');

  function bentuk(kata, f) {
    if (f === 'kapital') return kata.toUpperCase();
    if (f === 'awal') return kata.charAt(0).toUpperCase() + kata.slice(1);
    return kata;
  }
  function buatPool(daftar, bentukBentuk) {
    var p = [];
    daftar.forEach(function (w) { bentukBentuk.forEach(function (f) { p.push(bentuk(w, f)); }); });
    return p;
  }

  var P3_KECIL = buatPool(KATA3, ['kecil']);
  var P3_BESAR = buatPool(KATA3, ['awal', 'kapital']);
  var P4_KECIL = buatPool(KATA4, ['kecil']);
  var P4_BESAR = buatPool(KATA4, ['awal', 'kapital']);
  var P5_CAMPUR = buatPool(KATA5, ['kecil', 'awal', 'kapital']);

  var POLA = [
    { jenis: 'kata2bin', tingkat: 'Mudah',        pool: P3_KECIL },
    { jenis: 'kata2bin', tingkat: 'Mudah-sedang', pool: P3_BESAR },
    { jenis: 'kata2bin', tingkat: 'Sedang',       pool: P4_KECIL },
    { jenis: 'kata2bin', tingkat: 'Sulit',        pool: P4_BESAR },
    { jenis: 'kata2bin', tingkat: 'Sulit',        pool: P5_CAMPUR },
    { jenis: 'bin2kata', tingkat: 'Mudah',        pool: P3_KECIL },
    { jenis: 'bin2kata', tingkat: 'Mudah-sedang', pool: P3_BESAR },
    { jenis: 'bin2kata', tingkat: 'Sedang',       pool: P4_KECIL },
    { jenis: 'bin2kata', tingkat: 'Sulit',        pool: P4_BESAR },
    { jenis: 'bin2kata', tingkat: 'Sulit',        pool: P5_CAMPUR }
  ];

  function kodeBin(ch) { return ch.charCodeAt(0).toString(2); }

  // Menguraikan biner menjadi penjumlahan bobot, contoh 1001001 -> "64 + 8 + 1 = 73"
  function uraiBobot(bin) {
    var bagian = [], total = 0;
    for (var i = 0; i < bin.length; i++) {
      if (bin.charAt(i) === '1') {
        var bobot = Math.pow(2, bin.length - 1 - i);
        bagian.push(bobot); total += bobot;
      }
    }
    return bagian.join(' + ') + ' = ' + total;
  }

  function buatSatu(pola, kata, no) {
    var huruf = kata.split('').map(function (c) {
      return { char: c, kode: c.charCodeAt(0), biner: kodeBin(c) };
    });

    if (pola.jenis === 'kata2bin') {
      return {
        modul: 'hurufbiner', no: no, jenis: 'kata2bin', tingkat: pola.tingkat,
        kata: kata, tampil: kata,
        teks: 'Ubah kata ' + kata + ' menjadi bilangan biner. Tulis satu huruf di satu kotak.',
        kotak: huruf.map(function (h) { return { label: h.char, kunci: h.biner }; }),
        kunci: huruf.map(function (h) { return h.biner; }),
        input: { izin: 'bin', maks: 8 },
        langkah: huruf.map(function (h) {
          return h.char + ': kode huruf ' + h.kode + ', ' + uraiBobot(h.biner) + ', jadi biner ' + h.biner;
        })
      };
    }

    return {
      modul: 'hurufbiner', no: no, jenis: 'bin2kata', tingkat: pola.tingkat,
      kata: kata,
      tampil: huruf.map(function (h) { return h.biner; }),
      teks: 'Ubah bilangan biner berikut menjadi kata. Tulis satu huruf di satu kotak.',
      baris: huruf.map(function (h) { return { biner: h.biner, kunci: h.char }; }),
      kunci: huruf.map(function (h) { return h.char; }),
      input: { izin: 'huruf', maks: 1 },
      langkah: huruf.map(function (h) {
        return h.biner + ' = ' + uraiBobot(h.biner) + ', kode ' + h.kode + ' adalah huruf ' + h.char;
      })
    };
  }

  // Tabel pembantu kode huruf untuk murid
  function buatTabel() {
    var t = [], c;
    for (c = 65; c <= 90; c++) t.push({ huruf: String.fromCharCode(c), kode: c, biner: c.toString(2) });
    for (c = 97; c <= 122; c++) t.push({ huruf: String.fromCharCode(c), kode: c, biner: c.toString(2) });
    return t;
  }

  // Mengubah jawaban murid menjadi daftar per kotak
  function keDaftar(soal, jawaban) {
    if (Array.isArray(jawaban)) return jawaban.map(function (x) { return String(x == null ? '' : x).trim(); });
    var s = String(jawaban == null ? '' : jawaban).trim();
    if (s === '') return [];
    if (soal.jenis === 'bin2kata') return /\s/.test(s) ? s.split(/[\s,]+/) : s.split('');
    return s.split(/[\s,]+/);
  }

  B.hurufbiner = {
    id: 'hurufbiner',
    judul: 'Huruf dan Biner',
    jumlah: POLA.length,
    skorPerSoal: 10,
    tabel: buatTabel(),

    /** Membuat 10 soal untuk satu murid. id = nama dalam huruf kecil + '|' + kelas. */
    buat: function (id) {
      var r = B._rng.mulberry32(B._rng.xmur3('hurufbiner|' + id)());
      var dipakai = {};
      return POLA.map(function (p, i) {
        var kata = '', coba = 0;
        do {
          kata = p.pool[Math.floor(r() * p.pool.length)];
          coba++;
        } while (dipakai[kata.toLowerCase()] && coba < 50);
        dipakai[kata.toLowerCase()] = true;
        return buatSatu(p, kata, i + 1);
      });
    },

    /** Hasil per kotak: daftar true atau false. Kotak yang kosong dihitung salah. */
    periksaKotak: function (soal, jawaban) {
      var a = keDaftar(soal, jawaban);
      return soal.kunci.map(function (kunci, k) {
        var v = a[k] == null ? '' : String(a[k]);
        if (v === '') return false;
        if (soal.jenis === 'kata2bin') return /^[01]+$/.test(v) && parseInt(v, 2) === parseInt(kunci, 2);
        return v === kunci;
      });
    },

    /** Memeriksa jawaban murid. Benar bila semua kotak benar. */
    periksa: function (soal, jawaban) {
      return this.periksaKotak(soal, jawaban).every(function (x) { return x; });
    },

    /** Membersihkan ketikan murid untuk satu kotak. Biner: 0 dan 1. Huruf: satu huruf a-z (terakhir yang diketik). */
    bersihkanJawaban: function (soal, teks) {
      var t = String(teks == null ? '' : teks);
      if (soal.input.izin === 'bin') return t.replace(/[^01]/g, '').slice(0, soal.input.maks);
      return t.replace(/[^A-Za-z]/g, '').slice(-1);
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

/**
 * BANK SOAL: HARDWARE, SOFTWARE, DAN MALWARE
 *
 * Modul bank soal yang berdiri sendiri, polanya sama dengan bank-biner.js.
 * Tempel isi file ini apa adanya di bagian BANK SOAL pada index.html.
 *
 * Isi: 20 soal per murid
 *   12 soal hardware : 4 mudah, 4 sedang, 4 sulit
 *    2 soal software : mudah
 *    6 soal malware  : 2 mudah (Adware, Ransomware),
 *                      2 sedang (dipilih dari Trojan, Spyware, Keylogger),
 *                      2 sulit (Virus, Worm)
 *
 * Semua jawaban satu kata atau satu nama, sehingga bisa dicek otomatis.
 * Huruf besar/kecil, spasi, dan tanda baca diabaikan saat memeriksa.
 *
 * Cara menggabungkan dengan materi lain:
 *   BANK_SOAL.gabung(idMurid, ['hsmw', 'biner'])
 *
 * Soal diacak dari id murid (nama + kelas), jadi selalu sama untuk murid yang sama.
 */
(function (g) {
  var B = g.BANK_SOAL = g.BANK_SOAL || {};

  // ---------- Pengacak (dipakai bersama oleh semua modul) ----------
  if (!B._rng) {
    B._rng = {
      xmur3: function (str) {
        var h = 1779033703 ^ str.length;
        for (var i = 0; i < str.length; i++) {
          h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
          h = h << 13 | h >>> 19;
        }
        return function () {
          h = Math.imul(h ^ h >>> 16, 2246822507);
          h = Math.imul(h ^ h >>> 13, 3266489909);
          return (h ^= h >>> 16) >>> 0;
        };
      },
      mulberry32: function (a) {
        return function () {
          a |= 0; a = a + 0x6D2B79F5 | 0;
          var t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
    };
  }

  // ---------- Menggabungkan beberapa modul menjadi satu daftar soal ----------
  if (!B.gabung) {
    B.gabung = function (id, daftarModul) {
      var out = [];
      daftarModul.forEach(function (nama) {
        if (!B[nama] || typeof B[nama].buat !== 'function') throw new Error('Modul soal tidak ditemukan: ' + nama);
        B[nama].buat(id).forEach(function (s) { out.push(s); });
      });
      out.forEach(function (s, i) { s.nomor = i + 1; });
      return out;
    };
  }

  // ---------- Isi modul Hardware, Software, Malware ----------
  // Format data: [teks soal, jawaban, [alias yang juga diterima]]

  var HW = {
    mudah: [
      ["Alat untuk mengetik huruf dan angka pada komputer?", "Keyboard", ["papan ketik"]],
      ["Alat untuk menggerakkan kursor di layar?", "Mouse", []],
      ["Perangkat yang menampilkan gambar dari komputer?", "Monitor", ["layar"]],
      ["Perangkat untuk mencetak dokumen di atas kertas?", "Printer", []],
      ["Perangkat untuk mengeluarkan suara dari komputer?", "Speaker", ["pengeras suara"]],
      ["Perangkat yang dipasang di kepala untuk mendengarkan suara?", "Headset", ["headphone"]],
      ["Perangkat untuk merekam suara?", "Mikrofon", ["microphone", "mic"]],
      ["Kamera kecil untuk video call, biasanya dipasang di atas layar?", "Webcam", ["web cam", "kamera web"]]
    ],
    sedang: [
      ["Perangkat untuk memindai dokumen menjadi file digital?", "Scanner", ["pemindai"]],
      ["Memori sementara tempat data diproses saat komputer bekerja?", "RAM", ["random access memory"]],
      ["Penyimpanan kecil yang dicolokkan ke port USB?", "Flashdisk", ["flash disk", "flashdrive", "usb"]],
      ["Komponen utama tempat komponen lain dipasang?", "Motherboard", ["mainboard"]],
      ["Perangkat untuk menampilkan layar komputer ke dinding?", "Proyektor", ["projector"]],
      ["Pendingin yang dipasang di atas prosesor?", "Kipas", ["kipas pendingin", "fan"]],
      ["Piringan penyimpanan yang dibaca dengan sinar laser?", "CD", ["compact disc"]],
      ["Perangkat yang menghubungkan komputer ke internet lewat jaringan telepon?", "Modem", []]
    ],
    sulit: [
      ["Komponen yang memproses instruksi program, sering disebut otak komputer?", "Prosesor", ["cpu", "processor", "prosesor (cpu)"]],
      ["Penyimpanan tanpa komponen bergerak yang lebih cepat dari hard disk?", "SSD", ["solid state drive"]],
      ["Perangkat yang meneruskan data antarjaringan?", "Router", []],
      ["Komponen yang mengubah listrik PLN menjadi tegangan untuk komputer?", "Power supply", ["psu", "power supply unit"]],
      ["Perangkat input berbentuk tongkat yang biasa dipakai bermain game?", "Joystick", []],
      ["Kartu yang menghasilkan gambar untuk ditampilkan di layar?", "Kartu grafis", ["vga", "gpu", "video card"]]
    ]
  };

  var SW = {
    mudah: [
      ["Aplikasi pengolah kata buatan Microsoft?", "Word", ["microsoft word"]],
      ["Aplikasi untuk membuat presentasi slide?", "PowerPoint", ["microsoft powerpoint", "ppt"]],
      ["Aplikasi pengolah angka dan tabel dari Microsoft?", "Excel", ["microsoft excel"]],
      ["Browser populer dengan ikon bulat merah, hijau, kuning, dan biru?", "Chrome", ["google chrome"]],
      ["Aplikasi menggambar sederhana bawaan Windows?", "Paint", []],
      ["Aplikasi teks polos sederhana bawaan Windows?", "Notepad", []],
      ["Aplikasi musik online berlogo gelombang hijau?", "Spotify", []],
      ["Sistem operasi Apple untuk komputer Mac?", "macOS", ["mac os", "os x"]],
      ["Aplikasi peta dan navigasi dari Google?", "Google Maps", ["maps"]]
    ]
  };

  // Malware: satu jenis per soal. Tiap jenis punya dua variasi pertanyaan dengan jawaban yang sama.
  var MW = {
    mudah: [
      ["Adware", [
        "Program yang terus menampilkan iklan yang tidak diinginkan?",
        "Malware yang memunculkan pop-up iklan saat browser dibuka?"
      ]],
      ["Ransomware", [
        "Malware yang memblokir akses ke file dan meminta pembayaran?",
        "Malware yang mengunci data dan meminta uang tebusan?"
      ]]
    ],
    sedang: [
      ["Trojan", [
        "Program jahat yang berpura-pura menjadi perangkat lunak resmi?",
        "Malware yang menyamar sebagai program berguna agar dipasang korban?"
      ]],
      ["Spyware", [
        "Malware yang mencuri informasi pengguna tanpa sepengetahuannya?",
        "Malware yang diam-diam memantau aktivitas pengguna?"
      ]],
      ["Keylogger", [
        "Perangkat lunak yang merekam ketikan keyboard pengguna?",
        "Malware yang mencatat setiap tombol yang ditekan?"
      ]]
    ],
    sulit: [
      ["Virus", [
        "Malware yang menyisipkan kodenya ke dalam file lain?",
        "Malware yang menempel pada file program dan aktif saat dibuka?"
      ]],
      ["Worm", [
        "Malware yang bisa menggandakan diri dan menyebar sendiri lewat jaringan?",
        "Malware yang menyebar antarkomputer tanpa perlu menempel pada file?"
      ]]
    ]
  };

  function acak(arr, k, r) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a.slice(0, k);
  }

  function buatSoal(jenis, tingkat, teks, kunci, alias) {
    return {
      modul: 'hsmw', no: 0, jenis: jenis, tingkat: tingkat,
      tampil: '', teks: teks, kunci: kunci, alias: alias || [],
      input: { izin: 'teks', maks: 40 },
      langkah: ['Jawaban yang benar: ' + kunci]
    };
  }

  function norm(s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, ''); }

  B.hsmw = {
    perluFoto: false,
    id: 'hsmw',
    judul: 'Hardware, Software, dan Malware',
    jumlah: 20,
    skorPerSoal: 5,

    /** Membuat 20 soal untuk satu murid. id = nama dalam huruf kecil + '|' + kelas. */
    buat: function (id) {
      var r = B._rng.mulberry32(B._rng.xmur3('hsmw|' + id)());
      var out = [];
      var tingkat = ['mudah', 'sedang', 'sulit'];
      var label = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' };

      tingkat.forEach(function (t) {
        acak(HW[t], 4, r).forEach(function (h) {
          out.push(buatSoal('hardware', label[t], h[0], h[1], h[2]));
        });
      });

      acak(SW.mudah, 2, r).forEach(function (s) {
        out.push(buatSoal('software', 'Mudah', s[0], s[1], s[2]));
      });

      tingkat.forEach(function (t) {
        acak(MW[t], 2, r).forEach(function (m) {
          var teks = acak(m[1], 1, r)[0];
          out.push(buatSoal('malware', label[t], teks, m[0], []));
        });
      });

      out.forEach(function (s, i) { s.no = i + 1; });
      return out;
    },

    /** Memeriksa jawaban murid. Hasil: true atau false. */
    periksa: function (soal, jawaban) {
      var a = norm(jawaban);
      if (!a) return false;
      return [soal.kunci].concat(soal.alias || []).some(function (x) { return norm(x) === a; });
    },

    /** Membersihkan ketikan murid: huruf, angka, spasi, dan tanda kurung. */
    bersihkanJawaban: function (soal, teks) {
      var t = String(teks == null ? '' : teks);
      return t.replace(/[^A-Za-z0-9 ()]/g, '').slice(0, soal.input.maks);
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);


/**
 * BANK SOAL: UJIAN
 * 25 soal per murid, diambil dari 4 bank dengan urutan tetap:
 * Biner (6), Huruf dan Biner (6), Heksadesimal (6), Hardware-Software-Malware (7).
 * Kunci acak memakai awalan 'ujian|' sehingga berbeda dari materi latihan. Tiap soal bernilai 4.
 */
(function (g) {
  var B = g.BANK_SOAL;
  var BAGIAN = [['biner', 6], ['hurufbiner', 6], ['heksadesimal', 6], ['hsmw', 7]];
  function pilih(n, k, r) {
    var a = [], i, j, t;
    for (i = 0; i < n; i++) a.push(i);
    for (i = n - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a.slice(0, k).sort(function (x, y) { return x - y; });
  }
  B.ujian = {
    id: 'ujian', judul: 'Ujian', jumlah: 25, skorPerSoal: 4,
    buat: function (id) {
      var r = B._rng.mulberry32(B._rng.xmur3('ujian|' + id)()), out = [];
      BAGIAN.forEach(function (b) {
        var s = B[b[0]].buat('ujian|' + id);
        pilih(s.length, b[1], r).forEach(function (i) { out.push(s[i]); });
      });
      out.forEach(function (s, i) { s.no = i + 1; });
      return out;
    },
    perluFotoSoal: function (soal) { return soal.modul !== 'hsmw'; },
    periksa: function (soal, jawaban) { return B[soal.modul].periksa(soal, jawaban); },
    bersihkanJawaban: function (soal, teks) { return B[soal.modul].bersihkanJawaban(soal, teks); }
  };
  Object.defineProperty(B.ujian, 'tabel', { get: function () { return B.hurufbiner.tabel; } });
})(typeof globalThis !== 'undefined' ? globalThis : this);


var API_URL = 'https://script.google.com/macros/s/AKfycbwI0ZmnStm9K8N5d54A6ZdctFu9hcX2v2G_k3XRIO_7tWkS5kaHjM95Z-u3igTRd4QrgA/exec';
var VERSI = 'Version.Reg03';
var SEKOLAH = 'SMPN 7 PADANGSIDIMPUAN';
var PANJANG_PW = 6;
var KELAS = [];
['VII', 'VIII', 'IX'].forEach(function (t) { for (var i = 1; i <= 4; i++) KELAS.push(t + '-' + i); });
var MATERI = [
  { id: 'heksadesimal', judul: 'Heksadesimal', ikon: '🔢' },
  { id: 'biner', judul: 'Biner', ikon: '💾' },
  { id: 'hurufbiner', judul: 'Huruf dan Biner', ikon: '🔤' },
  { id: 'hsmw', judul: 'Hardware, Software, dan Malware', ikon: '🖥️' },
  { id: 'ujian', judul: 'Ujian', ikon: '📝' }
];

// Link khusus ujian: index.html?ujian (database & API sama, hanya tampilan materi ujian)
var MODE_UJIAN = (MODE === 'ujian'), MODE_GURU = (MODE === 'guru');

var PAGES = {};   // PAGES.nama = { buka: function(param){} }
var INIT = [];    // fungsi yang dijalankan sekali saat aplikasi mulai

function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// ---------- Penyimpanan di HP ----------
function simpanLokal(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch (e) {} }
function bacaLokal(k, def) {
  try { var v = localStorage.getItem(PFX + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
}
function hapusLokal(k) { try { localStorage.removeItem(PFX + k); } catch (e) {} }

// ---------- Sesi ----------
var S = bacaLokal('app_sesi', null) || { role: null, token: '', murid: null, hal: null, param: null };
function simpan() { simpanLokal('app_sesi', S); }

// ---------- Panggilan ke Apps Script ----------
function api(aksi, data) {
  var body = Object.assign({ aksi: aksi, token: S.token || '' }, data || {});
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  }).then(function (r) { return r.json(); })
    .then(function (r) {
      if (r && r.sesiHabis) { toast('Sesi berakhir, silakan masuk lagi'); keluar(); }
      return r;
    })
    .catch(function () { return { ok: false, offline: true, pesan: 'Tidak ada sinyal. Coba lagi.' }; });
}

// ---------- Tampilan umum ----------
var tToast;
function toast(teks) {
  var t = $('toast'); t.textContent = teks; t.classList.add('tampil');
  clearTimeout(tToast); tToast = setTimeout(function () { t.classList.remove('tampil'); }, 2400);
}
function setGalat(id, teks) { $(id).textContent = teks || ''; }
function sibuk(btn, on, teks) {
  if (on) { btn.dataset.asal = btn.textContent; btn.textContent = teks || 'Memproses...'; btn.disabled = true; }
  else { btn.textContent = btn.dataset.asal || btn.textContent; btn.disabled = false; }
}
function isiKelas(sel) {
  sel.innerHTML = '<option value="">Pilih kelas</option>' +
    KELAS.map(function (k) { return '<option value="' + k + '">' + k + '</option>'; }).join('');
}

// ---------- Kotak dialog ----------
var dialogTerbuka = 0;
function dialog(judul, isi, tombol) {
  return new Promise(function (res) {
    dialogTerbuka++;
    var o = document.createElement('div'); o.className = 'overlay';
    var k = document.createElement('div'); k.className = 'modal';
    var h = document.createElement('h3'); h.textContent = judul; k.appendChild(h);
    if (isi) { var p = document.createElement('p'); p.textContent = isi; k.appendChild(p); }
    tombol.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'btn' + (t.g ? ' ' + t.g : ''); b.textContent = t.t;
      b.onclick = function () { document.body.removeChild(o); dialogTerbuka--; res(t.v); };
      k.appendChild(b);
    });
    o.appendChild(k); document.body.appendChild(o);
  });
}
function info(judul, isi) { return dialog(judul, isi, [{ t: 'OK', v: true }]); }
function tanya(judul, isi, ya, tidak) {
  return dialog(judul, isi, [{ t: ya || 'Ya', v: true }, { t: tidak || 'Batal', v: false, g: 'sekunder' }]);
}

// ---------- Saran nama (ketik awalan) ----------
function pasangSaran(inp, box, ambil, pilih) {
  function tampil() {
    var q = inp.value.trim().toLowerCase();
    box.innerHTML = '';
    if (!q) { box.style.display = 'none'; return; }
    var hasil = ambil().filter(function (n) { return n.toLowerCase().indexOf(q) === 0; }).slice(0, 8);
    if (!hasil.length) { box.style.display = 'none'; return; }
    hasil.forEach(function (n) {
      var d = document.createElement('div'); d.className = 'saran-item'; d.textContent = n;
      d.addEventListener('mousedown', function (e) { e.preventDefault(); });
      d.addEventListener('click', function () { inp.value = n; box.style.display = 'none'; pilih(n); });
      box.appendChild(d);
    });
    box.style.display = 'block';
  }
  inp.addEventListener('input', tampil);
  inp.addEventListener('focus', tampil);
  inp.addEventListener('blur', function () { setTimeout(function () { box.style.display = 'none'; }, 150); });
}

// ---------- Navigasi halaman ----------
function go(nama, param) {
  var el = $('h-' + nama);
  if (!el) { console.warn('Halaman belum ada: ' + nama); return; }
  document.querySelectorAll('.halaman').forEach(function (h) { h.classList.remove('aktif'); });
  el.classList.add('aktif');
  document.body.classList.toggle('guru', nama.indexOf('guru') === 0);
  document.body.dataset.hal = nama;
  gambarKembaliGuru(nama);
  S.hal = nama; S.param = param === undefined ? null : param; simpan();
  window.scrollTo(0, 0);
  if (PAGES[nama] && PAGES[nama].buka) PAGES[nama].buka(param);
}
var KEMBALI_GURU = { guruKelas: 'guruMenu', guruMurid: 'guruMenu', guruKode: 'guruMenu', guruTugas: 'guruMenu', guruRekap: 'guruTugas', guruRemedi: 'guruTugas', guruNilai: 'guruTugas', guruRekapMenu: 'guruMenu' };
function gambarKembaliGuru(nama) { var b = $('btn-kembali-guru'); if (b) b.classList.toggle('tampil', !!KEMBALI_GURU[nama]); }
document.addEventListener('click', function (e) {
  var b = e.target.closest ? e.target.closest('#btn-kembali-guru') : null;
  if (!b) return;
  if (S.hal === 'guruNilai') { $('gn-kembali').click(); return; }   // tetap cek nilai yang belum disimpan
  go(KEMBALI_GURU[S.hal] || 'guruMenu');
});
function keluar() {
  hapusLokal('app_status'); if (typeof STATUS_MATERI !== 'undefined') STATUS_MATERI = {};
  S.token = ''; S.murid = null; S.role = null; S.param = null;
  go(HALAMAN_MASUK);
}

// ---------- Tombol Kembali HP dan reload (semua layar) ----------
history.replaceState({ n: 0 }, '');
history.pushState({ n: 1 }, '');
window.addEventListener('popstate', function () {
  history.pushState({ n: 1 }, '');
  if (!S.hal || S.hal === 'login' || dialogTerbuka) return;
  dialog('Keluar dari halaman ini?', 'Jawaban yang sudah diisi tetap tersimpan di HP.', [
    { t: 'Tetap di halaman ini', v: false },
    { t: 'Kembali ke halaman login', v: true, g: 'sekunder' }
  ]).then(function (v) { if (v) keluar(); });
});
window.addEventListener('beforeunload', function (e) { e.preventDefault(); e.returnValue = ''; });

// ---------- Tombol mata (lihat password) ----------
document.addEventListener('click', function (e) {
  var b = e.target.closest ? e.target.closest('.mata') : null;
  if (!b) return;
  var inp = $(b.dataset.target);
  var lihat = inp.type === 'password';
  inp.type = lihat ? 'text' : 'password';
  b.textContent = lihat ? '🙈' : '👁️';
});

// ===================== HALAMAN MASUK =====================
var NAMA_TERDAFTAR = [];
PAGES.login = {
  buka: function () {
    $('lg-pw').value = ''; setGalat('lg-galat', '');
    if (S.prefill) { $('lg-nama').value = S.prefill.nama; $('lg-kelas').value = S.prefill.kelas; delete S.prefill; simpan(); }
    if (!NAMA_TERDAFTAR.length) {
      api('namaTerdaftar').then(function (r) { if (r && r.ok) NAMA_TERDAFTAR = r.nama || []; });
    }
  }
};
INIT.push(function () {
  isiKelas($('lg-kelas'));
  pasangSaran($('lg-nama'), $('lg-saran'), function () { return NAMA_TERDAFTAR; }, function () {});
  $('lg-pw').addEventListener('input', function () { this.value = this.value.replace(/[^A-Za-z0-9]/g, ''); });
  $('lg-daftar').onclick = function (e) { e.preventDefault(); go('daftar'); };
  
  $('lg-pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('lg-masuk').click(); });
  $('lg-masuk').onclick = async function () {
    var nama = $('lg-nama').value.trim(), kelas = $('lg-kelas').value, pw = $('lg-pw').value;
    if (!nama || !kelas || !pw) { setGalat('lg-galat', 'Isi nama, kelas, dan password.'); return; }
    setGalat('lg-galat', '');
    var b = $('lg-masuk'); sibuk(b, true, 'Memeriksa...');
    var r = await api('login', { nama: nama, kelas: kelas, password: pw });
    sibuk(b, false);
    if (r && r.ok) { hapusLokal('app_status'); S.role = 'murid'; S.token = r.token; S.murid = r.murid; S.soalIdx = 0; simpan(); go('materi'); }
    else setGalat('lg-galat', (r && r.pesan) || 'Gagal masuk. Coba lagi.');
  };
});

// ===================== HALAMAN DAFTAR =====================
var DAFTAR = [];        // daftar nama tersedia (nama kembar muncul sebanyak sisanya)
var DAFTAR_BUKA = true;

function namaResmi(n) {
  n = n.trim().toLowerCase();
  for (var i = 0; i < DAFTAR.length; i++) if (DAFTAR[i].toLowerCase() === n) return DAFTAR[i];
  return '';
}
function cekDaftar() {
  var n = $('df-nama').value.trim(), k = $('df-kelas').value, p = $('df-pw').value, p2 = $('df-pw2').value;
  var nm = namaResmi(n);
  setGalat('dg-nama', n && !nm ? 'Nama tidak ada di daftar. Pilih dari saran.' : '');
  $('df-hitung').textContent = p.length + '/' + PANJANG_PW;
  setGalat('dg-pw', p && p.length < PANJANG_PW ? 'Password harus ' + PANJANG_PW + ' karakter' : '');
  setGalat('dg-pw2', p2 && p2 !== p ? 'Password tidak sama' : '');
  $('df-daftar').disabled = !(DAFTAR_BUKA && nm && k && p.length === PANJANG_PW && p2 === p);
  return nm;
}
function muatNama() {
  $('df-status').textContent = 'Memuat daftar nama...';
  return api('namaTersedia').then(function (r) {
    if (r && r.ok) {
      DAFTAR = [];
      (r.nama || []).forEach(function (x) { for (var i = 0; i < x.sisa; i++) DAFTAR.push(x.nama); });
      DAFTAR_BUKA = r.buka !== false;
      $('df-status').textContent = DAFTAR_BUKA ? '' : 'Pendaftaran sedang ditutup oleh guru.';
    } else {
      $('df-status').textContent = (r && r.pesan) || 'Gagal memuat daftar nama.';
    }
    cekDaftar();
  });
}
PAGES.daftar = {
  buka: function () {
    ['df-nama', 'df-pw', 'df-pw2'].forEach(function (id) { $(id).value = ''; });
    $('df-kelas').value = '';
    ['dg-umum'].forEach(function (id) { setGalat(id, ''); });
    ['df-pw', 'df-pw2'].forEach(function (id) { $(id).type = 'password'; });
    document.querySelectorAll('#h-daftar .mata').forEach(function (m) { m.textContent = '👁️'; });
    cekDaftar(); muatNama();
  }
};
INIT.push(function () {
  isiKelas($('df-kelas'));
  pasangSaran($('df-nama'), $('df-saran'), function () { return DAFTAR; }, function () { cekDaftar(); });
  $('df-nama').addEventListener('input', cekDaftar);
  $('df-kelas').addEventListener('change', cekDaftar);
  ['df-pw', 'df-pw2'].forEach(function (id) {
    $(id).addEventListener('input', function () { this.value = this.value.replace(/[^A-Za-z0-9]/g, ''); cekDaftar(); });
  });
  $('df-kembali').onclick = function () { go('login'); };
  $('df-daftar').onclick = async function () {
    var nm = cekDaftar();
    if ($('df-daftar').disabled) return;
    var kelas = $('df-kelas').value;
    setGalat('dg-umum', '');
    var b = $('df-daftar'); sibuk(b, true, 'Mendaftarkan...');
    var r = await api('daftar', { nama: nm, kelas: kelas, password: $('df-pw').value });
    b.disabled = false; b.textContent = 'Daftar';
    if (r && r.ok) {
      await info('Berhasil daftar', 'Silakan masuk.');
      S.prefill = { nama: nm, kelas: kelas }; simpan(); go('login');
    } else {
      setGalat('dg-umum', (r && r.pesan) || 'Gagal mendaftar. Coba lagi.');
      muatNama();
    }
  };
});

// ===================== MULAI =====================
function boot() {
  if (MODE_UJIAN) document.title = 'Ujian - ' + SEKOLAH;
  if (MODE_GURU) { document.title = 'Guru - ' + SEKOLAH; $('gl-kembali').style.display = 'none'; }
  document.querySelectorAll('.versi').forEach(function (e) { e.textContent = VERSI; });
  document.querySelectorAll('.js-sekolah').forEach(function (e) { e.textContent = SEKOLAH; });
  INIT.forEach(function (f) { f(); });
  var h = S.hal;
  if (MODE_UJIAN && h !== 'materi' && S.param !== 'ujian') h = S.token ? 'materi' : null;
  if (h && h !== 'login' && h !== 'daftar' && h !== 'guruLogin' && S.token && $('h-' + h)) go(h, S.param);
  else go(HALAMAN_MASUK);
}
window.addEventListener('load', boot);


// ===================== HALAMAN PILIH MATERI =====================
var STATUS_MATERI = {};
var LABEL_STATUS = { terkunci: 'Terkunci', dikerjakan: 'Sedang dikerjakan', menunggu: 'Menunggu dicek', nilai: 'Nilai tampil' };

function semuaNilaiSt(st) {
  var all = [];
  if (st.nilai !== '' && st.nilai != null) all.push(st.nilai);
  (st.remedi || []).forEach(function (x) { all.push(x); });
  return all;
}
function tertinggiSt(all) {
  var a = all.map(Number).filter(function (x) { return !isNaN(x); });
  return a.length ? Math.max.apply(null, a) : '';
}
function barisNilai(st) {
  var h = '', all = semuaNilaiSt(st);
  if (all.length) {
    h += '<div class="nilai-deret">';
    all.forEach(function (v, i) {
      if (i === 0) h += '<div class="nilai-sel"><small>Awal</small><b>' + esc(v) + '</b></div>';
      else h += '<div class="nilai-sel"><small>Remedi</small><small>' + i + '</small><b>' + esc(v) + '</b></div>';
    });
    if (all.length > 1) h += '<div class="nilai-sel tertinggi"><small>Tertinggi</small><b>' + esc(tertinggiSt(all)) + '</b></div>';
    h += '</div>';
  }
  if (st.diminta) h += '<div class="nl" style="color:var(--oranye);font-weight:600">Permintaan remedi menunggu persetujuan guru</div>';
  return h;
}
function ringkasNilai(st) {
  var all = semuaNilaiSt(st), t = '';
  all.forEach(function (v, i) { t += (i === 0 ? 'Nilai awal' : 'Nilai remedi ' + i) + ': ' + v + '\n'; });
  if (all.length > 1) t += 'Nilai tertinggi (dihitung): ' + tertinggiSt(all) + '\n';
  return t.replace(/\n$/, '');
}
function gambarMateri() {
  var h = '';
  var urut = MATERI.slice().sort(function (a, b) {
    var sa = STATUS_MATERI[a.id] || {}, sb = STATUS_MATERI[b.id] || {};
    var pa = sa.status === 'nilai' ? 0 : 1;
    var pb = sb.status === 'nilai' ? 0 : 1;
    return pa - pb;
  });
  urut.forEach(function (m) {
    if (MODE_UJIAN && m.id !== 'ujian') return;             // link ujian: hanya materi ujian
    if (m.id === 'ujian' && !STATUS_MATERI.ujian) return;   // materi ujian disembunyikan guru
    var st = STATUS_MATERI[m.id] || { status: 'terkunci' };
    var label = LABEL_STATUS[st.status] || 'Terkunci';
    h += '<div class="kartu"><button class="kartu-materi" data-id="' + m.id + '">' +
      '<div class="ikon">' + m.ikon + '</div>' +
      '<div class="isi"><b>' + esc(m.judul) + '</b>' +
      '<span class="lencana ' + st.status + '">' + esc(label) + '</span>' + barisNilai(st) + '</div></button></div>';
  });
  if (MODE_UJIAN && !h) h = '<p class="tengah">Ujian belum dibuka oleh guru. Tunggu guru membukanya.</p>';
  $('mt-daftar').innerHTML = h;
}

function muatStatusMateri() {
  $('mt-info').textContent = 'Memuat status materi...';
  return api('statusMateri').then(function (r) {
    if (r && r.ok) { STATUS_MATERI = r.materi || {}; $('mt-info').textContent = ''; simpanLokal('app_status', STATUS_MATERI); }
    else { STATUS_MATERI = bacaLokal('app_status', {}); $('mt-info').textContent = (r && r.pesan) || 'Gagal memuat status.'; }
    gambarMateri();
  });
}

// Kotak input kode (hasilnya teks kode, atau null bila dibatalkan)
function mintaKode(judulMateri, pesanGalat) {
  return new Promise(function (res) {
    dialogTerbuka++;
    var o = document.createElement('div'); o.className = 'overlay';
    o.innerHTML = '<div class="modal"><h3>Masukkan kode</h3>' +
      '<p>Masukkan kode untuk membuka soal ' + esc(judulMateri) + '.</p>' +
      '<input class="isian input-kode" type="text" autocomplete="off" autocapitalize="off" placeholder="Kode soal" style="margin-top:10px">' +
      '<div class="galat">' + esc(pesanGalat || '') + '</div>' +
      '<button class="btn ok">Buka</button><button class="btn sekunder batal">Batal</button></div>';
    document.body.appendChild(o);
    var inp = o.querySelector('input');
    function tutup(v) { document.body.removeChild(o); dialogTerbuka--; res(v); }
    o.querySelector('.ok').onclick = function () {
      var v = inp.value.trim();
      if (!v) { o.querySelector('.galat').textContent = 'Kode belum diisi.'; return; }
      tutup(v);
    };
    o.querySelector('.batal').onclick = function () { tutup(null); };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') o.querySelector('.ok').click(); });
    setTimeout(function () { inp.focus(); }, 100);
  });
}

async function bukaMateri(id) {
  var m = MATERI.filter(function (x) { return x.id === id; })[0];
  var st = STATUS_MATERI[id] || { status: 'terkunci' };

  if (st.status === 'menunggu') { info('Sudah dikirim', 'Jawaban ' + m.judul + ' sudah terkirim.\nNilai akan tampil setelah guru memeriksanya.'); return; }
  if (st.status === 'nilai') {
    if (id === 'ujian') { info('Nilai ' + m.judul, 'Nilai ujianmu: ' + (st.nilai !== undefined && st.nilai !== '' ? st.nilai : '-')); return; }
    if (st.diminta) { info('Nilai ' + m.judul, ringkasNilai(st) + '\n\nPermintaan remedi sudah dikirim. Menunggu persetujuan guru.'); return; }
    var pil = await dialog('Nilai ' + m.judul, ringkasNilai(st) + '\n\nJika ingin remedi, tekan tombol ini.', [
      { t: 'Minta Remedi', v: true }, { t: 'Tutup', v: false, g: 'sekunder' }
    ]);
    if (!pil) return;
    var rm = await api('mintaRemedi', { materi: id });
    if (rm && rm.ok) { st.diminta = true; STATUS_MATERI[id] = st; simpanLokal('app_status', STATUS_MATERI); gambarMateri(); toast('Permintaan remedi dikirim ke guru'); }
    else info('Gagal meminta remedi', (rm && rm.pesan) || 'Coba lagi.');
    return;
  }
  if (st.status === 'dikerjakan') { if (id === 'ujian') await ujianGerbang(false); go('soal', id); return; }

  // Terkunci: minta kode
  var galat = '';
  while (true) {
    var kode = await mintaKode(m.judul, galat);
    if (kode === null) return;
    var r = await api('cekKode', { materi: id, kode: kode });
    if (r && r.ok) {
      STATUS_MATERI[id] = { status: 'dikerjakan', percobaan: r.percobaan || 1, nilai: (STATUS_MATERI[id] || {}).nilai, remedi: (STATUS_MATERI[id] || {}).remedi }; simpanLokal('app_status', STATUS_MATERI);
      if (id === 'ujian') await ujianGerbang(true);
      go('soal', id); return;
    }
    if (r && r.ditutup) { info('Materi ditutup', r.pesan || 'Materi ini sedang ditutup oleh guru.'); return; }
    galat = (r && r.pesan) || 'Kode salah.';
    if (r && r.offline) { info('Tidak ada sinyal', 'Coba lagi setelah sinyal kembali.'); return; }
  }
}

PAGES.materi = {
  buka: function () {
    var m = S.murid || {};
    $('mt-nama').textContent = m.nama || '';
    $('mt-kelas').textContent = 'Kelas ' + (m.kelas || '');
    $('mt-pindah').textContent = (m.kelasSoal && m.kelasSoal !== m.kelas) ? 'Kelasmu sekarang ' + m.kelas + ' (dipindah guru). Kode soal mengikuti kelas barumu.' : '';
    STATUS_MATERI = bacaLokal('app_status', {});
    gambarMateri();
    muatStatusMateri();
  }
};
INIT.push(function () {
  $('mt-keluar').onclick = function () { keluar(); };
  $('mt-daftar').addEventListener('click', function (e) {
    var b = e.target.closest('.kartu-materi');
    if (b) bukaMateri(b.dataset.id);
  });
});


// ===================== HALAMAN SOAL =====================
var ST = { materi: '', murid: '', soal: [], jawab: [], foto: [], lokal: {}, waktu: [], ver: [], kotor: {}, up: {}, idx: 0 };

function bankSkr() { return BANK_SOAL[ST.materi]; }
function soalSkr() { return ST.soal[ST.idx]; }
function terisi(i) {
  var j = ST.jawab[i];
  if (Array.isArray(j)) return j.some(function (x) { return String(x || '').trim() !== ''; });
  return String(j || '').trim() !== '';
}
function jmlFoto(i) { return (ST.foto[i] || []).filter(Boolean).length; }
function perluFoto(i) {
  var b = BANK_SOAL[ST.materi];
  if (b && b.perluFotoSoal) { var s = ST.soal[i == null ? ST.idx : i]; return s ? b.perluFotoSoal(s) : true; }
  return !(b && b.perluFoto === false);
}
function kunciLokal() { return 'draf|' + ST.murid + '|' + ST.materi + (ST.pc > 1 ? '|r' + ST.pc : ''); }
function normal(s, j) {
  if (Array.isArray(s.kunci)) {
    var a = Array.isArray(j) ? j.slice() : (typeof j === 'string' && j !== '' ? j.split(',') : []);
    while (a.length < s.kunci.length) a.push('');
    return a.slice(0, s.kunci.length).map(function (x) { return String(x == null ? '' : x); });
  }
  return j == null ? '' : String(j);
}
function simpanDrafLokal() { simpanLokal(kunciLokal(), { jawab: ST.jawab, foto: ST.foto, waktu: ST.waktu }); }
function setSimpan(t, gagal) { var e = $('sl-simpan'); e.textContent = t; e.className = 'simpan' + (gagal ? ' gagal' : ''); }

function ubah(i) {
  ST.waktu[i] = Date.now(); ST.ver[i] = (ST.ver[i] || 0) + 1; ST.kotor[i] = 1;
  simpanDrafLokal(); setSimpan('Belum tersimpan');
}

// ---------- Kirim draf ke sheet ----------
async function kirimDraf(i) {
  var v = ST.ver[i] || 0;
  setSimpan('Menyimpan...');
  var r = await api('simpanDraf', {
    materi: ST.materi, soal: i + 1, jawaban: ST.jawab[i], foto: ST.foto[i] || [], waktu: ST.waktu[i] || Date.now()
  });
  if (r && r.ok) {
    if ((ST.ver[i] || 0) === v) delete ST.kotor[i];
    setSimpan(Object.keys(ST.kotor).length ? 'Belum tersimpan' : 'Tersimpan ✓');
    return true;
  }
  setSimpan('Belum tersimpan', true);
  return false;
}
async function flushDraf() {
  var ok = true, ks = Object.keys(ST.kotor);
  for (var k = 0; k < ks.length; k++) { if (!(await kirimDraf(Number(ks[k])))) ok = false; }
  return ok;
}
var tDebounce;
function jadwalSimpan() { clearTimeout(tDebounce); tDebounce = setTimeout(function () { if (ST.kotor[ST.idx]) kirimDraf(ST.idx); }, 3000); }

// ---------- Tampilan ----------
function gambarBulatan() {
  var h = '';
  for (var i = 0; i < ST.soal.length; i++) {
    var c = 'b';
    if (terisi(i)) c += (!perluFoto(i) || jmlFoto(i) > 0) ? ' isi' : ' warn';
    if (i === ST.idx) c += ' kini';
    h += '<button class="' + c + '" data-i="' + i + '">' + (i + 1) + '</button>';
  }
  $('sl-bul').innerHTML = h;
}
function gambarSoal() {
  var s = soalSkr(), j = ST.jawab[ST.idx], inpMode = (s.input.izin === 'bin' || s.input.izin === 'des') ? 'numeric' : 'text';
  $('sl-no').textContent = 'Soal ' + (ST.idx + 1) + ' dari ' + ST.soal.length;
  $('sl-tingkat').textContent = 'Tingkat: ' + s.tingkat;
  $('sl-teks').textContent = s.teks;
  var tampil = '', jawab = '';
  function kotak(k, val) {
    return '<input class="isian" data-k="' + k + '" type="text" inputmode="' + inpMode + '" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(val) + '">';
  }
  if (s.jenis === 'kata2bin') {
    tampil = '<div class="besar">' + esc(s.tampil) + '</div>';
    s.kotak.forEach(function (kt, k) { jawab += '<div class="baris"><span class="huruf">' + esc(kt.label) + '</span>' + kotak(k, j[k]) + '</div>'; });
  } else if (s.jenis === 'bin2kata') {
    s.tampil.forEach(function (b, k) { jawab += '<div class="baris"><span class="bin">' + esc(b) + '</span>' + kotak(k, j[k]) + '</div>'; });
  } else {
    tampil = s.tampil ? '<div class="besar">' + esc(s.tampil) + '</div>' : '';
    jawab = kotak(-1, j);
  }
  $('sl-tampil').innerHTML = tampil;
  $('sl-jawab').innerHTML = jawab;
  var tb = '';
  if (ST.materi === 'hurufbiner' || (ST.materi === 'ujian' && soalSkr() && soalSkr().modul === 'hurufbiner')) {
    tb = '<details><summary>📋 Tabel kode huruf</summary><div class="tabel-kode"><table><tr><th>Huruf</th><th>Kode</th></tr>';
    BANK_SOAL.hurufbiner.tabel.forEach(function (t) { tb += '<tr><td>' + t.huruf + '</td><td>' + t.kode + '</td></tr>'; });
    tb += '</table></div></details>';
  }
  $('sl-tabel').innerHTML = tb;
}
function gambarFoto() {
  var i = ST.idx, h = '', n = 0;
  for (var sl = 0; sl < 2; sl++) {
    var u = (ST.foto[i] || [])[sl], key = i + '-' + sl;
    if (ST.up[key]) { h += '<div class="fto">Mengunggah...</div>'; n++; }
    else if (u) {
      h += '<div class="fto"><img data-zoom="' + sl + '" src="' + esc(ST.lokal[key] || u) + '" alt="Foto ' + (sl + 1) + '"><button class="hapus" data-hapus="' + sl + '">✕</button></div>'; n++;
    }
  }
  if (n < 2) h += '<button class="tambah-foto" id="sl-tambah">📷<br>Ambil / pilih foto</button>';
  $('sl-foto').innerHTML = h;
  var t = $('sl-tambah'); if (t) t.onclick = function () { ujianFotoMulai(); $('sl-file').click(); };
}
function render() {
  $('sl-judul').textContent = bankSkr().judul;
  gambarBulatan(); gambarSoal(); gambarFoto();
  $('sl-kartu-foto').style.display = perluFoto() ? '' : 'none';
  setGalat('sl-fgalat', '');
  $('sl-prev').disabled = ST.idx === 0;
  var akhir = ST.idx === ST.soal.length - 1, nx = $('sl-next');
  nx.textContent = akhir ? 'Selesai' : 'Berikutnya';
  nx.className = 'btn' + (akhir ? ' hijau' : '');
}

// ---------- Navigasi dan kunci ----------
function bolehPergi() {
  var i = ST.idx;
  if (Object.keys(ST.up).length) { toast('Tunggu foto selesai diunggah'); return false; }
  if (perluFoto(i) && terisi(i) && jmlFoto(i) === 0) { info('Foto belum ada', 'Unggah foto pengerjaan dulu sebelum pindah.'); return false; }
  if (ST.kotor[i]) kirimDraf(i).then(function (ok) { if (!ok) toast('Gagal menyimpan, coba lagi'); });
  return true;
}
function pindah(k) {
  if (k === ST.idx || k < 0 || k >= ST.soal.length) return;
  if (!bolehPergi()) return;
  ST.idx = k; S.soalIdx = k; simpan(); render(); window.scrollTo(0, 0);
}

// ---------- Foto ----------
function kecilkan(file) {
  return new Promise(function (res, rej) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var sk = Math.min(1, 1024 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * sk); c.height = Math.round(img.height * sk);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = function () { URL.revokeObjectURL(url); rej(); };
    img.src = url;
  });
}
async function tanganiFile(file) {
  var i = ST.idx, f = ST.foto[i] = ST.foto[i] || [null, null], sl = -1;
  for (var k = 0; k < 2; k++) if (!f[k] && !ST.up[i + '-' + k]) { sl = k; break; }
  if (sl < 0) { toast('Maksimal 2 foto'); return; }
  var key = i + '-' + sl;
  setGalat('sl-fgalat', '');
  var data;
  try { data = await kecilkan(file); } catch (e) { setGalat('sl-fgalat', 'Foto tidak bisa dibaca. Coba foto lain.'); return; }
  ST.up[key] = true; gambarFoto();
  var r = await api('unggahFoto', { materi: ST.materi, soal: i + 1, nomor: sl + 1, data: data.split(',')[1] });
  delete ST.up[key];
  if (r && r.ok) {
    ST.foto[i][sl] = r.url; ST.lokal[key] = data; ubah(i); kirimDraf(i);
  } else setGalat('sl-fgalat', (r && r.pesan) || 'Gagal mengunggah foto. Coba lagi.');
  if (ST.idx === i) { gambarFoto(); gambarBulatan(); }
}
async function hapusFoto(sl) {
  var i = ST.idx;
  if (!(await tanya('Hapus foto ini?', '', 'Hapus', 'Batal'))) return;
  var r = await api('hapusFoto', { materi: ST.materi, soal: i + 1, nomor: sl + 1 });
  if (r && r.ok) { ST.foto[i][sl] = null; delete ST.lokal[i + '-' + sl]; ubah(i); kirimDraf(i); gambarFoto(); gambarBulatan(); }
  else setGalat('sl-fgalat', (r && r.pesan) || 'Gagal menghapus foto. Coba lagi.');
}
function zoomFoto(src) {
  dialogTerbuka++;
  var o = document.createElement('div'); o.className = 'overlay';
  o.innerHTML = '<img class="zoom" src="' + esc(src) + '">';
  o.onclick = function () { document.body.removeChild(o); dialogTerbuka--; };
  document.body.appendChild(o);
}

// ---------- Memulai halaman soal ----------
async function mulaiSoal(id) {
  var m = S.murid || {}, pc = ((STATUS_MATERI[id] || bacaLokal('app_status', {})[id] || {}).percobaan) || 1;
  var idMurid = String(m.nama || '').toLowerCase() + '|' + (m.kelasSoal || m.kelas) + (pc > 1 ? '|r' + pc : '');
  if (ST.materi === id && ST.murid === idMurid && ST.soal.length) { ST.idx = Math.min(S.soalIdx || ST.idx, ST.soal.length - 1); render(); return; }
  ST = { materi: id, pc: pc, murid: m.id || idMurid, soal: BANK_SOAL[id].buat(idMurid), jawab: [], foto: [], lokal: {}, waktu: [], ver: [], kotor: {}, up: {}, idx: 0 };
  var lok = bacaLokal(kunciLokal(), null);
  ST.soal.forEach(function (s, i) {
    ST.jawab[i] = normal(s, lok && lok.jawab ? lok.jawab[i] : '');
    ST.foto[i] = (lok && lok.foto && lok.foto[i]) ? lok.foto[i] : [null, null];
    ST.waktu[i] = (lok && lok.waktu && lok.waktu[i]) || 0;
  });
  ST.idx = Math.min(S.soalIdx || 0, ST.soal.length - 1);
  render(); setSimpan('');
  var r = await api('ambilDraf', { materi: id });
  if (r && r.ok && ST.materi === id) {
    var baru = false;
    (r.draf || []).forEach(function (d) {
      var i = d.soal - 1; if (!ST.soal[i]) return;
      if ((d.waktu || 0) > (ST.waktu[i] || 0)) {
        ST.jawab[i] = normal(ST.soal[i], d.jawaban);
        ST.foto[i] = [(d.foto || [])[0] || null, (d.foto || [])[1] || null];
        ST.waktu[i] = d.waktu; baru = true;
      } else if ((ST.waktu[i] || 0) > (d.waktu || 0)) { ST.kotor[i] = 1; }
    });
    simpanDrafLokal();
    if (baru) toast('Draf terbaru dari sheet dipakai');
    render(); if (Object.keys(ST.kotor).length) flushDraf();
  }
}
PAGES.soal = {
  buka: function (param) {
    var id = (param && typeof param === 'object') ? param.materi : param;
    if (!id) id = ST.materi;
    if (!id || !BANK_SOAL[id]) { go('materi'); return; }
    if (param && typeof param === 'object' && param.idx != null) S.soalIdx = param.idx;
    else if (ST.materi !== id) S.soalIdx = 0;
    mulaiSoal(id);
  }
};

INIT.push(function () {
  $('sl-prev').onclick = function () { pindah(ST.idx - 1); };
  $('sl-next').onclick = function () {
    if (ST.idx < ST.soal.length - 1) { pindah(ST.idx + 1); return; }
    if (!bolehPergi()) return;
    go('selesai', ST.materi);
  };
  $('sl-bul').addEventListener('click', function (e) {
    var b = e.target.closest('.b'); if (b) pindah(Number(b.dataset.i));
  });
  $('sl-jawab').addEventListener('input', function (e) {
    var inp = e.target; if (inp.tagName !== 'INPUT') return;
    var s = soalSkr(), i = ST.idx, k = Number(inp.dataset.k);
    var v = bankSkr().bersihkanJawaban(s, inp.value);
    inp.value = v;
    if (k < 0) ST.jawab[i] = v; else ST.jawab[i][k] = v;
    ubah(i); gambarBulatan(); jadwalSimpan();
    if (s.jenis === 'bin2kata' && v) {
      var nx = $('sl-jawab').querySelector('input[data-k="' + (k + 1) + '"]'); if (nx) nx.focus();
    }
  });
  $('sl-foto').addEventListener('click', function (e) {
    var h = e.target.closest('[data-hapus]'); if (h) { hapusFoto(Number(h.dataset.hapus)); return; }
    var z = e.target.closest('[data-zoom]'); if (z) zoomFoto(z.src);
  });
  $('sl-file').addEventListener('change', function () {
    ujianFotoSelesai();
    var f = this.files && this.files[0]; this.value = ''; if (f) tanganiFile(f);
  });
  $('sl-file').addEventListener('cancel', function () { ujianFotoSelesai(); });
  // Coba ulang simpan otomatis bila sinyal sempat putus
  setInterval(function () { if (S.hal === 'soal' && Object.keys(ST.kotor).length) flushDraf(); }, 15000);
  window.addEventListener('online', function () { if (Object.keys(ST.kotor).length) flushDraf(); });
});


// ===================== HALAMAN SELESAI =====================
var PESAN_DEF = [
  'Hebat! Kamu sudah menyelesaikan semua soal.',
  'Kerja bagus! Usaha kamu pasti membuahkan hasil.',
  'Mantap! Tinggal satu langkah lagi.',
  'Terus semangat, kamu sudah berusaha dengan baik!'
];
var PESAN_SEMANGAT = bacaLokal('app_semangat', PESAN_DEF);
function idMateri(p) { return (p && typeof p === 'object') ? p.materi : p; }
function statusLokal(id) { return (bacaLokal('app_status', {})[id] || {}).status || 'terkunci'; }

function gambarRingkasan() {
  var h = '', kosong = 0;
  for (var i = 0; i < ST.soal.length; i++) {
    var t = terisi(i), f = jmlFoto(i);
    if (!t) kosong++;
    var ket = !t ? '<span class="kosong">Kosong</span>'
      : (!perluFoto(i) ? '<span class="ok">✓ Terisi</span>'
      : (f > 0 ? '<span class="ok">✓ Terisi · ' + f + ' foto</span>' : '<span class="warn">Foto belum ada</span>'));
    h += '<button class="ring-item" data-i="' + i + '"><span>Soal ' + (i + 1) + '</span>' + ket + '</button>';
  }
  $('sx-ring').innerHTML = h;
  $('sx-judul').textContent = 'Ringkasan ' + bankSkr().judul + ' (' + (ST.soal.length - kosong) + '/' + ST.soal.length + ' terisi)';
}

PAGES.selesai = {
  buka: async function (param) {
    var id = idMateri(param) || ST.materi;
    if (!id || !BANK_SOAL[id]) { go('materi'); return; }
    var st = statusLokal(id);
    if (st === 'menunggu' || st === 'nilai') { go('materi'); return; }
    if (ST.materi !== id || !ST.soal.length) await mulaiSoal(id);
    gambarRingkasan();
    $('sx-semangat').textContent = PESAN_SEMANGAT[Math.floor(Math.random() * PESAN_SEMANGAT.length)];
    api('pesanPenyemangat').then(function (r) {
      if (r && r.ok && r.pesan && r.pesan.length) { PESAN_SEMANGAT = r.pesan; simpanLokal('app_semangat', r.pesan); }
    });
  }
};

// ===================== HALAMAN KIRIM =====================
var KR = { mulai: false, jalan: false, ok: false, tmr: null, p: 0 };
function tunggu(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function setP(p) { KR.p = p; $('kr-bar').style.width = p + '%'; $('kr-persen').textContent = Math.round(p) + '%'; }
function naik(maks) {
  clearInterval(KR.tmr);
  KR.tmr = setInterval(function () { if (KR.p < maks) setP(Math.min(maks, KR.p + 1)); }, 120);
}
function tahap(t) { $('kr-tahap').textContent = t; }
function tampilKirim(mode) {
  $('kr-proses').style.display = mode === 'proses' ? 'block' : 'none';
  $('kr-gagal').style.display = mode === 'gagal' ? 'block' : 'none';
  $('kr-sukses').style.display = mode === 'sukses' ? 'block' : 'none';
}
function gagalKirim(pesan) {
  clearInterval(KR.tmr); KR.jalan = false;
  $('kr-pesan').textContent = pesan; tampilKirim('gagal');
}
function suksesKirim(id) {
  clearInterval(KR.tmr); KR.jalan = false; KR.ok = true;
  var sm = bacaLokal('app_status', {}); sm[id] = { status: 'menunggu' }; simpanLokal('app_status', sm);
  if (typeof STATUS_MATERI !== 'undefined') STATUS_MATERI[id] = { status: 'menunggu' };
  clearTimeout(tDebounce);
  hapusLokal(kunciLokal());
  ST = { materi: '', murid: '', soal: [], jawab: [], foto: [], lokal: {}, waktu: [], ver: [], kotor: {}, up: {}, idx: 0 };
  S.soalIdx = 0; simpan();
  tampilKirim('sukses');
}
async function jalankanKirim(id) {
  KR.jalan = true; KR.ok = false;
  tampilKirim('proses'); setP(0);

  tahap('Menyimpan jawaban...'); naik(35);
  var ok = await flushDraf();
  if (!ok) { gagalKirim('Jawaban belum tersimpan. Periksa sinyal lalu coba lagi.'); return; }

  setP(40); tahap('Mengecek foto...'); naik(65);
  await tunggu(700);
  var bad = [];
  for (var i = 0; i < ST.soal.length; i++) if (perluFoto(i) && terisi(i) && jmlFoto(i) === 0) bad.push(i + 1);
  if (bad.length) { gagalKirim('Soal nomor ' + bad.join(', ') + ' belum ada foto pengerjaan.'); return; }

  setP(70); tahap('Mengirim ke sheet...'); naik(95);
  var r = await api('kirim', { materi: id, jawaban: ST.jawab, foto: ST.foto, waktu: Date.now() });
  clearInterval(KR.tmr);
  if (r && r.ok) {
    setP(100); tahap('Selesai'); await tunggu(600);
    suksesKirim(id);
  } else {
    gagalKirim((r && r.pesan) || 'Tidak ada sinyal atau server sibuk.');
  }
}
PAGES.kirim = {
  buka: function (param) {
    var id = idMateri(param) || ST.materi;
    if (KR.mulai) { KR.mulai = false; jalankanKirim(id); return; }
    if (KR.jalan) return;                       // masih berjalan, tetap di layar ini
    if (KR.ok && statusLokal(id) === 'menunggu') { tampilKirim('sukses'); return; }
    go('selesai', id);                          // halaman dimuat ulang: kembali ke layar Selesai
  }
};

// Soal yang sudah terkirim tidak bisa dibuka lagi
(function () {
  var asli = PAGES.soal.buka;
  PAGES.soal.buka = function (param) {
    var id = idMateri(param) || ST.materi, st = statusLokal(id);
    if (st === 'menunggu' || st === 'nilai') { toast('Soal ini sudah terkirim'); go('materi'); return; }
    asli(param);
  };
})();

INIT.push(function () {
  $('sx-ring').addEventListener('click', function (e) {
    var b = e.target.closest('.ring-item');
    if (b) go('soal', { materi: ST.materi, idx: Number(b.dataset.i) });
  });
  $('sx-kembali').onclick = function () { go('soal', { materi: ST.materi, idx: S.soalIdx || 0 }); };
  $('sx-kirim').onclick = async function () {
    var id = ST.materi, bad = [], kosong = 0;
    for (var i = 0; i < ST.soal.length; i++) {
      if (!terisi(i)) kosong++;
      else if (perluFoto(i) && jmlFoto(i) === 0) bad.push(i + 1);
    }
    if (bad.length) { info('Foto belum ada', 'Soal nomor ' + bad.join(', ') + ' belum ada foto pengerjaan.'); return; }
    var isi = 'Setelah dikirim, jawaban tidak bisa diubah.' +
      (kosong ? '\n\n' + kosong + ' soal masih kosong (nilainya nol).' : '');
    if (!(await tanya('Yakin kirim?', isi, 'Ya, kirim', 'Batal'))) return;
    KR.mulai = true; go('kirim', id);
  };
  $('kr-ulang').onclick = function () { jalankanKirim(ST.materi); };
  $('kr-soal').onclick = function () { go('soal', { materi: ST.materi, idx: S.soalIdx || 0 }); };
  $('kr-materi').onclick = function () { if (MODE_UJIAN) keluar(); else go('materi'); };   // tablet ujian: setelah kirim, kembali ke halaman masuk untuk murid berikutnya
  if (MODE_UJIAN) $('kr-materi').textContent = 'Selesai';
});


// ===================== MODE GURU =====================
function cekGuru() { if (S.role !== 'guru' || !S.token) { go(HALAMAN_MASUK); return false; } return true; }
function urutNama(a, b) { return String(a.nama).localeCompare(String(b.nama), 'id'); }

// ---------- Login guru ----------
PAGES.guruLogin = { buka: function () { $('gl-kode').value = ''; setGalat('gl-galat', ''); } };
INIT.push(function () {
  $('gl-kembali').onclick = function () { go(HALAMAN_MASUK); };
  $('gl-kode').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('gl-masuk').click(); });
  $('gl-masuk').onclick = async function () {
    var kode = $('gl-kode').value.trim();
    if (!kode) { setGalat('gl-galat', 'Masukkan kode guru.'); return; }
    var b = $('gl-masuk'); sibuk(b, true, 'Memeriksa...'); setGalat('gl-galat', '');
    var r = await api('guruLogin', { kode: kode });
    sibuk(b, false);
    if (r && r.ok) { S.role = 'guru'; S.token = r.token; S.murid = null; simpan(); go('guruMenu'); }
    else setGalat('gl-galat', (r && r.pesan) || 'Kode salah.');
  };
});

// ---------- Menu guru ----------
PAGES.guruMenu = { buka: function () { cekGuru(); } };
INIT.push(function () {
  document.querySelector('#h-guruMenu .menu-grid').addEventListener('click', function (e) {
    var b = e.target.closest('.menu-kartu'); if (b) go(b.dataset.go);
  });
  $('gm-keluar').onclick = function () { keluar(); };
});

// ---------- Daftar kelas ----------
function muatKelas() {
  var k = $('gk-kelas').value;
  if (!k) { $('gk-tabel').innerHTML = ''; $('gk-info').textContent = 'Pilih kelas untuk melihat daftar murid.'; return; }
  $('gk-info').textContent = 'Memuat...'; $('gk-tabel').innerHTML = '';
  api('guruKelas', { kelas: k }).then(function (r) {
    if (!(r && r.ok)) { $('gk-info').textContent = (r && r.pesan) || 'Gagal memuat.'; return; }
    var m = (r.murid || []).slice().sort(urutNama);
    $('gk-info').textContent = 'Kelas ' + k + ': ' + m.length + ' murid';
    var h = '<table class="tbl"><colgroup><col style="width:10%"><col style="width:55%"><col style="width:35%"></colgroup><tr><th>No</th><th>Nama</th><th>Password</th></tr>';
    m.forEach(function (x, i) { h += '<tr><td>' + (i + 1) + '</td><td>' + esc(x.nama) + '</td><td class="pw">' + esc(x.password || '(reset)') + '</td></tr>'; });
    $('gk-tabel').innerHTML = h + '</table>';
  });
}
PAGES.guruKelas = { buka: function () { if (!cekGuru()) return; muatKelas(); } };
INIT.push(function () {
  isiKelas($('gk-kelas'));
  $('gk-kelas').onchange = muatKelas;
  $('gk-kembali').onclick = function () { go('guruMenu'); };
});

// ---------- Kelola murid ----------
var GU = { murid: [], pilih: null, siap: false };
function gambarDaftarMurid() {
  var q = $('gu-cari').value.trim().toLowerCase();
  if (!q) {
    $('gu-info').textContent = GU.siap ? 'Ketik awal nama murid untuk mencari.' : 'Memuat data murid...';
    $('gu-daftar').innerHTML = '';
    return;
  }
  var h = GU.murid.filter(function (m) { return m.nama.toLowerCase().indexOf(q) === 0; });
  $('gu-info').textContent = GU.siap ? h.length + ' murid' + (h.length > 40 ? ' (40 pertama ditampilkan)' : '') : 'Memuat daftar murid...';
  $('gu-daftar').innerHTML = h.slice(0, 40).map(function (m) {
    return '<button class="item-murid' + (GU.pilih && GU.pilih.id === m.id ? ' pilih' : '') + '" data-id="' + esc(m.id) + '"><span>' + esc(m.nama) + '</span><small>' + esc(m.kelas) + '</small></button>';
  }).join('');
}
function gambarEdit() {
  var m = GU.pilih;
  $('gu-edit').style.display = m ? 'block' : 'none';
  if (!m) return;
  $('gu-nama').textContent = m.nama;
  $('gu-detail').textContent = 'Kelas ' + m.kelas + ' · Password sekarang: ' + (m.password || '(kosong, murid atur sendiri)') + (m.kelasSoal && m.kelasSoal !== m.kelas ? ' · Kelas soal: ' + m.kelasSoal : '');
  $('gu-pw').value = ''; $('gu-kelas').value = m.kelas; setGalat('gu-galat', '');
}
PAGES.guruMurid = {
  buka: function () {
    if (!cekGuru()) return;
    GU.pilih = null; $('gu-cari').value = ''; gambarEdit(); GU.siap = false; gambarDaftarMurid();
    api('guruSemuaMurid').then(function (r) {
      if (r && r.ok) { GU.murid = (r.murid || []).slice().sort(urutNama); GU.siap = true; }
      else toast((r && r.pesan) || 'Gagal memuat murid');
      gambarDaftarMurid();
    });
  }
};
INIT.push(function () {
  isiKelas($('gu-kelas'));
  $('gu-kembali').onclick = function () { go('guruMenu'); };
  $('gu-cari').addEventListener('input', gambarDaftarMurid);
  $('gu-daftar').addEventListener('click', function (e) {
    var b = e.target.closest('.item-murid'); if (!b) return;
    GU.pilih = GU.murid.filter(function (m) { return m.id === b.dataset.id; })[0] || null;
    gambarDaftarMurid(); gambarEdit();
    if (GU.pilih) $('gu-edit').scrollIntoView({ behavior: 'smooth' });
  });
  $('gu-pw').addEventListener('input', function () { this.value = this.value.replace(/[^A-Za-z0-9]/g, ''); });
  $('gu-simpanpw').onclick = async function () {
    var m = GU.pilih, pw = $('gu-pw').value;
    if (!m) return;
    if (pw.length !== PANJANG_PW) { setGalat('gu-galat', 'Password harus ' + PANJANG_PW + ' karakter (huruf/angka).'); return; }
    if (!(await tanya('Reset password?', m.nama + '\nPassword baru: ' + pw, 'Reset', 'Batal'))) return;
    var b = $('gu-simpanpw'); sibuk(b, true, 'Menyimpan...');
    var r = await api('guruResetPw', { id: m.id, password: pw });
    sibuk(b, false);
    if (r && r.ok) { m.password = pw; gambarEdit(); toast('Password diubah'); }
    else setGalat('gu-galat', (r && r.pesan) || 'Gagal menyimpan.');
  };
  $('gu-mandiri').onclick = async function () {
    var m = GU.pilih; if (!m) return;
    if (!(await tanya('Murid atur ulang sendiri?', m.nama + '\nPassword dikosongkan. Murid membuat password baru lewat menu Daftar (nama dan kelas sama).', 'Kosongkan', 'Batal'))) return;
    var b = $('gu-mandiri'); sibuk(b, true, 'Memproses...');
    var r = await api('guruResetMandiri', { id: m.id });
    sibuk(b, false);
    if (r && r.ok) { m.password = ''; gambarEdit(); toast('Password dikosongkan'); }
    else setGalat('gu-galat', (r && r.pesan) || 'Gagal memproses.');
  };
  $('gu-simpankelas').onclick = async function () {
    var m = GU.pilih, k = $('gu-kelas').value;
    if (!m) return;
    if (!k || k === m.kelas) { setGalat('gu-galat', 'Pilih kelas yang berbeda.'); return; }
    if (!(await tanya('Pindahkan kelas?', m.nama + '\n' + m.kelas + ' → ' + k + '\n\nSoal, jawaban, dan nilai murid tidak berubah.', 'Pindahkan', 'Batal'))) return;
    var b = $('gu-simpankelas'); sibuk(b, true, 'Menyimpan...');
    var r = await api('guruUbahKelas', { id: m.id, kelas: k });
    sibuk(b, false);
    if (r && r.ok) { m.kelas = k; gambarEdit(); gambarDaftarMurid(); toast('Kelas dipindahkan'); }
    else setGalat('gu-galat', (r && r.pesan) || 'Gagal menyimpan.');
  };
});

// ---------- Kode soal ----------
var GD = { data: [], ubah: {} };
function gambarKode() {
  var mat = $('gd-materi').value, h = '';
  KELAS.forEach(function (k) {
    var d = GD.data.filter(function (x) { return x.materi === mat && x.kelas === k; })[0] || { materi: mat, kelas: k, kode: '', status: 'TUTUP' };
    var key = mat + '|' + k, u = GD.ubah[key] || d;
    h += '<div class="kode-baris"><b>' + k + '</b><input class="isian" data-key="' + key + '" value="' + esc(u.kode) + '" autocomplete="off" autocapitalize="off" placeholder="Kode">' +
      '<button class="sakelar ' + (u.status === 'BUKA' ? 'buka' : 'tutup') + '" data-key="' + key + '">' + (u.status === 'BUKA' ? 'BUKA' : 'TUTUP') + '</button></div>';
  });
  $('gd-baris').innerHTML = h;
}
function itemKode(key) {
  var p = key.split('|');
  var d = GD.data.filter(function (x) { return x.materi === p[0] && x.kelas === p[1]; })[0] || { materi: p[0], kelas: p[1], kode: '', status: 'TUTUP' };
  return GD.ubah[key] || (GD.ubah[key] = { materi: d.materi, kelas: d.kelas, kode: d.kode, status: d.status });
}
PAGES.guruKode = {
  buka: function () {
    if (!cekGuru()) return;
    GD.ubah = {}; $('gd-info').textContent = 'Memuat kode...'; $('gd-baris').innerHTML = '';
    api('guruKodeList').then(function (r) {
      if (r && r.ok) { GD.data = r.kode || []; $('gd-info').textContent = 'Ubah kode atau tekan saklar BUKA/TUTUP, lalu tekan Simpan.'; }
      else $('gd-info').textContent = (r && r.pesan) || 'Gagal memuat kode.';
      gambarKode();
    });
  }
};
INIT.push(function () {
  $('gd-materi').innerHTML = MATERI.map(function (m) { return '<option value="' + m.id + '">' + esc(m.judul) + '</option>'; }).join('');
  $('gd-materi').onchange = gambarKode;
  $('gd-kembali').onclick = function () { go('guruMenu'); };
  $('gd-baris').addEventListener('input', function (e) {
    var i = e.target; if (i.tagName !== 'INPUT') return;
    itemKode(i.dataset.key).kode = i.value.trim();
  });
  $('gd-baris').addEventListener('click', function (e) {
    var b = e.target.closest('.sakelar'); if (!b) return;
    var it = itemKode(b.dataset.key); it.status = it.status === 'BUKA' ? 'TUTUP' : 'BUKA';
    b.textContent = it.status; b.className = 'sakelar ' + (it.status === 'BUKA' ? 'buka' : 'tutup');
  });
  $('gd-simpan').onclick = async function () {
    var daftar = Object.keys(GD.ubah).map(function (k) { return GD.ubah[k]; });
    if (!daftar.length) { toast('Belum ada perubahan'); return; }
    var b = $('gd-simpan'); sibuk(b, true, 'Menyimpan...');
    var r = await api('guruKodeSimpan', { daftar: daftar });
    sibuk(b, false);
    if (r && r.ok) {
      daftar.forEach(function (it) {
        var d = GD.data.filter(function (x) { return x.materi === it.materi && x.kelas === it.kelas; })[0];
        if (d) { d.kode = it.kode; d.status = it.status; } else GD.data.push({ materi: it.materi, kelas: it.kelas, kode: it.kode, status: it.status });
      });
      GD.ubah = {}; toast('Kode tersimpan');
    } else toast((r && r.pesan) || 'Gagal menyimpan');
  };
});


// ===================== DAFTAR TUGAS =====================
var STATUS_LBL = { belum: 'Belum mengerjakan', menunggu: 'Menunggu dicek', dinilai: 'Sudah dinilai' };
var STATUS_CLS = { belum: 'terkunci', menunggu: 'menunggu', dinilai: 'nilai' };
var GT = { materi: '', list: [], siap: false, kelas: '', konteks: [] };

function lencanaSt(s) { return '<span class="lencana ' + (STATUS_CLS[s] || 'terkunci') + '">' + (STATUS_LBL[s] || s) + '</span>'; }
function lencanaMurid(m) {   // murid yang sudah disetujui remedi diberi label Remedi
  if (!m.remedi) return lencanaSt(m.status);
  var lbl = m.status === 'belum' ? 'Remedi' : (m.status === 'menunggu' ? 'Remedi · menunggu dicek' : 'Remedi · sudah dinilai');
  var cls = m.status === 'belum' ? 'dikerjakan' : (STATUS_CLS[m.status] || 'terkunci');
  return '<span class="lencana ' + cls + '">' + lbl + '</span>';
}
function htmlMurid(m) {
  return '<button class="item-murid" data-id="' + esc(m.id) + '"><span>' + esc(m.nama) + '<br><small>' + esc(m.kelas) + '</small></span>' + lencanaMurid(m) + '</button>';
}
function gambarKelasTugas() {
  var h = '', ada = 0;
  KELAS.forEach(function (k) {
    var l = GT.list.filter(function (m) { return m.kelas === k; });
    var kirim = l.filter(function (m) { return m.status !== 'belum'; }).length;
    var nilai = l.filter(function (m) { return m.status === 'dinilai'; }).length;
    var rmBelum = l.filter(function (m) { return m.status === 'belum' && m.remedi; }).length;
    if (!kirim && !rmBelum) return;
    ada++;
    h += '<button class="kelas-kartu' + (GT.kelas === k ? ' pilih' : '') + '" data-k="' + k + '"><b>' + k + '</b><small>Sudah dinilai ' + nilai + '<br>Belum dinilai ' + (kirim - nilai) + '<br>Belum mengirim ' + (l.length - kirim - rmBelum) + (rmBelum ? '<br>Remedi dikerjakan ' + rmBelum : '') + '</small></button>';
  });
  $('gt-kelas').innerHTML = h;
  if (GT.siap) $('gt-info').textContent = ada ? 'Kelas yang sudah ada kiriman:' : 'Belum ada murid yang mengirim.';
}
function gambarDaftarKelas() {
  var w = $('gt-daftarwrap');
  if (!GT.kelas) { w.style.display = 'none'; return; }
  GT.konteks = GT.list.filter(function (m) { return m.kelas === GT.kelas; }).sort(urutNama);
  $('gt-judulkelas').textContent = 'Kelas ' + GT.kelas;
  $('gt-daftar').innerHTML = GT.konteks.map(htmlMurid).join('');
  w.style.display = 'block';
}
function gambarCari() {
  var q = $('gt-cari').value.trim().toLowerCase();
  if (!q) { $('gt-hasil').innerHTML = ''; gambarDaftarKelas(); return; }
  var h = GT.list.filter(function (m) { return m.nama.toLowerCase().indexOf(q) === 0; }).sort(urutNama).slice(0, 40);
  GT.konteks = h;
  $('gt-info').textContent = h.length + ' murid ditemukan (semua kelas)';
  $('gt-hasil').innerHTML = h.map(htmlMurid).join('');
}
function muatTugas() {
  GT.siap = false; GT.list = []; GT.kelas = '';
  $('gt-info').textContent = 'Memuat...'; $('gt-kelas').innerHTML = ''; $('gt-hasil').innerHTML = ''; $('gt-daftarwrap').style.display = 'none';
  return api('guruTugasList', { materi: GT.materi }).then(function (r) {
    if (r && r.ok) {
      GT.list = r.murid || []; GT.siap = true; gambarKelasTugas(); gambarCari();
      if (GT.balik) { GT.kelas = GT.balik; GT.balik = ''; gambarKelasTugas(); gambarDaftarKelas(); }
    }
    else $('gt-info').textContent = (r && r.pesan) || 'Gagal memuat.';
  });
}
function bukaNilai(id) {
  var m = GT.list.filter(function (x) { return x.id === id; })[0];
  if (m && m.status === 'belum') { if (GT.materi === 'ujian') { bukaUlangUjian(m.id, m.nama).then(function (ok) { if (ok) muatTugas(); }); return; } toast(m.remedi ? 'Murid sedang mengerjakan remedi' : 'Murid ini belum mengirim'); return; }
  GN.baru = true; GT.balik = GT.kelas;
  go('guruNilai', { id: id, materi: GT.materi });
}
function gambarMateriTugas() {
  $('gt-materi').innerHTML = MATERI.map(function (m) {
    return '<button class="menu-kartu' + (GT.materi === m.id ? ' pilih' : '') + '" data-m="' + m.id + '"><span>' + (m.ikon || '📘') + '</span>' + esc(m.judul) + '</button>';
  }).join('');
}
PAGES.guruTugas = {
  buka: function () {
    if (!cekGuru()) return;
    if (!GT.materi) GT.materi = MATERI[0].id;
    gambarMateriTugas(); $('gt-cari').value = '';
    muatTugas();
    api('guruRemediList').then(function (r) {
      $('gt-remedi').textContent = '🔁 Permintaan Remedi' + (r && r.ok && r.daftar.length ? ' (' + r.daftar.length + ')' : '');
    });
  }
};

// ---------- Permintaan remedi dari murid ----------
var RM = { daftar: [] };
function gambarRemedi() {
  $('rm-info').textContent = RM.daftar.length ? RM.daftar.length + ' permintaan menunggu. ✓ setujui, ✗ tolak.' : 'Tidak ada permintaan remedi.';
  $('rm-daftar').innerHTML = RM.daftar.map(function (x, i) {
    return '<div class="rm-baris"><div class="rm-isi"><b>' + esc(x.nama) + '</b><small>' + esc(x.kelas) + ' · ' + esc(x.judul) + '</small></div>' +
      '<button class="rm-btn ya" data-i="' + i + '" data-s="1" aria-label="Setujui">✓</button>' +
      '<button class="rm-btn tdk" data-i="' + i + '" data-s="0" aria-label="Tolak">✗</button></div>';
  }).join('');
}
PAGES.guruRemedi = {
  buka: function () {
    if (!cekGuru()) return;
    $('rm-info').textContent = 'Memuat...'; $('rm-daftar').innerHTML = '';
    api('guruRemediList').then(function (r) {
      if (r && r.ok) { RM.daftar = r.daftar || []; gambarRemedi(); }
      else $('rm-info').textContent = (r && r.pesan) || 'Gagal memuat.';
    });
  }
};
INIT.push(function () {
  $('gt-remedi').onclick = function () { go('guruRemedi'); };
  $('rm-kembali').onclick = function () { go('guruTugas'); };
  $('rm-daftar').addEventListener('click', async function (e) {
    var b = e.target.closest('.rm-btn'); if (!b) return;
    var x = RM.daftar[Number(b.dataset.i)]; if (!x) return;
    var setuju = b.dataset.s === '1';
    var ya = await tanya(setuju ? 'Setujui remedi?' : 'Tolak remedi?',
      x.nama + ' · ' + x.judul + (setuju ? '\nJawaban lama diarsipkan, nilai tetap tersimpan, dan materi dibuka lagi dengan soal baru.' : '\nNilai murid tidak berubah.'),
      setuju ? 'Setujui' : 'Tolak', 'Batal');
    if (!ya) return;
    var r = await api('guruRemediKeputusan', { id: x.id, materi: x.materi, setuju: setuju });
    if (r && r.ok) { RM.daftar.splice(Number(b.dataset.i), 1); gambarRemedi(); toast(setuju ? 'Remedi disetujui' : 'Remedi ditolak'); }
    else toast((r && r.pesan) || 'Gagal memproses');
  });
});
INIT.push(function () {
  $('gt-materi').addEventListener('click', function (e) {
    var b = e.target.closest('.menu-kartu'); if (!b) return;
    GT.materi = b.dataset.m; $('gt-cari').value = ''; gambarMateriTugas(); muatTugas();
  });
  $('gt-cari').addEventListener('input', gambarCari);
  $('gt-kembali').onclick = function () { go('guruMenu'); };
  $('gt-rekap').onclick = function () { if (GT.kelas) { GT.balik = GT.kelas; go('guruRekap', { kelas: GT.kelas, materi: GT.materi }); } };
  $('gr-kembali').onclick = function () { go('guruTugas'); };
  $('gt-kelas').addEventListener('click', function (e) {
    var b = e.target.closest('.kelas-kartu'); if (!b) return;
    GT.kelas = b.dataset.k; $('gt-cari').value = ''; $('gt-hasil').innerHTML = '';
    gambarKelasTugas(); gambarDaftarKelas();
    $('gt-daftarwrap').scrollIntoView({ behavior: 'smooth' });
  });
  ['gt-daftar', 'gt-hasil'].forEach(function (id) {
    $(id).addEventListener('click', function (e) {
      var b = e.target.closest('.item-murid'); if (b) bukaNilai(b.dataset.id);
    });
  });
});

// ---------- Rekap nilai kelas ----------
PAGES.guruRekap = {
  buka: function (p) {
    if (!cekGuru()) return;
    if (!p || !p.kelas) { go('guruTugas'); return; }
    var mt = MATERI.filter(function (x) { return x.id === p.materi; })[0];
    $('gr-judul').textContent = 'Kelas ' + p.kelas + ' · ' + (mt ? mt.judul : '');
    $('gr-info').textContent = 'Memuat...'; $('gr-tabel').innerHTML = '';
    api('guruRekap', { kelas: p.kelas, materi: p.materi }).then(function (r) {
      if (!(r && r.ok)) { $('gr-info').textContent = (r && r.pesan) || 'Gagal memuat.'; return; }
      $('gr-info').textContent = (r.baris || []).length + ' murid';
      var h = '<table class="tbl"><colgroup><col style="width:9%"><col style="width:37%"><col style="width:14%"><col style="width:22%"><col style="width:18%"></colgroup><tr><th>No</th><th>Nama</th><th>Awal</th><th>Remedi</th><th>Tertinggi</th></tr>';
      (r.baris || []).forEach(function (x, i) { h += '<tr><td>' + (i + 1) + '</td><td>' + esc(x.nama) + '</td><td>' + esc(x.nilai1) + '</td><td>' + esc(x.remedi) + '</td><td><b>' + esc(x.tertinggi) + '</b></td></tr>'; });
      $('gr-tabel').innerHTML = h + '</table>';
    });
  }
};

// ---------- Rekap nilai semua materi (menu guru) ----------
var RK = { kelas: '', seq: 0 };
// Singkat nama materi otomatis: pendek tetap; satu kata panjang dipotong; beberapa kata jadi huruf awal
function singkatMateri(j) {
  j = String(j || '').trim();
  if (j.length <= 8) return j;
  var kata = j.split(/[\s,]+/).filter(Boolean);
  if (kata.length < 2) return j.slice(0, 5) + '.';
  var sambung = ['dan', 'atau', 'dengan', 'di', 'ke', 'dari', 'yang', '&'];
  var inisial = kata.filter(function (w) { return sambung.indexOf(w.toLowerCase()) < 0; })
    .map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
  return inisial || j.slice(0, 5) + '.';
}
function gambarTombolRekap() {
  $('rk-kelas').innerHTML = KELAS.map(function (k) {
    return '<button type="button" data-k="' + k + '" class="' + (RK.kelas === k ? 'pilih' : '') + '">' + k + '</button>';
  }).join('');
}
function muatRekapSemua() {
  var k = RK.kelas, n = ++RK.seq;
  $('rk-tabel').innerHTML = ''; $('rk-ket').innerHTML = '';
  if (!k) { $('rk-judul').textContent = ''; $('rk-info').textContent = 'Pilih kelas untuk melihat rekap nilai.'; return; }
  $('rk-judul').textContent = 'Kelas ' + k;
  $('rk-info').textContent = 'Memuat...';
  api('guruRekapSemua', { kelas: k }).then(function (r) {
    if (n !== RK.seq) return;   // sudah pindah kelas
    if (!(r && r.ok)) { $('rk-info').textContent = (r && r.pesan) || 'Gagal memuat.'; return; }
    var baris = (r.baris || []).slice().sort(urutNama);
    $('rk-info').textContent = baris.length + ' murid · nilai tertinggi tiap materi';
    var lm = Math.floor(60 / MATERI.length);
    var h = '<table class="rk-tbl"><colgroup><col style="width:8%"><col style="width:' + (100 - 8 - lm * MATERI.length) + '%">' +
      MATERI.map(function () { return '<col style="width:' + lm + '%">'; }).join('') + '</colgroup><tr><th>No</th><th>Nama</th>' +
      MATERI.map(function (m) { return '<th>' + esc(singkatMateri(m.judul)) + '</th>'; }).join('') + '</tr>';
    baris.forEach(function (x, i) {
      h += '<tr><td>' + (i + 1) + '</td><td class="n">' + esc(x.nama) + '</td>';
      MATERI.forEach(function (m) {
        var c = (x.sel && x.sel[m.id]) || { nilai: '', tunggu: false };
        var ada = c.nilai !== '' && c.nilai != null;
        if (!ada && !c.tunggu) h += '<td class="k">-</td>';
        else h += '<td>' + (ada ? '<b>' + esc(c.nilai) + '</b>' : '') + (c.tunggu ? (ada ? ' ' : '') + '⏳' : '') + '</td>';
      });
      h += '</tr>';
    });
    $('rk-tabel').innerHTML = h + '</table>';
    var ket = MATERI.filter(function (m) { return singkatMateri(m.judul) !== m.judul; })
      .map(function (m) { return esc(singkatMateri(m.judul)) + ' = ' + esc(m.judul); });
    ket.push('⏳ = sudah mengirim, menunggu dinilai');
    $('rk-ket').innerHTML = ket.join(' · ');
  });
}
PAGES.guruRekapMenu = {
  buka: function () {
    if (!cekGuru()) return;
    gambarTombolRekap(); muatRekapSemua();
  }
};
INIT.push(function () {
  if (!$('rk-kelas') || !$('rk-kembali')) return;   // halaman tanpa menu rekap (portal siswa, ujian)
  $('rk-kelas').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    RK.kelas = b.dataset.k; gambarTombolRekap(); muatRekapSemua();
  });
  $('rk-kembali').onclick = function () { go('guruMenu'); };
});

// ===================== PENILAIAN =====================
var GN = { id: '', materi: '', antrian: [], pos: 0, baru: false, dirty: false, tersimpan: false, ok: 0 };

function jwbTeks(x) { return Array.isArray(x) ? x.join(', ') : String(x == null ? '' : x); }
function gambarNilaiSoal(r) {
  var m = r.murid, idSoal = String(m.nama).toLowerCase() + '|' + (m.kelasSoal || m.kelas);
  var soal = BANK_SOAL[GN.materi].buat(idSoal + (r.percobaan > 1 ? '|r' + r.percobaan : '')), h = '', benarSemua = 0;
  soal.forEach(function (s, i) {
    var d = (r.soal || []).filter(function (x) { return Number(x.no) === i + 1; })[0] || { jawaban: '', benar: null, foto: [] };
    var b = d.benar;
    if (Array.isArray(b)) b = b.length ? b.every(function (x) { return x === true; }) : null;
    if (b === true) benarSemua++;
    var badge = b === true ? '<span class="tb ya">✓ Benar</span>' : (b === false ? '<span class="tb tdk">✗ Salah</span>' : '<span class="tb kos">Kosong</span>');
    var tampil = Array.isArray(s.tampil) ? s.tampil.join('  ') : s.tampil;
    var foto = (d.foto || []).filter(Boolean).map(function (u) { return '<img data-zoom="1" src="' + esc(u) + '" alt="Foto">'; }).join('');
    h += '<div class="kartu"><div style="display:flex;justify-content:space-between;align-items:center"><b>Soal ' + (i + 1) + ' · ' + esc(s.tingkat) + '</b>' + badge + '</div>' +
      '<p style="margin:8px 0 4px">' + esc(s.teks) + '</p>' +
      (tampil ? '<div class="jwb"><small>Soal</small>' + esc(tampil) + '</div>' : '') +
      '<div class="jwb"><small>Jawaban murid</small>' + (jwbTeks(d.jawaban) === '' ? '<i>kosong</i>' : esc(jwbTeks(d.jawaban))) + '</div>' +
      '<div class="jwb"><small>Kunci</small>' + esc(jwbTeks(s.kunci)) + '</div>' +
      '<div class="mini-foto">' + (foto || (BANK_SOAL[GN.materi].perluFoto === false || (BANK_SOAL[GN.materi].perluFotoSoal && !BANK_SOAL[GN.materi].perluFotoSoal(s)) ? '' : '<span style="color:var(--abu);font-size:14px">Tidak ada foto</span>')) + '</div>' +
      '<div class="pilih-nilai"><button type="button" class="pn salah" data-v="0">Salah (0)</button><button type="button" class="pn sebagian" data-v="' + (skorMax() / 2) + '">Benar sebagian (' + (skorMax() / 2) + ')</button><button type="button" class="pn benar" data-v="' + skorMax() + '">Benar (' + skorMax() + ')</button></div>' +
      '<div class="ns-baris"><input class="isian ns" data-i="' + i + '" type="text" inputmode="numeric" maxlength="' + String(skorMax()).length + '" autocomplete="off" placeholder="Nilai 0-' + skorMax() + '" value="' + esc(String(nilaiAwal(d, s, b, r))) + '"></div>' +
      '<details><summary>Langkah pengerjaan</summary><ol class="langkah">' + s.langkah.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ol></details></div>';
  });
  GN.ok = benarSemua;
  $('gn-soal').innerHTML = h;
  $('gn-namakecil').textContent = m.nama;
  $('gn-auto').textContent = 'Benar otomatis: ' + benarSemua + '/' + soal.length + ((r.nilai === '' || r.nilai == null) ? ' · nilai terisi otomatis, periksa foto lalu Simpan' : '');
  hitungBayangan();
}
// Nilai awal tiap soal untuk murid yang BELUM dinilai: kosong = 0, butuh foto tapi tanpa foto = 0, benar = nilai penuh, salah = 0
function perluFotoGuru(s) { var B = BANK_SOAL[GN.materi] || {}; return B.perluFotoSoal ? B.perluFotoSoal(s) : B.perluFoto !== false; }
function nilaiAwal(d, s, b, r) {
  if (d.nilaiSoal != null && String(d.nilaiSoal) !== '') return d.nilaiSoal;       // nilai yang sudah disimpan guru tidak ditimpa
  if (r.nilai !== '' && r.nilai != null) return '';                                // murid yang sudah dinilai (data lama): biarkan
  if (jwbTeks(d.jawaban) === '') return 0;
  if (perluFotoGuru(s) && !(d.foto || []).length) return 0;
  return b === true ? skorMax() : 0;
}
function skorMax() { return (BANK_SOAL[GN.materi] || {}).skorPerSoal || 10; }
function hitungBayangan() {   // jumlahkan nilai semua soal -> nilai akhir otomatis, dan tandai tombol yang sesuai
  var t = 0;
  document.querySelectorAll('#gn-soal .ns').forEach(function (e) {
    var v = e.value.trim(); t += Number(v) || 0;
    [].forEach.call(e.closest('.kartu').querySelectorAll('.pn'), function (b) { b.classList.toggle('aktif', v !== '' && Number(v) === Number(b.dataset.v)); });
  });
  $('gn-nilai').value = String(Math.min(t, 100));
}
function gambarStatusNilai() {   // setelah tersimpan, tombol Simpan hilang; muncul lagi jika nilai diubah
  $('gn-simpan').style.display = (GN.tersimpan && !GN.dirty) ? 'none' : '';
}
function gambarPos() {
  var n = GN.antrian.length;
  $('gn-pos').textContent = 'Murid ' + (GN.pos + 1) + ' dari ' + n;
  $('gn-prev').disabled = GN.pos <= 0;
  $('gn-next').disabled = GN.pos >= n - 1;
}
function ubahStatusLokal(st) {
  var m = GT.list.filter(function (x) { return x.id === GN.id; })[0];
  if (m) m.status = st;
}
async function lepasDirty() {
  if (!GN.dirty) return true;
  return await tanya('Nilai belum disimpan', 'Nilai yang kamu ubah belum disimpan. Pindah tanpa menyimpan?', 'Pindah', 'Tetap di sini');
}
async function pindahMurid(d) {
  var k = GN.pos + d;
  if (k < 0 || k >= GN.antrian.length) return;
  if (!(await lepasDirty())) return;
  GN.dirty = false;
  go('guruNilai', { id: GN.antrian[k].id, materi: GN.materi });
}
async function simpanNilai() {
  var v = $('gn-nilai').value.trim();
  if (!/^\d{1,3}$/.test(v) || Number(v) > 100) { setGalat('gn-galat', 'Nilai akhir harus angka 0 sampai 100.'); return; }
  var ns = [].map.call(document.querySelectorAll('#gn-soal .ns'), function (e) { return e.value.trim(); });
  setGalat('gn-galat', '');
  var b = $('gn-simpan'); sibuk(b, true, 'Menyimpan...');
  var r = await api('guruSimpanNilai', { id: GN.id, materi: GN.materi, nilai: Number(v), soal: ns });
  sibuk(b, false);
  if (r && r.ok) {
    GN.dirty = false; GN.tersimpan = true; ubahStatusLokal('dinilai'); gambarStatusNilai();
    toast('Nilai disimpan dan tampil di akun murid');
  } else { gambarStatusNilai(); setGalat('gn-galat', (r && r.pesan) || 'Gagal menyimpan.'); }
}

PAGES.guruNilai = {
  buka: async function (param) {
    if (!cekGuru()) return;
    if (!param || !param.id) { go('guruTugas'); return; }
    GN.id = param.id; GN.materi = param.materi || GT.materi;
    if (!GT.materi) GT.materi = GN.materi;
    // Susun antrian hanya saat masuk dari daftar (hanya yang menunggu dicek)
    var idx = GN.antrian.map(function (x) { return x.id; }).indexOf(GN.id);
    if (GN.baru || !GN.antrian.length || idx < 0) {
      GN.antrian = GT.konteks.filter(function (m) { return m.status === 'menunggu' || m.id === GN.id; });
      if (!GN.antrian.some(function (m) { return m.id === GN.id; })) GN.antrian = [{ id: GN.id }];
      idx = GN.antrian.map(function (x) { return x.id; }).indexOf(GN.id);
      GN.baru = false;
    }
    GN.pos = idx; GN.dirty = false; GN.tersimpan = false;
    $('gn-nama').textContent = 'Memuat...'; $('gn-kelas').textContent = ''; $('gn-soal').innerHTML = '';
    $('gn-nilai').value = ''; $('gn-auto').textContent = ''; setGalat('gn-galat', '');
    gambarPos(); gambarStatusNilai();
    var r = await api('guruDetail', { id: GN.id, materi: GN.materi });
    if (!(r && r.ok)) { $('gn-nama').textContent = 'Gagal memuat'; toast((r && r.pesan) || 'Gagal memuat data murid'); return; }
    $('gn-nama').textContent = r.murid.nama;
    $('gn-kelas').textContent = 'Kelas ' + r.murid.kelas + ' · ' + (r.nilai !== '' && r.nilai != null ? 'Sudah dinilai' : 'Belum dinilai') + (r.percobaan > 1 ? ' · Remedi ke-' + (r.percobaan - 1) : '');
    gambarNilaiSoal(r);
    $('gn-bukaulang').style.display = GN.materi === 'ujian' ? '' : 'none';
    if (r.nilai != null && r.nilai !== '') {
      var adaSoal = (r.soal || []).some(function (x) { return String(x.nilaiSoal == null ? '' : x.nilaiSoal) !== ''; });
      if (!adaSoal) $('gn-nilai').value = r.nilai;   // data lama tanpa nilai per soal
      GN.tersimpan = true;
    }
    gambarStatusNilai();
  }
};
INIT.push(function () {
  $('gn-simpan').onclick = function () { simpanNilai(); };
  $('gn-soal').addEventListener('input', function (e) {
    var i = e.target; if (!i.classList.contains('ns')) return;
    var v = i.value.replace(/[^0-9]/g, ''); if (v !== '' && Number(v) > skorMax()) v = String(skorMax());
    i.value = v; GN.dirty = true; hitungBayangan(); gambarStatusNilai();
  });
  $('gn-soal').addEventListener('click', function (e) {
    var b = e.target.closest('.pn'); if (!b) return;
    var i = b.closest('.kartu').querySelector('.ns');
    if (i) { i.value = b.dataset.v; GN.dirty = true; hitungBayangan(); gambarStatusNilai(); }
  });
  $('gn-prev').onclick = function () { pindahMurid(-1); };
  $('gn-next').onclick = function () { pindahMurid(1); };
  $('gn-kembali').onclick = $('gn-kembali2').onclick = async function () { if (await lepasDirty()) { GN.dirty = false; go('guruTugas'); } };
  $('gn-soal').addEventListener('click', function (e) {
    var im = e.target.closest('img[data-zoom]'); if (im) zoomFoto(im.src);
  });
});


// ===================== UJIAN: WAKTU, LAYAR PENUH, PELANGGARAN =====================
var UJ = { foto: false, fotoT: 0, aktif: false, akhir: 0, tmr: null, last: 0, fsAda: false, dlg: false, kirim: false, plg: 0 };
function ujianLayarPenuh() {
  try {
    var e = document.documentElement, f = e.requestFullscreen || e.webkitRequestFullscreen || e.mozRequestFullScreen;
    if (f) { var p = f.call(e); if (p && p.catch) p.catch(function () {}); }
  } catch (x) {}
}
async function ujianGerbang(baru) {
  await dialog(baru ? 'Mulai Ujian' : 'Lanjutkan Ujian',
    'Waktu mengerjakan 40 menit. Layar akan menjadi penuh. Jangan pindah aplikasi atau keluar dari layar penuh. Pelanggaran ke-4 akan mengirim jawabanmu otomatis.',
    [{ t: baru ? 'Mulai' : 'Lanjutkan', v: true }]);
  ujianLayarPenuh();
}
function ujianBar() {
  var b = $('uj-bar');
  if (!b) {
    b = document.createElement('div'); b.id = 'uj-bar';
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#1d3557;color:#fff;padding:6px 12px;font:600 15px system-ui,sans-serif;display:flex;justify-content:space-between';
    document.body.appendChild(b); document.body.style.paddingTop = '36px';
  }
  return b;
}
function ujianGambar() {
  var s = Math.max(0, Math.round((UJ.akhir - Date.now()) / 1000));
  ujianBar().innerHTML = '<span>⏱ ' + ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + (s % 60)).slice(-2) + '</span><span>Pelanggaran ' + UJ.plg + '/3</span>';
  return s;
}
function ujianBerhenti() {
  UJ.aktif = false; clearInterval(UJ.tmr);
  var b = $('uj-bar'); if (b) b.remove();
  document.body.style.paddingTop = '';
  try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (x) {}
}
async function ujianMulai() {
  if (UJ.aktif || UJ.kirim) return;
  var r = await api('ujianWaktu', {});
  if (!(r && r.ok)) { if (!r || r.offline) setTimeout(ujianMulai, 3000); else toast(r.pesan || 'Gagal memuat waktu ujian'); return; }
  if (UJ.aktif) return;
  UJ.aktif = true; UJ.plg = r.pelanggaran; UJ.akhir = Date.now() + r.sisa * 1000; UJ.fsAda = !!document.fullscreenElement;
  clearInterval(UJ.tmr);
  UJ.tmr = setInterval(function () { if (ujianGambar() <= 0) ujianKirimOtomatis('waktu'); }, 1000);
  if (ujianGambar() <= 0) ujianKirimOtomatis('waktu');
}
async function ujianKirimOtomatis(alasan) {
  if (UJ.kirim) return;
  UJ.kirim = true; UJ.aktif = false; clearInterval(UJ.tmr);
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.85);color:#fff;display:flex;align-items:center;justify-content:center;font:600 18px system-ui,sans-serif;text-align:center;padding:24px';
  ov.textContent = (alasan === 'waktu' ? 'Waktu habis.' : 'Pelanggaran melebihi batas.') + ' Mengirim jawaban...';
  document.body.appendChild(ov);
  try { await flushDraf(); } catch (x) {}
  var r = null;
  for (var k = 0; k < 40; k++) {
    r = await api('ujianPaksaKirim', { alasan: alasan });
    if (r && r.ok) break;
    await tunggu(3000);
  }
  ov.remove(); UJ.kirim = false;
  if (r && r.ok) { ujianBerhenti(); suksesKirim('ujian'); go('kirim', 'ujian'); }
  else {
    await dialog('Gagal mengirim', 'Jawaban belum terkirim. Periksa sinyal lalu tekan Coba lagi.', [{ t: 'Coba lagi', v: true }]);
    ujianKirimOtomatis(alasan);
  }
}
// Mengambil foto jawaban (kamera/galeri) membuat halaman tersembunyi sebentar: itu bukan pelanggaran.
function ujianFotoMulai() {
  UJ.foto = true; clearTimeout(UJ.fotoT);
  UJ.fotoT = setTimeout(function () { UJ.foto = false; }, 180000);   // pengaman: maksimal 3 menit
}
function ujianFotoSelesai() {
  if (!UJ.foto) return;
  clearTimeout(UJ.fotoT);
  UJ.fotoT = setTimeout(function () {   // jeda agar kejadian keluar-layar yang terlambat tidak dihitung
    UJ.foto = false;
    if (UJ.aktif && !UJ.kirim) ujianLayarPenuh();
  }, 2000);
}
async function ujianPelanggaran(sebab) {
  if (!UJ.aktif || UJ.kirim || UJ.dlg || UJ.foto) return;
  var t = Date.now(); if (t - UJ.last < 2000) return; UJ.last = t;
  var r = await api('ujianPelanggaran', { jenis: sebab });
  if (!(r && r.ok) || r.dobel) return;
  UJ.plg = r.jumlah; ujianGambar();
  if (r.kirim) { ujianKirimOtomatis('pelanggaran'); return; }
  UJ.dlg = true;
  await dialog('Peringatan ' + r.jumlah + ' dari ' + r.batas, 'Kamu keluar dari layar ujian (' + sebab + '). Pelanggaran ke-' + (r.batas + 1) + ' akan mengirim jawabanmu otomatis.', [{ t: 'Kembali ke ujian', v: true }]);
  UJ.dlg = false; ujianLayarPenuh();
}
document.addEventListener('visibilitychange', function () {
  if (document.hidden) ujianPelanggaran('pindah aplikasi atau tab');
  else ujianFotoSelesai();   // kembali dari kamera/galeri
});
document.addEventListener('fullscreenchange', function () {
  if (document.fullscreenElement) { UJ.fsAda = true; return; }
  if (UJ.fsAda) ujianPelanggaran('keluar dari layar penuh');
});
(function () {
  var asli = PAGES.soal.buka;
  PAGES.soal.buka = function (param) {
    asli(param);
    var id = idMateri(param) || ST.materi, st = statusLokal(id);
    if (id === 'ujian' && st !== 'menunggu' && st !== 'nilai') ujianMulai();
  };
  var sk = suksesKirim;
  suksesKirim = function (id) { if (id === 'ujian') ujianBerhenti(); sk(id); };
})();

// ===================== UJIAN: SISI GURU =====================
async function bukaUlangUjian(id, nama) {
  if (!(await tanya('Buka ulang ujian?', nama + '\nMurid memasukkan kode lagi dan mendapat waktu 40 menit baru. Soal tetap sama. Jawaban yang sudah terkirim diarsipkan.\nPastikan kode ujian kelasnya dibuka lagi.', 'Buka ulang', 'Batal'))) return false;
  var r = await api('guruUjianBukaUlang', { id: id });
  if (r && r.ok) { toast('Ujian dibuka ulang'); return true; }
  toast((r && r.pesan) || 'Gagal membuka ulang'); return false;
}
var UJT = { tampil: false };
function gambarUjianTampil() {
  var w = $('gd-ujian'); if (!w) return;
  w.style.display = $('gd-materi').value === 'ujian' ? '' : 'none';
  $('gd-tampil').textContent = UJT.tampil ? '👁️ Materi ujian TAMPIL untuk murid (tekan untuk menyembunyikan)' : '🙈 Materi ujian DISEMBUNYIKAN dari murid (tekan untuk menampilkan)';
}
(function () {
  var gk = gambarKode;
  gambarKode = function () { gk(); gambarUjianTampil(); };
  var asli = PAGES.guruKode.buka;
  PAGES.guruKode.buka = function () {
    asli();
    api('guruUjianTampil', {}).then(function (r) { if (r && r.ok) { UJT.tampil = r.tampil; gambarUjianTampil(); } });
  };
  $('gd-tampil').onclick = async function () {
    var r = await api('guruUjianTampil', { tampil: !UJT.tampil });
    if (r && r.ok) { UJT.tampil = r.tampil; gambarUjianTampil(); toast(r.tampil ? 'Materi ujian ditampilkan' : 'Materi ujian disembunyikan'); }
    else toast((r && r.pesan) || 'Gagal mengubah');
  };
  $('gn-bukaulang').onclick = async function () {
    if (await bukaUlangUjian(GN.id, $('gn-nama').textContent)) { GN.dirty = false; go('guruTugas'); }
  };
})();

// ===== Layar PID: tombol guru untuk menampilkan nama pelanggar =====
var PID_TAMPIL = false;
function gambarPid() {
  var b = $('gd-pid'); if (!b) return;
  b.parentElement.style.display = $('gd-materi').value === 'ujian' ? '' : 'none';
  b.textContent = PID_TAMPIL ? '🖥️ Layar PID: nama pelanggar TAMPIL (tekan untuk sembunyikan)' : '🖥️ Layar PID: nama pelanggar DISEMBUNYIKAN (tekan untuk tampilkan)';
}
(function () {
  var asliBukaKode = PAGES.guruKode.buka;
  PAGES.guruKode.buka = function () {
    asliBukaKode();
    api('guruPidTampil', {}).then(function (r) { if (r && r.ok) { PID_TAMPIL = r.tampil; gambarPid(); } });
  };
  if ($('gd-materi')) $('gd-materi').addEventListener('change', gambarPid);
  if (!$('gd-pid')) return;   // halaman tanpa tombol PID
  if ($('gd-pidreset')) $('gd-pidreset').onclick = async function () {
    if (!(await tanya('Reset daftar pelanggaran?', 'Layar PID akan kosong. Data pelanggaran tetap tersimpan di tab Pelanggaran Ujian.', 'Reset', 'Batal'))) return;
    var r = await api('guruPidReset', {});
    toast(r && r.ok ? 'Daftar pelanggaran direset' : ((r && r.pesan) || 'Gagal mereset'));
  };
  $('gd-pid').onclick = async function () {
    var r = await api('guruPidTampil', { tampil: !PID_TAMPIL });
    if (r && r.ok) { PID_TAMPIL = r.tampil; gambarPid(); toast(r.tampil ? 'Nama tampil di layar PID' : 'Nama disembunyikan dari layar PID'); }
    else toast((r && r.pesan) || 'Gagal mengubah');
  };
})();

if ('serviceWorker' in navigator && location.protocol === 'https:') { navigator.serviceWorker.register('sw.js').catch(function () {}); }
