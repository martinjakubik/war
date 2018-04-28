//
//  Cards.swift
//  batanimal
//
//  Created by Marcin Jakubik on 28/04/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation

class Cards {

    class func getCardsAsNSDictionary(cards:[Card]) -> NSDictionary {

        let cardDictionary:NSDictionary = NSMutableDictionary.init()

        var i:Int = 0
        for card in cards {

            let key:String = String(i)
            let cardAsDict = getCardAsNSDictionary(card)
            cardDictionary.setValue(cardAsDict, forKey: key)
            i = i + 1

        }

        return cardDictionary
    }
    
    class func getCardAsNSDictionary(_ card:Card) -> NSDictionary {

        let cardDictionary:NSDictionary = NSMutableDictionary.init()

        cardDictionary.setValue(card.suit, forKey: "suit")
        cardDictionary.setValue(card.value, forKey: "value")

        return cardDictionary

    }

}
