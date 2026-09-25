import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Max questions per AI call to avoid truncation / quality loss
const MAX_PER_CALL = 10;

const AGENTROUTER_API_URL = 'https://agentrouter.org/v1/chat/completions';
const AGENTROUTER_MODEL = 'deepseek-v4-flash';

import { getSubjectByCode } from '@/data/subjects';

/**
 * Repairs common corruption patterns in quiz JSON files:
 * 1. Multiple concatenated arrays: ] [ → merge into one array
 * 2. Citation markers leftover from document processing: [cite_start] [cite: N]
 */
function repairJSON(raw: string): string {
    let txt = raw;
    // Remove exactly the citation markers without eating content in between
    txt = txt.replace(/\[cite_start\]/g, '');
    txt = txt.replace(/\[cite_start\s*\]/g, '');
    txt = txt.replace(/\[cite:\s*[\d,\s]+\]/g, '');

    // Merge concatenated arrays: ] [ -> ,
    txt = txt.replace(/\]\s*\n*\s*\[/g, ',\n');

    // Final trim and cleanup
    return txt.trim();
}

// GET /api/quiz/data?subject=CS101&type=midterm&count=20
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const subject = searchParams.get('subject')?.toUpperCase();
    const typeRaw = searchParams.get('type');
    const type = typeRaw || 'midterm';
    const filterByType = !!typeRaw;
    const lec = searchParams.get('lec');
    const topicParam = searchParams.get('topic');
    const count = Math.min(parseInt(searchParams.get('count') || '20'), 100);

    if (!subject) {
        return NextResponse.json({ error: 'Subject code required' }, { status: 400 });
    }

    const subjectData = getSubjectByCode(subject);
    const subjectName = subjectData ? subjectData.name : `${subject} - Subject`;

    console.log(`Quiz Request: ${subject} (${subjectName}) | ${type} | Count: ${count}`);

    // ─── 1. Try local JSON cache ─────────────────────────────────────────────
    const quizDir = path.join(process.cwd(), 'data', 'quizzes');
    const variations = [`${subject}.json`, `${subject.toLowerCase()}.json`].filter((v, i, a) => a.indexOf(v) === i);

    let filePath: string | null = null;
    for (const v of variations) {
        const p = path.join(quizDir, v);
        if (fs.existsSync(p)) {
            filePath = p;
            break;
        }
    }

    if (filePath) {
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(repairJSON(raw));
            const examTerm = type === 'midterm' ? 'Midterm' : 'Final';

            // ── FORMAT C: Flat array of questions ───────────────────────────
            if (Array.isArray(data)) {
                const topicMap: Record<string, any[]> = {};
                for (const q of data) {
                    const topicName = q.topic || 'General';
                    if (!topicMap[topicName]) topicMap[topicName] = [];
                    topicMap[topicName].push({
                        question: q.question,
                        options: q.options,
                        correct: q.correct,
                        explanation: q.explanation || '',
                    });
                }

                const allTopicNames = Object.keys(topicMap);
                const midCutoff = Math.ceil(allTopicNames.length / 2);

                let filteredNames: string[];
                if (topicParam) {
                    const search = topicParam.toLowerCase();
                    filteredNames = allTopicNames.filter(n => n.toLowerCase().includes(search));
                } else if (filterByType) {
                    filteredNames = type === 'midterm'
                        ? allTopicNames.slice(0, midCutoff)
                        : allTopicNames.slice(midCutoff);
                } else {
                    filteredNames = allTopicNames;
                }

                const topics = filteredNames.map((name, idx) => ({
                    id: name.toLowerCase().replace(/\s+/g, '_'),
                    name,
                    term: idx < midCutoff ? 'Midterm' : 'Final',
                    questions: topicMap[name],
                }));

                console.log(`[Format C] ${subject}: ${examTerm} - ${topics.length} topics, ${topics.reduce((s, t) => s + t.questions.length, 0)} questions`);

                return NextResponse.json({ subject, title: subjectName, term: examTerm, topics });
            }

            // ── FORMAT A & B: Object with topics array ──────────────────────
            const rawTopics: any[] = data.topics || [];

            if (topicParam) {
                const search = topicParam.toLowerCase();
                const topicQs = rawTopics
                    .filter((t: any) => t.name?.toLowerCase().includes(search) || t.id?.toLowerCase().includes(search))
                    .map((t: any) => ({ ...t, term: t.term || examTerm }));

                if (topicQs.length > 0) {
                    return NextResponse.json({ ...data, topics: topicQs });
                }
            }

            const hasTermTags = rawTopics.some((t: any) => !!t.term);
            let filteredTopics: any[];

            if (hasTermTags) {
                const midCutoff = Math.ceil(rawTopics.length / 2);
                if (!filterByType) {
                    // No filter — return all topics, stamp untagged ones by position
                    filteredTopics = rawTopics.map((t: any, idx: number) => ({
                        ...t,
                        term: t.term || (idx < midCutoff ? 'Midterm' : 'Final'),
                    }));
                } else {
                    // Topics explicitly tagged with the requested term
                    const taggedMatching = rawTopics.filter((t: any) => {
                        const termVal = (t.term || '').toLowerCase();
                        if (type === 'midterm') return termVal.includes('mid');
                        return termVal.includes('final') || termVal.includes('fin');
                    });
                    // Topics with NO term tag — assign them by position
                    const untagged = rawTopics
                        .map((t: any, idx: number) => ({ t, idx }))
                        .filter(({ t }) => !t.term)
                        .map(({ t, idx }) => ({
                            ...t,
                            term: idx < midCutoff ? 'Midterm' : 'Final',
                        }))
                        .filter((t: any) => {
                            const termVal = t.term.toLowerCase();
                            if (type === 'midterm') return termVal.includes('mid');
                            return termVal.includes('final');
                        });

                    // Count total questions available from tagged matching topics
                    const taggedQCount = taggedMatching.reduce((s: number, t: any) => s + (t.questions?.length || 0), 0);

                    if (taggedQCount >= count) {
                        // Enough tagged questions — use only those
                        filteredTopics = taggedMatching;
                    } else {
                        // Not enough — combine tagged + untagged (by-position) topics
                        filteredTopics = [...taggedMatching, ...untagged];
                    }

                    // Last resort: nothing found → return all
                    if (filteredTopics.length === 0 && rawTopics.length > 0) {
                        filteredTopics = rawTopics;
                    }
                }
            } else {
                const midCutoff = Math.ceil(rawTopics.length / 2);
                if (!filterByType) {
                    filteredTopics = rawTopics.map((t: any, idx: number) => ({
                        ...t,
                        term: idx < midCutoff ? 'Midterm' : 'Final',
                    }));
                } else {
                    const half = type === 'midterm'
                        ? rawTopics.slice(0, midCutoff)
                        : rawTopics.slice(midCutoff);
                    filteredTopics = rawTopics.length <= 1 ? rawTopics : half;
                }
            }

            const stampedTopics = filteredTopics.map((t: any) => ({
                ...t,
                term: t.term || examTerm,
            }));

            const totalQs = stampedTopics.reduce((s: number, t: any) => s + (t.questions?.length || 0), 0);
            console.log(`[Format ${hasTermTags ? 'A' : 'B'}] ${subject}: ${examTerm} - ${stampedTopics.length} topics, ${totalQs} questions`);

            return NextResponse.json({ ...data, term: examTerm, topics: stampedTopics });

        } catch (err) {
            console.error('Local data read error:', err);
        }
    }

    // ─── 2. Generate via AI (Gemini primary → DeepSeek fallback) ────────────
    const geminiKey = process.env.GEMINI_API_KEY;
    const agentRouterKey = process.env.AGENTROUTER_API_KEY;

    if (!geminiKey && !agentRouterKey) {
        return NextResponse.json({ error: 'No quiz data available for this subject.' }, { status: 404 });
    }

    const examLabel = type === 'midterm' ? 'Midterm' : 'Final Term';
    const batches: number[] = [];
    let remaining = count;
    while (remaining > 0) {
        const batchSize = Math.min(remaining, MAX_PER_CALL);
        batches.push(batchSize);
        remaining -= batchSize;
    }

    try {
        const provider = agentRouterKey ? 'AgentRouter' : 'Gemini';
        console.log(`Generating ${count} MCQs for ${subjectName} via ${provider} in ${batches.length} batches...`);

        const batchPromises = batches.map((batchCount, idx) =>
            generateWithRetry(geminiKey, agentRouterKey, subject, subjectName, examLabel, batchCount, idx, batches.length, lec, topicParam)
        );

        const batchResults = await Promise.all(batchPromises);

        const allTopics: any[] = [];
        let totalQsFound = 0;

        for (const result of batchResults) {
            if (result && result.topics) {
                for (const topic of result.topics) {
                    const existing = allTopics.find(t => t.name === topic.name);
                    const questions = topic.questions || [];
                    totalQsFound += questions.length;

                    if (existing) {
                        existing.questions.push(...questions);
                    } else {
                        allTopics.push({ ...topic, term: examLabel });
                    }
                }
            }
        }

        if (totalQsFound === 0) {
            console.error(`AI failed all batches for ${subject} (${subjectName})`);
            return NextResponse.json({ error: 'AI generation failed. Please try again or select a different subject.' }, { status: 500 });
        }

        console.log(`Successfully generated ${totalQsFound} questions for ${subject}`);

        // ─── 3. Save to Local Cache (NEW) ──────────────────────────────────
        try {
            const quizPath = path.join(process.cwd(), 'data', 'quizzes', `${subject}.json`);
            const outputData = {
                subject,
                title: `${subjectName} - Practice Quiz`,
                topics: allTopics
            };

            // Ensure directory exists
            const dir = path.dirname(quizPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(quizPath, JSON.stringify(outputData, null, 4));
            console.log(`Saved AI-generated quiz to: ${quizPath}`);
        } catch (saveErr) {
            console.error('Failed to cache AI quiz to disk:', saveErr);
        }

        return NextResponse.json({ subject, term: examLabel, topics: allTopics });

    } catch (err: any) {
        console.error('Final merge error:', err);
        return NextResponse.json({ error: 'System error during quiz generation.' }, { status: 500 });
    }
}

