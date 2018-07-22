//
//  Player.swift
//  batanimal
//
//  Created by Marcin Jakubik on 24/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import UIKit
import Foundation
import FirebaseDatabase

class Player {

    var number:Int = -1
    var name:String = ""
    var hand:[Card]? = []
    var table:[Card]? = []
    var reference:DatabaseReference?
    var sessionId:String = ""

    var view:UIView
    
    /*
     * initializes a Player from a player number and a dictionary of values
     */
    init (withNumber number:Int, playerDictionary:[String:AnyObject], view:UIView) {

        self.name = playerDictionary["name"] as? String ?? ""
        self.sessionId = playerDictionary["sessionId"] as? String ?? ""

        if self.hand?.isEmpty == true {
            
            self.hand = []
            
        }

        self.hand = Cards.makeCardArrayFromAnyObject(cardObject: playerDictionary["hand"])

        self.table = playerDictionary["table"] as? [Card] ?? []

        self.view = view
    }

    /*
     * initializes a Player from a player number, a remote database reference and some stuff
     */
    init (withNumber number:Int, reference:DatabaseReference, sessionId:String, isLocal:Bool, view:UIView) {

        self.number = number
        self.sessionId = sessionId

        self.name = ""
        self.hand = []
        self.table = []

        self.view = view
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

        let cardView:CardView = CardView(

            id: cardId,
            frame: CGRect(x: handLeft + atPosition * cardSpace, y:gameTop, width:cardWidth, height:cardHeight)
            
        )

        self.view.addSubview(cardView)

    }

}
