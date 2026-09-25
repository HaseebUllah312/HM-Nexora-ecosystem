
const NEXORA_COLOR_MAP = {
  quiz: "2",        // Sage Green
  assignment: "11",  // Flamingo Red
  gdb: "5",          // Banana Yellow
  challan: "3",      // Grape Purple
  result: "8",       // Graphite Grey
  exam: "11",        // Red
  calendar: "9",     // Blueberry Blue
  other: "8"
};

const NEXORA_ACTIVITY_URLS = {
  "quiz": "https://vulms.vu.edu.pk/Quiz/QuizList.aspx",
  "assignment": "https://vulms.vu.edu.pk/Assignments/StudentAssignmentListView.aspx",
  "gdb": "https://vulms.vu.edu.pk/GDB/Default.aspx",
  "challan": "https://vulms.vu.edu.pk/AccountBook/AccountBook.aspx",
  "home": "https://vulms.vu.edu.pk/Home.aspx"
};

function nxGenerateEventFingerprint(ev) {
  const raw = String(ev.courseCode || "") + ":" +
              String(ev.activityType || ev.type || "") + ":" +
              String(ev.title || "") + ":" +
              String(ev.startDate || "") + ":" +
              String(ev.endDate || "");
  try {
    return btoa(unescape(encodeURIComponent(raw)));
  } catch (_) {
    return String(raw).replace(/[^a-zA-Z0-9]/g, "_");
  }
}

function nxLmsEventToGoogleEvent(ev) {
  const type = String(ev.eventType || ev.type || "other").toLowerCase();
  const colorId = NEXORA_COLOR_MAP[type] || "8";
  const detailUrl = ev.detailUrl || NEXORA_ACTIVITY_URLS[type] || "https://vulms.vu.edu.pk";
  const isAllDay = !!ev.isAllDay || type === "challan" || type === "result" || type === "calendar";

  const startIso = ev.startDate || new Date().toISOString();
  const endIso = ev.endDate || startIso;

  const startDateOnly = String(startIso).split("T")[0];
  const endDateOnly = String(endIso).split("T")[0];

  const endDateAllDay = (() => {
    try {
      const d = new Date(endDateOnly);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    } catch (_) {
      return endDateOnly;
    }
  })();

  const start = isAllDay
    ? { date: startDateOnly }
    : { dateTime: startIso.includes("T") ? startIso : `${startIso}T00:00:00`, timeZone: "Asia/Karachi" };

  const end = isAllDay
    ? { date: endDateAllDay }
    : { dateTime: endIso.includes("T") ? endIso : `${endIso}T23:59:00`, timeZone: "Asia/Karachi" };

  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const coursePrefix = ev.courseCode ? `[${ev.courseCode}] ` : "";
  const summary = ev.title.startsWith(coursePrefix) ? ev.title : `${coursePrefix}${ev.title}`;

  const descriptionLines = [
    `🎓 HM Nexora • VULMS Deadline Alert`,
    `📘 Course: ${ev.courseCode || "General"}`,
    `📌 Activity: ${typeLabel}${ev.totalMarks ? ` (Total Marks: ${ev.totalMarks})` : ""}`,
    ev.status ? `⚡ Status: ${ev.status}` : "",
    `🔗 LMS Link: ${detailUrl}`,
    ``,
    `Synced automatically by HM Nexora Smart LMS Companion`
  ].filter(Boolean);

  const fingerprint = nxGenerateEventFingerprint(ev);

  return {
    summary,
    description: descriptionLines.join("\n"),
    start,
    end,
    colorId,
    source: { title: "HM Nexora VULMS", url: detailUrl },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 1440 }, // 24 hours before
        { method: "popup", minutes: 180 }   // 3 hours before
      ]
    },
    extendedProperties: {
      private: {
        syncedBy: "hm-nexora",
        courseCode: String(ev.courseCode || ""),
        activityType: type,
        fingerprint,
        lmsEventId: ev.lmsEventId || fingerprint
      }
    }
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NEXORA_COLOR_MAP,
    NEXORA_ACTIVITY_URLS,
    nxGenerateEventFingerprint,
    nxLmsEventToGoogleEvent
  };
}
