//
//  PlayerController.swift
//  batanimal
//
//  Created by Marcin Jakubik on 24/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import FirebaseDatabase
import SpriteKit

import os.log

class PlayerController {

    let playerTop:CGFloat

    let tableWidth:CGFloat
    let handSpace:CGFloat
    let handLeft:CGFloat

    let cardSpace:CGFloat
    let cardHeight:CGFloat
    let cardWidth:CGFloat

    let log:OSLog

    // a player model
    var player:Player

    // a reference to the player model on the remote database
    var reference:DatabaseReference?

    // a player view
    var node:SKNode

    /*
     * initializes a Player controller from a player model, a remote database reference and a sprite node
     */
    init (player:Player, reference:DatabaseReference, isLocal:Bool, node:SKNode, playerTop:CGFloat, tableWidth:CGFloat, handSpace:CGFloat, cardSpace:CGFloat, cardHeight:CGFloat, cardWidth:CGFloat, log:OSLog) {

        self.player = player
        self.reference = reference
        self.node = node

        self.playerTop = playerTop

        self.tableWidth = tableWidth
        self.handSpace = handSpace
        self.handLeft = self.tableWidth + self.handSpace

        self.cardSpace = cardSpace
        self.cardHeight = cardHeight
        self.cardWidth = cardWidth

        self.log = log

    }
    
    func getName() -> String {

        return self.player.name

    }
    
    func setName(name:String) {

        self.player.name = name

    }

    func getHand() -> [Card] {

        return self.player.hand

    }
    
    func setHand(hand:[Card]) {

        self.player.hand = hand

    }

    func addCardToTable(card: Card) {

        self.player.table.append(card)

    }

    /*
     * removes the given card from the hand
     */
    func removeCardFromHand(card: Card) {

        self.player.removeCardFromHand(card: card)

    }

    /*
     * renders the cards in the player's hand
     */
    func renderHand() {

        var position:CGFloat = 0
        let numCards = getHand().count

        for card in getHand() {

            renderSingleCard(card: card, at: position, numCards: CGFloat(numCards))
            position = position + 1

        }

    }

    /*
     * renders a single card
     */
    func renderSingleCard (card:Card, at position:CGFloat, numCards:CGFloat) {

        let borderWidth:CGFloat = 8

        let cardPoint = CGPoint(
            x: self.handLeft + position * (self.cardSpace + borderWidth),
            y: self.playerTop
        )

        os_log("card position x:%f, y:%f", log:self.log, type:.debug, cardPoint.x, cardPoint.y)

        // calculates the z-index based on the position in the card set
        let zPosition = numCards - position + 1

        // gets the picture of the card
        let cardId:String = card.getId()

        // makes the card sprite
        let cardFileName = Cards.makeImageWithBorderAndShadowFilename(from: cardId)
        let cardTexture = SKTexture(imageNamed: cardFileName)
        let cardNode = CardNode(
            texture: cardTexture,
            size: CGSize(
                width: self.cardWidth,
                height: self.cardHeight
            )
        )
        cardNode.playerController = self
        cardNode.isUserInteractionEnabled = true
        cardNode.position = cardPoint
        cardNode.zPosition = zPosition

        // makes sure UI node and model card have same ID
        cardNode.name = cardId

        self.node.addChild(cardNode)

    }

    /*
     * handles a tap on a card
     */
    func cardTapped(cardId:String) {

        os_log("card tapped, with Id: \"%@\"", log:self.log, type:.debug, cardId)

        // gets the top card in the hand
        if self.getHand().count > 0 {

            let topCard = self.getHand()[0]
            let topCardId = topCard.getId()

            // checks that the tapped card is the top card
            if (topCardId == cardId) {

                moveCardToTable(card: topCard)

            }

        }

    }

    /*
     * moves card from hand to table in model and view
     */
    func moveCardToTable(card:Card) {

        if (self.getHand().count > 0) {

            moveCardToTableInModel(card: card)
            moveCardToTableInView(card: card)

        }

    }

    /*
     * moves card from hand to table in model
     */
    func moveCardToTableInModel(card:Card) {

        // moves the card in the model
        self.addCardToTable(card: card)
        self.removeCardFromHand(card: card)
        
        os_log("hand: ", log: self.log, type: .debug)
        var i = 0
        for card in self.getHand() {
            os_log("%d | %@ ", log: self.log, type: .debug, i, card.getId())
            i = i + 1
        }

    }

    /*
     * moves card from hand to table in view
     */
    func moveCardToTableInView(card:Card) {

        // moves the card in the view
        let cardNode = self.node.childNode(withName: card.getId())

        if let existingCardNode:CardNode = cardNode as? CardNode {

            let moveAction = SKAction.moveTo(x: existingCardNode.position.x - 100, duration: 0.02)
            existingCardNode.run(moveAction)

        }

    }

}
