import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey)
} else {
    console.warn('Supabase credentials missing in API route')
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, first_name, last_name, username, photo_url, auth_date, hash } = body

        if (!hash || !id || !auth_date || !first_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const botToken = process.env.BOT_TOKEN

        if (!botToken) {
            console.error('BOT_TOKEN is not defined')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Data-check-string construction
        const dataCheckArr = []
        if (auth_date) dataCheckArr.push(`auth_date=${auth_date}`)
        if (first_name) dataCheckArr.push(`first_name=${first_name}`)
        if (id) dataCheckArr.push(`id=${id}`)
        if (last_name) dataCheckArr.push(`last_name=${last_name}`)
        if (photo_url) dataCheckArr.push(`photo_url=${photo_url}`)
        if (username) dataCheckArr.push(`username=${username}`)

        const dataCheckString = dataCheckArr.join('\n')

        // HMAC-SHA256 signature generation
        const secretKey = crypto.createHash('sha256').update(botToken).digest()
        const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

        if (hmac !== hash) {
            // In production we must reject. 
            // However, if we are simulating dev mode via the "Dev" button, the hash might be 'mock_hash'.
            // But this API route is called by the "Dev" button too? No, Dev button just sets local state.
            // Real Telegram Login calls this. 
            // If we want to support "Dev Login" talking to DB, we need a bypass secret or just trust the client if NODE_ENV is dev?
            // No, for security, let's keep strict check. The "Dev Login" button currently bypasses this API entirely in AuthContext.
            // So this API is ONLY for real Telegram Auth.

            return NextResponse.json({ error: 'Invalid hash' }, { status: 401 })
        }

        // Check if auth_date is within reasonable time (e.g. 24 hours)
        const now = Math.floor(Date.now() / 1000)
        if (now - auth_date > 86400) {
            return NextResponse.json({ error: 'Data is outdated' }, { status: 401 })
        }

        let dbUser = null

        // FETCH USER FROM SUPABASE
        if (supabase) {
            try {
                // Query bot_users table
                const { data, error } = await supabase
                    .from('bot_users')
                    .select('*')
                    .eq('user_id', id) // Assuming user_id is the BigInt Telegram ID column
                    .single()

                if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                    console.error('Supabase fetch error:', error)
                }

                if (data) {
                    dbUser = data
                } else {
                    // Create/Update user if they don't exist?
                    // The requirements say "database combined". So we should arguably UPSERT.
                    // Let's upsert to ensure we have the latest info.
                    const { data: upsertData, error: upsertError } = await supabase
                        .from('bot_users')
                        .upsert({
                            user_id: id,
                            username: username || null,
                            first_name: first_name,
                            last_name: last_name || null,
                            last_activity: new Date().toISOString()
                            // Add other fields as necessary, respecting existing schema
                        })
                        .select()
                        .single()

                    if (upsertError) {
                        console.error('Supabase upsert error:', upsertError)
                    } else {
                        dbUser = upsertData
                    }
                }
            } catch (err) {
                console.error('Database operation failed:', err)
            }
        }

        // Success - return user data merged with DB data
        return NextResponse.json({
            success: true,
            user: {
                id,
                first_name,
                last_name,
                username,
                photo_url,
                // Include DB fields
                subscription_tier: dbUser?.subscription_tier || null,
                created_at: dbUser?.created_at || null,
                // Add other relevant DB fields
            }
        })

    } catch (error) {
        console.error('Auth check error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
