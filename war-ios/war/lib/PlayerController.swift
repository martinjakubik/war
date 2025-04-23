//
//  PlayerController.swift
//  batanimal
//
//  Created by Marcin Jakubik on 24/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

import os.log

class PlayerController {
    let gameDimensions: GameDimensions
    let playerTop: CGFloat
    let log: OSLog
    // a player model
    var player: Player
    // a reference to the game view
    var gameNode: SKNode
    // the function called when a card is tapped
    var handleCardTapped:(PlayerController) -> Void
    let cardBackTexture: SKTexture

    /*
     * initializes a Player controller from a player model and a sprite node
     */
    init (player: Player, gameNode: SKNode, gameDimensions: GameDimensions, playerTop: CGFloat, handleCardTapped: @escaping (PlayerController) -> Void, log: OSLog) {
        self.player = player
        self.gameNode = gameNode
        self.gameDimensions = gameDimensions
        self.playerTop = playerTop
        self.log = log
        self.handleCardTapped = handleCardTapped
        let cardFileName = Cards.makeFilenameForCardBackImageWithBorderAndShadow()
        self.cardBackTexture = SKTexture(imageNamed: cardFileName)
    }
    
    func getName() -> String {
        return self.player.name
    }

    func setName(name: String) {
        self.player.name = name
    }

    func getHand() -> [Card] {
        return self.player.hand
    }

    func setHand(hand: [Card]) {
        self.player.hand = hand
    }

    func getTable() -> [Card] {
        return self.player.table
    }

    func setTable(table: [Card]) {
        self.player.table = table
    }

    func addCardToHand(card: Card) {
        self.player.hand.append(card)
    }

    func removeCardFromHand(card: Card) {
        self.player.removeCardFromHand(card: card)
    }

    func addCardToTable(card: Card) {
        self.player.table.append(card)
    }

    func removeCardFromTable(card: Card) {
        self.player.removeCardFromTable(card: card)
    }

    func getTopCardInHand() -> Card? {
        var topCard: Card?
        if self.getHand().count > 0 {
            topCard = self.getHand()[0]
        }
        return topCard
    }

    func getTopCardOnTable() -> Card? {
        var topCard: Card?
        if self.getTable().count > 0 {
            topCard = self.getTable()[self.getTable().count - 1]
        }
        return topCard
    }
    
    func clearHand() {
        for card in getHand() {
            let cardNode = self.gameNode.childNode(withName: card.getId())
            cardNode?.removeFromParent()
        }
        self.player.hand.removeAll()
        self.player.table.removeAll()
    }

    func renderHand() {
        var position: CGFloat = 0
        let numCards = getHand().count
        os_log("player %d has %d cards in hand", log:self.log, type:.debug, self.player.number, numCards)
        for card in getHand() {
            renderSingleCard(card: card, at: position, numCards: CGFloat(numCards))
            position = position + 1
        }
    }

    func renderSingleCard (card: Card, at position: CGFloat, numCards: CGFloat) {
        let cardPoint = CGPoint(
            x: self.gameDimensions.gameSize.width - self.gameDimensions.gamePadding.right - self.gameDimensions.handMargin.right - self.gameDimensions.cardSize.width / 2 - position * (self.gameDimensions.cardMargin.right + self.gameDimensions.cardPadding.right),
            y: self.playerTop
        )
        os_log("card position: (%.0f, %.0f)", log:self.log, type:.debug, cardPoint.x, cardPoint.y)
        // calculates the z-index based on the position in the card set
        let zPosition = numCards - position + 1
        // gets the picture of the card
        let cardId: String = card.getId()
        // makes the card sprite
        let cardFileName = Cards.makeFilenameForImageWithBorderAndShadow(from: cardId)
        let cardTexture = SKTexture(imageNamed: cardFileName)
        let cardNode = CardNode(
            playerController: self,
            frontTexture: cardTexture,
            backTexture: self.cardBackTexture,
            size: CGSize(
                width: self.gameDimensions.cardSize.width,
                height: self.gameDimensions.cardSize.height
            )
        )
        cardNode.isUserInteractionEnabled = true
        cardNode.position = cardPoint
        cardNode.zPosition = zPosition
        // makes sure UI node and model card have same ID
        cardNode.name = cardId
        self.gameNode.addChild(cardNode)
    }

    func cardTapped(cardId: String) {
        os_log("card tapped, with Id: \"%@\"", log: self.log, type:.debug, cardId)
        self.handleCardTapped(self)
    }

    func putCardOnTable() {
        if let topCard = getTopCardInHand() {
            moveCardFromHandToTable(card: topCard)
        }
    }

