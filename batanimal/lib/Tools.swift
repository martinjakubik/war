//
//  Tools.swift
//  batanimal
//
//  Created by Marcin Jakubik on 21/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation

class Tools {
    
    /*
     * shuffles a set of things
     */
    class func shuffle<T> (things:[T]) -> [T] {
        
        var shuffledThings:[T] = []
        var copyThings = things
        var n:Int
        
        while (copyThings.count > 0) {
            
            n = Int(arc4random_uniform(UInt32(copyThings.count)))
            shuffledThings.append(copyThings.remove(at: n))
            
        }
        
        return shuffledThings
    };

    /*
     * generates a readable Id
     */
    class func generateId () -> String {

        func s4 () -> UInt32 {

            let n = arc4random_uniform(9999)
            return n

        }
        
        let id = String(s4()) + "-" + String(s4())

        return id

    }

}
