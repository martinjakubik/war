/*global define */
define("Player", function () {
    'use strict';
    
    var Player = function () {
        
        this.name = '';
        this.hand = [];
        this.table = [];

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

    Player.prototype.getNumberCards = function () {
        return this.hand.length;
    };

    Player.prototype.putCardOnTable = function () {
        this.table.push(this.hand[0]);
        this.hand.splice(0, 1);
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
    
    Player.prototype.getTable = function () {
        return this.table;
    };
    
    return Player;
});