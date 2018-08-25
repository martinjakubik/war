//
//  CardNode.swift
//  batanimal
//
//  Created by Marcin Jakubik on 25/08/2018.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

class CardNode:SKSpriteNode {

    var playerController:PlayerController?

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {

        super.touchesEnded(touches, with: event)

        if let playerController = self.playerController {

            if let name = self.name {

                playerController.cardTapped(cardId: name)

            }

        }

    }

}
