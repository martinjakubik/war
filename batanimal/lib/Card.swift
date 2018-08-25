//
//  Card.swift
//  batanimal
//
//  Created by Marcin Jakubik on 21/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation

class Card {

    var value:Int = 0
    var suit:String = ""

    init(value:Int, suit:String) {

        self.value = value
        self.suit = suit

    }

    /*
     *
     */
    func getId() -> String {

        return String(self.value) + self.suit

    }

}
