import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h4>📚 HM nexora</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            Your all-in-one academic companion. Access study materials, practice MCQs, and boost your grades.
                        </p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Academic Platform</p>
                    </div>
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link href="/subjects">Subject Library</Link></li>
                            <li><Link href="/mcq-practice">MCQ Practice</Link></li>
                            <li><Link href="/tools">Academic Tools</Link></li>
                            <li><Link href="/upload">Upload Files</Link></li>
                            <li><Link href="/qna">Q&A Forum</Link></li>
                            <li><Link href="/services">Our Services</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <ul className="footer-links">
                            <li><Link href="/announcements">Announcements</Link></li>
                            <li><Link href="/leaderboard">Leaderboard</Link></li>
                            <li><Link href="/lms-guide">LMS Guides</Link></li>
                            <li><Link href="/tough-subjects">Tough Subjects</Link></li>
                            <li><Link href="/semester-planner">Semester Planner</Link></li>
                            <li><Link href="/past-paper-analyzer">Past Paper Analyzer</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contact HM nexora</h4>
                        <ul className="footer-links">
                            <li>📱 <a href="https://wa.me/923177180123" target="_blank" rel="noopener">+92 317 7180123</a></li>
                            <li>🎥 <a href="https://youtube.com/@hmnexora?si=BP1iRNlzm3lr1lgJ" target="_blank" rel="noopener">YouTube Channel</a></li>
                            <li>📧 <a href="mailto:hmnexora@gmail.com">hmnexora@gmail.com</a></li>
                            <li><Link href="/services">Our Services</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', flexWrap: 'wrap', gap: '20px' }}>
                    <span style={{ fontSize: '0.85rem' }}>© 2026 HM nexora. Designed & Developed by **𝕴𝖙'𝖘 𝕸𝖚𝖌𝖍𝖆𝖑**</span>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                        <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
                        <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms & Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
