//
//  GamePlay.swift
//  batanimal
//
//  Created by Marcin Jakubik on 22/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import FirebaseDatabase
import SpriteKit

import os.log

class GamePlay {

    var gamePlayDelegate:GamePlayProtocol!

    var numPlayers:Int = 0
    let maxNumPlayers:Int = 2
    var cards:[Card] = []
    var shuffledCards:[Card] =  []
    var slotIncrement:Int = 0
    var slotKey:String = ""
    var gameSlot:GameSlot?
    var playerReferences:[DatabaseReference] = []
    var playerControllers:[PlayerController] = []
    var restOfCards:[Card] = []

    let firstSlotNumber:String = "3"
    let maxNumberOfSlots = 3

    var topView:SKView
    var scene:SKScene
    var statusText:String

    let dontWaitButtonTop:CGFloat = 60
    let dontWaitButtonWidth:CGFloat = 80
    let statusTop:CGFloat = 100
    let statusWidth:CGFloat = 80
    let gameTop:CGFloat = 160
    let gameLeft:CGFloat = 20
    let playerHeight:CGFloat = 160
    
    let tableWidth:CGFloat = 120
    let handSpace:CGFloat = 20
    
    let cardSpace:CGFloat = 0
    
    // width:height ratio is 0.644
    let cardHeight:CGFloat = 176
    let cardWidth:CGFloat = 116

    var numMoves = 0

    enum GameState {
        case waitingToGatherCards
        case waitingToFillTable
        case waitingForFaceDownWarCard
        case gameOver
    }

    var gameState:GameState

    let wigglePath:CGPath = Tools.makeWigglePath()
    let wiggleAction:SKAction

    let log:OSLog

    init(topView:SKView, scene:SKScene, numPlayers:Int, cards:[Card], log:OSLog) {

        self.topView = topView
        self.scene = scene
        self.numPlayers = numPlayers
        self.cards = cards
        self.gameState = GameState.waitingToFillTable
        self.statusText = ""
        self.wiggleAction = SKAction.follow(wigglePath, asOffset: true, orientToPath: false, speed: 600)

        self.log = log

    }

    /*
     * gets the key of the last game slot from the list of slots from the remote database
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
     * updates the game when player wants to play a card, based on current state
     */
    func handlePlayerWantsToPlayACard(playerController:PlayerController, isEventLocal:Bool) {

        // only handles local events
        if (isEventLocal) {

            handleLocalPlayerWantsToPlayACard(for: playerController)

        }

        updateGameState()

    }

    /*
     * updates the game when local player wants to play a card, based on current state
     */
    func handleLocalPlayerWantsToPlayACard(for playerController:PlayerController) {

        switch self.gameState {

        case .waitingToFillTable:

            os_log("game state: %@", log:self.log, type:.debug, "waiting to fill table")

            // checks if the player already has a face-up card on the table
            if (playerController.doesPlayerHaveCardOnTableFaceUp()) {

                // wiggles card
                wiggleCardInHand(for: playerController)

            } else {

                // puts card on table
                playerController.putCardOnTable()

            }

            break

        case .waitingForFaceDownWarCard:

            os_log("game state: %@", log:self.log, type:.debug, "waiting for face down war card")

            // checks if player only has a face-up card on table
            if (playerController.doesPlayerHaveCardOnTableFaceUp()) {

                playerController.putCardOnTable()

            } else {

                wiggleCardInHand(for: playerController)

            }
            break

        case .waitingToGatherCards:

            os_log("game state: %@", log:self.log, type:.debug, "waiting to gather cards")

            gatherCards()
            self.numMoves = self.numMoves + 1

            break

        default:

            break

        }

    }

