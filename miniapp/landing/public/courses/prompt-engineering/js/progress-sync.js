/**
 * Progress Sync Module
 * Синхронизация прогресса курса между localStorage и сервером
 */

const ProgressSync = {
    COURSE_SLUG: 'prompt-engineering',
    API_BASE: '/api/courses/progress',
    LOCAL_KEY: 'completedLessons_m7',
    USER_KEY: 'telegram_user',

    // Get current user from localStorage
    getUser() {
        try {
            const userData = localStorage.getItem(this.USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('Failed to parse user data:', e);
            return null;
        }
    },

    // Get completed lessons from localStorage
    getLocalProgress() {
        try {
            const data = localStorage.getItem(this.LOCAL_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    // Save completed lessons to localStorage
    setLocalProgress(lessons) {
        localStorage.setItem(this.LOCAL_KEY, JSON.stringify(lessons));
    },

    // Fetch progress from server
    async fetchServerProgress() {
        const user = this.getUser();
        if (!user?.id) return null;

        try {
            const response = await fetch(
                `${this.API_BASE}?user_id=${user.id}&course_slug=${this.COURSE_SLUG}`
            );

            if (!response.ok) return null;

            const data = await response.json();
            return data.success ? data.completedLessons : null;
        } catch (e) {
            console.error('Failed to fetch server progress:', e);
            return null;
        }
    },

    // Save a lesson completion to server
    async saveToServer(lessonNumber) {
        const user = this.getUser();
        if (!user?.id) return false;

        try {
            const response = await fetch(this.API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    course_slug: this.COURSE_SLUG,
                    lesson_number: lessonNumber
                })
            });

            return response.ok;
        } catch (e) {
            console.error('Failed to save progress to server:', e);
            return false;
        }
    },

    // Sync local progress to server (for existing local progress)
    async syncLocalToServer() {
        const user = this.getUser();
        if (!user?.id) return;

        const localProgress = this.getLocalProgress();

        for (const lessonId of localProgress) {
            const lessonNum = parseInt(lessonId, 10);
            if (!isNaN(lessonNum)) {
                await this.saveToServer(lessonNum);
            }
        }
    },

    // Merge server and local progress
    async mergeProgress() {
        const serverProgress = await this.fetchServerProgress();
        const localProgress = this.getLocalProgress();

        if (!serverProgress) {
            // No server progress, sync local to server
            if (localProgress.length > 0 && this.getUser()) {
                this.syncLocalToServer();
            }
            return localProgress;
        }

        // Merge both (convert to same format - strings)
        const localSet = new Set(localProgress.map(String));
        const serverSet = new Set(serverProgress.map(String));

        // Combine both
        const merged = [...new Set([...localSet, ...serverSet])];

        // Update local storage with merged data
        this.setLocalProgress(merged);

        // Sync any local-only progress to server
        const localOnly = localProgress.filter(l => !serverSet.has(String(l)));
        for (const lessonId of localOnly) {
            const lessonNum = parseInt(lessonId, 10);
            if (!isNaN(lessonNum)) {
                await this.saveToServer(lessonNum);
            }
        }

        return merged;
    },

    // Mark lesson as complete (called when user clicks "Mark Complete")
    async markLessonComplete(lessonNumber) {
        const lessonStr = String(lessonNumber);

        // Update local storage
        const localProgress = this.getLocalProgress();
        if (!localProgress.includes(lessonStr)) {
            localProgress.push(lessonStr);
            this.setLocalProgress(localProgress);
        }

        // Save to server
        await this.saveToServer(lessonNumber);

        return true;
    },

    // Initialize - sync progress on page load
    async init() {
        const user = this.getUser();

        if (user?.id) {
            console.log('User authenticated, syncing progress...');
            const merged = await this.mergeProgress();
            console.log('Progress synced:', merged);

            // Refresh UI with merged progress
            this.refreshUI(merged);
        } else {
            console.log('User not authenticated, using local progress only');
        }
    },

    // Refresh UI to show synced progress
    refreshUI(completedLessons) {
        // Update nav items
        completedLessons.forEach(lessonId => {
            const navItem = document.querySelector(`.nav-item[data-lesson="${lessonId}"]`);
            navItem?.classList.add('completed');
        });

        // Update lesson cards on index page
        completedLessons.forEach(lessonId => {
            const card = document.querySelector(`.lesson-card[href="lesson-${lessonId}.html"]`);
            card?.classList.add('completed');
        });

        // Update progress bar in sidebar
        const TOTAL_LESSONS = 6;
        const progressFill = document.querySelector('.sidebar .progress-fill');
        const progressText = document.querySelector('.sidebar .progress-text');

        if (progressFill) {
            progressFill.style.width = `${(completedLessons.length / TOTAL_LESSONS) * 100}%`;
        }

        if (progressText) {
            progressText.textContent = `${completedLessons.length} из ${TOTAL_LESSONS} уроков`;
        }

        // Update "Mark Complete" button if on lesson page
        const completeBtn = document.querySelector('.mark-complete-btn');
        if (completeBtn) {
            const currentLesson = completeBtn.dataset.lesson;
            if (completedLessons.includes(currentLesson) || completedLessons.includes(parseInt(currentLesson, 10))) {
                completeBtn.textContent = 'Урок пройден ✓';
                completeBtn.classList.add('btn-success');
                completeBtn.disabled = true;
            }
        }
    }
};

// Override the mark complete functionality to use sync
document.addEventListener('DOMContentLoaded', () => {
    // Initialize sync after a short delay to let app.js init first
    setTimeout(() => {
        ProgressSync.init();
    }, 100);

    // Override mark complete button behavior
    const completeBtn = document.querySelector('.mark-complete-btn');
    if (completeBtn) {
        // Remove existing listeners by cloning
        const newBtn = completeBtn.cloneNode(true);
        completeBtn.parentNode.replaceChild(newBtn, completeBtn);

        newBtn.addEventListener('click', async () => {
            const currentLesson = newBtn.dataset.lesson;
            const lessonNum = parseInt(currentLesson, 10);

            // Mark complete locally and on server
            await ProgressSync.markLessonComplete(lessonNum);

            // Update UI
            newBtn.textContent = 'Урок пройден ✓';
            newBtn.classList.remove('btn-primary');
            newBtn.classList.add('btn-success');
            newBtn.disabled = true;

            const navItem = document.querySelector(`.nav-item[data-lesson="${currentLesson}"]`);
            navItem?.classList.add('completed');

            // Update progress bar
            const localProgress = ProgressSync.getLocalProgress();
            const TOTAL_LESSONS = 6;
            const progressFill = document.querySelector('.sidebar .progress-fill');
            const progressText = document.querySelector('.sidebar .progress-text');

            if (progressFill) {
                progressFill.style.width = `${(localProgress.length / TOTAL_LESSONS) * 100}%`;
            }
            if (progressText) {
                progressText.textContent = `${localProgress.length} из ${TOTAL_LESSONS} уроков`;
            }
        });
    }
});

// Export for use
window.ProgressSync = ProgressSync;
