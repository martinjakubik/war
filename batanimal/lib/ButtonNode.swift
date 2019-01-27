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
    
    init(withLabel label: String, position: CGPoint, controller: GamePlay) {

        let buttonTexture:SKTexture = SKTexture(imageNamed: "button.png")
        super.init(texture: buttonTexture, color: UIColor.clear, size: buttonTexture.size())
        self.position = position
        self.label = label
        self.controller = controller
        self.isUserInteractionEnabled = true

    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {

        super.touchesEnded(touches, with: event)

        if let controller = self.controller {

            controller.handleButtonPressed()

        }

    }

}


