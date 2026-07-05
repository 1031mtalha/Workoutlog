import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────  TOKENS  ───────────────────────── */
const BG     = "#08080A";
const SURF   = "#141417";
const CARD   = "#1A1A1E";
const CARD2  = "#202026";
const BORDER = "#2A2A30";
const RED    = "#FF4D4D";   // primary accent
const ORANGE = "#FF7A45";   // secondary / gradient
const GREEN  = "#4ADE80";   // success / streaks only
const BLUE   = "#5AA9FF";   // pull
const PURPLE = "#B57BFF";   // core / kendo
const TEXT   = "#F2EFEA";   // primary text (readable)
const MUTED  = "#9A9AA2";   // muted but legible
const DIM    = "#62626A";   // least important, still readable

const DIAMOND = "repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 15px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 15px)";

const TTYPE = {
  pull: { c: BLUE,   label: "PULL"  },
  push: { c: RED,    label: "PUSH"  },
  legs: { c: ORANGE, label: "LEGS"  },
  core: { c: PURPLE, label: "CORE"  },
  power:{ c: ORANGE, label: "POWER" },
  rest: { c: DIM,    label: "REST"  },
};

/* ─────────────────────────  PLAN DATA  ───────────────────────── */
const EX = {
  // PULL
  full_pu:   { n:"Pull-ups (or negatives)", mode:"bw",   lo:3,  hi:8,  t:"3 sets · 5s descent if negatives" },
  inv_row:   { n:"Inverted Rows",           mode:"bw",   lo:10, hi:15, t:"3 sets · feet elevated to progress" },
  sa_row:    { n:"Single-Arm DB Row",       mode:"load", lo:8,  hi:12, t:"3 sets each arm · stack to 30lb" },
  cs_row:    { n:"Chest-Supported Row",     mode:"load", lo:10, hi:12, t:"3 sets · chest on bench" },
  rev_fly:   { n:"Reverse Flys",            mode:"load", lo:12, hi:15, t:"3 sets · strict, rear delt only" },
  hammer:    { n:"Hammer Curls",            mode:"load", lo:10, hi:12, t:"2 sets · 15lb" },
  pu_max:    { n:"Pull-up Max Test",        mode:"bw",   lo:1,  hi:20, t:"3 sets to near-failure · PR", pr:true },
  sup_row:   { n:"Supinated Row",           mode:"load", lo:10, hi:12, t:"3 sets · underhand grip" },
  reg_curl:  { n:"Regular Curls",           mode:"load", lo:10, hi:12, t:"3 sets · 15lb" },
  conc_curl: { n:"Concentration Curls",     mode:"load", lo:8,  hi:10, t:"2 sets each · 15lb" },
  dead_hang: { n:"Dead Hang",               mode:"time", lo:20, hi:60, t:"2 sets · max time · PR", pr:true },
  // PUSH
  exp_pu:    { n:"Explosive Push-ups",      mode:"bw",   lo:6,  hi:10, t:"4 sets · fast up, 3s down" },
  pike_pu:   { n:"Pike Push-ups",           mode:"bw",   lo:8,  hi:12, t:"3 sets · hips high" },
  dips:      { n:"Dips (Bullbar)",          mode:"bw",   lo:3,  hi:12, t:"3 sets · bench dips if needed" },
  oh_tri:    { n:"Overhead Tricep Ext.",    mode:"load", lo:10, hi:12, t:"3 sets · 15lb · elbows in" },
  lat_raise: { n:"Lateral Raises",          mode:"load", lo:12, hi:15, t:"3 sets · 15lb · controlled down" },
  vest_pu:   { n:"Weighted Push-ups",       mode:"bw",   lo:8,  hi:12, t:"4 sets · 12lb vest" },
  dec_pu:    { n:"Decline Push-ups",        mode:"bw",   lo:10, hi:15, t:"3 sets · feet on bench" },
  skull:     { n:"Skull Crushers",          mode:"load", lo:8,  hi:12, t:"3 sets · 15lb · elbows fixed" },
  arnold:    { n:"Arnold Press",            mode:"load", lo:8,  hi:10, t:"3 sets · 15lb · full rotation" },
  // LEGS
  goblet:    { n:"Goblet / Vest Squats",    mode:"load", lo:10, hi:15, t:"3 sets · 15lb or 12lb vest" },
  bss:       { n:"Bulgarian Split Squat",   mode:"load", lo:8,  hi:12, t:"3 sets each leg" },
  glute_br:  { n:"Glute Bridges",           mode:"bw",   lo:12, hi:20, t:"3 sets · squeeze at top" },
  calf:      { n:"Wedge Calf Raises",       mode:"bw",   lo:12, hi:20, t:"3 sets · pain-free range only" },
  leg_ext:   { n:"Leg Extensions",          mode:"load", lo:10, hi:15, t:"3 sets · bench machine" },
  // POWER (shin-safe)
  clap_pu:   { n:"Plyo / Clap Push-ups",    mode:"bw",   lo:5,  hi:10, t:"4 sets · max power per rep" },
  db_throw:  { n:"DB Explosive Press",      mode:"load", lo:6,  hi:10, t:"3 sets · accelerate hard" },
  step_up:   { n:"Step-ups (controlled)",   mode:"load", lo:10, hi:12, t:"3 sets each · no jumping" },
  // CORE
  plank:     { n:"Plank",                   mode:"time", lo:45, hi:90, t:"3 sets · no sag" },
  hollow:    { n:"Hollow Body Hold",        mode:"time", lo:20, hi:45, t:"3 sets · lower back down" },
  dead_bug:  { n:"Dead Bug",                mode:"bw",   lo:8,  hi:12, t:"3 sets each side" },
  bicycle:   { n:"Bicycle Crunches",        mode:"bw",   lo:15, hi:25, t:"3 sets · controlled" },
  leg_raise: { n:"Hanging Leg Raises",      mode:"bw",   lo:8,  hi:15, t:"3 sets · no swing" },
};

const HITS = {
  full_pu:["back","biceps"], inv_row:["back","biceps"], sa_row:["back","biceps"], cs_row:["back","biceps"],
  rev_fly:["shoulders"], hammer:["biceps"], pu_max:["back","biceps"], sup_row:["back","biceps"],
  reg_curl:["biceps"], conc_curl:["biceps"], dead_hang:["forearms"],
  exp_pu:["chest","triceps","shoulders"], pike_pu:["shoulders","triceps"], dips:["chest","triceps"],
  oh_tri:["triceps"], lat_raise:["shoulders"], vest_pu:["chest","triceps"], dec_pu:["chest","triceps"],
  skull:["triceps"], arnold:["shoulders","triceps"],
  goblet:["legs"], bss:["legs"], glute_br:["legs"], calf:["legs"], leg_ext:["legs"],
  clap_pu:["chest","triceps","shoulders"], db_throw:["shoulders","chest"], step_up:["legs"],
  plank:["core"], hollow:["core"], dead_bug:["core"], bicycle:["core"], leg_raise:["core"],
};

