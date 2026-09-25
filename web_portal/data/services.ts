export interface Service {
    id: number;
    title: string;
    description: string;
    icon: string;
    priceLocal: string;
    priceUSD: string;
    features: string[];
    popular: boolean;
}

export const services: Service[] = [
    { id: 9, title: '24/7 Academic Support', description: 'Round-the-clock academic guidance and mentoring', icon: '🌟', priceLocal: 'Free', priceUSD: 'Free', features: ['WhatsApp support', 'Study guidance', 'Career counseling', 'Exam strategies'], popular: true },
    { id: 1, title: 'Assignment Solutions', description: 'Get well-researched, plagiarism-free assignment solutions', icon: '📝', priceLocal: 'Rs. 250-350', priceUSD: '$3-4', features: ['Plagiarism-free content', 'On-time delivery', 'Proper formatting', 'Unlimited revisions'], popular: true },
    { id: 2, title: 'GDB Solutions', description: 'Professional GDB discussion replies with proper references', icon: '💬', priceLocal: 'Rs. 100', priceUSD: '$1', features: ['Well-researched answers', 'Proper word count', 'Original content', 'Quick delivery'], popular: false },
    { id: 3, title: 'Quiz Assistance', description: 'Expert guidance and preparation for quizzes', icon: '❓', priceLocal: 'Rs. 150', priceUSD: '$2', features: ['Subject-wise preparation', 'Practice MCQs provided', 'Important topics covered', 'Real-time support'], popular: true },
    { id: 4, title: 'Complete LMS Handling', description: 'We handle your entire semester LMS activities', icon: '🎯', priceLocal: 'Rs. 1000-1500/subject', priceUSD: '$12-15/subject', features: ['All assignments', 'All quizzes', 'All GDBs', 'Result guarantee', '24/7 support'], popular: true },
    { id: 5, title: 'Cisco / Netacad', description: 'Complete packet tracer and networking assignments', icon: '🌐', priceLocal: 'Rs. 800', priceUSD: '$8', features: ['Packet Tracer Activity', 'Lab Compilation', 'Quiz Solutions', '100% Score Guarantee'], popular: false },
    { id: 6, title: 'Project Guidance', description: 'Complete guidance for semester and final year projects', icon: '🔧', priceLocal: 'Depends on Requirements', priceUSD: 'Get Quote', features: ['Topic selection help', 'Documentation', 'Code implementation', 'Presentation support'], popular: false },
    { id: 7, title: 'Internship Reports', description: 'Professional internship report writing and formatting', icon: '📋', priceLocal: 'Depends on Requirements', priceUSD: 'Get Quote', features: ['Professional format', 'Company-specific content', 'Proper references', 'Review support'], popular: false },
    { id: 8, title: 'Research Formatting', description: 'Academic paper and thesis formatting services', icon: '📚', priceLocal: 'Depends on Requirements', priceUSD: 'Get Quote', features: ['APA/IEEE formatting', 'Reference management', 'Plagiarism check', 'Multiple revisions'], popular: false },
];

export const testimonials = [
    { name: 'Ahmed K.', program: 'BSCS', semester: '6th', text: 'HM nexora helped me improve my GPA from 2.8 to 3.5! Their assignment quality is excellent.', rating: 5 },
    { name: 'Fatima S.', program: 'BBA', semester: '4th', text: 'The LMS handling service is a lifesaver for working students like me. Highly recommended!', rating: 5 },
    { name: 'Ali R.', program: 'BSIT', semester: '8th', text: 'Got professional help with my final year project. Delivered on time with great quality.', rating: 4 },
    { name: 'Sana M.', program: 'BSCS', semester: '3rd', text: 'The quiz preparation material they provide is incredibly helpful. My scores improved significantly.', rating: 5 },
    { name: 'Usman T.', program: 'MBA', semester: '2nd', text: 'Best academic support service. Their team is responsive and professional.', rating: 4 },
];

export const faqs = [
    { q: 'How do I place an order?', a: 'Simply click the WhatsApp button or fill out the order form. Our team will respond within minutes with pricing and timeline.' },
    { q: 'Is my information safe?', a: 'Absolutely. We maintain strict confidentiality. Your personal details and academic information are never shared.' },
    { q: 'What if I\'m not satisfied with the work?', a: 'We offer unlimited revisions. If you\'re still not satisfied, we provide a full refund within 24 hours.' },
    { q: 'How fast can you deliver?', a: 'Standard delivery is 24-48 hours. Urgent orders can be completed in 6-12 hours with a small rush fee.' },
    { q: 'Do you support all VU subjects?', a: 'Yes! We have experts for all VU programs including BSCS, BSIT, BBA, MBA, and more.' },
    { q: 'Are the assignments plagiarism-free?', a: 'Yes, all work is original and passes plagiarism checks. We provide a Turnitin report on request.' },
];
