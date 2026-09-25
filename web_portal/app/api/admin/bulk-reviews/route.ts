import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

const PROMO_KEYWORDS = [
    'http', 'https', 'www', '.com', 'subscribe', 'buy', 'discount', 'promo',
    'whatsapp', 'facebook', 'instagram', 'telegram', 't.me', 'offer', 'channel'
];

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        
        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // Split by WhatsApp timestamp if present, or Course Code template, otherwise by double newline
        let rawReviews: string[] = [];
        if (/\[\d{2}\/\d{2},\s*\d{1,2}:\d{2}\s*[aApP][mM]\]/.test(text)) {
            const splitRegex = /(?=\[\d{2}\/\d{2},\s*\d{1,2}:\d{2}\s*[aApP][mM]\])/;
            rawReviews = text.split(splitRegex).map((r: string) => r.trim()).filter((r: string) => r.length > 0);
        } else if (/📖\s*Course Code|Course Code/i.test(text)) {
            // Forwarded template format (e.g. from WhatsApp channels)
            const splitRegex = /(?=📖\s*Course Code|Course Code)/i;
            rawReviews = text.split(splitRegex).map((r: string) => r.trim()).filter((r: string) => r.length > 0);
        } else {
            rawReviews = text.split(/\n\s*\n/);
        }
        
        const details = [];
        let successCount = 0;
        let failedCount = 0;
        let filteredCount = 0;

        for (const raw of rawReviews) {
            const reviewText = raw.trim();
            if (!reviewText) continue;

            let cleanedText = reviewText
                // Remove the WhatsApp prefix if present (e.g. "[01/06, 11:04 am] null:")
                .replace(/^\[\d{2}\/\d{2},\s*\d{1,2}:\d{2}\s*[aApP][mM]\].*?:\s*/, '')
                // Remove all URLs (promotional links)
                .replace(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(com|net|org|pk|co|me|ly|info|io)\b[^\s]*)/gi, '')
                // Remove phone numbers/WhatsApp numbers
                .replace(/(\+92|03|\b0092|\+1)[\d\s-]{8,}\d/gi, '')
                // Remove full promotional sentences from samples
                .replace(/(Follow.*?for more(?: updates?)?:?|Share Your Papers Here:?|For reviews and important messages.*?join our channel|Paper Reviews.*?VU VORTEX|Welcome to.*?|A complete and reliable solution.*?students)/gi, '')
                // Remove specific promotional names and phrases
                .replace(/\b(vu talk|vu toolkit|vu vortex|whatsapp channel|follow our channel|join our channel|follow my channel|subscribe|discount|promo|offer|inbox me|contact me|whatsapp group|whatsapp|telegram|t\.me|official)\b/gi, '')
                // Remove stray pipes, emojis, and symbols left over
                .replace(/Channel • .*? followers/gi, '')
                .replace(/[|👇\(\)\*•—🎓]/gu, '')
                // Remove trailing punctuation left behind by removed text
                .replace(/[:,-]\s*$/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();

            if (cleanedText.length < 5) continue; // Skip if after cleaning there's nothing left

            // Extract subject code (e.g., CS101, MTH 202, ENG501, BIO101, CS-601)
            const match = reviewText.match(/\b([a-zA-Z]{2,4})[-_\s]*(\d{3,4}[a-zA-Z]?)\b/i);
            
            let subjectCode = 'UNKNOWN';
            if (match) {
                subjectCode = `${match[1].toUpperCase()}${match[2].toUpperCase()}`;
            }
            
            // Strict term assignment for current exam season
            const lowerCleaned = cleanedText.toLowerCase();
            const term = 'midterm'; // Hardcoded to midterm as requested
            let rating = 5; // Default high rating
            if (lowerCleaned.includes('terrible') || lowerCleaned.includes('bad') || lowerCleaned.includes('hard') || lowerCleaned.includes('difficult')) {
                rating = 3;
            }
            
            // Check for duplicates
            const { data: existing } = await supabase
                .from('subject_reviews')
                .select('id')
                .eq('comment', cleanedText)
                .limit(1);

            if (existing && existing.length > 0) {
                filteredCount++;
                details.push({
                    status: 'filtered',
                    message: `Duplicate skipped: ${cleanedText.substring(0, 30)}...`
                });
                continue; // Skip insertion
            }

            const { error } = await supabase.from('subject_reviews').insert([{
                subject_code: subjectCode,
                user_id: 'admin-bulk-import',
                username: 'Anonymous',
                rating: rating,
                comment: cleanedText,
                term: term
            }]);

            if (error) {
                failedCount++;
                details.push({
                    status: 'error',
                    message: `Failed to insert: ${error.message}`
                });
            } else {
                successCount++;
                details.push({
                    status: 'success',
                    subject: subjectCode,
                    message: cleanedText.substring(0, 50) + '...'
                });
            }
        }

        return NextResponse.json({
            success: successCount,
            failed: failedCount,
            filtered: filteredCount,
            details: details
        });
        
    } catch (error: any) {
        console.error('Bulk reviews error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
