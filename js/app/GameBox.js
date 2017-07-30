/*global require */
/*global Audio: false */
requirejs(['GamePlay', 'Tools'], function (GamePlay, Tools) {

    'use strict';

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

    /**
     * makes the initial view
     */
    GameBox.makeView = function () {

        var oGameView = document.createElement('div');
        Tools.setClass(oGameView, 'game');
        oGameView.setAttribute('id', 'game');

        document.body.insertBefore(oGameView, null);

        var oPlayAreaView = document.createElement('div');
        Tools.setClass(oPlayAreaView, 'playArea');
        oPlayAreaView.setAttribute('id', 'playArea');

        oGameView.insertBefore(oPlayAreaView, null);

        var oResultView = document.createElement('div');
        Tools.setClass(oResultView, 'result');
        oResultView.setAttribute('id', 'result');

        document.body.insertBefore(oResultView, null);
    };

    GameBox.getRandomPlayerName = function (nPlayer, aPlayerNames, sNotThisName) {

        var i, aCopyOfPlayerNames = [];
        for (i = 0; i < aPlayerNames.length; i++) {
            if (aPlayerNames[i] !== sNotThisName) {
                aCopyOfPlayerNames.push(aPlayerNames[i]);
            }
        }

        var aShuffledPlayerNames = Tools.shuffle(aCopyOfPlayerNames);

        if (aShuffledPlayerNames.length > 0) {
            return aShuffledPlayerNames[0];
        }

        return 'Player' + nPlayer;
    };

    GameBox.renderResult = function (sResult) {
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

    var aBatanimalCardValues = [
      6, 3, 5, 5, 1, 6,
      4, 2, 4, 3, 1, 3,
      5, 6, 2, 4, 6, 3,
      4, 4, 6, 1, 2, 1,
      4, 5, 1, 3, 5, 2,
      6, 1, 2, 2, 3, 5
    ];

    var aCards = oGameBox.makeCards(aBatanimalCardValues);

    var aSounds = {
         hamsterSound: new Audio('../resources/hamster-wheel.wav'),
          rabbitSound: new Audio('../resources/rabbit-crunch.wav'),
            meowSound: new Audio('../resources/kitten-meow.wav'),
            barkSound: new Audio('../resources/small-dog-bark.wav'),
           tigerSound: new Audio('../resources/tiger-growl.wav'),
        elephantSound: new Audio('../resources/elephant.wav')
    }

    GameBox.makeView();

    var aPlayerNames = [ 'cat', 'dog', 'cow', 'pig', 'horse', 'skunk', 'ferret', 'duck', 'jackal' ];

    var oGamePlay = new GamePlay(
        nNumPlayers,
        aCards,
        aSounds,
        aPlayerNames,
        oGameBox.maxNumberOfSlots,
        oGameBox.cardWidth,
        {
            renderResult: GameBox.renderResult,
            getRandomPlayerName: GameBox.getRandomPlayerName
        }
    );
    oGamePlay.start();

});
