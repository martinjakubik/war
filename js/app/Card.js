/*global define */
define('Card', ['Tools'], function (Tools) {
    'use strict';

    var Card = function (oFaceView, oRearView) {

        this.faceView = oFaceView;
        this.rearView = oRearView;

    };

    Card.prototype.getFaceView = function () {
        return this.faceView;
    }

    Card.prototype.setFaceView = function (oFaceView) {
        this.faceView = oFaceView;
    }

    Card.prototype.getReariew = function () {
        return this.rearView;
    }

    Card.prototype.setRearView = function (oRearView) {
        this.rearView = oRearView;
    }

    return Card;
});
