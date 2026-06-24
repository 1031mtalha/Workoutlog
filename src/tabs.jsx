import { useState } from "react";
import {
  BG, SURF, CARD, CARD2, BORDER, RED, ORANGE, GREEN, BLUE, PURPLE, TEXT, MUTED, DIM,
} from "./data";
import { exportAll } from "./storage";

const fmt = (k) => new Date(k + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtW = (k) => new Date(k + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
const est1RM = (reps, wt) => { const w = parseFloat(wt) || 0; const r = parseFloat(reps) || 0; return w > 0 ? Math.round(w * (1 + r / 30)) : r; };

/* ─────────────────────────  TODAY  ───────────────────────── */
export function TodayTab({ verse, conflicts, soreMuscles, MUSCLES, MUSCLE_LABEL, saveSore, sore, BodyMap, Card, Eyebrow, Tag, plan, tc, EX, wlog, loggedCount, setTab, addons, saveAddon, ADDON_INFO, rehabDone, REHAB, rhab, saveRhab, sleep, saveSleep, pct, dayStatus, setReasonPick, reasonPick, setDayStatusReason, DAY_STATUS, SKIP_REASONS, cycle, shiftCycle }) {
  return (<>
    <div style={{ background: `linear-gradient(135deg,${CARD},${SURF})`, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ORANGE}`, borderRadius: 14, padding: "16px 18px" }}>
      <Eyebrow>Verse of the Day</Eyebrow>
      <div style={{ fontSize: 16, lineHeight: 1.55, marginTop: 9, fontWeight: 500 }}>"{verse.a}"</div>
      <div style={{ fontSize: 12, color: ORANGE, marginTop: 8, fontWeight: 700, letterSpacing: .5 }}>Qur'an {verse.r}</div>
    </div>

    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Eyebrow>Readiness Check</Eyebrow>
        <span style={{ fontSize: 11, color: conflicts.length ? RED : GREEN, fontWeight: 700 }}>{conflicts.length ? `⚠ ${conflicts.length} conflict` : soreMuscles.length ? `${soreMuscles.length} sore` : "All fresh"}</span>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 88, flexShrink: 0 }}><BodyMap /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 9 }}>Tap what's sore today:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MUSCLES.map(m => (
              <button key={m} onClick={() => saveSore({ ...sore, [m]: !sore[m] })} style={{ padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${sore[m] ? RED : BORDER}`, background: sore[m] ? RED + "22" : SURF, color: sore[m] ? RED : MUTED }}>{MUSCLE_LABEL[m]}</button>
            ))}
          </div>
        </div>
      </div>
      {conflicts.length > 0 && <div style={{ marginTop: 14, background: RED + "14", border: `1px solid ${RED}40`, borderRadius: 10, padding: "11px 13px", fontSize: 12.5, lineHeight: 1.55, color: TEXT }}>Today's <b>{plan.name}</b> loads {conflicts.map(c => MUSCLE_LABEL[c]).join(", ")} — still sore. Shift the cycle, swap exercises, or take another rest day. Pushing through 3-day DOMS just extends it.</div>}
    </Card>

    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <Eyebrow>Cycle Position</Eyebrow>
      </div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 10 }}>The schedule is a rolling rotation, not tied to the weekday. Miss or move a day without it desyncing.</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => shiftCycle(-1)} style={shiftBtn}>‹ Shift back</button>
        <button onClick={() => shiftCycle(1)} style={shiftBtn}>Shift forward ›</button>
      </div>
    </Card>

    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Eyebrow>Today · {plan.name}</Eyebrow>
        {plan.type !== "rest" && <span style={{ fontSize: 11, color: tc.c, fontWeight: 700 }}>{loggedCount}/{plan.main.length}</span>}
      </div>
      {plan.type === "rest"
        ? <div style={{ fontSize: 14, color: MUTED, padding: "6px 0", lineHeight: 1.5 }}>Full rest. Keep rehab below — nothing heavy. Recovery is when the work pays off.</div>
        : <>
          <div style={{ height: 3, background: BORDER, borderRadius: 3, marginBottom: 14, overflow: "hidden" }}><div style={{ width: pct(loggedCount, plan.main.length), height: "100%", background: tc.c, transition: "width .4s" }} /></div>
          {plan.main.slice(0, 5).map(id => { const done = (wlog[id] || []).length; return (
            <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{EX[id]?.n}</div><div style={{ fontSize: 10.5, color: MUTED, marginTop: 1 }}>{EX[id]?.t}</div></div>
              <div style={{ fontSize: 14, fontWeight: 800, color: done ? tc.c : DIM }}>{done ? `${done}×` : "—"}</div>
            </div>); })}
          {plan.main.length > 5 && <div style={{ fontSize: 11, color: MUTED, paddingTop: 9 }}>+{plan.main.length - 5} more in the log</div>}
          <button onClick={() => setTab("log")} style={{ marginTop: 13, width: "100%", background: `linear-gradient(100deg,${tc.c}26,${tc.c}14)`, border: `1px solid ${tc.c}55`, borderRadius: 9, padding: 12, color: tc.c, fontSize: 12, fontWeight: 800, letterSpacing: 1, cursor: "pointer", fontFamily: "inherit" }}>OPEN LOG →</button>
        </>}
    </Card>

    <Card>
      <Eyebrow>Day Status</Eyebrow>
      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 7 }}>
        {Object.entries(DAY_STATUS).map(([k, v]) => (
          <button key={k} onClick={() => k === "skipped" ? setReasonPick(true) : setDayStatusReason(k)} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${dayStatus?.status === k ? v.c : BORDER}`, background: dayStatus?.status === k ? v.c + "22" : SURF, color: dayStatus?.status === k ? v.c : MUTED }}>{v.label}</button>
        ))}
      </div>
      {reasonPick && <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {SKIP_REASONS.map(r => <button key={r} onClick={() => setDayStatusReason("skipped", r)} style={{ padding: "6px 10px", borderRadius: 7, fontSize: 11, border: `1px solid ${BORDER}`, background: SURF, color: MUTED, cursor: "pointer" }}>{r}</button>)}
      </div>}
      {dayStatus?.reason && <div style={{ marginTop: 8, fontSize: 11.5, color: PURPLE }}>Reason: {dayStatus.reason}</div>}
    </Card>

    <Card>
      <Eyebrow>Daily Add-ons</Eyebrow>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
        {plan.addons.map(a => {
          const info = ADDON_INFO[a]; const done = addons[a];
          if (a === "rehab") return (
            <div key={a} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: SURF, border: `1px solid ${rehabDone === REHAB.length ? GREEN + "55" : BORDER}`, borderRadius: 10, padding: "11px 13px" }}>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: info.c }}>{info.n}</div><div style={{ fontSize: 10.5, color: MUTED }}>{info.sub}</div></div>
              <div style={{ fontSize: 13, fontWeight: 800, color: rehabDone === REHAB.length ? GREEN : MUTED }}>{rehabDone}/{REHAB.length}</div>
            </div>);
          return (
            <div key={a} onClick={() => saveAddon({ ...addons, [a]: !done })} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: SURF, border: `1px solid ${done ? info.c + "55" : BORDER}`, borderRadius: 10, padding: "11px 13px", cursor: "pointer" }}>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: info.c }}>{info.n}</div><div style={{ fontSize: 10.5, color: MUTED }}>{info.sub}</div></div>
              <div style={{ width: 24, height: 24, borderRadius: 7, border: `1.5px solid ${done ? info.c : BORDER}`, background: done ? info.c + "22" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>{done && <span style={{ color: info.c, fontSize: 14 }}>✓</span>}</div>
            </div>);
        })}
        <div onClick={() => saveAddon({ ...addons, mbike: !addons.mbike })} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: SURF, border: `1px solid ${addons.mbike ? ORANGE + "55" : BORDER}`, borderRadius: 10, padding: "11px 13px", cursor: "pointer" }}>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: ORANGE }}>Morning Easy Bike</div><div style={{ fontSize: 10.5, color: MUTED }}>20–25 min Zone 2 · not HIIT</div></div>
          <div style={{ width: 24, height: 24, borderRadius: 7, border: `1.5px solid ${addons.mbike ? ORANGE : BORDER}`, background: addons.mbike ? ORANGE + "22" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>{addons.mbike && <span style={{ color: ORANGE, fontSize: 14 }}>✓</span>}</div>
        </div>
      </div>
    </Card>

    <Card style={{ borderLeft: `3px solid ${RED}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <Eyebrow>MTSS Rehab — Every Day</Eyebrow>
        <span style={{ fontSize: 14, fontWeight: 800, color: rehabDone === REHAB.length ? GREEN : TEXT }}>{rehabDone}/{REHAB.length}</span>
      </div>
      <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginBottom: 10 }}>Fixes the flat-foot mechanics, not just the pain. Non-skippable in both phases — a missed day shows on the monthly tracker.</div>
      {REHAB.map((r, i) => (
        <div key={r.id} onClick={() => saveRhab({ ...rhab, [r.id]: !rhab[r.id] })} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < REHAB.length - 1 ? `1px solid ${BORDER}` : "none", cursor: "pointer" }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, border: `1.5px solid ${rhab[r.id] ? GREEN : BORDER}`, background: rhab[r.id] ? GREEN + "22" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{rhab[r.id] && <span style={{ color: GREEN, fontSize: 14 }}>✓</span>}</div>
          <div><div style={{ fontSize: 13, fontWeight: 600, color: rhab[r.id] ? MUTED : TEXT, textDecoration: rhab[r.id] ? "line-through" : "none" }}>{r.n}</div><div style={{ fontSize: 10.5, color: MUTED }}>{r.d}</div></div>
        </div>
      ))}
    </Card>

    <Card>
      <Eyebrow>Sleep Last Night</Eyebrow>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0 0" }}>
        {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map(h => (
          <button key={h} onClick={() => saveSleep(h)} style={{ padding: "8px 11px", borderRadius: 8, border: `1px solid ${sleep === h ? ORANGE : BORDER}`, background: sleep === h ? ORANGE + "22" : SURF, color: sleep === h ? ORANGE : MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{h}h</button>
        ))}
      </div>
      {sleep && <div style={{ marginTop: 11, fontSize: 12.5, fontWeight: 600, color: sleep >= 8 ? GREEN : sleep >= 7 ? TEXT : RED }}>{sleep >= 8 ? "✓ Optimal for recovery and growth" : sleep >= 7 ? "Decent — aim for 8h" : "⚠ Low — recovery, protein synthesis, and growth all take the hit"}</div>}
    </Card>
  </>);
}
const shiftBtn = { flex: 1, background: SURF, border: `1px solid ${BORDER}`, borderRadius: 9, padding: 11, color: TEXT, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };

