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

    override func viewDidLoad() {

        super.viewDidLoad()

        self.view = SKView()

        let gameBox = GameBox(view: self.skView)
        
        gameBox.go()

    }

    var skView:SKView {

        return self.view as! SKView

    }
}

