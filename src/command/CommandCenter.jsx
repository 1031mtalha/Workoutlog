/**
 * COMMAND CENTER — Round 1 HUD (mock Notion feed).
 * Jarvis-style ops console: dark, cyan accent lines, mono type, scan-line
 * texture, centered holographic gyro core, live 60s poll cycle (mock source
 * behind dataSource.js). Desktop-only by design.
 */
import { useEffect, useMemo, useState } from "react";
import { useCommandData, POLL_MS } from "./useCommandData.js";
import { daysSince, daysUntil, PROJECT_STATUSES } from "./notionParse.js";

/* ── tokens ── */
const ACCENT = "#38BDF8";
const ACCENT_HI = "#7DD3FC";
const AMBER = "#E3B341";
const RED = "#F85149";
const GREEN = "#3FB950";

/** Notion status color name → dark-surface hex (Round 2 gets real names from the API). */
const NOTION_COLOR = {
  default: "#9BA3AE", gray: "#9BA3AE", blue: "#58A6FF", purple: "#A78BFA",
  yellow: "#E3B341", green: "#3FB950", red: "#F85149", orange: "#F0883E",
  pink: "#DB61A2", brown: "#B08968",
};
/* Live "Command Center — Projects" status colors, verified 2026-07-07. */
const STATUS_COLOR_NAME = {
  Backlog: "default", Planning: "blue", "In progress": "yellow",
  Paused: "purple", Done: "green", Cancelled: "red",
};
const statusHex = (status) => NOTION_COLOR[status?.color] ?? NOTION_COLOR.default;

const ACTIVE_STATUSES = new Set(["In progress", "Planning"]);
const CLOSED_STATUSES = new Set(["Done", "Cancelled"]);

/* ── small utils ── */
const pad2 = (n) => String(n).padStart(2, "0");
const clockOf = (now) => {
  const d = new Date(now);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};
const dateOf = (now) => {
  const d = new Date(now);
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
};
const shortDate = (iso) => (iso ? `${iso.slice(5, 7)}.${iso.slice(8, 10)}` : "——");
const agoColor = (days) =>
  days == null ? "var(--dim)" : days > 14 ? RED : days > 7 ? AMBER : days > 3 ? "var(--muted)" : ACCENT_HI;

const projectProgress = (goals) => {
  if (!goals?.length) return null;
  return goals.reduce((s, g) => s + (g.progress ?? 0), 0) / goals.length;
};

/* ── derived alerts ── */
function deriveAlerts(projects, subGoals) {
  const alerts = [];
  for (const p of projects ?? []) {
    const stale = daysSince(p.lastUpdated);
    if (ACTIVE_STATUSES.has(p.status.name) && stale != null && stale > 7) {
      alerts.push({ sev: stale > 14 ? "crit" : "warn", text: `STALE Δ${stale}D — ${p.name}` });
    }
    if (p.status.name === "Paused" && (p.priority ?? 0) >= 3) {
      alerts.push({ sev: "warn", text: `PAUSED AT P${p.priority} — ${p.name}` });
    }
    for (const g of subGoals?.get(p.id) ?? []) {
      const dl = daysUntil(g.targetDate);
      if (g.status.name !== "Done" && !CLOSED_STATUSES.has(p.status.name) && dl != null && dl < 0) {
        alerts.push({ sev: "crit", text: `TARGET OVERDUE ${-dl}D — ${g.name} (${p.name})` });
      }
    }
  }
  return alerts.sort((a, b) => (a.sev === "crit" ? -1 : 1) - (b.sev === "crit" ? -1 : 1));
}

/* ── atoms ── */
function Corners() {
  return (
    <>
      <i className="cc-corner tl" /><i className="cc-corner tr" />
      <i className="cc-corner bl" /><i className="cc-corner br" />
    </>
  );
}

function StatusChip({ status }) {
  const hex = statusHex(status);
  const pulsing = status?.name === "In progress";
  return (
    <span className="cc-chip" style={{ color: hex, borderColor: `${hex}55` }}>
      <i className={`cc-dot${pulsing ? " pulse" : ""}`} style={{ background: hex }} />
      {(status?.name ?? "—").toUpperCase()}
    </span>
  );
}

function Bar({ value, color = ACCENT, height = 4 }) {
  return (
    <span className="cc-bar" style={{ height }}>
      <span className="cc-barfill" style={{ width: `${Math.round((value ?? 0) * 100)}%`, background: color }} />
    </span>
  );
}

