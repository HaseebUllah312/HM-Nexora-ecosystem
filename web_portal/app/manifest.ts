import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'HM nexora – VU Academic Platform',
        short_name: 'HM nexora',
        description: 'Complete academic solutions for VU students. Access past papers, solved assignments, MCQ practice, CGPA calculator, AI assistant, and more.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#07071a',
        theme_color: '#7C3AED',
        categories: ['education', 'productivity'],
        lang: 'en',
        dir: 'ltr',
        prefer_related_applications: false,
        icons: [
            {
                src: '/icon.png',
                sizes: '48x48',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon.png',
                sizes: '72x72',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon.png',
                sizes: '128x128',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon.png',
                sizes: '144x144',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/apple-icon.png',
                sizes: '180x180',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon.png',
                sizes: '256x256',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        shortcuts: [
            {
                name: 'Subjects',
                short_name: 'Subjects',
                description: 'Browse all VU subjects',
                url: '/subjects',
                icons: [{ src: '/icon.png', sizes: '96x96' }],
            },
            {
                name: 'MCQ Practice',
                short_name: 'MCQs',
                description: 'Practice MCQs for exams',
                url: '/mcq-practice',
                icons: [{ src: '/icon.png', sizes: '96x96' }],
            },
            {
                name: 'AI Assistant',
                short_name: 'AI',
                description: 'Get AI study help',
                url: '/ai-assistant',
                icons: [{ src: '/icon.png', sizes: '96x96' }],
            },
            {
                name: 'Announcements',
                short_name: 'News',
                description: 'Latest VU updates',
                url: '/announcements',
                icons: [{ src: '/icon.png', sizes: '96x96' }],
            },
        ],
        screenshots: [
            {
                src: '/icon.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
