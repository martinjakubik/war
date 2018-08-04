//
//  GamePlay.swift
//  batanimal
//
//  Created by Marcin Jakubik on 22/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import FirebaseDatabase
import os.log
import SpriteKit

class GamePlay {

    var numPlayers:Int = 0
    var cards:[Card] = []
    var shuffledCards:[Card] =  []
    var slotIncrement:Int = 0
    var slotKey:String = ""
    var gameSlot:GameSlot?
    var playerNames:[String] = []
    var playerReferences:[DatabaseReference] = []
    var playerControllers:[PlayerController] = []
    var restOfCards:[Card] = []

    let firstSlotNumber:String = "3"
    let maxNumberOfSlots = 3

    var topView:SKView
    var scene:SKScene
    
    var gameTop:CGFloat
    var gameLeft:CGFloat
    var playerHeight:CGFloat

    init(topView:SKView, scene:SKScene, numPlayers:Int, cards:[Card], playerNames:[String], gameTop:CGFloat, gameLeft:CGFloat, playerHeight:CGFloat) {

        self.topView = topView
        self.scene = scene
        self.numPlayers = numPlayers
        self.cards = cards
        self.playerNames = playerNames
        self.gameTop = gameTop
        self.gameLeft = gameLeft
        self.playerHeight = playerHeight

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
    func getLastGameSlot (allGameSlots:[String:AnyObject]) -> GameSlot {

        var lastGameSlot:GameSlot = GameSlot(withDictionary:[:], scene: self.scene, gameTop:self.gameTop, gameLeft:self.gameLeft, playerHeight:self.playerHeight)

        // gets the content of the current game slot
        if let gameSlotList = allGameSlots["list"] as? [String:AnyObject] {

            let slotKey = GamePlay.getLastGameSlotKey(allGameSlots: allGameSlots)

            if let singleSlotDictionary = gameSlotList[slotKey] as? [String:AnyObject] {

                lastGameSlot = GameSlot(withDictionary:singleSlotDictionary, scene: self.scene, gameTop:self.gameTop, gameLeft:self.gameLeft, playerHeight:self.playerHeight)

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
                    self.gameSlot = self.getLastGameSlot(allGameSlots: allGameSlots)

                    for i in 0...1 {

                        let playerReference = referenceToAllGameSlots.child("list").child(String(self.slotKey)).child("player" + String(i))

                        self.playerReferences.append(playerReference)

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

                        self.keepPlayer0AndWaitForPlayer1()

                    } else if (isPlayer0SlotFull && isPlayer1SlotFull) {

                        self.moveToNextGameSlot(referenceGameSlotList: referenceToGameSlotList)

                        self.keepPlayer0AndWaitForPlayer1()

                    } else if (isPlayer0SlotFull && !isPlayer1SlotFull) {

                        // TODO: check here if player 1 is local

                        self.okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo(isPlayer1Local: true)

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
    func keepPlayer0AndWaitForPlayer1 () {

        let databaseReference = Database.database().reference()
        let referenceGameSlot = databaseReference.child("game/slots/list").child(String(self.slotKey))

        let player0SessionId = GameSession.makeNewSessionId()

        let isPlayer0Local = true

        // makes player 0 view
        let player0Node = SKNode()
        player0Node.position = CGPoint(x: self.gameLeft, y: self.gameTop)
        self.scene.addChild(player0Node)

        // makes player 0 controller
        let player0 = Player(withNumber: 0, sessionId:player0SessionId)
        let player0Controller = PlayerController(player: player0, reference: self.playerReferences[0], isLocal: isPlayer0Local, node: player0Node)
        self.playerControllers.append(player0Controller)
        self.playerControllers[0].setName(name: "Fox")

        // distributes cards to player 0
        distributeCardsToAvailablePlayers()

        let player0HandDictionary = Cards.getCardsAsNSDictionary(cards: self.playerControllers[0].getHand())
        let restOfCardDictionary = Cards.getCardsAsNSDictionary(cards: self.restOfCards)

        referenceGameSlot.setValue([

            "player0": [

                "name": self.playerControllers[0].getName(),
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
    func okPlayer1JoinedAndPlayer0WasWaitingSoLetsGo (isPlayer1Local:Bool) {

        let player0SessionId = GameSession.getSessionId()

        let player1SessionId = GameSession.getSessionId()

        // TODO: do we have a valid player0 from the remote slot at this point?

        if let player0Value = self.gameSlot?.player0 {

            let isPlayer0Local = GameSession.isLocal(player: player0Value)

            // makes player 0 view
            let player0Node = SKNode()
            player0Node.position = CGPoint(x:self.gameLeft, y:self.gameTop)
            self.scene.addChild(player0Node)

            // makes player 0 controller
            let player0 = Player(withNumber: 0, sessionId:player0SessionId)
            let player0Controller = PlayerController(player: player0, reference: self.playerReferences[0], isLocal: isPlayer0Local, node: player0Node)
            self.playerControllers.append(player0Controller)
            self.playerControllers[0].setName(name: "Fox")

            // makes player 1 view
            let player1Node = SKNode()
            player1Node.position = CGPoint(x:self.gameLeft, y:self.gameTop + self.playerHeight)
            self.scene.addChild(player1Node)

            // makes player 1 controller
            let player1 = Player(withNumber: 1, sessionId:player1SessionId)
            let player1Controller = PlayerController(player: player1, reference: self.playerReferences[1], isLocal: isPlayer1Local, node: player1Node)
            self.playerControllers.append(player1Controller)
            self.playerControllers[1].setName(name: "Turkey")

            if let restOfCards = self.gameSlot?.restOfCards {

                self.playerControllers[1].setHand(hand: restOfCards)

            }

            let player1HandDictionary = Cards.getCardsAsNSDictionary(cards: self.playerControllers[1].getHand())

            playerReferences[1].setValue([

                "name": self.playerControllers[1].getName(),
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
        for playerController in self.playerControllers {

            playerController.setHand(hand: distributedCards[i])
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

        setUpRemoteGameSlot()

        self.topView.presentScene(self.scene)

    }
}
