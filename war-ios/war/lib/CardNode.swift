//
//  CardNode.swift
//  batanimal
//
//  Created by Marcin Jakubik on 25/08/2018.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

class CardNode: SKSpriteNode {
    var playerController: PlayerController?
    let frontTexture: SKTexture
    let backTexture: SKTexture
    
    init(playerController: PlayerController? = nil, frontTexture: SKTexture, backTexture: SKTexture, size: CGSize) {
        self.playerController = playerController
        self.frontTexture = frontTexture
        self.backTexture = backTexture
        super.init(texture: backTexture, color: UIColor.white, size: size)
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        if let playerController = self.playerController {
            if let name = self.name {
                playerController.cardTapped(cardId: name)
            }
        }
    }
    
    func showFront() {
        self.texture = frontTexture
    }
    
    func showBack() {
        self.texture = backTexture
    }
}
