'use client';
import Image from 'next/image';

export default function ModernLogo() {
    return (
        <div className="modern-logo-container" style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0, 51, 102, 0.15)' }}>
            <Image
                src="/logo.png"
                alt="HM Logo"
                width={40}
                height={40}
                className="modern-logo"
                style={{ objectFit: 'cover' }}
            />
        </div>
    );
}
