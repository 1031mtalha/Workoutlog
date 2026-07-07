/**
 * Polling data hook. Round 1 runs the real ~60s cycle against the mock data
 * source so the sync UI, countdown and layout are proven before Round 2 puts
 * a live API behind the same hook.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProjectsRaw, fetchSubGoalsRaw } from "./dataSource.js";
import { parseProjectsResponse, parseSubGoalsResponse } from "./notionParse.js";

export const POLL_MS = 60000;
const MAX_LOG = 12;

export function useCommandData() {
  const [projects, setProjects] = useState(null);
  const [subGoals, setSubGoals] = useState(new Map());
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);
  const alive = useRef(true);

  const pushLog = useCallback((line, tone = "ok") => {
    setLog((prev) => [{ t: Date.now(), line, tone }, ...prev].slice(0, MAX_LOG));
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    const started = performance.now();
    try {
      const [projRes, sgRes] = await Promise.all([fetchProjectsRaw(), fetchSubGoalsRaw()]);
      if (!alive.current) return;
      const parsedProjects = parseProjectsResponse(projRes);
      const parsedSubGoals = parseSubGoalsResponse(sgRes);
      setProjects(parsedProjects);
      setSubGoals(parsedSubGoals);
      setLastSync(Date.now());
      setError(null);
      const ms = Math.round(performance.now() - started);
      pushLog(`SYNC OK · ${parsedProjects.length} PROJECTS · ${sgRes.results.length} SUB-GOALS · ${ms}MS`);
    } catch (e) {
      if (!alive.current) return;
      setError(String(e?.message ?? e));
      pushLog(`SYNC FAILED · ${String(e?.message ?? e).toUpperCase()}`, "err");
    } finally {
      if (alive.current) setSyncing(false);
    }
  }, [pushLog]);

  useEffect(() => {
    alive.current = true;
    pushLog("CONSOLE ONLINE · FEED: MOCK/NOTION-SHAPE v1", "sys");
    sync();
    const id = setInterval(sync, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [sync, pushLog]);

  return { projects, subGoals, lastSync, syncing, error, log, resync: sync };
}
