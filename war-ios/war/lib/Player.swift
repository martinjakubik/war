//
//  Player.swift
//  batanimal
//
//  Created by Marcin Jakubik on 04/08/2018.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
class Player {
    var number: Int
    var name: String
    var hand: [Card] = []
    var table: [Card] = []

    init (withNumber number: Int) {
        self.number = number
        self.name = ""
        self.hand = []
        self.table = []
    }
    
    func removeCardFromHand(card: Card) {
        if let index = self.hand.firstIndex(where: {
            $0.getId() == card.getId()
        }) {
            self.hand.remove(at: index)
        }
    }

    func removeCardFromTable(card: Card) {
        if let index = self.table.firstIndex(where: {
            $0.getId() == card.getId()
        }) {
            self.table.remove(at: index)
        }
    }
}
