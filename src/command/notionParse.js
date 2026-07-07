/**
 * Notion property parsers — the only layer that touches raw Notion shapes.
 * Components consume the parsed objects; Round 2 points dataSource.js at the
 * real API and this file works unchanged.
 *
 * Plain ESM, no JSX — also runs under `node --test` (see notionParse.test.js).
 */

export const PROJECT_STATUSES = ["Backlog", "Planning", "In progress", "Paused", "Done", "Cancelled"];
export const SUBGOAL_STATUSES = ["To do", "In progress", "Done"];

const DAY = 86400000;

export function parseTitle(prop) {
  if (!prop || prop.type !== "title" || !Array.isArray(prop.title)) return "";
  return prop.title.map((t) => t.plain_text ?? "").join("");
}

export function parseRichText(prop) {
  if (!prop || prop.type !== "rich_text" || !Array.isArray(prop.rich_text)) return "";
  return prop.rich_text.map((t) => t.plain_text ?? "").join("");
}

/**
 * Status is a native Notion *status* property. The API returns
 * {type:"status", status:{id,name,color}} — structurally different from a
 * select property's {type:"select", select:{...}}. A prior build broke by
 * reading `.select` here, so this parser is deliberately strict: anything
 * that isn't a status-shaped property falls back rather than being guessed.
 */
export function parseStatus(prop) {
  if (prop && prop.type === "select") {
    console.warn("parseStatus: got a select property — Status must be a native status property");
    return { id: null, name: null, color: "default" };
  }
  if (!prop || prop.type !== "status" || !prop.status) {
    return { id: null, name: null, color: "default" };
  }
  const { id = null, name = null, color = "default" } = prop.status;
  return { id, name, color };
}

export function parsePeople(prop) {
  if (!prop || prop.type !== "people" || !Array.isArray(prop.people)) return [];
  return prop.people.map((p) => ({ id: p.id, name: p.name ?? "—" }));
}

export function parseDate(prop) {
  if (!prop || prop.type !== "date" || !prop.date) return { start: null, end: null };
  return { start: prop.date.start ?? null, end: prop.date.end ?? null };
}

export function parseNumber(prop) {
  if (!prop || prop.type !== "number" || typeof prop.number !== "number") return null;
  return prop.number;
}

export function parseRelation(prop) {
  if (!prop || prop.type !== "relation" || !Array.isArray(prop.relation)) return [];
  return prop.relation.map((r) => r.id);
}

/** Whole days since an ISO date string (yyyy-mm-dd); null if absent. */
export function daysSince(isoDate, now = Date.now()) {
  if (!isoDate) return null;
  const then = new Date(`${isoDate}T00:00:00`).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((now - then) / DAY));
}

/** Whole days until an ISO date string; negative = past. */
export function daysUntil(isoDate, now = Date.now()) {
  if (!isoDate) return null;
  const then = new Date(`${isoDate}T00:00:00`).getTime();
  if (Number.isNaN(then)) return null;
  return Math.ceil((then - now) / DAY);
}

/** Command Center — Projects page → view model. */
export function parseProjectPage(page) {
  const p = page.properties ?? {};
  return {
    id: page.id,
    name: parseTitle(p["Project name"]),
    status: parseStatus(p["Status"]),
    nextAction: parseRichText(p["Next Action"]),
    owner: parsePeople(p["Owner"]),
    dates: parseDate(p["Dates"]),
    lastUpdated: parseDate(p["Last Updated"]).start,
    priority: parseNumber(p["Priority"]),
  };
}

/** Sub-goals page → view model. Progress is Notion percent format (0–1). */
export function parseSubGoalPage(page) {
  const p = page.properties ?? {};
  return {
    id: page.id,
    name: parseTitle(p["Sub-goal name"]),
    parentIds: parseRelation(p["Parent Project"]),
    status: parseStatus(p["Status"]),
    progress: parseNumber(p["Progress"]) ?? 0,
    targetDate: parseDate(p["Target date"]).start,
  };
}

export function parseProjectsResponse(res) {
  return (res?.results ?? []).map(parseProjectPage);
}

export function parseSubGoalsResponse(res) {
  const parsed = (res?.results ?? []).map(parseSubGoalPage);
  const byProject = new Map();
  for (const sg of parsed) {
    for (const pid of sg.parentIds) {
      if (!byProject.has(pid)) byProject.set(pid, []);
      byProject.get(pid).push(sg);
    }
  }
  return byProject;
}
