import SpriteKit
import PlaygroundSupport

let view:SKView = SKView(frame: CGRect(x: 0, y: 0, width: 1024, height: 768))
PlaygroundPage.current.liveView = view

let scene:SKScene = SKScene(size: view.frame.size)

let backgroundFileName = "background.png"
let backgroundTexture = SKTexture(imageNamed:  backgroundFileName)
let backgroundNode = SKSpriteNode(
    texture: backgroundTexture,
    size: scene.size
)
backgroundNode.position = CGPoint(
    x: scene.size.width / 2,
    y: scene.size.height / 2
)
backgroundNode.lightingBitMask = 0b0001
scene.addChild(backgroundNode)

let cardWidth:CGFloat = 160
let cardHeight:CGFloat = 240
let cardPoint = CGPoint(
    x: scene.size.width / 2,
    y: scene.size.height / 2
)
let halfCardWidth:CGFloat = cardWidth / 2
let halfCardHeight:CGFloat = cardHeight / 2
let borderWidth:CGFloat = 8
let zPosition:CGFloat = 1

let shapeNode = SKShapeNode(
    rect: CGRect(
        x: (cardPoint.x - halfCardWidth) - borderWidth,
        y: (cardPoint.y - halfCardHeight) - borderWidth,
        width: cardWidth + (borderWidth * 2),
        height: cardHeight + (borderWidth * 2)),
    cornerRadius: 9.0
)
shapeNode.fillColor = UIColor.white
shapeNode.zPosition = zPosition

// makes the card sprite
let cardFileName = "card-batanimo-1a.png"
let cardTexture = SKTexture(imageNamed: cardFileName)
let cardNode = SKSpriteNode(
    texture: cardTexture,
    size: CGSize(
        width: cardWidth,
        height: cardHeight
))

cardNode.position = cardPoint
cardNode.lightingBitMask = 0b0001
cardNode.shadowCastBitMask = 0b0001

shapeNode.addChild(cardNode)
scene.addChild(shapeNode)

// makes a light
let sceneLight = SKLightNode()
sceneLight.isEnabled = true
sceneLight.position = CGPoint(
    x: scene.size.width / 2,
    y: scene.size.height / 2
)
sceneLight.ambientColor = .white
sceneLight.lightColor = .white
sceneLight.shadowColor = .black
sceneLight.falloff = 1
sceneLight.categoryBitMask = 0b0001
scene.addChild(sceneLight)

view.presentScene(scene)