// ─── Shared prompt builder ────────────────────────────────────────────────────
function buildMCQPrompt(
    subject: string, subjectName: string, examLabel: string,
    batchCount: number, batchIndex: number, totalBatches: number,
    lec?: string | null, topicParam?: string | null
): string {
    const easyCount = Math.floor(batchCount * 0.20);
    const mediumCount = Math.floor(batchCount * 0.50);
    const hardCount = batchCount - easyCount - mediumCount;

    let focusText = `for the ${examLabel} exam`;
    if (topicParam) focusText = `specifically for the topic: "${topicParam}"`;
    else if (lec) focusText = `strictly from VU lectures: ${lec}`;

    const topicHint = totalBatches > 1
        ? `This is batch ${batchIndex + 1} of ${totalBatches}. Cover DIFFERENT sub-topics than previous batches.`
        : '';

    return `You are a Senior Academic Content Designer specializing in university examinations for the Virtual University of Pakistan (VU).

Task: Generate exactly ${batchCount} professional MCQs for the following VU course:
Course Code: ${subject}
Course Name: ${subjectName}
Exam Focus: ${examLabel}
Context: ${focusText}
${topicHint}

Instructions:
1. Use the official Virtual University of Pakistan (VU) curriculum and handout context where applicable.
2. Use academic language (formal, precise English).
3. Use logical distractors (based on common misconceptions, not trivially wrong).
4. Write professional explanations (scholarly paragraph: why the correct answer is right and others are wrong).
5. Difficulty distribution: ${easyCount} Easy, ${mediumCount} Medium, ${hardCount} Hard.

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "subject": "${subject}",
  "term": "${examLabel}",
  "topics": [
    {
      "name": "Academic Topic Name",
      "term": "${examLabel}",
      "questions": [
        {
          "question": "Logically structured question?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct": 0,
          "explanation": "Detailed scholarly explanation..."
        }
      ]
    }
  ]
}`;
}

