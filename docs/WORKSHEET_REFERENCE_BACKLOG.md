# Inspirasi worksheet untuk aktivitas layar sentuh

Referensi: lima screenshot contoh pembelajaran yang dikirim pengguna (Oktober 2026). Dokumen ini mencatat **mekanisme**, bukan menyalin ilustrasi, tipografi, atau tata letak kreator.

| Ide worksheet | Adaptasi interaktif Astakula Kids | Dunia | Prioritas |
|---|---|---|---|
| Mewarnai berdasarkan huruf vokal | Dengarkan huruf, tap kotak huruf yang sesuai; warna muncul setelah pilihan tepat | Huruf + Warna | Selesai (interaktif) |
| Kartu angka dan titik dadu | Cocokkan jumlah titik dengan angka melalui 3–4 kartu besar | Angka | Selesai (interaktif) |
| Tarik garis menurut urutan angka | Hubungkan enam titik besar satu per satu; tampilkan garis dan suara saat tepat | Angka + Warna | Selesai (interaktif) |
| Kotak angka berwarna | Mulai dari grid 2×2, pilih warna berdasarkan angka; berkembang ke 3×2 | Angka + Warna | Selesai (interaktif) |
| Hitung sayur dalam keranjang | Gunakan 2–3 objek berukuran besar dan penjumlahan visual, tanpa persamaan rumit | Angka | Selesai (interaktif) |

Aturan adaptasi: satu instruksi pendek per tampilan, target sentuh minimal 44×44 CSS px, mulai 3–6 pilihan besar, audio bahasa Indonesia yang terkoordinasi, tidak ada pemilihan usia, tidak menampilkan worksheet padat dalam satu layar. Kelima mekanik sudah diimplementasikan sebagai permainan interaktif terpisah pada `src/WorksheetActivities.tsx`. Sepuluh klip Eleven v4 sudah dibuat: lima instruksi permainan dan lima arahan huruf vokal. Semua permainan memiliki tombol **Dengar petunjuk**. Hubungkan titik memanfaatkan klip angka lama, dan kotak warna menyebutkan angka warna yang dipilih. Audio benar/salah tetap memakai rekaman yang telah disetujui. Jangan mengubah 38 narasi kuis yang telah disetujui tanpa pemeriksaan manifest/audio.
