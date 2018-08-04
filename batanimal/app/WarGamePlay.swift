//
//  WarGamePlay.swift
//  batanimal
//
//  Created by Marcin Jakubik on 07/03/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import FirebaseDatabase
import SpriteKit

class WarGamePlay:GamePlay {

    /*
     *
     */
    override func makePlayerController(playerNumber:Int, playerReference:DatabaseReference, /*localPlayerWantsToPlayCard:func() {},*/ sessionId:String, isPlayerLocal:Bool, playerNode:SKNode) {

        let player:PlayerController = PlayerController(withNumber: playerNumber, reference:playerReference, sessionId: sessionId, isLocal: isPlayerLocal, node:playerNode)

        self.playerControllers.append(player)

    }

}
