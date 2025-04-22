//
//  GameDimensions.swift
//  war
//
//  Created by JAKUBIK, Martin on 22/04/2025.
//

import Foundation

struct Spacing {
    let top: CGFloat
    let right: CGFloat
    let bottom: CGFloat
    let left: CGFloat
}

struct GameDimensions {
    let cardSize: CGSize
    let cardMargin: Spacing
    let cardPadding: Spacing
    let playerSize: CGSize
    let playerMargin: Spacing
    let playerPadding: Spacing
    let tableMargin: Spacing
    let handMargin: Spacing
    let gameSize: CGSize
    let gameMargin: Spacing
    let gamePadding: Spacing
    let gamePosition: CGPoint
    
    init (cardSize: CGSize, cardMargin: Spacing, cardPadding: Spacing, playerSize: CGSize, playerMargin: Spacing, playerPadding: Spacing, tableMargin: Spacing, handMargin: Spacing, gameSize: CGSize, gameMargin: Spacing, gamePadding: Spacing, gamePosition: CGPoint) {
        self.cardSize = cardSize
        self.cardMargin = cardMargin
        self.cardPadding = cardPadding
        self.playerSize = playerSize
        self.playerMargin = playerMargin
        self.playerPadding = playerPadding
        self.tableMargin = tableMargin
        self.handMargin = handMargin
        self.gameSize = gameSize
        self.gameMargin = gameMargin
        self.gamePadding = gamePadding
        self.gamePosition = gamePosition
    }
}
