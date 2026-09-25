import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
    try {
        // 1. Fetch Review counts (50 pts each)
        const { data: reviews, error: rError } = await supabase
            .from('subject_reviews')
            .select('username');

        if (rError) throw rError;

        // 2. Fetch Q&A Answer counts (100 pts each)
        const { data: answers, error: aError } = await supabase
            .from('qna_answers')
            .select('author');

        if (aError) {
             console.log("Q&A Answers table may not exist yet or error:", aError.message);
        }

        const stats: Record<string, { reviews: number; answers: number; points: number }> = {};

        reviews.forEach(r => {
            if (!stats[r.username]) stats[r.username] = { reviews: 0, answers: 0, points: 0 };
            stats[r.username].reviews++;
            stats[r.username].points += 50;
        });

        (answers || []).forEach(a => {
            if (!stats[a.author]) stats[a.author] = { reviews: 0, answers: 0, points: 0 };
            stats[a.author].answers++;
            stats[a.author].points += 100;
        });

        // 3. Format and Sort
        const leaderboard = Object.entries(stats)
            .map(([name, data]) => ({
                name,
                reviews: data.reviews,
                answers: data.answers,
                points: data.points
            }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 10)
            .map((u, i) => ({
                ...u,
                rank: i + 1,
                badge: i === 0 ? '🏆' : i === 1 ? '🥇' : i === 2 ? '🥈' : '⭐'
            }));

        return NextResponse.json({
            topUploaders: leaderboard, // For the main block
            topAnswerers: leaderboard.filter(u => u.answers > 0).sort((a, b) => b.answers - a.answers)
        });
    } catch (e) {
        console.error('Leaderboard API error:', e);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
