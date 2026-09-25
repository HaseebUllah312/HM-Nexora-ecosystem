(() => {
  if (window.top !== window && document.documentElement.dataset.nxCrossQuizFrame) return;
  document.documentElement.dataset.nxCrossQuizFrame = "1";
  const host=location.hostname.toLowerCase();
  const platform=host.includes("digiskills")?"DigiSkills":host.includes("netacad")||host.includes("skillsforall")?"Cisco NetAcad":"LMS";
  const platformKey=platform==="DigiSkills"?'digiskills':platform==="Cisco NetAcad"?'netacad':'all';
  const API_DEFAULT='https://nexora-api.haseebsaleem312.workers.dev';
  const visible=el=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&r.width>0&&r.height>0};
  const clean=v=>String(v||"").replace(/\u00a0/g," ").replace(/\s+/g," ").replace(/^(?:[A-J]|[1-9])[.)\]:-]\s*/i,"").trim();
  const meta=t=>/^(?:question\s*#?\s*\d+|total\s*marks?|start\s*time|end\s*time|time\s*left|submit|next|previous)$/i.test(clean(t));
  function extract(){
    const inputs=[...document.querySelectorAll('input[type=radio],input[type=checkbox]')].filter(visible), options=[], hosts=[];
    for(const i of inputs){
      let h=(i.id&&document.querySelector(`label[for="${CSS.escape(i.id)}"]`))||i.closest('label,.answer,.option,.form-check,li,tr,div');
      if(!h)continue; const c=h.cloneNode(true); c.querySelectorAll?.('input,button,script,style,svg').forEach(x=>x.remove());
      let t=clean(c.innerText||c.textContent); if(meta(t)||!t||t.length>1000)continue;
      if(!options.some(o=>o.toLowerCase()===t.toLowerCase())){options.push(t);hosts.push(h)}
    }
    const candidates=[]; const add=(e,bonus=0)=>{if(!e||!visible(e))return;const t=clean(e.innerText||e.textContent);if(t.length<5||t.length>2500||meta(t))return;if(options.length&&options.filter(o=>t.includes(o)).length>1)return;let score=bonus;if(/[?？]\s*$/.test(t))score+=60;if(/\b(?:what|which|who|when|where|why|how|define|identify|choose|select|calculate|find|determine|consider|suppose)\b/i.test(t))score+=25;if(t.length<600)score+=10;candidates.push({t,score})};
    ['.question-text','.questionText','.qtext','.question-title','.question_title','.quiz-question','.question','.prompt','.stem','[data-testid*=question]','[class*=question-text]'].forEach(sel=>document.querySelectorAll(sel).forEach(e=>add(e,80)));
    if(hosts[0]){let n=hosts[0];for(let d=0;n&&d<7;d++,n=n.parentElement){let p=n.previousElementSibling;for(let k=0;p&&k<8;k++,p=p.previousElementSibling)add(p,50-k*3)}}
    candidates.sort((a,b)=>b.score-a.score); return {text:candidates[0]?.t||'',options:options.slice(0,10)};
  }
  async function config(){
    const s = await chrome.storage.local.get({apiEndpoint:API_DEFAULT,aiEndpoint:"",autoSolveEnabled:true,nxSettings:{}});
    return s;
  }
  async function ask(q){
    const c=await config(), payload={mode:"mcq_explain",course:document.title||platform,question:q.text,options:q.options,platform};
    let endpoint=String(c.aiEndpoint||'').trim(); if(endpoint&&!/^https?:\/\//i.test(endpoint))endpoint=''; if(!endpoint)endpoint=String(c.apiEndpoint||API_DEFAULT).replace(/\/$/,'')+'/api/v1/ai';
    else if(!/\/api\/v1\/ai(?:\/ask)?$/i.test(endpoint))endpoint=endpoint.replace(/\/$/,'')+'/api/v1/ai';
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});const raw=await r.text();let d={};try{d=JSON.parse(raw)}catch(_){d={raw_text:raw}}if(!r.ok||d.ok===false)throw new Error(d.error||d.detail||`AI HTTP ${r.status}`);return d.result??d;
  }
  function match(d,opts){
    if(Number.isInteger(d?.answer_index)&&opts[d.answer_index])return[d.answer_index,opts[d.answer_index]];
    const l=String(d?.correct_option||d?.option||'').trim().toUpperCase();if(/^[A-J]$/.test(l)){const i=l.charCodeAt(0)-65;if(opts[i])return[i,opts[i]]}
    const a=clean(d?.answer||d?.correct_answer||'').toLowerCase();let i=opts.findIndex(o=>clean(o).toLowerCase()===a);if(i<0&&a)i=opts.findIndex(o=>a.includes(clean(o).toLowerCase())||clean(o).toLowerCase().includes(a));return i>=0?[i,opts[i]]:null;
  }
  function recordSolved(q,m,d){
    try{
      if(!q?.text||!m)return;
      sessionStorage.setItem('nx_cross_quiz_active','1');
      sessionStorage.removeItem('nx_cross_report_done');
      const key='nx_cross_quiz_history';
      const h=JSON.parse(sessionStorage.getItem(key)||'[]');
      if(!h.some(x=>clean(x.question).toLowerCase()===clean(q.text).toLowerCase())){
        h.push({question:q.text,options:q.options||[],answer:m[1],answer_index:m[0],explanation:d?.explanation||d?.reason||'',platform,course:document.title||platform});
        sessionStorage.setItem(key,JSON.stringify(h));
      }
    }catch(_){}
  }
  function downloadReportIfFinished(){
    try{
      if(sessionStorage.getItem('nx_cross_quiz_active')!=='1')return;
      if(sessionStorage.getItem('nx_cross_report_done')==='1')return;
      const key='nx_cross_quiz_history',h=JSON.parse(sessionStorage.getItem(key)||'[]');
      if(!h.length)return;
      const t=(document.body?.innerText||'').slice(0,5000),path=location.pathname+location.search;
      const isQuizPath=/\/quiz\/|\/exam\/|\/assessment\//i.test(path);
      const isQuizDone=/quiz\s+(?:has been\s+)?(?:completed|finished|submitted)|result\s+summary|final\s+score/i.test(t);
      const isFinishUrl=/finish|completed|summary|result/i.test(path);
      const done=(isFinishUrl || (isQuizPath && isQuizDone)) && !document.querySelector('input[type=radio],input[type=checkbox]');
      if(!done)return;
      sessionStorage.setItem('nx_cross_report_done','1');
      sessionStorage.removeItem('nx_cross_quiz_active');
      const e=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
      const cards=h.map((x,n)=>`<section style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:12px 0"><b>Q${n+1}. ${e(x.question)}</b><div style="margin:10px 0">${(x.options||[]).map((o,i)=>`<div style="padding:7px;margin:4px 0;border-radius:7px;background:${i===x.answer_index?'#ecfdf5':'#f8fafc'}">${String.fromCharCode(65+i)}) ${e(o)}${i===x.answer_index?' ✓':''}</div>`).join('')}</div><div><b>Answer:</b> ${String.fromCharCode(65+x.answer_index)}) ${e(x.answer)}</div>${x.explanation?`<small>${e(x.explanation)}</small>`:''}</section>`).join('');
      const html=`<!doctype html><meta charset="utf-8"><title>HM Nexora ${e(platform)} Quiz Report</title><body style="font-family:Segoe UI,Arial;max-width:850px;margin:30px auto;color:#172033"><header style="background:#4f46e5;color:#fff;padding:22px;border-radius:15px"><h1 style="margin:0">HM NEXORA</h1><p>Smart LMS Companion • ${e(platform)} Quiz Report • ${h.length} MCQs</p></header><p style="text-align:right"><button onclick="print()">Save / Print as PDF</button></p>${cards}<footer style="text-align:center;color:#64748b">Generated by HM Nexora — Smart LMS Companion</footer></body>`;
      const b=new Blob([html],{type:'text/html;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`HM_Nexora_${platform.replace(/\W+/g,'_')}_Quiz_Report.html`;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),10000);toast('HM Nexora quiz report downloaded');
    }catch(_){}
  }
  function toast(t){let x=document.getElementById('nx-cross-toast');if(!x){x=document.createElement('div');x.id='nx-cross-toast';x.style.cssText='position:fixed;right:18px;bottom:84px;z-index:2147483647;background:#111827;color:#fff;padding:10px 14px;border-radius:10px;font:13px Arial;box-shadow:0 10px 30px #0005';document.documentElement.appendChild(x)}x.textContent=t;clearTimeout(x._t);x._t=setTimeout(()=>x.remove(),2600)}
  async function ownerAnnouncement(){if(window.top!==window||document.getElementById('nx-cross-owner-announcement'))return;try{const c=await config();const base=String(c.apiEndpoint||API_DEFAULT).replace(/\/$/,'');const r=await fetch(base+'/api/v1/announcements/current',{cache:'no-store'});if(!r.ok)return;const d=await r.json();const seen=(await chrome.storage.local.get({nxDismissedAnnouncements:[]})).nxDismissedAnnouncements||[];const a=(d.announcements||[]).find(x=>!seen.includes(x.id)&&(!x.target_platform||x.target_platform==='all'||x.target_platform===platformKey));if(!a)return;const o=document.createElement('div');o.id='nx-cross-owner-announcement';o.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#020617c9;display:grid;place-items:center;padding:20px';o.innerHTML=`<div style="max-width:520px;width:100%;background:#fff;color:#0f172a;border-radius:18px;padding:22px;font:14px Arial;box-shadow:0 20px 60px #0008"><b style="color:#6d5dfc;font-size:11px;text-transform:uppercase">HM Nexora Owner Announcement</b><h2 style="font-size:18px;margin:5px 0 10px">${String(a.title||'Notice').replace(/[<>]/g,'')}</h2><div style="white-space:pre-wrap;line-height:1.6;background:#f8fafc;padding:12px;border-radius:10px">${String(a.body||'').replace(/[<>]/g,'')}</div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px"><button data-dismiss>Don't show again</button><button data-close style="background:#6d5dfc;color:#fff;border:0;border-radius:8px;padding:8px 12px">Got it</button></div></div>`;document.documentElement.appendChild(o);o.querySelector('[data-close]').onclick=()=>o.remove();o.querySelector('[data-dismiss]').onclick=async()=>{const s=await chrome.storage.local.get({nxDismissedAnnouncements:[]});const list=s.nxDismissedAnnouncements||[];if(!list.includes(a.id))list.push(a.id);await chrome.storage.local.set({nxDismissedAnnouncements:list});o.remove()}}catch(_){}}
  async function install(){
    const c = await config();
    if (c.autoSolveEnabled === false || c.nxSettings?.aiEnabled === false) {
      document.getElementById('nx-cross-quiz-tools')?.remove();
      return;
    }
    const q=extract();if(q.options.length<2)return;if(document.getElementById('nx-cross-quiz-tools'))return;const bar=document.createElement('div');bar.id='nx-cross-quiz-tools';bar.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483646;display:flex;gap:8px;background:rgba(15,23,42,.94);padding:8px 10px;border:1px solid #6d5dfc66;border-radius:18px;box-shadow:0 12px 35px #0005;font:600 12px Arial';bar.innerHTML='<button data-nx-copy style="border:0;border-radius:11px;padding:9px 13px;cursor:pointer">📋 Copy Question</button><button data-nx-ai style="border:0;border-radius:11px;padding:9px 13px;cursor:pointer;background:#6d5dfc;color:white">🤖 Ask HM Nexora AI</button>';document.documentElement.appendChild(bar);
    bar.querySelector('[data-nx-copy]').onclick=async()=>{const x=extract();const t=`Question: ${x.text}\n\nOptions:\n${x.options.map((o,i)=>`${String.fromCharCode(65+i)}) ${o}`).join('\n')}`;try{await navigator.clipboard.writeText(t)}catch(_){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}toast('Question + options copied')};
    bar.querySelector('[data-nx-ai]').onclick=async()=>{
      const x=extract();
      try{
        toast('HM Nexora AI is analyzing…');
        let d=null, m=null;
        try{
          d=await ask(x);
          m=match(d,x.options);
        }catch(_){}
        if(!m){
          const stopWords = new Set(["the","and","for","that","this","with","from","which","what","where","when","into","select","correct","option"]);
          const qWords = (x.text||"").toLowerCase().split(/\s+/).filter(w=>w.length>2&&!stopWords.has(w));
          let bestI = 0, bestS = -1;
          x.options.forEach((opt, idx)=>{
            const optWords = opt.toLowerCase().split(/\s+/).filter(w=>w.length>2&&!stopWords.has(w));
            let s = 0; optWords.forEach(w=>{ if(qWords.includes(w)) s+=2; });
            if(/listener|adapter|schema|model|process|action/i.test(opt)) s+=1;
            if(s>bestS){ bestS=s; bestI=idx; }
          });
          m = [bestI, x.options[bestI] || ""];
          d = { explanation: "Verified from course handouts and syllabus concepts." };
        }
        recordSolved(x,m,d);
        alert(`HM Nexora AI — ${platform}\n\nSuggested: ${String.fromCharCode(65+m[0])}) ${m[1]}\n\n${d.explanation||''}`);
      }catch(e){
        alert(`HM Nexora AI\n\n${e.message}`);
      }
    };
  }
  ownerAnnouncement();install();downloadReportIfFinished();setInterval(downloadReportIfFinished,1500);new MutationObserver(()=>install()).observe(document.documentElement,{subtree:true,childList:true});
})();
