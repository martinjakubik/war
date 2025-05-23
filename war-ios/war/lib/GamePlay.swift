//
//  GamePlay.swift
//  batanimal
//
//  Created by Marcin Jakubik on 22/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

import os.log

class GamePlay {
    var gamePlayDelegate: GamePlayProtocol!
    var numPlayers: Int = 0
    let maxNumPlayers: Int = 2
    var cards: [Card] = []
    var shuffledCards: [Card] =  []
    var playerControllers: [PlayerController] = []
    var restOfCards: [Card] = []
    let gameDimensions: GameDimensions
    var scene: SKScene
    var statusText: String
    let restartButtonTop: CGFloat = 60
    let restartButtonWidth: CGFloat = 80
    let statusTop: CGFloat = 100
    let statusWidth: CGFloat = 80
    var numMoves = 0

    enum GameState {
        case waitingToGatherCards
        case waitingToFillTable
        case waitingForFaceDownWarCard
        case gameOver
    }

    var gameState:GameState
    let wigglePath: CGPath = Tools.makeWigglePath()
    let wiggleAction: SKAction
    var statusLabel: SKLabelNode
    let control_layer_z_position: CGFloat = 50.0

    let log: OSLog

    init(viewSize: CGSize, scene: SKScene, gameDimensions: GameDimensions, numPlayers: Int, cards: [Card], log: OSLog) {
        self.scene = scene
        self.gameDimensions = gameDimensions
        self.numPlayers = numPlayers
        self.cards = cards
        self.gameState = GameState.waitingToFillTable
        self.statusText = ""
        self.wiggleAction = SKAction.follow(wigglePath, asOffset: true, orientToPath: false, speed: 600)
        self.statusLabel = SKLabelNode(text: "")
        self.statusLabel.zPosition = control_layer_z_position
        self.log = log
    }
    
    /*
     * updates the game when player wants to play a card, based on current state
     */
    func handlePlayerWantsToPlayACard(playerController: PlayerController) {
        handleLocalPlayerWantsToPlayACard(for: playerController)
        updateGameState()
    }

    /*
     * updates the game when local player wants to play a card, based on current state
     */
    func handleLocalPlayerWantsToPlayACard(for playerController: PlayerController) {
        switch self.gameState {
        case .waitingToFillTable:
            os_log("game state: %@", log:self.log, type:.debug, "waiting to fill table")
            if (playerController.doesPlayerHaveCardOnTableFaceUp()) {
                wiggleCardInHand(for: playerController)
            } else {
                playerController.putCardOnTable()
            }
            break
        case .waitingForFaceDownWarCard:
            os_log("game state: %@", log:self.log, type:.debug, "waiting for face down war card")
            if (playerController.doesPlayerHaveCardOnTableFaceUp()) {
                playerController.putCardOnTable()
            } else {
                wiggleCardInHand(for: playerController)
            }
            break
        case .waitingToGatherCards:
            os_log("game state: %@", log:self.log, type:.debug, "waiting to gather cards")
            gatherCards()
            self.numMoves = self.numMoves + 1
            break
        default:
            break
        }
    }

    /*
     * Moves the table cards to the hand of the player that won the turn.
     * Or waits for more cards on the table in case of a tie.
     */
    func gatherCards() {
        var winningPlayerNumber:Int = -1
        // decides what to do if all players have played
        if (doAllPlayersHaveSameNumberOfCardsOnTable() && self.gameState == .waitingToGatherCards) {
            winningPlayerNumber = self.gamePlayDelegate.whoseCardWins()
            // every five moves, randomly switches order of the gathered cards
            if (numMoves % 5 == 0 && Int.random(in: 0..<10) < 5) {
                // moves everyone's cards to the winner's hand, player 1 first
                self.playerControllers[winningPlayerNumber].moveTableCardsToHand(fromPlayer: self.playerControllers[1])
                self.playerControllers[winningPlayerNumber].moveTableCardsToHand(fromPlayer: self.playerControllers[0])
            } else {
                // moves everyone's cards to the winner's hand, player 0 first
                self.playerControllers[winningPlayerNumber].moveTableCardsToHand(fromPlayer: self.playerControllers[0])
                self.playerControllers[winningPlayerNumber].moveTableCardsToHand(fromPlayer: self.playerControllers[1])
            }
            self.gameState = .waitingToFillTable
        }
    }

