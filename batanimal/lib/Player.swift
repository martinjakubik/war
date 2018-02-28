//
//  Player.swift
//  batanimal
//
//  Created by Marcin Jakubik on 24/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation

class Player {

    var name:String = ""
    var hand:[Card] = []
    var sessionId:String = ""

    init (withDictionary playerDict:[String:AnyObject]) {

        name = playerDict["name"] as? String ?? ""
        sessionId = playerDict["sessionId"] as? String ?? ""
        
        // hand = Card(initWith)

    }
}
