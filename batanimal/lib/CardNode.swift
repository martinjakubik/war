//
//  CardNode.swift
//  batanimal
//
//  Created by Marcin Jakubik on 22/07/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import SpriteKit

class CardNode : SKSpriteNode {

    var id:String = ""

    /*
     * makes an image filename from a small ID
     */
    class func makeImageFilename (fromId:String) -> String {
        
        let cardPrefix = "card"
        let gameTag = "batanimo"
        let graphicExtension = "png"
        
        let imageName = cardPrefix + "-" + gameTag + "-" + fromId + "." + graphicExtension
        
        return imageName
        
    }
    
    /*
     *
     */
    init(id:String) {

        let imageFilename = CardNode.makeImageFilename(fromId: id)
        let texture:SKTexture = SKTexture(imageNamed: imageFilename)
        super.init(texture: texture, color: UIColor.clear, size: texture.size())

    }

    /*
     *
     */
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

}
