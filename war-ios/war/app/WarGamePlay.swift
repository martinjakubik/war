//
//  WarGamePlay.swift
//  batanimal
//
//  Created by Marcin Jakubik on 07/03/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

import os.log

class WarGamePlay: GamePlay, GamePlayProtocol {
    let tablePosition: CGFloat = 20
    
    override init(viewSize: CGSize, scene: SKScene, gameDimensions: GameDimensions, numPlayers: Int, cards: [Card], log: OSLog) {
        super.init(viewSize: viewSize, scene: scene, gameDimensions: gameDimensions, numPlayers: numPlayers, cards: cards, log: log)
        gamePlayDelegate = self
    }

    /*
     * Indicates who has the winning card on the table, based on the two
     * players' cards.
     *
     * returns number of the player whose table card is winning, or -1 if it's a
     *          tie; the first player is 0
     */
    func whoseCardWins() -> Int {
        var winningPlayer = -1
        if let player0TopCard:Card = self.playerControllers[0].getTopCardOnTable() {
            if let player1TopCard:Card = self.playerControllers[1].getTopCardOnTable() {
                if (player0TopCard.value > player1TopCard.value) {
                    winningPlayer = 0
                } else if (player0TopCard.value < player1TopCard.value) {
                    winningPlayer = 1
                }
            }
        }
        return winningPlayer
    }

    /*
     * makes a controller for the player;
     * if a player model is given, uses that model to make the controller;
     * if no player model is given, creates it first using the player number and session ID
     */
    func makePlayerViewAndController(initializedPlayer: Player?, playerNumber:Int, gameDimensions: GameDimensions,  playerTop: CGFloat, playerName: String) {
        if let player = initializedPlayer {
            // makes player controller
            let initializedPlayerNumber = player.number
            os_log("making player %d: model exists, player top: %.0f", log: self.log, type:.debug, initializedPlayerNumber, playerTop)

            let playerController = PlayerController(player: player, gameNode: self.scene, gameDimensions: self.gameDimensions, playerTop: playerTop, handleCardTapped: self.handlePlayerWantsToPlayACard, log: self.log)
            self.playerControllers.append(playerController)
            self.playerControllers[0].setName(name: playerName)
        } else {
            // makes player model first, then makes player controller
            let player = Player(withNumber: playerNumber)
            os_log("making player %d: model does not exist, player top: %.0f", log:self.log, type:.debug, playerNumber, playerTop)
            let playerController = PlayerController(player: player, gameNode: self.scene, gameDimensions: self.gameDimensions, playerTop: playerTop, handleCardTapped: self.handlePlayerWantsToPlayACard, log: self.log)
            self.playerControllers.append(playerController)
            self.playerControllers[0].setName(name: playerName)
        }
    }
}
