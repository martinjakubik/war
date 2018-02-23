//
//  CardView.swift
//  batanimal
//
//  Created by Marcin Jakubik on 22/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import Foundation
import UIKit

class CardView:UIImageView {
    
    var id:String = ""

    init(id:String, frame:CGRect) {
        
        super.init(frame:frame)
        
        let imageFilename = makeImageFilename(fromId: id)
        
        if let image:UIImage = UIImage(named:imageFilename) {

            self.image = image
            
        }

        self.layer.borderWidth = 1
        self.layer.borderColor = UIColor.black.cgColor

    }
    
    func makeImageFilename (fromId:String) -> String {
        
        let cardPrefix = "card"
        let gameTag = "batanimo"
        let graphicExtension = "png"
        
        let imageName = cardPrefix + "-" + gameTag + "-" + fromId + "." + graphicExtension
        
        return imageName

    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

}
