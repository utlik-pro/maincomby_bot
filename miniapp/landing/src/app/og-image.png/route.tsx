import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(200, 255, 0, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(200, 255, 0, 0.1) 0%, transparent 50%)',
                }}
            >
                {/* Logo circle */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: '#c8ff00',
                        marginBottom: 40,
                        boxShadow: '0 0 80px rgba(200, 255, 0, 0.5)',
                    }}
                >
                    <span style={{ fontSize: 60, fontWeight: 'bold', color: '#0a0a0a' }}>M</span>
                </div>

                {/* Title */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <span
                        style={{
                            fontSize: 64,
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: 16,
                        }}
                    >
                        MAIN Platform
                    </span>
                    <span
                        style={{
                            fontSize: 28,
                            color: '#a0a0a0',
                            textAlign: 'center',
                            maxWidth: 800,
                        }}
                    >
                        Готовая платформа для нетворкинга, мероприятий и монетизации в Telegram
                    </span>
                </div>

                {/* Badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 40,
                        padding: '12px 24px',
                        backgroundColor: 'rgba(200, 255, 0, 0.1)',
                        borderRadius: 50,
                        border: '1px solid rgba(200, 255, 0, 0.3)',
                    }}
                >
                    <span style={{ fontSize: 18, color: '#c8ff00' }}>Telegram Mini App</span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    )
}
