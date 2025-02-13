import { Player } from './Player.js';
import { Tools } from './Tools.js';
import { GameSession } from './GameSession.js';

var WAITING_TO_GATHER_CARDS = 0;
var WAITING_TO_FILL_TABLE = 1;
var WAITING_FOR_FACE_DOWN_WAR_CARD = 2;
var GAME_OVER = 3;

class GamePlay {

    /**
     * constructs a GamePlay object
     *
     * @param nNumPlayers the number of players
     * @param aCards a deck of cards
     * @param aSounds an array of sounds used during a war
     * @param aPlayerNames possible names to choose from upon startup
     * @param nMaxNumberOfSlots maximum number of game slots to use on the
     *          remote database
     * @param nCardWidth the width of the cards
     * @param oCallbacks functions used for customized actions {
     *              renderResult: function used to render the winning message
     *              getRandomPlayerName: function used to get a random
     *                  player name from a given list
     *          }
     */
    constructor(nNumPlayers, aCards, aSounds, aPlayerNames, nMaxNumberOfSlots, nCardWidth, oCallbacks) {

        this.numPlayers = nNumPlayers;
        this.cards = aCards;
        this.sounds = aSounds;
        this.playerNames = aPlayerNames;
        this.maxNumberOfSlots = nMaxNumberOfSlots;
        this.cardWidth = nCardWidth;
        this.callbacks = oCallbacks;

        this.playerControllers = [];

        this.allPlayersJoined = false;

        this.state = WAITING_TO_FILL_TABLE;

        this.numMoves = 0;
        this.soundOn = true;

    };

    /**
    * hides the Don't Wait button
    */
    static hideDontWaitButton() {
        var oDontWaitBtn = document.getElementById('dontWait');
        if (oDontWaitBtn) {
            oDontWaitBtn.style.display = 'none';
        }
    };

    /**
     * checks if player has a face-up card on the table
     *
     * @param oPlayer a player
     *
     * @return true if the player has a face-up card on the table
     */
    static doesPlayerHaveCardOnTableFaceUp(oPlayer) {
        if (oPlayer.getTable() && oPlayer.getTable().length % 2 === 1) {
            return true;
        }
        return false;
    }

    /**
     * checks if player has a face-down card on the table
     *
     * @param oPlayer a player
     *
     * @return true if the player has a face-down card on the table
     */
    static doesPlayerHaveCardOnTableFaceDown(oPlayer) {
        if (oPlayer.getTable() && oPlayer.getTable().length % 2 === 0) {
            return true;
        }
        return false;
    }

    /**
    * renders all the cards
    */
    renderCards() {

        var i;
        for (i = 0; i < this.playerControllers.length; i++) {
            this.playerControllers[i].renderTable();
            this.playerControllers[i].renderHand();
        }
    };

    /**
     * finds a player given the Id of a player view
     */
    findPlayerForPlayerViewId(sPlayerViewId) {
        var oPlayer = null;

        var i;

        for (i = 0; i < this.playerControllers.length; i++) {
            if ('player' + this.playerControllers[i].getPlayerNum() === sPlayerViewId) {
                oPlayer = this.playerControllers[i];
                break;
            }
        }

        return oPlayer;
    };

    /**
     * checks if one player has won
     */
    isGameFinished() {

        var i,
            nOtherPlayer,
            nWinningPlayer;

        if (this.playerControllers.length < 2) {
            // checks if there are less than two players
            return;
        }

        if (this.playerControllers[0].getTable().length > 0
            && this.playerControllers[1].getTable().length > 0) {

            nWinningPlayer = this.whoseCardWins(this.playerControllers);

            for (i = 0; i < this.playerControllers.length; i++) {
                // checks if the player's hand is empty
                if (this.playerControllers[i].hand.length === 0) {

                    if (i === 0) {
                        nOtherPlayer = 1;
                    } else if (i === 1) {
                        nOtherPlayer = 0;
                    }

                    // checks if the same player's table loses to the other player
                    if (nWinningPlayer === nOtherPlayer) {

                        this.result = this.playerControllers[nOtherPlayer].getName() + ' wins';
                        this.callbacks.renderResult(this.result);
                        this.state = GAME_OVER;
                        return true;
                    }
                }
            }
        }

        return false;
    };

