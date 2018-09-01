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

        return self.player.getHand()

    }
    
    func setHand(hand:[Card]) {

        self.player.hand = hand

    }

    func removeCardFromHand(at position: Int) {

        self.player.hand?.remove(at: position)

    }

    func addCardToTable(card: Card) {

        self.player.table?.append(card)

    }

    /*
     * renders the cards in the player's hand
     */
    func renderHand() {

        var position:CGFloat = 0
        let numCards = getHand().count

        for card in getHand() {

            renderSingleCard(card: card, atPosition: position, numCards: CGFloat(numCards))
            position = position + 1

        }

    }

    /*
     * renders a single card
     */
    func renderSingleCard (card:Card, atPosition:CGFloat, numCards:CGFloat) {

        let borderWidth:CGFloat = 8
        let shadowWidth:CGFloat = 8

        let cardPoint = CGPoint(
            x: self.handLeft + atPosition * (self.cardSpace + borderWidth),
            y: self.playerTop
        )

        os_log("card position x:%f, y:%f", log:self.log, type:.debug, cardPoint.x, cardPoint.y)

        // calculates the z-index based on the position in the card set
        let zPosition = numCards - atPosition + 1

        // makes the border + shadow sprite
        let borderShadowFileName = "card-border-shadow.png"
        let borderShadowTexture = SKTexture(imageNamed: borderShadowFileName)
        let borderShadowNode = CardNode(
            texture: borderShadowTexture,
            size: CGSize(
                width: self.cardWidth + borderWidth * 2 + shadowWidth,
                height: self.cardHeight + borderWidth * 2 + shadowWidth
            )
        )
        borderShadowNode.position = cardPoint
        borderShadowNode.zPosition = zPosition

        // gets the picture of the card
        let cardId:String = card.getId()

        // makes the card sprite
        let cardFileName = Cards.makeImageFilename(fromId: cardId)
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
        cardNode.position = CGPoint(
            x: -2.0,
            y: 0.0
        )

        // makes sure border + shadow and card have same name
        borderShadowNode.name = cardId
        cardNode.name = cardId

        borderShadowNode.addChild(cardNode)
        self.node.addChild(borderShadowNode)

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

                moveCardToTable(cardId: cardId)

            }

        }

    }

    /*
     * moves card from hand to table in model and view
     */
    func moveCardToTable(cardId:String) {

        if (self.getHand().count > 0) {

            // moves the card in the model
            self.addCardToTable(card: self.getHand()[0])
            self.removeCardFromHand(at: 0)

            // moves the card in the view
            let shapeNode = self.node.childNode(withName: cardId)

            if let existingShapeNode:SKShapeNode = shapeNode as? SKShapeNode {

                let moveAction = SKAction.moveTo(x: existingShapeNode.position.x - 100, duration: 0.02)
                existingShapeNode.run(moveAction)

            }

        }

    }

}
