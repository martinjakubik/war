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
        this.players = [];

        this.allPlayersJoined = false;

        this.state = WAITING_TO_FILL_TABLE;
    };

    GamePlay.prototype.getCurrentSlot = function () {
        return this.currentSlot;
    };

    GamePlay.prototype.setCurrentSlot = function (nCurrentSlot) {
        this.currentSlot = nCurrentSlot;
    };

    GamePlay.prototype.getPlayers = function () {
        return this.players;
    };

    GamePlay.prototype.setPlayers = function (aPlayers) {
        this.players = aPlayers;
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
    * renders all the cards
    */
    GamePlay.prototype.renderCards = function () {
        var i;
        for (i = 0; i < this.players.length; i++) {
            this.players[i].renderTable();
            this.players[i].renderHand();
        }
    };

    /**
     * initializes a game; makes players and cards and distributes them
     */
    GamePlay.prototype.initializeGamePlay = function (aCards) {

        var nNumPlayersAmongWhomToDistributeCards = this.numPlayers > 1 ? this.numPlayers : 2;
        var aDistributedCards = this.distribute(this.shuffledCards, nNumPlayersAmongWhomToDistributeCards);

        var i;
        for (i = 0; i < this.numPlayers; i++) {
            if (i < this.players.length) {
                this.players[i].setHand(aDistributedCards[i]);
            }
        }
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
            this.players[0].clearTable();
            this.players[1].clearTable();
            this.shuffledCards = Tools.shuffle(this.shuffledCards);
            aDistributedCards = distribute(this.shuffledCards, this.players.length);
            for (i = 0; i < this.players.length; i++) {
                this.players[i].setHand(aDistributedCards[i]);
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
            if (i < this.players.length) {
                this.players[i].setHand(aDistributedCards[i]);
            }
        }
    };

    GamePlay.prototype.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo = function (oPlayerValue) {

        // gets player 1
        this.players[1].setName(oPlayerValue.name);
        this.players[1].setHand(oPlayerValue.hand);
        this.players[1].addOnTapToTopCardInHand(this.localPlayerTappedCardInHand.bind(this));

        // adds player 1 to game
        this.addPlayerToGamePlay(1, 1, [null, this.restOfCards]);
        this.restOfCards = [];

        // renders player 1
        var oPlayAreaView = document.getElementById('playArea');
        this.players[1].makePlayerView(oPlayAreaView);
        this.players[1].renderHand();
        this.players[1].renderTable();

        // lets player 0 play
        this.players[0].addOnTapToTopCardInHand(this.localPlayerTappedCardInHand.bind(this));
        this.players[0].renderTable();
        this.players[0].renderHand();

        // hides don't wait button
        var oDontWaitBtn = document.getElementById('dontWait');
        oDontWaitBtn.style.display = 'none';

        // clears waiting message
        this.result = '';
        this.callbacks.renderResult(this.result);

        this.allPlayersJoined = true;
    };

    GamePlay.prototype.keepPlayer0AndWaitForPlayer1 = function () {

        var oDatabase = firebase.database();
        var oReferenceGameAllSlots = oDatabase.ref('game/slots');
        var oReferenceGameSlot = oDatabase.ref('game/slots/list/' + this.slotNumber);

        var nInitialNumPlayers = 1;

        // makes player 0
        this.players[0].setName(this.callbacks.getRandomPlayerName(0, this.playerNames));

        // adds player 0 to game
        this.initializeGamePlay(nInitialNumPlayers);

        // clears player 1 and waits for new player 1
        oReferenceGameSlot.set({
            player0: {
                name: this.players[0].getName(),
                hand: this.players[0].getHand()
            },
            player1: null,
            restOfCards: this.restOfCards
        });

        // renders player 0
        var oPlayAreaView = document.getElementById('playArea');
        this.players[0].makePlayerView(oPlayAreaView);

        // adds waiting message
        this.result = 'waiting for player 2';
        this.callbacks.renderResult(this.result);

        // stores a reference to the remote player 1
        this.oReferencePlayer1 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player1');
        var oReferenceRestOfCards = oDatabase.ref('game/slots/list/' + this.slotNumber + '/restOfCards');

        // listens for arrival of player 1
        this.oReferencePlayer1.on('value', function (snapshot) {
            var oPlayerValue = snapshot.val();

            // checks if a remote player 1 just joined and if there is no
            // player 1 yet
            if (oPlayerValue && !this.players[1]) {
                this.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo(oPlayerValue);
            }
        }.bind(this));

        // if don't wait button is pressed, removes listener for second player
        var dontWaitPressed = function () {

            // removes the listeners that detect changes to remote players
            this.oReferencePlayer0.off();
            this.oReferencePlayer1.off();

            // makes player 1
            this.players.push(new Player(1, this.oReferencePlayer1, this.cardWidth));
            this.players[1].addOnTapToTopCardInHand(this.localPlayerTappedCardInHand.bind(this));
            var sNotThisName = this.players[0] ? this.players[0].getName() : '';
            this.players[1].setName(this.callbacks.getRandomPlayerName(1, this.playerNames, sNotThisName));

            // distributes cards again if it wasn't done
            if (!this.restOfCards) {
                this.restOfCards = aGameSlots[this.slotNumber].restOfCards;
            }
            if (!this.restOfCards) {
                this.initializeGamePlay(1);
            }

            var oPlayerValue = this.players[1];
            this.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo(oPlayerValue);

            // removes rest of cards
            oReferenceRestOfCards.remove();

            // stores player 1
            this.oReferencePlayer1.set({
                name: this.players[1].getName(),
                hand: this.players[1].getHand()
            });
        };

        // makes don't wait button
        var oDontWaitBtn = document.createElement('button');
        var oContent = document.createTextNode('Don\'t wait');
        Tools.setClass(oDontWaitBtn, 'button');
        oDontWaitBtn.setAttribute('id', 'dontWait');
        oDontWaitBtn.appendChild(oContent);
        oDontWaitBtn.onclick = dontWaitPressed.bind(this, oDontWaitBtn);
        document.body.insertBefore(oDontWaitBtn, null);

    };

    /**
     * Checks table to see if the game is, if it's a war, or if it's time to
     * gather cards.
     */
    GamePlay.prototype.checkTable = function () {

        if (this.isGameFinished(this.players[0].getHand(), this.players[1].getHand())) {
            return;
        }

        if (this.players[0].getTableCard().value === this.players[1].getTableCard().value) {
            this.playWarSound(this.players[0].getTableCard().value);
            this.state = WAITING_FOR_FACE_DOWN_WAR_CARD;
        } else {
            this.state = WAITING_TO_GATHER_CARDS;
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
        if (this.allPlayersHaveSameNumberOfCardsOnTable && this.state === WAITING_TO_GATHER_CARDS) {

            // checks if player 0's card is higher than player 1's
            if (this.players[0].getTableCard().value > this.players[1].getTableCard().value) {
                // moves everyone's cards to the winner's hand
                this.players[0].moveTableToHand();
                this.players[0].moveTableToHand(this.players[1].getTable());

                // updates the loser's cards
                this.players[1].updateRemoteReference();
            } else if (this.players[0].getTableCard().value < this.players[1].getTableCard().value) {
                // player 1's card is higher than player 0's
                this.players[1].moveTableToHand();
                this.players[1].moveTableToHand(this.players[0].getTable());

                // updates the loser's cards
                this.players[0].updateRemoteReference();
            }

            this.isGameFinished(this.players[0].getHand(), this.players[1].getHand());

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
        var nNumCards = (this.players &&
            this.players.length > 0 &&
            this.players[0].getTable()) ? this.players[0].getTable().length : -1;

        this.allPlayersHaveSameNumberOfCardsOnTable = true;

        for (i = 0; i < this.numPlayers; i++) {
            if (!(this.players[i])
                || !(this.players[i].getTable())
                || !(this.players[i].getTable().length === nNumCards)) {
                this.allPlayersHaveSameNumberOfCardsOnTable = false;
            }
        }

        return this.allPlayersHaveSameNumberOfCardsOnTable;
    };

    /**
     * finds a player given the Id of a player view
     */
    GamePlay.prototype.findPlayerForPlayerViewId = function (sPlayerViewId) {
        var oPlayer = null;

        var i;

        for (i = 0; i < this.players.length ; i++) {
            if ('player' + this.players[i].getPlayerNum() === sPlayerViewId) {
                oPlayer = this.players[i];
                break;
            }
        }

        return oPlayer;
    };

    /**
     * reacts to a player tapping a card in their hand
     */
    GamePlay.prototype.localPlayerTappedCardInHand = function (oEvent) {

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

        this.playerTappedCardInHand(oPlayer);
    };

    /**
     * reacts to a player tapping a card in their hand
     */
    GamePlay.prototype.playerTappedCardInHand = function (oPlayer) {

        var i;

        // checks if the tap is a legitimate move in the game
        if (oPlayer && this.allPlayersJoined && this.state !== GAME_OVER) {

            switch (this.state) {
                case WAITING_TO_FILL_TABLE:
                    // checks if the player already has a card on the table
                    if (oPlayer.getTable() && oPlayer.getTable().length % 2 === 1) {
                        // does nothing
                        oPlayer.wiggleCardInHand();
                    } else {
                        oPlayer.putCardOnTable();

                        this.doAllPlayersHaveSameNumberOfCardsOnTable();
                        if (this.allPlayersHaveSameNumberOfCardsOnTable) {
                            this.checkTable();
                        }
                    }
                    break;
                case WAITING_FOR_FACE_DOWN_WAR_CARD:
                    // checks if player only has a face-up card on table
                    if (oPlayer.getTable() && oPlayer.getTable().length % 2 === 1) {
                        oPlayer.putCardOnTable();
                    } else {
                        oPlayer.wiggleCardInHand();
                    }
                    if (this.doAllPlayersHaveSameNumberOfCardsOnTable()) {
                        this.state = WAITING_TO_FILL_TABLE;
                    }

                    // TODO: ABSOLUTELY this could be too early to check if game
                    // finished
                    //
                    // ex. if player added last card to battle, and that card
                    // wins the battle, then he will lose game here, when it
                    // should continue
                    // Fix this brute force loss ABSOLUTELY

                    // checks if any player ran out of cards
                    this.isGameFinished(this.players[0].getHand(), this.players[1].getHand());

                    break;
                case WAITING_TO_GATHER_CARDS:
                    this.gatherCards();
                    break;
                default:
                    break;
            }
        } else {
            // does nothing
            oPlayer.wiggleCardInHand();
        }
    };

    // checks if one player has won
    GamePlay.prototype.isGameFinished = function (aPlayer0Cards, aPlayer1Cards) {

        var i, nOtherPlayer;

        for (i = 0; i < this.players.length; i++) {
            if (this.players[i].hand.length === 0) {
                if (i === 0) {
                    nOtherPlayer = 1;
                } else if (i === 1) {
                    nOtherPlayer = 0;
                }
                this.result = this.players[nOtherPlayer].getName() + ' wins';
                this.callbacks.renderResult(this.result);
                this.state = GAME_OVER;
                return true;
            }
        }
        return false;
    };

    // starts a game
    GamePlay.prototype.start = function () {

        this.shuffledCards = Tools.shuffle(this.cards);
        this.renderCards();

        var oDatabase = firebase.database();
        var oReferenceGameAllSlots = oDatabase.ref('game/slots');

        // checks remote database and stores players in a game slot
        oReferenceGameAllSlots.once('value', function (snapshot) {

            // gets game slot object from remote database
            var oGameSlots = snapshot.val();

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
            this.slotNumber = oGameSlotNumber ? oGameSlotNumber.value : 0;

            // stores remote references to players and to the rest of the cards
            this.oReferencePlayer0 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player0');
            this.oReferencePlayer1 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player1');
            var oReferenceRestOfCards = oDatabase.ref('game/slots/list/' + this.slotNumber + '/restOfCards');

            // checks if player 0 or player 1 have joined
            var bIsPlayer0SlotFull = false;
            var bIsPlayer1SlotFull = false;

            if (aGameSlots && aGameSlots.length > this.slotNumber && aGameSlots[this.slotNumber]) {
                bIsPlayer0SlotFull = aGameSlots[this.slotNumber].player0 ? true : false;
                bIsPlayer1SlotFull = aGameSlots[this.slotNumber].player1 ? true : false;
            }

            // clears the list of players
            while (this.players.length > 0) {
                this.players.pop();
            }

            if (!bIsPlayer0SlotFull && !bIsPlayer1SlotFull) {

                this.players.push(new Player(0, this.oReferencePlayer0, this.cardWidth));
                this.players[0].addOnTapToTopCardInHand(this.localPlayerTappedCardInHand.bind(this));

                // keeps player 0 waits for player 1
                this.keepPlayer0AndWaitForPlayer1();

            } else if (bIsPlayer0SlotFull && bIsPlayer1SlotFull) {

                // moves to next slot
                this.slotNumber = (this.slotNumber + 1) % this.maxNumberOfSlots;

                // updates remote references after the slot number changed
                this.oReferencePlayer0 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player0');
                this.oReferencePlayer1 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player1');
                oReferenceRestOfCards = oDatabase.ref('game/slots/list/' + this.slotNumber + '/restOfCards');

                this.players.push(new Player(0, this.oReferencePlayer0, this.cardWidth));
                this.players[0].addOnTapToTopCardInHand(this.localPlayerTappedCardInHand.bind(this));

                // keeps player 0 waits for player 1
                this.keepPlayer0AndWaitForPlayer1();

            } else if (bIsPlayer0SlotFull && !bIsPlayer1SlotFull) {

                this.players.push(new Player(0, this.oReferencePlayer0, this.cardWidth));
                this.players[0].addOnTapToTopCardInHand(this.localPlayerTappedCardInHand.bind(this));

                // keeps player 0
                this.players[0].setName(aGameSlots[this.slotNumber].player0.name);
                this.players[0].setHand(aGameSlots[this.slotNumber].player0.hand);

                // renders player 0
                var oPlayAreaView = document.getElementById('playArea');
                this.players[0].makePlayerView(oPlayAreaView);
                this.players[0].renderHand();
                this.players[0].renderTable();

                // makes player 1
                this.players.push(new Player(1, this.oReferencePlayer1, this.cardWidth));
                this.players[1].addOnTapToTopCardInHand(this.localPlayerTappedCardInHand.bind(this));
                var sNotThisName = this.players[0] ? this.players[0].getName() : '';
                this.players[1].setName(this.callbacks.getRandomPlayerName(1, this.playerNames, sNotThisName));

                // distributes cards again if it wasn't done
                if (!this.restOfCards) {
                    this.restOfCards = aGameSlots[this.slotNumber].restOfCards;
                }
                if (!this.restOfCards) {
                    this.initializeGamePlay(1);
                }

                // adds player 1 to game
                this.addPlayerToGamePlay(1, 1, [null, this.restOfCards]);

                // renders player 1
                var oPlayAreaView = document.getElementById('playArea');
                this.players[1].makePlayerView(oPlayAreaView);
                this.renderCards();

                // removes rest of cards
                oReferenceRestOfCards.remove();

                // stores player 1
                this.oReferencePlayer1.set({
                    name: this.players[1].getName(),
                    hand: this.players[1].getHand()
                });

            } else if (!bIsPlayer0SlotFull && bIsPlayer1SlotFull) {

                // TODO: implement the case when player 1 has somehow joined
                // before player 0

            }

            oReferenceGameAllSlots.child('lastSlot').set({
                value: this.slotNumber
            });

            // listens for changes to player 0's cards
            this.oReferencePlayer0 = oDatabase.ref('/game/slots/list/' + this.slotNumber + '/player0');
            this.oReferencePlayer0.on('value', function (snapshot) {
                var oPlayer0Value = snapshot.val();

                if (oPlayer0Value) {
                    var oPlayer0HandValue = oPlayer0Value.hand;
                    var oPlayer0TableValue = oPlayer0Value.table || [];

                    // sets player 0's hand
                    if (oPlayer0HandValue && this.players[0]) {
                        this.players[0].setHand(
                            oPlayer0HandValue
                        );
                        this.players[0].renderHand();
                    }

                    // sets player 0's table
                    if (oPlayer0TableValue && this.players[0]) {
                        this.players[0].setTable(
                            oPlayer0TableValue
                        );
                        this.players[0].renderTable();
                    }
                }
            }.bind(this));

            // listens for changes to player 1's cards
            this.oReferencePlayer1 = oDatabase.ref('/game/slots/list/' + this.slotNumber + '/player1');
            this.oReferencePlayer1.on('value', function (snapshot) {
                var oPlayer1Value = snapshot.val();

                if (oPlayer1Value) {
                    var oPlayer1HandValue = oPlayer1Value.hand;
                    var oPlayer1TableValue = oPlayer1Value.table || [];

                    // sets player 1's hand
                    if (oPlayer1HandValue && this.players[1]) {
                        this.players[1].setHand(
                            oPlayer1HandValue
                        );
                        this.players[1].renderHand();
                    }

                    // sets player 1's table
                    if (oPlayer1TableValue && this.players[1]) {
                        this.players[1].setTable(
                            oPlayer1TableValue
                        );
                        this.players[1].renderTable();
                    }
                }
            }.bind(this));

        }.bind(this));

        this.hamsterSound = new Audio('../resources/hamster-wheel.wav');
        this.rabbitSound = new Audio('../resources/rabbit-crunch.wav');
        this.meowSound = new Audio('../resources/kitten-meow.wav');
        this.barkSound = new Audio('../resources/small-dog-bark.wav');
        this.tigerSound = new Audio('../resources/tiger-growl.wav');
        this.elephantSound = new Audio('../resources/elephant.wav');

    };

    return GamePlay;
});
