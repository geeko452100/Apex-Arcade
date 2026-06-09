import { useBattleActions } from './useBattleActions';
import { useBannerState } from './useBannerState';

/**
 * Composes useBannerState + useBattleActions into a single hook for the battle screen.
 * The gameState passed in must already be normalised with `.player` and `.enemy` keys.
 *
 * @param {{
 *   gameState: object|null,
 *   myUserId: string|number,
 *   stageCard: Function,
 *   unstageCard: Function,
 *   handlePhaseTransition: Function,
 *   executeAttack: Function,
 *   executeDefense: Function,
 *   resetGame: Function,
 * }} args
 */
export function useBattleUI(args) {
  const {
    gameState,
    myUserId,
    stageCard,
    unstageCard,
    handlePhaseTransition,
    executeAttack,
    executeDefense,
    resetGame,
  } = args;

  const bannerState = useBannerState(gameState, myUserId);

  const actions = useBattleActions({
    gameState,
    currentUserId:     myUserId,
    stageCard,
    unstageCard,
    handlePhaseTransition,
    executeAttack,
    executeDefense,
    setEnemyShake:       bannerState.setEnemyShake,
    showAttackBanner:    bannerState.showAttackBanner,
    showDefenseBanner:   bannerState.showDefenseBanner,
  });

  return {
    ...bannerState,
    ...actions,
    resetGame,
  };
}
