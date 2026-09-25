import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { redirect } from 'next/navigation';
import DashboardNavGrid from '@/components/dashboard/DashboardNavGrid';
import DashboardClient from '@/components/dashboard/DashboardClient';
import StudyActivityChart from '@/components/dashboard/StudyActivityChart';
import { supabase } from '@/app/lib/supabase';

export default async function DashboardPage() {
    const cookie = (await cookies()).get('session')?.value;
    const session = cookie ? await verifySession(cookie) : null;

    if (!session) {
        redirect('/login');
    }

    // Fetch full user profile for followed_subjects
    const { data: userData } = await supabase
        .from('users')
        .select('id, username, followed_subjects')
        .eq('id', session.id)
        .single();

    const isAdmin = session.role === 'admin' || session.role === 'owner';

    return (
        <div className="page">
            {/* Subject Selection & Dashboard Logic */}
            {!isAdmin && userData && <DashboardClient user={userData as any} />}

            {/* Welcome Section */}
            <section style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                padding: '40px',
                borderRadius: '15px',
                marginBottom: '50px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Render User Avatar or Placeholder Emoji */}
                    {session.avatar_url ? (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', flexShrink: 0 }}>
                            <img src={session.avatar_url?.startsWith('http') ? session.avatar_url : `/api/download/${session.avatar_url}?mode=inline`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', border: '3px solid var(--bg)', flexShrink: 0 }}>
                            {session.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}

                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', lineHeight: '1.2' }}>
                            👋 Welcome, {session.username}!
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                            Welcome back to the **Center for Academic Excellence**. Let's continue your learning journey.
                        </p>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📚</div>
                    <p style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{session.role}</p>
                </div>
            </section>

            {/* Activity Chart Section */}
            <section style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Study Velocity</h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Past 7 Days</span>
                </div>
                <StudyActivityChart />
            </section>

            {/* Quick Stats */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Your Impact</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px'
                }}>
                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📖</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Materials Viewed</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>0</p>
                    </div>

                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Quizzes Taken</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>0</p>
                    </div>

                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📤</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Files Uploaded</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>0</p>
                    </div>

                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⭐</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Study Points</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>0 XP</p>
                    </div>
                </div>
            </section>

            {/* Quick Access */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Quick Access</h2>
                <DashboardNavGrid items={[
                    ...(isAdmin ? [{ icon: '⚙️', label: 'Admin Panel', href: '/admin' }] : []),
                    { icon: '📚', label: 'Library', href: '/subjects' },
                    { icon: '✅', label: 'Exam Hub', href: '/mcq-practice' },
                    { icon: '🗓️', label: 'Planner', href: '/semester-planner' },
                    { icon: '📖', label: 'Study Vault', href: '/resources' },
                    { icon: '💼', label: 'Services', href: '/services' },
                    { icon: '❓', label: 'Help Desk', href: '/qna' },
                    { icon: '🏆', label: 'Achievers', href: '/leaderboard' },
                    { icon: '📤', label: 'Contribute', href: '/upload' },
                    { icon: '👤', label: 'My Profile', href: '/profile' }
                ]} />
            </section>

            {/* Recommendations */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>📚 Recommended for You</h2>
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                }}>
                    <p style={{ marginBottom: '20px' }}>Start exploring your subjects to get personalized recommendations!</p>
                    <Link href="/subjects" className="btn btn-primary" style={{ padding: '12px 30px' }}>
                        Browse Subjects →
                    </Link>
                </div>
            </section>
        </div>
    );
}
