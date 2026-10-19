# QA antarmuka mobile — Astakula Kids

Periksa tampilan langsung di browser ponsel pada lebar **320, 360, 375, 390, 414, dan 480 px** (portrait). Bandingkan juga tablet 768 px dan desktop.

## Beranda dan pemilihan permainan
- Kartu Dunia berbaris dengan rapi. Pada lebar 320–360 px, kartu menjadi satu kolom agar tombol **Ayo main** tidak terjepit.
- Pada 375–480 px, kartu Dunia tetap dua kolom dan tidak memotong judul atau CTA.
- Tombol **Main sekarang** pada kartu pilihan permainan tidak melewati batas kartu.
- Tombol kembali tetap terbaca pada halaman pemilihan permainan dan semua permainan.

## Quiz
- Ketiga pilihan jawaban tersusun vertikal dengan lebar sama pada lebar 480 px ke bawah.
- Ilustrasi dan label pada tiap pilihan sejajar, bisa dibaca, dan area sentuh cukup besar.
- Untuk Dunia Warna, tiap pilihan tetap sebuah blok warna besar dengan label yang jelas.
- Setelah menjawab benar, tombol **Lanjut** mengambil lebar panel dan tidak bertabrakan dengan teks umpan balik.

## Permainan interaktif
- Menebalkan garis: **Hapus garis** dan **Pakai titik pandu** satu baris; **Gambar berikutnya** memakai baris penuh.
- Mewarnai: tiga ukuran krayon membagi satu baris, **Penghapus** dan **Urungkan** membagi baris berikutnya.
- Di bawah kanvas, **Hapus semua** dan **Gambar berikutnya** berbagi baris dengan tinggi dan lebar seragam.
- Mini-game angka dan huruf: aksi ulangi serta lanjut tidak meninggalkan tombol tunggal yang menyempil di baris kosong.
- Tidak ada tombol atau kartu terpotong di kanan layar dan tidak ada horizontal scroll.

## Perilaku
- Pilihan jawaban, audio, tap, gambar, dan navigasi tetap berfungsi.
- Mode lanskap / zoom teks 200% tidak memotong teks penting.
- Fokus keyboard dapat terlihat; tombol minimum 44–48 px tetap mudah disentuh.

> CI memeriksa kompilasi TypeScript dan build. Checklist ini untuk validasi visual perangkat nyata; tidak menggantikan pengujian browser.
