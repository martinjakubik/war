//
//  ViewController.swift
//  batanimal
//
//  Created by Marcin Jakubik on 20/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import UIKit
import SpriteKit

class ViewController: UIViewController {

    var skView:SKView {

        return self.view as! SKView

    }
    
    override func viewDidLoad() {
        self.view = SKView()
        
        self.skView.showsFPS = true
        self.skView.showsNodeCount = true
        self.skView.ignoresSiblingOrder = true
        
        let skScene = SKScene(size: CGSize(width: 1024, height: 768))
        
        skScene.scaleMode = .resizeFill
        
        self.skView.presentScene(skScene)
        
    }

    override func viewWillAppear(_ animated: Bool) {

        let gameBox = GameBox(view: self.skView)

        gameBox.go()

    }

}

