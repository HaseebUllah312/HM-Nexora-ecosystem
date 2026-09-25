import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// POST /api/polls/vote — cast a vote
export async function POST(req: NextRequest) {
    try {
        const { pollId, optionId, voterKey } = await req.json();

        if (!pollId || !optionId) {
            return NextResponse.json({ error: 'pollId and optionId are required' }, { status: 400 });
        }

        // Check if voter already voted (using localStorage key sent from client)
        if (voterKey) {
            const { data: existing } = await supabase
                .from('poll_votes')
                .select('id')
                .eq('poll_id', pollId)
                .eq('voter_key', voterKey)
                .maybeSingle();

            if (existing) {
                return NextResponse.json({ error: 'already_voted', message: 'You have already voted on this poll.' }, { status: 409 });
            }
        }

        // Increment the vote count
        const { error: voteErr } = await supabase.rpc('increment_poll_vote', {
            p_option_id: optionId,
        });

        if (voteErr) {
            // Fallback: direct update
            const { data: opt } = await supabase
                .from('poll_options')
                .select('votes')
                .eq('id', optionId)
                .single();

            await supabase
                .from('poll_options')
                .update({ votes: (opt?.votes || 0) + 1 })
                .eq('id', optionId);
        }

        // Record the vote
        if (voterKey) {
            await supabase.from('poll_votes').insert({
                poll_id: pollId,
                option_id: optionId,
                voter_key: voterKey,
            });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Vote error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
