import { useState, useEffect, useCallback, useRef } from "react";
import {
  BG, SURF, CARD, CARD2, BORDER, RED, ORANGE, GREEN, BLUE, PURPLE, TEXT, MUTED, DIM, DIAMOND,
  TTYPE, EX_DEFAULTS, HITS_DEFAULTS, CYCLE_PHASE1, PLYO_STAGES, ADDON_INFO, REHAB,
  MUSCLES, MUSCLE_LABEL, TGT_DEFAULT, DAY_STATUS, SKIP_REASONS, QURAN,
} from "./data";
import { sg, ss, slist, setStorageErrorHandler, testStorage, exportAll, importAll } from "./storage";
import { TodayTab, WeekTab, LogTab, StatsTab, FuelTab, TrackTab, SettingsTab } from "./tabs";

/* ─────────────────────────  HELPERS  ───────────────────────── */
const todayKey = () => new Date().toISOString().split("T")[0];
const dayOfYear = (k) => { const d = new Date(k + "T12:00:00"); const s = new Date(d.getFullYear(), 0, 0); return Math.floor((d - s) / 86400000); };
const fmt = (k) => new Date(k + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtW = (k) => new Date(k + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
const diffDays = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
const addDays = (k, n) => { const d = new Date(k + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]; };
const mod = (n, m) => ((n % m) + m) % m;

const greeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return { g: "Good morning", sub: "Fuel up. Read your verse. Start clean." };
  if (h >= 11 && h < 17) return { g: "Good afternoon", sub: "Primetime. Get the session in." };
  if (h >= 17 && h < 21) return { g: "Good evening", sub: "Wind-down window. Log what's left." };
  return { g: "Good night", sub: "Sleep is where you grow. Protect it." };
};

const est1RM = (reps, wt) => { const w = parseFloat(wt) || 0; const r = parseFloat(reps) || 0; return w > 0 ? Math.round(w * (1 + r / 30)) : r; };

function coachTarget(e, hist) {
  if (!e) return null;
  if (!hist.length) return e.mode === "time" ? `Start at ${e.lo}s` : `Start at ${e.lo} reps`;
  const last = hist[hist.length - 1];
  const reps = parseFloat(last.reps) || 0;
  if (e.mode === "time") { const t = parseFloat(last.reps) || 0; return `Beat ${t}s`; }
  if (e.mode === "bw") { if (reps >= e.hi) return `${reps + 1} reps — push the ceiling`; return `${reps + 1} reps (was ${reps})`; }
  if (reps >= e.hi) return `Add weight, drop to ${e.lo} reps`;
  return `${last.wt} × ${reps + 1} reps`;
}

/* default localStorage keys this build introduces — pre-existing
   wl_/fd_/sl_/rh_/so_/ad_/fg_/prs_v3 keys are read as-is, no migration needed */
const K_CYCLE = "cycle_v1", K_PHASE = "phase_v1", K_TGT = "tgt_v1", K_OVR = "ovr_v1",
  K_CUSTOM = "custom_ex_v1", K_PRESETS = "foodPresets", K_CLEAR = "clearance_v1";

/* ─────────────────────────  COMPONENT  ───────────────────────── */
export default function App() {
  const [tab, setTab] = useState("today");
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [toast, setToast] = useState("");
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  useEffect(() => {
    setStorageErrorHandler((op) => flash("⚠ Save failed — storage may be full or blocked"));
    setStorageOk(testStorage());
  }, []);

  const tk = todayKey();
  const [selDate, setSelDate] = useState(tk); // date being viewed/edited on Log & Fuel
  const gr = greeting();

  /* ── settings / config state ── */
  const [phase, setPhase] = useState(1);
  const [tgt, setTgt] = useState(TGT_DEFAULT);
  const [cycle, setCycle] = useState({ anchorDate: tk, offset: 0, slotOverride: {} });
  const [ovr, setOvr] = useState({});         // per-slot {swaps,removed,added,notes}
  const [custom, setCustom] = useState({});   // custom exercise defs
  const [presets, setPresets] = useState([]);
  const [clearance, setClearance] = useState({ noTenderness: false, painFree: false, providerCleared: false, stage: 0 });

  /* ── per-date data (selDate) ── */
  const [wlog, setWlog] = useState({});
  const [food, setFood] = useState({ kcal: 0, pro: 0, fat: 0, carb: 0, items: [] });
  const [sleep, setSleep] = useState(null);
  const [rhab, setRhab] = useState({});
  const [sore, setSore] = useState({});
  const [addons, setAddons] = useState({});
  const [flags, setFlags] = useState({});
  const [dayStatus, setDayStatus] = useState(null); // { status, reason, note }
  const [prs, setPrs] = useState({});

  const [hist, setHist] = useState([]);
  const [exHist, setExHist] = useState({});
  const [monthCells, setMonthCells] = useState({});

  const [openEx, setOpenEx] = useState(null);
  const [si, setSi] = useState({ reps: "", wt: "" });
  const [showFood, setShowFood] = useState(false);
  const [fi, setFi] = useState({ name: "", kcal: "", pro: "", fat: "", carb: "", save: false });
  const [prEdit, setPrEdit] = useState(null);
  const [prV, setPrV] = useState("");
  const [chartEx, setChartEx] = useState(null);
  const [demo, setDemo] = useState(false);
  const [openWeek, setOpenWeek] = useState(0);
  const [editSlot, setEditSlot] = useState(null); // exercise editor target {slotIdx, exId}
  const [reasonPick, setReasonPick] = useState(false);
  const fileRef = useRef(null);

  /* effective exercise pool = defaults + customs */
  const EX = { ...EX_DEFAULTS, ...custom };
  const HITS = { ...HITS_DEFAULTS, ...Object.fromEntries(Object.keys(custom).map(id => [id, custom[id].hits || ["core"]])) };

  const cycleArr = CYCLE_PHASE1; // phase 2 layers plyo manually via swap-in, base rotation is the same

  const slotIndexForDate = useCallback((date) => {
    if (cycle.slotOverride?.[date] != null) return cycle.slotOverride[date];
    const days = diffDays(cycle.anchorDate, date);
    return mod(days + cycle.offset, cycleArr.length);
  }, [cycle, cycleArr.length]);

  const getEffectiveSlot = useCallback((idx) => {
    const base = cycleArr[idx];
    const o = ovr[base.id] || {};
    let main = (o.main || base.main).filter(id => !(o.removed || []).includes(id));
    return { ...base, main, addons: base.addons };
  }, [ovr, cycleArr]);

  const selIdx = slotIndexForDate(selDate);
  const todayIdx = slotIndexForDate(tk);
  const plan = getEffectiveSlot(selIdx);
  const todayPlan = getEffectiveSlot(todayIdx);
  const tc = TTYPE[plan.type];
  const verse = QURAN[dayOfYear(tk) % QURAN.length];

  /* ── initial load ── */
  useEffect(() => { (async () => {
    const [c, ph, tg, ov, cu, pr, cl] = await Promise.all([
      sg(K_CYCLE, { anchorDate: tk, offset: 0, slotOverride: {} }),
      sg(K_PHASE, 1), sg(K_TGT, TGT_DEFAULT), sg(K_OVR, {}), sg(K_CUSTOM, {}),
      sg(K_PRESETS, []), sg(K_CLEAR, { noTenderness: false, painFree: false, providerCleared: false, stage: 0 }),
    ]);
    setCycle(c); setPhase(ph); setTgt(tg); setOvr(ov); setCustom(cu); setPresets(pr); setClearance(cl);
    setReady(true);
  })(); }, []);

  /* ── per-date data load (re-runs when selDate changes) ── */
  useEffect(() => { if (!ready) return; (async () => {
    const [w, f, s, r, so, ad, p, fl, ds] = await Promise.all([
      sg(`wl_${selDate}`, {}), sg(`fd_${selDate}`, { kcal: 0, pro: 0, fat: 0, carb: 0, items: [] }),
      sg(`sl_${selDate}`, null), sg(`rh_${selDate}`, {}), sg(`so_${selDate}`, {}), sg(`ad_${selDate}`, {}),
      sg("prs_v3", {}), sg(`fg_${selDate}`, {}), sg(`st_${selDate}`, null),
    ]);
    setWlog(w); setFood(f); setSleep(s); setRhab(r); setSore(so); setAddons(ad); setPrs(p); setFlags(fl); setDayStatus(ds);
  })(); }, [selDate, ready]);

  const loadHistory = useCallback(async () => {
    const keys = await slist("wl_");
    const dates = keys.map(k => k.replace("wl_", "")).sort().slice(-30);
    const rows = []; const exMap = {};
    for (const d of dates) {
      const [w, r, f] = await Promise.all([sg(`wl_${d}`, {}), sg(`rh_${d}`, {}), sg(`fd_${d}`, { kcal: 0 })]);
      let vol = 0, sets = 0;
      Object.entries(w).forEach(([exId, arr]) => {
        arr.forEach(s => {
          sets++;
          const reps = parseFloat(s.reps) || 0; const wt = parseFloat(s.wt) || 0;
          vol += wt > 0 ? reps * wt : reps;
          (exMap[exId] = exMap[exId] || []).push({ date: d, reps: s.reps, wt: s.wt });
        });
      });
      const rDone = REHAB.filter(x => r[x.id]).length;
      rows.push({ date: d, vol: Math.round(vol), sets, rehab: rDone, kcal: Math.round(f.kcal || 0) });
    }
    setHist(rows); setExHist(exMap);
    const exs = Object.keys(exMap);
    if (exs.length && !chartEx) setChartEx(exs.includes("pu_max") ? "pu_max" : exs[0]);
  }, [chartEx]);

  useEffect(() => { if (tab === "stats" && ready) loadHistory(); }, [tab, ready, loadHistory]);

  /* monthly tracker grid: load all wl_/st_ keys for current month */
  const loadMonth = useCallback(async (monthKey) => {
    const [y, m] = monthKey.split("-").map(Number);
    const days = new Date(y, m, 0).getDate();
    const cells = {};
    for (let d = 1; d <= days; d++) {
      const dk = `${monthKey}-${String(d).padStart(2, "0")}`;
      if (dk > tk) continue;
      const [st, w, r] = await Promise.all([sg(`st_${dk}`, null), sg(`wl_${dk}`, {}), sg(`rh_${dk}`, {})]);
      const loggedSets = Object.values(w).reduce((a, arr) => a + arr.length, 0);
      const rehabDone = REHAB.filter(x => r[x.id]).length;
      let status = st?.status;
      if (!status) {
        const idx = slotIndexForDate(dk);
        const isRestDay = cycleArr[idx].type === "rest";
        if (loggedSets > 0) status = "done";
        else if (isRestDay && rehabDone > 0) status = "rest";
        else status = null; // unflagged miss
      }
      cells[dk] = { status, reason: st?.reason, sets: loggedSets, rehab: rehabDone };
    }
    setMonthCells(cells);
  }, [tk, cycleArr, slotIndexForDate]);

  const [trackMonth, setTrackMonth] = useState(tk.slice(0, 7));
  useEffect(() => { if (tab === "track" && ready) loadMonth(trackMonth); }, [tab, ready, trackMonth, loadMonth]);

  /* ── savers ── */
  const saveWlog = async v => { setWlog(v); await ss(`wl_${selDate}`, v); };
  const saveFood = async v => { setFood(v); await ss(`fd_${selDate}`, v); };
  const saveSleep = async v => { setSleep(v); await ss(`sl_${selDate}`, v); };
  const saveRhab = async v => { setRhab(v); await ss(`rh_${selDate}`, v); };
  const saveSore = async v => { setSore(v); await ss(`so_${selDate}`, v); };
  const saveAddon = async v => { setAddons(v); await ss(`ad_${selDate}`, v); };
  const savePrs = async v => { setPrs(v); await ss("prs_v3", v); };
  const saveFlags = async v => { setFlags(v); await ss(`fg_${selDate}`, v); };
  const saveDayStatus = async v => { setDayStatus(v); await ss(`st_${selDate}`, v); };
  const saveCycle = async v => { setCycle(v); await ss(K_CYCLE, v); };
  const savePhase = async v => { setPhase(v); await ss(K_PHASE, v); };
  const saveTgt = async v => { setTgt(v); await ss(K_TGT, v); };
  const saveOvr = async v => { setOvr(v); await ss(K_OVR, v); };
  const saveCustom = async v => { setCustom(v); await ss(K_CUSTOM, v); };
  const savePresets = async v => { setPresets(v); await ss(K_PRESETS, v); };
  const saveClearance = async v => { setClearance(v); await ss(K_CLEAR, v); };

  const addSet = async () => {
    if (!si.reps || !openEx) return;
    await saveWlog({ ...wlog, [openEx]: [...(wlog[openEx] || []), { reps: si.reps, wt: si.wt || "BW" }] });
    setSi({ reps: "", wt: "" }); flash("Set logged");
  };
  const delSet = async (exId, i) => { const arr = [...(wlog[exId] || [])]; arr.splice(i, 1); await saveWlog({ ...wlog, [exId]: arr }); };

  const addFood = async () => {
    if (!fi.name) return;
    const it = { name: fi.name, kcal: +fi.kcal || 0, pro: +fi.pro || 0, fat: +fi.fat || 0, carb: +fi.carb || 0 };
    await saveFood({ kcal: food.kcal + it.kcal, pro: food.pro + it.pro, fat: food.fat + it.fat, carb: food.carb + it.carb, items: [...(food.items || []), it] });
    if (fi.save) await savePresets([...presets, it]);
    setFi({ name: "", kcal: "", pro: "", fat: "", carb: "", save: false }); setShowFood(false); flash("Food logged");
  };
  const quickAdd = async (it) => {
    await saveFood({ kcal: food.kcal + it.kcal, pro: food.pro + it.pro, fat: food.fat + it.fat, carb: food.carb + it.carb, items: [...(food.items || []), it] });
    flash(`${it.name} logged`);
  };
  const delPreset = async (i) => { const arr = [...presets]; arr.splice(i, 1); await savePresets(arr); };

  const savePR = async () => {
    if (!prEdit || !prV) return;
    const v = parseFloat(prV); const cur = prs[prEdit]?.value || 0;
    await savePrs({ ...prs, [prEdit]: { value: v, prev: cur, date: selDate } });
    setPrEdit(null); setPrV(""); flash(v > cur ? "New PR 🔥" : "Logged");
  };

  const shiftCycle = async (n) => { await saveCycle({ ...cycle, offset: cycle.offset + n }); flash(n > 0 ? "Cycle shifted forward" : "Cycle shifted back"); };
  const pickDifferentDay = async (date, idx) => { await saveCycle({ ...cycle, slotOverride: { ...cycle.slotOverride, [date]: idx } }); flash("Today's slot updated"); };

  const setDayStatusReason = async (status, reason) => {
    await saveDayStatus({ status, reason: reason || null });
    setReasonPick(false); flash(`Marked ${DAY_STATUS[status].label}`);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const n = await importAll(file); flash(`Imported ${n} keys — reloading`); setTimeout(() => window.location.reload(), 1200); }
    catch { flash("⚠ Import failed — invalid file"); }
  };

  /* exercise override actions */
  const swapExercise = async (slotId, fromId, toId) => {
    const o = ovr[slotId] || {};
    const main = (o.main || cycleArr.find(s => s.id === slotId).main).map(id => id === fromId ? toId : id);
    await saveOvr({ ...ovr, [slotId]: { ...o, main } });
    setEditSlot(null); flash("Exercise swapped");
  };
  const removeExercise = async (slotId, exId) => {
    const o = ovr[slotId] || {};
    await saveOvr({ ...ovr, [slotId]: { ...o, removed: [...(o.removed || []), exId] } });
    flash("Removed from session");
  };
  const addCustomExercise = async (slotId, def) => {
    const id = `c_${Date.now()}`;
    await saveCustom({ ...custom, [id]: { n: def.n, mode: def.mode, lo: +def.lo || 0, hi: +def.hi || 0, t: def.note || "", hits: [def.cat] } });
    const o = ovr[slotId] || {};
    const main = [...(o.main || cycleArr.find(s => s.id === slotId).main), id];
    await saveOvr({ ...ovr, [slotId]: { ...o, main } });
    flash("Custom exercise added");
  };

  const soreMuscles = MUSCLES.filter(m => sore[m]);
  const todayHits = [...new Set(plan.main.flatMap(id => HITS[id] || []))];
  const conflicts = todayHits.filter(m => sore[m]);
  const rehabDone = REHAB.filter(r => rhab[r.id]).length;
  const loggedCount = plan.main.filter(id => (wlog[id] || []).length > 0).length;

  const Card = ({ children, style }) => <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, ...style }}>{children}</div>;
  const Eyebrow = ({ children }) => <div style={{ fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase", fontWeight: 700 }}>{children}</div>;
  const Tag = ({ label, color }) => <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color, background: color + "22", padding: "4px 9px", borderRadius: 5 }}>{label}</span>;
  const pct = (v, m) => `${Math.min(100, Math.round((v / m) * 100))}%`;
  const Bar = ({ v, m, c }) => <div style={{ height: 4, background: BORDER, borderRadius: 3, overflow: "hidden", marginTop: 5 }}><div style={{ width: pct(v, m), height: "100%", background: c, borderRadius: 3, transition: "width .4s" }} /></div>;
  const tfield = (props) => <input {...props} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 9, padding: "11px 12px", color: TEXT, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", ...props.style }} />;

  if (!ready) return <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: RED, fontSize: 11, letterSpacing: 5, fontWeight: 800 }}>LOADING</span></div>;

  const mColor = (m) => sore[m] ? RED : todayHits.includes(m) ? ORANGE + "AA" : "#34343C";
  const BodyMap = () => (
    <svg viewBox="0 0 200 300" style={{ width: "100%", maxWidth: 200, display: "block", margin: "0 auto" }}>
      <circle cx="100" cy="24" r="15" fill="#2A2A32" />
      <rect x="92" y="37" width="16" height="11" rx="4" fill="#2A2A32" />
      <ellipse cx="66" cy="60" rx="17" ry="12" fill={mColor("shoulders")} />
      <ellipse cx="134" cy="60" rx="17" ry="12" fill={mColor("shoulders")} />
      <path d="M78 54 H122 Q128 54 128 68 Q128 86 100 88 Q72 86 72 68 Q72 54 78 54 Z" fill={mColor("chest")} />
      <path d="M82 90 H118 L114 136 Q100 146 86 136 Z" fill={mColor("core")} />
      <rect x="48" y="66" width="15" height="40" rx="7" fill={mColor("biceps")} />
      <rect x="137" y="66" width="15" height="40" rx="7" fill={mColor("biceps")} />
      <rect x="46" y="108" width="13" height="38" rx="6" fill={mColor("forearms")} />
      <rect x="141" y="108" width="13" height="38" rx="6" fill={mColor("forearms")} />
      <path d="M84 146 Q100 152 116 146 L114 222 H104 L100 160 L96 222 H86 Z" fill={mColor("legs")} />
      <rect x="88" y="224" width="9" height="52" rx="4" fill="#2A2A32" />
      <rect x="103" y="224" width="9" height="52" rx="4" fill="#2A2A32" />
    </svg>
  );

  const DateNav = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
      <button onClick={() => setSelDate(addDays(selDate, -1))} style={navBtn}>‹</button>
      <div style={{ flex: 1, textAlign: "center", fontSize: 12.5, fontWeight: 700 }}>
        {selDate === tk ? "Today" : `${fmtW(selDate)} ${fmt(selDate)}`}
        {selDate !== tk && <span style={{ color: ORANGE, marginLeft: 6, fontSize: 10, fontWeight: 800 }}>BACK-DATED</span>}
      </div>
      <button onClick={() => setSelDate(addDays(selDate, 1))} disabled={selDate >= tk} style={{ ...navBtn, opacity: selDate >= tk ? .3 : 1 }}>›</button>
      {selDate !== tk && <button onClick={() => setSelDate(tk)} style={{ ...navBtn, width: "auto", padding: "0 10px", fontSize: 10.5 }}>Today</button>}
    </div>
  );

  return (
    <div style={{ background: BG, backgroundImage: DIAMOND, minHeight: "100vh", width: "100%", fontFamily: "'Inter Tight', system-ui, -apple-system, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 460, margin: "0 auto", paddingBottom: 84, position: "relative" }}>

        {toast && <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: RED, color: "#0A0A0A", fontSize: 12, fontWeight: 800, padding: "9px 20px", borderRadius: 22, zIndex: 100, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.5)" }}>{toast}</div>}
        {!storageOk && <div style={{ background: RED, color: "#0A0A0A", fontSize: 11.5, fontWeight: 700, padding: "9px 16px", textAlign: "center" }}>Storage isn't working in this browser — data won't be saved. Export won't help until this is fixed.</div>}

        {/* HEADER — Editorial direction: no italic, no gradient, solid TEXT color */}
        <div style={{ padding: "24px 20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.1, color: TEXT }}>{gr.g}</div>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {tab === "today" && <Tag label={tc.label} color={tc.c} />}
              <button onClick={() => setTab("settings")} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, width: 32, height: 32, color: MUTED, fontSize: 14, cursor: "pointer" }}>⚙</button>
            </div>
          </div>
          {tab === "today" && <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>{gr.sub}</div>}
        </div>

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 11 }}>

          {tab === "today" && <TodayTab {...{ verse, conflicts, soreMuscles, MUSCLES, MUSCLE_LABEL, saveSore, sore, BodyMap, Card, Eyebrow, Tag, plan: todayPlan, tc, EX, wlog: wlog, loggedCount: todayPlan.main.filter(id => (wlog[id] || []).length > 0).length, setTab, addons, saveAddon, ADDON_INFO, rehabDone, REHAB, rhab, saveRhab, sleep, saveSleep, pct, dayStatus, setReasonPick, reasonPick, setDayStatusReason, DAY_STATUS, SKIP_REASONS, cycle, shiftCycle, selDate, tk }} />}

          {tab === "week" && <WeekTab {...{ cycleArr, getEffectiveSlot, tk, slotIndexForDate, openWeek, setOpenWeek, EX, TTYPE, Tag, ADDON_INFO, pickDifferentDay, shiftCycle, cycle }} />}

          {tab === "log" && <LogTab {...{ DateNav, plan, EX, HITS, wlog, openEx, setOpenEx, si, setSi, addSet, delSet, flags, saveFlags, coachTarget, exHist, tc, tfield, Card, Tag, editSlot, setEditSlot, ovr, swapExercise, removeExercise, addCustomExercise, dayStatus, setReasonPick, reasonPick, setDayStatusReason, DAY_STATUS, SKIP_REASONS, MUTED, BORDER, SURF, CARD, RED, ORANGE, DIM, TEXT }} />}

          {tab === "stats" && <StatsTab {...{ Card, Eyebrow, prs, prEdit, setPrEdit, prV, setPrV, savePR, fmt, tfield, demo, setDemo, exHist, chartEx, setChartEx, EX, hist, REHAB }} />}

          {tab === "fuel" && <FuelTab {...{ DateNav, Card, Eyebrow, Bar, food, tgt, BLUE, ORANGE, RED, showFood, setShowFood, fi, setFi, addFood, tfield, presets, quickAdd, delPreset }} />}

          {tab === "track" && <TrackTab {...{ Card, Eyebrow, trackMonth, setTrackMonth, monthCells, DAY_STATUS, setSelDate, setTab, GREEN, ORANGE, PURPLE, DIM, BORDER, MUTED }} />}

          {tab === "settings" && <SettingsTab {...{ Card, Eyebrow, tfield, phase, savePhase, tgt, saveTgt, presets, delPreset, fileRef, handleImport, clearance, saveClearance, PLYO_STAGES, cycle, BORDER, SURF, MUTED, RED, ORANGE, GREEN, TEXT }} />}

        </div>

        {/* BOTTOM NAV */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 460, background: SURF, borderTop: `1px solid ${BORDER}`, display: "flex", zIndex: 50 }}>
          {[{ k: "today", l: "Today", i: "◆" }, { k: "week", l: "Week", i: "▦" }, { k: "log", l: "Log", i: "✎" }, { k: "track", l: "Track", i: "▣" }, { k: "stats", l: "Stats", i: "▲" }, { k: "fuel", l: "Fuel", i: "◉" }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, background: "none", border: "none", padding: "11px 0 9px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
              <span style={{ fontSize: 15, color: tab === t.k ? RED : DIM }}>{t.i}</span>
              <span style={{ fontSize: 8.5, letterSpacing: .5, fontWeight: tab === t.k ? 800 : 500, color: tab === t.k ? RED : DIM }}>{t.l.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const navBtn = { width: 30, height: 30, borderRadius: 8, border: `1px solid ${BORDER}`, background: SURF, color: TEXT, fontSize: 15, cursor: "pointer" };
