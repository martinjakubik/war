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

    var player:Player
    var reference:DatabaseReference?
    var node:SKNode

    /*
     * initializes a Player controller from a player model, a remote database reference and a sprite node
     */
    init (player:Player, reference:DatabaseReference, isLocal:Bool, node:SKNode) {

        self.player = player
        self.reference = reference
        self.node = node

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

        let playerTop:CGFloat = 0

        let tableWidth:CGFloat = 40
        let handSpace:CGFloat = 20
        let handLeft:CGFloat = tableWidth + handSpace

        let cardSpace:CGFloat = 4
        let cardHeight:CGFloat = 148
        let cardWidth:CGFloat = 98

        let cardId:String = String(card.value) + card.suit

        let cardFileName = CardNode.makeImageFilename(fromId: cardId)
        let cardTexture = SKTexture(imageNamed: cardFileName)
        let cardNode = SKSpriteNode(texture: cardTexture, size: CGSize(width: cardWidth, height: cardHeight))

        let cardPoint = CGPoint(x: handLeft + atPosition * cardSpace, y: playerTop)
        cardNode.position = cardPoint

        self.node.addChild(cardNode)

    }

}
