import { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_HP } from '../gameLogic';
import { getEffectiveCombatPhase } from '../gameRules';

const DEFAULT_BANNER = { visible: false, title: '', subtitle: '' };

/**
 * Manages a single auto-dismissing banner with a slide-out animation.
 * Timers are stored in a ref so they survive re-renders without going stale.
 */
function useTimeoutBanner() {
  const [banner, setBanner]       = useState(DEFAULT_BANNER);
  const [slidingOut, setSlidingOut] = useState(false);
  const timers = useRef({ hide: null, slide: null });

  const show = useCallback((title, subtitle, slideDelay = 1400, hideDelay = 1800, meta = {}) => {
    clearTimeout(timers.current.slide);
    clearTimeout(timers.current.hide);

    setBanner({ visible: true, title, subtitle, ...meta });
    setSlidingOut(false);

    timers.current.slide = setTimeout(() => setSlidingOut(true), slideDelay);
    timers.current.hide  = setTimeout(
      () => setBanner((prev) => ({ ...prev, visible: false })),
      hideDelay
    );
  }, []);

  // Cleanup on unmount only — do not set state after unmount.
  useEffect(() => {
    return () => {
      clearTimeout(timers.current.slide);
      clearTimeout(timers.current.hide);
    };
  }, []);

  return { banner, slidingOut, show };
}

/**
 * Centralises all battle-banner and shake state for the UI layer.
 *
 * @param {object|null} gameState  Normalised game state (with .player / .enemy keys)
 * @param {string|number} currentUserId
 */
export function useBannerState(gameState, currentUserId) {
  const [playerShake, setPlayerShake]       = useState(false);
  const [enemyShake, setEnemyShake]         = useState(false);
  const phaseBanner       = useTimeoutBanner();
  const attackBanner       = useTimeoutBanner();
  const defenseBanner      = useTimeoutBanner();
  const playerDamageBanner = useTimeoutBanner();
  const enemyAttackBanner  = useTimeoutBanner();
  const enemyDefenseBanner = useTimeoutBanner();
  const startingBanner    = useTimeoutBanner();

  // Use refs to track previous values without triggering re-renders.
  const prevPlayerHp    = useRef(gameState?.player?.hp   ?? INITIAL_HP);
  const prevEnemyBlock  = useRef(gameState?.enemy?.block ?? 0);
  const prevGameId      = useRef(null);
  const startShown      = useRef(false);

  const isPlayerTurn = String(gameState?.turnOwner) === String(currentUserId);

  // ── Match-start banner (fires once per unique game ID) ────────────────────
  useEffect(() => {
    if (!gameState?.id) return;
    if (startShown.current || prevGameId.current === gameState.id) return;

    prevGameId.current = gameState.id;
    startShown.current = true;
    startingBanner.show('Match Initialized', 'Prepare your battle deck strategies.', 2000, 2600);
  }, [gameState?.id, startingBanner.show]);

  // ── Phase / turn banner ───────────────────────────────────────────────────
  // BUG FIX: Track the previous phase+owner pair so the banner only fires when
  // something actually changes — not on every re-render that touches gameState.
  const prevPhaseKey = useRef(null);
  useEffect(() => {
    if (!gameState) return;

    const combatPhase = getEffectiveCombatPhase(gameState);
    const phaseKey = `${combatPhase}-${gameState.turnOwner}`;
    if (phaseKey === prevPhaseKey.current) return;
    prevPhaseKey.current = phaseKey;

    const isAttack = combatPhase === 'attack-phase';

    if (isPlayerTurn) {
      const subtitle = isAttack
        ? 'Play attack cards from your hand, then press Execute when ready.'
        : 'Play defense cards to block incoming damage.';
      phaseBanner.show('Your Turn', subtitle, 1500, 2100, { combatPhase, isPlayerTurn: true });
    } else {
      const subtitle = isAttack
        ? 'Your opponent is choosing their attacks.'
        : 'Your opponent is setting up their defense.';
      phaseBanner.show("Opponent's Turn", subtitle, 1500, 2100, { combatPhase, isPlayerTurn: false });
    }
  }, [gameState?.combatPhase, gameState?.turnOwner, isPlayerTurn, phaseBanner.show]);

  // ── HP damage and block-gain banners ─────────────────────────────────────
  useEffect(() => {
    if (!gameState) return;

    const currentHp    = gameState.player.hp;
    const currentBlock = gameState.enemy.block;
    let shakeTimer;

    if (currentHp < prevPlayerHp.current) {
      const damage = prevPlayerHp.current - currentHp;

      setPlayerShake(true);
      shakeTimer = setTimeout(() => setPlayerShake(false), 500);

      if (isPlayerTurn) {
        playerDamageBanner.show(
          'Not fully blocked',
          'Some damage got through your shield.',
          1800,
          2600,
          { variant: 'damage', stat: `-${damage}`, statLabel: 'HP Lost' }
        );
      } else {
        enemyAttackBanner.show(
          'You were hit!',
          'Your opponent\'s attack connected.',
          1800,
          2600,
          { variant: 'enemy-attack', stat: damage, statLabel: 'Damage' }
        );
      }
    }

    if (currentBlock > prevEnemyBlock.current && !isPlayerTurn) {
      const gain = currentBlock - prevEnemyBlock.current;
      enemyDefenseBanner.show(
        'Opponent defended',
        'Their shield just got stronger.',
        1800,
        2600,
        { variant: 'enemy-defense', stat: `+${gain}`, statLabel: 'Block Gained' }
      );
    }

    prevPlayerHp.current   = currentHp;
    prevEnemyBlock.current = currentBlock;

    return () => {
      if (shakeTimer) clearTimeout(shakeTimer);
    };
  }, [
    gameState?.player?.hp,
    gameState?.enemy?.block,
    isPlayerTurn,
    playerDamageBanner.show,
    enemyAttackBanner.show,
    enemyDefenseBanner.show,
  ]);

  // Reset game-scoped refs when the component unmounts.
  useEffect(() => {
    return () => {
      prevGameId.current = null;
      startShown.current = false;
    };
  }, []);

  return {
    playerShake,
    setPlayerShake,
    enemyShake,
    setEnemyShake,
    phaseBanner:              phaseBanner.banner,
    phaseSlidingOut:          phaseBanner.slidingOut,
    attackBanner:             attackBanner.banner,
    attackBannerSlidingOut:   attackBanner.slidingOut,
    defenseBanner:            defenseBanner.banner,
    defenseBannerSlidingOut:  defenseBanner.slidingOut,
    playerDamageBanner:       playerDamageBanner.banner,
    playerDamageBannerSlidingOut: playerDamageBanner.slidingOut,
    enemyAttackBanner:        enemyAttackBanner.banner,
    enemyAttackBannerSlidingOut: enemyAttackBanner.slidingOut,
    enemyDefenseBanner:       enemyDefenseBanner.banner,
    enemyDefenseBannerSlidingOut: enemyDefenseBanner.slidingOut,
    startingBanner:           startingBanner.banner,
    startingBannerSlidingOut: startingBanner.slidingOut,
    showAttackBanner:         attackBanner.show,
    showDefenseBanner:        defenseBanner.show,
  };
}
