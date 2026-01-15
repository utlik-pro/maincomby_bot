/**
 * Quiz System
 * Система тестирования знаний по безопасности промптов
 */

class Quiz {
  constructor(container) {
    this.container = container;
    this.questions = [];
    this.currentQuestion = 0;
    this.score = 0;
    this.answered = false;

    this.init();
  }

  init() {
    const questionsData = this.container.dataset.questions;
    if (questionsData) {
      this.questions = JSON.parse(questionsData);
    } else {
      this.parseQuestionsFromDOM();
    }
    this.bindEvents();
  }

  parseQuestionsFromDOM() {
    const questionElements = this.container.querySelectorAll('.quiz-question-item');
    questionElements.forEach(el => {
      const options = [];
      el.querySelectorAll('.quiz-option').forEach((opt, idx) => {
        options.push({
          text: opt.textContent.trim(),
          correct: opt.dataset.correct === 'true'
        });
      });
      this.questions.push({
        question: el.querySelector('.quiz-question-text')?.textContent || '',
        options: options,
        explanation: el.dataset.explanation || ''
      });
    });
  }

  bindEvents() {
    const options = this.container.querySelectorAll('.quiz-option');
    options.forEach(option => {
      option.addEventListener('click', () => this.selectOption(option));
    });

    const checkBtn = this.container.querySelector('.quiz-check-btn');
    checkBtn?.addEventListener('click', () => this.checkAnswer());

    const nextBtn = this.container.querySelector('.quiz-next-btn');
    nextBtn?.addEventListener('click', () => this.nextQuestion());

    const resetBtn = this.container.querySelector('.quiz-reset-btn');
    resetBtn?.addEventListener('click', () => this.reset());
  }

  selectOption(option) {
    if (this.answered) return;
    this.container.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    option.classList.add('selected');
  }

  checkAnswer() {
    const selected = this.container.querySelector('.quiz-option.selected');
    if (!selected || this.answered) return;

    this.answered = true;
    const isCorrect = selected.dataset.correct === 'true';

    this.container.querySelectorAll('.quiz-option').forEach(opt => {
      if (opt.dataset.correct === 'true') {
        opt.classList.add('correct');
      } else if (opt === selected) {
        opt.classList.add('incorrect');
      }
    });

    if (isCorrect) this.score++;

    const feedback = this.container.querySelector('.quiz-feedback');
    if (feedback) {
      feedback.classList.add('show');
      feedback.classList.toggle('correct', isCorrect);
      feedback.classList.toggle('incorrect', !isCorrect);

      const feedbackText = feedback.querySelector('.quiz-feedback-text');
      if (feedbackText) {
        if (isCorrect) {
          feedbackText.innerHTML = '<strong>Правильно!</strong> ' + (selected.dataset.explanation || '');
        } else {
          const correctOption = this.container.querySelector('.quiz-option[data-correct="true"]');
          feedbackText.innerHTML = `<strong>Неправильно.</strong> Правильный ответ: ${correctOption?.textContent || ''}`;
        }
      }
    }

    const checkBtn = this.container.querySelector('.quiz-check-btn');
    const nextBtn = this.container.querySelector('.quiz-next-btn');
    checkBtn?.classList.add('hidden');
    nextBtn?.classList.remove('hidden');
    this.updateScoreDisplay();
  }

  nextQuestion() {
    const resetBtn = this.container.querySelector('.quiz-reset-btn');
    const nextBtn = this.container.querySelector('.quiz-next-btn');
    nextBtn?.classList.add('hidden');
    resetBtn?.classList.remove('hidden');
  }

  reset() {
    this.answered = false;
    this.score = 0;

    this.container.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.remove('selected', 'correct', 'incorrect');
    });

    const feedback = this.container.querySelector('.quiz-feedback');
    feedback?.classList.remove('show', 'correct', 'incorrect');

    const checkBtn = this.container.querySelector('.quiz-check-btn');
    const nextBtn = this.container.querySelector('.quiz-next-btn');
    const resetBtn = this.container.querySelector('.quiz-reset-btn');

    checkBtn?.classList.remove('hidden');
    nextBtn?.classList.add('hidden');
    resetBtn?.classList.add('hidden');
    this.updateScoreDisplay();
  }

  updateScoreDisplay() {
    const scoreEl = this.container.querySelector('.quiz-score');
    if (scoreEl) {
      scoreEl.textContent = `Счёт: ${this.score}`;
    }
  }
}

class MultiQuiz {
  constructor(container) {
    this.container = container;
    this.questions = JSON.parse(container.dataset.questions || '[]');
    this.currentIndex = 0;
    this.answers = [];
    this.score = 0;
    this.init();
  }

  init() {
    this.renderQuestion();
    this.bindEvents();
  }

