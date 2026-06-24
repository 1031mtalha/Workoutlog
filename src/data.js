/* ─────────────────────────  TOKENS  ───────────────────────── */
export const BG     = "#08080A";
export const SURF   = "#141417";
export const CARD   = "#1A1A1E";
export const CARD2  = "#202026";
export const BORDER = "#2A2A30";
export const RED    = "#FF4D4D";
export const ORANGE = "#FF7A45";
export const GREEN  = "#4ADE80";
export const BLUE   = "#5AA9FF";
export const PURPLE = "#B57BFF";
export const TEXT   = "#F2EFEA";
export const MUTED  = "#A6A6AE"; // nudged up from #9A9AA2 for contrast
export const DIM    = "#76767E"; // nudged up from #62626A for contrast

export const DIAMOND = "repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 15px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 15px)";

export const TTYPE = {
  pull: { c: BLUE,   label: "PULL"  },
  push: { c: RED,    label: "PUSH"  },
  legs: { c: ORANGE, label: "LEGS"  },
  core: { c: PURPLE, label: "CORE"  },
  power:{ c: ORANGE, label: "POWER" },
  rest: { c: DIM,    label: "REST"  },
};

/* ─────────────────────────  EXERCISE POOL (defaults)  ───────────────────────── */
export const EX_DEFAULTS = {
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
  exp_pu:    { n:"Explosive Push-ups",      mode:"bw",   lo:3,  hi:5,  t:"4 sets · fast up, 3s down" },
  pike_pu:   { n:"Pike Push-ups",           mode:"bw",   lo:8,  hi:12, t:"3 sets · hips high" },
  dips:      { n:"Dips (Bullbar)",          mode:"bw",   lo:5,  hi:8,  t:"4 sets · bench dips if needed" },
  oh_tri:    { n:"Overhead Tricep Ext.",    mode:"load", lo:10, hi:12, t:"3 sets · 15lb · elbows in" },
  lat_raise: { n:"Lateral Raises",          mode:"load", lo:12, hi:15, t:"3 sets · 15lb · controlled down" },
  vest_pu:   { n:"Weighted Push-ups",       mode:"bw",   lo:5,  hi:8,  t:"4 sets · 12lb vest" },
  dec_pu:    { n:"Decline Push-ups",        mode:"bw",   lo:10, hi:15, t:"3 sets · feet on bench" },
  skull:     { n:"Skull Crushers",          mode:"load", lo:8,  hi:12, t:"3 sets · 15lb · elbows fixed" },
  arnold:    { n:"Arnold Press",            mode:"load", lo:8,  hi:10, t:"3 sets · 15lb · full rotation" },
  // LEGS (no-impact, shin-safe — Phase 1)
  goblet:    { n:"Goblet / Vest Squats",    mode:"load", lo:6,  hi:10, t:"4 sets · 15lb or 12lb vest" },
  bss:       { n:"Bulgarian Split Squat",   mode:"load", lo:8,  hi:12, t:"3 sets each leg · skip if shin-painful" },
  glute_br:  { n:"Glute Bridges",           mode:"bw",   lo:10, hi:15, t:"3 sets · squeeze at top" },
  calf:      { n:"Wedge Calf + Tibialis",   mode:"bw",   lo:12, hi:20, t:"3 sets · pain-free range only" },
  leg_ext:   { n:"Leg Extensions",          mode:"load", lo:10, hi:15, t:"3 sets · bench machine" },
  step_up:   { n:"Step-ups (controlled)",   mode:"load", lo:10, hi:12, t:"3 sets each · no jumping" },
  // POWER (explosive — render first in session, shin-safe)
  clap_pu:     { n:"Plyo / Clap Push-ups",       mode:"bw",   lo:5, hi:10, t:"4 sets · max power per rep" },
  db_throw:    { n:"DB Explosive Press",         mode:"load", lo:6, hi:10, t:"3 sets · accelerate hard" },
  db_rot_throw:{ n:"DB / Med-Ball Rotational Throw", mode:"bw", lo:5, hi:8, t:"3-4 sets each side · max speed" },
  // CORE
  plank:     { n:"Plank",                   mode:"time", lo:45, hi:90, t:"3 sets · no sag" },
  hollow:    { n:"Hollow Body Hold",        mode:"time", lo:20, hi:45, t:"3 sets · lower back down" },
  dead_bug:  { n:"Dead Bug",                mode:"bw",   lo:8,  hi:12, t:"3 sets each side" },
  bicycle:   { n:"Bicycle Crunches",        mode:"bw",   lo:15, hi:25, t:"3 sets · controlled" },
  leg_raise: { n:"Hanging Leg Raises",      mode:"bw",   lo:8,  hi:15, t:"3 sets · no swing" },
  pallof:    { n:"Pallof Press",            mode:"load", lo:10, hi:15, t:"3 sets each side · resist rotation" },
};