/* ─────────────────────────  WEEK  ───────────────────────── */
export function WeekTab({ cycleArr, getEffectiveSlot, tk, slotIndexForDate, openWeek, setOpenWeek, EX, TTYPE, Tag, ADDON_INFO, pickDifferentDay, shiftCycle }) {
  const todayIdx = slotIndexForDate(tk);
  const todayD = new Date(tk + "T12:00:00");
  const mondayOffset = (todayD.getDay() + 6) % 7; // 0=Mon
  const monday = new Date(todayD); monday.setDate(todayD.getDate() - mondayOffset);
  const upcoming = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const date = d.toISOString().split("T")[0];
    return { date, idx: slotIndexForDate(date) };
  });
  return (<>
    <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, padding: "2px 2px 4px" }}>This week, Monday through Sunday. The rolling cycle isn't weekday-locked, so shifting it moves which workout falls on which day — tap a day to view, or pick "I did a different day" if today didn't match the plan.</div>
    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
      <button onClick={() => shiftCycle(-1)} style={shiftBtn}>‹ Shift back</button>
      <button onClick={() => shiftCycle(1)} style={shiftBtn}>Shift forward ›</button>
    </div>
    {upcoming.map(({ date, idx }) => {
      const p = getEffectiveSlot(idx); const t = TTYPE[p.type]; const isToday = date === tk; const open = openWeek === idx;
      return (
        <div key={date}>
          <div onClick={() => setOpenWeek(open ? -1 : idx)} style={{ background: isToday ? CARD2 : CARD, border: `1px solid ${isToday ? t.c + "66" : BORDER}`, borderRadius: open ? "14px 14px 0 0" : 14, padding: "13px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 42, height: 42, borderRadius: 9, border: `1px solid ${t.c}55`, background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, color: t.c }}>{fmtW(date).toUpperCase()}</span></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{p.name}{isToday && <span style={{ fontSize: 9, color: t.c, fontWeight: 800, letterSpacing: 1 }}>TODAY</span>}</div>
              <div style={{ fontSize: 10.5, color: MUTED, marginTop: 2 }}>{fmt(date)} · {p.addons.map(a => ADDON_INFO[a]?.n).filter(Boolean).join(" · ") || "recovery"}</div>
            </div>
            <Tag label={t.label} color={t.c} />
          </div>
          {open && (
            <div style={{ background: SURF, border: `1px solid ${t.c}66`, borderTop: "none", borderRadius: "0 0 14px 14px", padding: "6px 15px 14px" }}>
              {p.main.length === 0 && <div style={{ fontSize: 13, color: MUTED, padding: "10px 0" }}>No lifting. Rehab only.</div>}
              {p.main.map((id, i) => (
                <div key={id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < p.main.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{EX[id]?.n}</span>
                  <span style={{ fontSize: 11.5, color: MUTED, textAlign: "right", maxWidth: 140 }}>{EX[id]?.t.split("·")[0]}</span>
                </div>
              ))}
              {isToday && <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: 10.5, color: MUTED, width: "100%" }}>This was actually:</span>
                {cycleArr.map((s, i) => <button key={s.id} onClick={() => pickDifferentDay(date, i)} style={{ padding: "5px 9px", borderRadius: 7, fontSize: 10.5, border: `1px solid ${BORDER}`, background: SURF, color: i === idx ? t.c : MUTED, cursor: "pointer" }}>{s.name}</button>)}
              </div>}
            </div>
          )}
        </div>
      );
    })}
  </>);
}

