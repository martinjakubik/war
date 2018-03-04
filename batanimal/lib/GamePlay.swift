//
//  GamePlay.swift
//  batanimal
//
//  Created by Marcin Jakubik on 22/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import UIKit
import FirebaseDatabase


class GamePlay {
    
    var view:UIView
    var numPlayers:Int = 0
    var cards:[Card] = []
    var shuffledCards:[Card] =  []
    var playerNames:[String] = []
    var slotNumber:Int = 0
    var gameSlot:GameSlot?
    var playerReferences:[DatabaseReference] = []

    init(view:UIView, numPlayers:Int, cards:[Card], playerNames:[String]) {

        self.view = view
        self.numPlayers = numPlayers
        self.cards = cards
        self.playerNames = playerNames

    }

    /*
     *
     */
    class func getLastGameSlotNumber (allGameSlots:[String:AnyObject]) -> Int {

        var lastGameSlotNumber:Int = 0

        // gets the current game slot number
        if let gameSlotObject = allGameSlots["lastSlot"] as? [String:AnyObject] {

            if let gameSlotStringValue = gameSlotObject["value"] as? Int {

                lastGameSlotNumber = gameSlotStringValue

            }

        }

        return lastGameSlotNumber

    }

    /*
     *
     */
    class func getLastGameSlot (allGameSlots:[String:AnyObject]) -> GameSlot {

        var lastGameSlot:GameSlot = GameSlot(withDictionary:[:])

        // gets the content of the current game slot
        if let gameSlotList = allGameSlots["list"] as? [[String:[String:AnyObject]]] {

            let slotNumber = GamePlay.getLastGameSlotNumber(allGameSlots: allGameSlots)

            let gameSlotDictionary = gameSlotList[slotNumber]
            lastGameSlot = GameSlot(withDictionary:gameSlotDictionary)

        }

        return lastGameSlot

    }

    /*
     *
     */
    func setUpRemoteGameSlot () {

        let databaseReference = Database.database().reference()

        let referenceToAllGameSlots = databaseReference.child("game/slots")

        referenceToAllGameSlots.observeSingleEvent(

            of: DataEventType.value,
            with: {(snapshot) in

                if let allGameSlotDictionary = snapshot.value as? [String:AnyObject] {

                    self.slotNumber = GamePlay.getLastGameSlotNumber(allGameSlots: allGameSlotDictionary)

                    self.gameSlot = GamePlay.getLastGameSlot(allGameSlots: allGameSlotDictionary)

                    for i in 0...1 {
                        
                        let playerReference = referenceToAllGameSlots.child("list").child(String(self.slotNumber)).child("player" + String(i))

                        self.playerReferences.append(playerReference)

                    }
                }
        })
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
        
        let cardSpace = 4
        let cardHeight = 148
        let cardWidth = 98
        
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

        setUpRemoteGameSlot()

    }
}
