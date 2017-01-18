/*global define */
define('GameEvent', ['Player'], function (Player) {

    'use strict';

    var PLAY_STATE = {
        movingToTable: 0,
        checkingTable: 1
    };

    var GameEvent = function (nNumPlayers, aCards, aPlayerNames, nMaxNumberOfSlots, nCardWidth, oCallbacks) {

        this.numPlayers = nNumPlayers;
        this.cards = aCards;
        this.playerNames = aPlayerNames;
        this.maxNumberOfSlots = nMaxNumberOfSlots;
        this.cardWidth = nCardWidth;
        this.callbacks = oCallbacks;

        this.currentSlot;
        this.players = [];

        this.playState = PLAY_STATE.movingToTable;
    };

    GameEvent.prototype.getCurrentSlot = function () {
        return this.currentSlot;
    };

    GameEvent.prototype.setCurrentSlot = function (nCurrentSlot) {
        this.currentSlot = nCurrentSlot;
    };

    GameEvent.prototype.getPlayers = function () {
        return this.players;
    };

    GameEvent.prototype.setPlayers = function (aPlayers) {
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
    GameEvent.prototype.distribute = function (aCards) {

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
    * shuffles a set of things
    */
    GameEvent.prototype.shuffle = function (aThings) {
        var i, n, aShuffledThings = [];

        while (aThings.length > 0) {
            n = Math.floor(Math.random() * aThings.length);
            aShuffledThings.push(aThings.splice(n, 1)[0]);
        }

        return aShuffledThings;
    };

    /**
    * renders all the cards
    */
    GameEvent.prototype.renderCards = function () {
        var i;
        for (i = 0; i < this.players.length; i++) {
            this.players[i].renderTable();
            this.players[i].renderHand();
        }
    };

    /**
     * initializes a game; makes players and cards and distributes them
     */
    GameEvent.prototype.initializeGameEvent = function (aCards) {

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
        oShuffleBtn.setAttribute('class', 'button');
        oShuffleBtn.setAttribute('id', 'shuffle');
        oShuffleBtn.appendChild(oContent);
        oShuffleBtn.onclick = function (oEvent) {
            var i, aDistributedCards;
            this.playState = PLAY_STATE.movingToTable;
            this.result = '';
            this.callbacks.renderResult(this.result);
            this.players[0].clearTable();
            this.players[1].clearTable();
            this.shuffledCards = this.shuffle(this.shuffledCards);
            aDistributedCards = distribute(this.shuffledCards, this.players.length);
            for (i = 0; i < this.players.length; i++) {
                this.players[i].setHand(aDistributedCards[i]);
            }
            this.renderCards();
        }.bind(this);
        // document.body.insertBefore(oShuffleBtn, null);

        this.result = '';
    };

    GameEvent.prototype.getRandomPlayerName = function (nPlayer, aPlayerNames) {

        var i, aCopyOfPlayerNames = [];
        for (i = 0; i < aPlayerNames.length; i++) {
            aCopyOfPlayerNames.push(aPlayerNames[i]);
        }

        var aShuffledPlayerNames = this.shuffle(aCopyOfPlayerNames);

        if (nPlayer >= 0 && nPlayer < aShuffledPlayerNames.length) {
            return aShuffledPlayerNames[nPlayer];
        }

        return 'Player' + nPlayer;
    };

    /**
     * adds players to a game
     */
    GameEvent.prototype.addPlayerToGameEvent = function (nFirstPlayer, nLastPlayer, aDistributedCards) {

        var i;
        for (i = nFirstPlayer; i <= nLastPlayer; i++) {
            if (i < this.players.length) {
                this.players[i].setHand(aDistributedCards[i]);
            }
        }
    };

    GameEvent.prototype.keepPlayer0AndWaitForPlayer1 = function () {

        var oDatabase = firebase.database();
        var oReferenceGameAllSlots = oDatabase.ref('game/slots');
        var oReferenceGameSlot = oDatabase.ref('game/slots/list/' + this.slotNumber);

        // hides play button
        var oPlayBtn = document.getElementById('play');
        oPlayBtn.style.display = 'none';

        var nInitialNumPlayers = 1;

        // makes player 0
        this.players[0].setName(this.getRandomPlayerName(0, this.playerNames));

        // adds player 0 to game
        this.initializeGameEvent(nInitialNumPlayers);

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
        this.renderCards();

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

                // gets player 1
                this.players.push(new Player(1, this.oReferencePlayer1, this.cardWidth));
                this.players[1].setName(oPlayerValue.name);
                this.players[1].setHand(oPlayerValue.hand);

                // adds player 1 to game
                this.addPlayerToGameEvent(1, 1, [null, this.restOfCards]);
                this.restOfCards = [];

                // renders player 1
                var oPlayAreaView = document.getElementById('playArea');
                this.players[1].makePlayerView(oPlayAreaView);
                this.renderCards();

                // shows play button
                var oPlayBtn = document.getElementById('play');
                oPlayBtn.style.display = 'block';

                // hides don't wait button
                var oDontWaitBtn = document.getElementById('dontWait');
                oDontWaitBtn.style.display = 'none';

                // clears waiting message
                this.result = '';
                this.callbacks.renderResult(this.result);
            }
        }.bind(this));

        // if don't wait button is pressed, removes listener for second player
        var dontWaitPressed = function () {

            // removes the listeners that detect changes to remote players
            this.oReferencePlayer0.off();
            this.oReferencePlayer1.off();

            // shows play button
            var oPlayBtn = document.getElementById('play');
            oPlayBtn.style.display = 'block';

            // hides don't wait button
            var oDontWaitBtn = document.getElementById('dontWait');
            oDontWaitBtn.style.display = 'none';

            // clears waiting message
            this.result = '';
            this.callbacks.renderResult(this.result);

            // makes player 1
            this.players.push(new Player(1, this.oReferencePlayer1, this.cardWidth));
            this.players[1].setName(this.getRandomPlayerName(1, this.playerNames));

            // distributes cards again if it wasn't done
            if (!this.restOfCards) {
                this.restOfCards = aGameSlots[this.slotNumber].restOfCards;
            }
            if (!this.restOfCards) {
                this.initializeGameEvent(1);
            }

            // adds player 1 to game
            this.addPlayerToGameEvent(1, 1, [null, this.restOfCards]);

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
        };

        // makes don't wait button
        var oDontWaitBtn = document.createElement('button');
        var oContent = document.createTextNode('Don\'t wait');
        oDontWaitBtn.setAttribute('class', 'button');
        oDontWaitBtn.setAttribute('id', 'dontWait');
        oDontWaitBtn.appendChild(oContent);
        oDontWaitBtn.onclick = dontWaitPressed.bind(this, oDontWaitBtn);
        document.body.insertBefore(oDontWaitBtn, null);

    };

    var playPressed = function () {
        this.doTurn();
    };

    /**
     * Moves cards to the table or moves the table cards to the hand of the
     * player that won the turn.
     * Or adds another card to the table in case of a tie.
     */
    GameEvent.prototype.doTurn = function () {

        var i,
            bAllTablesEmpty = true;

        // checks if even or odd number of cards on the table;
        // we need to do this in case of remote games when cards have simply
        // synchronized to the remote cards without checking what was actually
        // happening in the game
        if (this.players[0].getTable().length % 2 === 0) {
            this.playState = PLAY_STATE.movingToTable;
        } else {
            this.playState = PLAY_STATE.checkingTable;
        }

        switch (this.playState) {
        case PLAY_STATE.movingToTable:

            if (this.isGameFinished(this.players[0].getHand(), this.players[1].getHand())) {
                return;
            }

            for (i = 0; i < this.numPlayers; i++) {
                if (i < this.players.length) {
                    this.players[i].putCardOnTable();
                }
            }

            if (this.players[0].getTableCard().value === this.players[1].getTableCard().value) {
                switch (this.players[0].getTableCard().value) {
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
            }

            this.playState = PLAY_STATE.checkingTable;

            break;

        case PLAY_STATE.checkingTable:

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
            } else if (this.players[0].getTableCard().value === this.players[1].getTableCard().value) {
                // players' cards are the same
                // first checks if game is over (ie. in a 2-player game, if a player ran out of cards)
                if (this.isGameFinished(this.players[0].getHand(), this.players[1].getHand())) {
                    return;
                }
                // if game is not over, all players add a face-down card to the table
                for (i = 0; i < this.numPlayers; i++) {
                    if (i < this.players.length) {
                        this.players[i].putCardOnTable();
                    }
                }
            }

            this.isGameFinished(this.players[0].getHand(), this.players[1].getHand());
            this.playState = PLAY_STATE.movingToTable;

            break;
        default:
            break;
        }

        this.renderCards();
    };

    GameEvent.prototype.makeView = function () {

        var oGameView = document.createElement('div');
        oGameView.setAttribute('class', 'game');
        oGameView.setAttribute('id', 'game');

        document.body.insertBefore(oGameView, null);

        var oPlayAreaView = document.createElement('div');
        oPlayAreaView.setAttribute('class', 'playArea');
        oPlayAreaView.setAttribute('id', 'playArea');

        oGameView.insertBefore(oPlayAreaView, null);

        var i;

        for (i = 0; i < this.players.length; i++) {
            this.players[i].makePlayerView(oPlayAreaView);
        }

        var oPlayBtn = document.createElement('button');
        var oContent = document.createTextNode('Play');
        oPlayBtn.setAttribute('class', 'button');
        oPlayBtn.setAttribute('id', 'play');
        oPlayBtn.appendChild(oContent);
        oPlayBtn.addEventListener('touchstart', this.callbacks.preventZoom);
        oPlayBtn.onclick = playPressed.bind(this, this.numPlayers);
        document.body.insertBefore(oPlayBtn, null);

        // hides play button
        oPlayBtn.style.display = 'none';

        var oResultView = document.createElement('div');
        oResultView.setAttribute('class', 'result');
        oResultView.setAttribute('id', 'result');

        document.body.insertBefore(oResultView, null);
    };

    GameEvent.prototype.isGameFinished = function (aPlayer0Cards, aPlayer1Cards) {

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
                return true;
            }
        }
        return false;
    };

    GameEvent.prototype.start = function () {

        this.makeView();
        this.shuffledCards = this.shuffle(this.cards);
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

                // keeps player 0 waits for player 1
                this.keepPlayer0AndWaitForPlayer1();

            } else if (bIsPlayer0SlotFull && !bIsPlayer1SlotFull) {

                this.players.push(new Player(0, this.oReferencePlayer0, this.cardWidth));

                // keeps player 0
                this.players[0].setName(aGameSlots[this.slotNumber].player0.name);
                this.players[0].setHand(aGameSlots[this.slotNumber].player0.hand);

                // renders player 0
                var oPlayAreaView = document.getElementById('playArea');
                this.players[0].makePlayerView(oPlayAreaView);
                this.renderCards();

                // makes player 1
                this.players.push(new Player(1, this.oReferencePlayer1, this.cardWidth));
                this.players[1].setName(this.getRandomPlayerName(1, this.playerNames));

                // distributes cards again if it wasn't done
                if (!this.restOfCards) {
                    this.restOfCards = aGameSlots[this.slotNumber].restOfCards;
                }
                if (!this.restOfCards) {
                    this.initializeGameEvent(1);
                }

                // adds player 1 to game
                this.addPlayerToGameEvent(1, 1, [null, this.restOfCards]);

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

                // shows play button
                var oPlayBtn = document.getElementById('play');
                oPlayBtn.style.display = 'block';

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

                    if (oPlayer0HandValue && this.players[0]) {
                        this.players[0].setHand(
                            oPlayer0HandValue
                        );
                        this.players[0].renderHand();
                    }

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

                    if (oPlayer1HandValue && this.players[1]) {
                        this.players[1].setHand(
                            oPlayer1HandValue
                        );
                        this.players[1].renderHand();
                    }

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

    return GameEvent;
});