    /**
     * Checks table to see if it's a war, or if it's time to gather cards.
     */
    updateGameStateBasedOnTable() {

        if (this.doAllPlayersHaveSameNumberOfCardsOnTable()) {

            if (GamePlay.doesPlayerHaveCardOnTableFaceDown(this.playerControllers[0])) {

                // assumes both players have face down cards (in war)
                this.state = WAITING_TO_FILL_TABLE;

            } else if (GamePlay.doesPlayerHaveCardOnTableFaceUp(this.playerControllers[0])
                && this.playerControllers[0].getTableCard()
                && this.playerControllers[1].getTableCard()
                && this.playerControllers[0].getTableCard().value
                === this.playerControllers[1].getTableCard().value) {

                // assumes both players have the same face-up card (starts war)
                this.playWarSound(this.playerControllers[0].getTableCard().value);

                this.state = WAITING_FOR_FACE_DOWN_WAR_CARD;

            } else {

                // assumes one player has a winning card on the table
                this.state = WAITING_TO_GATHER_CARDS;

                // checks if the game is over
                this.isGameFinished();

            }

        } else if (!this.playerControllers[0].getTableCard()
            || !this.playerControllers[1].getTableCard()) {

            // assumes the players have no cards on the table
            this.state = WAITING_TO_FILL_TABLE;

        }
    };

    /**
     * plays a sound if there's a war
     */
    playWarSound(nCardValue) {

        if (this.soundOn === false) {
            return;
        }

        switch (nCardValue) {
            case 1:
                this.sounds.hamsterSound.play();
                break;
            case 2:
                this.sounds.rabbitSound.play();
                break;
            case 3:
                this.sounds.meowSound.play();
                break;
            case 4:
                this.sounds.barkSound.play();
                break;
            case 5:
                this.sounds.tigerSound.play();
                break;
            case 6:
                this.sounds.elephantSound.play();
                break;
            default:
                this.sounds.barkSound.play();
                break;
        }
    };

    /**
     * checks if all players have a card on the table
     */
    doAllPlayersHaveSameNumberOfCardsOnTable() {

        var i;
        var nNumCards = (this.playerControllers &&
            this.playerControllers.length > 0 &&
            this.playerControllers[0].getTable()) ? this.playerControllers[0].getTable().length : -1;

        var bAllPlayersHaveSameNumberOfCardsOnTable = true;

        for (i = 0; i < this.numPlayers; i++) {
            if (!(this.playerControllers[i])
                || !(this.playerControllers[i].getTable())
                || !(this.playerControllers[i].getTable().length === nNumCards)) {
                bAllPlayersHaveSameNumberOfCardsOnTable = false;
                break;
            }
        }

        return bAllPlayersHaveSameNumberOfCardsOnTable;
    };

    /**
     * updates the game when player wants to play a card, based on current state
     *
     * @param oPlayer a player controller on whom the event happened
     * @param bIsLocalEvent true if the event happened in the local UI
     */
    playerWantsToPlayACard(oPlayer, bIsLocalEvent) {
        switch (this.state) {
            case WAITING_TO_FILL_TABLE:
                // checks if the player already has a face-up card on the table
                if (GamePlay.doesPlayerHaveCardOnTableFaceUp(oPlayer)) {
                    // wiggles the card
                    if (bIsLocalEvent) {
                        oPlayer.wiggleCardInHand();
                    }
                } else {
                    if (bIsLocalEvent) {
                        oPlayer.putCardOnTable();
                    }
                }
                break;
            case WAITING_FOR_FACE_DOWN_WAR_CARD:
                if (bIsLocalEvent) {
                    // checks if player only has a face-up card on table
                    if (GamePlay.doesPlayerHaveCardOnTableFaceUp(oPlayer)) {
                        oPlayer.putCardOnTable();
                    } else {
                        oPlayer.wiggleCardInHand();
                    }
                }
                // checks if both players have a face down card on table
                if (this.doAllPlayersHaveSameNumberOfCardsOnTable()) {
                    if (GamePlay.doesPlayerHaveCardOnTableFaceDown(oPlayer)) {
                        this.state = WAITING_TO_FILL_TABLE;
                    }
                }

                break;
            case WAITING_TO_GATHER_CARDS:
                if (bIsLocalEvent) {
                    this.gatherCards();
                    this.numMoves++;
                }
                break;
            default:
                break;
        }

        this.updateGameStateBasedOnTable();

    };

