/* HM Nexora Secure Credential Vault v2.0.0
 * Client-side encryption: PBKDF2-SHA256 -> AES-256-GCM KEK -> wrapped random DEK.
 * The Google Drive AppData copy contains ciphertext only.
 */
(() => {
  'use strict';

  const LOCAL_KEY = 'nxSecureVaultV2';
  const LEGACY_KEY = 'nxVault';
  const SCHEMA = 2;
  const KDF_ITERATIONS = 600000;
  const AUTO_LOCK_MS = 0; // 0 = keep unlocked until Chrome/browser session ends
  const QUICK_PIN_KEY = 'nxVaultQuickPinV1';
  const QUICK_PIN_ITERATIONS = 600000;
  const QUICK_PIN_MAX_FAILS = 5;
  const QUICK_PIN_LOCK_MS = 5 * 60 * 1000;
  const te = new TextEncoder();
  const td = new TextDecoder();

  let unlocked = null; // { envelope, dek, accounts, mode }
  let lockTimer = null;
  let sessionRestoreStarted = false;

  const b64 = bytes => {
    let s = '';
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const unb64 = s => {
    const raw = atob(String(s || ''));
    const out = new Uint8Array(raw.length);
    for (let i=0;i<raw.length;i++) out[i] = raw.charCodeAt(i);
    return out;
  };
  const rnd = n => crypto.getRandomValues(new Uint8Array(n));

  async function deriveKek(secret, salt, iterations = KDF_ITERATIONS) {
    const base = await crypto.subtle.importKey('raw', te.encode(secret), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name:'PBKDF2', hash:'SHA-256', salt, iterations },
      base,
      { name:'AES-GCM', length:256 },
      false,
      ['encrypt','decrypt']
    );
  }

  async function importDek(raw, usages=['encrypt','decrypt']) {
    return crypto.subtle.importKey('raw', raw, {name:'AES-GCM'}, false, usages);
  }

  async function encryptBytes(key, bytes) {
    const iv = rnd(12);
    const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, bytes);
    return { iv:b64(iv), ciphertext:b64(new Uint8Array(ct)) };
  }

  async function decryptBytes(key, box) {
    const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv:unb64(box.iv)}, key, unb64(box.ciphertext));
    return new Uint8Array(pt);
  }

  async function encryptAccounts(dekRaw, accounts) {
    const dek = await importDek(dekRaw);
    return encryptBytes(dek, te.encode(JSON.stringify({accounts, savedAt:new Date().toISOString()})));
  }

  async function decryptAccounts(dekRaw, payload) {
    const dek = await importDek(dekRaw);
    const bytes = await decryptBytes(dek, payload);
    const data = JSON.parse(td.decode(bytes));
    return Array.isArray(data?.accounts) ? data.accounts : [];
  }

  function normalizeAccounts(list) {
    const seen = new Map();
    for (const a of Array.isArray(list) ? list : []) {
      const username = String(a?.username || a?.id || '').trim();
      const password = String(a?.password || '');
      if (!username || !password) continue;
      seen.set(username.toUpperCase(), {
        id: username,
        username,
        password,
        label: String(a?.label || username).trim() || username,
        updatedAt: a?.updatedAt || new Date().toISOString()
      });
    }
    return [...seen.values()];
  }

  async function localEnvelope() {
    const r = await chrome.storage.local.get(LOCAL_KEY);
    return r?.[LOCAL_KEY] || null;
  }

  async function legacyAccounts() {
    const r = await chrome.storage.local.get({[LEGACY_KEY]:[]});
    return normalizeAccounts(r?.[LEGACY_KEY] || []);
  }

  async function saveLocal(envelope) {
    await chrome.storage.local.set({[LOCAL_KEY]:envelope});
  }

  async function msg(type, extra={}) {
    return chrome.runtime.sendMessage({type, ...extra});
  }

  async function saveSessionUnlock() {
    if (!unlocked?.dekRaw || !unlocked?.envelope) return;
    try {
      await msg('NX_VAULT_SESSION_SET', {
        session: {
          dek: b64(unlocked.dekRaw),
          envelope: unlocked.envelope,
          mode: unlocked.mode || unlocked.envelope?.mode || 'local',
          savedAt: Date.now()
        }
      });
    } catch (_) {}
  }

  async function clearSessionUnlock() {
    try { await msg('NX_VAULT_SESSION_CLEAR'); } catch (_) {}
  }

  async function restoreSessionUnlock() {
    if (unlocked) return true;
    try {
      const r = await msg('NX_VAULT_SESSION_GET');
      const s = r?.session;
      if (!r?.ok || !s?.dek || !s?.envelope) return false;
      const dekRaw = unb64(s.dek);
      const accounts = normalizeAccounts(await decryptAccounts(dekRaw, s.envelope.vault));
      unlocked = {envelope:s.envelope, dekRaw, accounts, mode:s.mode || s.envelope.mode || 'local'};
      touch();
      return true;
    } catch (_) { return false; }
  }

  async function quickPinRecord() {
    const r = await chrome.storage.local.get(QUICK_PIN_KEY);
    return r?.[QUICK_PIN_KEY] || null;
  }

  async function quickPinStatus() {
    const rec = await quickPinRecord();
    const now = Date.now();
    return {
      enabled: !!rec?.wrappedDek,
      failed: Number(rec?.failed || 0),
      blockedUntil: Number(rec?.blockedUntil || 0),
      blocked: Number(rec?.blockedUntil || 0) > now
    };
  }

  async function setQuickPin(pin) {
    if (!unlocked?.dekRaw) throw new Error('Unlock Nexora Vault first.');
    pin = String(pin || '');
    if (!/^\d{4}$/.test(pin)) throw new Error('Quick PIN must be exactly 4 digits.');
    const salt = rnd(16);
    const kek = await deriveKek(pin, salt, QUICK_PIN_ITERATIONS);
    const wrappedDek = await encryptBytes(kek, unlocked.dekRaw);
    await chrome.storage.local.set({[QUICK_PIN_KEY]:{
      version:1,
      salt:b64(salt),
      iterations:QUICK_PIN_ITERATIONS,
      wrappedDek,
      failed:0,
      blockedUntil:0,
      updatedAt:new Date().toISOString()
    }});
    return true;
  }

  async function removeQuickPin() {
    await chrome.storage.local.remove(QUICK_PIN_KEY);
    return true;
  }

  async function unlockQuickPin(pin, preferCloud=false) {
    pin = String(pin || '');
    if (!/^\d{4}$/.test(pin)) throw new Error('Enter your 4-digit Quick PIN.');
    const rec = await quickPinRecord();
    if (!rec?.wrappedDek) throw new Error('Quick PIN is not enabled on this device.');
    const now = Date.now();
    if (Number(rec.blockedUntil || 0) > now) {
      const mins = Math.ceil((Number(rec.blockedUntil)-now)/60000);
      throw new Error(`Quick PIN temporarily locked. Try again in ${mins} minute${mins===1?'':'s'} or use Master Password.`);
    }
    try {
      let env = await localEnvelope();
      if (preferCloud) {
        try {
          const remote = await cloudGet();
          if (remote?.found && remote.envelope) {
            const localRev = Number(env?.revision || 0);
            const remoteRev = Number(remote.envelope?.revision || 0);
            if (!env || remoteRev >= localRev) { env = remote.envelope; await saveLocal(env); }
          }
        } catch (_) {}
      }
      if (!env) throw new Error('No Nexora Secure Vault found.');
      const kek = await deriveKek(pin, unb64(rec.salt), Number(rec.iterations || QUICK_PIN_ITERATIONS));
      const dekRaw = await decryptBytes(kek, rec.wrappedDek);
      const accounts = normalizeAccounts(await decryptAccounts(dekRaw, env.vault));
      unlocked = {envelope:env, dekRaw, accounts, mode:env.mode || 'local'};
      await chrome.storage.local.set({[QUICK_PIN_KEY]:{...rec,failed:0,blockedUntil:0}});
      touch();
      await saveSessionUnlock();
      return {ok:true, accounts:accounts.map(publicAccount), mode:unlocked.mode};
    } catch (e) {
      if (String(e?.message||'').includes('temporarily locked')) throw e;
      const failed = Number(rec.failed || 0) + 1;
      const blockedUntil = failed >= QUICK_PIN_MAX_FAILS ? Date.now()+QUICK_PIN_LOCK_MS : 0;
      await chrome.storage.local.set({[QUICK_PIN_KEY]:{...rec,failed:blockedUntil?0:failed,blockedUntil}});
      if (blockedUntil) throw new Error('Too many incorrect PIN attempts. Quick PIN is locked for 5 minutes; use Master Password instead.');
      throw new Error(`Incorrect Quick PIN. ${QUICK_PIN_MAX_FAILS-failed} attempt${QUICK_PIN_MAX_FAILS-failed===1?'':'s'} remaining before temporary lock.`);
    }
  }

  async function googleStatus() {
    try { return await msg('NX_VAULT_GOOGLE_STATUS'); }
    catch(e) { return {ok:false, connected:false, error:String(e?.message||e)}; }
  }

  async function googleConnect() {
    const r = await msg('NX_VAULT_GOOGLE_CONNECT');
    if (!r?.ok) throw new Error(r?.error || 'Google sign-in failed');
    return r;
  }

  async function googleDisconnect() {
    const r = await msg('NX_VAULT_GOOGLE_DISCONNECT');
    if (!r?.ok) throw new Error(r?.error || 'Could not disconnect Google');
    return r;
  }

  async function cloudGet() {
    const r = await msg('NX_VAULT_DRIVE_GET');
    if (!r?.ok) throw new Error(r?.error || 'Could not read Google vault');
    return r;
  }

  async function cloudPut(envelope) {
    const r = await msg('NX_VAULT_DRIVE_PUT', {envelope});
    if (!r?.ok) throw new Error(r?.error || 'Could not sync Google vault');
    return r;
  }

  async function create(secret, mode='local') {
    if (!secret || secret.length < 8) throw new Error('Use a Master Password with at least 8 characters.');
    const legacy = await legacyAccounts();
    const salt = rnd(16);
    const dekRaw = rnd(32);
    const kek = await deriveKek(secret, salt);
    const wrapped = await encryptBytes(kek, dekRaw);
    const payload = await encryptAccounts(dekRaw, legacy);
    const now = new Date().toISOString();
    const envelope = {
      schemaVersion: SCHEMA,
      crypto: 'AES-256-GCM',
      kdf: {algorithm:'PBKDF2-SHA256', iterations:KDF_ITERATIONS, salt:b64(salt)},
      wrappedKey: wrapped,
      vault: payload,
      mode: mode === 'google' ? 'google' : 'local',
      revision: 1,
      createdAt: now,
      updatedAt: now
    };

    // Verify before deleting any legacy plaintext.
    const testDek = await decryptBytes(kek, envelope.wrappedKey);
    await decryptAccounts(testDek, envelope.vault);
    await saveLocal(envelope);
    if (mode === 'google') await cloudPut(envelope);
    if (legacy.length) await chrome.storage.local.remove(LEGACY_KEY);

    unlocked = {envelope, dekRaw, accounts:legacy, mode:envelope.mode};
    touch();
    await saveSessionUnlock();
    return {ok:true, migrated:legacy.length};
  }

  async function unlock(secret, preferCloud=false) {
    let env = await localEnvelope();
    if (preferCloud) {
      try {
        const remote = await cloudGet();
        if (remote?.found && remote.envelope) {
          const localRev = Number(env?.revision || 0);
          const remoteRev = Number(remote.envelope?.revision || 0);
          if (!env || remoteRev >= localRev) {
            env = remote.envelope;
            await saveLocal(env);
          }
        }
      } catch (_) {}
    }
    if (!env) throw new Error('No Nexora Secure Vault found.');
    if (Number(env.schemaVersion) !== SCHEMA) throw new Error('Unsupported vault version.');
    try {
      const kek = await deriveKek(secret, unb64(env.kdf.salt), Number(env.kdf.iterations || KDF_ITERATIONS));
      const dekRaw = await decryptBytes(kek, env.wrappedKey);
      const accounts = normalizeAccounts(await decryptAccounts(dekRaw, env.vault));
      unlocked = {envelope:env, dekRaw, accounts, mode:env.mode || 'local'};
      touch();
      await saveSessionUnlock();
      return {ok:true, accounts:accounts.map(publicAccount), mode:unlocked.mode};
    } catch (_) {
      throw new Error('Incorrect Vault password/PIN or damaged vault.');
    }
  }

  function publicAccount(a) {
    return {id:a.id, username:a.username, label:a.label, updatedAt:a.updatedAt};
  }

  function touch() {
    if (!unlocked) return;
    clearTimeout(lockTimer);
    lockTimer = null;
    if (AUTO_LOCK_MS > 0) lockTimer = setTimeout(() => { lock().catch?.(()=>{}); }, AUTO_LOCK_MS);
  }

  async function lock() {
    if (unlocked?.dekRaw) unlocked.dekRaw.fill?.(0);
    unlocked = null;
    clearTimeout(lockTimer);
    lockTimer = null;
    await clearSessionUnlock();
  }

  async function persist() {
    if (!unlocked) throw new Error('Vault is locked.');
    const env = {...unlocked.envelope};
    env.vault = await encryptAccounts(unlocked.dekRaw, unlocked.accounts);
    env.revision = Number(env.revision || 0) + 1;
    env.updatedAt = new Date().toISOString();
    unlocked.envelope = env;
    await saveLocal(env);
    if (unlocked.mode === 'google') await cloudPut(env);
    touch();
    await saveSessionUnlock();
    return env;
  }

  async function add(username, password, label='') {
    if (!unlocked) throw new Error('Unlock Nexora Vault first.');
    username = String(username || '').trim();
    password = String(password || '');
    if (!username || !password) throw new Error('Enter LMS ID and password first.');
    const i = unlocked.accounts.findIndex(x => x.username.toUpperCase() === username.toUpperCase());
    const item = {id:username, username, password, label:String(label||username).trim()||username, updatedAt:new Date().toISOString()};
    if (i >= 0) unlocked.accounts[i] = item; else unlocked.accounts.push(item);
    await persist();
    return publicAccount(item);
  }

  async function remove(index) {
    if (!unlocked) throw new Error('Unlock Nexora Vault first.');
    unlocked.accounts.splice(Number(index), 1);
    await persist();
  }

  function account(index) {
    if (!unlocked) return null;
    touch();
    return unlocked.accounts[Number(index)] || null;
  }

  function accounts() {
    if (!unlocked) return [];
    touch();
    return unlocked.accounts.map(publicAccount);
  }

  async function syncNow() {
    if (!unlocked) throw new Error('Vault is locked.');
    if (unlocked.mode !== 'google') throw new Error('Google sync is not enabled for this vault.');
    await cloudPut(unlocked.envelope);
    touch();
    return true;
  }

  async function enableGoogle() {
    if (!unlocked) throw new Error('Unlock Nexora Vault first.');
    await googleConnect();
    unlocked.mode = 'google';
    unlocked.envelope.mode = 'google';
    unlocked.envelope.revision = Number(unlocked.envelope.revision || 0) + 1;
    unlocked.envelope.updatedAt = new Date().toISOString();
    await saveLocal(unlocked.envelope);
    await cloudPut(unlocked.envelope);
    await saveSessionUnlock();
    return true;
  }

  async function hasVault() { return !!(await localEnvelope()); }

  window.NXSecureVault = {
    hasVault, localEnvelope, legacyAccounts,
    create, unlock, unlockQuickPin, lock, isUnlocked:()=>!!unlocked,
    restoreSessionUnlock,
    accounts, account, add, remove, syncNow, enableGoogle,
    googleStatus, googleConnect, googleDisconnect, cloudGet,
    quickPinStatus, setQuickPin, removeQuickPin,
    autoLockMinutes: AUTO_LOCK_MS/60000,
    lockPolicy: AUTO_LOCK_MS > 0 ? `auto-${AUTO_LOCK_MS/60000}` : 'browser-session'
  };

  if (!sessionRestoreStarted) {
    sessionRestoreStarted = true;
    restoreSessionUnlock().catch(()=>{});
  }
})();
