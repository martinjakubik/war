//
//  Button.swift
//  batanimal
//
//  Created by Marcin Jakubik on 13/01/2019.
//  Copyright © 2019 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

class ButtonNode:SKSpriteNode {

    var label:String = ""
    var controller:GamePlay?

    func setLabel(withText label: String) {

        self.label = label

    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {

        super.touchesEnded(touches, with: event)

        if let controller = self.controller {

            controller.handleButtonPressed()

        }

    }

}


