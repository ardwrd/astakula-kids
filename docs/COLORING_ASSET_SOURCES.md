# Sumber gambar mewarnai — Astakula Kids

## Gambar yang dipakai sekarang

Permainan **Warnai gambar** memakai enam gambar SVG hitam-putih yang disimpan lokal di `public/coloring/`. Berkas aslinya berasal dari koleksi publik [pflajsman/coloring-book](https://github.com/pflajsman/coloring-book), yang menyimpan clipart dari Openclipart. Metadata pada keenam sumber mengacu ke Openclipart atau dedikasi domain publik **CC0**.

| Gambar | Aset lokal | Sumber SVG |
|---|---|---|
| Kucing | `cat.svg` | [cat.svg](https://github.com/pflajsman/coloring-book/blob/main/public/templates/cat.svg) |
| Bebek | `duck.svg` | [duck.svg](https://github.com/pflajsman/coloring-book/blob/main/public/templates/duck.svg) |
| Burung hantu | `owl.svg` | [owl.svg](https://github.com/pflajsman/coloring-book/blob/main/public/templates/owl.svg) |
| Ikan | `fish.svg` | [fish.svg](https://github.com/pflajsman/coloring-book/blob/main/public/templates/fish.svg) |
| Domba | `sheep.svg` | [sheep.svg](https://github.com/pflajsman/coloring-book/blob/main/public/templates/sheep.svg) |
| Kelinci | `rabbit.svg` | [rabbit.svg](https://github.com/pflajsman/coloring-book/blob/main/public/templates/rabbit.svg) |

Enam file tambahan bernama `cc0-cat.svg`, `cc0-dog.svg`, `cc0-owl.svg`, `cc0-rabbit.svg`, `cc0-tree.svg`, dan `cc0-sun.svg` juga tersimpan di direktori yang sama sebagai alternatif gambar, tetapi belum ditampilkan dalam pilihan mewarnai aktif.

**Lisensi:** sumber-sumber yang dipilih adalah clipart Openclipart yang dipublikasikan di bawah [CC0/Public Domain](https://creativecommons.org/publicdomain/zero/1.0/). Jangan menganggap semua file dari repository asal memiliki lisensi yang sama; periksa setiap karya baru sebelum dipakai.

## Integrasi

- SVG disajikan sebagai gambar lokal dan hanya berfungsi sebagai garis pandu di atas canvas.
- Anak memilih krayon lalu **menggores dengan jari**. Warna tidak lagi langsung memenuhi bidang saat diketuk.
- Pemilihan warna, ukuran krayon, penghapus, urungkan, dan hapus semua tersedia tanpa backend.
- Berkas SVG aktif tidak memuat script atau external runtime. Deklarasi DOCTYPE dan metadata lama dihilangkan saat penyalinan.
- UI tetap tanpa iklan, akun, maupun unggahan gambar anak.
