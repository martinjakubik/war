//: Playground - noun: a place where people can play

import UIKit

let maxNumberOfGameSlots = 3

let firstSlot = 3

var currentSlot = firstSlot
var increment = 0

var counter = 0

while counter < 10 {

    print(currentSlot)
    
    increment = (increment + 1) % maxNumberOfGameSlots
    currentSlot = firstSlot + increment

    counter = counter + 1
}
