/**
 * Mock Notion data — Round 1.
 *
 * Every object here is shaped exactly like a real Notion API page object as
 * returned by POST /v1/databases/{id}/query. Field names, property types and
 * status values mirror the live "Command Center — Projects" database:
 *
 *   Project name  → title
 *   Status        → status (NOT select — API shape is {status:{name,color,id}})
 *   Next Action   → rich_text
 *   Owner         → people
 *   Dates         → date (range)
 *   Last Updated  → date
 *   Priority      → number 1–5 (new field, mocked ahead of the live DB)
 *
 * Sub-goals use the schema the Round 2 database will be created with:
 *   Sub-goal name → title
 *   Parent Project→ relation → Command Center — Projects
 *   Status        → status (To do / In progress / Done)
 *   Progress      → number, Notion "percent" format (0–1)
 *   Target date   → date
 *
 * Round 2 replaces the exports of dataSource.js with real fetches; nothing in
 * this shape may drift from the live schema.
 */

const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const daysAgo = (n) => iso(Date.now() - n * DAY);
const daysAhead = (n) => iso(Date.now() + n * DAY);

const OWNER = [{ object: "user", id: "user-mt-01", name: "Talha", type: "person" }];

const title = (text) => ({
  id: "title", type: "title",
  title: [{ type: "text", text: { content: text }, plain_text: text }],
});
const richText = (text) => ({
  id: "nxta", type: "rich_text",
  rich_text: text ? [{ type: "text", text: { content: text }, plain_text: text }] : [],
});
const status = (name, color) => ({
  id: "stts", type: "status",
  status: { id: `st-${name.toLowerCase().replace(/\s+/g, "-")}`, name, color },
});
const people = () => ({ id: "ownr", type: "people", people: OWNER });
const dateRange = (start, end) => ({
  id: "dtes", type: "date",
  date: start ? { start, end: end ?? null, time_zone: null } : null,
});
const number = (n) => ({ id: "prio", type: "number", number: n });
const relation = (ids) => ({
  id: "prnt", type: "relation",
  relation: ids.map((id) => ({ id })), has_more: false,
});

const projectPage = (id, props) => ({
  object: "page",
  id,
  created_time: `${daysAgo(90)}T09:00:00.000Z`,
  last_edited_time: `${props["Last Updated"].date.start}T18:30:00.000Z`,
  archived: false,
  properties: props,
});

/* ── Command Center — Projects (7 rows, all six statuses represented) ── */

export const mockProjectsResponse = {
  object: "list",
  type: "page_or_database",
  has_more: false,
  next_cursor: null,
  results: [
    projectPage("proj-veloure-0001", {
      "Project name": title("VELOURE — Fragrance Launch"),
      "Status": status("In progress", "yellow"),
      "Next Action": richText("Lock accord ratios for batch 03 sampling"),
      "Owner": people(),
      "Dates": dateRange(daysAgo(58), daysAhead(56)),
      "Last Updated": { id: "lupd", type: "date", date: { start: daysAgo(1), end: null, time_zone: null } },
      "Priority": number(5),
    }),
    projectPage("proj-leafrig-0002", {
      "Project name": title("Leaf Fluorescence Rig — Plant Research"),
      "Status": status("In progress", "yellow"),
      "Next Action": richText("Calibrate PAM sensor against reference chlorophyll standards"),
      "Owner": people(),
      "Dates": dateRange(daysAgo(97), daysAhead(100)),
      "Last Updated": { id: "lupd", type: "date", date: { start: daysAgo(3), end: null, time_zone: null } },
      "Priority": number(4),
    }),
    projectPage("proj-clinic-0003", {
      "Project name": title("Health Clinic Website"),
      "Status": status("Planning", "blue"),
      "Next Action": richText("Send sitemap + wireframe draft for clinic approval"),
      "Owner": people(),
      "Dates": dateRange(daysAgo(6), daysAhead(54)),
      "Last Updated": { id: "lupd", type: "date", date: { start: daysAgo(5), end: null, time_zone: null } },
      "Priority": number(4),
    }),
    projectPage("proj-commhub-0004", {
      "Project name": title("Community Hub Website"),
      "Status": status("Backlog", "default"),
      "Next Action": richText("Confirm scope + hosting budget with the board"),
      "Owner": people(),
      "Dates": dateRange(daysAhead(25), daysAhead(117)),
      "Last Updated": { id: "lupd", type: "date", date: { start: daysAgo(9), end: null, time_zone: null } },
      "Priority": number(3),
    }),
    projectPage("proj-hospital-0005", {
      "Project name": title("City Hospital — Volunteering Track"),
      "Status": status("Paused", "purple"),
      "Next Action": richText("Re-confirm fall shift schedule with volunteer coordinator"),
      "Owner": people(),
      "Dates": dateRange(daysAgo(156), daysAhead(166)),
      "Last Updated": { id: "lupd", type: "date", date: { start: daysAgo(14), end: null, time_zone: null } },
      "Priority": number(3),
    }),
    projectPage("proj-studiok-0006", {
      "Project name": title("Client Brand Design — Studio K"),
      "Status": status("Done", "green"),
      "Next Action": richText("Archive deliverables + send final invoice"),
      "Owner": people(),
      "Dates": dateRange(daysAgo(67), daysAgo(9)),
      "Last Updated": { id: "lupd", type: "date", date: { start: daysAgo(6), end: null, time_zone: null } },
      "Priority": number(2),
    }),
    projectPage("proj-youthorg-0007", {
      "Project name": title("Youth Org Website"),
      "Status": status("Cancelled", "red"),
      "Next Action": richText("No further action — org moved to a hosted builder"),
      "Owner": people(),
      "Dates": dateRange(daysAgo(114), daysAgo(36)),
      "Last Updated": { id: "lupd", type: "date", date: { start: daysAgo(31), end: null, time_zone: null } },
      "Priority": number(1),
    }),
  ],
};

