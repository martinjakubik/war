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
     * initializes a Player from a player number and a dictionary of values
     */
    init (withNumber number:Int, playerDictionary:[String:AnyObject]) {

        self.name = playerDictionary["name"] as? String ?? ""
        self.sessionId = playerDictionary["sessionId"] as? String ?? ""

        if self.hand?.isEmpty == true {
            
            self.hand = []
            
        }

        self.hand = Cards.makeCardArrayFromAnyObject(cardObject: playerDictionary["hand"])

        self.table = playerDictionary["table"] as? [Card] ?? []

    }

    /*
     * initializes a Player from a player number, a remote database reference and some stuff
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
