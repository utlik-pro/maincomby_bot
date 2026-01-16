-- Web Course Progress Tracking
-- Tracking progress for static HTML courses on the landing page

-- Прогресс пользователей по HTML-курсам на лендинге
CREATE TABLE IF NOT EXISTS web_course_progress (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES bot_users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,          -- e.g., 'prompt-engineering'
  lesson_number INT NOT NULL,         -- e.g., 1, 2, 3, 4, 5, 6
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_slug, lesson_number)
);

-- RLS policies
ALTER TABLE web_course_progress ENABLE ROW LEVEL SECURITY;

-- Пользователи могут управлять своим прогрессом
CREATE POLICY "Users can manage own web progress" ON web_course_progress
  FOR ALL USING (true);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_web_progress_user_id ON web_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_web_progress_course ON web_course_progress(course_slug);
CREATE INDEX IF NOT EXISTS idx_web_progress_user_course ON web_course_progress(user_id, course_slug);
