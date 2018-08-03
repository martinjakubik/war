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

    var scene:SKScene
    var gameTop:CGFloat
    var gameLeft:CGFloat
    var playerHeight:CGFloat

    init (withDictionary slotDictionary:[String:AnyObject], scene:SKScene, gameTop:CGFloat, gameLeft:CGFloat, playerHeight:CGFloat) {

        self.scene = scene
        self.gameTop = gameTop
        self.gameLeft = gameLeft
        self.playerHeight = playerHeight

        for (key,_) in slotDictionary {

            if key.hasPrefix("player0") {

                if let playerDict = slotDictionary[key] as? [String:AnyObject] {

                    // makes player view
                    let player0Node = SKNode()
                    player0Node.position = CGPoint(x:self.gameLeft, y:self.gameTop)
                    self.scene.addChild(player0Node)

                    // makes player controller
                    let player = Player(withNumber:0, playerDictionary:playerDict, node:player0Node)
                    player0 = player

                }

            } else if key.hasPrefix("player1") {

                if let playerDict = slotDictionary[key] as? [String:AnyObject] {

                    // makes player view
                    let player1Node = SKNode()
                    player1Node.position = CGPoint(x:self.gameLeft, y:self.gameTop + self.playerHeight)
                    self.scene.addChild(player1Node)

                    // makes player controller
                    let player = Player(withNumber:1, playerDictionary:playerDict, node:player1Node)
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
