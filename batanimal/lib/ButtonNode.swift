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
    var labelText:String = ""
    var controller:GamePlay?
    
    init(withText labelText: String, position: CGPoint) {
        let buttonTexture:SKTexture = SKTexture(imageNamed: "button.png")
        super.init(texture: buttonTexture, color: UIColor.clear, size: buttonTexture.size())
        self.position = position
        self.labelText = labelText
        self.isUserInteractionEnabled = true
        let labelNode = SKLabelNode(fontNamed: "Avenir-Medium")
        labelNode.text = self.labelText
        labelNode.fontColor = UIColor.darkGray
        labelNode.fontSize = 28.0
        labelNode.verticalAlignmentMode = .center
        self.addChild(labelNode)
        labelNode.zPosition = 51
        self.zPosition = 50
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
    }
}