export const HITS_DEFAULTS = {
  full_pu:["back","biceps"], inv_row:["back","biceps"], sa_row:["back","biceps"], cs_row:["back","biceps"],
  rev_fly:["shoulders"], hammer:["biceps"], pu_max:["back","biceps"], sup_row:["back","biceps"],
  reg_curl:["biceps"], conc_curl:["biceps"], dead_hang:["forearms"],
  exp_pu:["chest","triceps","shoulders"], pike_pu:["shoulders","triceps"], dips:["chest","triceps"],
  oh_tri:["triceps"], lat_raise:["shoulders"], vest_pu:["chest","triceps"], dec_pu:["chest","triceps"],
  skull:["triceps"], arnold:["shoulders","triceps"],
  goblet:["legs"], bss:["legs"], glute_br:["legs"], calf:["legs"], leg_ext:["legs"], step_up:["legs"],
  clap_pu:["chest","triceps","shoulders"], db_throw:["shoulders","chest"],
  db_rot_throw:["core","shoulders"], pallof:["core","shoulders"],
  plank:["core"], hollow:["core"], dead_bug:["core"], bicycle:["core"], leg_raise:["core"],
};

/* ── Rolling cycle (replaces weekday-indexed WEEK) ──────────────────
   Each slot is a day-template. "Today's workout" = cycle[anchor.index],
   advanced by completing or explicitly shifting — never by calendar weekday. */
export const CYCLE_PHASE1 = [
  { id:"pullA", name:"Pull A", type:"pull",
    main:["full_pu","inv_row","sa_row","cs_row","rev_fly","hammer","dead_hang"],
    addons:["rehab","suburi"] },
  { id:"pushA", name:"Push A", type:"push",
    main:["exp_pu","pike_pu","dips","skull","lat_raise"],
    addons:["rehab","bikehiit"] },
  { id:"legsCore", name:"Legs + Core", type:"legs",
    main:["goblet","bss","glute_br","calf","leg_ext","plank","hollow","dead_bug"],
    addons:["rehab"] },
  { id:"rest1", name:"Rest", type:"rest", main:[], addons:["rehab","suburi_light"] },
  { id:"pullB", name:"Pull B", type:"pull",
    main:["pu_max","sup_row","sa_row","rev_fly","reg_curl","conc_curl","dead_hang"],
    addons:["rehab","suburi"] },
  { id:"pushB", name:"Push B", type:"push",
    main:["vest_pu","dec_pu","dips","skull","arnold"],
    addons:["rehab","bikehiit"] },
  { id:"power", name:"Power + Legs", type:"power",
    main:["clap_pu","db_throw","bss","step_up","glute_br","hollow","leg_raise"],
    addons:["rehab"] },
];

/* Phase 2 stays the Phase 1 cycle plus a manually-inserted plyo track —
   gated by the clearance checklist below. Never auto-unlocked. */
export const PLYO_STAGES = [
  { id:1, n:"Pogo / ankle hops", d:"Low volume · stiff ankle, small amplitude" },
  { id:2, n:"Low box jumps + short bounds", d:"Step down, don't jump down" },
  { id:3, n:"Reactive / footwork", d:"Lateral bounds, skater hops, agility ladder" },
  { id:4, n:"Sprint mechanics + depth jumps", d:"Full speed work" },
];

export const ADDON_INFO = {
  rehab:       { n:"MTSS Rehab",   c:RED,    sub:"Daily · non-negotiable" },
  suburi:      { n:"Kendo Suburi", c:PURPLE, sub:"Skill maintenance · ~15 min" },
  suburi_light:{ n:"Light Suburi", c:PURPLE, sub:"Easy skill work · optional" },
  bikehiit:    { n:"Bike HIIT",    c:ORANGE, sub:"6 × 30s hard / 90s easy" },
};

