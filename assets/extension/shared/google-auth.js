
async function getGoogleAuthToken(interactive = false) {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive }, (result) => {
      const err = chrome.runtime.lastError;
      const token = typeof result === "string" ? result : result?.token;
      if (err || !token) {
        const msg = err?.message || "Google authorization unavailable";
        resolve({ success: false, error: msg });
      } else {
        resolve({ success: true, token });
      }
    });
  });
}

async function checkGoogleAuthStatus() {
  try {
    const result = await getGoogleAuthToken(false);
    if (!result.success || !result.token) {
      return { isAuthenticated: false, email: null };
    }

    let email = null;
    try {
      const resp = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${result.token}`);
      if (resp.ok) {
        const info = await resp.json();
        email = info.email || null;
      }
    } catch (_) {}

    await chrome.storage.local.set({
      nxGoogleAuth: {
        isAuthenticated: true,
        email,
        lastChecked: new Date().toISOString()
      }
    });

    return { isAuthenticated: true, email, token: result.token };
  } catch (err) {
    return { isAuthenticated: false, email: null, error: String(err?.message || err) };
  }
}

async function clearGoogleAuthToken() {
  try {
    const result = await getGoogleAuthToken(false);
    if (result.success && result.token) {
      await chrome.identity.removeCachedAuthToken({ token: result.token });
      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${result.token}`).catch(() => {});
    }
    await chrome.storage.local.remove(["nxGoogleAuth", "nxGoogleCalendarId"]);
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err?.message || err) };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getGoogleAuthToken, checkGoogleAuthStatus, clearGoogleAuthToken };
}
