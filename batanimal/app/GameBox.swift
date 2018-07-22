//
//  GameBox.swift
//  batanimal
//
//  Created by Marcin Jakubik on 21/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import SpriteKit

class GameBox {

    var skView:SKView
    var skScene:GameBoxScene

    init(view:SKView) {

        self.skView = view
        self.skScene = GameBoxScene()

    }

    /*
     *
     */
    func getRandomPlayerName () -> String {

        return "Fox"

    }

    /*
     *
     */
    func makeCards (cardValues:[Int], addSkunk:Bool) -> [Card] {

        var cards:[Card] = []

        var suitLetters = [ "a", "b", "c", "d", "e", "f" ]

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

    /*
     *
     */
    func go() {

        let batanimalCardValues = [
            6, 3, 5, 5, 1, 6,
            4, 2, 4, 3, 1, 3,
            5, 6, 2, 4, 6, 3,
            4, 4, 6, 1, 2, 1,
            4, 5, 1, 3, 5, 2,
            6, 1, 2, 2, 3, 5
        ];

        let cards:[Card] = makeCards(cardValues: batanimalCardValues, addSkunk: true)

        let playerNames = [ "cat", "dog", "cow", "pig", "horse", "skunk", "ferret", "duck", "jackal" ]

        let gamePlay = WarGamePlay(
            view:self.skView,
            scene:self.skScene,
            numPlayers:2,
            cards:cards,
            playerNames:playerNames
        )

        gamePlay.start(shuffleCards:true)

    }

}