export const REHAB = [
  { id:"arch", n:"Short-foot / Arch Raises", d:"3×10 each foot" },
  { id:"calf", n:"Single-leg Calf Raises",   d:"3×15 each foot" },
  { id:"tib",  n:"Tibialis Raises",          d:"3×20 (toes up, heel down)" },
  { id:"str",  n:"Seated Calf Stretch",      d:"60s each side" },
];

export const MUSCLES = ["chest","shoulders","back","biceps","triceps","forearms","core","legs"];
export const MUSCLE_LABEL = { chest:"Chest", shoulders:"Shoulders", back:"Back", biceps:"Biceps", triceps:"Triceps", forearms:"Forearms", core:"Core", legs:"Legs" };

export const TGT_DEFAULT = { kcal:2650, pro:145, fat:60, carb:335 };

export const DAY_STATUS = {
  done:    { label:"Done",        c:GREEN },
  partial: { label:"Partial",     c:ORANGE },
  rest:    { label:"Planned rest",c:DIM },
  skipped: { label:"Skipped",     c:PURPLE },
};
export const SKIP_REASONS = ["Sick","Too sore","Tired / low recovery","No time","Injury","Other"];

export const QURAN = [
  { a: "For indeed, with hardship [will be] ease.",                                              r: "94:5" },
  { a: "Allah does not charge a soul except [with that within] its capacity.",                    r: "2:286" },
  { a: "Indeed, Allah is with the patient.",                                                       r: "2:153" },
  { a: "And whoever relies upon Allah — then He is sufficient for him.",                           r: "65:3" },
  { a: "And that there is not for man except that [good] for which he strives.",                   r: "53:39" },
  { a: "And those who strive for Us — We will surely guide them to Our ways.",                     r: "29:69" },
  { a: "If you are grateful, I will surely increase you [in favor].",                              r: "14:7" },
  { a: "So when you have finished [your duties], then stand up [for worship].",                    r: "94:7" },
  { a: "My Lord, increase me in knowledge.",                                                       r: "20:114" },
  { a: "So do not weaken and do not grieve, and you will be superior if you are [true] believers.", r: "3:139" },
  { a: "Indeed, the patient will be given their reward without account.",                          r: "39:10" },
  { a: "Indeed, Allah loves those who rely [upon Him].",                                            r: "3:159" },
  { a: "And He found you lost and guided [you].",                                                   r: "93:7" },
  { a: "Indeed, my Lord is near and responsive.",                                                   r: "11:61" },
  { a: "But perhaps you hate a thing and it is good for you.",                                       r: "2:216" },
  { a: "Indeed, Allah will not change the condition of a people until they change what is in themselves.", r: "13:11" },
  { a: "And do not pursue that of which you have no knowledge.",                                     r: "17:36" },
  { a: "Allah will raise those who have believed among you and those who were given knowledge, by degrees.", r: "58:11" },
  { a: "Do not despair of the mercy of Allah.",                                                      r: "39:53" },
  { a: "Call upon Me; I will respond to you.",                                                       r: "40:60" },
  { a: "By the remembrance of Allah hearts are assured.",                                            r: "13:28" },
  { a: "Indeed, with hardship [will be] ease.",                                                      r: "94:6" },
  { a: "And the servants of the Most Merciful are those who walk upon the earth easily.",            r: "25:63" },
  { a: "Indeed, the most noble of you in the sight of Allah is the most righteous of you.",          r: "49:13" },
  { a: "And be patient. Indeed, Allah is with the patient.",                                          r: "8:46" },
  { a: "And seek help through patience and prayer.",                                                  r: "2:45" },
  { a: "Indeed, Allah is with those who fear Him and those who are doers of good.",                   r: "16:128" },
  { a: "Persevere and endure and remain stationed and fear Allah, that you may be successful.",       r: "3:200" },
  { a: "So remember Me; I will remember you.",                                                         r: "2:152" },
  { a: "If you support Allah, He will support you and plant firmly your feet.",                        r: "47:7" },
];
