import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ success: false, error: 'Please provide a valid chat history.' }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("GROQ_API_KEY is not set in environment variables");
            return NextResponse.json({ success: false, error: 'AI Service is currently unavailable (Missing API Key)' }, { status: 500 });
        }

        // 1. Get the latest user message
        const latestUserMessage = messages[messages.length - 1].content;

        // 2. Detect Subject Code from the ENTIRE chat history to maintain context
        const fullChatString = messages.map((m: any) => m.content).join(' ');
        const subjectMatch = fullChatString.match(/[a-zA-Z]{2,3}\d{3}/);
        let subjectCode = subjectMatch ? subjectMatch[0].toUpperCase() : null;
        let reviewsText = "No specific subject detected or no reviews found.";
        
        // 3. Fetch reviews if a subject is detected
        if (subjectCode) {
            const { data: reviews, error } = await supabase
                .from('subject_reviews')
                .select('*')
                .eq('subject_code', subjectCode)
                .limit(50); // get top 50 recent reviews
            
            if (!error && reviews && reviews.length > 0) {
                reviewsText = reviews.map((r: any, idx: number) => `Review ${idx + 1}:\nRating: ${r.rating}/5\nTerm: ${r.term}\nComment: ${r.comment}`).join('\n\n');
            } else {
                reviewsText = `No reviews found in the database for ${subjectCode}.`;
            }
        }

        // 4. System Prompt setup
        const systemPrompt = `You are a highly intelligent and helpful academic AI assistant for university students using the "HM Nexora" platform.
A student is chatting with you about exam reviews.

If a subject is mentioned in the chat, I have automatically fetched the latest student reviews for that subject from the database. 
Here are the reviews:
--------------------
${reviewsText}
--------------------

Instructions:
1. Answer the user's questions intelligently. If they ask about a subject, use the provided reviews to answer.
2. If they ask a follow-up question (like "solve that MCQ"), use the context from the chat history and the reviews.
3. If there are no reviews for the requested subject, politely inform the user.
4. Use formatting (bullet points, bold text) to make your answer easy to read.
5. Do NOT make up information about a subject if it is not in the reviews.
`;

        // 5. Send request to Groq API with full message history
        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({
                role: m.role,
                content: m.content
            }))
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: apiMessages,
                temperature: 0.5,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Groq API Error:", errorData);
            throw new Error(errorData.error?.message || 'Failed to generate response from Groq');
        }

        const data = await response.json();
        const answer = data.choices[0].message.content;

        return NextResponse.json({ success: true, summary: answer, subjectDetected: subjectCode });

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to process AI request' }, { status: 500 });
    }
}
