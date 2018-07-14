//
//  GamePlay.swift
//  batanimal
//
//  Created by Marcin Jakubik on 22/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import UIKit
import FirebaseDatabase
import os.log

class GamePlay {
    
    var view:UIView
    var numPlayers:Int = 0
    var cards:[Card] = []
    var shuffledCards:[Card] =  []
    var slotIncrement:Int = 0
    var slotKey:String = ""
    var gameSlot:GameSlot?
    var playerNames:[String] = []
    var playerReferences:[DatabaseReference] = []
    var playerControllers:[Player] = []
    var restOfCards:[Card] = []

    let firstSlotNumber:String = "3"
    let maxNumberOfSlots = 3

    init(view:UIView, numPlayers:Int, cards:[Card], playerNames:[String]) {

        self.view = view
        self.numPlayers = numPlayers
        self.cards = cards
        self.playerNames = playerNames

    }

    /*
     *
     */
    class func getLastGameSlotKey (allGameSlots:[String:AnyObject]) -> String {

        var lastGameSlotKey:String = "0"

        // gets the current game slot number
        if let gameSlotObject = allGameSlots["lastSlot"] as? [String:AnyObject] {

            if let gameSlotStringValue = gameSlotObject["value"] as? String {

                lastGameSlotKey = gameSlotStringValue

            }

        }

        return lastGameSlotKey

    }

    /*
     *
     */
    class func getLastGameSlot (allGameSlots:[String:AnyObject]) -> GameSlot {

        var lastGameSlot:GameSlot = GameSlot(withDictionary:[:])

        // gets the content of the current game slot
        if let gameSlotList = allGameSlots["list"] as? [String:AnyObject] {

            let slotKey = GamePlay.getLastGameSlotKey(allGameSlots: allGameSlots)

            if let singleSlotDictionary = gameSlotList[slotKey] as? [String:AnyObject] {

                lastGameSlot = GameSlot(withDictionary:singleSlotDictionary)

            }

        }
        return lastGameSlot

    }

    /*
     *
     */
    func moveToNextGameSlot (referenceGameSlotList:DatabaseReference) {

        let referenceGameSlot:DatabaseReference = referenceGameSlotList.childByAutoId()

        let myGameSlot = ["player0": ["name" : "_new_" as AnyObject]]

        referenceGameSlot.setValue(myGameSlot)

        self.slotKey = referenceGameSlot.key

        self.playerReferences.append(referenceGameSlot.child("player0"))
        self.playerReferences.append(referenceGameSlot.child("player1"))

    }
    
    /*
     *
     */
    func setUpRemoteGameSlot () {

        let databaseReference = Database.database().reference()

        let referenceToAllGameSlots = databaseReference.child("game/slots")
        
        let referenceGameSlotList = databaseReference.child("game/slots/list")

        referenceToAllGameSlots.observeSingleEvent(

            of: DataEventType.value,
            with: {(snapshot) in

                if let allGameSlots = snapshot.value as? [String:AnyObject] {

                    self.slotKey = GamePlay.getLastGameSlotKey(allGameSlots: allGameSlots)

                    self.gameSlot = GamePlay.getLastGameSlot(allGameSlots: allGameSlots)
                    
                    var playerReferences:[DatabaseReference] = []

                    for i in 0...1 {

                        let playerReference = referenceToAllGameSlots.child("list").child(String(self.slotKey)).child("player" + String(i))

                        playerReferences.append(playerReference)

                    }

                    let isPlayer0SlotFull:Bool
                    let isPlayer1SlotFull:Bool
                    if let gameSlot = self.gameSlot {

                        isPlayer0SlotFull = gameSlot.players.count > 0
                        isPlayer1SlotFull = gameSlot.players.count > 1

                    } else {

                        isPlayer0SlotFull = false
                        isPlayer1SlotFull = false

                    }

                    if (!isPlayer0SlotFull && !isPlayer1SlotFull) {

                        self.keepPlayer0AndWaitForPlayer1(with: playerReferences)

                    } else if (isPlayer0SlotFull && isPlayer1SlotFull) {

                        self.moveToNextGameSlot(referenceGameSlotList: referenceGameSlotList)

                        self.keepPlayer0AndWaitForPlayer1(with: playerReferences)

                    } else if (isPlayer0SlotFull && !isPlayer1SlotFull) {

                        self.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo(with: playerReferences)

                    } else if (!isPlayer0SlotFull && isPlayer1SlotFull) {

                        // TODO

                    }

                    referenceToAllGameSlots.child("lastSlot").setValue(["value": self.slotKey])

                }
        })
    }

