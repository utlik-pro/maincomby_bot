import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { coursesData, AccessTier } from '@/data/courses'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey)
}

export const runtime = 'nodejs'

// Define which subscription tier can access which course tiers
const TIER_ACCESS: Record<string, AccessTier[]> = {
    free: ['free'],
    light: ['free', 'light'],
    pro: ['free', 'light', 'pro'],
}

interface CourseAccessInfo {
    courseId: string
    hasAccess: boolean
    accessType: 'subscription' | 'purchased' | 'gifted' | null
    requiredTier: AccessTier
}

interface UserCourseAccess {
    course_id: string
    access_type: 'subscription' | 'purchased' | 'gifted'
    expires_at: string | null
}

/**
 * GET /api/courses/access?user_id=<telegram_id>
 * Returns course access information for a user
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userIdParam = searchParams.get('user_id')

        if (!userIdParam) {
            return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
        }

        const userId = parseInt(userIdParam, 10)
        if (isNaN(userId)) {
            return NextResponse.json({ error: 'Invalid user_id' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
        }

        // Get user's subscription tier
        const { data: user, error: userError } = await supabase
            .from('bot_users')
            .select('id, subscription_tier')
            .eq('tg_user_id', userId)
            .single()

        if (userError && userError.code !== 'PGRST116') {
            console.error('Error fetching user:', userError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // Default to 'free' tier if user not found or no subscription
        const subscriptionTier = user?.subscription_tier || 'free'
        const internalUserId = user?.id || null

        // Get user's purchased courses (if user exists in DB)
        let purchasedCourses: UserCourseAccess[] = []
        if (internalUserId) {
            const { data: courseAccess, error: accessError } = await supabase
                .from('user_course_access')
                .select('course_id, access_type, expires_at')
                .eq('user_id', internalUserId)

            if (accessError) {
                console.error('Error fetching course access:', accessError)
            } else {
                // Filter out expired access
                const now = new Date()
                purchasedCourses = (courseAccess || []).filter((ca: UserCourseAccess) =>
                    !ca.expires_at || new Date(ca.expires_at) > now
                )
            }
        }

        // Build access map for purchased/gifted courses
        const purchasedMap = new Map<string, 'purchased' | 'gifted'>(
            purchasedCourses.map(pc => [pc.course_id, pc.access_type as 'purchased' | 'gifted'])
        )

        // Get allowed tiers for subscription
        const allowedTiers = TIER_ACCESS[subscriptionTier] || ['free']

        // Calculate access for all courses
        const courseAccessInfo: CourseAccessInfo[] = coursesData.map(course => {
            // Check if purchased/gifted
            if (purchasedMap.has(course.id)) {
                return {
                    courseId: course.id,
                    hasAccess: true,
                    accessType: purchasedMap.get(course.id)!,
                    requiredTier: course.accessTier,
                }
            }

            // Check subscription access
            const hasSubscriptionAccess = allowedTiers.includes(course.accessTier)

            return {
                courseId: course.id,
                hasAccess: hasSubscriptionAccess,
                accessType: hasSubscriptionAccess ? 'subscription' : null,
                requiredTier: course.accessTier,
            }
        })

        return NextResponse.json({
            success: true,
            userId,
            subscriptionTier,
            courses: courseAccessInfo,
        })

    } catch (error) {
        console.error('Course access check error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/courses/access
 * Grant course access to a user (for purchases, gifts)
 * Body: { user_id, course_id, access_type, purchase_amount?, expires_at? }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { user_id, course_id, access_type, purchase_amount, expires_at } = body

        if (!user_id || !course_id || !access_type) {
            return NextResponse.json(
                { error: 'user_id, course_id, and access_type are required' },
                { status: 400 }
            )
        }

        // Validate access_type
        if (!['purchased', 'gifted'].includes(access_type)) {
            return NextResponse.json(
                { error: 'access_type must be "purchased" or "gifted"' },
                { status: 400 }
            )
        }

        // Validate course exists
        const courseExists = coursesData.some(c => c.id === course_id)
        if (!courseExists) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
        }

        // Get internal user ID from telegram user_id
        const { data: user, error: userError } = await supabase
            .from('bot_users')
            .select('id')
            .eq('tg_user_id', user_id)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Insert or update course access
        const { data, error } = await supabase
            .from('user_course_access')
            .upsert({
                user_id: user.id,
                course_id,
                access_type,
                purchase_amount: purchase_amount || null,
                expires_at: expires_at || null,
                granted_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,course_id'
            })
            .select()
            .single()

        if (error) {
            console.error('Error granting course access:', error)
            return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            access: data,
        })

    } catch (error) {
        console.error('Grant course access error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
