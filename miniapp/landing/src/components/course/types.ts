// Course lesson types

export interface QuizOption {
    text: string
    textEn: string
    correct: boolean
}

export interface QuizData {
    question: string
    questionEn: string
    options: QuizOption[]
}

export type ContentBlock =
    | { type: 'heading'; text: string; textEn: string }
    | { type: 'text'; text: string; textEn: string }
    | { type: 'alert'; variant: 'info' | 'warning' | 'danger' | 'success'; title?: string; titleEn?: string; text: string; textEn: string }
    | { type: 'prompt-example'; label: string; labelEn: string; code: string; good?: boolean }
    | { type: 'comparison'; bad: { label: string; labelEn: string; text: string; textEn: string }; good: { label: string; labelEn: string; text: string; textEn: string } }
    | { type: 'list'; title?: string; titleEn?: string; items: string[]; itemsEn: string[] }
    | { type: 'table'; headers: string[]; headersEn: string[]; rows: string[][]; rowsEn: string[][] }
    | { type: 'card'; title?: string; titleEn?: string; color?: string; children: ContentBlock[] }
    | { type: 'code'; language?: string; code: string }

export interface Lesson {
    id: number
    slug: string
    title: string
    titleEn: string
    duration: string
    badge?: string
    badgeEn?: string
    objectives: string[]
    objectivesEn: string[]
    content: ContentBlock[]
    quiz?: QuizData
    summary: string[]
    summaryEn: string[]
}

export interface CourseData {
    slug: string
    title: string
    titleEn: string
    lessons: Lesson[]
}
