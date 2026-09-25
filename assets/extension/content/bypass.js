// ==UserScript==
// @name         HM Nexora – Continuous Ultra Skip All & Firewall Bypass Engine
// @namespace    https://hmnexora.tech/
// @version      2.3.0
// @description  Universal Continuous Auto Skip All Lectures with PageMethods + Direct WebService fallback + AJAX UpdatePanel + Video fast-forward + Auto-Advance Watchdog
// @match        https://vulms.vu.edu.pk/*
// @run-at       document_start
// ==/UserScript==

(function() {
  'use strict';

  if (window.__NX_BYPASS_INJECTED__) return;
  window.__NX_BYPASS_INJECTED__ = true;

  const NX_SKIP_KEY = "nx_skip_all_lectures_active";
  const NX_COUNT_KEY = "nx_skip_all_lectures_count";
  const THUNDER_KEY = "vulms_auto_skip";

  let isBypassing = false;
  let cancelRequested = false;

  function getStoredSkipState() {
    let nxActive = false;
    let nxCount = 0;
    let thunderState = null;

    try {
      nxActive = sessionStorage.getItem(NX_SKIP_KEY) === "1" || 
                 sessionStorage.getItem("nx_skip_all_lectures_active") === "1" ||
                 localStorage.getItem(NX_SKIP_KEY) === "1";
      nxCount = parseInt(sessionStorage.getItem(NX_COUNT_KEY) || localStorage.getItem(NX_COUNT_KEY) || "0", 10);
      const raw = localStorage.getItem(THUNDER_KEY);
      if (raw) thunderState = JSON.parse(raw);
    } catch (_) {}

    if (nxActive) {
      return { active: true, mode: "all", count: nxCount };
    }

    if (thunderState && (thunderState.mode === "all" || thunderState.remaining === "all" || Number(thunderState.remaining) > 0)) {
      return {
        active: true,
        mode: thunderState.mode || (thunderState.remaining ? "custom" : "all"),
        remaining: thunderState.remaining,
        count: thunderState.count || nxCount || 0
      };
    }

    return { active: false, mode: null, count: 0 };
  }

  function waitForPageMethods(maxWaitMs = 1500) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        if (typeof window.PageMethods?.SaveStudentVideoLog === "function") {
          return resolve(true);
        }
        if (Date.now() - start >= maxWaitMs) {
          return resolve(false);
        }
        setTimeout(check, 80);
      };
      check();
    });
  }

  function isUsable(el) {
    if (!el) return false;
    if (el.disabled) return false;
    if (el.getAttribute('aria-disabled') === 'true') return false;
    if (el.classList?.contains('disabled') || el.classList?.contains('aspNetDisabled')) return false;
    const r = el.getBoundingClientRect();
    return (r.width > 0 && r.height > 0) || el.offsetParent !== null;
  }

  function findNextLessonButton() {
    const preferred = [
      "#lbtnNextLesson",
      "a[id*='NextLesson']",
      "a[id*='lbtnNext']",
      "button[id*='NextLesson']",
      "button[id*='Next']",
      "#MainContent_lbtnNextLesson",
      "a[title*='Next Lesson']",
      "a[title*='Next']",
      "button[title*='Next Lesson']",
      "button[title*='Next']",
      "a[onclick*='NextLesson']",
      "a[href*='NextLesson']",
      "a[href*='lbtnNextLesson']"
    ];
    for (const s of preferred) {
      const el = document.querySelector(s);
      if (el) return el;
    }

    // Fallback: search all anchor tags for next text
    const allLinks = Array.from(document.querySelectorAll("a, button, [role='button']"));
    return allLinks.find(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      const title = (el.getAttribute('title') || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      return (t.includes('next lesson') || t === 'next' || t.startsWith('next') || title.includes('next lesson') || href.includes('nextlesson') || href.includes('lbtnnext'));
    }) || null;
  }

  function triggerNextLessonNavigation(nextBtn) {
    if (!nextBtn) return false;
    try {
      nextBtn.classList.remove("disabled", "aspNetDisabled");
      nextBtn.removeAttribute("disabled");
      nextBtn.removeAttribute("aria-disabled");

      const href = nextBtn.getAttribute("href") || "";

      // 1. Direct __doPostBack regex extraction from href
      const match = href.match(/__doPostBacks*(s*['"]([^'"]+)['"]s*,s*['"]([^'"]*)['"]s*)/);
      if (match && typeof window.__doPostBack === "function") {
        window.__doPostBack(match[1], match[2] || '');
        return true;
      }

      // 2. Direct JavaScript eval
      if (href.toLowerCase().startsWith("javascript:")) {
        const code = href.replace(/^javascript:s*/i, '');
        try {
          window.eval(code);
          return true;
        } catch(e) {}
      }

      // 3. Fallback to ID or Name postback
      const id = nextBtn.id || "";
      const name = nextBtn.getAttribute("name") || id;
      if (typeof window.__doPostBack === "function" && (name || id)) {
        const target = (name || id).replace(/_/g, '$');
        window.__doPostBack(target, '');
        return true;
      }

      // 4. Native click dispatch
      nextBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      nextBtn.click();
      return true;
    } catch(e) {
      try { nextBtn.click(); } catch(_) {}
    }
    return true;
  }

  async function saveStudentLogFallback(studentId, courseCode, semester, lessonTitle, contentId, duration, videoId, typeFlag) {
    try {
      const url = window.location.pathname.replace(/\/+$/, '') + '/SaveStudentVideoLog';
      const payload = {
        StudentID: studentId || '',
        CourseCode: courseCode || '',
        Semester: semester || '',
        LessonTitle: lessonTitle || '',
        ContentID: contentId || '',
        Duration: duration || 60,
        WatchTime: duration || 60,
        VideoID: videoId || '',
        TypeFlag: typeFlag || 0,
        URL: window.location.href
      };

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });
    } catch(e) {
      console.warn('[HM Nexora] WebService fallback error:', e);
    }
  }

  async function executeLectureBypass(opts = {}) {
    if (isBypassing) {
      console.log('[HM Nexora] Bypass already in progress, skipping duplicate call.');
      return;
    }
    isBypassing = true;
    cancelRequested = false;

    const state = getStoredSkipState();
    const mode = opts.mode || state.mode || "all";
    let count = typeof opts.count === "number" ? opts.count : state.count;
    let remaining = typeof opts.remaining !== "undefined" ? opts.remaining : state.remaining;

    window.postMessage({
      type: "NX_BYPASS_STATUS",
      status: "starting",
      mode,
      count,
      remaining
    }, "*");

    try {
      // 1. Fast forward all HTML5 videos
      document.querySelectorAll('video').forEach(v => {
        try {
          v.playbackRate = 16.0;
          if (v.duration && !isNaN(v.duration)) {
            v.currentTime = Math.max(0, v.duration - 0.2);
          }
          v.play();
          v.dispatchEvent(new Event('timeupdate'));
          v.dispatchEvent(new Event('ended'));
        } catch(e) {}
      });

      await waitForPageMethods(1200);

      const studentId = document.getElementById("hfStudentID")?.value || "";
      const courseCode = document.getElementById("hfCourseCode")?.value || "";
      const semester = document.getElementById("hfEnrollmentSemester")?.value || "";
      const lessonTitle = document.getElementById("MainContent_lblLessonTitle")
        ?.getAttribute("title")?.split(":")[0].replace(/Lesson/i, "").trim() || "";

      // Broader selector for lecture tabs
      const tabs = Array.from(document.querySelectorAll("a[id*='tabHeader'], a[id*='TabHeader'], a.nav-link[id*='tab'], [id^='tabHeader']"));

      const tabData = [];
      for (const tab of tabs) {
        const tabId = tab.id.replace(/[^0-9]/g, "");
        if (!tabId) continue;
        const contentId = document.getElementById(`hfContentID${tabId}`)?.value || "";
        const videoId = document.getElementById(`hfVideoID${tabId}`)?.value || "";
        const isVideo = document.getElementById(`hfIsVideo${tabId}`)?.value === "1";
        const tabType = (document.getElementById(`hfTabType${tabId}`)?.value || "").toLowerCase();
        const typeFlag = isVideo ? 1 : tabType === "formativeassessment" ? -2 : 0;
        const duration = isVideo ? 60 : 5;

        tabData.push({ tabId, contentId, videoId, typeFlag, duration });
      }

      if (cancelRequested) {
        isBypassing = false;
        return;
      }

      // 2. Log completion for every tab
      if (tabData.length > 0) {
        const completionPromises = tabData.map((item) => {
          const { tabId, contentId, videoId, typeFlag, duration } = item;
          const statusField = document.getElementById(`hfTabCompletionStatus${tabId}`);
          if (statusField) statusField.value = "Completed";

          return new Promise((resolve) => {
            if (typeof window.PageMethods?.SaveStudentVideoLog === "function") {
              window.PageMethods.SaveStudentVideoLog(
                studentId,
                courseCode,
                semester,
                lessonTitle,
                contentId,
                duration,
                duration,
                videoId,
                typeFlag,
                window.location.href,
                () => {
                  if (typeof window.UpdateTabStatus === "function") {
                    window.UpdateTabStatus("Completed", tabId, "-2");
                  }
                  resolve();
                },
                () => {
                  saveStudentLogFallback(studentId, courseCode, semester, lessonTitle, contentId, duration, videoId, typeFlag).then(resolve);
                }
              );
            } else {
              saveStudentLogFallback(studentId, courseCode, semester, lessonTitle, contentId, duration, videoId, typeFlag).then(() => {
                if (typeof window.UpdateTabStatus === "function") {
                  window.UpdateTabStatus("Completed", tabId, "-2");
                }
                resolve();
              });
            }
          });
        });

        await Promise.all(completionPromises);
      }

      // 3. Auto-answer quiz / radio choices if present
      document.querySelectorAll("input[type='radio']").forEach((radio, idx) => {
        if (idx === 0 || !radio.name) radio.checked = true;
      });

      if (cancelRequested) {
        isBypassing = false;
        return;
      }

      // 4. Select last tab to ensure UI completion triggers
      if (tabData.length > 0) {
        const lastTabId = tabData[tabData.length - 1].tabId;
        const lastTabEl = document.querySelector(`#tabHeader${lastTabId}`);
        if (lastTabEl && typeof window.SelectTab === "function") {
          window.SelectTab(lastTabEl, new MouseEvent("click"));
        }
      }

      // 5. Advance to Next Lesson & Keep Skip All Active
      setTimeout(() => {
        if (cancelRequested) {
          isBypassing = false;
          return;
        }

        const nextBtn = findNextLessonButton();
        if (nextBtn) {
          count++;

          if (mode === "all" || remaining === "all" || !remaining) {
            sessionStorage.setItem(NX_SKIP_KEY, "1");
            sessionStorage.setItem(NX_COUNT_KEY, String(count));
            sessionStorage.setItem("nx_skip_all_lectures_active", "1");
            sessionStorage.setItem("nx_skip_all_lectures_count", String(count));
            localStorage.setItem(NX_SKIP_KEY, "1");
            localStorage.setItem(NX_COUNT_KEY, String(count));
            localStorage.setItem(THUNDER_KEY, JSON.stringify({ mode: "all", count }));

            window.postMessage({
              type: "NX_BYPASS_STATUS",
              status: "next",
              count,
              lessonTitle
            }, "*");

            // Unlock and reset isBypassing so next lesson can immediately execute
            isBypassing = false;

            setTimeout(() => {
              if (!cancelRequested) triggerNextLessonNavigation(nextBtn);
            }, 500);
          } else {
            remaining = Number(remaining) - 1;
            if (remaining > 0) {
              sessionStorage.setItem(NX_SKIP_KEY, "1");
              sessionStorage.setItem(NX_COUNT_KEY, String(count));
              sessionStorage.setItem("nx_skip_all_lectures_active", "1");
              sessionStorage.setItem("nx_skip_all_lectures_count", String(count));
              localStorage.setItem(NX_SKIP_KEY, "1");
              localStorage.setItem(NX_COUNT_KEY, String(count));
              localStorage.setItem(THUNDER_KEY, JSON.stringify({ mode: "custom", remaining, count }));

              window.postMessage({
                type: "NX_BYPASS_STATUS",
                status: "next",
                count,
                remaining,
                lessonTitle
              }, "*");

              isBypassing = false;

              setTimeout(() => {
                if (!cancelRequested) triggerNextLessonNavigation(nextBtn);
              }, 500);
            } else {
              isBypassing = false;
              stopBypass("🎉 All requested lessons bypassed!");
            }
          }
        } else {
          isBypassing = false;
          stopBypass(`🎉 Course finished! All ${count || 1} available lessons bypassed.`);
        }
      }, 800);

    } catch (err) {
      console.error("[HM Nexora Bypass Error]", err);
      window.postMessage({ type: "NX_BYPASS_STATUS", status: "error", error: err.message }, "*");
      isBypassing = false;
    }
  }

  function stopBypass(message = "🛑 Auto-skip stopped.", notifyListeners = true) {
    cancelRequested = true;
    isBypassing = false;
    sessionStorage.removeItem(NX_SKIP_KEY);
    sessionStorage.removeItem(NX_COUNT_KEY);
    sessionStorage.removeItem("nx_skip_all_lectures_active");
    sessionStorage.removeItem("nx_skip_all_lectures_count");
    localStorage.removeItem(NX_SKIP_KEY);
    localStorage.removeItem(NX_COUNT_KEY);
    localStorage.removeItem(THUNDER_KEY);

    if (notifyListeners) {
      window.postMessage({
        type: "NX_BYPASS_STATUS",
        status: "stopped",
        message
      }, "*");
    }
  }

  window.nxBypassCurrentLecture = executeLectureBypass;
  window.nxStopLectureBypass = stopBypass;

  window.addEventListener("message", function(e) {
    if (!e.data || typeof e.data !== "object") return;

    if (e.data.type === "NX_START_SKIP_ALL") {
      cancelRequested = false;
      sessionStorage.setItem(NX_SKIP_KEY, "1");
      sessionStorage.setItem(NX_COUNT_KEY, String(e.data.count || 0));
      sessionStorage.setItem("nx_skip_all_lectures_active", "1");
      sessionStorage.setItem("nx_skip_all_lectures_count", String(e.data.count || 0));
      localStorage.setItem(NX_SKIP_KEY, "1");
      localStorage.setItem(NX_COUNT_KEY, String(e.data.count || 0));
      localStorage.setItem(THUNDER_KEY, JSON.stringify({ mode: "all", count: e.data.count || 0 }));
      executeLectureBypass({ mode: "all", count: e.data.count || 0 });
    } else if (e.data.type === "NX_START_CUSTOM_SKIP") {
      cancelRequested = false;
      sessionStorage.setItem(NX_SKIP_KEY, "1");
      sessionStorage.setItem(NX_COUNT_KEY, "0");
      sessionStorage.setItem("nx_skip_all_lectures_active", "1");
      sessionStorage.setItem("nx_skip_all_lectures_count", "0");
      localStorage.setItem(NX_SKIP_KEY, "1");
      localStorage.setItem(NX_COUNT_KEY, "0");
      localStorage.setItem(THUNDER_KEY, JSON.stringify({ mode: "custom", remaining: e.data.count, count: 0 }));
      executeLectureBypass({ mode: "custom", remaining: e.data.count, count: 0 });
    } else if (e.data.type === "NX_STOP_SKIP") {
      stopBypass(e.data.message, false);
    } else if (e.data.type === "NX_RUN_SINGLE_BYPASS") {
      executeLectureBypass({ mode: "single" });
    }
  });

  function checkAutoResume() {
    const state = getStoredSkipState();
    if (!state.active || cancelRequested) return;

    const isLecturePage = document.getElementById("hfStudentID") ||
                          document.querySelector("a[id*='tabHeader']") ||
                          /\/Courses\/.*\/LessonContent\.aspx/i.test(location.pathname) ||
                          /LessonContent/i.test(location.href);

    if (isLecturePage && !isBypassing) {
      setTimeout(() => {
        executeLectureBypass();
      }, 700);
    }
  }

  // ASP.NET UpdatePanel PageRequestManager Hook
  function hookPageRequestManager() {
    try {
      if (typeof window.Sys !== "undefined" && window.Sys.WebForms && window.Sys.WebForms.PageRequestManager) {
        const prm = window.Sys.WebForms.PageRequestManager.getInstance();
        prm.add_endRequest(function() {
          const state = getStoredSkipState();
          if (state.active && !cancelRequested) {
            isBypassing = false;
            setTimeout(executeLectureBypass, 800);
          }
        });
      }
    } catch(e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      checkAutoResume();
      hookPageRequestManager();
    });
  } else {
    checkAutoResume();
    hookPageRequestManager();
  }

  // Continuous Auto-Advance Watchdog: checks every 2 seconds to ensure next lesson is continuously processed
  setInterval(() => {
    const state = getStoredSkipState();
    if (!state.active || cancelRequested) return;

    const isLecturePage = document.getElementById("hfStudentID") ||
                          document.querySelector("a[id*='tabHeader']") ||
                          /\/Courses\/.*\/LessonContent\.aspx/i.test(location.pathname) ||
                          /LessonContent/i.test(location.href);

    if (isLecturePage && !isBypassing) {
      // Check if tabs are not yet completed
      const tabs = Array.from(document.querySelectorAll("a[id*='tabHeader'], a[id*='TabHeader'], [id^='tabHeader']"));
      let allDone = true;
      for (const tab of tabs) {
        const tabId = tab.id.replace(/[^0-9]/g, "");
        if (!tabId) continue;
        const statusField = document.getElementById(`hfTabCompletionStatus${tabId}`);
        if (statusField && statusField.value !== "Completed") {
          allDone = false;
          break;
        }
      }

      if (!allDone || tabs.length === 0) {
        executeLectureBypass();
      } else {
        const nextBtn = findNextLessonButton();
        if (nextBtn) {
          triggerNextLessonNavigation(nextBtn);
        }
      }
    }
  }, 2000);

})();
