export const GAME_CONFIG = {
    startingBalance: 1000,

    /*
     * BET represents the total stake for one spin.
     * The total stake is divided equally across all paylines.
     */
    betOptions: [1, 2, 5, 10, 20, 50, 100],

    defaultBet: 10,

    /*
     * Free spins cannot recursively award more free spins.
     * This prevents runaway free-spin chains.
     */
    allowFreeSpinRetrigger: false,

    maxFreeSpins: 15,

    /*
     * Maximum total payout for a single base-game spin,
     * expressed as a multiple of the total bet.
     *
     * This is a demo safety cap, not production slot math.
     */
    maxBaseGameWinMultiplier: 20,

    /*
     * Free spins may have a slightly larger maximum payout.
     */
    maxFreeSpinWinMultiplier: 25,
};
