import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGameRow, getRemoteVersion, updateGameStatus } from './lib/gamePersistence';
import { recordCardBattlerResult } from './lib/statsPersistence';
import { useGameSync } from './hooks/useGameSync';
import { useOpponentPresence } from './hooks/useOpponentPresence';
import { gameReducer } from './gameReducer';
import { initialGameState } from './initialState';

import GameOverModel     from './components/GameOverModel';
import OpponentDisconnectOverlay from './components/OpponentDisconnectOverlay';
import FieldGrid         from './components/FieldGrid';
import BattleHandZone    from './components/BattleHandZone';
import BattleBanners     from './components/BattleBanners';
import BattleDashboard   from './components/BattleDashboard';
import BattleActionBar   from './components/BattleActionBar';

import { useCardBattler } from './hooks/useCardBattler';
import { useBattleUI }    from './hooks/useBattleUI';
import { INITIAL_HP } from './gameLogic';
import {
  getEffectiveCombatPhase,
  getActiveHand,
  getAffordableDefenseFromHand,
  getStagedDefenseTotal,
  getStagedAttackDefenseBonus,
  getStagedCounterattackTotal,
  isAttackCard,
  isDefenseCard,
  isGameInitialized,
  normalizeGameState,
  sanitizeGameStateForStorage,
} from './gameRules';

const EMPTY_PLAYER = {
  hp: INITIAL_HP,
  energy: 3,
  block: 0,
  attackHand: [],
  defenseHand: [],
  staged: [],
  attackDeck: [],
  defenseDeck: [],
};

