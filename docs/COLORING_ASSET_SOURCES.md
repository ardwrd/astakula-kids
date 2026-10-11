# Astakula Kids — Sumber Gambar Mewarnai

Enam gambar halaman mewarnai merupakan **line art CC0 (Creative Commons Zero / public domain)** dari Openclipart dan berkas aslinya yang tersimpan dalam koleksi publik [pflajsman/coloring-book](https://github.com/pflajsman/coloring-book/tree/main/public/templates).

Semua gambar disimpan **lokal** di `public/coloring/` agar tidak memerlukan hotlink atau pemanggilan API pada perangkat anak. Berkas SVG mempertahankan informasi kreator dan CC0 di bagian `metadata`. XML header/DOCTYPE tidak dimasukkan saat disalin. Hanya sumber dengan metadata dedikasi domain publik yang dipakai.

| Aset Astakula Kids | Pembuat yang tercantum di metadata | Sumber |
| --- | --- | --- |
| `cc0-cat.svg` | gammillian | [Openclipart: Cat Line Art](https://openclipart.org/detail/75877/cat-line-art-by-gammillian), [arsip SVG](https://github.com/pflajsman/coloring-book/blob/main/public/templates/cat.svg) |
| `cc0-rabbit.svg` | Frank Tremmel | [arsip SVG + metadata CC0](https://github.com/pflajsman/coloring-book/blob/main/public/templates/rabbit.svg) |
| `cc0-dog.svg` | Frank Tremmel | [arsip SVG + metadata CC0](https://github.com/pflajsman/coloring-book/blob/main/public/templates/dog.svg) |
| `cc0-owl.svg` | gammillian | [Openclipart: Owl Line Art](https://openclipart.org/detail/75271/owl-line-art-by-gammillian), [arsip SVG](https://github.com/pflajsman/coloring-book/blob/main/public/templates/owl.svg) |
| `cc0-tree.svg` | Frank Tremmel | [arsip SVG + metadata CC0](https://github.com/pflajsman/coloring-book/blob/main/public/templates/tree.svg) |
| `cc0-sun.svg` | gammillian | [Openclipart: Sun Line Art](https://openclipart.org/detail/75523/sun-line-art-by-gammillian), [arsip SVG](https://github.com/pflajsman/coloring-book/blob/main/public/templates/sun.svg) |

Openclipart menjelaskan bahwa aset yang dibagikan melalui perpustakaannya dirilis dengan dedikasi CC0: [FAQ lisensi](https://openclipart.org/share).

## Integrasi teknis

- `src/ColoringActivity.tsx` menampilkan SVG sumber sebagai lapisan garis **di atas** canvas krayon berwarna. Anak mewarnai dengan gestur jari, bukan klik-to-fill.
- `src/styles.css` mencegah seleksi teks dan callout Android pada area mewarnai.
- Sumber tidak dimuat dari Google atau domain lain saat dimainkan.
- Jenis permainan ini tetap mempunyai tombol urungkan, hapus, penghapus, pilihan warna, ukuran kuas, dan gambar berikutnya.

Keterangan: Google digunakan untuk **menemukan** karya. Google Images bukan sumber hak cipta; tautan asal dan lisensi sumber yang menentukan kelayakan penggunaan.