function PriorityTicks({ n }) {
  return (
    <span className="cc-ticks" title={`Priority ${n ?? "—"}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} style={{ background: i <= (n ?? 0) ? ACCENT : "rgba(125,211,252,.14)" }} />
      ))}
    </span>
  );
}

/* ── header ── */
function Header({ now, lastSync, syncing }) {
  const sinceMs = lastSync ? now - lastSync : null;
  const nextMs = lastSync ? Math.max(0, POLL_MS - sinceMs) : null;
  const frac = lastSync ? Math.min(1, sinceMs / POLL_MS) : 0;
  return (
    <header className="cc-header cc-boot">
      <div className="cc-title">
        <div className="cc-h1">◤ COMMAND CENTER</div>
        <div className="cc-sub">PERSONAL OPS CONSOLE · v0.3 · FEED: <span style={{ color: AMBER }}>MOCK / NOTION-SHAPE</span></div>
      </div>
      <div className="cc-clockblock">
        <div className="cc-clock">{clockOf(now)}</div>
        <div className="cc-sub" style={{ textAlign: "right" }}>{dateOf(now)} LOCAL</div>
      </div>
      <div className="cc-sync">
        <div className="cc-syncrow">
          <span className="cc-pingwrap">
            <i className="cc-dot pulse" style={{ background: syncing ? AMBER : GREEN }} />
            {lastSync && <i key={lastSync} className="cc-ping" />}
          </span>
          <span style={{ color: syncing ? AMBER : "var(--text)" }}>
            {syncing ? "SYNCING…" : `LAST REFRESH ${clockOf(lastSync ?? now)}`}
          </span>
        </div>
        <div className="cc-syncrow dim">
          {lastSync ? `NEXT POLL T-${pad2(Math.ceil(nextMs / 1000))}S · CYCLE 60S` : "AWAITING FIRST SYNC"}
        </div>
        <Bar value={frac} height={2} color={syncing ? AMBER : ACCENT} />
      </div>
    </header>
  );
}

/* ── holographic gyro core (page centerpiece) ── */
function ArcCore({ pct, focus, active, syncing }) {
  const R = 118, C = 2 * Math.PI * R;
  return (
    <div className="cc-core cc-boot" style={{ animationDelay: "120ms" }}>
      <div className="cc-corek top">CORE // MISSION PROGRESS</div>
      <div className="cc-gyro">
        <span className="cc-gring g1" />
        <span className="cc-gring g2" />
        <span className="cc-gring g3" />
        <span className="cc-sweep" style={{ animationDuration: syncing ? "1.2s" : "7s" }} />
        <span className="cc-orbiter"><i /></span>
        <svg className="cc-gsvg" viewBox="0 0 340 340" aria-hidden="true">
          <g className="cc-spin-slow">
            <circle cx="170" cy="170" r="165" fill="none" stroke="rgba(125,211,252,.15)" strokeWidth="1" strokeDasharray="3 10" />
          </g>
          <g className="cc-spin-slower">
            <circle cx="170" cy="170" r="150" fill="none" stroke="rgba(125,211,252,.32)" strokeWidth="3" strokeDasharray="1.5 9" />
          </g>
          <g className="cc-spin-rev">
            <circle cx="170" cy="170" r="136" fill="none" stroke="rgba(56,189,248,.28)" strokeWidth="1.5" strokeDasharray="52 18" />
          </g>
          <circle
            className="cc-garc" cx="170" cy="170" r={R} fill="none"
            stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * C} ${C}`}
            transform="rotate(-90 170 170)"
          />
          <circle cx="170" cy="170" r={R} fill="none" stroke="rgba(125,211,252,.12)" strokeWidth="1" />
          <circle cx="170" cy="170" r="64" fill="rgba(56,189,248,.05)" stroke="rgba(125,211,252,.16)" strokeWidth="1" strokeDasharray="2 6" />
        </svg>
        <div className="cc-corecenter">
          <div className="cc-corev">{pct}<span className="cc-corepct">%</span></div>
          <div className="cc-corek">{active} ACTIVE OPS</div>
        </div>
      </div>
      <div className="cc-corefoot">
        <div><span className="cc-nextk">FOCUS ▸</span> {focus ? focus.toUpperCase() : "NO ACTIVE TARGET"}</div>
        <div className="cc-corefsub">SWEEP = LIVE FEED · POLL CYCLE 60S</div>
      </div>
    </div>
  );
}

