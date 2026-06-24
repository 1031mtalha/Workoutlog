/* ── Persistence layer ──────────────────────────────────────────
   Uses the browser's localStorage. Kept async so the rest of the
   app doesn't need to change if a backend is ever swapped in.
   Data is per-browser, per-device. */

let onError = null;
export const setStorageErrorHandler = (fn) => { onError = fn; };

export const sg = async (k, fb) => {
  try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); }
  catch (e) { onError?.("read", k, e); return fb; }
};

export const ss = async (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch (e) { onError?.("write", k, e); return false; }
};

export const slist = async (prefix) => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    return keys;
  } catch (e) { onError?.("list", prefix, e); return []; }
};

/* Round-trips a throwaway key to verify storage actually persists.
   iOS Safari / private mode can silently no-op writes. */
export const testStorage = () => {
  try {
    const k = "__wl_storage_test__";
    const v = String(Date.now());
    localStorage.setItem(k, v);
    const ok = localStorage.getItem(k) === v;
    localStorage.removeItem(k);
    return ok;
  } catch { return false; }
};

const APP_PREFIXES = ["wl_", "fd_", "sl_", "rh_", "so_", "ad_", "fg_", "st_", "prs_v3", "tgt_v1", "cycle_v1", "phase_v1", "ovr_v1", "custom_ex_v1", "foodPresets", "clearance_v1"];

const isAppKey = (key) => APP_PREFIXES.some(p => p.endsWith("_") ? key.startsWith(p) : key === p);

export function exportAll() {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isAppKey(key)) {
      try { out[key] = JSON.parse(localStorage.getItem(key)); } catch { /* skip corrupt key */ }
    }
  }
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `workoutlog-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importAll(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        let count = 0;
        Object.entries(data).forEach(([k, v]) => {
          if (isAppKey(k)) { localStorage.setItem(k, JSON.stringify(v)); count++; }
        });
        resolve(count);
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
