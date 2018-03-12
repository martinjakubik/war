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

        self.playerControllers.append(Player(withNumber: playerNumber, sessionId: sessionId, isLocal: isLocal))

    }
    
}
