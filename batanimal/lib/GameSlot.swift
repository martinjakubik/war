//
//  GameSlot.swift
//  batanimal
//
//  Created by Marcin Jakubik on 25/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

class GameSlot {

    var player0:Player?
    var player1:Player?
    var restOfCards:[Card]? = []
    var scene:GameBoxScene

    init (withDictionary slotDictionary:[String:AnyObject], scene:GameBoxScene) {

        self.scene = scene

        for (key,_) in slotDictionary {

            if key.hasPrefix("player0") {

                if let playerDict = slotDictionary[key] as? [String:AnyObject] {

                    let player = Player(withNumber:0, playerDictionary:playerDict, scene: self.scene)
                    player0 = player

                }

            } else if key.hasPrefix("player1") {
                
                if let playerDict = slotDictionary[key] as? [String:AnyObject] {

                    let player = Player(withNumber:1, playerDictionary:playerDict, scene: self.scene)
                    player1 = player
                    
                }
                
            } else if key.hasPrefix("restOfCards") {

                if self.restOfCards?.isEmpty == true {

                    self.restOfCards = []

                }

                self.restOfCards = Cards.makeCardArrayFromAnyObject(cardObject: slotDictionary[key])

            }

        }

    }

}
