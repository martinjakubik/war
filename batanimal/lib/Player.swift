//
//  Player.swift
//  batanimal
//
//  Created by Marcin Jakubik on 24/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import FirebaseDatabase

class Player {

    var number:Int = -1
    var name:String = ""
    var hand:[Card]? = []
    var table:[Card]? = []
    var reference:DatabaseReference?
    var sessionId:String = ""

    /*
     *
     */
    init (withNumber number:Int, playerDictionary:[String:AnyObject]) {

        self.name = playerDictionary["name"] as? String ?? ""
        self.sessionId = playerDictionary["sessionId"] as? String ?? ""

        if self.hand?.isEmpty == true {
            
            self.hand = []
            
        }

        // tries to read the list of cards from the remote database as a dictionary
        if let handDictionary = playerDictionary["hand"] as? [String:AnyObject] {

            for cardValue in handDictionary {

                let card:Card = Card(value: cardValue.value as! Int, suit: cardValue.value as! String)

                self.hand!.append(card)

            }

        } else if let handDictionary = playerDictionary["hand"] as? [AnyObject] {

            // tries to read the list of cards from the remote database as a list
            
            // TODO: move this to Cards class and reuse between here and init for RestOfCards (in GameSlot class)

            for cardValue in handDictionary {

                if let cardDictionary = cardValue as? [String:AnyObject] {

                    let card:Card = Card(value: cardDictionary["value"] as! Int, suit: cardDictionary["suit"] as! String)

                    self.hand!.append(card)

                }

            }
            
        }

        self.table = playerDictionary["table"] as? [Card] ?? []

    }

    /*
     *
     */
    init (withNumber number:Int, reference:DatabaseReference, sessionId:String, isLocal:Bool) {

        self.number = number
        self.sessionId = sessionId

        self.name = ""
        self.hand = []
        self.table = []

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

}
