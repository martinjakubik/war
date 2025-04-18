#!/bin/bash

if [[ ! -d build ]] ; then
    mkdir build
fi

inkscape resources-src/card-batanimo.svg -i layer38 -j -C --export-png=build/border.png
inkscape resources-src/card-batanimo.svg -i layer39 -j -C --export-png=build/shadow.png
inkscape resources-src/card-batanimo.svg -i layer41 -j -C --export-png=build/measure.forhtml.png --export-area=11:20:228:358
inkscape resources-src/card-batanimo.svg -i layer41 -j -C --export-png=build/measure.forswift.png

# regular cards
for layerId in {1..36}; do
    label=$(xmllint --xpath "string(/*[local-name() = 'svg']/*[local-name() = 'g'][@*[local-name() = 'id'] = 'layer${layerId}']/@*[local-name() = 'label'])"  resources-src/card-batanimo.svg)

    # exports two versions of the drawing scene
    inkscape resources-src/card-batanimo.svg -i layer${layerId} -j -C --export-png=build/card${label}.scene.forswift.png 
    inkscape resources-src/card-batanimo.svg -i layer${layerId} -j -C --export-png=build/card${label}.scene.forhtml.png --export-area=11:20:228:358

    # adds measurement layer on top for html version
    convert -background none -page +0+0 build/card${label}.scene.forhtml.png -page +0+0 build/measure.forhtml.png -layers merge +repage build/card-batanimo-${label}.png

    # adds measurement layer on top for swift version
    convert -background none -page +0+0 build/card${label}.scene.forswift.png -page +0+0 build/measure.forswift.png -layers merge +repage build/card-batanimo-${label}.forswift.png

    # adds border and shadow to swift version
    convert -background none -page +0+0 build/shadow.png -page +0+0 build/border.png -page +0+0 build/card-batanimo-${label}.forswift.png -layers merge +repage build/card-batanimo-${label}-bo-sh.png
done

# skunk card
for layerId in {37..37}; do
    label=$(xmllint --xpath "string(/*[local-name() = 'svg']/*[local-name() = 'g'][@*[local-name() = 'id'] = 'layer${layerId}']/@*[local-name() = 'label'])"  resources-src/card-batanimo.svg)

    # exports two versions of the drawing scene
    inkscape resources-src/card-batanimo.svg -i layer${layerId} -j -C --export-png=build/card-batanimo-${label}.forswift.png
    inkscape resources-src/card-batanimo.svg -i layer${layerId} -j -C --export-png=build/card-batanimo-${label}.png --export-area=11:20:228:358

    # adds border and shadow to swift version
    convert -background none -page +0+0 build/shadow.png -page +0+0 build/border.png -page +0+0 build/card-batanimo-${label}.forswift.png -layers merge +repage build/card-batanimo-${label}-bo-sh.png
done