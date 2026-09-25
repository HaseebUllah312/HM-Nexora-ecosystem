class NexoraExtensionScript {
  static String getInjectedJS({bool enableFloatingToolbar = true}) {
    return r'''
(function() {
  if (window.__NEXORA_INJECTED__) return;
  window.__NEXORA_INJECTED__ = true;

  console.log("[HM NEXORA] Mobile Chrome Extension Suite Initialized.");

  function post(action, data) {
    try {
      if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
        window.flutter_inappwebview.callHandler('nexoraBridge', { action: action, data: data || {} });
      }
    } catch(e) {
      console.warn("[Nexora Bridge Error]", e);
    }
  }

  // 1. UNLOCK COPY / PASTE & CONTEXT MENU
  function unlockAntiCheat() {
    try {
      document.oncontextmenu = null;
      document.oncopy = null;
      document.oncut = null;
      document.onpaste = null;
      document.onselectstart = null;
      document.ondragstart = null;

      ['contextmenu', 'copy', 'cut', 'paste', 'selectstart', 'dragstart', 'keydown', 'keyup'].forEach(function(evt) {
        window.addEventListener(evt, function(e) {
          e.stopPropagation();
        }, true);
      });

      var style = document.createElement('style');
      style.innerHTML = '* { -webkit-user-select: text !important; user-select: text !important; }';
      (document.head || document.documentElement).appendChild(style);
    } catch(e) {}
  }
  unlockAntiCheat();
  setInterval(unlockAntiCheat, 3000);

  // 2. VIDEO ACCELERATION & FAST SKIP
  window.nexoraSkipVideo = function() {
    var vids = document.querySelectorAll('video');
    var found = false;
    vids.forEach(function(v) {
      found = true;
      try {
        v.playbackRate = 16.0;
        if (v.duration && !isNaN(v.duration)) {
          v.currentTime = Math.max(0, v.duration - 0.5);
        }
        v.play();
        v.dispatchEvent(new Event('timeupdate'));
        v.dispatchEvent(new Event('ended'));
      } catch(e) {}
    });
    return found;
  };

  window.nexoraSetSpeed = function(rate) {
    var vids = document.querySelectorAll('video');
    vids.forEach(function(v) {
      try {
        v.playbackRate = rate;
        v.play();
      } catch(e) {}
    });
    return vids.length > 0;
  };

  // 3. AUTO MCQ QUIZ SOLVER
  window.nexoraSolveQuiz = function() {
    var questionText = '';
    var qElem = document.querySelector('.QuestionText, #lblQuestion, #lblQuestionDetail, .question_text, .quiz_question');
    if (qElem) {
      questionText = qElem.innerText.trim();
    } else {
      var bodyText = document.body.innerText;
      var qMatch = bodyText.match(/Question\s*#?\s*\d+[\s\S]*?(?=\n\n|\n[A-D]\.|$)/i);
      if (qMatch) questionText = qMatch[0];
    }

    var options = [];
    var inputs = document.querySelectorAll('input[type="radio"]');
    inputs.forEach(function(input, idx) {
      var label = document.querySelector('label[for="' + input.id + '"]') || input.parentElement;
      var text = label ? label.innerText.trim() : ('Option ' + (idx + 1));
      options.push({ input: input, label: label, text: text, index: idx });
    });

    if (inputs.length > 0) {
      // Pick first or best option
      var chosen = inputs[0];
      chosen.checked = true;
      chosen.dispatchEvent(new Event('change', { bubbles: true }));
      chosen.dispatchEvent(new Event('click', { bubbles: true }));
      return { success: true, count: inputs.length, question: questionText };
    }
    return { success: false, reason: 'No MCQ radio options found on this page.' };
  };

  // 4. CREDENTIAL AUTOFILL
  window.nexoraAutofill = function(sid, pwd) {
    var sidInput = document.querySelector('input[name*="StudentID"], input[id*="txtStudentID"], input[id*="txtUserID"], input[type="text"]');
    var pwdInput = document.querySelector('input[type="password"]');

    if (sidInput && sid) {
      sidInput.value = sid;
      sidInput.dispatchEvent(new Event('input', { bubbles: true }));
      sidInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (pwdInput && pwd) {
      pwdInput.value = pwd;
      pwdInput.dispatchEvent(new Event('input', { bubbles: true }));
      pwdInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return !!(sidInput && pwdInput);
  };

})();
''';
  }
}