    func moveTableCardsToHand(fromPlayer: PlayerController) {
        for card in fromPlayer.getTable() {
            moveCardFromTableToHand(fromPlayer: fromPlayer, card: card)
        }
    }

    func moveCardFromHandToTable(card:Card) {
        moveCardToTableInModel(card: card)
        animateMoveCardFromHandToTable(card: card)
    }

    func moveCardFromTableToHand(fromPlayer: PlayerController, card:Card) {
        moveCardFromTableToHandInModel(fromPlayer: fromPlayer, card: card)
        animateMoveCardFromTableToHand(fromPlayer: fromPlayer, card: card)
    }
    
    func moveCardToTableInModel(card: Card) {
        self.addCardToTable(card: card)
        self.removeCardFromHand(card: card)
        os_log("player: %d; hand: ", log: self.log, type: .debug, self.player.number)
        var i = 0
        var log_cards: String = ""
        for card in self.getHand() {
            log_cards = log_cards + String(format: "%d=(%@) ", i, card.getId())
            i = i + 1
        }
        os_log("%@", log: self.log, type: .debug, log_cards)
    }

    func animateMoveCardFromHandToTable(card: Card) {
        let cardNode = self.gameNode.childNode(withName: card.getId())
        if let existingCardNode:CardNode = cardNode as? CardNode {
            let moveAction = SKAction.moveTo(x: self.gameDimensions.gameSize.width - self.gameDimensions.tableMargin.right - self.gameDimensions.cardSize.width / 2, duration: 0.1)
            existingCardNode.run(moveAction)
            existingCardNode.zPosition = CGFloat(self.getTable().count)
            if (self.getTable().count % 2 == 1) {
                existingCardNode.showFront()
            } else {
                existingCardNode.showBack()
            }
        }
    }

    func moveCardFromTableToHandInModel(fromPlayer: PlayerController, card:Card) {
        fromPlayer.removeCardFromTable(card: card)
        self.addCardToHand(card: card)
        os_log("player: %d; hand: ", log: self.log, type: .debug, self.player.number)
        var i = 0
        var log_cards: String = ""
        for card in self.getHand() {
            log_cards = log_cards + String(format: "%d=(%@) ", i, card.getId())
            i = i + 1
        }
        os_log("%@", log: self.log, type: .debug, log_cards)
    }

    func animateMoveCardFromTableToHand(fromPlayer: PlayerController, card: Card) {
        os_log("moving card: %@; player %d top: %.0f", log:self.log, type:.debug, card.getId(), self.player.number, self.playerTop)
        let cardNode = fromPlayer.gameNode.childNode(withName: card.getId())
        if let existingCardNode:CardNode = cardNode as? CardNode {
            let endPoint:CGPoint = CGPoint(
                x: self.gameDimensions.gameSize.width - self.gameDimensions.gamePadding.right - self.gameDimensions.handMargin.right - self.gameDimensions.cardSize.width / 2 - CGFloat(self.getHand().count) * (self.gameDimensions.cardMargin.right + self.gameDimensions.cardPadding.right),
                y: self.playerTop
            )
            let moveAction = SKAction.move(to: endPoint, duration: 0.2)
            existingCardNode.run(moveAction)
            existingCardNode.showBack()
            shiftPositionsOfHand()
        }
    }
// 0=2d 1=3c 2=1d 3=2b 4=1f 5=6f 6=5f 7=6a 8=4d 9=5e 10=2e | 11: 5c | 12: 6b | 13: 3d | 14: 1a | 15: 6e | 16: 4c | 17: 3b | 18: 1c |
    func shiftPositionsOfHand() {
        let numCards = self.getHand().count
        var position = 0
        var zPosition = 0
        for card in self.getHand() {
            let cardNode = self.gameNode.childNode(withName: card.getId())
            if let existingCardNode: CardNode = cardNode as? CardNode {
                zPosition = numCards - position + 1
                existingCardNode.zPosition = CGFloat(zPosition)
                let endPoint:CGPoint = CGPoint(
                    x: existingCardNode.position.x + self.gameDimensions.cardMargin.right,
                    y: existingCardNode.position.y
                )
                let moveAction = SKAction.move(to: endPoint, duration: 0.02)
                existingCardNode.run(moveAction)
            }
            position = position + 1
        }
    }

    func doesPlayerHaveCardOnTable() -> Bool {
        if (self.getTable().count > 0) {
            return true
        }
        return false
    }

    func doesPlayerHaveCardOnTableFaceUp() -> Bool {
        if (self.getTable().count % 2 == 1) {
            return true
        }
        return false
    }

    func doesPlayerHaveCardOnTableFaceDown() -> Bool {
        if (self.getTable().count % 2 == 0) {
            return true
        }
        return false
    }
}
