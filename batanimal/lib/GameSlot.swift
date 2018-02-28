//
//  GameSlot.swift
//  batanimal
//
//  Created by Marcin Jakubik on 25/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation

class GameSlot {

    var players:[Player] = []

    init (withDictionary slotDictionary:[String:[String:AnyObject]]) {

        for (key,_) in slotDictionary {

            if let playerDict = slotDictionary[key] {

                let player = Player(withDictionary:playerDict)
                players.append(player)

            }

        }

    }

}