/* ─────────────────────────  LOG  ───────────────────────── */
export function LogTab({ DateNav, plan, EX, HITS, wlog, openEx, setOpenEx, si, setSi, addSet, delSet, flags, saveFlags, coachTarget, exHist, tc, tfield, Card, Tag, editSlot, setEditSlot, ovr, swapExercise, removeExercise, addCustomExercise, dayStatus, setReasonPick, reasonPick, setDayStatusReason, DAY_STATUS, SKIP_REASONS }) {
  const [customForm, setCustomForm] = useState({ n: "", mode: "bw", lo: "", hi: "", note: "", cat: "core" });
  return (<>
    <DateNav />
    {plan.type === "rest"
      ? <Card style={{ textAlign: "center", padding: "34px 16px" }}><div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>Rest day — no lifting to log. Do rehab from the Today tab.</div></Card>
      : plan.main.map(id => {
        const e = EX[id]; if (!e) return null;
        const sets = wlog[id] || []; const open = openEx === id; const isFl = flags[id];
        const coach = coachTarget(e, (exHist[id] || []).map(h => ({ reps: h.reps, wt: h.wt })).concat(sets.map(s => ({ reps: s.reps, wt: s.wt }))));
        return (
          <div key={id}>
            <div onClick={() => { setOpenEx(open ? null : id); setSi({ reps: "", wt: "" }); }} style={{ background: CARD, border: `1px solid ${open ? tc.c + "80" : BORDER}`, borderRadius: open ? "14px 14px 0 0" : 14, padding: "13px 15px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14, fontWeight: 600 }}>{e.n}</span>{isFl && <span style={{ color: RED, fontSize: 12 }}>⚑</span>}{e.pr && <Tag label="PR" color={RED} />}</div>
                <div style={{ fontSize: 10.5, color: MUTED, marginTop: 2 }}>{e.t}</div>
              </div>
              <div style={{ textAlign: "right", marginLeft: 12 }}><div style={{ fontSize: 21, fontWeight: 800, color: sets.length ? tc.c : DIM, lineHeight: 1 }}>{sets.length}</div><div style={{ fontSize: 9, color: MUTED, letterSpacing: 1 }}>SETS</div></div>
            </div>
            {open && (
              <div style={{ background: SURF, border: `1px solid ${tc.c}80`, borderTop: "none", borderRadius: "0 0 14px 14px", padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, fontSize: 11.5 }}><span style={{ color: tc.c, fontWeight: 800, letterSpacing: .5 }}>↗ NEXT TARGET</span><span style={{ color: TEXT, fontWeight: 600 }}>{coach}</span></div>
                {sets.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: MUTED, fontWeight: 700, width: 16 }}>{i + 1}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: tc.c }}>{s.reps}</span>
                    <span style={{ fontSize: 11.5, color: MUTED }}>{e.mode === "time" ? "sec" : "reps"} · {s.wt}</span>
                    <span onClick={() => delSet(id, i)} style={{ marginLeft: "auto", fontSize: 11, color: DIM, cursor: "pointer" }}>remove</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: sets.length ? 12 : 0, marginBottom: 10 }}>
                  {tfield({ type: "number", placeholder: e.mode === "time" ? "Seconds" : "Reps", value: si.reps, onChange: e2 => setSi({ ...si, reps: e2.target.value }), style: { width: 96, flexShrink: 0 } })}
                  {tfield({ placeholder: e.mode === "bw" ? "BW / vest" : "Weight", value: si.wt, onChange: e2 => setSi({ ...si, wt: e2.target.value }), style: { flex: 1 } })}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button onClick={addSet} style={{ flex: 1, background: `linear-gradient(100deg,${tc.c}26,${tc.c}14)`, border: `1px solid ${tc.c}55`, borderRadius: 9, padding: 11, color: tc.c, fontSize: 12, fontWeight: 800, letterSpacing: .5, cursor: "pointer", fontFamily: "inherit" }}>+ LOG SET</button>
                  <button onClick={() => saveFlags({ ...flags, [id]: !isFl })} style={{ padding: "11px 14px", background: isFl ? RED + "1A" : CARD, border: `1px solid ${isFl ? RED : BORDER}`, borderRadius: 9, color: isFl ? RED : MUTED, fontSize: 14, cursor: "pointer" }}>⚑</button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditSlot(editSlot?.exId === id ? null : { slotId: plan.id, exId: id })} style={{ flex: 1, padding: "9px 12px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: MUTED, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{editSlot?.exId === id ? "Close editor" : "Swap / edit / note"}</button>
                  <button onClick={() => removeExercise(plan.id, id)} style={{ padding: "9px 12px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: DIM, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>remove</button>
                </div>
                {editSlot?.exId === id && (
                  <div style={{ marginTop: 10, padding: 12, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 9 }}>
                    <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 8 }}>Swap for another exercise hitting the same area:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                      {Object.entries(EX).filter(([eid, ex]) => eid !== id && (HITS[eid] || []).some(h => (HITS[id] || []).includes(h))).slice(0, 8).map(([eid, ex]) => (
                        <button key={eid} onClick={() => swapExercise(plan.id, id, eid)} style={{ padding: "6px 9px", borderRadius: 7, fontSize: 10.5, border: `1px solid ${BORDER}`, background: SURF, color: MUTED, cursor: "pointer" }}>{ex.n}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    {plan.type !== "rest" && <>
      <div style={{ fontSize: 11, color: DIM, textAlign: "center", padding: "4px 0 0" }}>Flag (⚑) anything that felt off — pain, bad form, too easy.</div>
      <Card>
        <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 8, fontWeight: 700 }}>+ Add a custom exercise to this session</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {tfield({ placeholder: "Name", value: customForm.n, onChange: e => setCustomForm({ ...customForm, n: e.target.value }) })}
          <div style={{ display: "flex", gap: 6 }}>
            {tfield({ type: "number", placeholder: "Lo", value: customForm.lo, onChange: e => setCustomForm({ ...customForm, lo: e.target.value }), style: { flex: 1 } })}
            {tfield({ type: "number", placeholder: "Hi", value: customForm.hi, onChange: e => setCustomForm({ ...customForm, hi: e.target.value }), style: { flex: 1 } })}
          </div>
          {tfield({ placeholder: "Note / cue", value: customForm.note, onChange: e => setCustomForm({ ...customForm, note: e.target.value }) })}
          <button onClick={() => { if (customForm.n) { addCustomExercise(plan.id, customForm); setCustomForm({ n: "", mode: "bw", lo: "", hi: "", note: "", cat: "core" }); } }} style={{ background: RED + "1A", border: `1px solid ${RED}55`, borderRadius: 9, padding: 10, color: RED, fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>ADD TO SESSION</button>
        </div>
      </Card>
    </>}
  </>);
}

/* ─────────────────────────  STATS  ───────────────────────── */
function makeSample() {
  const out = []; const today = new Date(); const reps = [3, 4, 5, 5, 7, 8, 10, 12];
  reps.forEach((r, i) => { const d = new Date(today); d.setDate(d.getDate() - (reps.length - 1 - i) * 4); out.push({ date: d.toISOString().split("T")[0], reps: String(r), wt: "BW" }); });
  return out;
}
const SAMPLE = makeSample();

function LineChart({ data, mode }) {
  if (!data || data.length < 2)
    return <div style={{ fontSize: 12.5, color: MUTED, padding: "20px 0", textAlign: "center", lineHeight: 1.5 }}>Log at least 2 sets of this exercise — or train it on 2+ days — and your trend draws here. Tap <b style={{ color: TEXT }}>Preview</b> above to see an example.</div>;
  const val = d => mode === "load" ? est1RM(d.reps, d.wt) : (parseFloat(d.reps) || 0);
  const byDay = {};
  data.forEach(d => { const v = val(d); if (!byDay[d.date] || v > byDay[d.date]) byDay[d.date] = v; });
  const dayKeys = Object.keys(byDay).sort();
  let pts;
  if (dayKeys.length >= 2) pts = dayKeys.slice(-12).map(k => ({ label: fmt(k), v: byDay[k] }));
  else pts = data.slice(-12).map((d, i) => ({ label: `Set ${i + 1}`, v: val(d) }));
  const vals = pts.map(p => p.v); const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1; const W = 380, H = 140, pad = 24;
  const X = i => pad + (i * (W - pad * 2)) / (pts.length - 1 || 1);
  const Y = v => H - pad - ((v - min) / range) * (H - pad * 2);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${X(i)},${Y(p.v)}`).join(" ");
  const area = `${path} L${X(pts.length - 1)},${H - pad} L${X(0)},${H - pad} Z`;
  const up = vals[vals.length - 1] >= vals[0];
  const unit = mode === "load" ? "est 1RM (lb)" : mode === "time" ? "seconds" : "reps";
  const span = dayKeys.length >= 2 ? "by day" : "by set today";
  return (
    <div>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>{unit} · {span} · {up ? <span style={{ color: GREEN }}>trending up ↗</span> : <span style={{ color: RED }}>trending down ↘</span>}</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
        <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={RED} stopOpacity="0.25" /><stop offset="100%" stopColor={RED} stopOpacity="0" /></linearGradient></defs>
        <path d={area} fill="url(#cg)" />
        <path d={path} fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={X(i)} cy={Y(p.v)} r="3.5" fill={BG} stroke={RED} strokeWidth="2" />)}
        <text x={pad} y={H - 6} fill={MUTED} fontSize="9">{pts[0].label}</text>
        <text x={W - pad} y={H - 6} fill={MUTED} fontSize="9" textAnchor="end">{pts[pts.length - 1].label}</text>
        <text x={pad} y={Y(max) - 6} fill={MUTED} fontSize="9">{max}</text>
      </svg>
    </div>
  );
}

export function StatsTab({ Card, Eyebrow, prs, prEdit, setPrEdit, prV, setPrV, savePR, tfield, demo, setDemo, exHist, chartEx, setChartEx, EX, hist, REHAB }) {
  return (<>
    <Card>
      <Eyebrow>Personal Records</Eyebrow>
      <div style={{ marginTop: 8 }}>
        {[{ id: "pullups", l: "Pull-up Max", u: "reps", b: 1 }, { id: "pushups", l: "Push-up Max", u: "reps", b: 20 }, { id: "dips_m", l: "Dip Max", u: "reps", b: 3 }, { id: "dhang", l: "Dead Hang", u: "sec", b: 20 }].map(pr => {
          const st = prs[pr.id]; const val = st?.value ?? pr.b; const prev = st?.prev ?? pr.b; const isNew = st && val > prev; const ed = prEdit === pr.id;
          return (
            <div key={pr.id} style={{ padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{pr.l}</div><div style={{ fontSize: 10.5, color: MUTED, marginTop: 2 }}>{st?.date ? `Updated ${fmt(st.date)}` : "Baseline"}{isNew && <span style={{ color: GREEN, marginLeft: 8, fontWeight: 700 }}>↑ PR</span>}</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "right" }}><span style={{ fontSize: 26, fontWeight: 800, color: RED }}>{val}</span><span style={{ fontSize: 11, color: MUTED, marginLeft: 3 }}>{pr.u}</span></div>
                  <button onClick={() => { setPrEdit(ed ? null : pr.id); setPrV(""); }} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${ed ? RED : BORDER}`, background: ed ? RED + "22" : SURF, color: ed ? RED : MUTED, fontSize: 18, cursor: "pointer" }}>+</button>
                </div>
              </div>
              {ed && <div style={{ display: "flex", gap: 8, marginTop: 10 }}>{tfield({ type: "number", placeholder: `New ${pr.u}`, value: prV, onChange: e => setPrV(e.target.value), style: { flex: 1 } })}<button onClick={savePR} style={{ background: RED + "1A", border: `1px solid ${RED}55`, borderRadius: 9, padding: "10px 16px", color: RED, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>SAVE</button></div>}
            </div>
          );
        })}
      </div>
    </Card>

    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Eyebrow>Strength Trend</Eyebrow>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {!demo && Object.keys(exHist).length > 0 && <select value={chartEx || ""} onChange={e => setChartEx(e.target.value)} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 11, padding: "5px 8px", fontFamily: "inherit", outline: "none" }}>{Object.keys(exHist).map(id => <option key={id} value={id}>{EX[id]?.n || id}</option>)}</select>}
          <button onClick={() => setDemo(!demo)} style={{ background: demo ? RED + "22" : SURF, border: `1px solid ${demo ? RED : BORDER}`, borderRadius: 8, color: demo ? RED : MUTED, fontSize: 10.5, fontWeight: 700, padding: "6px 10px", cursor: "pointer", fontFamily: "inherit" }}>{demo ? "Hide sample" : "Preview"}</button>
        </div>
      </div>
      {demo
        ? <><LineChart data={SAMPLE} mode="bw" /><div style={{ fontSize: 10.5, color: ORANGE, marginTop: 8, fontWeight: 600 }}>SAMPLE DATA — never written to real storage. This is what your pull-up trend looks like after a few weeks of logging.</div></>
        : <LineChart data={exHist[chartEx]} mode={EX[chartEx]?.mode} />}
    </Card>

    <Card>
      <Eyebrow>Pull-up Roadmap → 20</Eyebrow>
      <div style={{ marginTop: 10 }}>
        {[{ p: "Wk 1–2", g: "3×4 negatives (5s descent)", a: true }, { p: "Wk 3–4", g: "3×5 neg + 1–2 full", a: false }, { p: "Wk 5–6", g: "3×3–5 full reps", a: false }, { p: "Wk 7–8", g: "3×5–7 reps", a: false }, { p: "Month 3", g: "3×8–10 reps", a: false }, { p: "Month 6", g: "15–20 reps ✓", a: false }].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 13, padding: "9px 0", borderBottom: i < 5 ? `1px solid ${BORDER}` : "none", opacity: s.a ? 1 : .45 }}>
            <div style={{ width: 58, flexShrink: 0, fontSize: 10.5, fontWeight: 800, color: s.a ? RED : MUTED, paddingTop: 1 }}>{s.p}</div>
            <div style={{ fontSize: 13, fontWeight: s.a ? 700 : 400, color: s.a ? TEXT : MUTED }}>{s.g}</div>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <Eyebrow>History · Last {hist.length} Active Days</Eyebrow>
      {hist.length === 0 ? <div style={{ fontSize: 13, color: MUTED, marginTop: 12 }}>No logged sessions yet. They'll show here as you train.</div> : (
        <>
          <div style={{ display: "flex", gap: 8, margin: "12px 0 16px" }}>
            {[{ l: "Sessions", v: hist.length }, { l: "Sets", v: hist.reduce((a, b) => a + b.sets, 0) }, { l: "Rehab days", v: hist.filter(h => h.rehab === REHAB.length).length }].map(s => (
              <div key={s.l} style={{ flex: 1, background: SURF, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 8px", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: RED }}>{s.v}</div><div style={{ fontSize: 9.5, color: MUTED, letterSpacing: .5, marginTop: 2 }}>{s.l.toUpperCase()}</div></div>
            ))}
          </div>
          {[...hist].reverse().map(h => (
            <div key={h.date} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ width: 38, flexShrink: 0 }}><div style={{ fontSize: 9, color: MUTED, fontWeight: 700 }}>{fmtW(h.date)}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{fmt(h.date).split(" ")[1]}</div></div>
              <div style={{ flex: 1, fontSize: 11.5, color: MUTED }}>{h.sets} sets · {h.kcal > 0 ? `${h.kcal} kcal` : "no food log"}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: h.rehab === REHAB.length ? GREEN : MUTED }}>{h.rehab === REHAB.length ? "rehab ✓" : `rehab ${h.rehab}/${REHAB.length}`}</div>
            </div>
          ))}
        </>
      )}
    </Card>
  </>);
}

