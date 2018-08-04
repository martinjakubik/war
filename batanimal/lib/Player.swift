//
//  Player.swift
//  batanimal
//
//  Created by Marcin Jakubik on 04/08/2018.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation

class Player {

    var number:Int
    var sessionId:String
    var name:String
    var hand:[Card]? = []
    var table:[Card]? = []

    /*
     *
     */
    init (withNumber number:Int, sessionId:String, name:String, hand:[Card], table:[Card]) {

        self.number = number
        self.sessionId = sessionId
        self.name = name
        self.hand = hand
        self.table = table

    }

    /*
     *
     */
    init (withNumber number:Int, playerDictionary:[String:AnyObject]) {

        self.number = number
        self.name = playerDictionary["name"] as? String ?? ""
        self.sessionId = playerDictionary["sessionId"] as? String ?? ""

        if self.hand?.isEmpty == true {

            self.hand = []

        }

        self.hand = Cards.makeCardArrayFromAnyObject(cardObject: playerDictionary["hand"])

        self.table = playerDictionary["table"] as? [Card] ?? []

    }

}
