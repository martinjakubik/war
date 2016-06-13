define ("Player", function () {
    
    var Player = function () {

        this.hand = [];
        this.table = [];

    };

    Player.prototype.getNumberCards = function () {
        return this.hand.length;
    };

    Player.prototype.putCardOnTable = function () {
        this.table.push(aPlayerCards[0]);
        this.cards.splice(0, 1);            
    };

    Player.prototype.clearTable = function () {
        this.table.splice(0);  
    };

    Player.prototype.getTableCard = function () {
        return this.table[this.table.length - 1];
    };
    
    return Player;
});