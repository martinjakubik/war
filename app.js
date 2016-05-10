(function () {

    var setup = function () {
        document.open();
    };

    var close = function () {
        document.close();
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

        var oPlayerHandView = document.getElementById('hand' + nPlayer);

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
            console.log('player 2 wins');
            return true;
        } else if (aPlayer2Cards.length === 0) {
            console.log('player 1 wins');
            return true;
        }
        return false;
    };

    var makeView = function (aPlayer1Cards, aPlayer2Cards) {

        var nPlayState = 0;
        var aPlayer1Table = [];
        var aPlayer2Table = [];

        var PLAY_STATE = {
            movingToTable: 0,
            checkingTable: 1
        }

        var doTurn = function (aPlayer1Cards, aPlayer2Cards) {

            switch (nPlayState) {
                case PLAY_STATE.movingToTable:

                    if (isGameFinished(aPlayer1Cards, aPlayer2Cards)) {
                        return;
                    }

                    putCardOnTable(aPlayer1Table, aPlayer1Cards);
                    putCardOnTable(aPlayer2Table, aPlayer2Cards);

                    nPlayState = PLAY_STATE.checkingTable;

                    break;

                case PLAY_STATE.checkingTable:

                    if (getTableCard(aPlayer1Table) > getTableCard(aPlayer2Table)) {
                        Array.prototype.push.apply(aPlayer1Cards, aPlayer1Table);
                        Array.prototype.push.apply(aPlayer1Cards, aPlayer2Table);
                        clearTable(aPlayer1Table);
                        clearTable(aPlayer2Table);
                    } else if (getTableCard(aPlayer1Table) < getTableCard(aPlayer2Table)) {
                        Array.prototype.push.apply(aPlayer2Cards, aPlayer1Table);
                        Array.prototype.push.apply(aPlayer2Cards, aPlayer2Table);
                        clearTable(aPlayer1Table);
                        clearTable(aPlayer2Table);
                    } else if (getTableCard(aPlayer1Table) === getTableCard(aPlayer2Table)) {
                        putCardOnTable(aPlayer1Table, aPlayer1Cards);
                        putCardOnTable(aPlayer2Table, aPlayer2Cards);
                    }

                    isGameFinished(aPlayer1Cards, aPlayer2Cards);
                    nPlayState = PLAY_STATE.movingToTable;

                    break;
                default:
                    break;
            }

            renderPlayerTable(1, aPlayer1Table);
            renderPlayerTable(2, aPlayer2Table);
            renderPlayerHand(1, aPlayer1Cards);
            renderPlayerHand(2, aPlayer2Cards);
        };

        var oPlayBtn = document.createElement('button');
        var oContent = document.createTextNode('Play');
        oPlayBtn.appendChild(oContent);
        oPlayBtn.onclick = doTurn.bind(this, aPlayer1Cards, aPlayer2Cards);
        document.body.insertBefore(oPlayBtn, null);

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

        renderPlayerTable(1, aPlayer1Table);
        renderPlayerTable(2, aPlayer2Table);
        renderPlayerHand(1, aPlayer1Cards);
        renderPlayerHand(2, aPlayer2Cards);
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

    setup();

    aCards = [1, 4, 6, 5, 3, 1, 2, 6, 6, 1, 4];

    aDistributedCards = distribute(aCards);
    makeView(aCards, aDistributedCards[0], aDistributedCards[1]);

    close();
} ());