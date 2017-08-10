/*global define */
define('WarGamePlay', ['GamePlay', 'Player', 'Tools', 'GameSession'], function (GamePlay, Player, Tools, GameSession) {

    'use strict';

    var WAITING_TO_GATHER_CARDS = 0;
    var WAITING_TO_FILL_TABLE = 1;
    var WAITING_FOR_FACE_DOWN_WAR_CARD = 2;
    var GAME_OVER = 3;

    var WarGamePlay = function (nNumPlayers, aCards, aSounds, aPlayerNames, nMaxNumberOfSlots, nCardWidth, oCallbacks) {

        GamePlay.call(this, nNumPlayers, aCards, aSounds, aPlayerNames, nMaxNumberOfSlots, nCardWidth, oCallbacks);

    };

    // inherits from GamePlay
    WarGamePlay.prototype = Object.create(GamePlay.prototype);

    /**
     * Indicates who won the hand, based on the two players' cards.
     *
     * @param aPlayerControllers an array of players
     *
     * @return number of the player who won, or -1 if it's a tie
     */
    WarGamePlay.prototype.whoWonTheHand = function (aPlayerControllers) {

        var nWinningPlayer = -1;

        if (aPlayerControllers[0].getTableCard().value > this.playerControllers[1].getTableCard().value) {
            nWinningPlayer = 0;
        } else if (aPlayerControllers[0].getTableCard().value < aPlayerControllers[1].getTableCard().value) {
            nWinningPlayer = 1;
        }

        return nWinningPlayer;
    };

    /**
     * Moves cards to the table or moves the table cards to the hand of the
     * player that won the turn.
     * Or waits for more cards on the table in case of a tie.
     */
    WarGamePlay.prototype.gatherCards = function () {

        var nWinningPlayer = -1;

        // decides what to do if all players have played
        if (this.doAllPlayersHaveSameNumberOfCardsOnTable() && this.state === WAITING_TO_GATHER_CARDS) {

            nWinningPlayer = this.whoWonTheHand(this.playerControllers);

            // checks if player 0 won the hand
            if (nWinningPlayer === 0) {

                // every five moves, randomly switches order of the gathered cards
                if (this.numMoves % 5 === 0 && Math.random() > 0.5) {
                    // moves everyone's cards to the winner's hand, player 1 first
                    this.playerControllers[0].moveTableToHand(this.playerControllers[1].getTable());
                    this.playerControllers[0].moveTableToHand();
                } else {
                    // moves everyone's cards to the winner's hand, player 0 first
                    this.playerControllers[0].moveTableToHand();
                    this.playerControllers[0].moveTableToHand(this.playerControllers[1].getTable());
                }

                // updates the loser's cards
                this.playerControllers[1].updateRemoteReference();

            } else if (nWinningPlayer === 1) {
                // player 1 won the hand

                // every five moves, randomly switches order of the gathered cards
                if (this.numMoves % 5 === 0 && Math.random()) {
                    // moves everyone's cards to the winner's hand, player 0 first
                    this.playerControllers[1].moveTableToHand(this.playerControllers[0].getTable());
                    this.playerControllers[1].moveTableToHand();
                } else {
                    // moves everyone's cards to the winner's hand, player 1 first
                    this.playerControllers[1].moveTableToHand();
                    this.playerControllers[1].moveTableToHand(this.playerControllers[0].getTable());
                }

                // updates the loser's cards
                this.playerControllers[0].updateRemoteReference();
            }

            this.isGameFinished();

            this.state = WAITING_TO_FILL_TABLE;

            this.renderCards();

        }
    };

    /**
     * checks if one player has won
     */
    WarGamePlay.prototype.isGameFinished = function () {

        var i, nOtherPlayer;

        for (i = 0; i < this.playerControllers.length; i++) {

            // checks if the player's hand is empty
            if (this.playerControllers[i].hand.length === 0) {

                if (i === 0) {
                    nOtherPlayer = 1;
                } else if (i === 1) {
                    nOtherPlayer = 0;
                }

                // checks if the same player's table loses to the other player
                if (this.playerControllers[i].getTableCard().value < this.playerControllers[nOtherPlayer].getTableCard().value) {

                    this.result = this.playerControllers[nOtherPlayer].getName() + ' wins';
                    this.callbacks.renderResult(this.result);
                    this.state = GAME_OVER;
                    return true;
                }
            }
        }
        return false;
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
    WarGamePlay.prototype.makePlayerController = function(nPlayerNum, aPlayers, oPlayerRef, fnLocalPlayerWantsToPlayCard, sSessionId, bIsLocal) {

        // gets or creates player's browser session Id
        sSessionId = sSessionId ? sSessionId : GameSession.getBrowserSessionId();

        aPlayers.push(new Player(nPlayerNum, oPlayerRef, this.cardWidth, sSessionId, bIsLocal));
        aPlayers[nPlayerNum].setOnTapCardInHand(fnLocalPlayerWantsToPlayCard.bind(this));

    };

    return WarGamePlay;
});
