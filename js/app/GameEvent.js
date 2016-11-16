/*global define */
define("GameEvent", function () {
    'use strict';

    var GameEvent = function () {

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

    return GameEvent;
});