  renderQuestion() {
    const question = this.questions[this.currentIndex];
    if (!question) return;

    const questionArea = this.container.querySelector('.quiz-question-area');
    if (!questionArea) return;

    questionArea.innerHTML = `
      <div class="quiz-progress">Вопрос ${this.currentIndex + 1} из ${this.questions.length}</div>
      <div class="quiz-question">${question.question}</div>
      <div class="quiz-options">
        ${question.options.map((opt, i) => `
          <div class="quiz-option" data-index="${i}" data-correct="${opt.correct}">
            <span class="quiz-option-marker"></span>
            <span class="quiz-option-text">${opt.text}</span>
          </div>
        `).join('')}
      </div>
      <div class="quiz-feedback"></div>
      <div class="quiz-actions">
        <button class="btn btn-primary quiz-check-btn">Проверить</button>
        <button class="btn btn-secondary quiz-next-btn hidden">Далее</button>
      </div>
    `;
    this.bindQuestionEvents();
  }

  bindEvents() {
    const resetBtn = this.container.querySelector('.quiz-reset-all-btn');
    resetBtn?.addEventListener('click', () => this.resetAll());
  }

  bindQuestionEvents() {
    const options = this.container.querySelectorAll('.quiz-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => this.selectOption(opt));
    });

    const checkBtn = this.container.querySelector('.quiz-check-btn');
    checkBtn?.addEventListener('click', () => this.checkAnswer());

    const nextBtn = this.container.querySelector('.quiz-next-btn');
    nextBtn?.addEventListener('click', () => this.nextQuestion());
  }

  selectOption(option) {
    if (option.classList.contains('correct') || option.classList.contains('incorrect')) return;
    this.container.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    option.classList.add('selected');
  }

  checkAnswer() {
    const selected = this.container.querySelector('.quiz-option.selected');
    if (!selected) return;

    const isCorrect = selected.dataset.correct === 'true';

    this.container.querySelectorAll('.quiz-option').forEach(opt => {
      if (opt.dataset.correct === 'true') {
        opt.classList.add('correct');
      } else if (opt === selected) {
        opt.classList.add('incorrect');
      }
    });

    if (isCorrect) this.score++;
    this.answers[this.currentIndex] = isCorrect;

    const feedback = this.container.querySelector('.quiz-feedback');
    if (feedback) {
      feedback.classList.add('show', isCorrect ? 'correct' : 'incorrect');
      feedback.innerHTML = isCorrect ? '<strong>Правильно!</strong>' : '<strong>Неправильно.</strong>';
    }

    const checkBtn = this.container.querySelector('.quiz-check-btn');
    const nextBtn = this.container.querySelector('.quiz-next-btn');
    checkBtn?.classList.add('hidden');

    if (this.currentIndex < this.questions.length - 1) {
      nextBtn?.classList.remove('hidden');
      nextBtn.textContent = 'Следующий вопрос';
    } else {
      nextBtn?.classList.remove('hidden');
      nextBtn.textContent = 'Показать результат';
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.renderQuestion();
    } else {
      this.showResults();
    }
  }

  showResults() {
    const percentage = Math.round((this.score / this.questions.length) * 100);
    let message = '';
    let emoji = '';

    if (percentage >= 90) {
      message = 'Отлично! Вы прекрасно понимаете безопасность промптов!';
      emoji = '🛡️';
    } else if (percentage >= 70) {
      message = 'Хорошо! Вы хорошо разбираетесь в защите от атак.';
      emoji = '🔒';
    } else if (percentage >= 50) {
      message = 'Неплохо, но стоит повторить материал по безопасности.';
      emoji = '📚';
    } else {
      message = 'Рекомендуем перечитать урок и попробовать снова.';
      emoji = '💪';
    }

    const questionArea = this.container.querySelector('.quiz-question-area');
    if (questionArea) {
      questionArea.innerHTML = `
        <div class="quiz-results">
          <div class="quiz-results-emoji">${emoji}</div>
          <h3 class="quiz-results-title">Результат: ${this.score} из ${this.questions.length}</h3>
          <div class="quiz-results-percentage">${percentage}%</div>
          <p class="quiz-results-message">${message}</p>
          <div class="quiz-results-breakdown">
            ${this.questions.map((q, i) => `
              <div class="quiz-result-item ${this.answers[i] ? 'correct' : 'incorrect'}">
                <span class="quiz-result-icon">${this.answers[i] ? '✓' : '✗'}</span>
                <span class="quiz-result-text">Вопрос ${i + 1}</span>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-primary quiz-retry-btn">Пройти снова</button>
        </div>
      `;
      const retryBtn = questionArea.querySelector('.quiz-retry-btn');
      retryBtn?.addEventListener('click', () => this.resetAll());
    }
  }

  resetAll() {
    this.currentIndex = 0;
    this.answers = [];
    this.score = 0;
    this.renderQuestion();
  }
}

function initQuizzes() {
  document.querySelectorAll('.quiz').forEach(container => {
    if (container.classList.contains('multi-quiz')) {
      new MultiQuiz(container);
    } else {
      new Quiz(container);
    }
  });
}

document.addEventListener('DOMContentLoaded', initQuizzes);

window.Quiz = Quiz;
window.MultiQuiz = MultiQuiz;
window.initQuizzes = initQuizzes;
