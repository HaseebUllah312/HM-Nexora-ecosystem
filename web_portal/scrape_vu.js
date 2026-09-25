const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Starting browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Virtual University academic programs page
    console.log('Navigating to VU Academic Programs...');
    await page.goto('https://vu.edu.pk/AcademicPrograms/', { waitUntil: 'networkidle2' });
    
    // Get all program links that lead to study schemes
    // We look for links containing StudyScheme
    const programLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="StudyScheme"]'));
        return links.map(a => ({
            url: a.href,
            title: a.innerText.trim() || a.textContent.trim()
        })).filter(l => l.title && l.title.length > 0);
    });
    
    console.log(`Found ${programLinks.length} potential program links`);
    
    const uniqueLinks = Array.from(new Map(programLinks.map(item => [item.url, item])).values());
    console.log(`Found ${uniqueLinks.length} unique program links`);
    
    const allSchemes = [];
    
    // For testing, let's just grab the first 5 programs to see the structure
    // We will do a full run after testing
    const testLinks = uniqueLinks;
    
    for (let i = 0; i < testLinks.length; i++) {
        const p = testLinks[i];
        console.log(`[${i+1}/${testLinks.length}] Scraping: ${p.title} (${p.url})`);
        try {
            await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            const schemeData = await page.evaluate(() => {
                const titleEl = document.querySelector('.page-title, h1, h2, h3');
                const title = titleEl ? titleEl.innerText.trim() : 'Unknown Program';
                
                const semesters = [];
                // Study scheme tables usually have headers like "Semester No. 1"
                const tables = document.querySelectorAll('table');
                
                let currentSemesterNumber = 0;
                
                tables.forEach(table => {
                    const prevRow = table.previousElementSibling;
                    let semesterTitle = '';
                    
                    if (prevRow && prevRow.innerText.toLowerCase().includes('semester')) {
                        semesterTitle = prevRow.innerText.trim();
                    } else {
                        // Sometimes the table header contains the semester info
                        const firstTh = table.querySelector('th, td');
                        if (firstTh && firstTh.innerText.toLowerCase().includes('semester')) {
                            semesterTitle = firstTh.innerText.trim();
                        }
                    }
                    
                    if (semesterTitle) {
                        const numMatch = semesterTitle.match(/\d+/);
                        if (numMatch) {
                            currentSemesterNumber = parseInt(numMatch[0]);
                        } else {
                            currentSemesterNumber++;
                        }
                        
                        const subjects = [];
                        const rows = table.querySelectorAll('tr');
                        rows.forEach(row => {
                            const cells = row.querySelectorAll('td');
                            // Usually: Course Code | Title | Type | Prerequisite | Credit Hours
                            if (cells.length >= 2) {
                                const code = cells[0].innerText.trim();
                                const name = cells[1].innerText.trim();
                                if (code && code !== 'Course Code' && code.match(/^[A-Z]+\d+/i)) {
                                    subjects.push(code);
                                }
                            }
                        });
                        
                        if (subjects.length > 0) {
                            semesters.push({
                                semesterNumber: currentSemesterNumber,
                                title: semesterTitle,
                                subjects: subjects
                            });
                        }
                    }
                });
                
                return {
                    id: '', // Will generate in node
                    title: title,
                    description: 'Study scheme for ' + title,
                    semesters: semesters
                };
            });
            
            if (schemeData.semesters.length > 0) {
                // Generate ID based on URL param
                const urlObj = new URL(p.url);
                schemeData.id = urlObj.searchParams.get('sp') || p.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                schemeData.title = p.title; // Override with the link title which is usually cleaner
                
                allSchemes.push(schemeData);
                console.log(`  -> Successfully scraped ${schemeData.semesters.length} semesters.`);
            } else {
                console.log(`  -> No study scheme table found.`);
            }
        } catch (e) {
            console.log(`  -> Error scraping: ${e.message}`);
        }
    }
    
    fs.writeFileSync('scraped_study_schemes.json', JSON.stringify(allSchemes, null, 2));
    console.log(`Done! Saved ${allSchemes.length} schemes to scraped_study_schemes.json`);
    
    await browser.close();
})();