    /**
     * Moves cards to the table or moves the table cards to the hand of the
     * player that won the turn.
     * Or waits for more cards on the table in case of a tie.
     */
    gatherCards() {

        var nWinningPlayer = -1;

        // decides what to do if all players have played
        if (this.doAllPlayersHaveSameNumberOfCardsOnTable() && this.state === WAITING_TO_GATHER_CARDS) {

            nWinningPlayer = this.whoseCardWins(this.playerControllers);

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

            this.state = WAITING_TO_FILL_TABLE;

            this.renderCards();

        }
    };

    /**
     * reacts to a local player tapping a card in their hand
     *
     * @param oEvent a browser event
     */
    localPlayerTappedCardInHand(oEvent) {

        // gets the player and the player view
        var oTarget = oEvent.currentTarget;

        var oPlayerView = (oTarget && oTarget.parentNode) ? oTarget.parentNode.parentNode : null;
        var sPlayerViewId = null;
        var oPlayer = null;

        if (oPlayerView) {
            sPlayerViewId = oPlayerView.getAttribute('id');
            if (sPlayerViewId) {
                oPlayer = this.findPlayerForPlayerViewId(sPlayerViewId);
            }
        }

        var bIsLocalEvent = oPlayer ? oPlayer.isLocal : true;

        this.playerTappedCardInHand(oPlayer, bIsLocalEvent);
    };

    /**
     * reacts to a local or remote player tapping a card in their hand
     *
     * @param oPlayer a player on whom the event happened
     * @param bIsLocalEvent true if the event happened in the local UI
     */
    playerTappedCardInHand(oPlayer, bIsLocalEvent) {

        var i;

        // checks if the tap is a legitimate move in the game
        if (oPlayer && bIsLocalEvent && this.allPlayersJoined && this.state !== GAME_OVER) {
            this.playerWantsToPlayACard.call(this, oPlayer, bIsLocalEvent);
        } else {
            // does nothing
            oPlayer.wiggleCardInHand();
        }
    };

    /**
     * distributes the current cards to the player controllers that are
     * available
     */
    distributeCardsToAvailablePlayers() {

        // distributes the cards to the local players
        var nNumPlayersAmongWhomToDistributeCards = this.numPlayers > 1 ? this.numPlayers : 2;
        var aDistributedCards = this.distribute(this.shuffledCards, nNumPlayersAmongWhomToDistributeCards);

        // distributes cards to the player controllers that have been created
        var i;
        for (i = 0; i < this.numPlayers; i++) {
            if (i < this.playerControllers.length) {
                this.playerControllers[i].setHand(aDistributedCards[i]);
            }
        }

        // keeps the rest of the cards for other players
        if (aDistributedCards.length > i - 1) {
            this.restOfCards = aDistributedCards[i - 1];
        }

        this.result = '';
    };

    /**
     * gets the game slot list from a game slots snapshot
     *
     * @param oGameSlots a snapshot of game slots
     *
     * @return a game slots list
     */
    static getGameSlotsListFromSnapshot(oGameSlots) {

        if (!oGameSlots) {
            oGameSlots = {
                lastSlot: 0,
                list: {}
            };
        }

        // gets list of game slots
        return oGameSlots ? oGameSlots.list : null;

    };

    /**
     * gets the number of the last-used game slot from a game slots object
     *
     * @param oGameSlots a snapshot of game slots
     *
     * @return the number of the last-used game slot
     */
    static getLastGameSlotKey(oGameSlots) {

        // gets index of last game slot
        var aGameSlots = GamePlay.getGameSlotsListFromSnapshot(oGameSlots);
        var sLastGameSlotKey = Tools.getKeyOfLastItemInObject(aGameSlots);

        return sLastGameSlotKey;
    };

