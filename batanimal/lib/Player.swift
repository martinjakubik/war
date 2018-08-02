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

    var scene:SKScene
    
    /*
     * initializes a Player from a player number and a dictionary of values
     */
    init (withNumber playerNumber:Int, playerDictionary:[String:AnyObject], scene:SKScene) {

        self.name = playerDictionary["name"] as? String ?? ""
        self.sessionId = playerDictionary["sessionId"] as? String ?? ""

        if self.hand?.isEmpty == true {
            
            self.hand = []
            
        }

        self.hand = Cards.makeCardArrayFromAnyObject(cardObject: playerDictionary["hand"])

        self.table = playerDictionary["table"] as? [Card] ?? []

        self.scene = scene

    }

    /*
     * initializes a Player from a player number, a remote database reference and some stuff
     */
    init (withNumber number:Int, reference:DatabaseReference, sessionId:String, isLocal:Bool, scene:SKScene) {

        self.number = number
        self.sessionId = sessionId

        self.name = ""
        self.hand = []
        self.table = []

        self.scene = scene

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

        var position = 0

        for card in getHand() {

            renderSingleCard(card: card, atPosition: position)
            position = position + 1

        }

    }

    /*
     * renders a single card
     */
    func renderSingleCard (card:Card, atPosition:Int) {

        let gameTop = 80
        let gameLeft = 20
        
        let tableWidth = 40
        let handSpace = 20
        let handLeft = gameLeft + tableWidth + handSpace
        
        let cardSpace = 4
        let cardHeight = 148
        let cardWidth = 98
        
        let cardId:String = String(card.value) + card.suit
        
        let cardFileName = CardNode.makeImageFilename(fromId: cardId)
        let cardTexture = SKTexture(imageNamed: cardFileName)
        let skCardNode = SKSpriteNode(texture: cardTexture, size: CGSize(width: cardWidth, height: cardHeight))

        let cardPoint = CGPoint(x: handLeft + atPosition * cardSpace, y: gameTop)
        skCardNode.position = cardPoint

        self.scene.addChild(skCardNode)

    }

}
