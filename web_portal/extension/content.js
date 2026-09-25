/**
 * Nexora Elite Content Script - MASTER ENGINE
 * Includes Bypasses for VU, DigiSkills, and CISCO.
 */

console.log('🛡️ Nexora Elite: Power Engine Initialized');

// 1. ONE-CLICK LECTURE BYPASS (VU, DigiSkills, CISCO)
async function bypassLectures() {
    const data = await chrome.storage.local.get('autoBypass');
    if (data.autoBypass === false) return; 

    console.log('⚡ Attempting Multi-Platform Bypass...');
    
    const video = document.querySelector('video');
    if (video) {
        video.currentTime = video.duration - 1;
        video.play();
        console.log('✅ Video Bypassed');
    }
    
    if (window.location.host.includes('digiskills.pk')) {
        const nextBtn = document.querySelector('.next-btn, #btnNext, .btn-next');
        if (nextBtn) nextBtn.click();
    }

    if (window.location.host.includes('netacad.com')) {
        const ciscoNext = document.querySelector('.next-button, [aria-label="Next"]');
        if (ciscoNext) ciscoNext.click();
    }
}

// 2. AI SOLVER & QUESTION EXTRACTION
async function solveWithAI() {
    const data = await chrome.storage.local.get('aiSolver');
    if (data.aiSolver === false) return;

    const questionText = extractQuestion();
    if (!questionText) {
        alert('❌ Could not find a clear question on this page.');
        return;
    }

    const solveBtn = document.getElementById('nexora-solve-ai');
    let answerBox = document.getElementById('nexora-ai-answer-box');
    
    // Create the answer display box if it doesn't exist
    if (!answerBox) {
        answerBox = document.createElement('div');
        answerBox.id = 'nexora-ai-answer-box';
        answerBox.style.cssText = `
            position: absolute;
            bottom: 75px;
            left: 50%;
            transform: translateX(-50%);
            background: #000000;
            border: 1px solid #22c55e;
            border-radius: 12px;
            padding: 20px;
            width: 550px;
            max-height: 280px;
            overflow-y: auto;
            color: #ffffff;
            font-size: 13px;
            line-height: 1.5;
            text-align: left;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            font-family: system-ui, -apple-system, sans-serif;
            z-index: 100000;
        `;
        const quizBar = document.getElementById('nexora-quiz-bar');
        if (quizBar) {
            quizBar.insertBefore(answerBox, quizBar.lastElementChild);
        }
    }

    // Set Loading State
    if (solveBtn) {
        solveBtn.innerHTML = '🤖 Solving...';
        solveBtn.disabled = true;
        solveBtn.style.background = '#475569';
    }
    answerBox.innerHTML = '<div style="display:flex; align-items:center; gap:8px; color:#ffffff;"><span style="font-size:16px;">🔄</span> Nexora AI is analyzing the question... Please wait.</div>';

    chrome.runtime.sendMessage({ action: 'solveQuestion', question: questionText }, (result) => {
        if (solveBtn) {
            solveBtn.innerHTML = '✨ Solve with AI';
            solveBtn.disabled = false;
            solveBtn.style.background = '#2563eb';
        }
        
        if (result && result.answer) {
            let answerText = result.answer;
            let optionHtml = "";
            let reasonHtml = "";
            
            // Try to split the option and the reason
            const optionMatch = answerText.match(/Correct Option:\s*([\s\S]*?)(?:\n\n|\nReason:|\nExplanation:|$)/i);
            if (optionMatch) {
                const optionVal = optionMatch[1].replace(/\*\*/g, '').trim();
                optionHtml = `<div style="color: #22c55e; font-weight: bold; font-size: 15px; margin-bottom: 8px;">${optionVal}</div>`;
                
                let rest = answerText.replace(optionMatch[0], '').trim();
                rest = rest.replace(/^(Reason|Explanation):\s*/i, '').trim();
                reasonHtml = `<div style="color: #ffffff; font-size: 13px; line-height: 1.5;"><span style="color: #22c55e; font-weight: bold;">Reason:</span> ${rest}</div>`;
            } else {
                optionHtml = `<div style="color: #22c55e; font-weight: bold; font-size: 15px; margin-bottom: 8px;">Answer:</div>`;
                reasonHtml = `<div style="color: #ffffff; font-size: 13px; line-height: 1.5;">${answerText}</div>`;
            }
            
            answerBox.innerHTML = `
                <span style="position: absolute; top: 12px; right: 15px; cursor: pointer; color: #a1a1aa; font-weight: bold; font-size: 14px;" onclick="this.parentElement.remove()">✕</span>
                ${optionHtml}
                ${reasonHtml}
            `;
        } else {
            answerBox.innerHTML = `<span style="position: absolute; top: 12px; right: 15px; cursor: pointer; color: #a1a1aa; font-weight: bold; font-size: 14px;" onclick="this.parentElement.remove()">✕</span>
            <div style="color: #ef4444; font-weight: bold;">❌ Error:</div>
            <div style="color: #ffffff;">${result?.error || 'Failed to get answer. Please check your internet connection or backend server.'}</div>`;
        }
    });
}

