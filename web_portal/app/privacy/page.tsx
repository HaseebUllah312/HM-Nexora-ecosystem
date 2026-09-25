export default function PrivacyPage() {
    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header"><h1>🔒 Privacy Policy</h1><p>Last updated: February 14, 2026</p></div>
                <div className="card" style={{ padding: '32px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    <p style={{ marginBottom: '24px' }}>
                        Welcome to HM nexora. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
                    </p>

                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>1. Information We Collect</h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
                        <li><strong>Personal Information:</strong> When you register, upload files, or contact us, we may collect your name, email address, VU Student ID, and academic program details.</li>
                        <li><strong>Usage Data:</strong> We automatically collect information about how you interact with our services, such as pages visited, time spent, and files downloaded.</li>
                        <li><strong>Cookies:</strong> We use cookies to enhance your experience, remember your preferences (like dark mode), and analyze site traffic.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>2. How We Use Your Information</h2>
                    <p>We use the collected data for the following purposes:</p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
                        <li>To provide and maintain our academic services.</li>
                        <li>To personalize your user experience and improve our website.</li>
                        <li>To communicate with you regarding updates, new features, or support inquiries.</li>
                        <li>To monitor the usage of our services and detect technical issues.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>3. Data Sharing & Third-Party Services</h2>
                    <p>We do not sell or rent your personal information to third parties. However, we may share detailed data with:</p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
                        <li><strong>Service Providers:</strong> We may use third-party companies (e.g., Google Analytics, Hosting Providers) to facilitate our service.</li>
                        <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>4. Academic Integrity & Disclaimer</h2>
                    <div style={{ padding: '16px', background: 'rgba(234, 179, 8, 0.1)', borderLeft: '4px solid var(--warning)', borderRadius: '4px', marginBottom: '16px' }}>
                        <p style={{ color: 'var(--warning)', margin: 0 }}><strong>⚠️ Important Notice:</strong></p>
                        <p style={{ margin: '8px 0 0' }}>
                            HM nexora is a resource sharing platform designed to assist students in their studies. We strictly condemn academic dishonesty. Users act at their own risk when using these resources.
                        </p>
                    </div>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>5. Data Security</h2>
                    <p>We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no method of transmission over the Internet is 100% secure.</p>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>6. Your Rights</h2>
                    <p>You have the right to access, update, or delete your personal information. If you wish to exercise these rights, please contact us.</p>

                    <h2 style={{ color: 'var(--text-primary)', margin: '24px 0 12px' }}>7. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                    <p style={{ marginTop: '8px' }}>📧 <strong>Email:</strong> <a href="mailto:hmnexora@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>hmnexora@gmail.com</a></p>
                </div>
            </div>
        </div>
    );
}