    /**
     * gets the last-used game slot from a game slots object
     *
     * @param oGameSlots a snapshot of game slots
     *
     * @return the snapshot of the last-used game slot
     */
    static getLastGameSlot(oGameSlots) {

        var aGameSlots = GamePlay.getGameSlotsListFromSnapshot(oGameSlots);

        // gets the current game slot number
        var sLastGameSlotKey = GamePlay.getLastGameSlotKey(oGameSlots);

        // gets the current game slot
        var oLastGameSlot = null;
        if (aGameSlots) {
            oLastGameSlot = Tools.getLastItemInObject(aGameSlots);
        }

        return oLastGameSlot;
    };

    /**
     * moves to the next game slot and updates player references to the ones
     * that are in that slot;
     * finds the next available game slot, but starts over at 0
     * if the max number is reached
     *
     * @param oReferenceGameSlotList reference to the game slot list on the
     *                                  remote database
     */
    moveToNextGameSlot(oReferenceGameSlotList) {

        // moves to next slot
        var oReferenceGameSlot = oReferenceGameSlotList.push({
            player0: '_new_'
        });
        this.slotKey = oReferenceGameSlot.key;

        // updates remote references after the slot number changed
        this.playerReference[0] = oReferenceGameSlot.child('player0');
        this.playerReference[1] = oReferenceGameSlot.child('player1');
    };

    /**
     * checks remote database and stores players in a game slot, then sets up
     * the remote players;
     *
     * @param oGamePlay an instance of a game
     *
     * @return false if could not set up the game slot; true otherwise
     */
    setUpRemoteGameSlot(oGamePlay) {

        var oDatabase = firebase.database();
        var oReferenceGameAllSlots = oDatabase.ref('game/slots');
        var oReferenceGameSlotList = oDatabase.ref('game/slots/list');

        oReferenceGameAllSlots.once('value', function (snapshot) {

            // gets game slot object from remote database
            var oGameSlots = snapshot.val();

            // gets the last-used game slot
            oGamePlay.slotKey = GamePlay.getLastGameSlotKey(oGameSlots);
            oGamePlay.gameSlot = GamePlay.getLastGameSlot(oGameSlots);

            // stores remote references to players and to the rest of the cards
            oGamePlay.playerReference = [];
            oGamePlay.playerReference.push(oDatabase.ref('game/slots/list/' + oGamePlay.slotKey + '/player0'));
            oGamePlay.playerReference.push(oDatabase.ref('game/slots/list/' + oGamePlay.slotKey + '/player1'));
            var oReferenceRestOfCards = oDatabase.ref('game/slots/list/' + oGamePlay.slotKey + '/restOfCards');

            // checks if player 0 or player 1 have joined
            var bIsPlayer0SlotFull = oGamePlay.gameSlot.player0 ? true : false;
            var bIsPlayer1SlotFull = oGamePlay.gameSlot.player1 ? true : false;

            if (!bIsPlayer0SlotFull && !bIsPlayer1SlotFull) {

                // found a new slot; keeps local player 0 waits for player 1
                oGamePlay.makePlayer0();

            } else if (bIsPlayer0SlotFull && bIsPlayer1SlotFull) {

                // takes next slot, even if it is full; makes player 0 controller
                oGamePlay.moveToNextGameSlot(oReferenceGameSlotList);

                // keeps local player 0 waits for player 1
                oGamePlay.makePlayer0();

            } else if (bIsPlayer0SlotFull && !bIsPlayer1SlotFull) {

                // joins another player in the slot - there is only one player in it

                // adds the two player controllers
                var oPlayer1Value = null;
                oGamePlay.makePlayer1(oPlayer1Value, oReferenceRestOfCards);

            } else if (!bIsPlayer0SlotFull && bIsPlayer1SlotFull) {

                // TODO: implement the case when player 1 has somehow joined
                // before player 0

            }

            // updates the last slot number on the remote database
            var oReferenceGameAllSlots = oDatabase.ref('game/slots');

            oReferenceGameAllSlots.child('lastSlot').set({
                value: oGamePlay.slotKey
            });

            oGamePlay.setUpHandlerForRemotePlayerEvents(oGamePlay, oDatabase);

        }.bind(this));
    };

