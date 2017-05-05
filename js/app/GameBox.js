/*global require */
/*global Audio: false */
require(['Player', 'GamePlay'], function (Player, GamePlay) {

    'use strict';

    // TODO: move to tools
    var addClass = function (oView, sClass) {
        var sClasses = oView.getAttribute('class');

        if (sClasses.indexOf(sClass) < 0) {
            oView.setAttribute('class', oView.getAttribute('class', + ' ' + sClass));
        }
    };

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

    var GameBox = function () {

        var MAX_NUMBER_OF_SLOTS = 3;
        var CARD_WIDTH = 68;

        var i,
            nPlayer;

        this.slotNumber;
        this.players = [];
        this.maxNumberOfSlots = MAX_NUMBER_OF_SLOTS;
        this.cardWidth = CARD_WIDTH;

    };

    GameBox.prototype.renderResult = function (sResult) {
        var oResultView = document.getElementById('result');

        var oContent = document.createTextNode(sResult ? sResult : '');
        if (oResultView.firstChild) {
            oResultView.removeChild(oResultView.firstChild);
        }
        oResultView.appendChild(oContent);
    };

    GameBox.prototype.makeCards = function (aCardValues) {
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

    var nNumPlayers = 2;

    var oGameBox = new GameBox();

    var aBatawafCardValues = [
      6, 3, 5, 5, 1, 6,
      4, 2, 4, 3, 1, 3,
      5, 6, 2, 4, 6, 3,
      4, 4, 6, 1, 2, 1,
      4, 5, 1, 3, 5, 2,
      6, 1, 2, 2, 3, 5
    ];
    var aCards = oGameBox.makeCards(aBatawafCardValues);

    var aPlayerNames = [ 'cat', 'dog', 'cow', 'pig', 'horse', 'skunk', 'ferret', 'duck', 'jackal' ];

    var oGamePlay = new GamePlay(
        nNumPlayers,
        aCards,
        aPlayerNames,
        oGameBox.maxNumberOfSlots,
        oGameBox.cardWidth,
        {
            renderResult: oGameBox.renderResult,
            preventZoom: preventZoom
        }
    );
    oGamePlay.start();

});
