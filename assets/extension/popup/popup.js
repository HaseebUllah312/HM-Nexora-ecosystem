document.addEventListener('DOMContentLoaded', () => {
  const versionEl = document.getElementById('popupVersion');
  if (versionEl) {
    versionEl.textContent = 'v' + (chrome.runtime.getManifest?.()?.version || '2.0.12');
  }

  const openSettings = () => {
    chrome.runtime.openOptionsPage();
  };
  document.getElementById('openSettings')?.addEventListener('click', openSettings);
  document.getElementById('openSettingsHeader')?.addEventListener('click', openSettings);

  document.getElementById('openLms')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://vulms.vu.edu.pk' });
  });

  document.getElementById('openVault')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://hmnexora.tech' });
  });

  document.getElementById('openChat')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://hmnexora.tech/community' });
  });

  document.getElementById('openAdmissionBtn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('admission/admission.html') });
  });

  document.getElementById('autofillBtn')?.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id && activeTab?.url && /vulms\.vu\.edu\.pk/i.test(activeTab.url)) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'AUTOFILL_LMS' }, (res) => {
          if (chrome.runtime.lastError || !res?.ok) {
            chrome.tabs.update(activeTab.id, { url: 'https://vulms.vu.edu.pk' });
          }
        });
      } else {
        chrome.tabs.create({ url: 'https://vulms.vu.edu.pk' });
      }
    });
  });

  const toggle = document.getElementById('autoSolveToggle');
  if (toggle) {
    chrome.storage.local.get({ autoSolveEnabled: true, nxSettings: {} }, (result) => {
      const isEnabled = result.autoSolveEnabled !== false && result.nxSettings?.aiEnabled !== false;
      toggle.checked = isEnabled;
    });

    toggle.addEventListener('change', async (e) => {
      const val = e.target.checked;
      await chrome.storage.local.set({ autoSolveEnabled: val });
      try { chrome.storage.sync?.set?.({ autoSolveEnabled: val }); } catch (_) {}
      const cur = (await chrome.storage.local.get('nxSettings')).nxSettings || {};
      await chrome.storage.local.set({ nxSettings: { ...cur, aiEnabled: val } });
    });
  }

  // Google Calendar Connection / Sync
  const calBtn = document.getElementById('googleCalBtn');
  const calDesc = document.getElementById('googleCalDesc');

  function updateGoogleCalUI() {
    chrome.runtime.sendMessage({ type: "NX_GOOGLE_CALENDAR_STATUS" }, (resp) => {
      if (!resp || !resp.ok) return;
      if (resp.isAuthenticated) {
        if (calBtn) calBtn.textContent = 'Sync Now';
        if (calDesc) {
          const syncInfo = resp.syncState?.lastSyncTime
            ? `Synced: ${new Date(resp.syncState.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Ready to sync';
          calDesc.innerHTML = `<span style="color:#34d399;">✓ Connected (${resp.email || 'Google'})</span> • <small>${syncInfo}</small>`;
        }
      } else {
        if (calBtn) calBtn.textContent = 'Connect';
        if (calDesc) calDesc.textContent = 'Sync VULMS assignments & quizzes to Google Calendar on your phone.';
      }
    });
  }

  updateGoogleCalUI();

  if (calBtn) {
    calBtn.addEventListener('click', () => {
      if (calBtn.textContent === 'Connect') {
        calBtn.disabled = true;
        calBtn.textContent = 'Connecting…';
        chrome.runtime.sendMessage({ type: "NX_GOOGLE_CALENDAR_CONNECT" }, (resp) => {
          calBtn.disabled = false;
          if (resp?.ok) {
            updateGoogleCalUI();
          } else {
            calBtn.textContent = 'Connect';
            if (calDesc) calDesc.textContent = resp?.error || 'Connection cancelled';
          }
        });
      } else {
        calBtn.disabled = true;
        calBtn.textContent = 'Syncing…';
        chrome.runtime.sendMessage({ type: "NX_GOOGLE_CALENDAR_SYNC_NOW" }, (resp) => {
          calBtn.disabled = false;
          calBtn.textContent = 'Sync Now';
          if (resp?.ok) {
            if (calDesc) calDesc.innerHTML = `<span style="color:#34d399;">✓ Synced ${resp.total || 0} events!</span>`;
            setTimeout(updateGoogleCalUI, 2500);
          } else {
            if (calDesc) calDesc.textContent = resp?.error || 'Sync failed';
          }
        });
      }
    });
  }
});
