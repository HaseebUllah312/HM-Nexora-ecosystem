import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/dashboard/', '/profile/', '/register', '/forgot-password'],
        },
        sitemap: 'https://hmnexora.tech/sitemap.xml',
    };
}
