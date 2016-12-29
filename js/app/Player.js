/*global define */
define('Player', function () {
    'use strict';

    var Player = function (oRemoteReference) {

        this.remoteReference = oRemoteReference || null;

        this.name = '';
        this.hand = [];
        this.table = [];

    };

    Player.prototype.makePlayerView = function (nPlayerIndex, oPlayAreaView, fnOnNameChanged) {
        var nPlayer,
            oPlayerView,
            oPlayerTableView,
            oPlayerHandView,
            oPlayerNameView;

        nPlayer = nPlayerIndex + 1;
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
        oPlayerNameView.setAttribute('ref-id', nPlayerIndex);
        oPlayerNameView.value = this.getName();
        oPlayerNameView.onchange = fnOnNameChanged;

        oPlayerView.insertBefore(oPlayerNameView, null);
    };

    Player.prototype.getName = function () {
        return this.name;
    };

    Player.prototype.setName = function (sName) {
        this.name = sName;
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

    Player.prototype.getNumberCards = function () {
        return this.hand.length;
    };

    Player.prototype.putCardOnTable = function () {
        this.table.push(this.hand[0]);
        this.hand.splice(0, 1);

        var oDatabase = firebase.database();
        var oRefGameSlots = oDatabase.ref('game/slots');

        this.remoteReference.set({
            name: this.getName(),
            hand: this.getHand(),
            table: this.getTable()
        });
    };

    Player.prototype.moveTableToHand = function (aTable) {
        if (aTable && aTable.length > 0) {
            Array.prototype.push.apply(this.hand, aTable);
        } else {
            Array.prototype.push.apply(this.hand, this.table);
        }
    };

    Player.prototype.clearTable = function () {
        this.table.splice(0);
    };

    Player.prototype.getTableCard = function () {
        return this.table[this.table.length - 1];
    };

    return Player;
});
