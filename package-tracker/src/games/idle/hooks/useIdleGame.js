import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import { gameReducer } from '../gameReducer';
import { createInitialState } from '../initialState';
import { calculateAngelsFromRun, loadSave, persistSave } from '../gameLogic';
import { fetchCloudSave, mergeSaves, upsertCloudSave } from '../lib/cloudPersistence';

const TICK_MS = 100;
const SAVE_INTERVAL_MS = 5000;

export function useIdleGame(userId) {
  const [state, dispatch] = useReducer(gameReducer, null, () => createInitialState());
  const [loadStatus, setLoadStatus] = useState('loading');
  const [cloudStatus, setCloudStatus] = useState('idle');
  const lastTickRef = useRef(Date.now());
  const stateRef = useRef(state);

  stateRef.current = state;

  // Load local + cloud save on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadStatus('loading');

      const localSave = loadSave(userId);
      let cloudSave = null;

      try {
        cloudSave = await fetchCloudSave(userId);
      } catch {
        cloudSave = null;
      }

      if (cancelled) return;

      const merged = mergeSaves(localSave, cloudSave);

      if (merged) {
        dispatch({ type: 'LOAD_STATE', payload: merged });
        persistSave(userId, merged);

        const elapsed = (Date.now() - (merged.lastSavedAt ?? Date.now())) / 1000;
        if (elapsed > 1) {
          dispatch({ type: 'APPLY_OFFLINE', elapsedSeconds: elapsed });
        }
      }

      setLoadStatus('ready');
      setCloudStatus(cloudSave ? 'synced' : localSave ? 'local-only' : 'new');
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Game loop
  useEffect(() => {
    if (loadStatus !== 'ready') return undefined;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      dispatch({ type: 'TICK', deltaSeconds: delta });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [loadStatus]);

  // Auto-save local + cloud
  useEffect(() => {
    if (loadStatus !== 'ready') return undefined;

    async function saveAll() {
      const payload = persistSave(userId, stateRef.current);
      setCloudStatus('saving');
      const ok = await upsertCloudSave(userId, payload);
      setCloudStatus(ok ? 'synced' : 'local-only');
    }

    const saveTimer = setInterval(saveAll, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(saveTimer);
      const payload = persistSave(userId, stateRef.current);
      upsertCloudSave(userId, payload);
    };
  }, [userId, loadStatus]);

  const buyBusiness = useCallback((businessId, count) => {
    dispatch({ type: 'BUY_BUSINESS', businessId, count });
  }, []);

  const runBusiness = useCallback((businessId) => {
    dispatch({ type: 'RUN_BUSINESS', businessId });
  }, []);

  const hireManager = useCallback((businessId) => {
    dispatch({ type: 'HIRE_MANAGER', businessId });
  }, []);

  const buyUpgrade = useCallback((upgradeId, cost) => {
    dispatch({ type: 'BUY_UPGRADE', upgradeId, cost });
  }, []);

  const buySpeedUpgrade = useCallback((upgradeId, cost) => {
    dispatch({ type: 'BUY_SPEED_UPGRADE', upgradeId, cost });
  }, []);

  const buyAngelUpgrade = useCallback((upgradeId) => {
    dispatch({ type: 'BUY_ANGEL_UPGRADE', upgradeId });
  }, []);

  const prestige = useCallback(() => {
    const angelsGained = calculateAngelsFromRun(stateRef.current.totalEarned);
    if (angelsGained <= 0) return 0;
    dispatch({ type: 'PRESTIGE', angelsGained });
    return angelsGained;
  }, []);

  const resetGame = useCallback(() => {
    const fresh = createInitialState();
    dispatch({ type: 'RESET' });
    persistSave(userId, fresh);
    upsertCloudSave(userId, fresh);
  }, [userId]);

  return {
    state,
    loadStatus,
    cloudStatus,
    buyBusiness,
    runBusiness,
    hireManager,
    buyUpgrade,
    buySpeedUpgrade,
    buyAngelUpgrade,
    prestige,
    resetGame,
  };
}
