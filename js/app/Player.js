/*global define */
define('Player', ['Tools'], function (Tools) {
    'use strict';

    var Player = function (nPlayerNum, oRemoteReference, nCardWidth) {

        this.playerNum = nPlayerNum;
        this.remoteReference = oRemoteReference || null;
        this.cardWidth = nCardWidth;

        this.name = '';
        this.hand = [];
        this.table = [];

        this.canPlayAnotherCard = false;

        this.cardOnClick = null;
    };

    Player.prototype.getName = function () {
        return this.name;
    };

    Player.prototype.setName = function (sName) {
        this.name = sName;
    };

    Player.prototype.getCanPlayAnotherCard = function () {
        return this.canPlayAnotherCard;
    };

    Player.prototype.setCanPlayAnotherCard = function (bCanPlayAnotherCard) {
        this.canPlayAnotherCard = bCanPlayAnotherCard;
    };

    Player.prototype.getHand = function () {
        return this.hand;
    };

    Player.prototype.setHand = function (aCards) {
        this.hand = aCards;
    };

    Player.prototype.getTable = function () {
        return this.table;
    };

    Player.prototype.setTable = function (aCards) {
        this.table = aCards;
    };

    Player.prototype.getCardOnClick = function () {
        return this.cardOnClick;
    };

    Player.prototype.setCardOnClick = function (fnCardOnClick) {
        this.cardOnClick = fnCardOnClick;
    };

    Player.prototype.getNumberCards = function () {
        return this.hand.length;
    };

    Player.prototype.makePlayerView = function (oPlayAreaView, fnOnNameChanged) {

        var oPlayerView,
            oPlayerTableView,
            oPlayerHandView,
            oPlayerNameView;

        oPlayerView = document.createElement('div');
        oPlayerView.setAttribute('class', 'player');
        oPlayerView.setAttribute('id', 'player' + this.playerNum);

        oPlayAreaView.insertBefore(oPlayerView, null);

        oPlayerTableView = document.createElement('div');
        oPlayerTableView.setAttribute('class', 'table');
        oPlayerTableView.setAttribute('id', 'table' + this.playerNum);

        oPlayerView.insertBefore(oPlayerTableView, null);

        oPlayerHandView = document.createElement('div');
        oPlayerHandView.setAttribute('class', 'hand');
        oPlayerHandView.setAttribute('id', 'hand' + this.playerNum);

        oPlayerView.insertBefore(oPlayerHandView, null);

        oPlayerNameView = document.createElement('input');
        oPlayerNameView.setAttribute('class', 'name');
        oPlayerNameView.setAttribute('id', 'name' + this.playerNum);
        oPlayerNameView.setAttribute('ref-id', this.playerNum);
        oPlayerNameView.value = this.getName();
        oPlayerNameView.onchange = fnOnNameChanged;

        oPlayerView.insertBefore(oPlayerNameView, null);
    };

    /**
    * renders the cards in a player's table
    */
    Player.prototype.renderTable = function () {

        var i, oPlayerTableView = document.getElementById('table' + this.playerNum);
        var nWidth = window.innerWidth;
        var nTableWidth = this.table.length * this.cardWidth,
            fnOnTapUpdateGame = null;

        // clears view of all cards
        while (oPlayerTableView.firstChild) {
            oPlayerTableView.removeChild(oPlayerTableView.firstChild);
        }

        // counts how many cards to stack depending on how wide the screen is
        var nNumStackedCards = 0, bStackCard = false;
        while (nTableWidth >= 0.105 * nWidth) {
            nNumStackedCards++;
            nTableWidth = (this.table.length - nNumStackedCards) * this.cardWidth;
        }

        // redraws the whole table
        var bShowCardFace = false,
            bMoving = false;
        for (i = 0; i < this.table.length; i++) {
            bStackCard = (i < nNumStackedCards && i !== this.table.length - 1);
            bShowCardFace = i % 2 === 0;
            bMoving = i === (this.table.length - 1);
            fnOnTapUpdateGame = (i === (this.table.length - 1)) ? this.getCardOnClick() : null;
            this.addCardToView(oPlayerTableView, this.table[i], 0, true, bStackCard, bShowCardFace, bMoving, fnOnTapUpdateGame);
        }
    };

    /**
     * renders the cards in a player's hand
     */
    Player.prototype.renderHand = function () {

        var i, oPlayAreaView = document.getElementById('playArea'),
            oPlayerHandView = document.getElementById('hand' + this.playerNum),
            bStackCard = null,
            bShowCardFace = false,
            bMoving = false,
            fnOnTapUpdateGame = null;

        var fnOnPlayerNameChanged = function (oEvent) {
            var nRefId, sValue = '';
            if (oEvent && oEvent.target) {
                nRefId = oEvent.target.getAttribute('ref-id');
                sValue = oEvent.target.value;
            }
            this.players[nRefId].setName(sValue);
        }.bind(this);

        if (!oPlayerHandView) {
            this.makePlayerView(oPlayAreaView, fnOnPlayerNameChanged);
            oPlayerHandView = document.getElementById('hand' + this.playerNum);
        }

        // clears view of all cards
        while (oPlayerHandView.firstChild) {
            oPlayerHandView.removeChild(oPlayerHandView.firstChild);
        }

        // redraws the whole hand
        for (i = 0; i < this.hand.length; i++) {
            fnOnTapUpdateGame = (i === 0) ? this.getCardOnClick() : null;
            this.addCardToView(oPlayerHandView, this.hand[i], i, (i === this.hand.length - 1), bStackCard, bShowCardFace, bMoving, fnOnTapUpdateGame);
        }
    };

    /**
    * adds the given card to the given view
    */
    Player.prototype.addCardToView = function (oView, oCard, nCardPosition, bLastCard, bStackCard, bShowCardFace, bMoving, fnOnTapUpdateGame) {

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
            oCardView.addEventListener('animationend', this.finishedMovingToTableListener, false);
        }

        var fnOnTap;
        if (fnOnTapUpdateGame) {

            fnOnTap = function() {
                if (this.getCanPlayAnotherCard() === true) {
                    this.putCardOnTable.call(this);
                }
                fnOnTapUpdateGame.call();
            }.bind(this);

            // makes the card react to a tap
            oCardView.onclick = fnOnTap;

        } else {
            delete oCardView.onclick;
        }

        // sets the card's id as suit+value
        oCardView.setAttribute('id', 'card' + oCard.value + '-' + oCard.suit);

        var oCardFaceView = document.createElement('div');
        oCardFaceView.setAttribute('class', 'content');

        oCardView.insertBefore(oCardFaceView, null);

        oView.insertBefore(oCardView, null);
    };

    Player.prototype.finishedMovingToTableListener = function (oEvent) {

        switch (oEvent.type) {
          case 'animationend':
              var oElement = oEvent.target;

              // removes moving to table flag
              Tools.removeClass(oElement, 'movingToTable');
              break;
          default:

        }
    };

    Player.prototype.putCardOnTable = function () {

        this.table.push(this.hand[0]);
        this.hand.splice(0, 1);

        this.renderHand();
        this.renderTable();

        this.updateRemoteReference();
    };

    Player.prototype.moveTableToHand = function (aTable) {

        // copies the given table to this player's hand
        if (aTable && aTable.length > 0) {
            Array.prototype.push.apply(this.hand, aTable);

            // clears the given table
            aTable.splice(0);
        } else {
            // if no given table, copies this player's table to this player's
            // hand
            Array.prototype.push.apply(this.hand, this.table);

            // clears this player's table
            this.clearTable();
        }

        // updates the remote reference for this player
        // TODO: optimize performance here; if we have two or more players, all
        // of whose cards are "won" by the present player, then we will update
        // the remote reference every time we call this method; instead, we
        // should only call update once: for example, make moveTableToHand a
        // promise, and only when all promises complete call
        // updateRemoteReference
        this.updateRemoteReference();
    };

    Player.prototype.clearTable = function () {
        this.table.splice(0);
    };

    Player.prototype.getTableCard = function () {

        if (this.table.length > 0) {
            return this.table[this.table.length - 1];
        }
        return null;
    };

    Player.prototype.updateRemoteReference = function () {

        this.remoteReference.set({
            name: this.getName(),
            hand: this.getHand(),
            table: this.getTable()
        });
    };

    /**
    *
    */
    Player.prototype.addOnTapToTopCardInHand = function () {
        this.setCanPlayAnotherCard(true);
    };

    /**
    *
    */
    Player.prototype.removeOnTapFromTopCardInHand = function () {
    };

    /**
    *
    */
    Player.prototype.addOnTapToTopCardOnTable = function () {
    };

    /**
     *
     */
    Player.prototype.removeOnTapFromTopCardOnTable = function () {
    };

    return Player;
});