    /*
     *
     */
    func keepPlayer0AndWaitForPlayer1 (with playerReferences:[DatabaseReference]) {

        let databaseReference = Database.database().reference()
        let referenceGameSlot = databaseReference.child("game/slots/list").child(String(self.slotKey))

        let player0SessionId = GameSession.makeNewSessionId()
        
        let isLocal = true

        // makes player 0 controller
        self.makePlayerController(playerNumber: 0, players: self.playerControllers, playerReference: playerReferences[0], /* oGamePlay.localPlayerTappedCardInHand, */ sessionId: player0SessionId, isLocal: isLocal)
        self.playerControllers[0].name = "Fox"
        
        // distributes cards to player 0
        distributeCardsToAvailablePlayers()
        
        let player0HandDictionary = Cards.getCardsAsNSDictionary(cards: self.playerControllers[0].hand)
        let restOfCardDictionary = Cards.getCardsAsNSDictionary(cards: self.restOfCards)

        referenceGameSlot.setValue([

            "player0": [

                "name": self.playerControllers[0].name,
                "hand": player0HandDictionary

                ] as NSDictionary,

            "player1": [:] as NSDictionary,
            
            "restOfCards": restOfCardDictionary

        ] as NSDictionary)

    }
    
    /*
     *
     */
    func okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo (with playerReferences:[DatabaseReference]) {
        
        let player0SessionId = GameSession.getSessionId()
        
        let player1SessionId = GameSession.getSessionId()
        
        let isLocal = true
        
        // makes player 0 controller
        self.makePlayerController(playerNumber: 0, players: self.playerControllers, playerReference: playerReferences[0], /* oGamePlay.localPlayerTappedCardInHand, */ sessionId: player0SessionId, isLocal: isLocal)
        self.playerControllers[0].name = "Fox"

        // makes player 1 controller
        self.makePlayerController(playerNumber: 1, players: self.playerControllers, playerReference: playerReferences[1], /* oGamePlay.localPlayerTappedCardInHand, */ sessionId: player1SessionId, isLocal: isLocal)
        self.playerControllers[1].name = "Turkey"

        playerReferences[1].setValue([

            "name": self.playerControllers[1].name,
            "hand": self.playerControllers[1].hand

            ] as NSDictionary
        )

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
    func makePlayerController(playerNumber:Int, players:[Player], playerReference:DatabaseReference, /*localPlayerWantsToPlayCard:func() {},*/ sessionId:String, isLocal:Bool) {

        let player:Player = Player(withNumber: playerNumber, reference: playerReference, sessionId: sessionId, isLocal: isLocal)

        self.playerControllers.append(player)

    }

    /*
     *
     */
    func distribute (cards:[Card], numPlayersAmongWhichToDistribute:Int) -> [[Card]] {

        var i:Int = 0;
        var distributedCards:[[Card]] = []

        for card in cards {

            for j in 0...numPlayersAmongWhichToDistribute {

                if (i % numPlayersAmongWhichToDistribute == j) {

                    if (distributedCards.count < j + 1) {

                        distributedCards.append([])

                    }

                    distributedCards[j].append(card)
                    break

                }
            }

            i = i + 1
        }

        return distributedCards
    }

    /*
     *
     */
    func distributeCardsToAvailablePlayers () {

        // distributes the cards to the local players
        let numPlayersAmongWhichToDistributeCards = self.numPlayers > 1 ? self.numPlayers : 2;
        var distributedCards = distribute(cards: self.shuffledCards, numPlayersAmongWhichToDistribute: numPlayersAmongWhichToDistributeCards)

        var i:Int = 0
        for player in self.playerControllers {

            player.hand = distributedCards[i]
            i = i + 1

        }

        if (distributedCards.count > i - 1) {

            self.restOfCards = distributedCards[i]

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
