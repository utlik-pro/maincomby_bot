/**
 * Admin Access System
 * Вход по паролю для доступа ко всем урокам
 */

// ==========================================
// ПАРОЛЬ АДМИНИСТРАТОРА
// ==========================================
const ADMIN_PASSWORD = '609285';

// ==========================================
// ADMIN FUNCTIONS
// ==========================================

function isAdmin() {
  return localStorage.getItem('isAdmin') === 'true';
}

function adminLogin(password) {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('isAdmin', 'true');
    return true;
  }
  return false;
}

function adminLogout() {
  localStorage.removeItem('isAdmin');
  window.location.reload();
}

// ==========================================
// ADMIN UI
// ==========================================

function initAdminPanel() {
  addAdminStyles();

  // Секретный вход: 5 кликов по логотипу
  const logo = document.querySelector('.sidebar-logo');
  if (logo) {
    let clickCount = 0;
    let clickTimer = null;

    logo.style.cursor = 'pointer';
    logo.style.userSelect = 'none';

    logo.addEventListener('click', (e) => {
      e.preventDefault();
      clickCount++;
      clearTimeout(clickTimer);

      // Визуальная индикация
      logo.style.transform = 'scale(0.95)';
      setTimeout(() => logo.style.transform = '', 100);

      if (clickCount >= 5) {
        clickCount = 0;
        if (isAdmin()) {
          adminLogout();
        } else {
          showLoginModal();
        }
      }

      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 2000);
    });
  }

  // Альтернатива: Ctrl+Shift+A (или Cmd+Shift+A на Mac)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'Ф' || e.key === 'ф')) {
      e.preventDefault();
      if (isAdmin()) {
        adminLogout();
      } else {
        showLoginModal();
      }
    }
  });
}

function showLoginModal() {
  // Удаляем существующий модал
  const existing = document.querySelector('.admin-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'admin-modal';
  modal.innerHTML = `
    <div class="admin-modal-content">
      <button class="admin-modal-close">✕</button>
      <h3>🔑 Вход для преподавателей</h3>
      <p>Введите пароль администратора</p>
      <form class="admin-login-form">
        <input type="password" class="admin-password-input" placeholder="Пароль" required>
        <button type="submit" class="btn btn-primary">Войти</button>
      </form>
      <div class="admin-login-error"></div>
    </div>
  `;

  document.body.appendChild(modal);

  // Focus on input
  const input = modal.querySelector('.admin-password-input');
  setTimeout(() => input.focus(), 100);

  // Close button
  modal.querySelector('.admin-modal-close').addEventListener('click', () => modal.remove());

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Form submit
  modal.querySelector('.admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = input.value;
    const errorDiv = modal.querySelector('.admin-login-error');

    if (adminLogin(password)) {
      modal.remove();
      showAdminWelcome();
      window.location.reload();
    } else {
      errorDiv.textContent = '❌ Неверный пароль';
      errorDiv.style.display = 'block';
      input.classList.add('error');
      input.value = '';
    }
  });

  // Escape to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function showAdminWelcome() {
  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.innerHTML = `
    <div class="admin-toast-content">
      <span>👑</span>
      <p>Добро пожаловать! Все уроки разблокированы.</p>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function addAdminStyles() {
  if (document.querySelector('#admin-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'admin-styles';
  styles.textContent = `
    .sidebar-logo {
      cursor: pointer;
      user-select: none;
    }

    .admin-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      animation: fadeIn 0.2s ease;
    }

    .admin-modal-content {
      background: white;
      border-radius: var(--radius-lg);
      padding: 2rem;
      width: 90%;
      max-width: 400px;
      position: relative;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }

    .admin-modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--text-muted);
      transition: var(--transition);
    }

    .admin-modal-close:hover {
      color: var(--danger);
    }

    .admin-modal-content h3 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
    }

    .admin-modal-content p {
      color: var(--text-secondary);
      margin: 0 0 1.5rem;
      font-size: 0.9rem;
    }

    .admin-login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .admin-password-input {
      padding: 0.75rem 1rem;
      border: 2px solid var(--border);
      border-radius: var(--radius);
      font-size: 1rem;
      transition: var(--transition);
      width: 100%;
    }

    .admin-password-input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .admin-password-input.error {
      border-color: var(--danger);
    }

    .admin-login-error {
      display: none;
      color: var(--danger);
      font-size: 0.875rem;
      text-align: center;
    }

    .admin-toast {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 1002;
      animation: slideIn 0.3s ease;
    }

    .admin-toast-content {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .admin-toast-content span {
      font-size: 1.5rem;
    }

    .admin-toast-content p {
      margin: 0;
      font-weight: 500;
    }

    .admin-toast.fade-out {
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

  `;

  document.head.appendChild(styles);
}

// Export for use in app.js
window.AdminPanel = {
  isAdmin,
  adminLogin,
  adminLogout,
  initAdminPanel
};
