import { NextRequest, NextResponse } from 'next/server';

const modeInstructions: Record<string, string> = {
    quick: 'Give a brief, precise answer in 3-5 sentences. Be direct, accurate, and helpful. Do not pad with unnecessary text.',
    detailed: 'Give a thorough, well-structured explanation. Use clear headings, bullet points, numbered steps, and real examples. Break complex ideas into digestible parts. End by asking if they need further clarification.',
    exam: 'Focus on VU exam preparation. Identify what is likely to be tested, provide model answers, mention marks distribution, give memory tricks/mnemonics, and highlight common mistakes students make. Keep it exam-strategic.',
    quiz: 'Generate 5 high-quality MCQs on the topic with 4 options each (A, B, C, D). Mark the correct answer with ✅ and give a 1-line explanation for why that answer is correct. Number each question clearly.',
};

export async function POST(request: NextRequest) {
    try {
        const { message, mode = 'quick', history = [], weakTopics } = await request.json();

        if (!message?.trim()) {
            return NextResponse.json({ reply: 'Please type a question first.' }, { status: 400 });
        }
        
        let weakTopicPrompt = '';
        if (weakTopics && Object.keys(weakTopics).length > 0) {
            weakTopicPrompt = `\n\n## Student Performance Insight:\nThe student is currently struggling with these topics: ${JSON.stringify(weakTopics)}. If they ask about these topics, provide extra encouragement and more foundational explanations. If the current question is related, mention that you've noticed their interest in this area.`;
        }

        const groqKey = process.env.GROQ_API_KEY;

        if (!groqKey) {
            console.error('No AI API Keys set.');
            return NextResponse.json({
                reply: '⚠️ AI service is temporarily unavailable. Please configure API keys or contact support.',
            });
        }

        const systemPrompt = `You are **HM nexora AI Mentor** — a highly knowledgeable, professional, and friendly academic tutor exclusively for **Virtual University of Pakistan (VU)** students.

## Your Expertise:
You have deep knowledge of all VU courses (CS, IT, Mathematics, Management, English, etc.).

## Response Style:
- **Professional yet warm** — like a brilliant senior student or university lecturer who genuinely cares.
- **Contextually aware** — use Pakistani academic context (VU handouts, VULMS, GDB, Quiz, Assignment).
- **Structured** — use formatting (bullet points, bold terms) for clarity.

## Current Mode:
${modeInstructions[mode] || modeInstructions.quick}

## Important Rules:
- Redirect non-academic questions politely.
- Use Pakistani context and local currency in examples.
- Format math clearly using text notation.`;

        // Combine system prompt with performance insight
        const fullSystemPrompt = systemPrompt + (weakTopicPrompt || '');

        try {
            // Format history for OpenAI format (Groq)
            const messages = [{ role: 'system', content: fullSystemPrompt }];
            if (Array.isArray(history)) {
                history.filter((msg: any) => msg.text?.trim()).forEach((msg: any) => {
                    messages.push({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.text
                    });
                });
            }
            messages.push({ role: 'user', content: message });
            const finalMessages = messages.length > 11 ? [messages[0], ...messages.slice(-10)] : messages;

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: finalMessages,
                    temperature: mode === 'quiz' ? 0.6 : 0.75,
                    max_tokens: mode === 'quick' ? 500 : 2000,
                    stream: false
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const reply = data?.choices?.[0]?.message?.content;
                if (reply) return NextResponse.json({ reply: reply.trim(), provider: 'groq' });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error(`Groq Failed (Status ${response.status}):`, errorData);
            }
        } catch (err) {
            console.error('Groq fetch error:', err);
        }

        return NextResponse.json({
            reply: '⚠️ Both AI engines are currently unavailable. Please check your connection or try again in a minute.',
        }, { status: 503 });

    } catch (error) {
        console.error('Chat API general error:', error);
        return NextResponse.json({
            reply: '⚠️ Something went wrong. Please refresh the page and try again.',
        }, { status: 500 });
    }
}
