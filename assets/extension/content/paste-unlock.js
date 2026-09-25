(() => {
  "use strict";
  // HM Nexora paste/copy compatibility layer for VULMS writing pages.
  // Runs at document_start in MAIN world so page-level handlers cannot win the race.
  const allowedTypes = new Set(['paste','copy','cut','contextmenu','selectstart']);
  const orig = {
    preventDefault: Event.prototype.preventDefault,
    stopPropagation: Event.prototype.stopPropagation,
    stopImmediatePropagation: Event.prototype.stopImmediatePropagation
  };

  function editableTarget(t) {
    if (!t || t === window || t === document) return false;
    if (t.nodeType !== 1) t = t.parentElement;
    if (!t) return false;
    if (t.isContentEditable) return true;
    return !!t.closest?.('input,textarea,[contenteditable="true"],[contenteditable=""],.cke,.cke_editable,iframe,body[contenteditable]');
  }

  // Only ignore cancellation when the event is a clipboard/selection action on an editable target.
  Event.prototype.preventDefault = function(...args) {
    if (allowedTypes.has(this.type) && editableTarget(this.target)) return;
    return orig.preventDefault.apply(this,args);
  };
  Event.prototype.stopPropagation = function(...args) {
    if (allowedTypes.has(this.type) && editableTarget(this.target)) return;
    return orig.stopPropagation.apply(this,args);
  };
  Event.prototype.stopImmediatePropagation = function(...args) {
    if (allowedTypes.has(this.type) && editableTarget(this.target)) return;
    return orig.stopImmediatePropagation.apply(this,args);
  };

  function clearInline(root=document) {
    const q = root.querySelectorAll ? [...root.querySelectorAll('input,textarea,[contenteditable],.cke_editable,body')] : [];
    const nodes=[document.documentElement,document.body,...q].filter(Boolean);
    for (const el of nodes) {
      for (const name of ['onpaste','oncopy','oncut','oncontextmenu','onselectstart']) {
        try { el[name]=null; el.removeAttribute?.(name); } catch(_) {}
      }
      try { el.style.userSelect='text'; el.style.webkitUserSelect='text'; } catch(_) {}
    }
  }




  function replacePasteWarning(root=document) {
    const oldPhrases = [
      'The Paste (Ctrl + V) option has been disabled by the course instructor.',
      'The Paste (Ctrl + V) option has been disabled by the course instructor',
      'Paste (Ctrl + V) option has been disabled by the course instructor.'
    ];
    const successText = 'Ctrl + V disabled by course instructor has been bypassed by HM Nexora.';

    const walker = document.createTreeWalker(
      root.body || root.documentElement || root,
      NodeFilter.SHOW_TEXT
    );
    const hits=[];
    let node;
    while ((node=walker.nextNode())) {
      const value=(node.nodeValue||'').trim();
      if (oldPhrases.some(p => value.includes(p))) hits.push(node);
    }
    for (const textNode of hits) {
      let value=textNode.nodeValue||'';
      for (const phrase of oldPhrases) value=value.replace(phrase, successText);
      textNode.nodeValue=value;
      const el=textNode.parentElement;
      if (el) {
        el.style.setProperty('color','#159447','important');
        el.style.setProperty('font-weight','600','important');
        el.setAttribute('data-hm-nexora-paste-bypassed','true');
      }
    }
  }

  function patchCurrentFrame() {
    try {
      clearInline(document);
      replacePasteWarning(document);
      const de=document.documentElement, b=document.body;
      for (const el of [de,b]) {
        if (!el) continue;
        try { el.onkeydown=null; el.onkeypress=null; el.onkeyup=null; } catch(_) {}
      }
    } catch(_) {}
  }

  // CKEditor 4 commonly uses an about:blank editable iframe. When running in that
  // child frame (via all_frames + match_about_blank), patch that document too.
  try { patchCurrentFrame(); } catch(_) {}

  function patchCKEditor() {
    const C=window.CKEDITOR;
    if (!C) return;
    try { C.config.blockedKeystrokes=[]; } catch(_) {}
    for (const ed of Object.values(C.instances||{})) {
      if (!ed || ed.__nxPasteReady) continue;
      ed.__nxPasteReady=true;
      try { ed.config.blockedKeystrokes=[]; } catch(_) {}
      try {
        ed.on('instanceReady', () => {
          const body=ed.document?.getBody?.()?.$;
          if (body) {
            body.onpaste=body.oncopy=body.oncut=body.oncontextmenu=null;
            body.onkeydown=body.onkeypress=body.onkeyup=null;
            body.style.userSelect='text';
            body.style.webkitUserSelect='text';
          }
        }, null, null, 1);
      } catch(_) {}
    }
  }

  // Capture keyboard shortcuts before document/body blockers.
  addEventListener('keydown', e => {
    const k=(e.key||'').toLowerCase();
    const shortcut=(e.ctrlKey||e.metaKey) && ['v','c','x','a'].includes(k);
    const shiftInsert=e.shiftKey && (k==='insert'||e.keyCode===45);
    if ((shortcut||shiftInsert) && editableTarget(e.target)) {
      // Do not prevent the browser default; only stop later site handlers.
      orig.stopImmediatePropagation.call(e);
    }
  }, true);

  document.addEventListener('DOMContentLoaded', () => { patchCurrentFrame(); patchCKEditor(); });
  if (document.documentElement) {
    new MutationObserver(() => { patchCurrentFrame(); patchCKEditor(); }).observe(document.documentElement,{subtree:true,childList:true});
  } else {
    document.addEventListener('readystatechange', () => {
      if (document.documentElement) patchCurrentFrame();
    }, {once:true});
  }
})();
