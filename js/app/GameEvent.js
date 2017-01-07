/*global define */
define('GameEvent', ['Player'], function (Player) {

    'use strict';

    var PLAY_STATE = {
        movingToTable: 0,
        checkingTable: 1
    };

    var nPlayState = PLAY_STATE.movingToTable;

    var GameEvent = function (nNumPlayers, aCards, aPlayerNames, nMaxNumberOfSlots, nCardWidth, oCallbacks) {

        this.numPlayers = nNumPlayers;
        this.cards = aCards;
        this.playerNames = aPlayerNames;
        this.maxNumberOfSlots = nMaxNumberOfSlots;
        this.cardWidth = nCardWidth;
        this.callbacks = oCallbacks;

        this.currentSlot;
        this.players = [];

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
    * adds the given card to the given view
    */
    GameEvent.prototype.addCardToView = function (oView, oCard, nCardPosition, bLastCard, bStackCard, bShowCardFace, bMoving) {

        var oCardView = document.createElement('div');

        // decides if card should be shown as stacked to save space
        if (bStackCard) {
            oCardView.setAttribute('class', 'card' + ' stackedCard');
        } else if (nCardPosition < 1 || bLastCard) {
            oCardView.setAttribute('class', 'card');
        } else {
            oCardView.setAttribute('class', 'card' + ' stackedCard');
        }

        // sets the card to show back or face
        if (bShowCardFace === false) {
            oCardView.setAttribute('class', oCardView.getAttribute('class') + ' showBack');
        } else {
            oCardView.setAttribute('class', oCardView.getAttribute('class') + ' showFace');
        }

        // uses a class to flag that the card should be animated
        // (ie. moving to the table)
        if (bMoving) {
            oCardView.setAttribute('class', oCardView.getAttribute('class') + ' movingToTable');
            oCardView.addEventListener('animationend', this.callbacks.finishedMovingToTableListener, false);
        }

        // sets the card's id as suit+value
        oCardView.setAttribute('id', 'card' + oCard.value + '-' + oCard.suit);

        var oCardFaceView = document.createElement('div');
        oCardFaceView.setAttribute('class', 'content');

        oCardView.insertBefore(oCardFaceView, null);

        oView.insertBefore(oCardView, null);
    };

    /**
    * renders the cards in a player's table
    */
    // TODO: move this method to Player class
    GameEvent.prototype.renderPlayerTable = function (nPlayer, aPlayerTable) {

        var i, oPlayerTableView = document.getElementById('table' + (nPlayer + 1));
        var nWidth = window.innerWidth;
        var nTableWidth = aPlayerTable.length * this.cardWidth;

        // clears view of all cards
        while (oPlayerTableView.firstChild) {
            oPlayerTableView.removeChild(oPlayerTableView.firstChild);
        }

        // counts how many cards to stack depending on how wide the screen is
        var nNumStackedCards = 0, bStackCard = false;
        while (nTableWidth >= 0.105 * nWidth) {
            nNumStackedCards++;
            nTableWidth = (aPlayerTable.length - nNumStackedCards) * this.cardWidth;
        }

        // redraws the whole table
        var bShowCardFace = false,
            bMoving = false;
        for (i = 0; i < aPlayerTable.length; i++) {
            bStackCard = (i < nNumStackedCards && i !== aPlayerTable.length - 1);
            bShowCardFace = i % 2 === 0;
            bMoving = i === (aPlayerTable.length - 1);
            this.addCardToView(oPlayerTableView, aPlayerTable[i], 0, true, bStackCard, bShowCardFace, bMoving);
        }

    };

    /**
     * renders the cards in a player's hand
     */
     // TODO: move this method to Player class
    GameEvent.prototype.renderPlayerHand = function (nPlayer, aPlayerCards) {

        var i, oPlayAreaView = document.getElementById('playArea'),
            oPlayerHandView = document.getElementById('hand' + (nPlayer + 1)),
            bStackCard = null,
            bShowCardFace = false;

        var fnOnPlayerNameChanged = function (oEvent) {
            var nRefId, sValue = '';
            if (oEvent && oEvent.target) {
                nRefId = oEvent.target.getAttribute('ref-id');
                sValue = oEvent.target.value;
            }
            this.players[nRefId].setName(sValue);
        }.bind(this);

        if (!oPlayerHandView) {
            this.players[nPlayer].makePlayerView(nPlayer, oPlayAreaView, fnOnPlayerNameChanged);
            oPlayerHandView = document.getElementById('hand' + (nPlayer + 1));
        }

        // clears view of all cards
        while (oPlayerHandView.firstChild) {
            oPlayerHandView.removeChild(oPlayerHandView.firstChild);
        }

        // redraws the whole hand
        for (i = 0; i < aPlayerCards.length; i++) {
            this.addCardToView(oPlayerHandView, aPlayerCards[i], i, (i === aPlayerCards.length - 1), bStackCard, bShowCardFace);
        }
    };

    /**
    * renders all the cards
    */
    GameEvent.prototype.renderCards = function () {
        var i;
        for (i = 0; i < this.players.length; i++) {
            this.renderPlayerTable(i, this.players[i].getTable());
            this.renderPlayerHand(i, this.players[i].getHand());
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
            nPlayState = PLAY_STATE.movingToTable;
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

        return 'Player' + (nPlayer + 1);
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

    GameEvent.prototype.keepPlayer1AndWaitForPlayer2 = function () {

        var oDatabase = firebase.database();
        var oReferenceGameAllSlots = oDatabase.ref('game/slots');
        var oReferenceGameSlot = oDatabase.ref('game/slots/list/' + this.slotNumber);

        // hides play button
        var oPlayBtn = document.getElementById('play');
        oPlayBtn.style.display = 'none';

        var nInitialNumPlayers = 1;

        // makes player 1
        this.players[0].setName(this.getRandomPlayerName(0, this.playerNames));

        // adds player 1 to game
        this.initializeGameEvent(nInitialNumPlayers);

        // clears player 2 and waits for new player 2
        oReferenceGameSlot.set({
            player1: {
                name: this.players[0].getName(),
                hand: this.players[0].getHand()
            },
            player2: null,
            restOfCards: this.restOfCards
        });

        // renders player 1
        var oPlayAreaView = document.getElementById('playArea');
        this.players[0].makePlayerView(0, oPlayAreaView);
        this.renderCards();

        // adds waiting message
        this.result = 'waiting for player 2';
        this.callbacks.renderResult(this.result);

        // stores a reference to the remote player 2
        var oReferencePlayer2 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player2');
        var oReferenceRestOfCards = oDatabase.ref('game/slots/list/' + this.slotNumber + '/restOfCards');

        oReferencePlayer2.on('value', function (snapshot) {
            var oPlayerValue = snapshot.val();

            // checks if a remote player 2 just joined
            if (oPlayerValue) {
                // gets player 2
                this.players.push(new Player(oReferencePlayer2));
                this.players[1].setName(oPlayerValue.name);
                this.players[1].setHand(oPlayerValue.hand);

                // adds player 2 to game
                this.addPlayerToGameEvent(1, 1, [null, this.restOfCards]);
                this.restOfCards = [];

                // renderPlayerTable.call(this, 1, this.players[1].getTable());

                // renders player 2
                var oPlayAreaView = document.getElementById('playArea');
                this.players[1].makePlayerView(1, oPlayAreaView);
                this.renderCards();

                // removes the listener that detects a new remote player 2
                oReferencePlayer2.off();

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

            // removes the listener that detects a new remote player 2
            oReferencePlayer2.off();

            // shows play button
            var oPlayBtn = document.getElementById('play');
            oPlayBtn.style.display = 'block';

            // hides don't wait button
            var oDontWaitBtn = document.getElementById('dontWait');
            oDontWaitBtn.style.display = 'none';

            // clears waiting message
            this.result = '';
            this.callbacks.renderResult(this.result);

            // makes player 2
            this.players.push(new Player(oReferencePlayer2));
            this.players[1].setName(this.getRandomPlayerName(1, this.playerNames));

            // distributes cards again if it wasn't done
            if (!this.restOfCards) {
                this.restOfCards = aGameSlots[this.slotNumber].restOfCards;
            }
            if (!this.restOfCards) {
                this.initializeGameEvent(1);
            }

            // adds player 2 to game
            this.addPlayerToGameEvent(1, 1, [null, this.restOfCards]);

            // renders player 2
            var oPlayAreaView = document.getElementById('playArea');
            this.players[1].makePlayerView(1, oPlayAreaView);
            this.renderCards();

            // removes rest of cards
            oReferenceRestOfCards.remove();

            // stores player 2
            oReferencePlayer2.set({
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

    GameEvent.prototype.doTurn = function () {

        var i;
        switch (nPlayState) {
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

            nPlayState = PLAY_STATE.checkingTable;

            break;

        case PLAY_STATE.checkingTable:

            // checks if player 0's card is higher than player 1's
            if (this.players[0].getTableCard().value > this.players[1].getTableCard().value) {
                this.players[0].moveTableToHand();
                this.players[0].moveTableToHand(this.players[1].getTable());
            } else if (this.players[0].getTableCard().value < this.players[1].getTableCard().value) {
                // player 1's card is higher than player 0's
                this.players[1].moveTableToHand();
                this.players[1].moveTableToHand(this.players[0].getTable());
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
            nPlayState = PLAY_STATE.movingToTable;

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
            makePlayerView.call(this, oPlayAreaView, i);
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

    GameEvent.prototype.isGameFinished = function (aPlayer1Cards, aPlayer2Cards) {

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

        /*
         * checks remote database and stores players in a game slot
         */
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
            var oReferencePlayer1 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player1');
            var oReferencePlayer2 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player2');
            var oReferenceRestOfCards = oDatabase.ref('game/slots/list/' + this.slotNumber + '/restOfCards');

            // checks if player 1 or player 2 have joined
            var bIsPlayer1SlotFull = false;
            var bIsPlayer2SlotFull = false;

            if (aGameSlots && aGameSlots.length > this.slotNumber && aGameSlots[this.slotNumber]) {
                bIsPlayer1SlotFull = aGameSlots[this.slotNumber].player1 ? true : false;
                bIsPlayer2SlotFull = aGameSlots[this.slotNumber].player2 ? true : false;
            }

            // clears the list of players
            while (this.players.length > 0) {
                this.players.pop();
            }

            if (!bIsPlayer1SlotFull && !bIsPlayer2SlotFull) {

                this.players.push(new Player(oReferencePlayer1));

                // keeps player 1 waits for player 2
                this.keepPlayer1AndWaitForPlayer2();

            } else if (bIsPlayer1SlotFull && bIsPlayer2SlotFull) {

                // moves to next slot
                this.slotNumber = (this.slotNumber + 1) % this.maxNumberOfSlots;

                // updates remote references after the slot number changed
                oReferencePlayer1 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player1');
                oReferencePlayer2 = oDatabase.ref('game/slots/list/' + this.slotNumber + '/player2');
                oReferenceRestOfCards = oDatabase.ref('game/slots/list/' + this.slotNumber + '/restOfCards');

                this.players.push(new Player(oReferencePlayer1));

                // keeps player 1 waits for player 2
                this.keepPlayer1AndWaitForPlayer2();

            } else if (bIsPlayer1SlotFull && !bIsPlayer2SlotFull) {

                this.players.push(new Player(oReferencePlayer1));

                // keeps player 1
                this.players[0].setName(aGameSlots[this.slotNumber].player1.name);
                this.players[0].setHand(aGameSlots[this.slotNumber].player1.hand);

                // renders player 1
                var oPlayAreaView = document.getElementById('playArea');
                this.players[0].makePlayerView(0, oPlayAreaView);
                this.renderCards();

                // makes player 2
                this.players.push(new Player(oReferencePlayer2));
                this.players[1].setName(this.getRandomPlayerName(1, this.playerNames));

                // distributes cards again if it wasn't done
                if (!this.restOfCards) {
                    this.restOfCards = aGameSlots[this.slotNumber].restOfCards;
                }
                if (!this.restOfCards) {
                    this.initializeGameEvent(1);
                }

                // adds player 2 to game
                this.addPlayerToGameEvent(1, 1, [null, this.restOfCards]);

                // renders player 2
                var oPlayAreaView = document.getElementById('playArea');
                this.players[1].makePlayerView(1, oPlayAreaView);
                this.renderCards();

                // removes rest of cards
                oReferenceRestOfCards.remove();

                // stores player 2
                oReferencePlayer2.set({
                    name: this.players[1].getName(),
                    hand: this.players[1].getHand()
                });

                // shows play button
                var oPlayBtn = document.getElementById('play');
                oPlayBtn.style.display = 'block';

            } else if (!bIsPlayer1SlotFull && bIsPlayer2SlotFull) {

                this.players.push(new Player(oReferencePlayer1));

                // keeps player 2
                this.players[0].setName(this.getRandomPlayerName(0, this.playerNames));

                // renders player 2
                var oPlayAreaView = document.getElementById('playArea');
                this.players[1].makePlayerView(1, oPlayAreaView);
                this.renderCards();

                // makes player 1
                this.players[1].setName(aGameSlots[this.slotNumber].player2.name);

                // distributes cards again if it wasn't done
                if (!this.restOfCards) {
                    this.restOfCards = aGameSlots[this.slotNumber].restOfCards;
                }
                if (!this.restOfCards) {
                    this.initializeGameEvent(1);
                }

                // adds player 1 and 2 to game
                this.addPlayerToGameEvent(0, 0, [this.restOfCards, null]);

                // renders player 1
                var oPlayAreaView = document.getElementById('playArea');
                this.players[0].makePlayerView(0, oPlayAreaView);
                this.renderCards();

                // removes rest of cards
                oReferenceRestOfCards.remove();

                oReferencePlayer1.set({
                    name: this.players[0].getName(),
                    hand: this.players[0].getHand()
                });

                // shows play button
                var oPlayBtn = document.getElementById('play');
                oPlayBtn.style.display = 'block';

            }

            oReferenceGameAllSlots.child('lastSlot').set({
                value: this.slotNumber
            });

            // listens if player 2's hand changed
            this.oReferencePlayer2Hand = oDatabase.ref('/game/slots/list/' + this.slotNumber + '/player2/hand');
            this.oReferencePlayer2Hand.on('value', function (snapshot) {
                var oPlayer2HandValue = snapshot.val();

                // checks if we have a value of the hand in the remote
                // reference, and checks if player 2 has already been created
                // (it is possible that this is the start of the game and
                // player 2 is just joining... which is why we are seeing their
                // hand change)
                if (oPlayer2HandValue && this.players[1]) {
                    this.players[1].setHand(
                        oPlayer2HandValue
                    );
                    this.renderCards();
                }
            }.bind(this));

            // listens if player 2's table changed
            this.oReferencePlayer2Table = oDatabase.ref('/game/slots/list/' + this.slotNumber + '/player2/table');
            this.oReferencePlayer2Table.on('value', function (snapshot) {
                var oPlayer2TableValue = snapshot.val();

                // checks if we have a value of the table in the remote
                // reference, and checks if player 2 has already been created
                // (player 2 should exist already, because this is a change in
                // their table... that only happens after the game has started;
                // so we can probably assume that this.players[1] exists, but
                // we check it anyway)
                if (oPlayer2TableValue && this.players[1]) {
                    this.players[1].setTable(
                        oPlayer2TableValue
                    );
                    this.renderCards();
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
