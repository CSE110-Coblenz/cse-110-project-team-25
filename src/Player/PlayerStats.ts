/**
 * Player statistics tracking
 * Tracks gameplay metrics across sessions
 */
export interface PlayerStats {
  totalWordsTyped: number;
  totalEnemiesDefeated: number;
  // WPM tracking deferred for later implementation
  // currentWPM: number;
  // bestWPM: number;
}

/**
 * Create default player stats
 */
export function createDefaultStats(): PlayerStats {
  return {
    totalWordsTyped: 0,
    totalEnemiesDefeated: 0,
  };
}
