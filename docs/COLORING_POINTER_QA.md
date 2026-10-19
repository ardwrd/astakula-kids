# Uji gesture mewarnai (perangkat layar sentuh)

Bagian dari QA Astakula Kids untuk aktivitas Dunia Warna → Warnai gambar.

1. Goreskan jari dan angkat secara normal. **Urungkan** harus aktif dan goresan terlihat.
2. Buat goresan kedua, lalu tekan **Urungkan**. Hanya goresan kedua yang hilang.
3. Mulai menggores, kemudian paksa pembatalan sentuhan (misalnya gesture sistem atau berpindah aplikasi). Goresan yang terputus **tidak boleh** tersimpan sebagai goresan baru.
4. Ketika masih menekan/menyentuh kanvas, tekan **Hapus semua** atau **Gambar berikutnya** dengan interaksi yang tersedia. Goresan lama tidak boleh muncul pada gambar selanjutnya.
5. Ulangi tes dengan mouse dan touchscreen; pada desktop, gerakan mouse kanan tidak boleh menghasilkan goresan.
6. Uji pada kanvas yang ukurannya mengecil di ponsel. Titik sentuhan harus tetap selaras dengan krayon.
7. Pastikan tombol **Penghapus**, **Urungkan**, dan **Hapus semua** tetap bekerja setelah gesture dibatalkan.

Tes build otomatis memeriksa kompilasi TypeScript, tetapi perilaku pointer capture perlu diverifikasi langsung dengan browser dan perangkat sentuh.
