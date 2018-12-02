//
//  Tools.swift
//  batanimal
//
//  Created by Marcin Jakubik on 21/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import UIKit

import os.log

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

    class func makeWigglePath () -> CGPath {

        let wigglePath:CGMutablePath = CGMutablePath.init()

        let p0 = CGPoint(x: 0.0, y: 0.0)
        let p1 = CGPoint(x:  -10.0, y: 0.0)
        let p2 = CGPoint(x:  10.0, y: 0.0)

        wigglePath.move(to: p0)
        wigglePath.addLine(to: p1)
        wigglePath.addLine(to: p2)
        wigglePath.closeSubpath()

        return wigglePath
    }
}
