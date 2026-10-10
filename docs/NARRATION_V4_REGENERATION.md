# Astakula Kids — Standar Narasi Bahasa Indonesia (Eleven v4)

Status: **38/38 REKAMAN SELESAI — DISETUJUI DAN AKTIF DI APLIKASI**. Rekaman lama disimpan untuk rollback.

## Tujuan

Menyampaikan instruksi dan pertanyaan kepada anak prasekolah (di bawah 6 tahun) dengan
pelafalan bahasa Indonesia yang wajar, intonasi ramah, tempo nyaman, dan respons
positif. Bahasa harus jelas, tidak terdengar seperti terjemahan bahasa Inggris,
tidak terlalu dramatis, dan tidak membentak.

## Keputusan teknis

- Model: `eleven_v4`; `language_code: id`.
- Voice Design aktif: `wtqqNhC5H27DEv1Ojo4B` (akun ElevenLabs kedua). Rekaman lama tetap menggunakan suara dari akun pertama.
- Stability 0,60; Similarity 0,75 sebagai titik awal, bukan jaminan hasil.
- Eleven v4 tidak mendukung SSML `<break>` atau voice speed API. Gunakan tanda
  baca seperlunya, elipsis singkat, struktur kalimat, dan satu audio tag
  per ujaran (`[warmly]`, `[gently]`, `[curious]`, `[happily]`).
- Hindari emoji, angka digit, kapitalisasi berlebihan, dan pengulangan tanda seru
  dalam teks TTS. Angka dieja; huruf perlu diuji manual pelafalannya.
- Teks layar dalam `src/data/content.json` tetap menjadi konten pedagogis
  kanonis. Teks TTS tersimpan terpisah di `src/data/narrationV4.json`.
- Semua 38 kunci audio, termasuk 30 soal dan 5 pengantar, harus dipertahankan.

## Riwayat dan prosedur produksi (selesai pada 10 Oktober 2026)

1. **Naskah** — audit dan edit 38 kalimat, lalu jalankan
   `python scripts/generate_v4_candidates.py --validate`.
   Build CI harus berhasil.
2. **Uji A (4 klip)** — buat `global/welcome`, `global/correct`,
   `questions/warna-3-1` (perintah), dan
   `questions/warna-3-2` (pertanyaan). Dengarkan di
   `/audio/candidates/indo-v4-v1/index.html`.
3. **Uji B** — minta persetujuan manusia pada empat aspek:
   (a) aksen Indonesia alami; (b) tekanan/kadens pertanyaan;
   (c) instruksi tidak keras; (d) tempo jelas untuk usia 3 tahun.
   Nilai juga suara huruf "A", "B", "C", dan suku kata "pa", "gi".
4. **Batch tertutup** — setelah *persetujuan eksplisit* pengguna, jalankan
   workflow **Stage Eleven v4 Indonesian candidates** dengan limit sesuai
   sisa kredit. Default hanya 3 klip per run; `limit=38` boleh digunakan
   setelah pengguna menyetujui seluruh naskah dan pembiayaan. **Batch disetujui dan selesai, 38/38.**
   Berkas kandidat ditulis ke `public/audio/candidates/indo-v4-v1/`.
5. **Verifikasi teknis** — jumlah tepat 38/38, durasi dan kualitas didengar,
   hash/ukuran berkas tercantum di `manifest.json`, tidak ada MP3 kosong,
   suara konsisten antardunia dan antarjenis kegiatan.
6. **Promosi tertutup** — hanya atas persetujuan eksplisit, ubah
   `src/data/audioRevision.json` dari `legacy-v2` ke `indo-v4-v1`,
   basePath menjadi `audio/candidates/indo-v4-v1/` dan
   defaultPlaybackRate menjadi `1.0`. Lakukan build, uji di HP,
   lalu deploy. **Sudah diterapkan dengan 38/38 MP3 V4**, tanpa menimpa atau memindahkan MP3 lama.
7. **Rollback cepat** — kembalikan `audioRevision.json` ke
   `legacy-v2`, `audio/generated/`, defaultPlaybackRate `0.85`.
   Audio versi lama tetap berada di repository.

## Kriteria penolakan

- Suara terdengar beraksen asing atau kurang Indonesia.
- Nada tanya dibaca seperti perintah atau sebaliknya.
- Jeda elipsis menjadi terlalu teatrikal atau lama.
- Pujian terlalu keras/mengejutkan.
- Teks yang diucapkan menghilangkan atau membocorkan jawaban.
- Kode huruf/suku kata terdengar salah.
- Rekaman tidak bisa diputar di browser Android.
- Biaya melebihi kredit yang dialokasikan.

## Keamanan, biaya, dan hak pakai

Kunci ElevenLabs **hanya** berada di GitHub Actions Secret;
jangan disimpan pada frontend maupun di repository.
Audio Eleven v4 saat ini aktif melalui `src/data/audioRevision.json` dan disimpan terpisah dari rekaman V2 lama.
Setiap permintaan TTS baru menghabiskan jatah/kredit sesuai ketentuan akun.
Pada paket Free, ikuti syarat atribusi dan penggunaan nonkomersial ElevenLabs.