function extractQuestion() {
    const selectors = [
        '.question-text', '.quiz-question', '#questionContent', '.questionContent',
        '.assignment-desc', 'article.content', '.course-content h1'
    ];
    
    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText.trim().length > 10) return el.innerText.trim();
    }
    
    const selected = window.getSelection().toString();
    if (selected.length > 5) return selected;
    
    return document.body.innerText.substring(0, 1000);
}

// 3. PERFECT PDF GENERATOR
function downloadPerfectPDF(solutionText = "") {
    const studentId = localStorage.getItem('lmsId') || 'BCXXXXXXXX';
    const course = document.querySelector('.page-title, h1')?.innerText || 'Course';
    
    // Sanitize filename
    const filename = `${course.replace(/\s+/g, '_')}_Assignment_NexoraElite`.substring(0, 50);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>${filename}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 50px; color: #1a202c; line-height: 1.6; }
                .header { text-align: center; border-bottom: 2px solid #22d3ee; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #0f172a; }
                .elite { color: #22d3ee; }
                .meta { margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 5px solid #22d3ee; }
                .meta p { margin: 5px 0; font-weight: bold; }
                .question-box { background: #fff; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 30px; }
                .solution-box { white-space: pre-wrap; margin-top: 20px; }
                .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">VIRTUAL UNIVERSITY <span class="elite">SOLUTIONS</span></div>
                <p>Nexora Elite Academic Companion</p>
            </div>
            <div class="meta">
                <p>STUDENT ID: ${studentId}</p>
                <p>COURSE: ${course}</p>
                <p>DATE: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="question-box">
                <h2 style="color: #22d3ee;">Question:</h2>
                <p>${extractQuestion()}</p>
            </div>
            <div class="solution-box">
                <h2 style="color: #22d3ee;">Solution:</h2>
                <p>${solutionText || 'Paste your AI-generated solution here before printing, or use the automated solve feature.'}</p>
            </div>
            <div class="footer">
                Generated with Nexora Elite - The #1 VU Student Hub
            </div>
            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <p>Ready to save? The print dialog should open automatically.</p>
                <button onclick="window.print()" style="background: #22d3ee; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🖨️ Open Print Manually</button>
            </div>
            <script>
                setTimeout(() => { window.print(); }, 1000);
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// 4. QUIZ & GDB UNLOCKER
// 4. QUIZ & GDB UNLOCKER
function copyQuizToClipboard() {
    let textToCopy = "";
    
    // Extract Question
    const questionEl = document.querySelector('.question-text, .quiz-question, #questionContent, .questionContent');
    if (questionEl) {
        textToCopy += `Question:\n${questionEl.innerText.trim()}\n\n`;
    } else {
        const selected = window.getSelection().toString();
        if (selected.length > 5) {
            textToCopy += `Question:\n${selected}\n\n`;
        } else {
            textToCopy += `Question:\n${extractQuestion()}\n\n`;
        }
    }
    
    // Extract Options
    const options = document.querySelectorAll('label, td, .radio, .option-container');
    let optionsText = "Options:\n";
    let foundOptions = false;
    const seen = new Set();
    
    options.forEach(opt => {
        const text = opt.innerText.trim();
        if (text.length > 0 && text.length < 200 && !seen.has(text)) {
            optionsText += `- ${text}\n`;
            seen.add(text);
            foundOptions = true;
        }
    });
    
    if (foundOptions) {
        textToCopy += optionsText;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.getElementById('nexora-copy-quiz');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '📋 Copied!';
            setTimeout(() => { btn.innerHTML = originalText; }, 2000);
        }
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}

function takeScreenshot() {
    chrome.runtime.sendMessage({ action: 'captureTab' }, (response) => {
        if (response && response.dataUrl) {
            const link = document.createElement('a');
            link.href = response.dataUrl;
            link.download = `Quiz_Screenshot_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Screenshot capture failed. Please make sure the extension has correct permissions.');
        }
    });
}

function unlockQuiz() {
    // 1. Force Enable any disabled/hidden "Start" or "Attempt" buttons on Quiz/Assignment pages
    const attemptButtons = document.querySelectorAll('button, input[type="button"], input[type="submit"], a');
    attemptButtons.forEach(btn => {
        const text = (btn.innerText || btn.value || '').toLowerCase();
        if (text.includes('attempt') || text.includes('start') || text.includes('quiz') || text.includes('gdb') || text.includes('solve')) {
            btn.disabled = false;
            btn.removeAttribute('disabled');
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
            if (btn.classList.contains('disabled')) {
                btn.classList.remove('disabled');
            }
        }
    });

    // 2. Bypass "Study lectures first to take quiz" block
    const pageText = document.body.innerText;
    if (pageText.includes('study up to') || pageText.includes('first to take the quiz') || pageText.includes('watch') || pageText.includes('lectures first')) {
        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get('QuizId') || urlParams.get('id') || urlParams.get('quizId');
        if (quizId && !document.getElementById('nexora-force-start-btn')) {
            // Find the warning container to append the bypass button
            const warningEl = Array.from(document.querySelectorAll('div, td, p, span, font')).find(el => 
                el.innerText && (el.innerText.includes('study up to') || el.innerText.includes('first to take the quiz'))
            );
            if (warningEl) {
                const bypassContainer = document.createElement('div');
                bypassContainer.id = 'nexora-force-start-container';
                bypassContainer.style.marginTop = '15px';
                bypassContainer.innerHTML = `
                    <button id="nexora-force-start-btn" style="background: #dc2626; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4); display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;">
                        ⚡ Force Start Quiz (Nexora Bypass)
                    </button>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 5px;">*This bypasses the client-side watch restriction to start the quiz.</div>
                `;
                warningEl.appendChild(bypassContainer);
                
                const btn = document.getElementById('nexora-force-start-btn');
                if (btn) {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        window.location.href = `StartQuiz.aspx?QuizId=${quizId}`;
                    };
                    btn.onmouseover = () => btn.style.background = '#b91c1c';
                    btn.onmouseout = () => btn.style.background = '#dc2626';
                }
            }
        }
    }

    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
        el.style.userSelect = 'auto';
        // @ts-ignore
        el.oncontextmenu = null;
        // @ts-ignore
        el.oncopy = null;
        // @ts-ignore
        el.onpaste = null;
        // @ts-ignore
        el.onselectstart = null;
        // @ts-ignore
        el.ondragstart = null;
        // @ts-ignore
        el.ondrop = null;
    });

    document.oncontextmenu = null;
    document.onselectstart = null;
    document.oncopy = null;
    document.onpaste = null;
    document.ondragstart = null;
    document.ondrop = null;

    // Capture-phase event bypass to prevent site-specific preventDefault()
    ['copy', 'cut', 'paste', 'contextmenu', 'selectstart', 'dragstart', 'drop'].forEach(eventName => {
        window.addEventListener(eventName, (e) => {
            e.stopPropagation();
        }, true);
    });
    
    // Force CSS override
    if (!document.getElementById('nexora-global-style')) {
        const style = document.createElement('style');
        style.id = 'nexora-global-style';
        style.innerHTML = `
            * { 
                user-select: auto !important; 
                -webkit-user-select: auto !important; 
                -moz-user-select: auto !important; 
                -ms-user-select: auto !important; 
            }
            .no-select { user-select: auto !important; }
            #nexora-hub-float { position: fixed; right: 20px; top: 50%; transform: translateY(-50%); z-index: 999999; }
        `;
        document.head.appendChild(style);
    }

    // Inject the elegant bottom Action Bar for Quizzes/Assignments
    const isQuizPage = window.location.href.includes('Quiz') || window.location.href.includes('Question') || document.querySelector('.question-text') || document.querySelector('.quiz-question');
    if (isQuizPage && !document.getElementById('nexora-quiz-bar')) {
        const quizBar = document.createElement('div');
        quizBar.id = 'nexora-quiz-bar';
        quizBar.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(34, 211, 238, 0.3);
            border-radius: 50px;
            padding: 12px 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            width: max-content;
            backdrop-filter: blur(10px);
        `;
        quizBar.innerHTML = `
            <div style="display: flex; gap: 12px;">
                <button id="nexora-copy-quiz" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 50px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: all 0.2s;"><span style="font-size:16px;">📋</span> Copy Quiz</button>
                <button id="nexora-solve-ai" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 50px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: all 0.2s;"><span style="font-size:16px;">✨</span> Solve with AI</button>
                <button id="nexora-take-screenshot" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 50px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: all 0.2s;"><span style="font-size:16px;">📸</span> Take Screenshot</button>
            </div>
            <span style="color: #94a3b8; font-size: 10px; font-weight: 500; letter-spacing: 0.5px;">⚠️ Dear Student, AI can make mistakes. No AI is 100% accurate.</span>
        `;
        document.body.appendChild(quizBar);
        
        // Add Button Listeners
        document.getElementById('nexora-copy-quiz').onclick = copyQuizToClipboard;
        document.getElementById('nexora-solve-ai').onclick = solveWithAI;
        document.getElementById('nexora-take-screenshot').onclick = takeScreenshot;
        
        // Add Hover Effects
        const btns = [document.getElementById('nexora-copy-quiz'), document.getElementById('nexora-solve-ai'), document.getElementById('nexora-take-screenshot')];
        btns.forEach(btn => {
            btn.onmouseover = () => btn.style.background = '#1d4ed8';
            btn.onmouseout = () => btn.style.background = '#2563eb';
        });
    }
}

// 5. GDB & UI BYPASS (EXPERIMENTAL)
function restoreGDBEditor() {
    console.log('🔓 Attempting Advanced GDB Editor Restore...');
    
    // 1. Try to find the submitted text
    let submittedText = "";
    const submissionContainers = document.querySelectorAll('.submission-box, .gdb-answer, #pnlAnswer, .well');
    submissionContainers.forEach(container => {
        if (container.innerText.length > 10 && !container.querySelector('textarea')) {
            submittedText = container.innerText.trim();
        }
    });

    // 2. Find or Recreate the Editor
    let textarea = document.querySelector('textarea, .ck-editor__editable');
    if (!textarea) {
        // If uni removed textarea, try to re-inject one where the answer was
        const target = document.querySelector('.submission-box, .gdb-answer, #pnlAnswer') || document.body;
        const newEditor = document.createElement('textarea');
        newEditor.id = 'nexora-restored-editor';
        newEditor.style.width = '100%';
        newEditor.style.height = '300px';
        newEditor.style.marginTop = '20px';
        newEditor.style.padding = '15px';
        newEditor.style.background = '#1e293b';
        newEditor.style.color = '#fff';
        newEditor.style.border = '1px solid #22d3ee';
        newEditor.value = submittedText;
        target.prepend(newEditor);
        textarea = newEditor;
        console.log('✨ Re-injected New Editor');
    } else {
        // If textarea exists but is hidden/disabled
        textarea.disabled = false;
        textarea.parentElement.style.display = 'block';
        textarea.style.display = 'block';
        textarea.style.visibility = 'visible';
        if (submittedText && !textarea.value) textarea.value = submittedText;
        console.log('✅ Restored Hidden Editor');
    }

    // 3. Force Show Submit Buttons
    const submitBtns = document.querySelectorAll('input[type="submit"], button[type="submit"], .btn-submit, #btnSubmit');
    submitBtns.forEach(btn => {
        btn.disabled = false;
        btn.style.display = 'inline-block';
        btn.style.visibility = 'visible';
    });
    
    // 4. Clean up submission messages
    document.querySelectorAll('.label-success, .alert-success').forEach(el => {
        if (el.innerText.toLowerCase().includes('submitted')) el.style.display = 'none';
    });

    alert('✅ Advanced Unlock Successful!\n\nYou can now edit your previous answer and attempt to resubmit.\nIf the "Submit" button still fails, the university has blocked re-submission on their server.');
}

function unblockLMSUI() {
    console.log('🚫 Removing UI Blocks/Overlays...');
    // VU LMS known overlays for fees/notifications
    const overlays = [
        '.modal-backdrop', '.modal', '#fee-block-overlay', 
        '.notification-overlay', '[id*="challan"]'
    ];
    
    overlays.forEach(selector => {
        const els = document.querySelectorAll(selector);
        els.forEach(el => {
            el.style.display = 'none !important';
            el.remove();
        });
    });
    
    // Enable scroll if modal blocked it
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    console.log('✅ UI Unblocked');
}

// 6. HUB INJECTION
function injectNexoraHub() {
    const body = document.body;
    if (body && !document.querySelector('.nexora-sidebar-hub')) {
        const hub = document.createElement('div');
        hub.className = 'nexora-sidebar-hub';
        hub.innerHTML = `
            <div class="hub-header">NEXORA ELITE</div>
            <div class="hub-links">
                <a href="#" id="hub-bypass">⚡ Lecture Bypass</a>
                <a href="#" id="hub-solve">🤖 AI Solver</a>
                <a href="#" id="hub-pdf">📄 Perfect PDF</a>
                <a href="#" id="hub-gdb">🔓 GDB Unlocker</a>
                <a href="#" id="hub-unblock">🚫 UI Unblocker</a>
            </div>
        `;
        document.body.appendChild(hub);
        
        document.getElementById('hub-bypass').onclick = (e) => { e.preventDefault(); bypassLectures(); };
        document.getElementById('hub-solve').onclick = (e) => { e.preventDefault(); solveWithAI(); };
        document.getElementById('hub-pdf').onclick = (e) => { e.preventDefault(); downloadPerfectPDF(); };
        document.getElementById('hub-gdb').onclick = (e) => { e.preventDefault(); restoreGDBEditor(); };
        document.getElementById('hub-unblock').onclick = (e) => { e.preventDefault(); unblockLMSUI(); };
    }
}

function generateCoverPage() {
    const studentId = localStorage.getItem('lmsId') || 'BCXXXXXXXX';
    const course = document.querySelector('.page-title, h1')?.innerText || 'Course Name';
    
    const coverText = `
--------------------------------------------------
VIRTUAL UNIVERSITY OF PAKISTAN
ASSIGNMENT SUBMISSION
--------------------------------------------------
Course: ${course}
Student Name: (Update in Nexora Vault)
Student ID: ${studentId}
--------------------------------------------------
Dated: ${new Date().toLocaleDateString()}
Generated by Nexora Elite Extension
--------------------------------------------------
    `;
    
    navigator.clipboard.writeText(coverText);
    alert('✅ Professional Assignment Cover copied! Paste it at the top of your file.');
}

// Run injections
setTimeout(() => {
    injectNexoraHub();
    unlockQuiz();
    
    // Inject Custom Styles
    const style = document.createElement('style');
    style.textContent = `
        .nexora-sidebar-hub {
            position: fixed;
            left: -180px;
            top: 50%;
            transform: translateY(-50%);
            width: 200px;
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(34, 211, 238, 0.3);
            border-left: none;
            border-radius: 0 15px 15px 0;
            padding: 15px;
            z-index: 100000;
            transition: left 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 5px 0 15px rgba(0,0,0,0.3);
        }
        .nexora-sidebar-hub:hover { left: 0; }
        .hub-header { color: #22d3ee; font-weight: bold; margin-bottom: 15px; text-align: center; font-size: 0.8rem; border-bottom: 1px solid rgba(34,211,238,0.2); padding-bottom: 5px; }
        .hub-links a { display: block; color: white; text-decoration: none; padding: 8px 10px; margin: 5px 0; border-radius: 5px; font-size: 0.75rem; transition: background 0.2s; }
        .hub-links a:hover { background: rgba(34, 211, 238, 0.2); color: #22d3ee; }
        .nexora-action-btn { position: fixed; bottom: 100px; right: 30px; z-index: 9999; background: #22d3ee; color: #0f172a; border: none; padding: 12px 24px; border-radius: 50px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(34, 211, 238, 0.4); }
    `;
    document.head.appendChild(style);
}, 2000);

// Rest of the observer logic
const observer = new MutationObserver((mutations) => {
    if (mutations.some(m => m.addedNodes.length > 0)) {
        unlockQuiz();
        injectNexoraHub();
        // Auto-run unblocker if enabled
        chrome.storage.local.get('autoUnblock', (data) => {
            if (data.autoUnblock) unblockLMSUI();
        });
    }
});
observer.observe(document.body, { childList: true, subtree: true });