// ─── Shared JSON parser ───────────────────────────────────────────────────────
function parseAIResponse(rawText: string): any | null {
    try {
        return JSON.parse(rawText);
    } catch {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[0]); } catch { }
        }
        console.error('Failed to parse AI JSON response:', rawText.slice(0, 200));
        return null;
    }
}

// ─── Retry wrapper: Gemini first → DeepSeek fallback ─────────────────────────
async function generateWithRetry(
    geminiKey: string | undefined,
    agentRouterKey: string | undefined,
    subject: string, subjectName: string, examLabel: string,
    batchCount: number, batchIndex: number, totalBatches: number,
    lec?: string | null, topicParam?: string | null,
    retries = 2
): Promise<any> {
    for (let i = 0; i <= retries; i++) {
        try {
            // Primary: Gemini (free tier, reliable JSON mode)
            if (geminiKey) {
                const result = await generateBatchGemini(geminiKey, subject, subjectName, examLabel, batchCount, batchIndex, totalBatches, lec, topicParam);
                if (result?.topics?.length > 0) return result;
                console.warn(`[Gemini] Batch ${batchIndex + 1} attempt ${i + 1} failed`);
            }

            // Fallback / Primary alternative: AgentRouter
            if (agentRouterKey) {
                const result = await generateBatchAgentRouter(agentRouterKey, subject, subjectName, examLabel, batchCount, batchIndex, totalBatches, lec, topicParam);
                if (result?.topics?.length > 0) return result;
                console.warn(`[AgentRouter] Batch ${batchIndex + 1} attempt ${i + 1} failed`);
            }
        } catch (e) {
            console.warn(`Batch ${batchIndex + 1} exception on attempt ${i + 1}:`, e);
        }
    }
    return null;
}

// ─── Gemini generator ─────────────────────────────────────────────────────────
async function generateBatchGemini(
    apiKey: string, subject: string, subjectName: string, examLabel: string,
    batchCount: number, batchIndex: number, totalBatches: number,
    lec?: string | null, topicParam?: string | null
): Promise<any> {
    const prompt = buildMCQPrompt(subject, subjectName, examLabel, batchCount, batchIndex, totalBatches, lec, topicParam);

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ],
            }),
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Gemini] Batch error: ${response.status}`, errorData);
        return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    return parseAIResponse(rawText);
}

// ─── Agent Router generator ───────────────────────────────────────────────────────
async function generateBatchAgentRouter(
    apiKey: string, subject: string, subjectName: string, examLabel: string,
    batchCount: number, batchIndex: number, totalBatches: number,
    lec?: string | null, topicParam?: string | null
): Promise<any> {
    const prompt = buildMCQPrompt(subject, subjectName, examLabel, batchCount, batchIndex, totalBatches, lec, topicParam);

    const response = await fetch(AGENTROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: AGENTROUTER_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert academic content generator for Virtual University of Pakistan. You ONLY respond with valid JSON, no markdown, no code fences, no text outside the JSON.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 8192,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[AgentRouter] Batch error: ${response.status}`, errorData);
        return null;
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) return null;

    return parseAIResponse(rawText);
}
