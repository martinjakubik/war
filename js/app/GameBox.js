/*global require */
/*global Audio: false */
require(['Player'], function (Player) {
    'use strict';

    var nCardWidth = 68;

    var addClass = function (oView, sClass) {
        var sClasses = oView.getAttribute('class');

        if (sClasses.indexOf(sClass) < 0) {
            oView.setAttribute('class', oView.getAttribute('class', + ' ' + sClass));
        }
    };

    var removeClass = function (oView, sClass) {
        var sCurrentClasses = oView.getAttribute('class');
        var nStartIndex = sCurrentClasses.indexOf(sClass);
        var nEndIndex = nStartIndex + sClass.length;
        var sUpdatedClasses;

        if (nStartIndex > 0 && nEndIndex <= sCurrentClasses.length) {
            sUpdatedClasses = (sCurrentClasses.substr(0, nStartIndex) + ' ' +
                sCurrentClasses.substr(nEndIndex)).trim();
            oView.setAttribute('class', sUpdatedClasses);
        }
    };

    var finishedMovingToTableListener = function (oEvent) {
        switch (oEvent.type) {
          case 'animationend':
              var oElement = oEvent.target;

              // removes moving to table flag
              removeClass(oElement, 'movingToTable');
              break;
          default:

        }
    };

    var addCardToView = function (oView, oCard, nCardPosition, bLastCard, bStackCard, bShowCardFace, bMoving) {

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
            oCardView.addEventListener('animationend', finishedMovingToTableListener, false);
        }

        // sets the card's id as suit+value
        oCardView.setAttribute('id', 'card' + oCard.value + '-' + oCard.suit);

        var oCardFaceView = document.createElement('div');
        oCardFaceView.setAttribute('class', 'content');

        oCardView.insertBefore(oCardFaceView, null);

        oView.insertBefore(oCardView, null);
    };

    var renderPlayerTable = function (nPlayer, aPlayerTable) {

        var i, oPlayerTableView = document.getElementById('table' + nPlayer);
        var nWidth = window.innerWidth;
        var nTableWidth = aPlayerTable.length * nCardWidth;

        // clears view of all cards
        while (oPlayerTableView.firstChild) {
            oPlayerTableView.removeChild(oPlayerTableView.firstChild);
        }

        // counts how many cards to stack depending on how wide the screen is
        var nNumStackedCards = 0, bStackCard = false;
        while (nTableWidth >= 0.105 * nWidth) {
            nNumStackedCards++;
            nTableWidth = (aPlayerTable.length - nNumStackedCards) * nCardWidth;
        }

        // redraws the whole table
        var bShowCardFace = false,
            bMoving = false;
        for (i = 0; i < aPlayerTable.length; i++) {
            bStackCard = (i < nNumStackedCards && i !== aPlayerTable.length - 1);
            bShowCardFace = i % 2 === 0;
            bMoving = i === (aPlayerTable.length - 1);
            addCardToView(oPlayerTableView, aPlayerTable[i], 0, true, bStackCard, bShowCardFace, bMoving);
        }

    };

    var renderPlayerHand = function (nPlayer, aPlayerCards) {

        var i,
            oPlayerHandView = document.getElementById('hand' + nPlayer),
            bStackCard = null,
            bShowCardFace = false;

        // clears view of all cards
        while (oPlayerHandView.firstChild) {
            oPlayerHandView.removeChild(oPlayerHandView.firstChild);
        }

        // redraws the whole hand
        for (i = 0; i < aPlayerCards.length; i++) {
            addCardToView(oPlayerHandView, aPlayerCards[i], i, (i === aPlayerCards.length - 1), bStackCard, bShowCardFace);
        }
    };

    var makeCards = function (aCardValues) {
        var aCards = [];

        var aSuitLetters = ['a', 'b', 'c', 'd', 'e', 'f'];
        var i, nSuit, mHighestSuitsFoundForValue = {};

        // distributes the cards into suits
        for (i = 0; i < aCardValues.length; i++) {
            nSuit = -1;
            if (!mHighestSuitsFoundForValue[aCardValues[i]] && mHighestSuitsFoundForValue[aCardValues[i]] !== 0) {
                mHighestSuitsFoundForValue[aCardValues[i]] = nSuit;
            }
            mHighestSuitsFoundForValue[aCardValues[i]]++;

            aCards.push({
                value: aCardValues[i],
                suit: aSuitLetters[mHighestSuitsFoundForValue[aCardValues[i]]]
            });
        }

        // adds skunk
        aCards.push({
            value: 14,
            suit: 'a'
        });

        return aCards;
    };

    var shuffle = function (aThings) {
        var i, n, aShuffledThings = [];

        while (aThings.length > 0) {
            n = Math.floor(Math.random() * aThings.length);
            aShuffledThings.push(aThings.splice(n, 1)[0]);
        }

        return aShuffledThings;
    };

    /**
     * distributes the cards to the given number of players
     *
     * @param aCards an array of cards
     * @param nNumPlayers the number of players
     *
     * @return the cards distributed between players; in the
     *      form of an array of player arrays, each player
     *      array containing cards
     */
    var distribute = function (aCards, nNumPlayers) {

        var i, j, oCard;
        var aDistributedCards = [];

        for (i = 0; i < aCards.length; i++) {
            oCard = aCards[i];

            for (j = 0; j < nNumPlayers; j++) {
                if (i % nNumPlayers === j) {
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

    var renderCards = function () {
        var i;
        for (i = 0; i < this.players.length; i++) {
            renderPlayerTable(i + 1, this.players[i].getTable());
            renderPlayerHand(i + 1, this.players[i].getHand());
        }
    };

    /**
     * initializes a game; makes players and cards and distributes them
     */
    var initializeGameEvent = function (nNumPlayers) {

        var aBatawafCardValues = [6, 3, 5, 5, 1, 6, 4, 2, 4, 3, 1, 3, 5, 6, 2, 4, 6, 3, 4, 4, 6, 1, 2, 1, 4,  5, 1, 3, 5, 2, 6, 1, 2, 2, 3, 5];
        this.cards = makeCards(aBatawafCardValues);

        this.shuffledCards = shuffle(this.cards);
        var nNumPlayersAmongWhomToDistributeCards = nNumPlayers > 1 ? nNumPlayers : 2;
        var aDistributedCards = distribute(this.shuffledCards, nNumPlayersAmongWhomToDistributeCards);

        var i;
        for (i = 0; i < nNumPlayers; i++) {
            if (i < this.players.length) {
                this.players[i].setHand(aDistributedCards[i]);
            }
        }

        this.result = '';
    };

    /**
     * initializes a game; makes players and cards and distributes them
     */
    var addPlayerToGameEvent = function (nNumPlayers) {

        var nNumPlayersAmongWhomToDistributeCards = nNumPlayers > 1 ? nNumPlayers : 2;
        var aDistributedCards = distribute(this.shuffledCards, nNumPlayersAmongWhomToDistributeCards);

        var i;
        for (i = 0; i < nNumPlayers; i++) {
            if (i < this.players.length) {
                this.players[i].setHand(aDistributedCards[i]);
            }
        }
    };

    var PLAY_STATE = {
        movingToTable: 0,
        checkingTable: 1
    };

    var nPlayState = PLAY_STATE.movingToTable;

    var preventZoom = function(e) {
        var t2 = e.timeStamp;
        var t1 = e.currentTarget.dataset.lastTouch || t2;
        var dt = t2 - t1;
        var fingers = e.touches.length;
        e.currentTarget.dataset.lastTouch = t2;

        if (!dt || dt > 500 || fingers > 1) return; // not double-tap

        e.preventDefault();
        e.target.click();
    }

    var playPressed = function (nNumPlayers) {
        doTurn.call(this, nNumPlayers);
    };

    var doTurn = function (nNumPlayers) {

        var i;
        switch (nPlayState) {
        case PLAY_STATE.movingToTable:

            if (this.isGameFinished(this.players[0].getHand(), this.players[1].getHand())) {
                return;
            }

            for (i = 0; i < nNumPlayers; i++) {
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
                for (i = 0; i < nNumPlayers; i++) {
                    if (i < this.players.length) {
                        this.players[i].clearTable();
                    }
                }
            } else if (this.players[0].getTableCard().value < this.players[1].getTableCard().value) {
                // player 1's card is higher than player 0's
                this.players[1].moveTableToHand();
                this.players[1].moveTableToHand(this.players[0].getTable());
                for (i = 0; i < nNumPlayers; i++) {
                    if (i < this.players.length) {
                        this.players[i].clearTable();
                    }
                }
            } else if (this.players[0].getTableCard().value === this.players[1].getTableCard().value) {
                // players' cards are the same
                // first checks if game is over (ie. in a 2-player game, if a player ran out of cards)
                if (this.isGameFinished(this.players[0].getHand(), this.players[1].getHand())) {
                    return;
                }
                // if game is not over, all players add a face-down card to the table
                for (i = 0; i < nNumPlayers; i++) {
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

        renderCards.call(this, this.players[0].getTable(), this.players[1].getTable());
    };

    function GameBox() {

        var MAX_NUMBER_OF_SLOTS = 3;

        var i,
            nPlayer;

        this.slotNumber;
        this.players = [];

        GameBox.prototype.makeView = function (nNumPlayers) {

            var oGameView = document.createElement('div');
            oGameView.setAttribute('class', 'game');
            oGameView.setAttribute('id', 'game');

            document.body.insertBefore(oGameView, null);

            var oPlayAreaView = document.createElement('div');
            oPlayAreaView.setAttribute('class', 'playArea');
            oPlayAreaView.setAttribute('id', 'playArea');

            oGameView.insertBefore(oPlayAreaView, null);

            var i, nPlayer,
                oPlayerView,
                oPlayerTableView,
                oPlayerHandView,
                oPlayerNameView;

            for (i = 0; i < this.players.length; i++) {
                nPlayer = i + 1;
                oPlayerView = document.createElement('div');
                oPlayerView.setAttribute('class', 'player');
                oPlayerView.setAttribute('id', 'player' + nPlayer);

                oPlayAreaView.insertBefore(oPlayerView, null);

                oPlayerTableView = document.createElement('div');
                oPlayerTableView.setAttribute('class', 'table');
                oPlayerTableView.setAttribute('id', 'table' + nPlayer);

                oPlayerView.insertBefore(oPlayerTableView, null);

                oPlayerHandView = document.createElement('div');
                oPlayerHandView.setAttribute('class', 'hand');
                oPlayerHandView.setAttribute('id', 'hand' + nPlayer);

                oPlayerView.insertBefore(oPlayerHandView, null);

                oPlayerNameView = document.createElement('input');
                oPlayerNameView.setAttribute('class', 'name');
                oPlayerNameView.setAttribute('id', 'name' + nPlayer);
                oPlayerNameView.setAttribute('ref-id', i);
                oPlayerNameView.value = this.players[i].getName();
                oPlayerNameView.onchange = function (oEvent) {
                    var nRefId, sValue = '';
                    if (oEvent && oEvent.target) {
                        nRefId = oEvent.target.getAttribute('ref-id');
                        sValue = oEvent.target.value;
                    }
                    this.players[nRefId].setName(sValue);
                }.bind(this);

                oPlayerView.insertBefore(oPlayerNameView, null);
            }

            renderCards.call(this);

            var oPlayBtn = document.createElement('button');
            var oContent = document.createTextNode('Play');
            oPlayBtn.setAttribute('class', 'button');
            oPlayBtn.setAttribute('id', 'play');
            oPlayBtn.appendChild(oContent);
            oPlayBtn.addEventListener('touchstart', preventZoom);
            oPlayBtn.onclick = playPressed.bind(this, nNumPlayers);
            document.body.insertBefore(oPlayBtn, null);

            var oShuffleBtn = document.createElement('button');
            oContent = document.createTextNode('Shuffle');
            oShuffleBtn.setAttribute('class', 'button');
            oShuffleBtn.setAttribute('id', 'shuffle');
            oShuffleBtn.appendChild(oContent);
            oShuffleBtn.onclick = function (oEvent) {
                var i, aDistributedCards;
                nPlayState = PLAY_STATE.movingToTable;
                this.result = '';
                this.renderResult();
                this.players[0].clearTable();
                this.players[1].clearTable();
                this.shuffledCards = shuffle.call(this, this.shuffledCards);
                aDistributedCards = distribute(this.shuffledCards, this.players.length);
                for (i = 0; i < this.players.length; i++) {
                    this.players[i].setHand(aDistributedCards[i]);
                }
                renderCards.call(this, [], []);
            }.bind(this);
            document.body.insertBefore(oShuffleBtn, null);

            var oResultView = document.createElement('div');
            oResultView.setAttribute('class', 'result');
            oResultView.setAttribute('id', 'result');

            document.body.insertBefore(oResultView, null);
        };

        GameBox.prototype.isGameFinished = function (aPlayer1Cards, aPlayer2Cards) {

            var i, nOtherPlayer;

            for (i = 0; i < this.players.length; i++) {
                if (this.players[i].hand.length === 0) {
                    if (i === 0) {
                        nOtherPlayer = 1;
                    } else if (i === 1) {
                        nOtherPlayer = 0;
                    }
                    this.result = this.players[nOtherPlayer].getName() + ' wins';
                    this.renderResult();
                    return true;
                }
            }
            return false;
        };

        GameBox.prototype.renderResult = function () {
            var oResultView = document.getElementById('result');

            var oContent = document.createTextNode(this.result);
            if (oResultView.firstChild) {
                oResultView.removeChild(oResultView.firstChild);
            }
            oResultView.appendChild(oContent);
        };

        GameBox.prototype.startGame = function (nNumPlayers) {

            var getRandomPlayerName = function (nPlayer) {

                var aPlayerNames = [ 'cat', 'dog', 'cow', 'pig', 'horse', 'skunk', 'ferret', 'duck' ];

                var aShuffledPlayerNames = shuffle(aPlayerNames);

                if (nPlayer >= 0 && nPlayer < aShuffledPlayerNames.length) {
                    return aShuffledPlayerNames[nPlayer];
                }

                return 'Player' + nPlayer;

            };

            var oDatabase = firebase.database();
            var oRefGameSlots = oDatabase.ref('game/slots');

            /*
             * checks remote database and stores players in a game slot
             */
            oRefGameSlots.once('value', function (snapshot) {

                // gets game slot object from remote database
                var oGameSlots = snapshot.val();

                if (!oGameSlots) {
                    oGameSlots = {
                        lastSlot: 0,
                        list: {}
                    };
                    oRefGameSlots.set(oGameSlots);
                }

                // gets list of game slots
                var aGameSlots = oGameSlots ? oGameSlots.list : null ;

                // gets index of last game slot
                var oGameLastSlot = oGameSlots.lastSlot || {
                    value: 0
                };

                var nInitialNumPlayers = 1;

                // finds the next available game slot, but starts over at 0
                // if the max number is reached
                this.slotNumber = oGameLastSlot ? oGameLastSlot.value : 0;

                // checks if this is player 1 - this can only be player 1 if
                // there are no players yet
                var bIsPlayer1SlotFull = false;
                var bIsPlayer2SlotFull = false;

                if (aGameSlots && aGameSlots.length > this.slotNumber && aGameSlots[this.slotNumber]) {
                    bIsPlayer1SlotFull = aGameSlots[this.slotNumber].player1 ? true : false;
                    bIsPlayer2SlotFull = aGameSlots[this.slotNumber].player2 ? true : false;
                }

                this.players.push(new Player());
                if (!bIsPlayer1SlotFull && !bIsPlayer2SlotFull) {

                    // makes player 1
                    this.players[0].setName(getRandomPlayerName(1));

                    // adds player 1 to game
                    initializeGameEvent.call(this, nInitialNumPlayers);

                    // waits for player 2
                    oRefGameSlots.child('list').child(this.slotNumber).set({
                        player1: this.players[0].getName(),
                        player2: null
                    });
                } else if (bIsPlayer1SlotFull && !bIsPlayer2SlotFull) {

                    // gets player 1
                    this.players[0].setName(aGameSlots[this.slotNumber].player1);

                    // makes player 2
                    this.players.push(new Player());
                    this.players[1].setName(getRandomPlayerName(2));

                    // adds player 1 and 2 to game
                    nInitialNumPlayers = 2;
                    initializeGameEvent.call(this, nInitialNumPlayers);

                    oRefGameSlots.child('list').child(this.slotNumber).set({
                        player1: this.players[0].getName(),
                        player2: this.players[1].getName()
                    });
                } else if (!bIsPlayer1SlotFull && bIsPlayer2SlotFull) {

                    // makes player 1
                    this.players[0].setName(getRandomPlayerName(1));

                    // gets player 2
                    this.players[1].setName(aGameSlots[this.slotNumber].player2);

                    // adds player 1 to game
                    initializeGameEvent.call(this, nInitialNumPlayers);

                    // adds player 1 and 2 to game
                    nInitialNumPlayers = 2;
                    initializeGameEvent.call(this, nInitialNumPlayers);

                    oRefGameSlots.child('list').child(this.slotNumber).set({
                        player1: this.players[0].getName(),
                        player2: this.players[1].getName()
                    });
                } else if (bIsPlayer1SlotFull && bIsPlayer2SlotFull) {
                    // increments game slotNumber
                    this.slotNumber = (this.slotNumber + 1) % MAX_NUMBER_OF_SLOTS;

                    // makes player 1
                    this.players[0].setName(getRandomPlayerName(1));

                    // adds player 1 to game
                    initializeGameEvent.call(this, nInitialNumPlayers);

                    // clears player 2 and waits for new player 2
                    oRefGameSlots.child('list').child(this.slotNumber).set({
                        player1: this.players[0].getName(),
                        player2: null
                    });
                }

                oRefGameSlots.child('lastSlot').set({
                    value: this.slotNumber
                });
                this.makeView(nNumPlayers);

            }.bind(this));

            this.hamsterSound = new Audio('../resources/hamster-wheel.wav');
            this.rabbitSound = new Audio('../resources/rabbit-crunch.wav');
            this.meowSound = new Audio('../resources/kitten-meow.wav');
            this.barkSound = new Audio('../resources/small-dog-bark.wav');
            this.tigerSound = new Audio('../resources/tiger-growl.wav');
            this.elephantSound = new Audio('../resources/elephant.wav');

        };
    }

    var oGameBox = new GameBox();
    var nNumPlayers = 2;
    oGameBox.startGame(nNumPlayers);
});
