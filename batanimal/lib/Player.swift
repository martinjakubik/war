//
//  Player.swift
//  batanimal
//
//  Created by Marcin Jakubik on 04/08/2018.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation

class Player {

    var number:Int
    var name:String
    var hand:[Card]
    var table:[Card]

    /*
     *
     */
    init (withNumber number:Int, name:String, hand:[Card], table:[Card]) {

        self.number = number
        self.name = name
        self.hand = hand
        self.table = table

    }

}
