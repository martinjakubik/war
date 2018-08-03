//
//  Player.swift
//  batanimal
//
//  Created by Marcin Jakubik on 24/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import FirebaseDatabase
import SpriteKit

class Player {

    var number:Int = -1
    var name:String = ""
    var hand:[Card]? = []
    var table:[Card]? = []
    var reference:DatabaseReference?
    var sessionId:String = ""

    var node:SKNode

    /*
     * initializes a Player from a player number and a dictionary of values
     */
    init (withNumber playerNumber:Int, playerDictionary:[String:AnyObject], node:SKNode) {

        self.name = playerDictionary["name"] as? String ?? ""
        self.sessionId = playerDictionary["sessionId"] as? String ?? ""

        if self.hand?.isEmpty == true {

            self.hand = []

        }

        self.hand = Cards.makeCardArrayFromAnyObject(cardObject: playerDictionary["hand"])

        self.table = playerDictionary["table"] as? [Card] ?? []

        self.node = node

    }

    /*
     * initializes a Player from a player number, a remote database reference and some stuff
     */
    init (withNumber number:Int, reference:DatabaseReference, sessionId:String, isLocal:Bool, node:SKNode) {

        self.number = number
        self.sessionId = sessionId

        self.name = ""
        self.hand = []
        self.table = []

        self.node = node

    }

    /*
     * returns a hand, making sure it's not an optional type
     */
    func getHand () -> [Card] {

        if (self.hand?.isEmpty == true) {

            return []

        } else {

            return self.hand!

        }

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
