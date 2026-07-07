/**
 * Parse-layer tests — run with `npm test` (node --test, no dependencies).
 * The Status test exists because a prior build parsed Notion's native status
 * property as select and broke; this locks the {status:{name,color,id}}
 * shape in from Round 1 so the Round 2 swap can't regress it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseStatus, parseProjectPage, parseProjectsResponse, parseSubGoalsResponse,
  PROJECT_STATUSES, SUBGOAL_STATUSES,
} from "./notionParse.js";
import { mockProjectsResponse, mockSubGoalsResponse } from "./notionMock.js";

test("parseStatus reads the native status shape {status:{name,color,id}}", () => {
  const prop = { id: "x", type: "status", status: { id: "st-1", name: "In progress", color: "blue" } };
  assert.deepEqual(parseStatus(prop), { id: "st-1", name: "In progress", color: "blue" });
});

test("parseStatus does NOT accept a select-shaped property", () => {
  const selectShaped = { id: "x", type: "select", select: { id: "s-1", name: "In progress", color: "blue" } };
  const parsed = parseStatus(selectShaped);
  assert.equal(parsed.name, null, "select payload must not be read as status");
  assert.equal(parsed.color, "default");
});

test("parseStatus tolerates missing/empty property", () => {
  assert.equal(parseStatus(undefined).name, null);
  assert.equal(parseStatus({ type: "status", status: null }).name, null);
});

test("every mock project parses with schema-valid values", () => {
  const projects = parseProjectsResponse(mockProjectsResponse);
  assert.equal(projects.length, 7);
  for (const p of projects) {
    assert.ok(p.name.length > 0, "title parsed");
    assert.ok(PROJECT_STATUSES.includes(p.status.name), `status "${p.status.name}" is a live schema value`);
    assert.ok(Number.isInteger(p.priority) && p.priority >= 1 && p.priority <= 5, "priority 1–5");
    assert.match(p.lastUpdated, /^\d{4}-\d{2}-\d{2}$/, "Last Updated is an ISO date");
    assert.ok(p.owner.length > 0, "owner parsed from people property");
  }
  const statusesUsed = new Set(projects.map((p) => p.status.name));
  assert.equal(statusesUsed.size, 6, "mock spans all six statuses");
});

test("mock sub-goals parse, group by parent relation, and use percent progress (0–1)", () => {
  const byProject = parseSubGoalsResponse(mockSubGoalsResponse);
  const projects = parseProjectsResponse(mockProjectsResponse);
  for (const p of projects) {
    const goals = byProject.get(p.id) ?? [];
    assert.ok(goals.length >= 2 && goals.length <= 4, `${p.name}: 2–4 sub-goals (got ${goals.length})`);
    for (const g of goals) {
      assert.ok(SUBGOAL_STATUSES.includes(g.status.name), `sub-goal status "${g.status.name}" valid`);
      assert.ok(g.progress >= 0 && g.progress <= 1, "progress is Notion percent format 0–1");
      if (g.status.name === "Done") assert.equal(g.progress, 1);
    }
  }
});

test("project page parser reads exact live field names", () => {
  const page = mockProjectsResponse.results[0];
  for (const field of ["Project name", "Status", "Next Action", "Owner", "Dates", "Last Updated", "Priority"]) {
    assert.ok(field in page.properties, `mock carries live field "${field}"`);
  }
  const parsed = parseProjectPage(page);
  assert.equal(parsed.status.color, "blue");
  assert.ok(parsed.dates.start && parsed.dates.end, "Dates is a range");
});
