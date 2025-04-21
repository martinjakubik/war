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
        GeometryReader {geometry in
            let gameBox = GameBox(viewSize: geometry.size)
            let gameScene: SKScene = gameBox.go()
            SpriteView(scene: gameScene)
        }
    }
}

#Preview {
    ContentView()
}
