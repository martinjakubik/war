//
//  WarGamePlay.swift
//  batanimal
//
//  Created by Marcin Jakubik on 07/03/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import FirebaseDatabase

class WarGamePlay:GamePlay {

    /*
     *
     */
    override func makePlayerController(playerNumber:Int, players:[Player], playerReference:DatabaseReference, /*localPlayerWantsToPlayCard:func() {},*/ sessionId:String, isLocal:Bool) {

        let player:Player = Player(withNumber: playerNumber, reference:playerReference, sessionId: sessionId, isLocal: isLocal)

        self.playerControllers.append(player)

    }

}
