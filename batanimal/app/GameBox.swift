//
//  GameBox.swift
//  batanimal
//
//  Created by Marcin Jakubik on 21/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import SpriteKit
import os.log

class GameBox {

    var view:SKView
    var scene:SKScene

    let gameTop:CGFloat = 60
    let gameLeft:CGFloat = 20
    let playerHeight:CGFloat = 180

    let tableWidth:CGFloat = 40
    let handSpace:CGFloat = 20

    let cardSpace:CGFloat = 4

    // width:height ratio is 0.66
    let cardHeight:CGFloat = 176
    let cardWidth:CGFloat = 116

    let gradientShader:SKShader

    let log:OSLog

    init(view:SKView) {

        self.view = view
        self.scene = SKScene(size: self.view.frame.size)

        self.gradientShader = SKShader(source: "void main() {" +
            "float normalisedPosition = v_path_distance / u_path_length;" +
            "gl_FragColor = vec4(normalisedPosition, normalisedPosition, 0.0, 1.0);" +
            "}")

        self.log = OSLog(subsystem: Bundle.main.bundleIdentifier!, category: "game")

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
            topView:self.view,
            scene:self.scene,
            numPlayers:2,
            cards:cards,
            playerNames:playerNames,
            gameTop:self.gameTop,
            gameLeft:self.gameLeft,
            playerHeight:self.playerHeight,
            tableWidth: self.tableWidth,
            handSpace: self.handSpace,
            cardSpace: self.cardSpace,
            cardHeight: self.cardHeight,
            cardWidth: self.cardWidth,
            gradientShader: self.gradientShader,
            log: self.log
        )

        gamePlay.start(shuffleCards:true)

    }

}

