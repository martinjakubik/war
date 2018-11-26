//
//  GamePlayProtocol.swift
//  batanimal
//
//  Created by Marcin Jakubik on 26/11/2018.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import UIKit

protocol GamePlayProtocol {

    func makePlayerViewAndController(initializedPlayer:Player?, playerNumber:Int, playerSessionId:String, isPlayerLocal:Bool, playerTop:CGFloat, playerName:String)

    func whoseCardWins() -> Int

}
