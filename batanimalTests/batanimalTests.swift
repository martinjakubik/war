//
//  batanimalTests.swift
//  batanimalTests
//
//  Created by Marcin Jakubik on 20/02/18.
//  Copyright © 2018 martin jakubik. All rights reserved.
//

import XCTest
@testable import batanimal

class batanimalTests: XCTestCase {
    
    override func setUp() {
        super.setUp()
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
    }
    
    func testGetRandomPlayerName() {

        let expected:Bool = false

        for _ in 1...50 {
            let randomPlayerName = GameBox.getRandomPlayerName(notThis: "Albatross")
            let actual = (randomPlayerName == "Albatross")
            XCTAssert((expected == actual), "random player name returned unwanted name")
        }

    }
    
    func testPerformanceExample() {
        // This is an example of a performance test case.
        self.measure {
            // Put the code you want to measure the time of here.
        }
    }
    
}
