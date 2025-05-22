📚 Quiz App - JavaScript
Aplikasi kuis interaktif berbasis web yang mengambil pertanyaan dari Open Trivia DB API. Pengguna dapat memilih kategori dan tingkat kesulitan, menjawab pertanyaan, melihat skor, dan melacak riwayat kuis mereka.

🚀 Fitur
🔄 Pengambilan soal secara dinamis dari API

🧠 Acak jawaban menggunakan algoritma Fisher-Yates

✅ Validasi jawaban benar atau salah

📊 Skor akhir dengan pesan motivasi

💾 Penyimpanan riwayat skor di localStorage

🧹 Fitur penghapusan riwayat

🧩 Decode HTML entities (karakter khusus dari API)

🖥️ Antarmuka berbasis DOM

📁 Struktur Kelas
Question
Mewakili satu soal dalam kuis.

question: Soal dalam format HTML

correctAnswer: Jawaban benar

incorrectAnswers: Array jawaban salah

allAnswers: Semua jawaban (diacak)

shuffleAnswers(): Mengacak jawaban

isCorrect(answer): Mengecek kebenaran jawaban

getDecodedQuestion(): Mengubah HTML entity menjadi teks biasa

getDecodedAnswers(): Sama seperti getDecodedQuestion, tapi untuk semua jawaban

Quiz
Mengatur seluruh siklus hidup kuis.

fetchQuestions(): Mengambil soal dari API berdasarkan filter

startQuiz(): Mulai kuis, reset skor & indeks soal

displayCurrentQuestion(): Tampilkan pertanyaan saat ini

selectAnswer(answer, buttonElement): Evaluasi jawaban

nextQuestion(): Navigasi ke soal berikutnya

endQuiz(): Akhiri kuis dan tampilkan hasil

showResult(): Tampilkan skor dan pesan motivasi

saveScore(): Simpan skor ke localStorage

getHistory(), showHistory(), clearHistory(): Manajemen riwayat

showSection(), showElement(), hideElement(): Manajemen tampilan UI

🛠️ Instalasi & Penggunaan
Clone atau unduh repositori ini.

Buka file index.html di browser modern.

Pilih kategori & tingkat kesulitan, lalu klik Mulai Kuis.

Jawab pertanyaan dan lihat hasil akhir!

Cek riwayat skor melalui tombol Lihat Riwayat.

🧪 Dependensi
Native JavaScript (tanpa library eksternal)

API dari Open Trivia DB

🧠 Tips Tambahan
Service Worker (opsional): Template kode sudah disiapkan untuk mendukung mode offline.

Progressive Web App (PWA): Dapat diperluas untuk mendukung instalasi ke perangkat.

📌 Catatan Pengembangan
DOM elements seperti #startQuiz, #questionText, #nextQuestion dsb. harus tersedia di file HTML.

Gaya tombol seperti .answer-btn, .correct, dan .incorrect perlu didefinisikan di CSS.

📜 Lisensi
Proyek ini bersifat open-source. Bebas digunakan dan dimodifikasi untuk pembelajaran atau pengembangan lebih lanjut.
