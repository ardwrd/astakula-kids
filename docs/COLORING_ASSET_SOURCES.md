# Media mewarnai — standar ilustrasi Astakula Kids

## Paket aktif (16 Oktober 2026)

Enam ilustrasi di `public/coloring/` dibuat khusus untuk proyek ini dengan bentuk dasar SVG (bukan salinan dari worksheet Instagram). Urutan sesi pertama: **Balon → Matahari → Ikan → Bunga → Rumah → Mobil**. Sesi selanjutnya dapat diacak saat anak memilih **Mewarnai lagi**.

| Gambar | File aktif | Karakteristik |
|---|---|---|
| Balon | `balloon.svg` | Satu bidang utama, sedikit garis |
| Matahari | `sun.svg` | Lingkaran besar dan sinar sederhana |
| Ikan | `fish.svg` | Badan oval, ekor, mata, satu sirip |
| Bunga | `flower.svg` | Kelopak besar, pusat, batang, dua daun |
| Rumah | `house.svg` | Atap, dinding, pintu, dua jendela |
| Mobil | `car.svg` | Badan, dua jendela, roda besar |

Aturan aset aktif:

- Semua SVG memiliki **viewBox 0 0 320 270**, latar transparan, dan outline `#24282f` dengan **stroke-width 6** serta `round` cap/join.
- Tidak ada tekstur, garis bulu/sisik, bayangan, gradient, gambar raster, skrip, ataupun tautan runtime.
- Elemen utama cukup besar untuk anak usia 3–5 tahun; satu gambar per sesi agar layar ponsel tidak padat.
- Kanvas mewarnai dan overlay SVG *harus* memakai koordinat dan rasio yang sama (tanpa padding gambar). Warna digores dengan jari pada kanvas; garis tetap terlihat di atas warna.
- Validasi otomatis: `scripts/validate_coloring_assets.py` dijalankan oleh CI build dan deploy.

## Aset lama

Sebelumnya digunakan clipart `cat.svg`, `duck.svg`, `owl.svg`, `fish.svg`, `sheep.svg`, dan `rabbit.svg` dari [pflajsman/coloring-book](https://github.com/pflajsman/coloring-book) / Openclipart (metadata sumber CC0/Public Domain). Aset-asset rumit tersebut **tidak lagi digunakan**. File `fish.svg` telah ditulis ulang; lainnya dihapus dari bundle aktif dan masih dapat ditinjau dalam riwayat Git.

Enam aset eksperimen `cc0-*.svg` tetap tersimpan sebagai bahan evaluasi, **tidak ditampilkan dalam pilihan aktif**. Periksa ulang asal/lisensi sebelum dipakai dalam konten publik.

## Kualitas UX

Tetap mendukung sembilan warna, tiga ukuran krayon, penghapus, urungkan, hapus semua, dan gambar berikutnya. Tidak memerlukan akun, iklan, backend, atau pengumpulan data anak. Perlu QA fisik pada Android/iOS sebelum rilis final.
