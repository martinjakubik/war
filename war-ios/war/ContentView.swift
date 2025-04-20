//
//  ContentView.swift
//  war
//
//  Created by JAKUBIK, Martin on 20/04/2025.
//

import SwiftUI
import SpriteKit

struct ContentView: View {
    var body: some View {
        let gameBox = GameBox(viewSize: CGSize(width: 400, height: 700))
        let gameScene: SKScene = gameBox.go()
        SpriteView(scene: gameScene)
    }
}

#Preview {
    ContentView()
}
