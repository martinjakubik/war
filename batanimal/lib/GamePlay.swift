//
//  GamePlay.swift
//  batanimal
//
//  Created by Marcin Jakubik on 22/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import UIKit

class GamePlay {
    
    var view:UIView
    var numPlayers:Int = 0
    var cards:[Card] = []
    var shuffledCards:[Card] =  []
    var playerNames:[String] = []
    
    init(view:UIView, numPlayers:Int, cards:[Card], playerNames:[String]) {

        self.view = view
        self.numPlayers = numPlayers
        self.cards = cards
        self.playerNames = playerNames

    }
    
    /*
     *
     */
    func renderCards () {
        
        let gameTop = 80
        let gameLeft = 20
        
        let tableWidth = 40
        let handSpace = 20
        let handLeft = gameLeft + tableWidth + handSpace
        
        let cardSpace = 8
        let cardHeight = 80
        let cardWidth = 60
        
        var i:Int = 0
        for card in self.shuffledCards {
            
            let cardId:String = String(card.value) + card.suit

            let cardView:CardView = CardView(
                id: cardId,
                frame: CGRect(x: handLeft + i * cardSpace, y:gameTop, width:cardWidth, height:cardHeight)
            )

            i += 1
            
            self.view.addSubview(cardView)
        }
    }

    /*
     *
     */
    func start (shuffleCards:Bool) {
        
        if shuffleCards {

            self.shuffledCards = Tools.shuffle(things: self.cards)

        } else {

            self.shuffledCards = self.cards

        }

        renderCards()

    }
}
