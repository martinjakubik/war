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
    var restOfCards:[Card] = []

    init (withDictionary slotDictionary:[String:AnyObject]) {

        for (key,_) in slotDictionary {

            if key.hasPrefix("player") {

                if let playerDict = slotDictionary[key] as? [String:AnyObject] {

                    let player = Player(withDictionary:playerDict)
                    players.append(player)

                }

            } else if key.hasPrefix("restOfCards") {

                if let restOfCardList = slotDictionary[key] as? [String:AnyObject] {

                    for cardValue in restOfCardList {

                        let card:Card = Card(value: cardValue.value as! Int, suit: cardValue.value as! String)

                        self.restOfCards.append(card)

                    }

                }

            }

        }

    }

}
