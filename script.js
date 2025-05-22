// Class untuk merepresentasikan satu pertanyaan
class Question {
    constructor(questionData) {
        this.question = questionData.question;
        this.correctAnswer = questionData.correct_answer;
        this.incorrectAnswers = questionData.incorrect_answers;
        this.category = questionData.category;
        this.difficulty = questionData.difficulty;
        this.allAnswers = this.shuffleAnswers();
    }

    // Method untuk mengacak urutan jawaban
    shuffleAnswers() {
        const answers = [...this.incorrectAnswers, this.correctAnswer];
        // Algorithm Fisher-Yates untuk shuffle
        for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
        }
        return answers;
    }

    // Method untuk mengecek apakah jawaban benar
    isCorrect(answer) {
        return answer === this.correctAnswer;
    }

    // Method untuk decode HTML entities (API kadang mengirim karakter HTML)
    getDecodedQuestion() {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = this.question;
        return textarea.value;
    }

    getDecodedAnswers() {
        return this.allAnswers.map(answer => {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = answer;
            return textarea.value;
        });
    }
}

// Class utama untuk mengatur quiz
class Quiz {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.totalQuestions = 10;
        this.isQuizActive = false;

        // Inisialisasi event listeners
        this.initializeEventListeners();

        // Load riwayat dari localStorage saat aplikasi dimulai
        this.loadHistory();
    }

    // Method untuk setup semua event listener
    initializeEventListeners() {
        // Event listener untuk tombol menu
        document.getElementById('startQuiz').addEventListener('click', () => this.startQuiz());
        document.getElementById('showHistory').addEventListener('click', () => this.showHistory());
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());

        // Event listener untuk navigasi quiz
        document.getElementById('nextQuestion').addEventListener('click', () => this.nextQuestion());
        document.getElementById('playAgain').addEventListener('click', () => this.resetQuiz());
        document.getElementById('backToMenu').addEventListener('click', () => this.showMenu());
        document.getElementById('backFromHistory').addEventListener('click', () => this.showMenu());
    }

    // Method async untuk mengambil pertanyaan dari API
    async fetchQuestions() {
        try {
            const category = document.getElementById('category').value;
            const difficulty = document.getElementById('difficulty').value;

            // Buat URL API dengan parameter
            let apiUrl = `https://opentdb.com/api.php?amount=${this.totalQuestions}&type=multiple`;

            if (category) {
                apiUrl += `&category=${category}`;
            }

            if (difficulty) {
                apiUrl += `&difficulty=${difficulty}`;
            }

            console.log('Mengambil data dari:', apiUrl);

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.response_code !== 0) {
                throw new Error('Tidak ada pertanyaan yang tersedia untuk kriteria ini');
            }

            return data.results;

        } catch (error) {
            console.error('Error mengambil pertanyaan:', error);
            alert('Gagal mengambil pertanyaan. Pastikan koneksi internet aktif!');
            this.showMenu();
            return null;
        }
    }

    // Method untuk memulai quiz
    async startQuiz() {
        this.showSection('quizArea');
        this.showElement('loadingQuestions');
        this.hideElement('questionContainer');

        // Reset data quiz
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.isQuizActive = true;

        // Ambil pertanyaan dari API
        const questionData = await this.fetchQuestions();

        if (!questionData) {
            return; // Error sudah ditangani di fetchQuestions
        }

        // Buat object Question dari data API
        this.questions = questionData.map(q => new Question(q));

        // Mulai tampilkan pertanyaan pertama
        this.hideElement('loadingQuestions');
        this.showElement('questionContainer');
        this.displayCurrentQuestion();
    }

    // Method untuk menampilkan pertanyaan saat ini
    displayCurrentQuestion() {
        const question = this.questions[this.currentQuestionIndex];

        // Update nomor pertanyaan dan skor
        document.getElementById('questionNumber').textContent =
            `Pertanyaan ${this.currentQuestionIndex + 1} dari ${this.totalQuestions}`;
        document.getElementById('score').textContent = `Skor: ${this.score}`;

        // Tampilkan pertanyaan
        document.getElementById('questionText').textContent = question.getDecodedQuestion();

        // Buat tombol jawaban
        this.renderAnswerButtons(question);

        // Sembunyikan tombol next
        this.hideElement('nextQuestion');
    }

    // Method untuk membuat tombol-tombol jawaban
    renderAnswerButtons(question) {
        const container = document.getElementById('answersContainer');
        container.innerHTML = '';

        const answers = question.getDecodedAnswers();

        // Gunakan map untuk membuat tombol jawaban
        answers.map((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.addEventListener('click', () => this.selectAnswer(answer, button));
            container.appendChild(button);
            return button;
        });
    }

    // Method untuk menangani pemilihan jawaban
    selectAnswer(selectedAnswer, buttonElement) {
        if (!this.isQuizActive) return;

        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = question.isCorrect(selectedAnswer);

        // Disable semua tombol
        const allButtons = document.querySelectorAll('.answer-btn');
        allButtons.forEach(btn => {
            btn.classList.add('disabled');
            btn.style.pointerEvents = 'none';

            // Beri warna pada jawaban benar dan salah
            if (btn.textContent === question.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn === buttonElement && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Update skor jika benar
        if (isCorrect) {
            this.score++;
        }

        // Tampilkan tombol next
        this.showElement('nextQuestion');

        // Update display skor
        document.getElementById('score').textContent = `Skor: ${this.score}`;
    }

    // Method untuk pindah ke pertanyaan berikutnya
    nextQuestion() {
        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < this.totalQuestions) {
            this.displayCurrentQuestion();
        } else {
            this.endQuiz();
        }
    }

    // Method untuk mengakhiri quiz
    endQuiz() {
        this.isQuizActive = false;
        this.saveScore();
        this.showResult();
    }

    // Method untuk menampilkan hasil akhir
    showResult() {
        this.showSection('resultArea');

        const finalScore = document.getElementById('finalScoreValue');
        const scoreMessage = document.getElementById('scoreMessage');

        finalScore.textContent = this.score;

        // Pesan berdasarkan skor
        let message = '';
        const percentage = (this.score / this.totalQuestions) * 100;

        if (percentage >= 90) {
            message = 'Luar biasa! Anda sangat pintar!';
        } else if (percentage >= 70) {
            message = 'Bagus sekali! Pengetahuan Anda cukup luas!';
        } else if (percentage >= 50) {
            message = 'Tidak buruk! Terus belajar ya!';
        } else {
            message = 'Jangan menyerah! Coba lagi untuk hasil yang lebih baik!';
        }

        scoreMessage.textContent = message;
    }

    // Method untuk menyimpan skor ke localStorage
    saveScore() {
        const history = this.getHistory();
        const newScore = {
            date: new Date().toLocaleString('id-ID'),
            score: this.score,
            total: this.totalQuestions,
            percentage: Math.round((this.score / this.totalQuestions) * 100)
        };

        history.unshift(newScore); // Tambah di awal array

        // Batasi riwayat maksimal 10 entri
        if (history.length > 10) {
            history.splice(10);
        }

        localStorage.setItem('quizHistory', JSON.stringify(history));
    }

    // Method untuk mengambil riwayat dari localStorage
    getHistory() {
        const history = localStorage.getItem('quizHistory');
        return history ? JSON.parse(history) : [];
    }

    // Method untuk memuat dan menampilkan riwayat
    loadHistory() {
        // Method ini dipanggil saat inisialisasi
        // Kita tidak perlu melakukan apa-apa di sini
        // karena history akan dimuat saat tombol diklik
    }

    // Method untuk menampilkan halaman riwayat
    showHistory() {
        this.showSection('historyArea');

        const history = this.getHistory();
        const container = document.getElementById('historyContainer');

        if (history.length === 0) {
            container.innerHTML = '<div class="no-history">Belum ada riwayat quiz</div>';
            return;
        }

        // Gunakan map untuk membuat HTML riwayat
        const historyHTML = history.map(item => `
            <div class="history-item">
                <div class="history-date">${item.date}</div>
                <div class="history-score">
                    Skor: ${item.score}/${item.total} (${item.percentage}%)
                </div>
            </div>
        `).join('');

        container.innerHTML = historyHTML;
    }

    // Method untuk menghapus riwayat
    clearHistory() {
        if (confirm('Yakin ingin menghapus semua riwayat?')) {
            localStorage.removeItem('quizHistory');
            alert('Riwayat berhasil dihapus!');
        }
    }

    // Method untuk reset quiz dan kembali ke menu
    resetQuiz() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.isQuizActive = false;
        this.showMenu();
    }

    // Method untuk menampilkan menu utama
    showMenu() {
        this.showSection('menu');
    }

    // Method utility untuk menampilkan section tertentu
    showSection(sectionId) {
        const sections = ['menu', 'quizArea', 'resultArea', 'historyArea'];
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (section === sectionId) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    }

    // Method utility untuk menampilkan element
    showElement(elementId) {
        document.getElementById(elementId).classList.remove('hidden');
    }

    // Method utility untuk menyembunyikan element
    hideElement(elementId) {
        document.getElementById(elementId).classList.add('hidden');
    }
}

// Inisialisasi aplikasi saat DOM sudah siap
document.addEventListener('DOMContentLoaded', function () {
    console.log('Quiz App dimulai!');
    const quiz = new Quiz();
});

// Error handling global untuk catch error yang tidak tertangani
window.addEventListener('error', function (e) {
    console.error('Error aplikasi:', e.error);
});

// Service Worker untuk offline capability (opsional, untuk mahasiswa yang ingin eksplorasi)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        // Kita tidak implementasi service worker dalam contoh ini
        // tapi ini menunjukkan awareness terhadap progressive web app
        console.log('Browser mendukung Service Worker');
    });
}