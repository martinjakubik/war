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

    let gradientShader:SKShader

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
    init (player:Player, reference:DatabaseReference, isLocal:Bool, node:SKNode, playerTop:CGFloat, tableWidth:CGFloat, handSpace:CGFloat, cardSpace:CGFloat, cardHeight:CGFloat, cardWidth:CGFloat, gradientShader:SKShader, log:OSLog) {

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

        self.gradientShader = gradientShader

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

        let cardPoint = CGPoint(x: self.handLeft + atPosition * self.cardSpace, y: self.playerTop)
        
        os_log("card position x:%f, y:%f", log:self.log, type:.debug, cardPoint.x, cardPoint.y)

        // calculates the z-index based on the position in the card set
        let zPosition = numCards - atPosition + 1

        // makes the border shape
        let halfCardWidth = self.cardWidth / 2
        let halfCardHeight = self.cardHeight / 2
        let borderWidth:CGFloat = 4
        let shapeNode = SKShapeNode(rect: CGRect(x: (cardPoint.x - halfCardWidth) + borderWidth, y: (cardPoint.y - halfCardHeight) + borderWidth, width: self.cardWidth + (borderWidth * 2), height: self.cardHeight + (borderWidth * 2)), cornerRadius: 2.0)
        shapeNode.fillColor = UIColor.white
        shapeNode.fillShader = self.gradientShader
        shapeNode.zPosition = zPosition

        // gets the card for the given ID
        let cardId:String = String(card.value) + card.suit

        // makes the card
        let cardFileName = Cards.makeImageFilename(fromId: cardId)
        let cardTexture = SKTexture(imageNamed: cardFileName)
        let cardNode = SKSpriteNode(texture: cardTexture, size: CGSize(width: self.cardWidth, height: self.cardHeight))
        cardNode.position = cardPoint

        shapeNode.addChild(cardNode)
        self.node.addChild(shapeNode)

    }

}