// 0=Sun ... 6=Sat
const WEEK = {
  1: { name:"Pull A",        type:"pull", main:["full_pu","inv_row","sa_row","cs_row","rev_fly","hammer","dead_hang"], addons:["rehab","suburi"] },
  2: { name:"Push A",        type:"push", main:["exp_pu","pike_pu","dips","oh_tri","lat_raise"],                       addons:["rehab","bikehiit"] },
  3: { name:"Legs + Core",   type:"legs", main:["goblet","bss","glute_br","calf","leg_ext","plank","hollow","dead_bug"], addons:["rehab"] },
  4: { name:"Pull B",        type:"pull", main:["pu_max","sup_row","sa_row","rev_fly","reg_curl","conc_curl","dead_hang"], addons:["rehab","suburi"] },
  5: { name:"Push B",        type:"push", main:["vest_pu","dec_pu","dips","skull","arnold"],                          addons:["rehab","bikehiit"] },
  6: { name:"Power + Legs",  type:"power",main:["clap_pu","db_throw","bss","step_up","glute_br","hollow","leg_raise"], addons:["rehab"] },
  0: { name:"Rest",          type:"rest", main:[],                                                                    addons:["rehab","suburi_light"] },
};

const ADDON_INFO = {
  rehab:       { n:"MTSS Rehab",   c:RED,    sub:"Daily · non-negotiable" },
  suburi:      { n:"Kendo Suburi", c:PURPLE, sub:"Skill maintenance · ~15 min" },
  suburi_light:{ n:"Light Suburi", c:PURPLE, sub:"Easy skill work · optional" },
  bikehiit:    { n:"Bike HIIT",    c:ORANGE, sub:"6 × 30s hard / 90s easy" },
};

const REHAB = [
  { id:"arch", n:"Short-foot / Arch Raises", d:"3×10 each foot" },
  { id:"calf", n:"Single-leg Calf Raises",   d:"3×15 each foot" },
  { id:"tib",  n:"Tibialis Raises",          d:"3×20 (toes up, heel down)" },
  { id:"str",  n:"Seated Calf Stretch",      d:"60s each side" },
];

const MUSCLES = ["chest","shoulders","back","biceps","triceps","forearms","core","legs"];
const MUSCLE_LABEL = { chest:"Chest", shoulders:"Shoulders", back:"Back", biceps:"Biceps", triceps:"Triceps", forearms:"Forearms", core:"Core", legs:"Legs" };

const TGT = { kcal:2800, pro:165, fat:70, carb:375 };

const QURAN = [
  // ── original 15 ──
  { a:"For indeed, with hardship comes ease.",                             r:"94:5" },
  { a:"Allah does not burden a soul beyond what it can bear.",             r:"2:286" },
  { a:"Indeed, Allah is with the patient.",                                r:"2:153" },
  { a:"And whoever relies upon Allah — then He is sufficient for him.",     r:"65:3" },
  { a:"There is not for man except that for which he strives.",            r:"53:39" },
  { a:"Those who strive for Us — We will surely guide them to Our ways.",   r:"29:69" },
  { a:"If you are grateful, I will surely increase you.",                   r:"14:7" },
  { a:"So when you have finished, then stand up and strive on.",           r:"94:7" },
  { a:"My Lord, increase me in knowledge.",                                r:"20:114" },
  { a:"Do not weaken, nor grieve — you will prevail if you are faithful.",  r:"3:139" },
  { a:"The patient will be given their reward without measure.",           r:"39:10" },
  { a:"Indeed, Allah loves those who put their trust in Him.",             r:"3:159" },
  { a:"And He found you lost and guided you.",                             r:"93:7" },
  { a:"Indeed, my Lord is near and responsive.",                           r:"11:61" },
  { a:"And it may be that you dislike a thing which is good for you.",      r:"2:216" },
  // ── added 15 (9 verified vs Quran.com this build; 6 standard Sahih wording) ──
  { a:"Allah will not change the condition of a people until they change what is in themselves.", r:"13:11" },
  { a:"And do not pursue that of which you have no knowledge.",            r:"17:36" },
  { a:"Allah will raise those who believe and those given knowledge, by degrees.", r:"58:11" },
  { a:"Do not despair of the mercy of Allah.",                            r:"39:53" },
  { a:"Call upon Me; I will respond to you.",                             r:"40:60" },
  { a:"By the remembrance of Allah, hearts are assured.",                 r:"13:28" },
  { a:"Indeed, with hardship comes ease.",                                r:"94:6" },
  { a:"The servants of the Most Merciful walk upon the earth humbly.",     r:"25:63" },
  { a:"The most noble of you before Allah is the most righteous of you.",  r:"49:13" },
  { a:"And be patient. Indeed, Allah is with the patient.",               r:"8:46" },
  { a:"And seek help through patience and prayer.",                       r:"2:45" },
  { a:"Indeed, Allah is with those who fear Him and who do good.",         r:"16:128" },
  { a:"Persevere, endure, and remain steadfast — and be mindful of Allah.", r:"3:200" },
  { a:"So remember Me; I will remember you.",                             r:"2:152" },
  { a:"If you support Allah, He will support you and make your footing firm.", r:"47:7" },
];

/* ─────────────────────────  HELPERS  ───────────────────────── */
const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
};
const dayOfYear = () => { const n=new Date(); const s=new Date(n.getFullYear(),0,0); return Math.floor((n-s)/86400000); };
const fmt = (k) => new Date(k+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const fmtW = (k) => new Date(k+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"});

const greeting = () => {
  const h = new Date().getHours();
  if (h>=5  && h<11) return { g:"Good Morning", sub:"Fuel up. Read your verse. Start clean." };
  if (h>=11 && h<17) return { g:"Good Afternoon", sub:"Primetime. Get the session in." };
  if (h>=17 && h<21) return { g:"Good Evening", sub:"Wind-down window. Log what's left." };
  return { g:"Good Night", sub:"Sleep is where you grow. Protect it." };
};

const est1RM = (reps, wt) => { const w=parseFloat(wt)||0; const r=parseFloat(reps)||0; return w>0?Math.round(w*(1+r/30)):r; };

/* ── Persistence layer ──────────────────────────────────────────
   Uses the browser's localStorage. Works in any normal web app
   (GitHub Pages, Vercel, Netlify, local dev). Kept async so the
   rest of the app doesn't need to change. Data is per-browser,
   per-device — to sync across devices, swap these three functions
   for a backend (e.g. Supabase) and keep the same signatures.        */
const sg = async (k, fb) => {
  try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); }
  catch { return fb; }
};
const ss = async (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};
const slist = async (prefix) => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    return keys;
  } catch { return []; }
};

