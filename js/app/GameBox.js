/*global require */
/*global Audio: false */
require(['Player'], function (Player) {
    'use strict';
    
    var nCardWidth = 68;
    var nNumPlayers = 2;

    var addCardToView = function (oView, oCard, nCardPosition, bLastCard, bStackCard) {

        var oCardView = document.createElement('div');
        if (bStackCard) {
            oCardView.setAttribute('class', 'card' + ' manyCards');
        } else if (nCardPosition < 1 || bLastCard) {
            oCardView.setAttribute('class', 'card');
        } else {
            oCardView.setAttribute('class', 'card' + ' manyCards');
        }
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
        
        var nNumStackedCards = 0, bStackCard = false;
        while (nTableWidth >= 0.15 * nWidth) {
            nNumStackedCards++;
            nTableWidth = (aPlayerTable.length - nNumStackedCards) * nCardWidth;
        }

        // redraws the whole table
        for (i = 0; i < aPlayerTable.length; i++) {
            bStackCard = (i < nNumStackedCards && i !== aPlayerTable.length - 1);
            addCardToView(oPlayerTableView, aPlayerTable[i], 0, true, bStackCard);
        }

    };

    var renderPlayerHand = function (nPlayer, aPlayerCards) {

        var i,
            oPlayerHandView = document.getElementById('hand' + nPlayer);

        // clears view of all cards
        while (oPlayerHandView.firstChild) {
            oPlayerHandView.removeChild(oPlayerHandView.firstChild);
        }

        // redraws the whole hand
        for (i = 0; i < aPlayerCards.length; i++) {
            addCardToView(oPlayerHandView, aPlayerCards[i], i, (i === aPlayerCards.length - 1));
        }
    };

    var putCardOnTable = function (aPlayerTable, aPlayerCards) {
        aPlayerTable.push(aPlayerCards[0]);
        aPlayerCards.splice(0, 1);
    };

    var clearTable = function (aPlayerTable) {
        aPlayerTable.splice(0);
    };

    var getTableCard = function (aPlayerTable) {
        return aPlayerTable[aPlayerTable.length - 1];
    };

    var makeCards = function (aCardValues) {
        var aSuitLetters = ['a', 'b', 'c', 'd', 'e', 'f'];
        var i, nSuit, aCards = [], mHighestSuitsFoundForValue = {};
        
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
        
        return aCards;
    };

    var shuffle = function (aCards) {
        var i, n, aShuffledCards = [];

        while (aCards.length > 0) {
            n = Math.floor(Math.random() * aCards.length);
            aShuffledCards.push(aCards.splice(n, 1)[0]);
        }

        return aShuffledCards;
    };

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
        renderPlayerTable(1, this.players[0].getTable());
        renderPlayerTable(2, this.players[1].getTable());
        for (i = 0; i < nNumPlayers; i++) {
            if (i < this.players.length) {
                renderPlayerHand(i + 1, this.players[i].getHand());
            }
        }
    };

    function GameBox() {
        
        var i, nPlayer;

        this.players = [];
        
        for (i = 0; i < nNumPlayers; i++) {
            this.players.push(new Player());

            nPlayer = i + 1;
            this.players[i].setName('Player ' + nPlayer);
        }

        GameBox.prototype.makeView = function () {

            var PLAY_STATE = {
                movingToTable: 0,
                checkingTable: 1
            };

            var nPlayState = PLAY_STATE.movingToTable;

            var doTurn = function () {

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

                    if (this.players[0].getTableCard().value > this.players[1].getTableCard().value) {
                        this.players[0].moveTableToHand();
                        this.players[0].moveTableToHand(this.players[1].getTable());
                        for (i = 0; i < nNumPlayers; i++) {
                            if (i < this.players.length) {
                                this.players[i].clearTable();
                            }
                        }
                    } else if (this.players[0].getTableCard().value < this.players[1].getTableCard().value) {
                        this.players[1].moveTableToHand();
                        this.players[1].moveTableToHand(this.players[0].getTable());
                        for (i = 0; i < nNumPlayers; i++) {
                            if (i < this.players.length) {
                                this.players[i].clearTable();
                            }
                        }
                    } else if (this.players[0].getTableCard().value === this.players[1].getTableCard().value) {
                        if (this.isGameFinished(this.players[0].getHand(), this.players[1].getHand())) {
                            return;
                        }
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

            for (i = 0; i < nNumPlayers; i++) {
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
            oPlayBtn.onclick = doTurn.bind(this);
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
                aDistributedCards = distribute(this.shuffledCards, nNumPlayers);
                for (i = 0; i < nNumPlayers; i++) {
                    if (i < this.players.length) {
                        this.players[i].setHand(aDistributedCards[i]);
                    }
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

        GameBox.prototype.startGame = function () {
            this.hamsterSound = new Audio('../resources/hamster-wheel.wav');
            this.rabbitSound = new Audio('../resources/rabbit-crunch.wav');
            this.meowSound = new Audio('../resources/kitten-meow.wav');
            this.barkSound = new Audio('../resources/small-dog-bark.wav');
            this.tigerSound = new Audio('../resources/tiger-growl.wav');
            this.elephantSound = new Audio('../resources/elephant.wav');

            var aBatawafCardValues = [6, 3, 5, 5, 1, 6, 4, 2, 4, 3, 1, 3, 5, 6, 2, 4, 6, 3, 4, 4, 6, 1, 2, 1, 4,  5, 1, 3, 5, 2, 6, 1, 2, 2, 3, 5];
            
            this.cards = makeCards(aBatawafCardValues);

            this.shuffledCards = this.cards;
            var aDistributedCards = distribute(this.shuffledCards, nNumPlayers);

            var i;
            for (i = 0; i < nNumPlayers; i++) {
                if (i < this.players.length) {
                    this.players[i].setHand(aDistributedCards[i]);
                }
            }

            this.result = '';

            this.makeView();
        };
    }
    
    var oGameBox = new GameBox();
    oGameBox.startGame();
});