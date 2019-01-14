//
//  Button.swift
//  batanimal
//
//  Created by Marcin Jakubik on 13/01/2019.
//  Copyright © 2019 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

class Button:SKSpriteNode {

    let label:String
    var onPress:() -> Void?

    init(withText label: String, onPress:@escaping () -> Void?) {

        self.label = label
        self.onPress = onPress

        let buttonTexture:SKTexture = SKTexture(imageNamed: "button.png")
        let buttonColor:UIColor = UIColor(red: 0.8, green: 0.8, blue: 0.9, alpha: 1.0)
        let buttonSize:CGSize = CGSize(width: 80, height: 30)

        super.init(texture: buttonTexture, color: buttonColor, size: buttonSize)

    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {

        super.touchesEnded(touches, with: event)
        self.onPress()

    }

}