    /**
     * sets up a callback to wait for player 1
     */
    makePlayer0() {

        var oGamePlay = this;

        var oDatabase = firebase.database();
        var oReferenceGameSlotList = oDatabase.ref('game/slots/list');
        var oReferenceGameSlot = oReferenceGameSlotList.child(oGamePlay.slotKey);

        // makes a session Id for player 0
        var sPlayer0SessionId = GameSession.makeNewBrowserSessionId();

        var bIsLocal = true;

        // makes player 0 controller
        oGamePlay.makePlayerController(0, oGamePlay.playerControllers, oGamePlay.playerReference[0], oGamePlay.localPlayerTappedCardInHand.bind(oGamePlay), sPlayer0SessionId, bIsLocal);
        oGamePlay.playerControllers[0].setName(this.callbacks.getRandomPlayerName(0, oGamePlay.playerNames));

        // distributes cards to player 0
        oGamePlay.distributeCardsToAvailablePlayers();

        // stores remote player 0, clears player 1 and waits for new player 1
        oGamePlay.gameSlot = {
            player0: {
                name: oGamePlay.playerControllers[0].getName(),
                hand: oGamePlay.playerControllers[0].getHand(),
                sessionId: sPlayer0SessionId
            },
            player1: null,
            restOfCards: oGamePlay.restOfCards
        };

        oReferenceGameSlot.set(oGamePlay.gameSlot);

        // renders player 0
        var oPlayAreaView = document.getElementById('playArea');
        oGamePlay.playerControllers[0].makePlayerView(oPlayAreaView);

        // adds waiting message
        oGamePlay.result = 'waiting for player 2';
        oGamePlay.callbacks.renderResult(this.result);

        // stores a reference to the remote player 1
        oGamePlay.playerReference[1] = oReferenceGameSlot.child('/player1');
        var oReferenceRestOfCards = oReferenceGameSlot.child('/restOfCards');

        // listens for arrival of player 1
        oGamePlay.playerReference[1].on('value', function (snapshot) {

            var oGamePlay = this;
            var oPlayer1Value = snapshot.val();

            // checks if a remote player 1 just joined and if there is no
            // player 1 yet
            if (oPlayer1Value && !oGamePlay.playerControllers[1]) {
                oGamePlay.makePlayer1(oPlayer1Value, oReferenceRestOfCards);
            }
        }.bind(oGamePlay));

        // if don't wait button is pressed, removes listener for second player
        var dontWaitPressed = function () {

            var oGamePlay = this;

            // removes the listeners that detect changes to remote players
            oGamePlay.playerReference[0].off();
            oGamePlay.playerReference[1].off();

            var oPlayer1Value = null;
            oGamePlay.makePlayer1(oPlayer1Value, oReferenceRestOfCards);
        };

        // makes don't wait button
        var oDontWaitBtn = document.createElement('button');
        var oContent = document.createTextNode('Don\'t wait');
        Tools.setClass(oDontWaitBtn, 'button');
        oDontWaitBtn.setAttribute('id', 'dontWait');
        oDontWaitBtn.appendChild(oContent);
        oDontWaitBtn.onclick = dontWaitPressed.bind(this);
        document.body.insertBefore(oDontWaitBtn, null);

    };

