import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with the API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { subjectCode, subjectName, query } = await req.json();

        if (!subjectCode || !query) {
            return NextResponse.json({ error: 'Subject code and query are required.' }, { status: 400 });
        }

        const prompt = `
            You are an elite academic assistant for "HM Nexora", a platform for Virtual University (VU) students in Pakistan.
            
            Student Input:
            Subject: ${subjectCode} - ${subjectName}
            Question: ${query}
            
            Instructions:
            1. Provide a professional, concise, and structured answer (max 200 words).
            2. Specialization: You know the VU ecosystem (VULMS, Graded Discussion Boards (GDB), Assignments, and the 20% / 80% weightage systems).
            3. If the user asks for exam help, distinguish between Midterm (Lec 1-22) and Final Term (Lec 23-45) content for ${subjectCode}.
            4. Use Markdown formatting (bold, bullet points).
            5. End with a very short "Nexora Tip" related to studying this subject efficiently.
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
        console.error('Gemini API Error:', error);
        return NextResponse.json({ 
            error: 'AI Assistant is currently unavailable. Please try again later.' 
        }, { status: 500 });
    }
}
