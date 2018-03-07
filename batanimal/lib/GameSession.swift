//
//  GameSession.swift
//  batanimal
//
//  Created by Marcin Jakubik on 07/03/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation

class GameSession {

    static let sessionKey = "sessionId"
    
    /*
     * makes a new ID for the session (ie. this is the first player to join)
     */
    class func makeNewSessionId() -> String {

        let sessionId:String = Tools.generateId()
        UserDefaults.standard.set(sessionId, forKey: sessionKey)

        return sessionId

    }

    /*
     * gets the session Id; creates a new one if none exists
     */
    class func getSessionId() -> String {

        if let value = UserDefaults.standard.string(forKey: sessionKey) {

            return value

        } else {

            return makeNewSessionId()

        }

    }
}
