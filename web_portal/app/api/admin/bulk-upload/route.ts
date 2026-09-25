import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the Subject interface matching your data structure
interface Subject {
    code: string;
    name: string;
    resources?: { title: string; type: string; link: string; }[];
    // ... other fields
    [key: string]: any;
}

const dataFilePath = path.join(process.cwd(), 'data/subjects.json');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uploads } = body; // Array of { code, title, type, link }

        if (!uploads || !Array.isArray(uploads)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // 1. Read existing data
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        let subjects: Subject[] = JSON.parse(fileContent);
        let addedCount = 0;
        let duplicateCount = 0;

        // 2. Process each upload
        uploads.forEach((item: any) => {
            const subjectIndex = subjects.findIndex(s => s.code === item.code);

            if (subjectIndex !== -1) {
                const subject = subjects[subjectIndex];

                // Initialize resources if missing
                if (!subject.resources) {
                    subject.resources = [];
                }

                // Check for duplicates (same link OR same title)
                const isDuplicate = subject.resources.some(r =>
                    r.link === item.link || r.title === item.title
                );

                if (!isDuplicate) {
                    subject.resources.push({
                        title: item.title,
                        type: item.type,
                        link: item.link
                    });
                    addedCount++;
                } else {
                    duplicateCount++;
                }
            }
        });

        // 3. Save back to file
        fs.writeFileSync(dataFilePath, JSON.stringify(subjects, null, 4));

        return NextResponse.json({
            success: true,
            message: `Processed ${uploads.length} items. Added: ${addedCount}, Duplicates ignored: ${duplicateCount}`
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
