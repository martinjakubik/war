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
    func shuffle (things:[AnyObject]) -> [AnyObject] {
        
        var shuffledThings:[AnyObject] = []
        var copyThings = things
        var n:Int
        
        while (things.count > 0) {
            
            n = Int(arc4random_uniform(UInt32(things.count)))
            shuffledThings.append(copyThings.remove(at: n))
            
        }
        
        return shuffledThings
    };

}