    /**
    * adds player 1 to the game
    *
    * @param oPlayer1Value {optional} a player object
    * @param oReferenceRestOfCards {optional} reference to rest of cards on remote database
    */
    makePlayer1(oPlayer1Value, oReferenceRestOfCards) {

        var oGamePlay = this;

        var oPlayer0Value = oGamePlay.gameSlot.player0;

        // checks if the player0 already has a different session ID (this is
        // the case if the player is from a different browser)
        var bIsPlayer0Local = GameSession.isLocal(oPlayer0Value);

        // makes controller for player 0
        if (!oGamePlay.playerControllers[0]) {
            oGamePlay.makePlayerController(0, oGamePlay.playerControllers, oGamePlay.playerReference[0], oGamePlay.localPlayerTappedCardInHand.bind(oGamePlay), oPlayer0Value.sessionId, bIsPlayer0Local);
        }

        // keeps name and hand from remote player object
        if (oGamePlay.gameSlot) {
            oGamePlay.playerControllers[0].setName(oGamePlay.gameSlot.player0.name);
            oGamePlay.playerControllers[0].setHand(oGamePlay.gameSlot.player0.hand);
        }

        var sPlayer0SessionId;

        if (bIsPlayer0Local) {

            // sets the session Id from the browser
            sPlayer0SessionId = GameSession.getBrowserSessionId();
            oGamePlay.playerControllers[0].setSessionId(sPlayer0SessionId);

        } else {

            // keeps the session Id from the remote player object
            if (oGamePlay.gameSlot) {
                sPlayer0SessionId = oGamePlay.gameSlot.player0.sessionId;
                oGamePlay.playerControllers[0].setSessionId(sPlayer0SessionId);
            }

        }

        // gets the rest of the cards to give to player 1
        // (there may be no cards locally if the browser was refreshed)
        if (!oGamePlay.restOfCards) {
            oGamePlay.restOfCards = oGamePlay.gameSlot ? oGamePlay.gameSlot.restOfCards : null;
        }

        // if for some reason the rest of cards was not stored remotely either,
        // re-distributes the cards
        if (!oGamePlay.restOfCards) {
            oGamePlay.distributeCardsToAvailablePlayers();
        }

        var sPlayer1SessionId = oPlayer1Value ? oPlayer1Value.sessionId : null;
        var bIsPlayer1Local = (sPlayer1SessionId === null);

        // makes player 1 controller
        oGamePlay.makePlayerController(1, oGamePlay.playerControllers, oGamePlay.playerReference[1], oGamePlay.localPlayerTappedCardInHand.bind(oGamePlay), sPlayer1SessionId, bIsPlayer1Local);

        // chooses player 1's name
        var sNotThisName = oGamePlay.playerControllers[0] ? oGamePlay.playerControllers[0].getName() : '';
        oGamePlay.playerControllers[1].setName(oGamePlay.callbacks.getRandomPlayerName(1, oGamePlay.playerNames, sNotThisName));

        // sets player 1's cards
        if (oGamePlay.playerControllers.length > 1) {
            oGamePlay.playerControllers[1].setHand(oGamePlay.restOfCards);
        }

        // removes rest of cards
        oReferenceRestOfCards.remove();

        // renders player 1
        var oPlayAreaView = document.getElementById('playArea');
        oGamePlay.playerControllers[1].makePlayerView(oPlayAreaView);
        oGamePlay.playerControllers[1].renderHand();
        oGamePlay.playerControllers[1].renderTable();

        // lets player 0 play
        oGamePlay.playerControllers[0].setOnTapCardInHand(oGamePlay.localPlayerTappedCardInHand.bind(oGamePlay));
        oGamePlay.playerControllers[0].renderTable();
        oGamePlay.playerControllers[0].renderHand();

        // stores player 1
        oGamePlay.playerControllers[1].updateRemoteReference();

        // hides don't wait button
        GamePlay.hideDontWaitButton();

        // clears waiting message
        oGamePlay.result = '';
        oGamePlay.callbacks.renderResult(oGamePlay.result);

        oGamePlay.allPlayersJoined = true;
    };

    /**
    * sets up the handlers for events from the remote players;
    * gets hand and table from remote database and updates player controllers
    *
    * @param oGamePlay an instance of a game
    * @param oDatabase reference to the remote database
    */
    setUpHandlerForRemotePlayerEvents(oGamePlay, oDatabase) {
        var nPlayerNumber = 0;
        for (nPlayerNumber = 0; nPlayerNumber < 2; nPlayerNumber++) {

            oGamePlay.playerReference[nPlayerNumber] = oDatabase.ref('/game/slots/list/' + oGamePlay.slotKey + '/player' + nPlayerNumber);
            oGamePlay.playerReference[nPlayerNumber].on('value', oGamePlay.handlerForRemotePlayerEvents.bind(this));

        }
    };

