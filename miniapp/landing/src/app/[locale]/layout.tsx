import type { Metadata } from "next";
import "../globals.css";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BackToTop } from "@/components/BackToTop";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Particles } from "@/components/Particles";
import { UpdateBanner } from "@/components/UpdateBanner";

export const metadata: Metadata = {
    title: "MAIN Platform - Профессиональный нетворкинг в Telegram",
    description: "Находи полезные контакты, посещай мероприятия, развивайся вместе с техсообществом MAIN",
    keywords: ["networking", "telegram", "tech community", "events", "нетворкинг", "сообщество"],
    openGraph: {
        title: "MAIN Platform",
        description: "Профессиональный нетворкинг в Telegram",
        type: "website",
        locale: "ru_RU",
        alternateLocale: "en_US",
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
