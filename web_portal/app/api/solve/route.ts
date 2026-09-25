import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with the API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { question } = await req.json();

        if (!question) {
            return NextResponse.json({ error: 'Question text is required.' }, { status: 400 });
        }

        const prompt = `
            You are a helpful academic assistant solving questions for a student helper tool on Virtual University (VU) LMS.
            
            Question:
            ${question}
            
            Instructions:
            1. If this is a multiple choice question (MCQ), state the correct option clearly at the very top in this exact format: "Correct Option: [Option Letter]: [Option Text]" (e.g. "Correct Option: D: correlation"). Do not use bold marks inside this line.
            2. Below that, write the word "Reason: " followed by a brief, accurate explanation of why it is correct (keep it under 3-4 bullet points or a short paragraph).
            3. Be concise and precise. Max word limit is 100 words.
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

        return NextResponse.json({ answer: responseText });

    } catch (error: any) {
        console.error('AI Solver API Error:', error);
        return NextResponse.json({ 
            error: 'AI Solver is currently unavailable or rate limited. Please try again.' 
        }, { status: 500 });
    }
}
