/**
 * Nexora Elite Popup Logic
 */

// Load saved data on startup
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['lmsId', 'lmsPass', 'myGpa', 'autoBypass', 'aiSolver', 'autoUnblock'], (data) => {
        if (data.lmsId) document.getElementById('lmsId').value = data.lmsId;
        if (data.myGpa) document.getElementById('gpaVal').innerText = data.myGpa;
        
        // Update toggles
        if (data.autoBypass === false) document.querySelector('#tileBypass .toggle').classList.remove('active');
        if (data.aiSolver === false) document.querySelector('#tileAI .toggle').classList.remove('active');
        if (data.autoUnblock === false) document.querySelector('#tileUnblock .toggle').classList.remove('active');
    });
});

// Save Vault Data
document.getElementById('saveVault').addEventListener('click', () => {
    const lmsId = document.getElementById('lmsId').value;
    const lmsPass = document.getElementById('lmsPass').value;
    chrome.storage.local.set({ lmsId, lmsPass }, () => {
        const btn = document.getElementById('saveVault');
        btn.innerText = '✨ Secured';
        btn.style.background = '#fff';
        setTimeout(() => {
            btn.innerText = 'Secure Save';
            btn.style.background = 'var(--primary)';
        }, 2000);
    });
});

// Toggle Logic
document.getElementById('tileBypass').addEventListener('click', () => {
    const toggle = document.querySelector('#tileBypass .toggle');
    const isActive = toggle.classList.toggle('active');
    chrome.storage.local.set({ autoBypass: isActive });
});

document.getElementById('tileAI').addEventListener('click', () => {
    const toggle = document.querySelector('#tileAI .toggle');
    const isActive = toggle.classList.toggle('active');
    chrome.storage.local.set({ aiSolver: isActive });
});

document.getElementById('tileUnblock').addEventListener('click', () => {
    const toggle = document.querySelector('#tileUnblock .toggle');
    const isActive = toggle.classList.toggle('active');
    chrome.storage.local.set({ autoUnblock: isActive });
});
