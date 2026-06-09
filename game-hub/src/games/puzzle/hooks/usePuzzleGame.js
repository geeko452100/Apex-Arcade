import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { gameReducer } from '../gameReducer';
import { createInitialState } from '../initialState';
import { getTodayDate, loadSave, persistSave } from '../gameLogic';
import { submitPuzzleResult } from '../lib/cloudPersistence';

export function usePuzzleGame(userId) {
  const today = getTodayDate();
  const [state, dispatch] = useReducer(gameReducer, null, () => createInitialState(today));
  const [loadStatus, setLoadStatus] = useState('loading');
  const [scoreStatus, setScoreStatus] = useState('idle');
  const stateRef = useRef(state);
  const scoreSubmittedRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    let cancelled = false;

    function load() {
      setLoadStatus('loading');
      const currentDate = getTodayDate();
      const saved = loadSave(userId, currentDate);

      if (cancelled) return;

      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: saved, puzzleDate: currentDate, userId });
        if (saved.gameStatus === 'won') {
          scoreSubmittedRef.current = true;
          setScoreStatus('submitted');
        } else {
          scoreSubmittedRef.current = false;
          setScoreStatus('idle');
        }
      } else {
        dispatch({ type: 'RESET_FOR_NEW_DAY', puzzleDate: currentDate, userId });
        scoreSubmittedRef.current = false;
        setScoreStatus('idle');
      }
      setLoadStatus('ready');
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (loadStatus !== 'ready') return undefined;

    function rollToNewDayIfNeeded() {
      const currentDate = getTodayDate();
      if (stateRef.current.puzzleDate === currentDate) return;

      const saved = loadSave(userId, currentDate);
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: saved, puzzleDate: currentDate, userId });
        if (saved.gameStatus === 'won') {
          scoreSubmittedRef.current = true;
          setScoreStatus('submitted');
        } else {
          scoreSubmittedRef.current = false;
          setScoreStatus('idle');
        }
      } else {
        dispatch({ type: 'RESET_FOR_NEW_DAY', puzzleDate: currentDate, userId });
        scoreSubmittedRef.current = false;
        setScoreStatus('idle');
      }
    }

    rollToNewDayIfNeeded();
    const interval = setInterval(rollToNewDayIfNeeded, 60_000);
    return () => clearInterval(interval);
  }, [userId, loadStatus]);

  useEffect(() => {
    if (loadStatus !== 'ready') return undefined;

    persistSave(userId, state);
  }, [userId, loadStatus, state]);

  useEffect(() => {
    if (loadStatus !== 'ready') return;
    if (state.gameStatus !== 'won') return;
    if (scoreSubmittedRef.current) return;

    scoreSubmittedRef.current = true;
    setScoreStatus('submitting');

    submitPuzzleResult(userId, state.puzzleDate, state.guesses.length)
      .then((ok) => setScoreStatus(ok ? 'submitted' : 'failed'))
      .catch(() => setScoreStatus('failed'));
  }, [userId, loadStatus, state.gameStatus, state.puzzleDate, state.guesses.length]);

  const typeLetter = useCallback((letter) => {
    dispatch({ type: 'TYPE_LETTER', letter });
  }, []);

  const deleteLetter = useCallback(() => {
    dispatch({ type: 'DELETE_LETTER' });
  }, []);

  const submitGuess = useCallback(() => {
    dispatch({ type: 'SUBMIT_GUESS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return {
    state,
    loadStatus,
    scoreStatus,
    typeLetter,
    deleteLetter,
    submitGuess,
    clearError,
  };
}
