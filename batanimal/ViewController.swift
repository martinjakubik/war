//
//  ViewController.swift
//  batanimal
//
//  Created by Marcin Jakubik on 20/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {

        super.viewDidLoad()
        
        let gameBox = GameBox(view: self.view)
        
        gameBox.go()

    }

}