function coachTarget(exId, hist) {
  const e = EX[exId]; if (!e) return null;
  if (!hist.length) return e.mode==="time" ? `Start at ${e.lo}s` : `Start at ${e.lo} reps`;
  const last = hist[hist.length-1];
  const reps = parseFloat(last.reps)||0;
  if (e.mode==="time") { const t=parseFloat(last.reps)||0; return `Beat ${t}s`; }
  if (e.mode==="bw") { if (reps>=e.hi) return `${reps+1} reps — push the ceiling`; return `${reps+1} reps (was ${reps})`; }
  if (reps>=e.hi) return `Add weight, drop to ${e.lo} reps`;
  return `${last.wt} × ${reps+1} reps`;
}

/* ─────────────────────────  SHARED UI  ─────────────────────────
   Defined at module scope (not inside App) so they keep a stable
   identity across renders. Defining these inside a component body
   recreates them on every render, which makes React treat them as
   new component types and remount their children — e.g. an <input>
   nested inside would lose focus (and the on-screen keyboard would
   close) after every keystroke.                                     */
const Card = ({children,style}) => <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,padding:16,...style}}>{children}</div>;
const Eyebrow = ({children}) => <div style={{fontSize:10,letterSpacing:2,color:MUTED,textTransform:"uppercase",fontWeight:700}}>{children}</div>;
const Tag = ({label,color}) => <span style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color,background:color+"22",padding:"4px 9px",borderRadius:5}}>{label}</span>;
const pct = (v,m)=>`${Math.min(100,Math.round((v/m)*100))}%`;
const Bar = ({v,m,c}) => <div style={{height:4,background:BORDER,borderRadius:3,overflow:"hidden",marginTop:5}}><div style={{width:pct(v,m),height:"100%",background:c,borderRadius:3,transition:"width .4s"}}/></div>;
const tfield = (props) => <input {...props} style={{background:SURF,border:`1px solid ${BORDER}`,borderRadius:9,padding:"11px 12px",color:TEXT,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",...props.style}}/>;

/* ─────────────────────────  COMPONENT  ───────────────────────── */
export default function App() {
  const [tab, setTab] = useState("today");
  const [ready, setReady] = useState(false);
  const tk = todayKey();
  const dow = new Date().getDay();
  const plan = WEEK[dow];
  const tc = TTYPE[plan.type];
  const gr = greeting();
  const verse = QURAN[dayOfYear() % QURAN.length];

  const [wlog, setWlog]   = useState({});
  const [food, setFood]   = useState({ kcal:0, pro:0, fat:0, carb:0, items:[] });
  const [sleep, setSleep] = useState(null);
  const [rhab, setRhab]   = useState({});
  const [sore, setSore]   = useState({});
  const [addons, setAddons] = useState({});
  const [prs, setPrs]     = useState({});
  const [flags, setFlags] = useState({});
  const [hist, setHist]   = useState([]);
  const [exHist, setExHist] = useState({});

  const [openEx, setOpenEx] = useState(null);
  const [si, setSi] = useState({ reps:"", wt:"" });
  const [showFood, setShowFood] = useState(false);
  const [fi, setFi] = useState({ name:"", kcal:"", pro:"", fat:"", carb:"" });
  const [prEdit, setPrEdit] = useState(null);
  const [prV, setPrV] = useState("");
  const [chartEx, setChartEx] = useState(null);
  const [demo, setDemo] = useState(false);
  const [toast, setToast] = useState("");
  const [openWeek, setOpenWeek] = useState(dow);

  const flash = (m) => { setToast(m); setTimeout(()=>setToast(""),1800); };

  useEffect(() => { (async () => {
    const [w,f,s,r,so,ad,p,fl] = await Promise.all([
      sg(`wl_${tk}`,{}), sg(`fd_${tk}`,{kcal:0,pro:0,fat:0,carb:0,items:[]}),
      sg(`sl_${tk}`,null), sg(`rh_${tk}`,{}), sg(`so_${tk}`,{}), sg(`ad_${tk}`,{}),
      sg("prs_v3",{}), sg(`fg_${tk}`,{}),
    ]);
    setWlog(w); setFood(f); setSleep(s); setRhab(r); setSore(so); setAddons(ad); setPrs(p); setFlags(fl);
    setReady(true);
  })(); }, []);

  const loadHistory = useCallback(async () => {
    const keys = await slist("wl_");
    const dates = keys.map(k=>k.replace("wl_","")).sort().slice(-30);
    const rows = []; const exMap = {};
    for (const d of dates) {
      const [w, r, f] = await Promise.all([ sg(`wl_${d}`,{}), sg(`rh_${d}`,{}), sg(`fd_${d}`,{kcal:0}) ]);
      let vol = 0, sets = 0;
      Object.entries(w).forEach(([exId, arr]) => {
        arr.forEach(s => {
          sets++;
          const reps=parseFloat(s.reps)||0; const wt=parseFloat(s.wt)||0;
          vol += wt>0 ? reps*wt : reps;
          (exMap[exId]=exMap[exId]||[]).push({ date:d, reps:s.reps, wt:s.wt });
        });
      });
      const rDone = REHAB.filter(x=>r[x.id]).length;
      rows.push({ date:d, vol:Math.round(vol), sets, rehab:rDone, kcal:Math.round(f.kcal||0) });
    }
    setHist(rows); setExHist(exMap);
    const exs = Object.keys(exMap);
    if (exs.length && !chartEx) setChartEx(exs.includes("pu_max")?"pu_max":exs[0]);
  }, [chartEx]);

  useEffect(() => { if (tab==="stats" && ready) loadHistory(); }, [tab, ready, loadHistory]);

  const saveWlog  = async v => { setWlog(v);  await ss(`wl_${tk}`,v); };
  const saveFood  = async v => { setFood(v);  await ss(`fd_${tk}`,v); };
  const saveSleep = async v => { setSleep(v); await ss(`sl_${tk}`,v); };
  const saveRhab  = async v => { setRhab(v);  await ss(`rh_${tk}`,v); };
  const saveSore  = async v => { setSore(v);  await ss(`so_${tk}`,v); };
  const saveAddon = async v => { setAddons(v);await ss(`ad_${tk}`,v); };
  const savePrs   = async v => { setPrs(v);   await ss("prs_v3",v); };
  const saveFlags = async v => { setFlags(v); await ss(`fg_${tk}`,v); };

  const addSet = async () => {
    if (!si.reps || !openEx) return;
    await saveWlog({ ...wlog, [openEx]: [...(wlog[openEx]||[]), { reps:si.reps, wt:si.wt||"BW" }] });
    setSi({ reps:"", wt:"" }); flash("Set logged");
  };
  const delSet = async (exId, i) => { const arr=[...(wlog[exId]||[])]; arr.splice(i,1); await saveWlog({...wlog,[exId]:arr}); };
  const addFood = async () => {
    if (!fi.name) return;
    const it = { name:fi.name, kcal:+fi.kcal||0, pro:+fi.pro||0, fat:+fi.fat||0, carb:+fi.carb||0 };
    await saveFood({ kcal:food.kcal+it.kcal, pro:food.pro+it.pro, fat:food.fat+it.fat, carb:food.carb+it.carb, items:[...(food.items||[]),it] });
    setFi({ name:"", kcal:"", pro:"", fat:"", carb:"" }); setShowFood(false); flash("Food logged");
  };
  const savePR = async () => {
    if (!prEdit || !prV) return;
    const v=parseFloat(prV); const cur=prs[prEdit]?.value||0;
    await savePrs({ ...prs, [prEdit]:{ value:v, prev:cur, date:tk } });
    setPrEdit(null); setPrV(""); flash(v>cur?"New PR 🔥":"Logged");
  };

  const soreMuscles = MUSCLES.filter(m=>sore[m]);
  const todayHits = [...new Set(plan.main.flatMap(id=>HITS[id]||[]))];
  const conflicts = todayHits.filter(m=>sore[m]);
  const rehabDone = REHAB.filter(r=>rhab[r.id]).length;
  const loggedCount = plan.main.filter(id=>(wlog[id]||[]).length>0).length;

  if (!ready) return <div style={{background:BG,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:RED,fontSize:11,letterSpacing:5,fontWeight:800}}>LOADING</span></div>;

  const mColor = (m) => sore[m] ? RED : todayHits.includes(m) ? ORANGE+"AA" : "#34343C";
  const BodyMap = () => (
    <svg viewBox="0 0 200 300" style={{width:"100%",maxWidth:200,display:"block",margin:"0 auto"}}>
      <circle cx="100" cy="24" r="15" fill="#2A2A32"/>
      <rect x="92" y="37" width="16" height="11" rx="4" fill="#2A2A32"/>
      <ellipse cx="66" cy="60" rx="17" ry="12" fill={mColor("shoulders")}/>
      <ellipse cx="134" cy="60" rx="17" ry="12" fill={mColor("shoulders")}/>
      <path d="M78 54 H122 Q128 54 128 68 Q128 86 100 88 Q72 86 72 68 Q72 54 78 54 Z" fill={mColor("chest")}/>
      <path d="M82 90 H118 L114 136 Q100 146 86 136 Z" fill={mColor("core")}/>
      <rect x="48" y="66" width="15" height="40" rx="7" fill={mColor("biceps")}/>
      <rect x="137" y="66" width="15" height="40" rx="7" fill={mColor("biceps")}/>
      <rect x="46" y="108" width="13" height="38" rx="6" fill={mColor("forearms")}/>
      <rect x="141" y="108" width="13" height="38" rx="6" fill={mColor("forearms")}/>
      <path d="M84 146 Q100 152 116 146 L114 222 H104 L100 160 L96 222 H86 Z" fill={mColor("legs")}/>
      <rect x="88" y="224" width="9" height="52" rx="4" fill="#2A2A32"/>
      <rect x="103" y="224" width="9" height="52" rx="4" fill="#2A2A32"/>
    </svg>
  );

  return (
    <div style={{background:BG,backgroundImage:DIAMOND,minHeight:"100vh",width:"100%",fontFamily:"system-ui,-apple-system,sans-serif",color:TEXT}}>
      <div style={{maxWidth:460,margin:"0 auto",paddingBottom:84,position:"relative"}}>

        {toast && <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:RED,color:"#0A0A0A",fontSize:12,fontWeight:800,padding:"9px 20px",borderRadius:22,zIndex:100,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.5)"}}>{toast}</div>}

        {/* HEADER */}
        <div style={{padding:"24px 20px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:11,letterSpacing:1,color:MUTED,marginBottom:4}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
              <div style={{fontSize:27,fontWeight:800,letterSpacing:-.6,lineHeight:1,fontStyle:"italic",background:`linear-gradient(100deg,${TEXT},${ORANGE})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{gr.g.toUpperCase()}</div>
            </div>
            {tab==="today" && <Tag label={tc.label} color={tc.c}/>}
          </div>
          {tab==="today" && <div style={{fontSize:12,color:MUTED,marginTop:6}}>{gr.sub}</div>}
        </div>

        <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:11}}>

          {/* ───── TODAY ───── */}
          {tab==="today" && <>
            <div style={{background:`linear-gradient(135deg,${CARD},${SURF})`,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${ORANGE}`,borderRadius:14,padding:"16px 18px"}}>
              <Eyebrow>Verse of the Day</Eyebrow>
              <div style={{fontSize:16,lineHeight:1.55,marginTop:9,fontWeight:500}}>"{verse.a}"</div>
              <div style={{fontSize:12,color:ORANGE,marginTop:8,fontWeight:700,letterSpacing:.5}}>Qur'an {verse.r}</div>
            </div>

            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <Eyebrow>Readiness Check</Eyebrow>
                <span style={{fontSize:11,color:conflicts.length?RED:GREEN,fontWeight:700}}>{conflicts.length?`⚠ ${conflicts.length} conflict`:soreMuscles.length?`${soreMuscles.length} sore`:"All fresh"}</span>
              </div>
              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                <div style={{width:88,flexShrink:0}}><BodyMap/></div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:MUTED,marginBottom:9}}>Tap what's sore today:</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {MUSCLES.map(m=>(
                      <button key={m} onClick={()=>saveSore({...sore,[m]:!sore[m]})} style={{padding:"6px 10px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${sore[m]?RED:BORDER}`,background:sore[m]?RED+"22":SURF,color:sore[m]?RED:MUTED}}>{MUSCLE_LABEL[m]}</button>
                    ))}
                  </div>
                </div>
              </div>
              {conflicts.length>0 && <div style={{marginTop:14,background:RED+"14",border:`1px solid ${RED}40`,borderRadius:10,padding:"11px 13px",fontSize:12.5,lineHeight:1.55,color:TEXT}}>Today's <b>{plan.name}</b> loads {conflicts.map(c=>MUSCLE_LABEL[c]).join(", ")} — still sore. Swap to a session that avoids it, drop the volume, or give it another rest day. Pushing through 3-day DOMS just extends it.</div>}
            </Card>

            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <Eyebrow>Today · {plan.name}</Eyebrow>
                {plan.type!=="rest" && <span style={{fontSize:11,color:tc.c,fontWeight:700}}>{loggedCount}/{plan.main.length}</span>}
              </div>
              {plan.type==="rest"
                ? <div style={{fontSize:14,color:MUTED,padding:"6px 0",lineHeight:1.5}}>Full rest. Keep rehab and light suburi below — nothing heavy. Recovery is when the work pays off.</div>
                : <>
                    <div style={{height:3,background:BORDER,borderRadius:3,marginBottom:14,overflow:"hidden"}}><div style={{width:pct(loggedCount,plan.main.length),height:"100%",background:tc.c,transition:"width .4s"}}/></div>
                    {plan.main.slice(0,5).map(id=>{const done=(wlog[id]||[]).length;return(
                      <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${BORDER}`}}>
                        <div><div style={{fontSize:13,fontWeight:600}}>{EX[id].n}</div><div style={{fontSize:10.5,color:MUTED,marginTop:1}}>{EX[id].t}</div></div>
                        <div style={{fontSize:14,fontWeight:800,color:done?tc.c:DIM}}>{done?`${done}×`:"—"}</div>
                      </div>);})}
                    {plan.main.length>5 && <div style={{fontSize:11,color:MUTED,paddingTop:9}}>+{plan.main.length-5} more in the log</div>}
                    <button onClick={()=>setTab("log")} style={{marginTop:13,width:"100%",background:`linear-gradient(100deg,${tc.c}26,${tc.c}14)`,border:`1px solid ${tc.c}55`,borderRadius:9,padding:12,color:tc.c,fontSize:12,fontWeight:800,letterSpacing:1,cursor:"pointer",fontFamily:"inherit"}}>OPEN LOG →</button>
                  </>}
            </Card>

            <Card>
              <Eyebrow>Daily Add-ons</Eyebrow>
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:9}}>
                {plan.addons.map(a=>{
                  const info=ADDON_INFO[a]; const done=addons[a];
                  if (a==="rehab") return (
                    <div key={a} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:SURF,border:`1px solid ${rehabDone===REHAB.length?GREEN+"55":BORDER}`,borderRadius:10,padding:"11px 13px"}}>
                      <div><div style={{fontSize:13,fontWeight:700,color:info.c}}>{info.n}</div><div style={{fontSize:10.5,color:MUTED}}>{info.sub}</div></div>
                      <div style={{fontSize:13,fontWeight:800,color:rehabDone===REHAB.length?GREEN:MUTED}}>{rehabDone}/{REHAB.length}</div>
                    </div>);
                  return (
                    <div key={a} onClick={()=>saveAddon({...addons,[a]:!done})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:SURF,border:`1px solid ${done?info.c+"55":BORDER}`,borderRadius:10,padding:"11px 13px",cursor:"pointer"}}>
                      <div><div style={{fontSize:13,fontWeight:700,color:info.c}}>{info.n}</div><div style={{fontSize:10.5,color:MUTED}}>{info.sub}</div></div>
                      <div style={{width:24,height:24,borderRadius:7,border:`1.5px solid ${done?info.c:BORDER}`,background:done?info.c+"22":"none",display:"flex",alignItems:"center",justifyContent:"center"}}>{done&&<span style={{color:info.c,fontSize:14}}>✓</span>}</div>
                    </div>);
                })}
                <div onClick={()=>saveAddon({...addons,mbike:!addons.mbike})} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:SURF,border:`1px solid ${addons.mbike?ORANGE+"55":BORDER}`,borderRadius:10,padding:"11px 13px",cursor:"pointer"}}>
                  <div><div style={{fontSize:13,fontWeight:700,color:ORANGE}}>Morning Easy Bike</div><div style={{fontSize:10.5,color:MUTED}}>20–25 min Zone 2 · not HIIT</div></div>
                  <div style={{width:24,height:24,borderRadius:7,border:`1.5px solid ${addons.mbike?ORANGE:BORDER}`,background:addons.mbike?ORANGE+"22":"none",display:"flex",alignItems:"center",justifyContent:"center"}}>{addons.mbike&&<span style={{color:ORANGE,fontSize:14}}>✓</span>}</div>
                </div>
              </div>
            </Card>

            <Card style={{borderLeft:`3px solid ${RED}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <Eyebrow>MTSS Rehab — Every Day</Eyebrow>
                <span style={{fontSize:14,fontWeight:800,color:rehabDone===REHAB.length?GREEN:TEXT}}>{rehabDone}/{REHAB.length}</span>
              </div>
              <div style={{fontSize:11.5,color:MUTED,lineHeight:1.5,marginBottom:10}}>Fixes the flat-foot mechanics, not just the pain. The gate to kendo and Muay Thai.</div>
              {REHAB.map((r,i)=>(
                <div key={r.id} onClick={()=>saveRhab({...rhab,[r.id]:!rhab[r.id]})} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<REHAB.length-1?`1px solid ${BORDER}`:"none",cursor:"pointer"}}>
                  <div style={{width:24,height:24,borderRadius:7,border:`1.5px solid ${rhab[r.id]?GREEN:BORDER}`,background:rhab[r.id]?GREEN+"22":"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{rhab[r.id]&&<span style={{color:GREEN,fontSize:14}}>✓</span>}</div>
                  <div><div style={{fontSize:13,fontWeight:600,color:rhab[r.id]?MUTED:TEXT,textDecoration:rhab[r.id]?"line-through":"none"}}>{r.n}</div><div style={{fontSize:10.5,color:MUTED}}>{r.d}</div></div>
                </div>
              ))}
            </Card>

            <Card>
              <Eyebrow>Sleep Last Night</Eyebrow>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"12px 0 0"}}>
                {[5,5.5,6,6.5,7,7.5,8,8.5,9].map(h=>(
                  <button key={h} onClick={()=>saveSleep(h)} style={{padding:"8px 11px",borderRadius:8,border:`1px solid ${sleep===h?ORANGE:BORDER}`,background:sleep===h?ORANGE+"22":SURF,color:sleep===h?ORANGE:MUTED,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{h}h</button>
                ))}
              </div>
              {sleep && <div style={{marginTop:11,fontSize:12.5,fontWeight:600,color:sleep>=8?GREEN:sleep>=7?TEXT:RED}}>{sleep>=8?"✓ Optimal for recovery and growth":sleep>=7?"Decent — aim for 8h":"⚠ Low — recovery, protein synthesis, and growth all take the hit"}</div>}
            </Card>
          </>}

          {/* ───── WEEK ───── */}
          {tab==="week" && <>
            <div style={{fontSize:13,color:MUTED,lineHeight:1.55,padding:"2px 2px 4px"}}>Push / Pull / Legs core split. Kendo, bike, and rehab layer on top. Tap any day for the full session.</div>
            {[1,2,3,4,5,6,0].map(d=>{
              const p=WEEK[d]; const t=TTYPE[p.type]; const isToday=d===dow; const open=openWeek===d;
              return (
                <div key={d}>
                  <div onClick={()=>setOpenWeek(open?-1:d)} style={{background:isToday?CARD2:CARD,border:`1px solid ${isToday?t.c+"66":BORDER}`,borderRadius:open?"14px 14px 0 0":14,padding:"13px 15px",cursor:"pointer",display:"flex",alignItems:"center",gap:13}}>
                    <div style={{width:42,height:42,borderRadius:9,border:`1px solid ${t.c}55`,background:BG,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:11,fontWeight:800,color:t.c}}>{["SUN","MON","TUE","WED","THU","FRI","SAT"][d]}</span></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14.5,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>{p.name}{isToday&&<span style={{fontSize:9,color:t.c,fontWeight:800,letterSpacing:1}}>TODAY</span>}</div>
                      <div style={{fontSize:10.5,color:MUTED,marginTop:2}}>{p.addons.map(a=>ADDON_INFO[a]?.n).filter(Boolean).join(" · ")||"recovery"}</div>
                    </div>
                    <Tag label={t.label} color={t.c}/>
                  </div>
                  {open && (
                    <div style={{background:SURF,border:`1px solid ${t.c}66`,borderTop:"none",borderRadius:"0 0 14px 14px",padding:"6px 15px 14px"}}>
                      {p.main.length===0 && <div style={{fontSize:13,color:MUTED,padding:"10px 0"}}>No lifting. Rehab + light suburi only.</div>}
                      {p.main.map((id,i)=>(
                        <div key={id} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<p.main.length-1?`1px solid ${BORDER}`:"none"}}>
                          <span style={{fontSize:13,fontWeight:600}}>{EX[id].n}</span>
                          <span style={{fontSize:11.5,color:MUTED,textAlign:"right",maxWidth:140}}>{EX[id].t.split("·")[0]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>}

          {/* ───── LOG ───── */}
          {tab==="log" && <>
            {plan.type==="rest"
              ? <Card style={{textAlign:"center",padding:"34px 16px"}}><div style={{fontSize:13,color:MUTED,lineHeight:1.6}}>Rest day — no lifting to log. Do rehab and light suburi from the Today tab.</div></Card>
              : plan.main.map(id=>{
                  const e=EX[id]; const sets=wlog[id]||[]; const open=openEx===id; const isFl=flags[id];
                  const coach=coachTarget(id,(exHist[id]||[]).map(h=>({reps:h.reps,wt:h.wt})).concat(sets.map(s=>({reps:s.reps,wt:s.wt}))));
                  return (
                    <div key={id}>
                      <div onClick={()=>{setOpenEx(open?null:id);setSi({reps:"",wt:""});}} style={{background:CARD,border:`1px solid ${open?tc.c+"80":BORDER}`,borderRadius:open?"14px 14px 0 0":14,padding:"13px 15px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14,fontWeight:600}}>{e.n}</span>{isFl&&<span style={{color:RED,fontSize:12}}>⚑</span>}{e.pr&&<Tag label="PR" color={RED}/>}</div>
                          <div style={{fontSize:10.5,color:MUTED,marginTop:2}}>{e.t}</div>
                        </div>
                        <div style={{textAlign:"right",marginLeft:12}}><div style={{fontSize:21,fontWeight:800,color:sets.length?tc.c:DIM,lineHeight:1}}>{sets.length}</div><div style={{fontSize:9,color:MUTED,letterSpacing:1}}>SETS</div></div>
                      </div>
                      {open && (
                        <div style={{background:SURF,border:`1px solid ${tc.c}80`,borderTop:"none",borderRadius:"0 0 14px 14px",padding:14}}>
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12,fontSize:11.5}}><span style={{color:tc.c,fontWeight:800,letterSpacing:.5}}>↗ NEXT TARGET</span><span style={{color:TEXT,fontWeight:600}}>{coach}</span></div>
                          {sets.map((s,i)=>(
                            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                              <span style={{fontSize:10,color:MUTED,fontWeight:700,width:16}}>{i+1}</span>
                              <span style={{fontSize:16,fontWeight:800,color:tc.c}}>{s.reps}</span>
                              <span style={{fontSize:11.5,color:MUTED}}>{e.mode==="time"?"sec":"reps"} · {s.wt}</span>
                              <span onClick={()=>delSet(id,i)} style={{marginLeft:"auto",fontSize:11,color:DIM,cursor:"pointer"}}>remove</span>
                            </div>
                          ))}
                          <div style={{display:"flex",gap:8,marginTop:sets.length?12:0,marginBottom:10}}>
                            {tfield({type:"number",placeholder:e.mode==="time"?"Seconds":"Reps",value:si.reps,onChange:e2=>setSi({...si,reps:e2.target.value}),style:{width:96,flexShrink:0}})}
                            {tfield({placeholder:e.mode==="bw"?"BW / vest":"Weight",value:si.wt,onChange:e2=>setSi({...si,wt:e2.target.value}),style:{flex:1}})}
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={addSet} style={{flex:1,background:`linear-gradient(100deg,${tc.c}26,${tc.c}14)`,border:`1px solid ${tc.c}55`,borderRadius:9,padding:11,color:tc.c,fontSize:12,fontWeight:800,letterSpacing:.5,cursor:"pointer",fontFamily:"inherit"}}>+ LOG SET</button>
                            <button onClick={()=>saveFlags({...flags,[id]:!isFl})} style={{padding:"11px 14px",background:isFl?RED+"1A":CARD,border:`1px solid ${isFl?RED:BORDER}`,borderRadius:9,color:isFl?RED:MUTED,fontSize:14,cursor:"pointer"}}>⚑</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            {plan.type!=="rest" && <div style={{fontSize:11,color:DIM,textAlign:"center",padding:"4px 0 0"}}>Flag (⚑) anything that felt off — pain, bad form, too easy.</div>}
          </>}

          {/* ───── STATS ───── */}
          {tab==="stats" && <>
            <Card>
              <Eyebrow>Personal Records</Eyebrow>
              <div style={{marginTop:8}}>
              {[{id:"pullups",l:"Pull-up Max",u:"reps",b:1},{id:"pushups",l:"Push-up Max",u:"reps",b:20},{id:"dips_m",l:"Dip Max",u:"reps",b:3},{id:"dhang",l:"Dead Hang",u:"sec",b:20}].map(pr=>{
                const st=prs[pr.id]; const val=st?.value??pr.b; const prev=st?.prev??pr.b; const isNew=st&&val>prev; const ed=prEdit===pr.id;
                return (
                  <div key={pr.id} style={{padding:"12px 0",borderBottom:`1px solid ${BORDER}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{fontSize:14,fontWeight:600}}>{pr.l}</div><div style={{fontSize:10.5,color:MUTED,marginTop:2}}>{st?.date?`Updated ${fmt(st.date)}`:"Baseline"}{isNew&&<span style={{color:GREEN,marginLeft:8,fontWeight:700}}>↑ PR</span>}</div></div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{textAlign:"right"}}><span style={{fontSize:26,fontWeight:800,color:RED}}>{val}</span><span style={{fontSize:11,color:MUTED,marginLeft:3}}>{pr.u}</span></div>
                        <button onClick={()=>{setPrEdit(ed?null:pr.id);setPrV("");}} style={{width:30,height:30,borderRadius:8,border:`1px solid ${ed?RED:BORDER}`,background:ed?RED+"22":SURF,color:ed?RED:MUTED,fontSize:18,cursor:"pointer"}}>+</button>
                      </div>
                    </div>
                    {ed && <div style={{display:"flex",gap:8,marginTop:10}}>{tfield({type:"number",placeholder:`New ${pr.u}`,value:prV,onChange:e=>setPrV(e.target.value),style:{flex:1}})}<button onClick={savePR} style={{background:RED+"1A",border:`1px solid ${RED}55`,borderRadius:9,padding:"10px 16px",color:RED,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>SAVE</button></div>}
                  </div>
                );
              })}
              </div>
            </Card>

            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <Eyebrow>Strength Trend</Eyebrow>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {!demo && Object.keys(exHist).length>0 && <select value={chartEx||""} onChange={e=>setChartEx(e.target.value)} style={{background:SURF,border:`1px solid ${BORDER}`,borderRadius:8,color:TEXT,fontSize:11,padding:"5px 8px",fontFamily:"inherit",outline:"none"}}>{Object.keys(exHist).map(id=><option key={id} value={id}>{EX[id]?.n||id}</option>)}</select>}
                  <button onClick={()=>setDemo(!demo)} style={{background:demo?RED+"22":SURF,border:`1px solid ${demo?RED:BORDER}`,borderRadius:8,color:demo?RED:MUTED,fontSize:10.5,fontWeight:700,padding:"6px 10px",cursor:"pointer",fontFamily:"inherit"}}>{demo?"Hide sample":"Preview"}</button>
                </div>
              </div>
              {demo
                ? <><LineChart data={SAMPLE} mode="bw"/><div style={{fontSize:10.5,color:ORANGE,marginTop:8,fontWeight:600}}>SAMPLE DATA — this is what your pull-up trend looks like after a few weeks of logging.</div></>
                : <LineChart data={exHist[chartEx]} mode={EX[chartEx]?.mode}/>}
            </Card>

            <Card>
              <Eyebrow>Pull-up Roadmap → 20</Eyebrow>
              <div style={{marginTop:10}}>
              {[{p:"Wk 1–2",g:"3×4 negatives (5s descent)",a:true},{p:"Wk 3–4",g:"3×5 neg + 1–2 full",a:false},{p:"Wk 5–6",g:"3×3–5 full reps",a:false},{p:"Wk 7–8",g:"3×5–7 reps",a:false},{p:"Month 3",g:"3×8–10 reps",a:false},{p:"Month 6",g:"15–20 reps ✓",a:false}].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:13,padding:"9px 0",borderBottom:i<5?`1px solid ${BORDER}`:"none",opacity:s.a?1:.45}}>
                  <div style={{width:58,flexShrink:0,fontSize:10.5,fontWeight:800,color:s.a?RED:MUTED,paddingTop:1}}>{s.p}</div>
                  <div style={{fontSize:13,fontWeight:s.a?700:400,color:s.a?TEXT:MUTED}}>{s.g}</div>
                </div>
              ))}
              </div>
            </Card>

            <Card>
              <Eyebrow>History · Last {hist.length} Active Days</Eyebrow>
              {hist.length===0 ? <div style={{fontSize:13,color:MUTED,marginTop:12}}>No logged sessions yet. They'll show here as you train.</div> : (
                <>
                  <div style={{display:"flex",gap:8,margin:"12px 0 16px"}}>
                    {[{l:"Sessions",v:hist.length},{l:"Sets",v:hist.reduce((a,b)=>a+b.sets,0)},{l:"Rehab days",v:hist.filter(h=>h.rehab===REHAB.length).length}].map(s=>(
                      <div key={s.l} style={{flex:1,background:SURF,border:`1px solid ${BORDER}`,borderRadius:10,padding:"11px 8px",textAlign:"center"}}><div style={{fontSize:20,fontWeight:800,color:RED}}>{s.v}</div><div style={{fontSize:9.5,color:MUTED,letterSpacing:.5,marginTop:2}}>{s.l.toUpperCase()}</div></div>
                    ))}
                  </div>
                  {[...hist].reverse().map(h=>(
                    <div key={h.date} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:`1px solid ${BORDER}`}}>
                      <div style={{width:38,flexShrink:0}}><div style={{fontSize:9,color:MUTED,fontWeight:700}}>{fmtW(h.date)}</div><div style={{fontSize:12,fontWeight:700}}>{fmt(h.date).split(" ")[1]}</div></div>
                      <div style={{flex:1,fontSize:11.5,color:MUTED}}>{h.sets} sets · {h.kcal>0?`${h.kcal} kcal`:"no food log"}</div>
                      <div style={{fontSize:11,fontWeight:700,color:h.rehab===REHAB.length?GREEN:MUTED}}>{h.rehab===REHAB.length?"rehab ✓":`rehab ${h.rehab}/${REHAB.length}`}</div>
                    </div>
                  ))}
                </>
              )}
            </Card>
          </>}

          {/* ───── FUEL ───── */}
          {tab==="fuel" && <>
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div><Eyebrow>Calories</Eyebrow><div style={{fontSize:34,fontWeight:800,lineHeight:1,marginTop:4}}>{Math.round(food.kcal)}</div><div style={{fontSize:11,color:MUTED,marginTop:2}}>target {TGT.kcal} · recomp</div></div>
                <div style={{textAlign:"right"}}><Eyebrow>Left</Eyebrow><div style={{fontSize:34,fontWeight:800,lineHeight:1,marginTop:4,color:food.kcal>TGT.kcal?RED:GREEN}}>{Math.max(0,TGT.kcal-Math.round(food.kcal))}</div></div>
              </div>
              {[{l:"PROTEIN",v:food.pro,m:TGT.pro,c:BLUE},{l:"CARBS",v:food.carb,m:TGT.carb,c:ORANGE},{l:"FAT",v:food.fat,m:TGT.fat,c:RED}].map(x=>(
                <div key={x.l} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:MUTED,letterSpacing:1}}>{x.l}</span><span style={{fontSize:11,fontWeight:700}}>{Math.round(x.v)}g <span style={{color:MUTED,fontWeight:400}}>/ {x.m}g</span></span></div>
                  <Bar v={x.v} m={x.m} c={x.c}/>
                </div>
              ))}
            </Card>

            <Card>
              <Eyebrow>Carb Timing</Eyebrow>
              <div style={{marginTop:8}}>
              {[["Pre-workout","40–60g carbs · 25g protein · low fat"],["Post-workout","60g carbs · 30g protein within 2h"],["Evening","Lower carbs · protein priority"]].map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<2?`1px solid ${BORDER}`:"none"}}><span style={{fontSize:13,fontWeight:600}}>{c[0]}</span><span style={{fontSize:11,color:MUTED,textAlign:"right",maxWidth:170}}>{c[1]}</span></div>
              ))}
              </div>
            </Card>

            {showFood ? (
              <Card>
                <Eyebrow>Add Food</Eyebrow>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:10}}>
                  {tfield({placeholder:"Food name",value:fi.name,onChange:e=>setFi({...fi,name:e.target.value})})}
                  <div style={{display:"flex",gap:6}}>{[["kcal","Cal"],["pro","P"],["fat","F"],["carb","C"]].map(([k,p])=>tfield({key:k,type:"number",placeholder:p,value:fi[k],onChange:e=>setFi({...fi,[k]:e.target.value}),style:{flex:1,minWidth:0,textAlign:"center",padding:"11px 4px"}}))}</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={addFood} style={{flex:1,background:RED+"1A",border:`1px solid ${RED}55`,borderRadius:9,padding:11,color:RED,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>ADD</button>
                    <button onClick={()=>setShowFood(false)} style={{flex:1,background:SURF,border:`1px solid ${BORDER}`,borderRadius:9,padding:11,color:MUTED,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>CANCEL</button>
                  </div>
                </div>
              </Card>
            ) : <button onClick={()=>setShowFood(true)} style={{width:"100%",background:`linear-gradient(100deg,${RED}26,${ORANGE}18)`,border:`1px solid ${RED}55`,borderRadius:14,padding:14,color:RED,fontSize:13,fontWeight:800,letterSpacing:1,cursor:"pointer",fontFamily:"inherit"}}>+ LOG FOOD</button>}

            {(food.items||[]).length>0 && (
              <Card>
                <Eyebrow>Today's Log</Eyebrow>
                <div style={{marginTop:8}}>
                {food.items.map((it,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<food.items.length-1?`1px solid ${BORDER}`:"none"}}>
                    <div><div style={{fontSize:13,fontWeight:600}}>{it.name}</div><div style={{fontSize:10.5,color:MUTED,marginTop:2}}>P {it.pro} · C {it.carb} · F {it.fat}</div></div>
                    <div style={{fontSize:13,fontWeight:700,color:ORANGE}}>{it.kcal}</div>
                  </div>
                ))}
                </div>
              </Card>
            )}
          </>}

        </div>

        {/* BOTTOM NAV */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:460,background:SURF,borderTop:`1px solid ${BORDER}`,display:"flex",zIndex:50}}>
          {[{k:"today",l:"Today",i:"◆"},{k:"week",l:"Week",i:"▦"},{k:"log",l:"Log",i:"✎"},{k:"stats",l:"Stats",i:"▲"},{k:"fuel",l:"Fuel",i:"◉"}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,background:"none",border:"none",padding:"11px 0 9px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontFamily:"inherit"}}>
              <span style={{fontSize:15,color:tab===t.k?RED:DIM}}>{t.i}</span>
              <span style={{fontSize:9,letterSpacing:.5,fontWeight:tab===t.k?800:500,color:tab===t.k?RED:DIM}}>{t.l.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* sample data so the chart can be previewed before real history exists */
function makeSample() {
  const out = []; const today = new Date(); const reps = [3,4,5,5,7,8,10,12];
  reps.forEach((r,i)=>{ const d=new Date(today); d.setDate(d.getDate()-(reps.length-1-i)*4); out.push({ date:d.toISOString().split("T")[0], reps:String(r), wt:"BW" }); });
  return out;
}
const SAMPLE = makeSample();

/* inline SVG line chart (portable, no deps) — plots per-day best across days,
   or per-set within a single day so a trend shows after just 2 logged sets */
function LineChart({ data, mode }) {
  if (!data || data.length < 2)
    return <div style={{fontSize:12.5,color:MUTED,padding:"20px 0",textAlign:"center",lineHeight:1.5}}>Log at least 2 sets of this exercise — or train it on 2+ days — and your trend draws here. Tap <b style={{color:TEXT}}>Preview</b> above to see an example.</div>;

  const val = d => mode==="load" ? est1RM(d.reps,d.wt) : (parseFloat(d.reps)||0);
  const byDay = {};
  data.forEach(d => { const v=val(d); if(!byDay[d.date]||v>byDay[d.date]) byDay[d.date]=v; });
  const dayKeys = Object.keys(byDay).sort();

  let pts;
  if (dayKeys.length >= 2) {
    pts = dayKeys.slice(-12).map(k => ({ label:fmt(k), v:byDay[k] }));   // best set per day
  } else {
    pts = data.slice(-12).map((d,i) => ({ label:`Set ${i+1}`, v:val(d) })); // single day → per set
  }

  const vals = pts.map(p=>p.v); const max=Math.max(...vals), min=Math.min(...vals);
  const range = max-min||1; const W=380, H=140, pad=24;
  const X = i => pad + (i*(W-pad*2))/(pts.length-1||1);
  const Y = v => H-pad - ((v-min)/range)*(H-pad*2);
  const path = pts.map((p,i)=>`${i===0?"M":"L"}${X(i)},${Y(p.v)}`).join(" ");
  const area = `${path} L${X(pts.length-1)},${H-pad} L${X(0)},${H-pad} Z`;
  const up = vals[vals.length-1] >= vals[0];
  const unit = mode==="load"?"est 1RM (lb)":mode==="time"?"seconds":"reps";
  const span = dayKeys.length>=2 ? "by day" : "by set today";
  return (
    <div>
      <div style={{fontSize:11,color:MUTED,marginBottom:6}}>{unit} · {span} · {up?<span style={{color:GREEN}}>trending up ↗</span>:<span style={{color:RED}}>trending down ↘</span>}</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%"}}>
        <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={RED} stopOpacity="0.25"/><stop offset="100%" stopColor={RED} stopOpacity="0"/></linearGradient></defs>
        <path d={area} fill="url(#cg)"/>
        <path d={path} fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=><circle key={i} cx={X(i)} cy={Y(p.v)} r="3.5" fill={BG} stroke={RED} strokeWidth="2"/>)}
        <text x={pad} y={H-6} fill={MUTED} fontSize="9">{pts[0].label}</text>
        <text x={W-pad} y={H-6} fill={MUTED} fontSize="9" textAnchor="end">{pts[pts.length-1].label}</text>
        <text x={pad} y={Y(max)-6} fill={MUTED} fontSize="9">{max}</text>
      </svg>
    </div>
  );
}