/* ─────────────────────────  FUEL  ───────────────────────── */
export function FuelTab({ DateNav, Card, Eyebrow, Bar, food, tgt, showFood, setShowFood, fi, setFi, addFood, tfield, presets, quickAdd, delPreset }) {
  return (<>
    <DateNav />
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div><Eyebrow>Calories</Eyebrow><div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, marginTop: 4 }}>{Math.round(food.kcal)}</div><div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>target {tgt.kcal} · recomp</div></div>
        <div style={{ textAlign: "right" }}><Eyebrow>Left</Eyebrow><div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, marginTop: 4, color: food.kcal > tgt.kcal ? RED : GREEN }}>{Math.max(0, tgt.kcal - Math.round(food.kcal))}</div></div>
      </div>
      {[{ l: "PROTEIN", v: food.pro, m: tgt.pro, c: BLUE }, { l: "CARBS", v: food.carb, m: tgt.carb, c: ORANGE }, { l: "FAT", v: food.fat, m: tgt.fat, c: RED }].map(x => (
        <div key={x.l} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>{x.l}</span><span style={{ fontSize: 11, fontWeight: 700 }}>{Math.round(x.v)}g <span style={{ color: MUTED, fontWeight: 400 }}>/ {x.m}g</span></span></div>
          <Bar v={x.v} m={x.m} c={x.c} />
        </div>
      ))}
    </Card>

    {presets.length > 0 && (
      <Card>
        <Eyebrow>Quick Add</Eyebrow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
          {presets.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => quickAdd(p)} style={{ padding: "8px 12px", borderRadius: 20, border: `1px solid ${BORDER}`, background: SURF, color: TEXT, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{p.name} · {p.kcal}cal</button>
              <button onClick={() => delPreset(i)} style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${BORDER}`, background: "none", color: DIM, fontSize: 11, cursor: "pointer" }}>×</button>
            </div>
          ))}
        </div>
      </Card>
    )}

    <Card>
      <Eyebrow>Carb Timing</Eyebrow>
      <div style={{ marginTop: 8 }}>
        {[["Pre-workout", "40–60g carbs · 25g protein · low fat"], ["Post-workout", "60g carbs · 30g protein within 2h"], ["Evening", "Lower carbs · protein priority"]].map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none" }}><span style={{ fontSize: 13, fontWeight: 600 }}>{c[0]}</span><span style={{ fontSize: 11, color: MUTED, textAlign: "right", maxWidth: 170 }}>{c[1]}</span></div>
        ))}
      </div>
    </Card>

    {showFood ? (
      <Card>
        <Eyebrow>Add Food</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {tfield({ placeholder: "Food name", value: fi.name, onChange: e => setFi({ ...fi, name: e.target.value }) })}
          <div style={{ display: "flex", gap: 6 }}>{[["kcal", "Cal"], ["pro", "P"], ["fat", "F"], ["carb", "C"]].map(([k, p]) => tfield({ key: k, type: "number", placeholder: p, value: fi[k], onChange: e => setFi({ ...fi, [k]: e.target.value }), style: { flex: 1, minWidth: 0, textAlign: "center", padding: "11px 4px" } }))}</div>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: MUTED, cursor: "pointer" }}>
            <input type="checkbox" checked={fi.save} onChange={e => setFi({ ...fi, save: e.target.checked })} /> Save as quick-add preset
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addFood} style={{ flex: 1, background: RED + "1A", border: `1px solid ${RED}55`, borderRadius: 9, padding: 11, color: RED, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>ADD</button>
            <button onClick={() => setShowFood(false)} style={{ flex: 1, background: SURF, border: `1px solid ${BORDER}`, borderRadius: 9, padding: 11, color: MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>CANCEL</button>
          </div>
        </div>
      </Card>
    ) : <button onClick={() => setShowFood(true)} style={{ width: "100%", background: `linear-gradient(100deg,${RED}26,${ORANGE}18)`, border: `1px solid ${RED}55`, borderRadius: 14, padding: 14, color: RED, fontSize: 13, fontWeight: 800, letterSpacing: 1, cursor: "pointer", fontFamily: "inherit" }}>+ LOG FOOD</button>}

    {(food.items || []).length > 0 && (
      <Card>
        <Eyebrow>Today's Log</Eyebrow>
        <div style={{ marginTop: 8 }}>
          {food.items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < food.items.length - 1 ? `1px solid ${BORDER}` : "none" }}>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</div><div style={{ fontSize: 10.5, color: MUTED, marginTop: 2 }}>P {it.pro} · C {it.carb} · F {it.fat}</div></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: ORANGE }}>{it.kcal}</div>
            </div>
          ))}
        </div>
      </Card>
    )}
  </>);
}

/* ─────────────────────────  TRACK (monthly consistency)  ───────────────────────── */
export function TrackTab({ Card, Eyebrow, trackMonth, setTrackMonth, monthCells, DAY_STATUS, setSelDate, setTab }) {
  const [y, m] = trackMonth.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const firstDow = new Date(y, m - 1, 1).getDay();
  const cellColor = (dk) => {
    const c = monthCells[dk];
    if (!c) return BORDER;
    if (!c.status) return "#34343C"; // silent miss
    return DAY_STATUS[c.status]?.c || BORDER;
  };
  const dates = Object.keys(monthCells).sort();
  let streak = 0, longest = 0, cur = 0;
  for (const dk of dates) {
    const c = monthCells[dk];
    const breaks = c && !c.status; // only a silent unflagged miss breaks streak
    if (!breaks && c?.status) { cur++; longest = Math.max(longest, cur); } else cur = 0;
  }
  streak = cur;
  const shiftMonth = (n) => { const d = new Date(y, m - 1 + n, 1); setTrackMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`); };

  return (<>
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Eyebrow>Monthly Consistency</Eyebrow>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => shiftMonth(-1)} style={{ ...navBtnStyle }}>‹</button>
          <button onClick={() => shiftMonth(1)} style={{ ...navBtnStyle }}>›</button>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 12 }}>{new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
        {Array.from({ length: firstDow }).map((_, i) => <div key={"e" + i} />)}
        {Array.from({ length: days }, (_, i) => i + 1).map(d => {
          const dk = `${trackMonth}-${String(d).padStart(2, "0")}`;
          return (
            <div key={d} onClick={() => { setSelDate(dk); setTab("log"); }} title={dk} style={{ aspectRatio: "1", borderRadius: 5, background: cellColor(dk), cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 8, color: "#000000AA", fontWeight: 700 }}>{d}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
        {Object.entries(DAY_STATUS).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 9, height: 9, borderRadius: 2, background: v.c }} /><span style={{ fontSize: 10, color: MUTED }}>{v.label}</span></div>
        ))}
      </div>
    </Card>
    <Card>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, background: SURF, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 8px", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: GREEN }}>{streak}</div><div style={{ fontSize: 9.5, color: MUTED, letterSpacing: .5, marginTop: 2 }}>CURRENT STREAK</div></div>
        <div style={{ flex: 1, background: SURF, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 8px", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: ORANGE }}>{longest}</div><div style={{ fontSize: 9.5, color: MUTED, letterSpacing: .5, marginTop: 2 }}>LONGEST STREAK</div></div>
      </div>
      <div style={{ fontSize: 11, color: MUTED, marginTop: 10, lineHeight: 1.5 }}>Planned rest and flagged sick/injury days don't break a streak. A silent, unflagged miss does. Tap any day to review or back-date it.</div>
    </Card>
  </>);
}
const navBtnStyle = { width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: SURF, color: TEXT, fontSize: 13, cursor: "pointer" };

/* ─────────────────────────  SETTINGS  ───────────────────────── */
export function SettingsTab({ Card, Eyebrow, tfield, phase, savePhase, tgt, saveTgt, presets, delPreset, fileRef, handleImport, clearance, saveClearance, PLYO_STAGES, cycle }) {
  const [draft, setDraft] = useState(tgt);
  const fatLow = +draft.fat < 55;
  return (<>
    <Card>
      <Eyebrow>Backup</Eyebrow>
      <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, margin: "8px 0 12px" }}>iOS Safari can evict localStorage after ~7 days of inactivity. Export regularly — this is the only thing that protects your history.</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={exportAll} style={{ flex: 1, background: RED + "1A", border: `1px solid ${RED}55`, borderRadius: 9, padding: 11, color: RED, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>EXPORT DATA</button>
        <button onClick={() => fileRef.current?.click()} style={{ flex: 1, background: SURF, border: `1px solid ${BORDER}`, borderRadius: 9, padding: 11, color: TEXT, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>IMPORT DATA</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} style={{ display: "none" }} />
      </div>
    </Card>

    <Card>
      <Eyebrow>Training Phase</Eyebrow>
      <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, margin: "8px 0 12px" }}>Phase 1 excludes all impact/plyo leg work while MTSS clears. Phase 2 unlocks a progressive plyometric track — only after the clearance checklist below.</div>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2].map(p => <button key={p} onClick={() => savePhase(p)} style={{ flex: 1, padding: 11, borderRadius: 9, border: `1px solid ${phase === p ? ORANGE : BORDER}`, background: phase === p ? ORANGE + "22" : SURF, color: phase === p ? ORANGE : MUTED, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Phase {p}</button>)}
      </div>
      {phase === 2 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Clearance checklist</div>
          {[["noTenderness", "No medial-tibia tenderness on palpation"], ["painFree", "Pain-free through full calf/tib loading, walking, biking"], ["providerCleared", "Cleared by PT / provider"]].map(([k, l]) => (
            <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: MUTED, padding: "6px 0", cursor: "pointer" }}>
              <input type="checkbox" checked={!!clearance[k]} onChange={e => saveClearance({ ...clearance, [k]: e.target.checked })} /> {l}
            </label>
          ))}
          <div style={{ fontSize: 10.5, color: clearance.noTenderness && clearance.painFree && clearance.providerCleared ? GREEN : DIM, marginTop: 8, fontWeight: 700 }}>
            {clearance.noTenderness && clearance.painFree && clearance.providerCleared ? "✓ Cleared to progress plyo stages" : "Not cleared yet — keep Phase 1 leg work"}
          </div>
          <div style={{ marginTop: 12 }}>
            {PLYO_STAGES.map(s => (
              <div key={s.id} onClick={() => saveClearance({ ...clearance, stage: s.id })} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}`, opacity: clearance.stage >= s.id - 1 ? 1 : .4, cursor: "pointer" }}>
                <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{s.id}. {s.n}</div><div style={{ fontSize: 10.5, color: MUTED }}>{s.d}</div></div>
                {clearance.stage === s.id && <span style={{ color: GREEN, fontSize: 12 }}>current</span>}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: MUTED, marginTop: 8, fontStyle: "italic" }}>Regress a stage on any 24–48h tenderness. Not medical advice — confirm with whoever manages your rehab.</div>
        </div>
      )}
    </Card>

    <Card>
      <Eyebrow>Macro Targets</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
        {[["kcal", "Calories"], ["pro", "Protein (g)"], ["fat", "Fat (g)"], ["carb", "Carbs (g)"]].map(([k, l]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: MUTED, width: 90 }}>{l}</span>
            {tfield({ type: "number", value: draft[k], onChange: e => setDraft({ ...draft, [k]: e.target.value }), style: { flex: 1 } })}
          </div>
        ))}
        {fatLow && <div style={{ fontSize: 11, color: ORANGE, lineHeight: 1.5, background: ORANGE + "14", border: `1px solid ${ORANGE}40`, borderRadius: 8, padding: "9px 11px" }}>⚠ Fat below 55g — at 16, male, fat below ~0.3g/lb or ~20% of calories risks suppressing testosterone, which hurts muscle, recovery, and growth. Not blocked, just flagging the tradeoff.</div>}
        <button onClick={() => saveTgt({ kcal: +draft.kcal, pro: +draft.pro, fat: +draft.fat, carb: +draft.carb })} style={{ background: RED + "1A", border: `1px solid ${RED}55`, borderRadius: 9, padding: 11, color: RED, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>SAVE TARGETS</button>
        <div style={{ fontSize: 10.5, color: MUTED, lineHeight: 1.5 }}>Watch the scale/mirror over 2–3 weeks and adjust calories ±200 from there.</div>
      </div>
    </Card>

    {presets.length > 0 && (
      <Card>
        <Eyebrow>Food Presets</Eyebrow>
        <div style={{ marginTop: 8 }}>
          {presets.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 12.5 }}>{p.name} — {p.kcal} cal</span>
              <button onClick={() => delPreset(i)} style={{ background: "none", border: "none", color: DIM, fontSize: 11, cursor: "pointer" }}>delete</button>
            </div>
          ))}
        </div>
      </Card>
    )}
  </>);
}
