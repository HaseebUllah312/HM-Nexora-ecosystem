import scrapedNames from './scraped_subjects.json';
import allSubjects from './subjects.json';

// This file contains detailed metadata for the UI (Ratings, Names, etc.)

export interface Subject {
    code: string;
    name: string;
    creditHours: number;
    category: string;
    rating: number;
    totalReviews: number;
    totalFiles: number;
    downloads: number;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
    teachers: string[];
    description: string;
    resources?: { title: string; type: string; link: string; }[];
}

export const subjects: Subject[] = [];

export const categories: string[] = [
    'Computer Science',
    'Mathematics',
    'Management',
    'English',
    'Science',
    'General'
];

export function autoCategorize(code: string): string {
    const c = code.toUpperCase();
    if (c.startsWith('CS') || c.startsWith('IT') || c.startsWith('BIF') || c.startsWith('ICT')) return 'Computer Science';
    if (c.startsWith('MTH') || c.startsWith('STA')) return 'Mathematics';
    if (c.startsWith('MGT') || c.startsWith('ACC') || c.startsWith('FIN') || c.startsWith('ECO') || c.startsWith('BNK') || c.startsWith('HRM') || c.startsWith('MKT') || c.startsWith('MGMT')) return 'Management';
    if (c.startsWith('ENG')) return 'English';
    if (c.startsWith('BIO') || c.startsWith('BT') || c.startsWith('CHE') || c.startsWith('PHY') || c.startsWith('ZOO')) return 'Science';
    if (c.startsWith('PSY') || c.startsWith('SOC') || c.startsWith('EDU') || c.startsWith('MCM') || c.startsWith('PAK') || c.startsWith('ISL') || c.startsWith('ETH')) return 'General';
    return 'General';
}



export function getSubjectByCode(code: string): Subject | undefined {
    // 1. Try to find detailed subject
    const detailed = subjects.find(s => s.code.toLowerCase() === code.toLowerCase());
    if (detailed) return detailed;

    // 2. If not found, check if it's a valid code in the large list
    const validCode = allSubjects.find(c => c.toLowerCase() === code.toLowerCase());

    if (validCode) {
        // 3. Return a placeholder subject
        return {
            code: validCode,
            name: (scrapedNames as Record<string, string>)[validCode] || `${validCode} - Subject Details Coming Soon`,
            creditHours: 3, // Default
            category: autoCategorize(validCode), // Auto categorize
            rating: 0,
            totalReviews: 0,
            totalFiles: 0,
            downloads: 0,
            difficulty: "Medium", // Default
            teachers: [],
            description: `Comprehensive study materials, handouts, and past papers for ${(scrapedNames as Record<string, string>)[validCode] || validCode} at Virtual University of Pakistan.`,
        };
    }

    return undefined;
}

export function getSubjectsByCategory(category: string): Subject[] {
    if (category === 'All') return subjects;
    return subjects.filter(s => s.category === category);
}
