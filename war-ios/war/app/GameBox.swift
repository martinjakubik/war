//
//  GameBox.swift
//  batanimal
//
//  Created by Marcin Jakubik on 21/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

import os.log

class GameBox {
    var viewSize: CGSize
    var scene: SKScene
    let log: OSLog
    
    class func getRandomPlayerName (notThis:String) -> String {
        let names = [ "Albatross", "Badger", "Chicken", "Dolphin", "Eagle",
                      "Ferret", "Gorilla", "Hedgehog", "Iguana", "Jackal",
                      "Koala", "Lemming", "Magpie", "Newt", "Otter", "Pig",
                      "Quail", "Rabbit", "Sole", "Turtle", "Upupa",
                      "Vulture", "Whale", "Xantus", "Yak", "Zebra" ]
        let size = names.count
        var tryThis:String = notThis
        while (tryThis == notThis) {
            let n = Int.random(in: 0..<size)
            tryThis = names[ n ]
        }
        return tryThis
    }

    init(viewSize: CGSize) {
        self.viewSize = viewSize
        self.scene = SKScene(size: viewSize)
        self.log = OSLog(subsystem: Bundle.main.bundleIdentifier!, category: "game")
    }

    func makeCards (cardValues: [Int], addSkunk: Bool) -> [Card] {
        var cards: [Card] = []
        let suitLetters = [ "a", "b", "c", "d", "e", "f" ]
        var suit:Int
        var highestSuitsFoundForValue = [Int: Int]()
        // distributes the cards into suits
        for cardValue in cardValues {
            suit = -1;
            // initializes a suit value if there isn't one
            if highestSuitsFoundForValue[cardValue] == nil {
                highestSuitsFoundForValue[cardValue] = suit
            }
            // increments the suit value if one has been used already
            if let highestSuitFoundForValue = highestSuitsFoundForValue[cardValue]  {
                highestSuitsFoundForValue[cardValue] = highestSuitFoundForValue + 1;
            }
            // adds a card using the card value and the highest suit found
            if let highestSuitFoundForValue = highestSuitsFoundForValue[cardValue] {
                let suitLetter = suitLetters[highestSuitFoundForValue]
                let card = Card(value: cardValue, suit:suitLetter)
                cards.append(card)
            }
        }
        return cards
    }

    func go() -> SKScene {
        let batanimalCardValues = [
            6, 3, 5, 5, 1, 6,
            4, 2, 4, 3, 1, 3,
            5, 6, 2, 4, 6, 3,
            4, 4, 6, 1, 2, 1,
            4, 5, 1, 3, 5, 2,
            6, 1, 2, 2, 3, 5
        ];
        let cards: [Card] = makeCards(cardValues: batanimalCardValues, addSkunk: true)
        let gamePlay = WarGamePlay(
            viewSize: self.viewSize,
            scene: self.scene,
            numPlayers: 2,
            cards: cards,
            log: self.log
        )
        gamePlay.startGame(shuffleCards: true)
        return self.scene
    }
}