    /**
    * handler when a remote player changes;
    * gets hand and table from remote database and updates player controllers
    *
    * @param oSnapshot an instance of a game
    */
    handlerForRemotePlayerEvents(oSnapshot) {

        // gets the GamePlay object from the bound 'this'
        var oGamePlay = this;

        // gets the player number from the snapshot key, which is
        // something like "player1"
        var nPlayerNumber = oSnapshot.key.substring(6);

        var oPlayerValue = oSnapshot.val();
        var bIsLocalEvent = false;

        if (oPlayerValue) {
            var sName = oPlayerValue.name || '';
            var oPlayerHandValue = oPlayerValue.hand || [];
            var oPlayerTableValue = oPlayerValue.table || [];

            // recreates a remote player controller to pass to the
            // playerWantsToPlayACard method
            var oRemotePlayer = new Player(nPlayerNumber, null, -1);

            // sets player's name
            if (oGamePlay.playerControllers[nPlayerNumber]) {
                oGamePlay.playerControllers[nPlayerNumber].setName(
                    sName
                );
                oGamePlay.playerControllers[nPlayerNumber].renderName();
                oRemotePlayer.setName(sName);
            }

            // sets player's hand
            if (oGamePlay.playerControllers[nPlayerNumber]) {
                oGamePlay.playerControllers[nPlayerNumber].setHand(
                    oPlayerHandValue
                );
                oGamePlay.playerControllers[nPlayerNumber].renderHand();
                oRemotePlayer.setHand(oPlayerHandValue);
            }

            // sets player's table
            if (oPlayerTableValue && oGamePlay.playerControllers[nPlayerNumber]) {
                oGamePlay.playerControllers[nPlayerNumber].setTable(
                    oPlayerTableValue
                );
                oGamePlay.playerControllers[nPlayerNumber].renderTable();
                oRemotePlayer.setTable(oPlayerTableValue);
            }

            oGamePlay.playerWantsToPlayACard.call(oGamePlay, oRemotePlayer, bIsLocalEvent);
        }
    };

    /**
     * distributes the cards to the current number of players
     *
     * @param aCards an array of cards
     *
     * @return the cards distributed between players; in the
     *      form of an array of player arrays, each player
     *      array containing cards
     */
    distribute(aCards) {

        var i, j, oCard;
        var aDistributedCards = [];

        for (i = 0; i < aCards.length; i++) {
            oCard = aCards[i];

            for (j = 0; j < this.numPlayers; j++) {
                if (i % this.numPlayers === j) {
                    if (!aDistributedCards[j]) {
                        aDistributedCards[j] = [];
                    }
                    aDistributedCards[j].push(oCard);
                    break;
                }
            }
        }

        return aDistributedCards;
    };

    /**
     * toggles sounds
     */
    toggleSound() {
        this.soundOn = !this.soundOn;
        var oToggleSoundButton = document.getElementById('togglesound');
        if (oToggleSoundButton && this.soundOn === true) {
            Tools.addClass(oToggleSoundButton, 'soundon');
        } else {
            Tools.removeClass(oToggleSoundButton, 'soundon');
        }
    };

    /**
     * toggles sounds
     */
    makeToggleSoundButton() {

        var oSoundButton = document.createElement('div');
        Tools.setClass(oSoundButton, 'iconbutton');
        oSoundButton.setAttribute('id', 'togglesound');

        oSoundButton.onclick = this.toggleSound.bind(this);

        document.body.insertBefore(oSoundButton, null);
    };

    /**
     * starts a game
     */
    start(bShuffleCards) {

        if (bShuffleCards === true) {
            this.shuffledCards = Tools.shuffle(this.cards);
        } else {
            this.shuffledCards = this.cards;
        }

        this.makeToggleSoundButton();

        this.renderCards();

        this.setUpRemoteGameSlot(this);

        this.numMoves = 0;
    };
}

export { GamePlay };