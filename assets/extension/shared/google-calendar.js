
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const NEXORA_CALENDAR_SUMMARY = "HM Nexora • VU LMS";

async function googleCalendarFetch(token, path, method = "GET", body = null) {
  const url = GOOGLE_CALENDAR_API_BASE + path;
  const opts = {
    method,
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    }
  };
  if (body) opts.body = JSON.stringify(body);

  const resp = await fetch(url, opts);
  if (resp.status === 401) throw new Error("AUTH_EXPIRED");
  if (resp.status === 404) return null;
  if (resp.status === 429) {
    await new Promise(r => setTimeout(r, 2000));
    return googleCalendarFetch(token, path, method, body);
  }
  if (!resp.ok) {
    const errBody = await resp.text().catch(() => "");
    throw new Error(`GOOGLE_CALENDAR_API_ERROR_${resp.status}: ${errBody}`);
  }
  if (resp.status === 204) return { success: true };
  return resp.json();
}

async function createOrGetNexoraCalendar(token) {
  const stored = await chrome.storage.local.get("nxGoogleCalendarId");
  if (stored.nxGoogleCalendarId) {
    try {
      const existing = await googleCalendarFetch(token, `/calendars/${encodeURIComponent(stored.nxGoogleCalendarId)}`);
      if (existing && existing.id) {
        return existing.id;
      }
    } catch (_) {}
  }

  const listData = await googleCalendarFetch(token, "/users/me/calendarList");
  if (listData && Array.isArray(listData.items)) {
    const found = listData.items.find(c => c.summary === NEXORA_CALENDAR_SUMMARY);
    if (found && found.id) {
      await chrome.storage.local.set({ nxGoogleCalendarId: found.id });
      return found.id;
    }
  }

  const created = await googleCalendarFetch(token, "/calendars", "POST", {
    summary: NEXORA_CALENDAR_SUMMARY,
    description: "Virtual University LMS deadlines and exam schedule synced by HM Nexora",
    timeZone: "Asia/Karachi"
  });

  if (created && created.id) {
    await chrome.storage.local.set({ nxGoogleCalendarId: created.id });
    return created.id;
  }

  throw new Error("Failed to create HM Nexora Google Calendar");
}

async function listNexoraEvents(token, calendarId, timeMin, timeMax) {
  const params = new URLSearchParams({
    privateExtendedProperty: "syncedBy=hm-nexora",
    maxResults: "2500",
    singleEvents: "true"
  });
  if (timeMin) params.set("timeMin", timeMin);
  if (timeMax) params.set("timeMax", timeMax);

  const data = await googleCalendarFetch(
    token,
    `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
  );
  return data?.items || [];
}

async function createGoogleEvent(token, calendarId, eventPayload) {
  return googleCalendarFetch(
    token,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    "POST",
    eventPayload
  );
}

async function updateGoogleEvent(token, calendarId, eventId, eventPayload) {
  return googleCalendarFetch(
    token,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    "PUT",
    eventPayload
  );
}

async function deleteGoogleEvent(token, calendarId, eventId) {
  return googleCalendarFetch(
    token,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    "DELETE"
  );
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GOOGLE_CALENDAR_API_BASE,
    NEXORA_CALENDAR_SUMMARY,
    googleCalendarFetch,
    createOrGetNexoraCalendar,
    listNexoraEvents,
    createGoogleEvent,
    updateGoogleEvent,
    deleteGoogleEvent
  };
}