    /*
     * Moves the table cards to the hand of the player that won the turn.
     * Or waits for more cards on the table in case of a tie.
     */
    func gatherCards() {

        var winningPlayerNumber:Int = -1

        // decides what to do if all players have played
        if (doAllPlayersHaveSameNumberOfCardsOnTable() && self.gameState == .waitingToGatherCards) {

            winningPlayerNumber = self.gamePlayDelegate.whoseCardWins()

            // checks if player 0 won the hand
            if (winningPlayerNumber == 0) {

                // every five moves, randomly switches order of the gathered cards
                if (numMoves % 5 == 0 && Int.random(in: 0..<10) < 5) {

                    // moves everyone's cards to the winner's hand, player 1 first
                    self.playerControllers[0].moveTableCardsToHand(fromPlayer: self.playerControllers[1])
                    self.playerControllers[0].moveTableCardsToHand(fromPlayer: self.playerControllers[0])

                } else {

                    // moves everyone's cards to the winner's hand, player 0 first
                    self.playerControllers[0].moveTableCardsToHand(fromPlayer: self.playerControllers[0])
                    self.playerControllers[0].moveTableCardsToHand(fromPlayer: self.playerControllers[1])

                }

            } else if (winningPlayerNumber == 1) {

                // player 1 won the hand

                if (numMoves % 5 == 0 && Int.random(in: 0..<10) < 5) {

                    // moves everyone's cards to the winner's hand, player 0 first
                    self.playerControllers[0].moveTableCardsToHand(fromPlayer: self.playerControllers[0])
                    self.playerControllers[0].moveTableCardsToHand(fromPlayer: self.playerControllers[1])

                } else {

                    // moves everyone's cards to the winner's hand, player 1 first
                    self.playerControllers[0].moveTableCardsToHand(fromPlayer: self.playerControllers[1])
                    self.playerControllers[0].moveTableCardsToHand(fromPlayer: self.playerControllers[0])

                }

            }

            self.gameState = .waitingToFillTable

        }

    }

    /*
     * Checks table to see if it's a war, or if it's time to gather cards.
     */
    func updateGameState() {

        // checks if the players have the same number of cards on the table
        if (doAllPlayersHaveSameNumberOfCardsOnTable()) {

            if (playerControllers[0].doesPlayerHaveCardOnTableFaceDown()) {

                // assumes both players need to play another card
                self.gameState = .waitingToFillTable

            } else if (playerControllers[0].doesPlayerHaveCardOnTableFaceUp()
                    && doPlayersHaveSameCardOnTable()) {

                // assumes both players have the same face-up card (starts war)
                playWarSound()
                self.gameState = .waitingForFaceDownWarCard

            } else {

                // assumes one player has a winning card
                self.gameState = .waitingToGatherCards

                // checks if the game is finished
                if (isGameOver()) {

                    endGame()

                }

            }

        } else if (playerControllers.count > 1 // TODO: protect this array access using swift style
                && playerControllers[0].getTable().count == 0
                && playerControllers[1].getTable().count == 0) {

            // assumes the players have no cards on the table
            self.gameState = .waitingToFillTable
            
        }

    }

    /*
     * if there is more than one player, returns true if all have same number of cards on the table; otherwise false
     */
    func doAllPlayersHaveSameNumberOfCardsOnTable() -> Bool {

        var doAllPlayersHaveSameNumberOfCardsOnTable:Bool = false

        if (playerControllers.count > 1) {

            let player0TableCount = playerControllers[0].getTable().count
            let player1TableCount = playerControllers[1].getTable().count

            doAllPlayersHaveSameNumberOfCardsOnTable = (player0TableCount == player1TableCount)

        }

        return doAllPlayersHaveSameNumberOfCardsOnTable

    }

    /*
     * returns true if players 0 and 1 have the same value of card on the table
     */
    func doPlayersHaveSameCardOnTable() -> Bool {

        var doPlayersHaveSameCardOnTable:Bool = false

        if let player0Card = playerControllers[0].getTopCardOnTable() {

            if let player1Card = playerControllers[1].getTopCardOnTable() {

                doPlayersHaveSameCardOnTable = (player0Card.value == player1Card.value)

            }

        }

        return doPlayersHaveSameCardOnTable

    }

    /*
     * wiggles a card
     */
    func wiggleCardInHand(for playerController:PlayerController) {

        if playerController.getHand().count > 0 {

            let topCard = playerController.getHand()[0]
            let cardNode = playerController.node.childNode(withName: topCard.getId())
            if let existingCardNode:CardNode = cardNode as? CardNode {

                existingCardNode.run(wiggleAction)

            }

        }

    }

    /*
     * checks if a player won the game
     */
    func isGameOver() -> Bool {

        var isGameOver:Bool = false
        var winningPlayerNumber:Int

        if (self.playerControllers.count < 2) {
            return isGameOver
        }

        if (self.playerControllers[0].doesPlayerHaveCardOnTable() && self.playerControllers[1].doesPlayerHaveCardOnTable()) {

            winningPlayerNumber = self.gamePlayDelegate.whoseCardWins()

            // checks if the other player's hand is empty
            for i in 0 ... self.playerControllers.count - 1 {

                if (i != winningPlayerNumber) {

                    if (self.playerControllers[i].getHand().count == 0) {

                        isGameOver = true
                        self.gameState = GameState.gameOver
                        self.statusText = self.playerControllers[winningPlayerNumber].getName() + " wins"
                        self.renderStatus()

                    }

                }

            }

        }

        return isGameOver

    }

