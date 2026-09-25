import { MetadataRoute } from 'next';
import allSubjects from '@/data/subjects.json';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://hmnexora.tech';

    // Static routes
    const staticRoutes = [
        '',
        '/subjects',
        '/mcq-practice',
        '/ai-assistant',
        '/resources',
        '/services',
        '/lms-guide',
        '/qna',
        '/leaderboard',
        '/announcements',
        '/about',
        '/contact',
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic subject routes
    const subjectRoutes = allSubjects.map((code) => ({
        url: `${baseUrl}/subjects/${code.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticRoutes, ...subjectRoutes];
}