    /*
     * Checks table to see if it's a war, or if it's time to gather cards.
     */
    func updateGameState() {
        if (doAllPlayersHaveSameNumberOfCardsOnTable()) {
            if (playerControllers[0].doesPlayerHaveCardOnTableFaceDown()) {
                // assumes both players need to play another card
                self.gameState = .waitingToFillTable
            } else if (playerControllers[0].doesPlayerHaveCardOnTableFaceUp()
                    && doPlayersHaveSameCardOnTable()) {
                // assumes both players have the same face-up card (starts war)
                playWarSound()
                self.gameState = .waitingForFaceDownWarCard
            } else {
                // assumes one player has a winning card
                self.gameState = .waitingToGatherCards
                // checks if the game is finished
                if (isGameOver()) {
                    endGame()
                }
            }
        } else if (playerControllers.count > 1 // TODO: protect this array access using swift style
                && playerControllers[0].getTable().count == 0
                && playerControllers[1].getTable().count == 0) {
            // assumes the players have no cards on the table
            self.gameState = .waitingToFillTable
        }
    }

    /*
     * if there is more than one player, returns true if all have same number of cards on the table; otherwise false
     */
    func doAllPlayersHaveSameNumberOfCardsOnTable() -> Bool {
        var doAllPlayersHaveSameNumberOfCardsOnTable: Bool = false
        if (playerControllers.count > 1) {
            let player0TableCount = playerControllers[0].getTable().count
            let player1TableCount = playerControllers[1].getTable().count
            doAllPlayersHaveSameNumberOfCardsOnTable = (player0TableCount == player1TableCount)
        }
        return doAllPlayersHaveSameNumberOfCardsOnTable
    }

    func doPlayersHaveSameCardOnTable() -> Bool {
        var doPlayersHaveSameCardOnTable: Bool = false
        if let player0Card = playerControllers[0].getTopCardOnTable() {
            if let player1Card = playerControllers[1].getTopCardOnTable() {
                doPlayersHaveSameCardOnTable = (player0Card.value == player1Card.value)
            }
        }
        return doPlayersHaveSameCardOnTable
    }

    func wiggleCardInHand(for playerController: PlayerController) {
        if playerController.getHand().count > 0 {
            let topCard = playerController.getHand()[0]
            let cardNode = playerController.gameNode.childNode(withName: topCard.getId())
            if let existingCardNode:CardNode = cardNode as? CardNode {
                existingCardNode.run(wiggleAction)
            }
        }
    }

    func isGameOver() -> Bool {
        var isGameOver: Bool = false
        var winningPlayerNumber: Int
        if (self.playerControllers.count < 2) {
            return isGameOver
        }
        if (self.playerControllers[0].doesPlayerHaveCardOnTable() && self.playerControllers[1].doesPlayerHaveCardOnTable()) {
            winningPlayerNumber = self.gamePlayDelegate.whoseCardWins()
            // checks if the other player's hand is empty
            for i in 0 ... self.playerControllers.count - 1 {
                if (i != winningPlayerNumber) {
                    if (self.playerControllers[i].getHand().count == 0) {
                        isGameOver = true
                        self.gameState = GameState.gameOver
                        self.statusText = self.playerControllers[winningPlayerNumber].getName() + " wins"
                    }
                }
            }
        }
        return isGameOver
    }

    func endGame() {
        self.statusText = "someone won"
    }

    func setUpGameSlot () {
        makePlayer0()
        makePlayer1()
    }

    /*
     * makes a model, view and controller for player 0;
     */
    func makePlayer0 () {
        // makes player 0 view and controller
        gamePlayDelegate.makePlayerViewAndController(initializedPlayer: nil, playerNumber: 0, gameDimensions: self.gameDimensions, playerTop: self.gameDimensions.gameMargin.bottom + self.gameDimensions.playerSize.height, playerName: "Fox")
        // distributes cards to player 0
        distributeCardsToAvailablePlayers()
        self.playerControllers[0].renderHand()
    }