/* ── stat tiles (flank the core) ── */
function computeTiles(projects, subGoals, alerts) {
  if (!projects) return [];
  const count = (s) => projects.filter((p) => p.status.name === s).length;
  const allGoals = [...subGoals.values()].flat();
  const goalsDone = allGoals.filter((g) => g.status.name === "Done").length;
  const openProjects = projects.filter((p) => !CLOSED_STATUSES.has(p.status.name));
  const stale = openProjects.filter((p) => ACTIVE_STATUSES.has(p.status.name) && (daysSince(p.lastUpdated) ?? 0) > 7).length;
  const upcoming = openProjects
    .flatMap((p) => (subGoals.get(p.id) ?? []).map((g) => ({ ...g, project: p.name })))
    .filter((g) => g.status.name !== "Done" && g.targetDate && daysUntil(g.targetDate) >= 0)
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))[0];
  return [
    { k: "ACTIVE", v: count("In progress"), note: "IN PROGRESS" },
    { k: "QUEUED", v: count("Backlog") + count("Planning"), note: "BACKLOG + PLANNING" },
    { k: "SUB-GOALS", v: `${goalsDone}/${allGoals.length}`, note: "COMPLETE", bar: allGoals.length ? goalsDone / allGoals.length : 0 },
    { k: "NEXT TARGET", v: upcoming ? `T-${daysUntil(upcoming.targetDate)}D` : "—", note: upcoming ? upcoming.name.toUpperCase() : "NOTHING SCHEDULED" },
    { k: "STALE >7D", v: stale, note: "NEEDS AN UPDATE", tone: stale > 0 ? AMBER : GREEN },
    { k: "ALERTS", v: alerts.length, note: "DERIVED SIGNALS", tone: alerts.length > 0 ? AMBER : GREEN },
  ];
}

function TileColumn({ tiles, lastSync, side }) {
  return (
    <div className={`cc-tilecol ${side}`}>
      {tiles.map((t, i) => (
        <div key={t.k} className="cc-tile cc-boot" style={{ animationDelay: `${160 + i * 70}ms` }}>
          <Corners />
          <div className="cc-tilek">{t.k}</div>
          <div key={lastSync} className="cc-tilev cc-flicker" style={{ color: t.tone ?? ACCENT_HI }}>{t.v}</div>
          <div className="cc-tilen">{t.note}</div>
          {t.bar != null && <Bar value={t.bar} height={3} />}
        </div>
      ))}
    </div>
  );
}

/* ── project card ── */
function SubGoalRow({ goal, now }) {
  const hex = statusHex(goal.status);
  const dl = daysUntil(goal.targetDate, now);
  const overdue = goal.status.name !== "Done" && dl != null && dl < 0;
  return (
    <div className="cc-sgrow">
      <i className="cc-dot" style={{ background: hex }} />
      <span className="cc-sgname" style={{ opacity: goal.status.name === "Done" ? 0.55 : 1 }}>{goal.name}</span>
      <span className="cc-sgstatus" style={{ color: hex }}>{goal.status.name.toUpperCase()}</span>
      <span className="cc-sgbar"><Bar value={goal.progress} color={hex} height={4} /></span>
      <span className="cc-sgpct">{Math.round((goal.progress ?? 0) * 100)}%</span>
      <span className="cc-sgtarget" style={{ color: overdue ? RED : "var(--dim)" }}>
        {!goal.targetDate ? "NO TARGET"
          : overdue ? `OVERDUE ${-dl}D`
          : goal.status.name === "Done" ? `CLOSED · ${shortDate(goal.targetDate)}`
          : `T-${dl}D · ${shortDate(goal.targetDate)}`}
      </span>
    </div>
  );
}

