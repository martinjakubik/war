/*global requirejs */
/*global define */
/*global console */
/*global Audio: false */
define(['Player'], function (Player) {
    'use strict';

    var addCardToView = function (oView, oCard, nCardPosition, bLastCard) {

        var oCardView = document.createElement('div');
        if (nCardPosition < 3 || bLastCard) {
            oCardView.setAttribute('class', 'card');
        } else {
            oCardView.setAttribute('class', 'card' + ' manyCards');
        }
        oCardView.setAttribute('id', 'card' + oCard.value + '-' + oCard.suit);

        var oCardFaceView = document.createElement('div');
        oCardFaceView.setAttribute('class', 'content');

        var oCardFaceText;
        if (oCard.suit !== 0 && !(oCard.suit === 1 && oCard.value >= 1 && oCard.value <= 3)) {
            oCardFaceText = document.createTextNode(oCard.value);
        } else {
            oCardFaceText = document.createTextNode('');
        }
        oCardFaceView.appendChild(oCardFaceText);

        oCardView.insertBefore(oCardFaceView, null);

        oView.insertBefore(oCardView, null);
    };

    var renderPlayerTable = function (nPlayer, aPlayerTable) {

        var i, oPlayerTableView = document.getElementById('table' + nPlayer);

        // clears view of all cards
        while (oPlayerTableView.firstChild) {
            oPlayerTableView.removeChild(oPlayerTableView.firstChild);
        }

        // redraws the whole hand
        for (i = 0; i < aPlayerTable.length; i++) {
            addCardToView(oPlayerTableView, aPlayerTable[i], 0);
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
        var i, nSuit, aCards = [], mHighestSuitsFoundForValue = {};
        
        for (i = 0; i < aCardValues.length; i++) {
            nSuit = -1;
            if (!mHighestSuitsFoundForValue[aCardValues[i]] && mHighestSuitsFoundForValue[aCardValues[i]] !== 0) {
                mHighestSuitsFoundForValue[aCardValues[i]] = nSuit;
            }
            mHighestSuitsFoundForValue[aCardValues[i]]++;

            aCards.push({
                value: aCardValues[i],
                suit: mHighestSuitsFoundForValue[aCardValues[i]]
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

    var distribute = function (aCards) {

        var oGameView = document.getElementById('game');

        var i, oCard;
        var aPlayer1Cards = [],
            aPlayer2Cards = [];

        var aDistributedCards = [];

        for (i = 0; i < aCards.length; i++) {
            oCard = aCards[i];

            if (i % 2 === 0) {
                aPlayer1Cards.push(oCard);
            } else {
                aPlayer2Cards.push(oCard);
            }
        }

        aDistributedCards[0] = aPlayer1Cards;
        aDistributedCards[1] = aPlayer2Cards;

        return aDistributedCards;
    };

    var renderCards = function () {
        renderPlayerTable(1, this.table[0]);
        renderPlayerTable(2, this.table[1]);
        renderPlayerHand(1, this.distributedCards[0]);
        renderPlayerHand(2, this.distributedCards[1]);
    };

    function GameBox() {

        GameBox.prototype.makeView = function () {

            var PLAY_STATE = {
                movingToTable: 0,
                checkingTable: 1
            };

            var nPlayState = PLAY_STATE.movingToTable;

            var doTurn = function () {

                switch (nPlayState) {
                case PLAY_STATE.movingToTable:

                    if (this.isGameFinished(this.distributedCards[0], this.distributedCards[1])) {
                        return;
                    }

                    putCardOnTable(this.table[0], this.distributedCards[0]);
                    putCardOnTable(this.table[1], this.distributedCards[1]);

                    if (getTableCard(this.table[0]).value === getTableCard(this.table[1]).value) {
                        this.barkSound.play();
                    }

                    nPlayState = PLAY_STATE.checkingTable;

                    break;

                case PLAY_STATE.checkingTable:

                    if (getTableCard(this.table[0]).value > getTableCard(this.table[1]).value) {
                        Array.prototype.push.apply(this.distributedCards[0], this.table[0]);
                        Array.prototype.push.apply(this.distributedCards[0], this.table[1]);
                        clearTable(this.table[0]);
                        clearTable(this.table[1]);
                    } else if (getTableCard(this.table[0]).value < getTableCard(this.table[1]).value) {
                        Array.prototype.push.apply(this.distributedCards[1], this.table[0]);
                        Array.prototype.push.apply(this.distributedCards[1], this.table[1]);
                        clearTable(this.table[0]);
                        clearTable(this.table[1]);
                    } else if (getTableCard(this.table[0]).value === getTableCard(this.table[1]).value) {
                        if (this.isGameFinished(this.distributedCards[0], this.distributedCards[1])) {
                            return;
                        }
                        putCardOnTable(this.table[0], this.distributedCards[0]);
                        putCardOnTable(this.table[1], this.distributedCards[1]);
                    }
                        
                    this.isGameFinished(this.distributedCards[0], this.distributedCards[1]);
                    nPlayState = PLAY_STATE.movingToTable;

                    break;
                default:
                    break;
                }

                renderCards.call(this, this.table[0], this.table[1]);
            };

            var oGameView = document.createElement('div');
            oGameView.setAttribute('class', 'game');
            oGameView.setAttribute('id', 'game');

            document.body.insertBefore(oGameView, null);

            var oPlayAreaView = document.createElement('div');
            oPlayAreaView.setAttribute('class', 'playArea');
            oPlayAreaView.setAttribute('id', 'playArea');

            oGameView.insertBefore(oPlayAreaView, null);

            var oPlayer1View = document.createElement('div');
            oPlayer1View.setAttribute('class', 'player');
            oPlayer1View.setAttribute('id', 'player1');

            oPlayAreaView.insertBefore(oPlayer1View, null);

            var oPlayer2View = document.createElement('div');
            oPlayer2View.setAttribute('class', 'player');
            oPlayer2View.setAttribute('id', 'player2');

            oPlayAreaView.insertBefore(oPlayer2View, null);

            var oPlayer1TableView = document.createElement('div');
            oPlayer1TableView.setAttribute('class', 'table');
            oPlayer1TableView.setAttribute('id', 'table1');

            oPlayer1View.insertBefore(oPlayer1TableView, null);

            var oPlayer2TableView = document.createElement('div');
            oPlayer2TableView.setAttribute('class', 'table');
            oPlayer2TableView.setAttribute('id', 'table2');

            oPlayer2View.insertBefore(oPlayer2TableView, null);

            var oPlayer1HandView = document.createElement('div');
            oPlayer1HandView.setAttribute('class', 'hand');
            oPlayer1HandView.setAttribute('id', 'hand1');

            oPlayer1View.insertBefore(oPlayer1HandView, null);

            var oPlayer2HandView = document.createElement('div');
            oPlayer2HandView.setAttribute('class', 'hand');
            oPlayer2HandView.setAttribute('id', 'hand2');

            oPlayer2View.insertBefore(oPlayer2HandView, null);

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
            oShuffleBtn.onclick = function () {
                nPlayState = PLAY_STATE.movingToTable;
                this.result = '';
                this.renderResult();
                clearTable(this.table[0]);
                clearTable(this.table[1]);
                this.shuffledCards = shuffle.call(this, this.shuffledCards);
                this.distributedCards = distribute(this.shuffledCards);
                renderCards.call(this, [], []);
            }.bind(this);
            document.body.insertBefore(oShuffleBtn, null);

            var oResultView = document.createElement('div');
            oResultView.setAttribute('class', 'result');
            oResultView.setAttribute('id', 'result');

            document.body.insertBefore(oResultView, null);
        };

        GameBox.prototype.isGameFinished = function (aPlayer1Cards, aPlayer2Cards) {
            if (aPlayer1Cards.length === 0) {
                this.result = 'player 2 wins';
                this.renderResult();
                return true;
            } else if (aPlayer2Cards.length === 0) {
                this.result = 'player 1 wins';
                this.renderResult();
                return true;
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
            this.barkSound = new Audio('../resources/small-dog-bark.wav');

            var aBatawafCardValues = [6, 3, 5, 5, 1, 6, 4, 2, 4, 3, 1, 3, 5, 6, 2, 4, 6, 3, 4, 4, 6, 1, 2, 1, 4,  5, 1, 3, 5, 2, 6, 1, 2, 2, 3, 5];
            
            this.cards = makeCards(aBatawafCardValues);

            this.shuffledCards = this.cards;
            this.distributedCards = distribute(this.shuffledCards);
            this.table = [
                [], []
            ];

            this.result = '';

            this.makeView();
        };
    }
    
    var oGameBox = new GameBox();
    oGameBox.startGame();
});