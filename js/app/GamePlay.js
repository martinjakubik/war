/*global define */
define('GamePlay', ['Player', 'Tools'], function (Player, Tools) {

    'use strict';

    var WAITING_TO_GATHER_CARDS = 0;
    var WAITING_TO_FILL_TABLE = 1;
    var WAITING_FOR_FACE_DOWN_WAR_CARD = 2;
    var GAME_OVER = 3;

    var GamePlay = function (nNumPlayers, aCards, aPlayerNames, nMaxNumberOfSlots, nCardWidth, oCallbacks) {

        this.numPlayers = nNumPlayers;
        this.cards = aCards;
        this.playerNames = aPlayerNames;
        this.maxNumberOfSlots = nMaxNumberOfSlots;
        this.cardWidth = nCardWidth;
        this.callbacks = oCallbacks;

        this.currentSlot;
        this.playerControllers = [];

        this.allPlayersJoined = false;

        this.state = WAITING_TO_FILL_TABLE;

        this.numMoves = 0;
    };

    GamePlay.prototype.getCurrentSlot = function () {
        return this.currentSlot;
    };

    GamePlay.prototype.setCurrentSlot = function (nCurrentSlot) {
        this.currentSlot = nCurrentSlot;
    };

    GamePlay.prototype.getPlayers = function () {
        return this.playerControllers;
    };

    GamePlay.prototype.setPlayers = function (aPlayers) {
        this.playerControllers = aPlayers;
    };

    /**
    * renders all the cards
    */
    GamePlay.prototype.renderCards = function () {
        var i;
        for (i = 0; i < this.playerControllers.length; i++) {
            this.playerControllers[i].renderTable();
            this.playerControllers[i].renderHand();
        }
    };

    /**
    * hides the Don't Wait button
    */
    GamePlay.hideDontWaitButton = function () {
        var oDontWaitBtn = document.getElementById('dontWait');
        if (oDontWaitBtn) {
            oDontWaitBtn.style.display = 'none';
        }
    };

    /**
     * finds a player given the Id of a player view
     */
    GamePlay.prototype.findPlayerForPlayerViewId = function (sPlayerViewId) {
        var oPlayer = null;

        var i;

        for (i = 0; i < this.playerControllers.length ; i++) {
            if ('player' + this.playerControllers[i].getPlayerNum() === sPlayerViewId) {
                oPlayer = this.playerControllers[i];
                break;
            }
        }

        return oPlayer;
    };

    /**
     * Checks table to see if it's a war, or if it's time to gather cards.
     */
    GamePlay.prototype.updateGameStateBasedOnTable = function () {


        if (this.playerControllers.length > 1
            && this.playerControllers[0].getHand()
            && this.playerControllers[1].getHand()) {

            if (this.isGameFinished()) {
                return;
            }
        }

        if (this.doAllPlayersHaveSameNumberOfCardsOnTable()) {

            if (!this.playerControllers[0].getTableCard()
                || !this.playerControllers[1].getTableCard()) {

                // checks if the players have no cards on the table
                this.state = WAITING_TO_FILL_TABLE;

            } else if (GamePlay.doesPlayerHaveCardOnTableFaceDown(this.playerControllers[0])) {

                // checks if the players both have face down cards (in war)
                this.state = WAITING_TO_FILL_TABLE;

            } else if (GamePlay.doesPlayerHaveCardOnTableFaceUp(this.playerControllers[0])
                && this.playerControllers[0].getTableCard()
                && this.playerControllers[1].getTableCard()
                && this.playerControllers[0].getTableCard().value
                === this.playerControllers[1].getTableCard().value) {

                // checks if both players have the same face-up card (starts
                // war)
                this.playWarSound(this.playerControllers[0].getTableCard().value);

                this.state = WAITING_FOR_FACE_DOWN_WAR_CARD;

            } else {

                // assumes one player has a winning card on the table
                this.state = WAITING_TO_GATHER_CARDS;
            }
        }
    };

    /**
     * Moves cards to the table or moves the table cards to the hand of the
     * player that won the turn.
     * Or adds another card to the table in case of a tie.
     */
    GamePlay.prototype.gatherCards = function () {

        var i;

        // decides what to do if all players have played
        if (this.doAllPlayersHaveSameNumberOfCardsOnTable() && this.state === WAITING_TO_GATHER_CARDS) {

            // checks if player 0 won the hand
            if (this.playerControllers[0].getTableCard().value > this.playerControllers[1].getTableCard().value) {

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
            } else if (this.playerControllers[0].getTableCard().value < this.playerControllers[1].getTableCard().value) {
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
     * plays a sound if there's a war
     */
    GamePlay.prototype.playWarSound = function (nCardValue) {
        switch (nCardValue) {
            case 1:
            this.hamsterSound.play();
            break;
            case 2:
            this.rabbitSound.play();
            break;
            case 3:
            this.meowSound.play();
            break;
            case 4:
            this.barkSound.play();
            break;
            case 5:
            this.tigerSound.play();
            break;
            case 6:
            this.elephantSound.play();
            break;
            default:
            this.barkSound.play();
            break;
        }
    };

    /**
     * checks if all players have a card on the table
     */
    GamePlay.prototype.doAllPlayersHaveSameNumberOfCardsOnTable = function () {

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
     * checks if one player has won
     */
    GamePlay.prototype.isGameFinished = function () {

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
     * checks if player has a face-up card on the table
     *
     * @param oPlayer a player
     *
     * @return true if the player has a face-up card on the table
     */
    GamePlay.doesPlayerHaveCardOnTableFaceUp = function (oPlayer) {
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
    GamePlay.doesPlayerHaveCardOnTableFaceDown = function (oPlayer) {
        if (oPlayer.getTable() && oPlayer.getTable().length % 2 === 0) {
            return true;
        }
        return false;
    }

    /**
     * updates the game when player wants to play a card, based on current state
     *
     * @param oPlayer a player controller on whom the event happened
     * @param bIsLocalEvent true if the event happened in the local UI
     */
    GamePlay.prototype.playerWantsToPlayACard = function (oPlayer, bIsLocalEvent) {
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

                // checks if any player ran out of cards and lost
                this.isGameFinished();

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
     * reacts to a local player tapping a card in their hand
     */
    GamePlay.prototype.localPlayerTappedCardInHand = function (oEvent) {

        var bIsLocalEvent = true;

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

        this.playerTappedCardInHand(oPlayer, bIsLocalEvent);
    };

    /**
     * reacts to a local or remote player tapping a card in their hand
     *
     * @param oPlayer a player on whom the event happened
     * @param bIsLocalEvent true if the event happened in the local UI
     */
    GamePlay.prototype.playerTappedCardInHand = function (oPlayer, bIsLocalEvent) {

        var i;

        // checks if the tap is a legitimate move in the game
        if (oPlayer && this.allPlayersJoined && this.state !== GAME_OVER) {
            this.playerWantsToPlayACard.call(this, oPlayer, bIsLocalEvent);
        } else {
            // does nothing
            oPlayer.wiggleCardInHand();
        }
    };

    /**
     * initializes a game; makes players and cards and distributes them
     */
    GamePlay.prototype.initializeGamePlay = function (aCards) {

        // distributes the cards to the local players
        var nNumPlayersAmongWhomToDistributeCards = this.numPlayers > 1 ? this.numPlayers : 2;
        var aDistributedCards = this.distribute(this.shuffledCards, nNumPlayersAmongWhomToDistributeCards);

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

        var oShuffleBtn = document.createElement('button');
        var oContent = document.createTextNode('Shuffle');
        Tools.setClass(oShuffleBtn, 'button');
        oShuffleBtn.setAttribute('id', 'shuffle');
        oShuffleBtn.appendChild(oContent);
        oShuffleBtn.onclick = function (oEvent) {
            var i, aDistributedCards;
            this.result = '';
            this.callbacks.renderResult(this.result);
            this.playerControllers[0].clearTable();
            this.playerControllers[1].clearTable();
            this.shuffledCards = Tools.shuffle(this.shuffledCards);
            aDistributedCards = distribute(this.shuffledCards, this.playerControllers.length);
            for (i = 0; i < this.playerControllers.length; i++) {
                this.playerControllers[i].setHand(aDistributedCards[i]);
            }
            this.renderCards();
        }.bind(this);
        // document.body.insertBefore(oShuffleBtn, null);

        this.result = '';
    };

    /**
     * adds players to a game
     */
    GamePlay.prototype.addPlayerToGamePlay = function (nFirstPlayer, nLastPlayer, aDistributedCards) {

        var i;
        for (i = nFirstPlayer; i <= nLastPlayer; i++) {
            if (i < this.playerControllers.length) {
                this.playerControllers[i].setHand(aDistributedCards[i]);
            }
        }
    };

    /**
    * adds player 1 to the game
    *
    * @param aGameSlots list of game slots
    * @param sSessionId the ID of the current browser session
    * @param bIsRemote true if player1 is a remote player
    */
    GamePlay.prototype.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo = function (aGameSlots, bIsRemote) {

        var oGamePlay = this;

        // distributes cards again if it wasn't done
        if (!oGamePlay.restOfCards) {
            oGamePlay.restOfCards = aGameSlots[oGamePlay.slotNumber].restOfCards;
        }
        if (!oGamePlay.restOfCards) {
            oGamePlay.initializeGamePlay(1);
        }

        // makes player 1 controller
        oGamePlay.makePlayerController(1, oGamePlay.playerControllers, oGamePlay.playerReference[1], oGamePlay.localPlayerTappedCardInHand.bind(oGamePlay), bIsRemote);
        var sNotThisName = oGamePlay.playerControllers[0] ? oGamePlay.playerControllers[0].getName() : '';
        oGamePlay.playerControllers[1].setName(oGamePlay.callbacks.getRandomPlayerName(1, oGamePlay.playerNames, sNotThisName));

        // adds player 1 to game
        this.addPlayerToGamePlay(1, 1, [null, this.restOfCards]);

        // renders player 1
        var oPlayAreaView = document.getElementById('playArea');
        this.playerControllers[1].makePlayerView(oPlayAreaView);
        this.playerControllers[1].renderHand();
        this.playerControllers[1].renderTable();

        // lets player 0 play
        this.playerControllers[0].setOnTapCardInHand(this.localPlayerTappedCardInHand.bind(this));
        this.playerControllers[0].renderTable();
        this.playerControllers[0].renderHand();

        // stores player 1
        oGamePlay.playerControllers[1].updateRemoteReference();

        // hides don't wait button
        GamePlay.hideDontWaitButton();

        // clears waiting message
        this.result = '';
        this.callbacks.renderResult(this.result);

        this.allPlayersJoined = true;
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
     * @param bIsRemote if the player is remote
     */
    GamePlay.prototype.makePlayerController = function(nPlayerNum, aPlayers, oPlayerRef, fnLocalPlayerWantsToPlayCard, sSessionId, bIsRemote) {

        // gets or creates player's browser session Id
        sSessionId = sSessionId ? sSessionId : GamePlay.getBrowserSessionId();

        aPlayers.push(new Player(nPlayerNum, oPlayerRef, this.cardWidth, sSessionId, bIsRemote));
        aPlayers[nPlayerNum].setOnTapCardInHand(fnLocalPlayerWantsToPlayCard.bind(this));

    };

    /**
     * moves to the next game slot and updates player references to the ones
     * that are in that slot
     *
     * @param oDatabase reference to the remote database
     */
    GamePlay.prototype.moveToNextGameSlot = function(oDatabase) {

        // moves to next slot
        this.slotNumber = (this.slotNumber + 1) % this.maxNumberOfSlots;

        // updates remote references after the slot number changed
        this.playerReference[0] = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player0');
        this.playerReference[1] = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player1');

    };

    /**
     *
     */
    GamePlay.prototype.keepPlayer0AndWaitForPlayer1 = function (aGameSlots) {

        var oGamePlay = this;

        var oDatabase = firebase.database();
        var oReferenceGameSlot = oDatabase.ref('game/slots/list/' + this.slotNumber);

        var nInitialNumPlayers = 1;

        // gets player 0's browser session Id
        var sSessionId = GamePlay.makeNewBrowserSessionId();

        var bIsRemote = false;

        // makes player 0 controller
        oGamePlay.makePlayerController(0, oGamePlay.playerControllers, oGamePlay.playerReference[0], oGamePlay.localPlayerTappedCardInHand.bind(oGamePlay), sSessionId, bIsRemote);
        this.playerControllers[0].setName(this.callbacks.getRandomPlayerName(0, this.playerNames));

        // adds player 0 to game
        this.initializeGamePlay(nInitialNumPlayers);

        // stores remote player 0, clears player 1 and waits for new player 1
        oReferenceGameSlot.set({
            player0: {
                name: this.playerControllers[0].getName(),
                hand: this.playerControllers[0].getHand(),
                sessionId: sSessionId
            },
            player1: null,
            restOfCards: this.restOfCards
        });

        // renders player 0
        var oPlayAreaView = document.getElementById('playArea');
        this.playerControllers[0].makePlayerView(oPlayAreaView);

        // adds waiting message
        this.result = 'waiting for player 2';
        this.callbacks.renderResult(this.result);

        // stores a reference to the remote player 1
        this.playerReference[1] = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player1');
        var oReferenceRestOfCards = oDatabase.ref('game/slots/list/' + this.slotNumber + '/restOfCards');

        // listens for arrival of player 1
        this.playerReference[1].on('value', function (snapshot) {
            var oPlayerValue = snapshot.val();

            // checks if a remote player 1 just joined and if there is no
            // player 1 yet
            if (oPlayerValue && !this.playerControllers[1]) {
                this.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo(oPlayerValue);
            }
        }.bind(this));

        // if don't wait button is pressed, removes listener for second player
        var dontWaitPressed = function (aGameSlots) {

            var oGamePlay = this;

            // removes the listeners that detect changes to remote players
            this.playerReference[0].off();
            this.playerReference[1].off();

            this.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo(aGameSlots);

            // removes rest of cards
            oReferenceRestOfCards.remove();
        };

        // makes don't wait button
        var oDontWaitBtn = document.createElement('button');
        var oContent = document.createTextNode('Don\'t wait');
        Tools.setClass(oDontWaitBtn, 'button');
        oDontWaitBtn.setAttribute('id', 'dontWait');
        oDontWaitBtn.appendChild(oContent);
        oDontWaitBtn.onclick = dontWaitPressed.bind(this, aGameSlots);
        document.body.insertBefore(oDontWaitBtn, null);

    };

    /**
     * sets up the handlers for events from the remote players;
     * gets hand and table from remote database and updates local players
     *
     * @param oGamePlay an instance of a game
     * @param oDatabase reference to the remote database
     */
    GamePlay.prototype.setUpLocalHandlerForRemotePlayerEvents = function (oGamePlay, oDatabase) {
        oGamePlay.playerReference[0] = oDatabase.ref('/game/slots/list/' + oGamePlay.slotNumber + '/player' + 0);
        oGamePlay.playerReference[0].on('value', function (snapshot) {

            var oPlayerValue = snapshot.val();
            var bIsLocalEvent = false;

            if (oPlayerValue) {
                var oPlayerHandValue = oPlayerValue.hand;
                var oPlayerTableValue = oPlayerValue.table || [];

                // recreates a remote player controller to pass to the
                // playerWantsToPlayACard method
                var oRemotePlayer = new Player(0, null, -1);

                // sets player's hand
                if (oPlayerHandValue && oGamePlay.playerControllers[0]) {
                    oGamePlay.playerControllers[0].setHand(
                        oPlayerHandValue
                    );
                    oGamePlay.playerControllers[0].renderHand();
                    oRemotePlayer.setHand(oPlayerHandValue);
                }

                // sets player's table
                if (oPlayerTableValue && oGamePlay.playerControllers[0]) {
                    oGamePlay.playerControllers[0].setTable(
                        oPlayerTableValue
                    );
                    oGamePlay.playerControllers[0].renderTable();
                    oRemotePlayer.setTable(oPlayerTableValue);
                }

                oGamePlay.playerWantsToPlayACard.call(oGamePlay, oRemotePlayer, bIsLocalEvent);
            }
        });

        oGamePlay.playerReference[1] = oDatabase.ref('/game/slots/list/' + oGamePlay.slotNumber + '/player' + 1);
        oGamePlay.playerReference[1].on('value', function (snapshot) {

            var oPlayerValue = snapshot.val();
            var bIsLocalEvent = false;

            if (oPlayerValue) {
                var oPlayerHandValue = oPlayerValue.hand;
                var oPlayerTableValue = oPlayerValue.table || [];

                // recreates a remote player controller to pass to the
                // playerWantsToPlayACard method
                var oRemotePlayer = new Player(1, null, -1);

                // sets player's hand
                if (oPlayerHandValue && oGamePlay.playerControllers[1]) {
                    oGamePlay.playerControllers[1].setHand(
                        oPlayerHandValue
                    );
                    oGamePlay.playerControllers[1].renderHand();
                    oRemotePlayer.setHand(oPlayerHandValue);
                }

                // sets player's table
                if (oPlayerTableValue && oGamePlay.playerControllers[1]) {
                    oGamePlay.playerControllers[1].setTable(
                        oPlayerTableValue
                    );
                    oGamePlay.playerControllers[1].renderTable();
                    oRemotePlayer.setTable(oPlayerTableValue);
                }

                oGamePlay.playerWantsToPlayACard.call(oGamePlay, oRemotePlayer, bIsLocalEvent);
            }
        });
    };

    /**
     * makes a new ID for the browser session (ie. this is the first player to
     * join)
     *
     * @return the new session ID
     */
    GamePlay.makeNewBrowserSessionId = function (oGameRef) {

        var sKey = 'sessionId';
        var sValue = Tools.generateID();
        sessionStorage.setItem(sKey, sValue);

        return sValue;
    };

    /**
     * gets the browser session Id; created a new on if none exists
     *
     * @return the sessionId
     */
    GamePlay.getBrowserSessionId = function () {

        var sKey = 'sessionId';
        var sValue = sessionStorage.getItem(sKey);
        if (!sValue) {
            sValue = GamePlay.makeNewBrowserSessionId();
        }

        return sValue;
    };

    /**
     * sets up the handlers for events from the remote players;
     * checks remote database and stores players in a game slot
     *
     * @param oGamePlay an instance of a game
     * @param oDatabase reference to the remote database
     * @param oGameSlots the object containing all the game slots
     */
    GamePlay.prototype.setUpLocalPlayers = function (oGamePlay, oDatabase, oGameSlots) {

        // gets a reference to the game slots
        var oReferenceGameAllSlots = oDatabase.ref('game/slots');

        if (!oGameSlots) {
            oGameSlots = {
                lastSlot: 0,
                list: {}
            };
        }

        // gets list of game slots
        var aGameSlots = oGameSlots ? oGameSlots.list : null ;

        // gets index of last game slot
        var oGameSlotNumber = oGameSlots.lastSlot || {
            value: 0
        };

        // finds the next available game slot, but starts over at 0
        // if the max number is reached
        oGamePlay.slotNumber = oGameSlotNumber ? oGameSlotNumber.value : 0;

        // stores remote references to players and to the rest of the cards
        oGamePlay.playerReference = [];
        oGamePlay.playerReference.push(oDatabase.ref('game/slots/list/' + oGamePlay.slotNumber + '/player0'));
        oGamePlay.playerReference.push(oDatabase.ref('game/slots/list/' + oGamePlay.slotNumber + '/player1'));
        var oReferenceRestOfCards = oDatabase.ref('game/slots/list/' + oGamePlay.slotNumber + '/restOfCards');

        // checks if player 0 or player 1 have joined
        var bIsPlayer0SlotFull = false;
        var bIsPlayer1SlotFull = false;

        if (aGameSlots && aGameSlots.length > oGamePlay.slotNumber && aGameSlots[oGamePlay.slotNumber]) {
            bIsPlayer0SlotFull = aGameSlots[oGamePlay.slotNumber].player0 ? true : false;
            bIsPlayer1SlotFull = aGameSlots[oGamePlay.slotNumber].player1 ? true : false;
        }

        // clears the list of players
        while (oGamePlay.playerControllers.length > 0) {
            oGamePlay.playerControllers.pop();
        }

        if (!bIsPlayer0SlotFull && !bIsPlayer1SlotFull) {

            // found a new slot; keeps local player 0 waits for player 1
            oGamePlay.keepPlayer0AndWaitForPlayer1(aGameSlots);

        } else if (bIsPlayer0SlotFull && bIsPlayer1SlotFull) {

            // takes next slot, even if it is full; makes player 0 controller
            oGamePlay.moveToNextGameSlot(oDatabase);

            // keeps local player 0 waits for player 1
            oGamePlay.keepPlayer0AndWaitForPlayer1(aGameSlots);

        } else if (bIsPlayer0SlotFull && !bIsPlayer1SlotFull) {

            // creates or gets a session Id; we don't know if this is the same
            // session or not
            var sSessionId = GamePlay.getBrowserSessionId();

            var bPlayer0IsRemote = false,
                bPlayer1IsRemote = false;

            // checks if the player0 already has a different session ID (this is
            // the case if the player is from a different browser)
            if (aGameSlots && aGameSlots.length > 0 && aGameSlots[oGamePlay.slotNumber]) {
                if (aGameSlots[oGamePlay.slotNumber].player0 &&
                     aGameSlots[oGamePlay.slotNumber].player0.sessionId) {
                         sSessionId = aGameSlots[oGamePlay.slotNumber].player0.sessionId;
                         bPlayer1IsRemote = true;
                     }
            }

            // finds new slot; makes player 0 controller
            oGamePlay.makePlayerController(0, oGamePlay.playerControllers, oGamePlay.playerReference[0], oGamePlay.localPlayerTappedCardInHand.bind(oGamePlay), sSessionId, bPlayer0IsRemote);

            // keeps remote player 0
            oGamePlay.playerControllers[0].setName(aGameSlots[oGamePlay.slotNumber].player0.name);
            oGamePlay.playerControllers[0].setHand(aGameSlots[oGamePlay.slotNumber].player0.hand);

            // renders player 0
            var oPlayAreaView = document.getElementById('playArea');
            oGamePlay.playerControllers[0].makePlayerView(oPlayAreaView);
            oGamePlay.playerControllers[0].renderHand();
            oGamePlay.playerControllers[0].renderTable();

            oGamePlay.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo(aGameSlots, bPlayer1IsRemote);

            // removes rest of cards
            oReferenceRestOfCards.remove();

        } else if (!bIsPlayer0SlotFull && bIsPlayer1SlotFull) {

            // TODO: implement the case when player 1 has somehow joined
            // before player 0

        }

        oReferenceGameAllSlots.child('lastSlot').set({
            value: oGamePlay.slotNumber
        });

        oGamePlay.setUpLocalHandlerForRemotePlayerEvents(oGamePlay, oDatabase);
        oGamePlay.setUpLocalHandlerForRemotePlayerEvents(oGamePlay, oDatabase);
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
    GamePlay.prototype.distribute = function (aCards) {

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
     * starts a game
     */
    GamePlay.prototype.start = function () {

        this.shuffledCards = Tools.shuffle(this.cards);
        this.renderCards();

        var oDatabase = firebase.database();
        var oReferenceGameAllSlots = oDatabase.ref('game/slots');

        // checks remote database and stores players in a game slot
        oReferenceGameAllSlots.once('value', function (snapshot) {

            // gets game slot object from remote database
            var oGameSlots = snapshot.val();

            this.setUpLocalPlayers(this, oDatabase, oGameSlots);

        }.bind(this));

        this.hamsterSound = new Audio('../resources/hamster-wheel.wav');
        this.rabbitSound = new Audio('../resources/rabbit-crunch.wav');
        this.meowSound = new Audio('../resources/kitten-meow.wav');
        this.barkSound = new Audio('../resources/small-dog-bark.wav');
        this.tigerSound = new Audio('../resources/tiger-growl.wav');
        this.elephantSound = new Audio('../resources/elephant.wav');

        this.numMoves = 0;
    };

    return GamePlay;
});
