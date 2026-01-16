import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey)
}

export const runtime = 'nodejs'

interface ProgressEntry {
    lessonNumber: number
    completedAt: string
}

/**
 * GET /api/courses/progress?user_id=<telegram_id>&course_slug=<slug>
 * Returns course progress for a user
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userIdParam = searchParams.get('user_id')
        const courseSlug = searchParams.get('course_slug')

        if (!userIdParam) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
        }

        const telegramUserId = parseInt(userIdParam, 10)
        if (isNaN(telegramUserId)) {
            return NextResponse.json({ error: 'Invalid user_id' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
        }

        // Get internal user ID from telegram user_id
        const { data: user, error: userError } = await supabase
            .from('bot_users')
            .select('id')
            .eq('tg_user_id', telegramUserId)
            .single()

        if (userError || !user) {
            // User not found - return empty progress
            return NextResponse.json({
                success: true,
                userId: telegramUserId,
                courseSlug: courseSlug || null,
                progress: [],
                completedLessons: []
            })
        }

        // Build query
        let query = supabase
            .from('web_course_progress')
            .select('course_slug, lesson_number, completed_at')
            .eq('user_id', user.id)

        // Filter by course if specified
        if (courseSlug) {
            query = query.eq('course_slug', courseSlug)
        }

        const { data: progress, error: progressError } = await query.order('lesson_number', { ascending: true })

        if (progressError) {
            console.error('Error fetching progress:', progressError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // Group by course
        const progressByCoursе: Record<string, ProgressEntry[]> = {}
        const completedLessons: number[] = []

        for (const entry of progress || []) {
            if (!progressByCoursе[entry.course_slug]) {
                progressByCoursе[entry.course_slug] = []
            }
            progressByCoursе[entry.course_slug].push({
                lessonNumber: entry.lesson_number,
                completedAt: entry.completed_at
            })
            if (courseSlug && entry.course_slug === courseSlug) {
                completedLessons.push(entry.lesson_number)
            }
        }

        return NextResponse.json({
            success: true,
            userId: telegramUserId,
            courseSlug: courseSlug || null,
            progress: progressByCoursе,
            completedLessons
        })

    } catch (error) {
        console.error('Get progress error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/courses/progress
 * Mark a lesson as completed
 * Body: { user_id, course_slug, lesson_number }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { user_id, course_slug, lesson_number } = body

        if (!user_id || !course_slug || lesson_number === undefined) {
            return NextResponse.json(
                { error: 'user_id, course_slug, and lesson_number are required' },
                { status: 400 }
            )
        }

        const telegramUserId = parseInt(user_id, 10)
        if (isNaN(telegramUserId)) {
            return NextResponse.json({ error: 'Invalid user_id' }, { status: 400 })
        }

        const lessonNum = parseInt(lesson_number, 10)
        if (isNaN(lessonNum) || lessonNum < 1) {
            return NextResponse.json({ error: 'Invalid lesson_number' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
        }

        // Get internal user ID from telegram user_id
        const { data: user, error: userError } = await supabase
            .from('bot_users')
            .select('id')
            .eq('tg_user_id', telegramUserId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Insert or update progress (upsert)
        const { data, error } = await supabase
            .from('web_course_progress')
            .upsert({
                user_id: user.id,
                course_slug,
                lesson_number: lessonNum,
                completed_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,course_slug,lesson_number'
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving progress:', error)
            return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            progress: {
                courseSlug: course_slug,
                lessonNumber: lessonNum,
                completedAt: data.completed_at
            }
        })

    } catch (error) {
        console.error('Save progress error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/courses/progress
 * Reset progress for a course
 * Body: { user_id, course_slug }
 */
export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json()
        const { user_id, course_slug } = body

        if (!user_id || !course_slug) {
            return NextResponse.json(
                { error: 'user_id and course_slug are required' },
                { status: 400 }
            )
        }

        const telegramUserId = parseInt(user_id, 10)
        if (isNaN(telegramUserId)) {
            return NextResponse.json({ error: 'Invalid user_id' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
        }

        // Get internal user ID
        const { data: user, error: userError } = await supabase
            .from('bot_users')
            .select('id')
            .eq('tg_user_id', telegramUserId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Delete all progress for this course
        const { error } = await supabase
            .from('web_course_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('course_slug', course_slug)

        if (error) {
            console.error('Error resetting progress:', error)
            return NextResponse.json({ error: 'Failed to reset progress' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `Progress reset for course ${course_slug}`
        })

    } catch (error) {
        console.error('Reset progress error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
