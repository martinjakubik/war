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
    
    init(view:UIView, numPlayers:Int, cards:[Card]) {

        self.view = view
        self.numPlayers = numPlayers
        self.cards = cards

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
        for card in self.cards {
            
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
    func start () {
        
        renderCards()

    }
}