function ProjectCard({ project, goals, now, index }) {
  const [open, setOpen] = useState(project.status.name === "In progress");
  const hex = statusHex(project.status);
  const stale = daysSince(project.lastUpdated, now);
  const prog = projectProgress(goals);
  const done = goals.filter((g) => g.status.name === "Done").length;
  const closed = CLOSED_STATUSES.has(project.status.name);
  const { start, end } = project.dates;
  const winFrac = start && end
    ? Math.min(1, Math.max(0, (now - new Date(`${start}T00:00:00`)) / (new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`))))
    : null;

  return (
    <div
      className="cc-card cc-boot"
      style={{ borderLeftColor: hex, opacity: closed ? 0.55 : 1, animationDelay: `${260 + index * 80}ms` }}
    >
      <button className="cc-cardhead" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="cc-prio">P{project.priority ?? "—"}</span>
        <PriorityTicks n={project.priority} />
        <span className="cc-cardname">{project.name.toUpperCase()}</span>
        <StatusChip status={project.status} />
        <span className={`cc-chev${open ? " open" : ""}`}>▾</span>
      </button>

      <div className="cc-next">
        <span className="cc-nextk">NEXT ▸</span> {project.nextAction || "—"}
      </div>

      <div className="cc-meta">
        <span>OWNER {project.owner[0]?.name?.toUpperCase() ?? "—"}</span>
        <span className="cc-window">
          WINDOW {shortDate(start)}→{shortDate(end)}
          {winFrac != null && <span className="cc-winbar"><span style={{ width: `${winFrac * 100}%` }} /></span>}
        </span>
        <span style={{ color: agoColor(stale) }}>Δ{stale ?? "—"}D SINCE UPDATE</span>
        <span>SUB {done}/{goals.length}</span>
      </div>

      {goals.length > 0 && (
        <div className="cc-aggrow">
          <Bar value={prog} color={hex} height={4} />
          <span className="cc-sgpct">{Math.round((prog ?? 0) * 100)}%</span>
        </div>
      )}

      {open && (
        <div className="cc-sglist">
          {goals.length ? goals.map((g) => <SubGoalRow key={g.id} goal={g} now={now} />)
            : <div style={{ color: "var(--dim)", fontSize: 11 }}>NO SUB-GOALS LOGGED</div>}
        </div>
      )}
    </div>
  );
}

/* ── right rail panels ── */
function Panel({ title, children, delay = 0 }) {
  return (
    <section className="cc-panel cc-boot" style={{ animationDelay: `${delay}ms` }}>
      <Corners />
      <div className="cc-panelt">{title}</div>
      {children}
    </section>
  );
}

function StatusDistribution({ projects }) {
  const counts = PROJECT_STATUSES.map((name) => ({
    name,
    n: projects.filter((p) => p.status.name === name).length,
  }));
  const total = projects.length || 1;
  return (
    <>
      <div className="cc-seg">
        {counts.filter((c) => c.n > 0).map((c) => (
          <span key={c.name} style={{ flex: c.n, background: NOTION_COLOR[STATUS_COLOR_NAME[c.name]] }} title={`${c.name}: ${c.n}`} />
        ))}
      </div>
      <div className="cc-legend">
        {counts.map((c) => (
          <div key={c.name} className="cc-legrow" style={{ opacity: c.n ? 1 : 0.35 }}>
            <i className="cc-dot" style={{ background: NOTION_COLOR[STATUS_COLOR_NAME[c.name]] }} />
            <span>{c.name.toUpperCase()}</span>
            <b>{c.n}</b>
          </div>
        ))}
      </div>
      <div className="cc-panelnote">{total} PROJECTS TRACKED</div>
    </>
  );
}

function RecencyBars({ projects, now }) {
  const rows = [...projects]
    .map((p) => ({ p, d: daysSince(p.lastUpdated, now) ?? 0 }))
    .sort((a, b) => b.d - a.d);
  const max = Math.max(14, ...rows.map((r) => r.d));
  return (
    <div className="cc-recency">
      {rows.map(({ p, d }) => (
        <div key={p.id} className="cc-recrow">
          <span className="cc-recname">{p.name.toUpperCase()}</span>
          <span className="cc-rectrack">
            <span className="cc-recmark" style={{ left: `${(7 / max) * 100}%` }} title="7-day stale threshold" />
            <span className="cc-recfill" style={{ width: `${Math.max(3, (d / max) * 100)}%`, background: agoColor(d) }} />
          </span>
          <b style={{ color: agoColor(d) }}>{d}D</b>
        </div>
      ))}
      <div className="cc-panelnote">DAYS SINCE LAST UPDATE · MARK = 7D THRESHOLD</div>
    </div>
  );
}

function Alerts({ alerts }) {
  if (!alerts.length) return <div className="cc-panelnote" style={{ color: GREEN }}>▣ NO ACTIVE SIGNALS — ALL NOMINAL</div>;
  return (
    <div className="cc-alerts">
      {alerts.map((a, i) => (
        <div key={i} className="cc-alertrow" style={{ color: a.sev === "crit" ? RED : AMBER }}>
          <span>▲</span><span>{a.text.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function EventLog({ log }) {
  return (
    <div className="cc-log">
      {log.map((e, i) => (
        <div key={e.t + e.line} className="cc-logrow" style={{ color: e.tone === "err" ? RED : e.tone === "sys" ? "var(--muted)" : "var(--dim)" }}>
          <span className="cc-logt">{clockOf(e.t)}</span>
          <span>{e.line}</span>
          {i === 0 && <span className="cc-cursor" />}
        </div>
      ))}
    </div>
  );
}

/* ── root ── */
export default function CommandCenter() {
  const { projects, subGoals, lastSync, syncing, log } = useCommandData();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    document.title = "COMMAND CENTER";
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(
    () => (projects ? [...projects].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)) : null),
    [projects],
  );
  const alerts = useMemo(() => deriveAlerts(projects, subGoals), [projects, subGoals]);
  const tiles = useMemo(() => computeTiles(sorted, subGoals, alerts), [sorted, subGoals, alerts]);

  const openProjects = sorted?.filter((p) => !CLOSED_STATUSES.has(p.status.name)) ?? [];
  const corePct = Math.round((projectProgress(openProjects.flatMap((p) => subGoals.get(p.id) ?? [])) ?? 0) * 100);
  const focus = sorted?.filter((p) => p.status.name === "In progress")
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0];

  return (
    <div className="cc-root">
      <style>{CSS}</style>
      <div className="cc-scan" aria-hidden="true" />
      <div className="cc-beam" aria-hidden="true" />

      <Header now={now} lastSync={lastSync} syncing={syncing} />

      {!sorted ? (
        <div className="cc-loading">ESTABLISHING FEED<span className="cc-cursor" /></div>
      ) : (
        <>
          <div className="cc-hero">
            <span className="cc-heroback b1" aria-hidden="true" />
            <span className="cc-heroback b2" aria-hidden="true" />
            <TileColumn tiles={tiles.slice(0, 3)} lastSync={lastSync} side="left" />
            <ArcCore
              pct={corePct}
              focus={focus?.name}
              active={sorted.filter((p) => p.status.name === "In progress").length}
              syncing={syncing}
            />
            <TileColumn tiles={tiles.slice(3)} lastSync={lastSync} side="right" />
          </div>

          <main className="cc-grid">
            <section className="cc-queue">
              <div className="cc-secthead cc-boot" style={{ animationDelay: "240ms" }}>
                PRIORITY QUEUE <span className="cc-sectsub">// SORTED BY PRIORITY DESC</span>
              </div>
              {sorted.map((p, i) => (
                <ProjectCard key={p.id} project={p} goals={subGoals.get(p.id) ?? []} now={now} index={i} />
              ))}
            </section>
            <aside className="cc-rail">
              <Panel title="STATUS DISTRIBUTION" delay={320}><StatusDistribution projects={sorted} /></Panel>
              <Panel title="UPDATE RECENCY" delay={400}><RecencyBars projects={sorted} now={now} /></Panel>
              <Panel title="ALERT STACK" delay={480}><Alerts alerts={alerts} /></Panel>
              <Panel title="EVENT LOG" delay={560}><EventLog log={log} /></Panel>
            </aside>
          </main>
        </>
      )}

      <footer className="cc-footer">
        <span>ROUND 1 · MOCK FEED IN LIVE NOTION SCHEMA SHAPE · POLL CYCLE 60S</span>
        <a href="#/fit">FITNESS TRACKER ↗</a>
      </footer>
    </div>
  );
}

/* ── stylesheet (desktop-only console) ── */
const CSS = `
:root { --bg:#04070C; --panel:#081019; --line:rgba(56,189,248,.16); --line-soft:rgba(56,189,248,.08);
  --text:#D5E4F0; --muted:#7E97AB; --dim:#4A6072; }
.cc-root { min-height:100vh; background:var(--bg); color:var(--text); position:relative; overflow-x:hidden;
  font-family:ui-monospace,"JetBrains Mono","SFMono-Regular",Menlo,Consolas,monospace;
  font-variant-numeric:tabular-nums; padding:36px clamp(28px,5vw,80px) 52px;
  background-image:
    radial-gradient(1400px 600px at 50% -10%, rgba(56,189,248,.07), transparent 60%),
    repeating-linear-gradient(0deg, rgba(125,211,252,.018) 0 1px, transparent 1px 56px),
    repeating-linear-gradient(90deg, rgba(125,211,252,.018) 0 1px, transparent 1px 56px); }
.cc-scan { position:fixed; inset:0; pointer-events:none; z-index:5;
  background:repeating-linear-gradient(0deg, rgba(0,0,0,.12) 0 1px, transparent 1px 3px); }
.cc-beam { position:fixed; left:0; right:0; height:120px; pointer-events:none; z-index:4; opacity:.5;
  background:linear-gradient(180deg, transparent, rgba(56,189,248,.05), transparent);
  animation:ccBeam 9s linear infinite; }
@keyframes ccBeam { from { top:-14%; } to { top:114%; } }
@keyframes ccBoot { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
.cc-boot { animation:ccBoot .6s cubic-bezier(.2,.7,.2,1) backwards; }
@keyframes ccPulse { 0%,100% { opacity:1; } 50% { opacity:.35; } }
@keyframes ccPingA { from { transform:scale(.6); opacity:.8; } to { transform:scale(3); opacity:0; } }
@keyframes ccBlink { 0%,49% { opacity:1; } 50%,100% { opacity:0; } }
@keyframes ccFill { from { width:0; } }
@keyframes ccFlicker { 0% { opacity:0; } 12% { opacity:1; } 24% { opacity:.4; } 36% { opacity:1; } 100% { opacity:1; } }
.cc-flicker { animation:ccFlicker .7s linear backwards; }
@keyframes ccSpin { to { transform:rotate(360deg); } }

/* header */
.cc-header { display:flex; gap:44px; align-items:flex-end; flex-wrap:wrap; padding-bottom:24px;
  border-bottom:1px solid var(--line); margin-bottom:44px; }
.cc-title { flex:1 1 300px; min-width:0; }
.cc-h1 { font-size:clamp(22px,2.8vw,32px); letter-spacing:.32em; color:${ACCENT_HI};
  text-shadow:0 0 22px rgba(56,189,248,.5); }
.cc-sub { font-size:10.5px; letter-spacing:.2em; color:var(--dim); margin-top:8px; }
.cc-clockblock { text-align:right; }
.cc-clock { font-size:clamp(22px,2.5vw,28px); letter-spacing:.14em; color:var(--text); }
.cc-sync { min-width:250px; display:flex; flex-direction:column; gap:8px; font-size:11px; letter-spacing:.12em; }
.cc-syncrow { display:flex; align-items:center; gap:10px; }
.cc-syncrow.dim { color:var(--dim); }
.cc-pingwrap { position:relative; width:8px; height:8px; display:inline-block; flex:none; }
.cc-ping { position:absolute; inset:0; border-radius:50%; border:1px solid ${GREEN}; animation:ccPingA 1s ease-out 1 forwards; }

.cc-dot { width:7px; height:7px; border-radius:50%; display:inline-block; flex:none; }
.cc-dot.pulse { animation:ccPulse 1.6s ease-in-out infinite; }
.cc-cursor { display:inline-block; width:7px; height:12px; background:${ACCENT}; margin-left:8px;
  vertical-align:-1px; animation:ccBlink 1s step-end infinite; }
.cc-loading { padding:100px 0; text-align:center; letter-spacing:.3em; color:var(--muted); font-size:14px; }

/* hero: core dead-center, tiles flanking */
.cc-hero { position:relative; display:grid; grid-template-columns:1fr 460px 1fr; gap:44px;
  align-items:center; margin:0 auto 52px; max-width:1560px; }
.cc-heroback { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); border-radius:50%;
  pointer-events:none; border:1px dashed rgba(125,211,252,.07); }
.cc-heroback.b1 { width:620px; height:620px; animation:ccSpin 120s linear infinite; }
.cc-heroback.b2 { width:780px; height:780px; border-style:solid; border-color:rgba(125,211,252,.04);
  animation:ccSpin 180s linear infinite reverse; }
.cc-core { display:flex; flex-direction:column; align-items:center; gap:10px; position:relative; z-index:1; }
.cc-gyro { position:relative; width:400px; height:400px; flex:none; }
.cc-gsvg { position:absolute; inset:0; width:100%; height:100%; }
.cc-spin-slow { transform-origin:50% 50%; animation:ccSpin 60s linear infinite; }
.cc-spin-slower { transform-origin:50% 50%; animation:ccSpin 45s linear infinite; }
.cc-spin-rev { transform-origin:50% 50%; animation:ccSpin 30s linear infinite reverse; }
.cc-garc { filter:drop-shadow(0 0 7px rgba(56,189,248,.7)); transition:stroke-dasharray 1s cubic-bezier(.2,.7,.2,1); }
.cc-gring { position:absolute; inset:52px; border-radius:50%; border:1px solid transparent;
  border-top-color:rgba(125,211,252,.85); border-right-color:rgba(125,211,252,.2); }
.cc-gring.g1 { animation:ccGy1 7s linear infinite; }
.cc-gring.g2 { inset:72px; border-top-color:rgba(56,189,248,.6); animation:ccGy2 11s linear infinite reverse; }
.cc-gring.g3 { inset:92px; border-top-color:rgba(125,211,252,.35); animation:ccGy3 17s linear infinite; }
@keyframes ccGy1 { from { transform:rotateX(62deg) rotateZ(0); } to { transform:rotateX(62deg) rotateZ(360deg); } }
@keyframes ccGy2 { from { transform:rotateY(64deg) rotateX(8deg) rotateZ(0); } to { transform:rotateY(64deg) rotateX(8deg) rotateZ(360deg); } }
@keyframes ccGy3 { from { transform:rotate3d(1,1,0,58deg) rotateZ(0); } to { transform:rotate3d(1,1,0,58deg) rotateZ(360deg); } }
.cc-sweep { position:absolute; inset:28px; border-radius:50%; pointer-events:none;
  background:conic-gradient(from 0deg, rgba(56,189,248,.2), transparent 70deg);
  -webkit-mask:radial-gradient(circle, transparent 34%, #000 35%, #000 100%);
  mask:radial-gradient(circle, transparent 34%, #000 35%, #000 100%);
  animation:ccSpin 7s linear infinite; }
.cc-orbiter { position:absolute; inset:20px; border-radius:50%; animation:ccSpin 14s linear infinite; pointer-events:none; }
.cc-orbiter i { position:absolute; top:-3px; left:50%; margin-left:-3px; width:6px; height:6px; border-radius:50%;
  background:${ACCENT_HI}; box-shadow:0 0 10px rgba(125,211,252,.9); }
.cc-corecenter { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
  justify-content:center; gap:8px; text-align:center; }
.cc-corev { font-size:58px; color:${ACCENT_HI}; letter-spacing:.04em; text-shadow:0 0 30px rgba(56,189,248,.6); }
.cc-corepct { font-size:26px; color:${ACCENT}; }
.cc-corek { font-size:9.5px; letter-spacing:.32em; color:var(--dim); }
.cc-corek.top { margin-bottom:4px; color:${ACCENT_HI}; opacity:.75; }
.cc-corefoot { margin-top:8px; font-size:11.5px; letter-spacing:.12em; display:flex; flex-direction:column;
  gap:8px; align-items:center; text-align:center; }
.cc-corefsub { font-size:9px; letter-spacing:.2em; color:var(--dim); }

.cc-tilecol { display:flex; flex-direction:column; gap:20px; min-width:0; z-index:1; }
.cc-tile { position:relative; background:rgba(8,16,25,.82); border:1px solid var(--line-soft); padding:18px 22px;
  display:flex; flex-direction:column; gap:9px; transition:border-color .3s, box-shadow .3s; }
.cc-tile:hover { border-color:var(--line); box-shadow:0 0 26px rgba(56,189,248,.08) inset; }
.cc-tilek { font-size:10px; letter-spacing:.26em; color:var(--dim); }
.cc-tilev { font-size:32px; letter-spacing:.05em; text-shadow:0 0 18px rgba(125,211,252,.3); }
.cc-tilen { font-size:9.5px; letter-spacing:.16em; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cc-tile .cc-bar { flex:0 0 auto; width:100%; }
.cc-corner { position:absolute; width:8px; height:8px; border-color:${ACCENT}; border-style:solid; border-width:0; opacity:.6; }
.cc-corner.tl { top:-1px; left:-1px; border-top-width:1px; border-left-width:1px; }
.cc-corner.tr { top:-1px; right:-1px; border-top-width:1px; border-right-width:1px; }
.cc-corner.bl { bottom:-1px; left:-1px; border-bottom-width:1px; border-left-width:1px; }
.cc-corner.br { bottom:-1px; right:-1px; border-bottom-width:1px; border-right-width:1px; }

/* main grid */
.cc-grid { display:grid; grid-template-columns:minmax(0,1fr) 390px; gap:32px; align-items:start;
  max-width:1560px; margin:0 auto; }
.cc-grid > * { min-width:0; }
.cc-secthead { font-size:12px; letter-spacing:.28em; color:${ACCENT_HI}; margin:4px 0 22px;
  border-left:2px solid ${ACCENT}; padding-left:13px; }
.cc-sectsub { color:var(--dim); letter-spacing:.14em; }

/* cards */
.cc-card { position:relative; background:var(--panel); border:1px solid var(--line-soft); border-left:2px solid;
  padding:20px 26px 22px; margin-bottom:22px; transition:opacity .3s, border-color .3s, transform .3s, box-shadow .3s; }
.cc-card:hover { border-color:var(--line); transform:translateY(-2px); box-shadow:0 10px 34px rgba(0,0,0,.4), 0 0 26px rgba(56,189,248,.06); }
.cc-cardhead { display:flex; align-items:center; gap:16px; width:100%; min-width:0; background:none; border:none;
  color:inherit; font:inherit; padding:0; cursor:pointer; text-align:left; }
.cc-prio { font-size:20px; color:${ACCENT_HI}; letter-spacing:.04em; text-shadow:0 0 14px rgba(56,189,248,.5); flex:none; }
.cc-ticks { display:inline-flex; gap:3px; flex:none; }
.cc-ticks i { width:4px; height:12px; display:inline-block; }
.cc-cardname { font-size:14px; letter-spacing:.14em; flex:1 1 0; min-width:0;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cc-chip { display:inline-flex; align-items:center; gap:8px; font-size:10px; letter-spacing:.18em;
  border:1px solid; padding:5px 12px; flex:none; }
.cc-chev { color:var(--dim); transition:transform .25s; flex:none; }
.cc-chev.open { transform:rotate(180deg); }
.cc-next { margin:16px 0 13px; font-size:13px; color:var(--text); letter-spacing:.04em; line-height:1.55; }
.cc-nextk { color:${ACCENT}; letter-spacing:.14em; font-size:10.5px; }
.cc-meta { display:flex; flex-wrap:wrap; gap:10px 28px; font-size:10px; letter-spacing:.14em; color:var(--muted); }
.cc-window { display:inline-flex; align-items:center; gap:9px; }
.cc-winbar { width:58px; height:3px; background:rgba(125,211,252,.12); display:inline-block; position:relative; }
.cc-winbar span { position:absolute; inset:0 auto 0 0; background:${ACCENT}; opacity:.7; }
.cc-aggrow { display:flex; align-items:center; gap:12px; margin-top:16px; }
.cc-bar { flex:1 1 auto; background:rgba(125,211,252,.1); display:inline-flex; overflow:hidden; min-width:24px; }
.cc-barfill { display:block; animation:ccFill .9s cubic-bezier(.2,.7,.2,1) backwards; transition:width .6s; }
.cc-sgpct { font-size:10px; color:var(--muted); width:38px; text-align:right; flex:none; }

/* sub-goal rows */
.cc-sglist { margin-top:17px; border-top:1px dashed var(--line-soft); padding-top:16px;
  display:flex; flex-direction:column; gap:13px; }
.cc-sgrow { display:grid; gap:16px; align-items:center; font-size:11.5px; letter-spacing:.07em;
  grid-template-columns:auto minmax(0,1.4fr) 96px minmax(70px,1fr) 38px 130px; }
.cc-sgname { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text); }
.cc-sgstatus { font-size:9px; letter-spacing:.18em; }
.cc-sgbar { display:flex; min-width:0; }
.cc-sgtarget { text-align:right; font-size:9px; letter-spacing:.1em; }

/* rail */
.cc-rail { display:flex; flex-direction:column; gap:22px; min-width:0; }
.cc-panel { position:relative; background:var(--panel); border:1px solid var(--line-soft); padding:18px 20px 20px; }
.cc-panelt { font-size:10.5px; letter-spacing:.26em; color:${ACCENT_HI}; margin-bottom:16px; }
.cc-panelnote { font-size:9px; letter-spacing:.15em; color:var(--dim); margin-top:14px; }
.cc-seg { display:flex; gap:2px; height:10px; margin-bottom:16px; }
.cc-legend { display:grid; grid-template-columns:1fr 1fr; gap:10px 16px; }
.cc-legrow { display:flex; align-items:center; gap:9px; font-size:10px; letter-spacing:.1em; color:var(--muted); }
.cc-legrow b { margin-left:auto; color:var(--text); }
.cc-recency { display:flex; flex-direction:column; gap:12px; }
.cc-recrow { display:grid; grid-template-columns:minmax(0,1fr) 96px 32px; gap:12px; align-items:center;
  font-size:9.5px; letter-spacing:.09em; color:var(--muted); }
.cc-recname { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cc-rectrack { position:relative; height:5px; background:rgba(125,211,252,.08); }
.cc-recfill { position:absolute; inset:0 auto 0 0; animation:ccFill .9s backwards; }
.cc-recmark { position:absolute; top:-2px; bottom:-2px; width:1px; background:var(--dim); }
.cc-recrow b { text-align:right; }
.cc-alerts { display:flex; flex-direction:column; gap:12px; }
.cc-alertrow { display:flex; gap:11px; font-size:10px; letter-spacing:.1em; line-height:1.55; }
.cc-log { display:flex; flex-direction:column; gap:10px; }
.cc-logrow { display:flex; gap:11px; font-size:9.5px; letter-spacing:.07em; align-items:baseline; }
.cc-logt { color:var(--dim); flex:none; }

.cc-footer { margin-top:40px; padding-top:18px; border-top:1px solid var(--line-soft); display:flex;
  justify-content:space-between; flex-wrap:wrap; gap:12px; font-size:9.5px; letter-spacing:.2em; color:var(--dim);
  max-width:1560px; margin-left:auto; margin-right:auto; }
.cc-footer a { color:var(--muted); text-decoration:none; }
.cc-footer a:hover { color:${ACCENT_HI}; }

@media (prefers-reduced-motion:reduce) {
  .cc-boot,.cc-barfill,.cc-recfill,.cc-beam,.cc-dot.pulse,.cc-ping,.cc-cursor,.cc-flicker,
  .cc-gring,.cc-sweep,.cc-spin-slow,.cc-spin-slower,.cc-spin-rev,.cc-orbiter,.cc-heroback { animation:none !important; }
}
`;
