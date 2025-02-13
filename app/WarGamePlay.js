import { GamePlay } from './kierki/js/GamePlay.js';
import { Player } from './kierki/js/Player.js';
import { GameSession } from './kierki/js/GameSession.js';

class WarGamePlay extends GamePlay {
    constructor(nNumPlayers, aCards, aSounds, aPlayerNames, nMaxNumberOfSlots, nCardWidth, oCallbacks) {

        super(nNumPlayers, aCards, aSounds, aPlayerNames, nMaxNumberOfSlots, nCardWidth, oCallbacks);

    };

    /**
     * Indicates who has the winning card on the table, based on the two
     * players' cards.
     *
     * @param aPlayerControllers a list of players
     *
     * @return number of the player whose table card is winning, or -1 if it's a
     *          tie; the first player is 0
     */
    whoseCardWins(aPlayerControllers) {

        var nWinningPlayer = -1;

        if (aPlayerControllers[0].getTable().length > 0
            && aPlayerControllers[1].getTable().length > 0) {

            if (aPlayerControllers[0].getTableCard().value > this.playerControllers[1].getTableCard().value) {
                nWinningPlayer = 0;
            } else if (aPlayerControllers[0].getTableCard().value < aPlayerControllers[1].getTableCard().value) {
                nWinningPlayer = 1;
            }
        }

        return nWinningPlayer;
    };

    /**
     * makes a Player controller to manager a player locally
     *
     * @param nPlayerNum player number
     * @param aPlayers the list of players to add the player to
     * @param oPlayerRef a reference to the remote player
     * @param fnLocalPlayerWantsToPlayCard handler for when local player taps
     *          card in hand
     * @param sSessionId the ID of the current browser session
     * @param bIsLocal if the player is local
     */
    makePlayerController(nPlayerNum, aPlayers, oPlayerRef, fnLocalPlayerWantsToPlayCard, sSessionId, bIsLocal) {

        // gets or creates player's browser session Id
        sSessionId = sSessionId ? sSessionId : GameSession.getBrowserSessionId();

        aPlayers.push(new Player(nPlayerNum, oPlayerRef, this.cardWidth, sSessionId, bIsLocal));
        aPlayers[nPlayerNum].setOnTapCardInHand(fnLocalPlayerWantsToPlayCard.bind(this));

    };
}

export { WarGamePlay };