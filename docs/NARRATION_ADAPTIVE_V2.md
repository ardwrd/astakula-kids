# Astakula Kids — Standar narator adaptif v2

Status: kandidat untuk uji dengar, bukan rekaman aktif.

Model Eleven v4 dan Voice Design yang sama. Kecepatan putar 1x.
Instruksi hangat, berirama tenang, dengan jeda hanya ketika diperlukan.
Pertanyaan terdengar penasaran dan memberi ruang berpikir.
Pujian singkat, spontan, ceria; tanpa slow tag atau jeda dramatis.
Dukungan saat salah ramah, tanpa memarahi.
Huruf, angka dan nama benda diucapkan jelas dan ringkas.

Catalog v2 mencakup 104 klip aktif: 46 kuis/umum dan 58 aktivitas.
Tiga soal pencampuran warna arsip tidak diregenerasi.

Tiga audio sampel yang disetujui disalin tanpa penggunaan kredit baru:
- global/correct dari pujian.mp3;
- questions/warna-3-2 dari pertanyaan-warna.mp3;
- activities/instructions/dice-match dari instruksi-dadu.mp3.

Workflow menghasilkan maksimum sepuluh klip tiap batch; batch pertama
memerlukan paling banyak tujuh panggilan TTS baru. Setelah setiap batch,
dengarkan kandidat di halaman sampel audio yang SUDAH ADA. Untuk batch
berikutnya jalankan GitHub Actions > Generate adaptive kids narrator batch.

Semua klip kandidat disimpan di public/audio/previews/indo-v4-adaptive-v2/.
Versi aktif di src/data/audioRevision.json tidak diganti otomatis.
Jika API mencapai batas kredit, hasil yang berhasil tetap disimpan.

Jangan mempromosikan semua audio tanpa uji dengar setiap jenis kalimat.
