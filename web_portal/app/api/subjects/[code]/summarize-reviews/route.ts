import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> | { code: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const code = resolvedParams.code;

        // Fetch all reviews for the subject
        const { data: reviews, error } = await supabase
            .from('subject_reviews')
            .select('comment, rating, term')
            .eq('subject_code', code.toUpperCase());

        if (error) {
            console.error('Error fetching reviews for summary:', error);
            return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
        }

        if (!reviews || reviews.length === 0) {
            return NextResponse.json({ error: 'No reviews found to summarize.' }, { status: 404 });
        }

        // We only need a reasonable number of reviews to generate a summary
        // E.g., taking the 50 most recent to stay within token limits and reduce costs.
        const recentReviews = reviews.slice(-50);
        
        const reviewText = recentReviews.map((r, i) => `Review ${i + 1} (Term: ${r.term || 'Unknown'}, Rating: ${r.rating}/5):\n${r.comment}`).join('\n\n');

        const prompt = `
You are an expert academic advisor for Virtual University of Pakistan students.
I will provide you with several student reviews for the subject "${code.toUpperCase()}".

Please read these reviews and provide a single, cohesive "Mega Summary" for future students.
Format the summary beautifully using markdown. Do not include introductory filler. 
Your summary MUST include these exact three headings:

### 📊 Overall Difficulty
(Summarize how hard students found the subject based on the ratings and comments)

### 🎯 Key Topics to Study
(Extract any specific topics, concepts, or files mentioned by students as important for midterm/final)

### 💡 General Advice
(Summarize the best advice given by the students, e.g., "focus on handouts", "memorize MCQs", "watch short lectures")

Here are the reviews:
-----------------
${reviewText}
`;

        const response = await fetch('https://agentrouter.org/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AGENTROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-v4-flash',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error(`AgentRouter API Error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content;

        return NextResponse.json({ summary: responseText });

    } catch (e: any) {
        console.error('AI Summarization Error:', e);
        return NextResponse.json({ 
            error: 'Failed to generate AI summary. Please check your API key or try again later.' 
        }, { status: 500 });
    }
}