export default function CardBattlerEngine({ gameId, currentUserId }) {
  const navigate = useNavigate();
  const { gameState, localDispatch } = useCardBattler();
  const [loading, setLoading]   = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);
  const versionRef = useRef(0);
  const waitingForInitRef = useRef(false);
  const statsRecordedRef = useRef(false);

  const isPlayer1 = String(currentUserId) === String(gameState?.player_1_id);
  const opponentId = isPlayer1 ? gameState?.player_2_id : gameState?.player_1_id;
  const gameActive = !loading && isGameInitialized(gameState);

  const returnToLobby = useCallback(() => {
    navigate('/game/cards');
  }, [navigate]);

  const { secondsRemaining: lobbyReturnSeconds } = useOpponentPresence({
    gameId,
    currentUserId,
    opponentId,
    gameActive,
    gameOver: Boolean(gameState?.gameOver),
    onReturnToLobby: returnToLobby,
  });

  const player = isPlayer1
    ? (gameState?.player_1 ?? EMPTY_PLAYER)
    : (gameState?.player_2 ?? EMPTY_PLAYER);

  const enemy = isPlayer1
    ? (gameState?.player_2 ?? EMPTY_PLAYER)
    : (gameState?.player_1 ?? EMPTY_PLAYER);

  const isPlayerTurn = String(gameState?.turnOwner) === String(currentUserId);

  const normalizedGameState = gameState
    ? { ...gameState, player, enemy }
    : null;

  const applyRemoteState = useCallback((remoteState, remoteVersion) => {
    const normalized = normalizeGameState(remoteState);
    versionRef.current = remoteVersion ?? normalized?.stateVersion ?? 0;
    localDispatch({ type: 'SYNC_FROM_SERVER', payload: normalized });
    if (isGameInitialized(normalized)) {
      waitingForInitRef.current = false;
      setLoading(false);
    }
  }, [localDispatch]);

  const syncAndBroadcast = useCallback(async (nextState, previousState, expectedVersion) => {
    const result = await updateGameStatus(gameId, nextState, expectedVersion);

    if (result.error) {
      console.error('syncAndBroadcast failed:', result.error);
      localDispatch({ type: 'SYNC_FROM_SERVER', payload: previousState });
      versionRef.current = previousState?.stateVersion ?? 0;
      return;
    }

    if (result.conflict) {
      const fresh = result.fresh ?? (await fetchGameRow(gameId)).data;
      if (fresh?.status && typeof fresh.status === 'object') {
        applyRemoteState(fresh.status, getRemoteVersion(fresh));
      } else {
        localDispatch({ type: 'SYNC_FROM_SERVER', payload: previousState });
        versionRef.current = previousState?.stateVersion ?? 0;
      }
      return;
    }

    versionRef.current = nextState.stateVersion;
  }, [gameId, applyRemoteState, localDispatch]);

  const dispatchAndSync = useCallback((actionType, payload = {}) => {
    const previousState = gameState;
    const expectedVersion = gameState?.stateVersion ?? 0;
    const action = { type: actionType, payload: { ...payload, userId: currentUserId } };
    const reduced = gameReducer(gameState, action);
    const next = sanitizeGameStateForStorage({
      ...reduced,
      stateVersion: expectedVersion + 1,
    });

    localDispatch({ type: 'SYNC_FROM_SERVER', payload: next });
    versionRef.current = next.stateVersion;
    syncAndBroadcast(next, previousState, expectedVersion);
  }, [gameState, currentUserId, localDispatch, syncAndBroadcast]);

  const stageCardSynced    = useCallback((cardId, slotIndex) => dispatchAndSync('STAGE_CARD', { cardId, slotIndex }), [dispatchAndSync]);
  const unstageCardSynced  = useCallback((cardId) => dispatchAndSync('UNSTAGE_CARD',  { cardId }), [dispatchAndSync]);
  const executeAttackSynced  = useCallback(() => dispatchAndSync('EXECUTE_ATTACK'),  [dispatchAndSync]);
  const executeDefenseSynced = useCallback(() => dispatchAndSync('EXECUTE_DEFENSE'), [dispatchAndSync]);
  const handlePhaseTransition = useCallback(() => dispatchAndSync('NEXT_PHASE'),     [dispatchAndSync]);
  const resetGameSynced = useCallback(() => {
    statsRecordedRef.current = false;
    const previousState = gameState;
    const expectedVersion = gameState?.stateVersion ?? 0;
    const reduced = gameReducer(gameState, { type: 'RESET_GAME' });
    const next = sanitizeGameStateForStorage({
      ...reduced,
      stateVersion: expectedVersion + 1,
    });
    localDispatch({ type: 'SYNC_FROM_SERVER', payload: next });
    versionRef.current = next.stateVersion;
    syncAndBroadcast(next, previousState, expectedVersion);
  }, [gameState, localDispatch, syncAndBroadcast]);

  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;

    const fetchInitialState = async () => {
      try {
        const { data, error } = await fetchGameRow(gameId);

        if (cancelled || error || !data) {
          if (error) console.error('Failed to load game row:', error);
          return;
        }

        const remoteVersion = getRemoteVersion(data);

        if (isGameInitialized(data.status)) {
          applyRemoteState(data.status, remoteVersion);
          return;
        }

        const p1 = data.player_1_id ?? currentUserId;
        const p2 = data.player_2_id;
        const isSeeder =
          String(currentUserId) === String(data.player_1_id) || !data.player_1_id;

        if (isSeeder) {
          const fresh = gameReducer(
            { ...initialGameState, player_1_id: p1, player_2_id: p2 },
            { type: 'INITIALIZE_GAME', payload: { player1Id: p1, player2Id: p2 } }
          );
          const seeded = sanitizeGameStateForStorage({ ...fresh, stateVersion: 1 });

          localDispatch({ type: 'SYNC_FROM_SERVER', payload: seeded });
          versionRef.current = 1;

          const seedResult = await updateGameStatus(gameId, seeded, 0);

          if (seedResult.error) {
            console.error('Failed to seed game state:', seedResult.error);
          } else if (seedResult.conflict) {
            const freshRow = seedResult.fresh ?? (await fetchGameRow(gameId)).data;

            if (freshRow?.status && typeof freshRow.status === 'object') {
              applyRemoteState(freshRow.status, getRemoteVersion(freshRow));
            }
          }

          setLoading(false);
        } else {
          waitingForInitRef.current = true;
        }
      } finally {
        if (!waitingForInitRef.current) {
          setLoading(false);
        }
      }
    };

    fetchInitialState();

    return () => { cancelled = true; };
  }, [gameId, currentUserId, localDispatch, applyRemoteState]);

  const handleRemoteUpdate = useCallback((initialized) => {
    if (initialized) setLoading(false);
  }, []);

  useGameSync(gameId, localDispatch, versionRef, handleRemoteUpdate);

  useEffect(() => {
    statsRecordedRef.current = false;
  }, [gameId]);

  useEffect(() => {
    const gameOver = gameState?.gameOver;
    if (!gameOver || statsRecordedRef.current) return;

    statsRecordedRef.current = true;
    const didWin = String(gameOver.winnerId) === String(currentUserId);
    recordCardBattlerResult(didWin);
  }, [gameState?.gameOver, currentUserId]);

  useEffect(() => {
    if (!waitingForInitRef.current || !gameId) return;

    const poll = setInterval(async () => {
      const { data } = await fetchGameRow(gameId);

      if (isGameInitialized(data?.status)) {
        applyRemoteState(data.status, getRemoteVersion(data));
        clearInterval(poll);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [gameId, applyRemoteState]);

  const handleForceTurnSkip = useCallback(() => {
    if (!isPlayerTurn || gameState?.gameOver) return;

    const staged = (player.staged ?? []).filter(Boolean);
    const combatPhase = getEffectiveCombatPhase(gameState);

    if (combatPhase === 'attack-phase') {
      if (staged.some((c) => isAttackCard(c))) {
        dispatchAndSync('EXECUTE_ATTACK');
      } else {
        dispatchAndSync('NEXT_PHASE');
      }
      return;
    }

    const hasDefense = staged.some((c) => isDefenseCard(c))
      || getAffordableDefenseFromHand(player).length > 0;

    if (hasDefense) {
      dispatchAndSync('EXECUTE_DEFENSE');
    } else {
      dispatchAndSync('NEXT_PHASE');
    }
  }, [isPlayerTurn, gameState, player.staged, dispatchAndSync]);

  useEffect(() => {
    clearInterval(timerRef.current);

    if (!gameState?.turnExpiration || gameState?.gameOver) return;

    timerRef.current = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((gameState.turnExpiration - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
      if (remaining <= 0 && isPlayerTurn) handleForceTurnSkip();
    }, 250);

    return () => clearInterval(timerRef.current);
  }, [gameState?.turnExpiration, gameState?.gameOver, isPlayerTurn, handleForceTurnSkip]);

  const {
    playerShake, enemyShake,
    startingBanner, startingBannerSlidingOut,
    phaseBanner, phaseSlidingOut,
    attackBanner, attackBannerSlidingOut,
    defenseBanner, defenseBannerSlidingOut,
    playerDamageBanner, playerDamageBannerSlidingOut,
    enemyAttackBanner, enemyAttackBannerSlidingOut,
    enemyDefenseBanner, enemyDefenseBannerSlidingOut,
    gameFinished, phaseButtonLabel,
    actionReady, actionLabel, phaseHint, actionHint,
    handlePlayCard, handleExecuteAction,
    handleDragStart, handleDragOver, handleSlotDrop, handleHandDrop,
    handleSkipPhase,
  } = useBattleUI({
    gameState:            normalizedGameState,
    myUserId:             currentUserId,
    stageCard:            stageCardSynced,
    unstageCard:          unstageCardSynced,
    handlePhaseTransition,
    executeAttack:        executeAttackSynced,
    executeDefense:       executeDefenseSynced,
    resetGame:            resetGameSynced,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-amber-400 font-bold">
        Synchronizing...
      </div>
    );
  }

  if (!gameState) {
    return <div className="text-white">Connection Fault</div>;
  }

  const effectiveCombatPhase = getEffectiveCombatPhase(gameState);
  const activeHand = getActiveHand(player, effectiveCombatPhase);
  const stagedDefenseGain = isPlayerTurn && effectiveCombatPhase === 'defense-phase'
    ? getStagedDefenseTotal(player)
    : 0;
  const stagedAttackBlockBonus = isPlayerTurn && effectiveCombatPhase === 'attack-phase'
    ? getStagedAttackDefenseBonus(player)
    : 0;
  const stagedCounterattack = isPlayerTurn && effectiveCombatPhase === 'defense-phase'
    ? getStagedCounterattackTotal(player)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white bg-slate-900 min-h-screen">
      <BattleBanners
        startingBanner={startingBanner}
        startingBannerSlidingOut={startingBannerSlidingOut}
        phaseBanner={phaseBanner}
        phaseSlidingOut={phaseSlidingOut}
        attackBanner={attackBanner}
        attackBannerSlidingOut={attackBannerSlidingOut}
        defenseBanner={defenseBanner}
        defenseBannerSlidingOut={defenseBannerSlidingOut}
        playerDamageBanner={playerDamageBanner}
        playerDamageBannerSlidingOut={playerDamageBannerSlidingOut}
        enemyAttackBanner={enemyAttackBanner}
        enemyAttackBannerSlidingOut={enemyAttackBannerSlidingOut}
        enemyDefenseBanner={enemyDefenseBanner}
        enemyDefenseBannerSlidingOut={enemyDefenseBannerSlidingOut}
      />

      <BattleDashboard
        localPlayer={player}
        remoteEnemy={enemy}
        playerShake={playerShake}
        enemyShake={enemyShake}
        isPlayerTurn={isPlayerTurn}
        combatPhase={effectiveCombatPhase}
        timeLeft={timeLeft}
        stagedDefenseGain={stagedDefenseGain}
        stagedAttackBlockBonus={stagedAttackBlockBonus}
      />

      <FieldGrid
        stagedCards={player.staged}
        isPlayerTurn={isPlayerTurn}
        combatPhase={effectiveCombatPhase}
        playerBlock={player.block ?? 0}
        stagedDefenseGain={stagedDefenseGain}
        stagedAttackBlockBonus={stagedAttackBlockBonus}
        stagedCounterattack={stagedCounterattack}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleSlotDrop={handleSlotDrop}
        onUnstage={unstageCardSynced}
      />

      <BattleHandZone
        hand={activeHand}
        isPlayerTurn={isPlayerTurn}
        playerEnergy={player.energy}
        combatPhase={effectiveCombatPhase}
        handlePlayCard={handlePlayCard}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleHandDrop={handleHandDrop}
      />

      <BattleActionBar
        combatPhase={effectiveCombatPhase}
        gameFinished={gameFinished}
        isPlayerTurn={isPlayerTurn}
        actionReady={actionReady}
        actionLabel={actionLabel}
        phaseButtonLabel={phaseButtonLabel}
        phaseHint={phaseHint}
        actionHint={actionHint}
        handleSkipPhase={handleSkipPhase}
        handleExecuteAction={handleExecuteAction}
      />

      {gameFinished && (
        <GameOverModel
          gameOver={gameFinished}
          currentUserId={currentUserId}
          onReset={resetGameSynced}
        />
      )}

      <OpponentDisconnectOverlay
        secondsRemaining={lobbyReturnSeconds}
        onReturnNow={returnToLobby}
      />
    </div>
  );
}