/* ── Sub-goals (2–4 per project · Progress = percent number 0–1) ── */

const subGoalPage = (id, parentId, name, st, stColor, progress, target) => ({
  object: "page",
  id,
  created_time: `${daysAgo(45)}T09:00:00.000Z`,
  last_edited_time: `${daysAgo(1)}T12:00:00.000Z`,
  archived: false,
  properties: {
    "Sub-goal name": title(name),
    "Parent Project": relation([parentId]),
    "Status": status(st, stColor),
    "Progress": { id: "prog", type: "number", number: progress },
    "Target date": { id: "trgt", type: "date", date: target ? { start: target, end: null, time_zone: null } : null },
  },
});

export const mockSubGoalsResponse = {
  object: "list",
  type: "page_or_database",
  has_more: false,
  next_cursor: null,
  results: [
    // VELOURE
    subGoalPage("sg-001", "proj-veloure-0001", "Accord matrix finalized", "Done", "green", 1, daysAgo(22)),
    subGoalPage("sg-002", "proj-veloure-0001", "Batch 03 sampling round", "In progress", "blue", 0.45, daysAhead(13)),
    subGoalPage("sg-003", "proj-veloure-0001", "Bottle + label supplier shortlist", "In progress", "blue", 0.3, daysAhead(25)),
    subGoalPage("sg-004", "proj-veloure-0001", "Pre-launch landing page", "To do", "default", 0, daysAhead(44)),
    // Leaf Fluorescence Rig
    subGoalPage("sg-005", "proj-leafrig-0002", "Sensor array assembled", "Done", "green", 1, daysAgo(30)),
    subGoalPage("sg-006", "proj-leafrig-0002", "Calibration protocol written", "In progress", "blue", 0.6, daysAhead(18)),
    subGoalPage("sg-007", "proj-leafrig-0002", "Data pipeline → CSV export", "To do", "default", 0, daysAhead(34)),
    // Health Clinic Website
    subGoalPage("sg-008", "proj-clinic-0003", "Requirements call complete", "Done", "green", 1, daysAgo(4)),
    subGoalPage("sg-009", "proj-clinic-0003", "Wireframes v1", "In progress", "blue", 0.25, daysAhead(11)),
    subGoalPage("sg-010", "proj-clinic-0003", "Content inventory from clinic", "To do", "default", 0, daysAhead(21)),
    // Community Hub Website
    subGoalPage("sg-011", "proj-commhub-0004", "Scope one-pager", "To do", "default", 0, daysAhead(29)),
    subGoalPage("sg-012", "proj-commhub-0004", "Stack + hosting decision", "To do", "default", 0, daysAhead(36)),
    // City Hospital Volunteering
    subGoalPage("sg-013", "proj-hospital-0005", "Spring hours logged (40/40)", "Done", "green", 1, daysAgo(40)),
    subGoalPage("sg-014", "proj-hospital-0005", "Fall schedule confirmed", "To do", "default", 0, daysAhead(49)),
    subGoalPage("sg-015", "proj-hospital-0005", "Letter of rec requested", "To do", "default", 0, daysAhead(150)),
    // Client Brand Design — Studio K
    subGoalPage("sg-016", "proj-studiok-0006", "Logo system delivered", "Done", "green", 1, daysAgo(20)),
    subGoalPage("sg-017", "proj-studiok-0006", "Brand guide PDF", "Done", "green", 1, daysAgo(12)),
    subGoalPage("sg-018", "proj-studiok-0006", "Final handoff call", "Done", "green", 1, daysAgo(9)),
    // Youth Org Website
    subGoalPage("sg-019", "proj-youthorg-0007", "Discovery call", "Done", "green", 1, daysAgo(90)),
    subGoalPage("sg-020", "proj-youthorg-0007", "Proposal sent", "Done", "green", 1, daysAgo(70)),
    subGoalPage("sg-021", "proj-youthorg-0007", "Site build", "To do", "default", 0, null),
  ],
};
