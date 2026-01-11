import type { Metadata } from "next";
import "../globals.css";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BackToTop } from "@/components/BackToTop";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Particles } from "@/components/Particles";
import { UpdateBanner } from "@/components/UpdateBanner";

export const metadata: Metadata = {
    title: "MAIN Platform - Запустите своё приложение для сообщества",
    description: "Готовая платформа для нетворкинга, мероприятий и монетизации в Telegram. Без разработки — просто настройте под свой бренд.",
    keywords: ["networking", "telegram", "community platform", "events", "monetization", "нетворкинг", "сообщество", "telegram mini app", "B2B"],
    metadataBase: new URL('https://main-platform.vercel.app'),
    openGraph: {
        title: "MAIN Platform — Платформа для сообществ",
        description: "Готовая платформа для нетворкинга, мероприятий и монетизации в Telegram",
        url: 'https://main-platform.vercel.app',
        siteName: 'MAIN Platform',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'MAIN Platform',
            }
        ],
        locale: "ru_RU",
        alternateLocale: "en_US",
        type: "website",
    },
    twitter: {
        card: 'summary_large_image',
        title: 'MAIN Platform — Платформа для сообществ',
        description: 'Готовая платформа для нетворкинга и монетизации в Telegram',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    icons: {
        icon: '/logo.png',
        apple: '/logo.png',
    },
};

export async function generateStaticParams() {
    return [{ locale: 'ru' }, { locale: 'en' }]
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <html lang={locale} className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body className="antialiased">
                <LoadingScreen />
                <ScrollProgress />
                <Particles />
                <UpdateBanner />
                {children}
                <BackToTop />
            </body>
        </html>
    );
}
