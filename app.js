/*global requirejs */
/*global console */
/*global Audio: false */
requirejs(['Player'], function (Player) {

    var setup = function () {
        document.open();
    };

    var close = function () {
        document.close();
    };
    
    var addCardToView = function (oView, nCard) {

        var oCardView = document.createElement('div');
        oCardView.setAttribute('class', 'card');
        oCardView.setAttribute('id', 'card' + nCard);

        var oCardFaceView = document.createElement('div');
        oCardFaceView.setAttribute('class', 'content');

        var oCardFaceText = document.createTextNode(nCard);
        oCardFaceView.appendChild(oCardFaceText);

        oCardView.insertBefore(oCardFaceView, null);

        oView.insertBefore(oCardView, null);
    };

    var renderResult = function () {
        var oResultView = document.getElementById('result');

        var oContent = document.createTextNode(this.result);
        if (oResultView.firstChild) {
            oResultView.removeChild(oResultView.firstChild);
        }
        oResultView.appendChild(oContent);
    };

    var renderPlayerTable = function (nPlayer, aPlayerTable) {

        var i, oPlayerTableView = document.getElementById('table' + nPlayer);

        while (oPlayerTableView.firstChild) {
            oPlayerTableView.removeChild(oPlayerTableView.firstChild);
        }

        for (i = 0; i < aPlayerTable.length; i++) {
            addCardToView(oPlayerTableView, aPlayerTable[i]);
        }

    };

    var renderPlayerHand = function (nPlayer, aPlayerCards) {

        var i,
            oPlayerHandView = document.getElementById('hand' + nPlayer);

        while (oPlayerHandView.firstChild) {
            oPlayerHandView.removeChild(oPlayerHandView.firstChild);
        }

        for (i = 0; i < aPlayerCards.length; i++) {
            addCardToView(oPlayerHandView, aPlayerCards[i]);
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

    var isGameFinished = function (aPlayer1Cards, aPlayer2Cards) {
        if (aPlayer1Cards.length === 0) {
            this.result = 'player 2 wins';
            renderResult();
            return true;
        } else if (aPlayer2Cards.length === 0) {
            this.result = 'player 1 wins';
            renderResult();
            return true;
        }
        return false;
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
    
    var makeView = function () {

        var nPlayState = 0;

        var PLAY_STATE = {
            movingToTable: 0,
            checkingTable: 1
        };

        var doTurn = function () {

            switch (nPlayState) {
            case PLAY_STATE.movingToTable:

                if (isGameFinished(this.distributedCards[0], this.distributedCards[1])) {
                    return;
                }

                putCardOnTable(this.table[0], this.distributedCards[0]);
                putCardOnTable(this.table[1], this.distributedCards[1]);

                if (getTableCard(this.table[0]) === getTableCard(this.table[1])) {
                    this.barkSound.play();
                }

                nPlayState = PLAY_STATE.checkingTable;

                break;

            case PLAY_STATE.checkingTable:

                if (getTableCard(this.table[0]) > getTableCard(this.table[1])) {
                    Array.prototype.push.apply(this.distributedCards[0], this.table[0]);
                    Array.prototype.push.apply(this.distributedCards[0], this.table[1]);
                    clearTable(this.table[0]);
                    clearTable(this.table[1]);
                } else if (getTableCard(this.table[0]) < getTableCard(this.table[1])) {
                    Array.prototype.push.apply(this.distributedCards[1], this.table[0]);
                    Array.prototype.push.apply(this.distributedCards[1], this.table[1]);
                    clearTable(this.table[0]);
                    clearTable(this.table[1]);
                } else if (getTableCard(this.table[0]) === getTableCard(this.table[1])) {
                    putCardOnTable(this.table[0], this.distributedCards[0]);
                    putCardOnTable(this.table[1], this.distributedCards[1]);
                }

                isGameFinished(this.distributedCards[0], this.distributedCards[1]);
                nPlayState = PLAY_STATE.movingToTable;

                break;
            default:
                break;
            }

            renderCards.call(this, this.table[0], this.table[1]);
        };

        var oPlayBtn = document.createElement('button');
        var oContent = document.createTextNode('Play');
        oPlayBtn.appendChild(oContent);
        oPlayBtn.onclick = doTurn.bind(this);
        document.body.insertBefore(oPlayBtn, null);

        var oShuffleBtn = document.createElement('button');
        oContent = document.createTextNode('Shuffle');
        oShuffleBtn.appendChild(oContent);
        oShuffleBtn.onclick = function () {
            this.result = '';
            renderResult();
            clearTable(this.table[0]);
            clearTable(this.table[1]);            
            this.shuffledCards = shuffle.call(this, this.shuffledCards);
            this.distributedCards = distribute(this.shuffledCards);
            renderCards.call(this, [], []);
        }.bind(this);
        document.body.insertBefore(oShuffleBtn, null);

        var oPlayer1View = document.createElement('div');
        oPlayer1View.setAttribute('class', 'player');
        oPlayer1View.setAttribute('id', 'player1');

        document.body.insertBefore(oPlayer1View, null);

        var oPlayer2View = document.createElement('div');
        oPlayer2View.setAttribute('class', 'player');
        oPlayer2View.setAttribute('id', 'player2');

        document.body.insertBefore(oPlayer2View, null);

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
        
        renderCards.call(this, this.table[0], this.table[1]);

        var oResultView = document.createElement('div');
        oResultView.setAttribute('class', 'result');
        oResultView.setAttribute('id', 'result');

        document.body.insertBefore(oResultView, null);
    };

    var startGame = function () {
        this.barkSound = new Audio('resources/small-dog-bark.wav');

        var aCards = [1, 4, 6, 5, 3, 1, 2, 6, 6, 1, 4];

        this.shuffledCards = aCards;
        this.distributedCards = distribute(this.shuffledCards);
        this.table = [
            [], []
        ];
        
        this.result = '';

        makeView();
    };
    
    startGame();
});