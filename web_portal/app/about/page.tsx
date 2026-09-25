import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <h1>About HM nexora</h1>
                    <p>Your all-in-one academic companion</p>
                </div>

                <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
                    <h2 style={{ marginBottom: '16px' }}>🎯 Our Mission</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem' }}>
                        HM nexora is built with a single mission — to make quality academic resources accessible to every student. We believe that every student deserves the tools, study materials, and guidance they need to excel in their studies, regardless of their background or location.
                    </p>
                </div>

                <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
                    <h2 style={{ marginBottom: '16px' }}>💡 What We Offer</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {['📚 28+ Subject Resources', '🧠 MCQ Practice System', '📤 Student Upload Platform', '❓ Q&A Community Forum', '🤖 AI Study Assistant', '📊 CGPA Calculator', '📅 Semester Planner', '📈 Past Paper Analysis', '🗂 LMS Tutorials', '🏆 Leaderboard System'].map((f, i) => (
                            <div key={i} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>{f}</div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
                    <h2 style={{ marginBottom: '16px' }}>🏢 About HM nexora</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1rem' }}>
                        HM nexora is a professional academic support platform. We provide comprehensive services including assignment solutions, quiz assistance, project guidance, and complete LMS support. Our goal is to empower students and help them achieve their academic goals.
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Link href="/services" className="btn btn-primary">Our Services →</Link>
                        <a href="https://wa.me/923177180123" className="btn btn-secondary" target="_blank" rel="noopener">Contact Us 💬</a>
                    </div>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                    <h2 style={{ marginBottom: '16px' }}>📞 Contact Information</h2>
                    <ul style={{ listStyle: 'none', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        <li style={{ padding: '8px 0' }}>📱 WhatsApp: <a href="https://wa.me/923177180123" target="_blank" rel="noopener">+92 317 7180123</a></li>
                        <li style={{ padding: '8px 0' }}>📧 Email: <a href="mailto:hmnexora@gmail.com">hmnexora@gmail.com</a></li>
                        <li style={{ padding: '8px 0' }}>🌐 Platform: HM nexora</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
