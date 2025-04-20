//
//  Cards.swift
//  batanimal
//
//  Created by Marcin Jakubik on 28/04/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
class Cards {
    class func getCardsAsNSDictionary(cards: [Card]) -> NSDictionary {
        let cardDictionary: NSDictionary = NSMutableDictionary.init()
        var i: Int = 0
        for card in cards {
            let key: String = String(i)
            let cardAsDict = getCardAsNSDictionary(card)
            cardDictionary.setValue(cardAsDict, forKey: key)
            i = i + 1
        }
        return cardDictionary
    }
    
    class func getCardAsNSDictionary(_ card:Card) -> NSDictionary {
        let cardDictionary: NSDictionary = NSMutableDictionary.init()
        cardDictionary.setValue(card.suit, forKey: "suit")
        cardDictionary.setValue(card.value, forKey: "value")
        return cardDictionary
    }

    class func makeImageFilename (fromId: String) -> String {
        let cardPrefix = "card"
        let gameTag = "batanimo"
        let graphicExtension = "png"
        let fileName = cardPrefix + "-" + gameTag + "-" + fromId + "." + graphicExtension
        // format: card-batanimo-1f.png
        return fileName
    }

    class func makeFilenameForImageWithBorderAndShadow (from id: String) -> String {
        let cardPrefix = "card"
        let gameTag = "batanimo"
        let graphicExtension = "png"
        let borderTag = "bo"
        let shadowTag = "sh"
        // format: card-batanimo-1f-bo-sh.png
        let fileName = cardPrefix + "-" + gameTag + "-" + id + "-" + borderTag + "-" + shadowTag + "." + graphicExtension
        return fileName
    }
}
