process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');
const fs = require('fs');

const degrees = [
    'BS',
    'Associate Degree Programs',
    'BS-Lateral',
    'B.Ed',
    'MS',
    'Diploma'
];

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to fetch HTML
function fetchUrl(path) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'www.vu.edu.pk',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        };

        https.get(options, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                // Handle redirection
                const loc = res.headers.location;
                const newPath = loc.startsWith('http') ? new URL(loc).pathname + new URL(loc).search : loc;
                console.log(`  Redirected to ${newPath}`);
                fetchUrl(newPath).then(resolve);
                return;
            }
            
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: data });
            });
        }).on('error', (err) => {
            console.error(`  Fetch error for ${path}:`, err.message);
            resolve({ statusCode: 500, body: '', error: err.message });
        });
    });
}

// Extract program details links from a degree page
function extractProgramLinks(html) {
    // Links shape: ProgramDetails.aspx?StudyProgramID=X or ProgramDetails?StudyProgramID=X
    const regex = /ProgramDetails(?:\.aspx)?\?StudyProgramID=(\d+)[^>]*>([\s\S]*?)<\/a>/gi;
    const links = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
        const id = match[1];
        const name = match[2].replace(/<[^>]*>/g, '').trim();
        if (id && name && !name.toLowerCase().includes('click here')) {
            links.push({ id, name });
        }
    }
    // De-duplicate
    const seen = new Set();
    return links.filter(l => {
        if (seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
    });
}

// Parse study scheme from program details page
function parseStudyScheme(html, programName) {
    const startIdx = html.indexOf('id="studyscheme"');
    if (startIdx === -1) {
        return null;
    }

    const studySchemeHtml = html.substring(startIdx);
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const semesters = [];
    let currentSemester = null;
    const subjectsMap = {}; // To extract code -> name mappings

    let trMatch;
    while ((trMatch = trRegex.exec(studySchemeHtml)) !== null) {
        const rowContent = trMatch[1];
        
        // Check for semester header
        const semMatch = /Semester\s+(?:No\.)?\s*(\d+)/i.exec(rowContent.replace(/<[^>]*>/g, ''));
        if (semMatch) {
            const semNum = parseInt(semMatch[1]);
            currentSemester = {
                semesterNumber: semNum,
                title: `Semester ${semNum}`,
                subjects: []
            };
            semesters.push(currentSemester);
            continue;
        }
        
        // Parse course details
        if (currentSemester) {
            const tds = [];
            const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
            let tdMatch;
            while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
                tds.push(tdMatch[1].replace(/<[^>]*>/g, '').trim());
            }
            
            if (tds.length >= 2) {
                const code = tds[0].replace(/&nbsp;/g, '').trim().toUpperCase();
                const name = tds[1].replace(/&nbsp;/g, '').trim();
                
                if (code && code !== 'COURSE CODE' && /^[A-Z]+\d+[A-Z]*$/i.test(code)) {
                    currentSemester.subjects.push(code);
                    subjectsMap[code] = name;
                }
            }
        }
    }
    
    // Also parse duration / degree length if present
    let duration = '4 Years';
    if (programName.toLowerCase().includes('associate') || 
        programName.toLowerCase().includes('diploma') || 
        programName.toLowerCase().includes('adp') ||
        programName.toLowerCase().includes('2-year') ||
        programName.toLowerCase().includes('2 year') ||
        programName.toLowerCase().includes('lateral')) {
        duration = '2 Years';
    } else if (programName.toLowerCase().includes('ms ') || 
               programName.toLowerCase().includes('master')) {
        duration = '2 Years';
    }

    return {
        semesters: semesters.filter(s => s.subjects.length > 0),
        subjectsMap,
        duration
    };
}

async function scrapeAll() {
    console.log('Starting Virtual University of Pakistan Academic Programs Scraper...');
    const allProgramLinks = [];
    
    // Step 1: Collect program links for all degrees
    for (const degree of degrees) {
        console.log(`Fetching programs list for: ${degree}`);
        const path = `/AboutUs/ProgramsOffered?Degree=${encodeURIComponent(degree)}`;
        const result = await fetchUrl(path);
        
        if (result.statusCode === 200) {
            const links = extractProgramLinks(result.body);
            console.log(`  Found ${links.length} programs in ${degree}`);
            links.forEach(l => {
                allProgramLinks.push({
                    id: l.id,
                    name: l.name,
                    degree: degree
                });
            });
        } else {
            console.log(`  Failed to fetch ${degree}, code: ${result.statusCode}`);
        }
        await delay(300);
    }
    
    // De-duplicate programs across categories
    const uniquePrograms = {};
    allProgramLinks.forEach(p => {
        uniquePrograms[p.id] = p;
    });
    const programsToScrape = Object.values(uniquePrograms);
    console.log(`\nTotal unique programs to scrape: ${programsToScrape.length}`);
    
    const studySchemes = [];
    const masterSubjectsMap = {};
    
    // Step 2: Scrape study scheme for each program
    for (let i = 0; i < programsToScrape.length; i++) {
        const prog = programsToScrape[i];
        console.log(`[${i+1}/${programsToScrape.length}] Scraping "${prog.name}" (ID: ${prog.id})...`);
        
        const path = `/AboutUs/ProgramDetails?StudyProgramID=${prog.id}`;
        const result = await fetchUrl(path);
        
        if (result.statusCode === 200) {
            const parsed = parseStudyScheme(result.body, prog.name);
            if (parsed && parsed.semesters.length > 0) {
                const schemeId = prog.name.toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                
                studySchemes.push({
                    id: schemeId,
                    title: prog.name,
                    description: `Virtual University study scheme for ${prog.name} (${parsed.duration}).`,
                    duration: parsed.duration,
                    degreeType: prog.degree,
                    semesters: parsed.semesters
                });
                
                // Add subjects to master map
                Object.assign(masterSubjectsMap, parsed.subjectsMap);
                console.log(`  -> Successfully parsed ${parsed.semesters.length} semesters, ${Object.keys(parsed.subjectsMap).length} subjects.`);
            } else {
                console.log(`  -> No study scheme table found or empty.`);
            }
        } else {
            console.log(`  -> Failed to load program details page, status: ${result.statusCode}`);
        }
        
        // Respectful crawling delay
        await delay(200);
    }
    
    // Step 3: Write outputs
    fs.writeFileSync('scraped_study_schemes.json', JSON.stringify(studySchemes, null, 2));
    fs.writeFileSync('scraped_subjects.json', JSON.stringify(masterSubjectsMap, null, 2));
    
    console.log(`\nSUCCESS!`);
    console.log(`Scraped ${studySchemes.length} study schemes saved to scraped_study_schemes.json`);
    console.log(`Scraped ${Object.keys(masterSubjectsMap).length} unique subjects saved to scraped_subjects.json`);
}

scrapeAll().catch(err => {
    console.error('Unhandled scraping error:', err);
});
