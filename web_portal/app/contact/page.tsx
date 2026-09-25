'use client';

export default function ContactPage() {
    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <h1>📞 Contact Us</h1>
                    <p>Get in touch with HM nexora for any academic assistance</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <a href="https://wa.me/923177180123" target="_blank" rel="noopener" className="card" style={{ textAlign: 'center', padding: '32px', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
                        <h3>WhatsApp</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>+92 317 7180123</p>
                        <span className="badge badge-success" style={{ marginTop: '12px' }}>Available 24/7</span>
                    </a>
                    <a href="mailto:hmnexora@gmail.com" className="card" style={{ textAlign: 'center', padding: '32px', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📧</div>
                        <h3>Email</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>hmnexora@gmail.com</p>
                        <span className="badge badge-info" style={{ marginTop: '12px' }}>Reply within 1 hour</span>
                    </a>
                    <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌐</div>
                        <h3>Platform</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>HM nexora</p>
                        <span className="badge badge-primary" style={{ marginTop: '12px' }}>Academic Platform</span>
                    </div>
                </div>

                <div className="card" style={{ padding: '32px' }}>
                    <h2 style={{ marginBottom: '20px' }}>📝 Send us a Message</h2>
                    <form onSubmit={e => e.preventDefault()}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group"><label className="form-label">Your Name</label><input className="form-input" placeholder="Full name" /></div>
                            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="your@email.com" /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Subject</label><input className="form-input" placeholder="How can we help?" /></div>
                        <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" placeholder="Write your message..." /></div>
                        <button className="btn btn-primary btn-lg btn-block">Send Message ✉️</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