    /*
     * ends the game
     */
    func endGame() {

        self.statusText = "someone won"
        renderStatus()

    }

    /*
     * gets the last used game slot from the remote database
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
     * creates a new game slot on the remote database
     */
    func moveToNextGameSlot (referenceGameSlotList:DatabaseReference) {

        let referenceGameSlot:DatabaseReference = referenceGameSlotList.childByAutoId()

        let myGameSlot = ["player0": ["name" : "_new_" as AnyObject]]

        referenceGameSlot.setValue(myGameSlot)

        self.slotKey = referenceGameSlot.key

        self.playerReferences.removeAll()
        self.playerReferences.append(referenceGameSlot.child("player0"))
        self.playerReferences.append(referenceGameSlot.child("player1"))

    }

    /*
     * finds an available game slot in the remote database and sets up the game there
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

                    for i in 0...(self.maxNumPlayers - 1) {

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

                        self.makePlayer0()

                    } else if (isPlayer0SlotFull && isPlayer1SlotFull) {

                        self.moveToNextGameSlot(referenceGameSlotList: referenceToGameSlotList)

                        self.makePlayer0()

                    } else if (isPlayer0SlotFull && !isPlayer1SlotFull) {

                        // TODO: check here if player 1 is local

                        self.makePlayer1(isPlayer1Local: true)

                    } else if (!isPlayer0SlotFull && isPlayer1SlotFull) {

                        // TODO

                    }

                    referenceToAllGameSlots.child("lastSlot").setValue(["value": self.slotKey])
                    self.setUpHandlerForRemotePlayerEvents()

                }
        })
    }

    /*
     * makes a model, view and controller for player 0;
     */
    func makePlayer0 () {

        let databaseReference = Database.database().reference()
        let referenceGameSlot = databaseReference.child("game/slots/list").child(String(self.slotKey))

        let player0SessionId = GameSession.makeNewSessionId()

        let isPlayer0Local = true

        // makes player 0 view and controller
        gamePlayDelegate.makePlayerViewAndController(initializedPlayer: nil, playerNumber: 0, playerSessionId: player0SessionId, isPlayerLocal: isPlayer0Local, playerTop: self.gameTop + self.playerHeight, playerName: "Fox")

        // distributes cards to player 0
        distributeCardsToAvailablePlayers()

        let player0HandDictionary = Cards.getCardsAsNSDictionary(cards: self.playerControllers[0].getHand())
        let restOfCardDictionary = Cards.getCardsAsNSDictionary(cards: self.restOfCards)

        referenceGameSlot.setValue([

            "player0": [

                "name": self.playerControllers[0].getName(),
                "hand": player0HandDictionary,
                "sessionId": player0SessionId

                ] as NSDictionary,

            "player1": [:] as NSDictionary,

            "restOfCards": restOfCardDictionary

        ] as NSDictionary)

        // renders cards of all players (TODO: overkill; we only need player 0)
        renderCards()

        self.statusText = "waiting for player 2"
        renderStatus()

    }

