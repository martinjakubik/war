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
    
    override func viewWillAppear(_ animated: Bool) {

        self.view = SKView()
        
        let gameBox = GameBox(view: self.skView)
        
        self.skView.presentScene(gameBox.skScene)

        gameBox.go()
        
    }

}

