export default function TermsPage() {
    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header"><h1>📄 Terms & Conditions</h1><p>Last updated: February 14, 2026</p></div>
                <div className="card" style={{ padding: '32px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>1. Acceptance of Terms</h2>
                    <p>By accessing HM nexora, you agree to these terms and conditions. If you do not agree, please do not use our platform.</p>
                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>2. Use of Platform</h2>
                    <p>This platform is intended for educational purposes. You agree to use it responsibly and not for any unlawful or harmful activities.</p>
                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>3. Content Upload Policy</h2>
                    <p>All uploaded content goes through admin approval. We reserve the right to reject or remove content that violates our policies.</p>
                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>4. Academic Integrity</h2>
                    <p style={{ padding: '16px', background: 'var(--error-bg)', borderRadius: 'var(--radius-md)' }}>🚨 <strong>Warning:</strong> This platform provides study materials for learning purposes. Submitting others&apos; work as your own violates VU academic policies and may result in disciplinary action. Always use materials ethically.</p>
                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>5. Intellectual Property</h2>
                    <p>Content uploaded by users remains their intellectual property. By uploading, you grant us a non-exclusive license to display and distribute it on our platform.</p>
                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>6. Report Abuse</h2>
                    <p>If you find any content that violates policies, please report it to <a href="mailto:hmnexora@gmail.com">hmnexora@gmail.com</a>. We will take appropriate action within 24 hours.</p>
                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>7. Limitation of Liability</h2>
                    <p>HM nexora is not liable for any damages arising from the use of this platform. Use at your own discretion.</p>
                </div>
            </div>
        </div>
    );
}
