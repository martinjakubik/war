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
        
        let referenceToGameSlotList = databaseReference.child("game/slots/list")

        referenceToAllGameSlots.observeSingleEvent(

            of: DataEventType.value,
            with: {(snapshot) in

                if let allGameSlots = snapshot.value as? [String:AnyObject] {

                    self.slotKey = GamePlay.getLastGameSlotKey(allGameSlots: allGameSlots)

                    // TODO: do we have everything we need from the remote game slot here? ie. the restofcards and stuff?
                    self.gameSlot = GamePlay.getLastGameSlot(allGameSlots: allGameSlots)
                    
                    var playerReferences:[DatabaseReference] = []

                    for i in 0...1 {

                        let playerReference = referenceToAllGameSlots.child("list").child(String(self.slotKey)).child("player" + String(i))

                        playerReferences.append(playerReference)

                    }

                    let isPlayer0SlotFull:Bool
                    let isPlayer1SlotFull:Bool
                    if let gameSlot = self.gameSlot {

                        isPlayer0SlotFull = gameSlot.player0 != nil
                        isPlayer1SlotFull = gameSlot.player1 != nil

                    } else {

                        isPlayer0SlotFull = false
                        isPlayer1SlotFull = false

                    }

                    if (!isPlayer0SlotFull && !isPlayer1SlotFull) {

                        self.keepPlayer0AndWaitForPlayer1(with: playerReferences)

                    } else if (isPlayer0SlotFull && isPlayer1SlotFull) {

                        self.moveToNextGameSlot(referenceGameSlotList: referenceToGameSlotList)

                        self.keepPlayer0AndWaitForPlayer1(with: playerReferences)

                    } else if (isPlayer0SlotFull && !isPlayer1SlotFull) {

                        let player1View = UIView()
                        self.view.addSubview(player1View)

                        let player1Value = Player(withNumber: 1, playerDictionary: ["name":"_new_" as AnyObject], view: player1View)

                        self.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo(with: playerReferences, player1Value: player1Value)

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

        // makes player 0 view
        let player0View = UIView()
        self.view.addSubview(player0View)

        // makes player 0 controller
        self.makePlayerController(playerNumber: 0, players: self.playerControllers, playerReference: playerReferences[0], /* oGamePlay.localPlayerTappedCardInHand, */ sessionId: player0SessionId, isLocal: isLocal, playerView: player0View)
        self.playerControllers[0].name = "Fox"
        
        // distributes cards to player 0
        distributeCardsToAvailablePlayers()
        
        let player0HandDictionary = Cards.getCardsAsNSDictionary(cards: self.playerControllers[0].getHand())
        let restOfCardDictionary = Cards.getCardsAsNSDictionary(cards: self.restOfCards)

        referenceGameSlot.setValue([

            "player0": [

                "name": self.playerControllers[0].name,
                "hand": player0HandDictionary

                ] as NSDictionary,

            "player1": [:] as NSDictionary,
            
            "restOfCards": restOfCardDictionary

        ] as NSDictionary)

        // renders cards of all players (TODO: overkill; we only need player 0)
        renderCards()

    }
    
    /*
     *
     */
    func okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo (with playerReferences:[DatabaseReference], player1Value:Player) {
        
        let player0SessionId = GameSession.getSessionId()
        
        let player1SessionId = GameSession.getSessionId()
        
        // TODO: do we have a valid player0 from the remote slot at this point?
        
        if let player0Value = self.gameSlot?.player0 {

            let isPlayer0Local = GameSession.isLocal(player: player0Value)

            // makes player 0 view
            let player0View = UIView()
            self.view.addSubview(player0View)

            // makes player 0 controller
            self.makePlayerController(playerNumber: 0, players: self.playerControllers, playerReference: playerReferences[0], /* oGamePlay.localPlayerTappedCardInHand, */ sessionId: player0SessionId, isLocal: isPlayer0Local, playerView: player0View)
            self.playerControllers[0].name = "Fox"

            var isPlayer1Local = true
            if player1Value.name != "_new_" {
                isPlayer1Local = false
            }

            // makes player 1 view
            let player1View = UIView()
            self.view.addSubview(player1View)

            // makes player 1 controller
            self.makePlayerController(playerNumber: 1, players: self.playerControllers, playerReference: playerReferences[1], /* oGamePlay.localPlayerTappedCardInHand, */ sessionId: player1SessionId, isLocal: isPlayer1Local, playerView: player1View)
            self.playerControllers[1].name = "Turkey"
            
            if let restOfCards = self.gameSlot?.restOfCards {

                self.playerControllers[1].hand = restOfCards

            }
            
            let player1HandDictionary = Cards.getCardsAsNSDictionary(cards: self.playerControllers[1].getHand())

            playerReferences[1].setValue([

                "name": self.playerControllers[1].name,
                "hand": player1HandDictionary

                ] as NSDictionary
            )

            // cleans rest of cards from remote database
            let databaseReference = Database.database().reference()
            let referenceGameSlot = databaseReference.child("game/slots/list").child(String(self.slotKey))
            let referenceRestOfCards = referenceGameSlot.child("restOfCards")
            referenceRestOfCards.removeValue()

        }

        // renders cards of all players (TODO: overkill; we only need player 1)
        renderCards()

    }
    
    /*
     *
     */
    func renderCards () {

        for player in self.playerControllers {

            player.renderHand()

        }

    }

    /*
     *
     */
    func makePlayerController(playerNumber:Int, players:[Player], playerReference:DatabaseReference, /*localPlayerWantsToPlayCard:func() {},*/ sessionId:String, isLocal:Bool, playerView:UIView) {

        let player:Player = Player(withNumber: playerNumber, reference: playerReference, sessionId: sessionId, isLocal: isLocal, view: playerView)

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
