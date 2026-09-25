export interface Announcement {
    id: number;
    title: string;
    description: string;
    date: string;
    category: 'datesheet' | 'result' | 'admission' | 'scholarship' | 'notice' | 'general' | 'assignment' | 'quiz' | 'gdb';
    important: boolean;
    imageUrl?: string;
}

export const announcements: Announcement[] = [
    { 
        id: 1, 
        title: 'Spring 2026 Mid-Term Date Sheet Released', 
        description: 'The mid-term examination date sheet for Spring 2026 semester has been published. Check your VULMS portal for detailed schedule.', 
        date: '2026-02-14', 
        category: 'datesheet', 
        important: true,
        imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop'
    },
    { id: 2, title: 'Fall 2025 Final Results Announced', description: 'Results for Fall 2025 semester final examinations are now available on the student portal.', date: '2026-02-10', category: 'result', important: true },
    { id: 3, title: 'Spring 2026 Admissions Open', description: 'Virtual University is now accepting applications for Spring 2026 semester. Last date to apply: March 15, 2026.', date: '2026-02-08', category: 'admission', important: true },
    { id: 4, title: 'Need-Based Scholarship Applications', description: 'Students can now apply for need-based scholarships. Submit your application through the LMS before the deadline.', date: '2026-02-05', category: 'scholarship', important: false },
    { id: 5, title: 'LMS Maintenance Scheduled', description: 'VULMS will be under maintenance on Feb 20, 2026. Please save your work before the downtime.', date: '2026-02-03', category: 'notice', important: false },
    { id: 6, title: 'New Course Registration Deadline', description: 'Last date to register for new courses in the current semester is February 28, 2026.', date: '2026-02-01', category: 'general', important: true },
    { id: 7, title: 'HEC Scholarship for MS/PhD Students', description: 'HEC is offering scholarships for MS and PhD programs. Apply through HEC portal before March 31.', date: '2026-01-28', category: 'scholarship', important: false },
    { id: 8, title: 'GDB Submission Reminder', description: 'GDB for multiple courses is due this week. Check your VULMS dashboard for specific deadlines.', date: '2026-01-25', category: 'notice', important: false },
];

export const categoryLabels: Record<string, string> = {
    datesheet: '📅 Date Sheet',
    result: '📊 Results',
    admission: '🎓 Admissions',
    scholarship: '💰 Scholarships',
    notice: '📢 Notices',
    general: '📌 General',
    assignment: '📝 Assignment',
    quiz: '❓ Quiz',
    gdb: '💬 GDB',
};
