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
    var hand:[Card] = []
    var table:[Card] = []
    var reference:DatabaseReference?
    var sessionId:String = ""
    var isLocal:Bool = true

    /*
     *
     */
    init (withDictionary playerDict:[String:AnyObject]) {

        self.name = playerDict["name"] as? String ?? ""
        self.sessionId = playerDict["sessionId"] as? String ?? ""
        
        self.hand = []
        self.table = []
        self.sessionId = ""
        self.isLocal = true

    }

    /*
     *
     */
    init (withNumber number:Int, reference:DatabaseReference, sessionId:String, isLocal:Bool) {

        self.number = number
        self.sessionId = sessionId
        self.isLocal = isLocal

        self.name = ""
        self.hand = []
        self.table = []

    }
}