    /*
     * makes a view and controller for player 1;
     * does nothing if there is no player 0 model yet
     */
    func makePlayer1 (isPlayer1Local:Bool) {

        let player1SessionId = GameSession.getSessionId()

        // TODO: do we have a valid player0 from the remote slot at this point?

        if let player0 = self.gameSlot?.player0 {

            let isPlayer0Local = GameSession.isLocal(player: player0)

            // makes player 0 view and controller
            gamePlayDelegate.makePlayerViewAndController(initializedPlayer: player0, playerNumber: -1, playerSessionId: "", isPlayerLocal: isPlayer0Local, playerTop: self.gameTop + self.playerHeight, playerName: "Fox")

            // makes player 1 view and controller
            // TODO: what if we have a remote player1 model already here?
            gamePlayDelegate.makePlayerViewAndController(initializedPlayer: nil, playerNumber: 1, playerSessionId: player1SessionId, isPlayerLocal: isPlayer1Local, playerTop: self.gameTop, playerName: "Turkey")

            if let restOfCards = self.gameSlot?.restOfCards {

                self.playerControllers[1].setHand(hand: restOfCards)

            }

            let player1HandDictionary = Cards.getCardsAsNSDictionary(cards: self.playerControllers[1].getHand())

            playerReferences[1].setValue([

                "name": self.playerControllers[1].getName(),
                "hand": player1HandDictionary,
                "sessionId": player1SessionId

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

        self.statusText = "game on"
        renderStatus()

        hideDontWaitButton()

    }

    /*
     *
     */
    func setUpHandlerForRemotePlayerEvents() {

        for playerNumber in 0...(maxNumPlayers - 1) {

            self.playerReferences[playerNumber].observe(

                DataEventType.value,
                with: {(snapshot) in

                    self.handleRemotePlayerEvents(for: playerNumber, snapshot: snapshot)

            })

        }

    }

    /*
     *
     */
    func handleRemotePlayerEvents(for playerNumber:Int, snapshot:DataSnapshot) {

        if let playerDict = snapshot.value as? [String:AnyObject] {

            let remotePlayer = Player(withNumber: playerNumber, playerDictionary: playerDict)

            // sets name
            self.playerControllers[playerNumber].setName(name: remotePlayer.name)

            // sets hand
            self.playerControllers[playerNumber].setHand(hand: remotePlayer.hand)

            // sets table
            self.playerControllers[playerNumber].setTable(table: remotePlayer.table)

            // indicates that a player wants to play a card so the game can update itself
            self.handlePlayerWantsToPlayACard(playerController: self.playerControllers[playerNumber], isEventLocal: false)

        }

    }

    /*
     * handles Dont Wait press
     */
    func handleButtonPressed () {

        os_log("dont wait button pressed", log:self.log, type:.debug)
        hideDontWaitButton()

    }

    /*
     * hides the Dont Wait button
     */
    func hideDontWaitButton () {

        os_log("removing dont wait button", log:self.log, type:.debug)

    }

    /*
     * plays a war sound
     */
    func playWarSound () {

        var soundFileName = "tiger-growl.wav"

        if let card:Card = playerControllers[0].getTopCardOnTable() {

            switch card.value {

            case 1:

                soundFileName = "hamster-wheel.wav"

            case 2:

                soundFileName = "rabbit-crunch.wav"

            case 3:

                soundFileName = "cat-meow.wav"

            case 4:

                soundFileName = "dog-bark.wav"

            case 5:

                soundFileName = "tiger-growl.wav"

            case 6:

                soundFileName = "elephant.wav"

            default:

                soundFileName = "tiger-growl.wav"

            }

            SKAction.playSoundFileNamed(soundFileName, waitForCompletion: false)

        }

    }

    /*
     * renders the cards in the scene
     */
    func renderCards () {

        for player in self.playerControllers {

            player.renderHand()

        }

    }

    /*
     * renders the status
     */
    func renderStatus () {


    }

    /*
     * distributes cards from the given array into the given number of mutliple arrays
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
     * distributes cards to all players that have joined the game
     * (those that have player controllers);
     * keeps the rest in restOfCards
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
     * shows the scene
     */
    func showScene() {

        // makes a background sprite
        let backgroundFileName = "background.png"
        let backgroundTexture = SKTexture(imageNamed: backgroundFileName)
        let backgroundNode = SKSpriteNode(
            texture: backgroundTexture,
            size: self.scene.size
        )
        backgroundNode.position = CGPoint(
            x: self.scene.size.width / 2,
            y: self.scene.size.height / 2
        )
        self.scene.addChild(backgroundNode)

        // makes a status box
        let statusNode = SKLabelNode(fontNamed: "Monaco")
        statusNode.position = CGPoint(
            x: self.scene.size.width / 2,
            y: self.statusTop
        )
        
        self.scene.addChild(statusNode)
        
        // makes a dont wait button
        let buttonPosition = CGPoint(
            x: self.scene.size.width / 2,
            y: self.dontWaitButtonTop
        )
        let dontWaitButton = ButtonNode(withLabel: "Don't Wait", position: buttonPosition, controller: self)
        self.scene.addChild(dontWaitButton)

        // shows the scene
        self.topView.presentScene(self.scene)

    }

    /*
     * starts the game
     */
    func startGame (shuffleCards:Bool) {

        if shuffleCards {

            self.shuffledCards = Tools.shuffle(things: self.cards)

        } else {

            self.shuffledCards = self.cards

        }

        setUpRemoteGameSlot()

        showScene()

    }

}