    /*
     * makes a view and controller for player 1;
     * does nothing if there is no player 0 model yet
     */
    func makePlayer1 () {
        os_log("player 0 top: %f, player 1 top: %f", log: self.log, type: .debug, self.gameDimensions.gameMargin.bottom + self.gameDimensions.playerSize.height, self.gameDimensions.gameMargin.bottom)
        // makes player 1 view and controller
        // TODO: what if we have a remote player1 model already here?
        gamePlayDelegate.makePlayerViewAndController(initializedPlayer: nil, playerNumber: 1, gameDimensions: self.gameDimensions, playerTop: self.gameDimensions.gameMargin.bottom, playerName: "Turkey")
        self.playerControllers[1].setHand(hand: self.restOfCards)
        self.playerControllers[1].renderHand()
    }

    /*
     * hides the Restart button
     */
    func hideRestartMessage () {
        os_log("removing restart button", log: self.log, type: .debug)
//        self.scene.removeChildren(in: [self.restartButton, self.statusLabel])
    }

    func playWarSound () {
        var soundFileName = "tiger-growl.wav"
        if let card:Card = playerControllers[0].getTopCardOnTable() {
            switch card.value {
            case 1:
                soundFileName = "hamster-wheel.wav"
            case 2:
                soundFileName = "rabbit-crunch.wav"
            case 3:
                soundFileName = "cat-meow.wav"
            case 4:
                soundFileName = "dog-bark.wav"
            case 5:
                soundFileName = "tiger-growl.wav"
            case 6:
                soundFileName = "elephant.wav"
            default:
                soundFileName = "tiger-growl.wav"
            }
            SKAction.playSoundFileNamed(soundFileName, waitForCompletion: false)
        }
    }

    /*
     * distributes cards from the given array into the given number of mutliple arrays
     */
    func distribute (cards:[Card], numPlayersAmongWhichToDistribute:Int) -> [[Card]] {
        var i:Int = 0;
        var distributedCards:[[Card]] = []
        for card in cards {
            for j in 0...numPlayersAmongWhichToDistribute {
                if (i % numPlayersAmongWhichToDistribute == j) {
                    if (distributedCards.count < j + 1) {
                        distributedCards.append([])
                    }
                    distributedCards[j].append(card)
                    break
                }
            }
            i = i + 1
        }
        return distributedCards
    }

    /*
     * distributes cards to all players that have joined the game
     * (those that have player controllers);
     * keeps the rest in restOfCards
     */
    func distributeCardsToAvailablePlayers () {
        // distributes the cards to the local players
        let numPlayersAmongWhichToDistributeCards = self.numPlayers > 1 ? self.numPlayers : 2;
        let distributedCards = distribute(cards: self.shuffledCards, numPlayersAmongWhichToDistribute: numPlayersAmongWhichToDistributeCards)
        var i:Int = 0
        for playerController in self.playerControllers {
            playerController.setHand(hand: distributedCards[i])
            i = i + 1
        }
        if (distributedCards.count > i) {
            self.restOfCards = distributedCards[i]
        }
    }

    /*
     * makes and shows the scene
     */
    func makeScene() {
        let backgroundFileName = "background.png"
        let backgroundTexture = SKTexture(imageNamed: backgroundFileName)
        let backgroundNode = SKSpriteNode(
            texture: backgroundTexture,
            size: backgroundTexture.size()
        )
        backgroundNode.position = CGPoint(
            x: self.scene.size.width / 2,
            y: self.scene.size.height / 2
        )
        self.scene.addChild(backgroundNode)
        // shows the status box
        self.scene.addChild(self.statusLabel)
        self.statusLabel.text = "Waiting for player 2"
        // shows the dont wait button
        let buttonPosition = CGPoint(
            x: self.scene.size.width / 2,
            y: self.restartButtonTop
        )
        let restartButton = ButtonNode(withText: "Restart", position: buttonPosition, handleTap: restartGame)
        self.scene.addChild(restartButton)
    }

    func startGame (shuffleCards:Bool) {
        if shuffleCards {
            self.shuffledCards = Tools.shuffle(things: self.cards)
        } else {
            self.shuffledCards = self.cards
        }
        setUpGameSlot()
        makeScene()
    }

    func restartGame() {
        os_log("%@", log: self.log, type: .debug, "restarting")
        playerControllers[0].clearHand()
        playerControllers[1].clearHand()
        self.shuffledCards = Tools.shuffle(things: self.cards)
        distributeCardsToAvailablePlayers()
        self.playerControllers[0].renderHand()
        self.playerControllers[1].renderHand()
    }
}
