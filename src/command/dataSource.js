/**
 * Data source — the ONLY module Round 2 changes.
 *
 * Round 1: resolves the mock Notion query responses through a small fake
 * latency so the sync animation has something real to show.
 *
 * Round 2: replace the bodies with real calls (via a trivial API route that
 * holds the integration token) returning the same Notion query-response
 * shape. Signatures and return shapes must not change.
 */
import { mockProjectsResponse, mockSubGoalsResponse } from "./notionMock.js";

const fakeLatency = () => 180 + Math.random() * 320;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** → Notion query response for "Command Center — Projects". */
export async function fetchProjectsRaw() {
  await delay(fakeLatency());
  return structuredClone(mockProjectsResponse);
}

/** → Notion query response for the Sub-goals database. */
export async function fetchSubGoalsRaw() {
  await delay(fakeLatency());
  return structuredClone(mockSubGoalsResponse);
}
