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

class PlayerController {

    let playerTop:CGFloat

    let tableWidth:CGFloat
    let handSpace:CGFloat
    let handLeft:CGFloat

    let cardSpace:CGFloat
    let cardHeight:CGFloat
    let cardWidth:CGFloat

    // a player model
    var player:Player

    // a reference to the player model on the remote database
    var reference:DatabaseReference?

    // a player view
    var node:SKNode

    /*
     * initializes a Player controller from a player model, a remote database reference and a sprite node
     */
    init (player:Player, reference:DatabaseReference, isLocal:Bool, node:SKNode, playerTop:CGFloat, tableWidth:CGFloat, handSpace:CGFloat, cardSpace:CGFloat, cardHeight:CGFloat, cardWidth:CGFloat) {

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

        for card in getHand() {

            renderSingleCard(card: card, atPosition: position)
            position = position + 1

        }

    }

    /*
     * renders a single card
     */
    func renderSingleCard (card:Card, atPosition:CGFloat) {

        let cardId:String = String(card.value) + card.suit

        let cardFileName = Cards.makeImageFilename(fromId: cardId)
        let cardTexture = SKTexture(imageNamed: cardFileName)
        let cardNode = SKSpriteNode(texture: cardTexture, size: CGSize(width: self.cardWidth, height: self.cardHeight))

        let cardPoint = CGPoint(x: self.handLeft + atPosition * self.cardSpace, y: self.playerTop)
        cardNode.position = cardPoint

        self.node.addChild(cardNode)

    }

}
