import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'subjects.json');

// Helper to read/write
function getSubjects() {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveSubjects(data: any) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        const subjects = getSubjects();
        if (code) {
            const subject = subjects.find((s: any) => s.code === code);
            return NextResponse.json(subject || {});
        }
        return NextResponse.json(subjects);
    } catch (e) { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}

export async function POST(req: Request) {
    // ADD logic
    try {
        const { code, resource } = await req.json();
        const subjects = getSubjects();
        const index = subjects.findIndex((s: any) => s.code === code);

        if (index === -1) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

        if (!subjects[index].resources) subjects[index].resources = [];
        subjects[index].resources.push(resource);

        saveSubjects(subjects);
        return NextResponse.json({ success: true });
    } catch (e) { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}

export async function PUT(req: Request) {
    // EDIT logic
    try {
        const { code, oldResource, newResource } = await req.json();
        const subjects = getSubjects();
        const index = subjects.findIndex((s: any) => s.code === code);

        if (index === -1 || !subjects[index].resources) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Find resource index
        const rIndex = subjects[index].resources.findIndex((r: any) => r.link === oldResource.link);
        if (rIndex !== -1) {
            subjects[index].resources[rIndex] = newResource;
            saveSubjects(subjects);
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    } catch (e) { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}

export async function DELETE(req: Request) {
    // DELETE logic
    try {
        const { code, resourceLink } = await req.json();
        const subjects = getSubjects();
        const index = subjects.findIndex((s: any) => s.code === code);

        if (index !== -1 && subjects[index].resources) {
            subjects[index].resources = subjects[index].resources.filter((r: any) => r.link !== resourceLink);
            saveSubjects(subjects);
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch (e) { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}
